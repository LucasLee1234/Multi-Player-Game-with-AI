import type { GameError, Knowledge, MissionView, Role } from '../contracts/lobby.js';
import type { MissionDefinition } from '../content/missions.js';
export class RuleFault extends Error { constructor(public code: GameError | 'INVALID_INPUT') { super(code); } }
export interface Mission {
  id: string; definition: MissionDefinition; turn: number; turnsResolved: number; strikes: number;
  positions: Record<Role, number>; proposals: Record<Role, number>; planningRevision: number;
  ready: Record<Role, boolean>; signals: MissionView['signals']; knowledge: Record<Role, Knowledge[]>;
  result: MissionView['result']; explanations: string[]; retryAgreements: Record<Role, boolean>;
  latchedGates: number[];
}
const roles = ['A', 'B'] as const;
const exits = { A: 5, B: 3 };
const foundryFloor = [0, 1, 2, 3, 8, 9, 10, 11];
const foundryGates = [{ cell: 1, relay: 8 }, { cell: 9, relay: 2 }];
const isFoundry = (m: Mission) => m.definition.mode === 'foundry';
export const partner = (role: Role): Role => role === 'A' ? 'B' : 'A';
export function newMission(id: string, definition: MissionDefinition): Mission {
  if (definition.mode === 'foundry') return { id, definition: structuredClone(definition), turn: 1, turnsResolved: 0, strikes: 0,
    positions: { A: 0, B: 8 }, proposals: { A: 0, B: 8 }, planningRevision: 0, ready: { A: false, B: false },
    signals: { A: null, B: null }, knowledge: { A: [], B: [] }, latchedGates: [], result: null,
    explanations: ['B is powering Gate 1 from Relay 8. Help A through, then A can power Gate 9.'], retryAgreements: { A: false, B: false } };
  for (const role of roles) {
    const hazards = definition.hazards[role];
    if (hazards.length !== 2 || new Set(hazards).size !== 2 || hazards.some(c => !Number.isInteger(c) || c < 0 || c > 8 || c === 3 || c === 5)) throw new Error('Invalid authored mission');
  }
  const known = (): Knowledge[] => Array.from({ length: 9 }, (_, c) => c === 3 || c === 5 ? { safety: 'Safe', source: 'start/exit' } : null);
  return { id, definition: structuredClone(definition), turn: 1, turnsResolved: 0, strikes: 0,
    positions: { A: 3, B: 5 }, proposals: { A: 3, B: 5 }, planningRevision: 0,
    ready: { A: false, B: false }, signals: { A: null, B: null }, knowledge: { A: known(), B: known() },
    result: null, explanations: [], latchedGates: [], retryAgreements: { A: false, B: false } };
}
function learn(m: Mission, role: Role, cell: number, safety: 'Safe' | 'Danger', source: NonNullable<Knowledge>['source']) {
  if (!m.knowledge[role][cell]) m.knowledge[role][cell] = { safety, source };
  if (m.knowledge[role].filter(k => k?.safety === 'Danger').length === 2) {
    m.knowledge[role] = m.knowledge[role].map(k => k ?? { safety: 'Safe', source: 'deduction' });
  }
}
function revision(m: Mission) { m.planningRevision++; m.ready = { A: false, B: false }; }
export function propose(m: Mission, role: Role, destination: number): Mission {
  if (m.result) throw new RuleFault('NOT_PLANNING');
  const current = m.positions[role];
  const width = isFoundry(m) ? 4 : 3;
  const distance = Math.abs(Math.floor(current / width) - Math.floor(destination / width)) + Math.abs(current % width - destination % width);
  if (!Number.isInteger(destination) || destination < 0 || destination > (isFoundry(m) ? 11 : 8) || distance > 1
    || (isFoundry(m) && !foundryFloor.includes(destination))) throw new RuleFault('INVALID_INPUT');
  if (m.proposals[role] === destination) return m;
  const next = structuredClone(m); next.proposals[role] = destination; revision(next); return next;
}
export function signal(m: Mission, role: Role, cell: number): Mission {
  if (m.result) throw new RuleFault('NOT_PLANNING');
  if (isFoundry(m)) {
    if (!Number.isInteger(cell) || !foundryFloor.includes(cell)) throw new RuleFault('INVALID_INPUT');
    if (!m.definition.independent && m.signals[role]) throw new RuleFault('SIGNAL_UNAVAILABLE');
    const next = structuredClone(m);
    // Foundry reuses the bounded signal command as a public tile ping, not a private safety disclosure.
    next.signals[role] = { cell, safety: 'Safe' }; revision(next); return next;
  }
  if (!Number.isInteger(cell) || cell < 0 || cell > 8) throw new RuleFault('INVALID_INPUT');
  if (m.signals[role]) throw new RuleFault('SIGNAL_UNAVAILABLE');
  const next = structuredClone(m), receiver = partner(role);
  const safety = m.definition.hazards[receiver].includes(cell) ? 'Danger' : 'Safe';
  next.signals[role] = { cell, safety }; learn(next, receiver, cell, safety, 'signal'); revision(next); return next;
}
export function ready(m: Mission, role: Role): Mission {
  if (m.definition.independent) throw new RuleFault('INVALID_INPUT');
  if (m.result) throw new RuleFault('NOT_PLANNING');
  if (m.ready[role]) return m;
  const next = structuredClone(m); next.ready[role] = true;
  return next.ready.A && next.ready.B ? resolve(next) : next;
}
/** One authorized seat moves immediately; the other robot remains in place. */
export function moveFoundry(m: Mission, role: Role, destination: number): Mission {
  if (!isFoundry(m) || !m.definition.independent) throw new RuleFault('INVALID_INPUT');
  const planned = propose(m, role, destination); // Validates geometry and terminal state.
  if (destination === m.positions[role]) return m;
  const intent = structuredClone(planned);
  intent.proposals = { ...m.positions, [role]: destination };
  const next = resolveFoundry(intent);
  next.signals = structuredClone(m.signals);
  // Display successful individual steps, not idle time or blocked requests.
  if (next.positions[role] === m.positions[role]) { next.turnsResolved = m.turnsResolved; next.turn = m.turn; }
  return next;
}
/** Pure transition: hazards, then overlap/swap, then failure/joint exit/turn limit. */
export function resolve(m: Mission): Mission {
  if (m.result) throw new RuleFault('NOT_PLANNING');
  if (isFoundry(m)) return resolveFoundry(m);
  const next = structuredClone(m), tentative = { ...m.proposals };
  next.explanations = [];
  for (const role of roles) {
    if (m.definition.hazards[role].includes(m.proposals[role])) {
      next.strikes++; tentative[role] = m.positions[role];
      learn(next, role, m.proposals[role], 'Danger', 'hazard attempt');
      next.explanations.push(`${role}: hazard at ${m.proposals[role]} stopped movement and added one strike.`);
    }
  }
  const overlap = tentative.A === tentative.B;
  const swap = tentative.A === m.positions.B && tentative.B === m.positions.A;
  if (overlap || swap) {
    next.positions = { ...m.positions };
    next.explanations.push(overlap ? 'Both robots stayed: their resolved destinations overlapped.' : 'Both robots stayed: direct swaps are blocked.');
  } else next.positions = tentative;
  for (const role of roles) {
    learn(next, role, next.positions[role], 'Safe', 'visit');
    if (next.positions[role] !== m.positions[role]) next.explanations.push(`${role}: moved to ${next.positions[role]}.`);
  }
  if (!next.explanations.length) next.explanations.push('Both robots waited. One turn was used.');
  next.turnsResolved++;
  next.result = next.strikes >= 3 ? 'strikes' : next.positions.A === exits.A && next.positions.B === exits.B ? 'success' : m.turn >= 8 ? 'turns' : null;
  next.ready = { A: false, B: false };
  if (!next.result) { next.turn++; next.proposals = { ...next.positions }; next.signals = { A: null, B: null }; }
  revision(next); return next;
}
function resolveFoundry(m: Mission): Mission {
  const next = structuredClone(m), tentative = { ...m.proposals };
  next.explanations = [];
  for (const role of roles) {
    const gate = foundryGates.find(g => g.cell === m.proposals[role]);
    if (gate && m.positions[role] !== gate.cell && !m.latchedGates.includes(gate.cell)
      && !roles.some(r => m.positions[r] === gate.relay)) {
      tentative[role] = m.positions[role];
      const nowPowered = roles.some(r => m.proposals[r] === gate.relay);
      next.explanations.push(m.definition.independent ? `${role}: Gate ${gate.cell} is closed. Ask your partner to reach Relay ${gate.relay}.`
        : `${role}: Gate ${gate.cell} was not powered at turn start.${nowPowered ? ' Check the relay after this turn.' : ' Ask your partner to reach its relay.'}`);
    }
  }
  const overlap = tentative.A === tentative.B;
  const swap = tentative.A === m.positions.B && tentative.B === m.positions.A;
  next.positions = overlap || swap ? { ...m.positions } : tentative;
  if (overlap || swap) next.explanations.push(overlap ? 'Both robots stayed: destinations overlapped.' : 'Both robots stayed: direct swaps are blocked.');
  for (const role of roles) {
    const position = next.positions[role];
    if (position !== m.positions[role]) {
      next.explanations.push(`${role}: moved to ${position}.`);
      if (foundryGates.some(g => g.cell === position) && !next.latchedGates.includes(position)) {
        next.latchedGates.push(position); next.explanations.push(`Gate ${position} latched open. You can safely return through it.`);
      }
    }
  }
  for (const gate of foundryGates) if (!m.latchedGates.includes(gate.cell)
    && !roles.some(r => m.positions[r] === gate.relay) && roles.some(r => next.positions[r] === gate.relay)) {
    next.explanations.push(`Relay ${gate.relay} now powers Gate ${gate.cell}.${m.definition.independent ? ' Your partner can enter now.' : ' You may enter on the next turn.'}`);
  }
  if (!next.explanations.length) next.explanations.push('Both robots waited. Take your time to plan.');
  next.turnsResolved++;
  next.result = next.positions.A === 3 && next.positions.B === 11 ? 'success' : null;
  revision(next);
  if (!next.result) { next.turn++; next.proposals = { ...next.positions }; next.signals = { A: null, B: null }; }
  return next;
}
export function clearAgreement(m: Mission): Mission {
  const next = structuredClone(m); revision(next); next.retryAgreements = { A: false, B: false }; return next;
}
export function project(m: Mission, role: Role): MissionView {
  if (isFoundry(m)) return { id: m.id, ruleVersion: m.definition.independent ? 'SF-T1-v3' : 'SF-T1-v2', title: m.definition.title, turn: m.turn,
    turnsResolved: m.turnsResolved, strikes: 0, positions: { ...m.positions }, exits: { A: 3, B: 11 },
    proposals: { ...m.proposals }, planningRevision: m.planningRevision, ready: { ...m.ready },
    signals: structuredClone(m.signals), ownKnownCells: [], partnerHazards: [], result: m.result,
    explanations: [...m.explanations], retryAgreements: { ...m.retryAgreements },
    foundry: { width: 4, height: 3, walls: [4, 5, 6, 7], movement: m.definition.independent ? 'independent' : 'confirmed', gates: foundryGates.map(g => {
      const powered = roles.some(r => m.positions[r] === g.relay), latched = m.latchedGates.includes(g.cell);
      return { ...g, powered, latched, open: powered || latched };
    }) } };
  // Explicit allowlist: never serialize Mission/definition and delete fields afterward.
  return { id: m.id, ruleVersion: 'J1-C1', title: m.definition.title, turn: m.turn, turnsResolved: m.turnsResolved,
    strikes: m.strikes, positions: { ...m.positions }, exits: { ...exits }, proposals: { ...m.proposals },
    planningRevision: m.planningRevision, ready: { ...m.ready }, signals: structuredClone(m.signals),
    ownKnownCells: structuredClone(m.knowledge[role]), partnerHazards: [...m.definition.hazards[partner(role)]],
    result: m.result, explanations: [...m.explanations], retryAgreements: { ...m.retryAgreements } };
}
