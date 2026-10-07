import type { SessionContext, ServerMessage, Command, MissionView, Role } from '../contracts/lobby.js';
const el = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const messages: Record<string, string> = {
  ROOM_FULL: 'This room already has two players.', ROOM_UNAVAILABLE: 'Room not found or expired. Check the code.',
  PAUSED: 'This room is paused and its seats are reserved.', CONTROLLER_ACTIVE: 'Another tab controls your seat. Choose Use this tab to switch.',
  CONTROLLER_REPLACED: 'Another tab now controls your seat.', STALE_CONTEXT: 'Your session changed. Refresh its current state.',
  NOT_AUTHORIZED: 'Your session is unavailable. Retry connection.', RATE_LIMITED: 'Too many requests. Wait a moment before trying again.',
  SERVER_BUSY: 'The server is busy. Please try again shortly.', INVALID_INPUT: 'Check your input and try again.',
  ROOM_CLOSED: 'This room ended. Create a new room.',
  STALE_PLAN: 'Plan changed - check it and confirm again.', STALE_MISSION: 'The mission changed. Check the current board.',
  STALE_POSITION: 'Your robot moved already. Choose your next direction from its current position.',
  SIGNAL_UNAVAILABLE: 'You already sent a signal this turn.', NOT_PLANNING: 'This mission is not accepting moves.'
};
let context: SessionContext | undefined;
let socket: WebSocket | undefined;
let stopped = false;
let busy = false;
let reconnectTimer: number | undefined;
let pending: Command | undefined;
let pendingAcknowledged = false;
let commandFeedback: string | undefined;
let retryCommandTimer: number | undefined;
let receivedAt = performance.now();
const status = (text: string, error = false) => { el('status').textContent = text; el('status').classList.toggle('error', error); };
function endedText() {
  const ended = context?.ended, outcome = ended?.outcome;
  return (ended?.reason ?? 'Room ended.') + (outcome ? ` Previous mission: ${outcome.result}.` : '');
}
function render() {
  const view = context?.view;
  const connected = socket?.readyState === WebSocket.OPEN;
  el('entry').hidden = !!view; el('lobby').hidden = !view;
  el<HTMLButtonElement>('create').disabled = !context || busy;
  el<HTMLButtonElement>('join').disabled = !context || busy;
  el<HTMLButtonElement>('leave').disabled = busy || !connected || !!pending;
  el('takeover').hidden = !view || connected || !stopped;
  el('reconnect').hidden = !view || connected || stopped;
  if (view) {
    const foundry = view.releaseId === 'sys-03-sf-t1' || view.releaseId === 'sys-04-free-move';
    document.title = foundry ? 'Signal Foundry' : 'Signal Rescue';
    el('page-eyebrow').textContent = foundry ? 'Signal Foundry · A cooperative robot adventure' : 'Signal Rescue · Cooperative navigation';
    el('page-title').textContent = foundry ? 'You power my way. I power yours.' : 'Find a way out together.';
    el('page-subtitle').textContent = foundry ? 'Two robots. One escape. Open a route for your partner, then find your way out together.' : 'You see your partner’s dangers. They see yours. Find a safe route together.';
    el('page-notice').textContent = foundry ? 'Invite a friend to try First Connection, a short teaching room.' : 'Try Different Dangers, a cooperative navigation mission.';
    el('room-code').textContent = view.room.code;
    el('role').textContent = `You are Player ${view.self.role}. Setup owner: ${view.room.owner}.`;
    el('players').textContent = stopped ? 'Room status is not live in this tab.' : (['A', 'B'] as const).map(role => {
      const player = view.room.players.find(p => p.role === role);
      return `${role}: ${!player ? 'waiting for a player' : player.connected ? 'connected' : 'disconnected'}`;
    }).join(' · ');
    el('connection').textContent = connected ? 'Your live connection is active.' : 'Your live connection is unavailable.';
    if (stopped) el('timer').textContent = 'Use this tab to take control and refresh the room status.';
    else if (view.room.phase === 'paused') {
      const left = Math.max(0, (view.timers.recoveryRemainingMs ?? 0) - (performance.now() - receivedAt));
      el('timer').textContent = `Room paused. Reconnection window: ${Math.ceil(left / 1000)} seconds.`;
    } else el('timer').textContent = view.room.phase === 'waiting' ? view.releaseId === 'sys-04-free-move' ? 'The mission begins when both players are connected.' : 'Both players must confirm before the mission starts.' : 'Move at your own pace; inactive rooms still expire.';
  }
  renderMission();
}
function apply(next: SessionContext) {
  if (context?.bootId === next.bootId && context.contextVersion > next.contextVersion) return;
  if (context?.bootId === next.bootId && context.view && next.view
      && context.view.room.id === next.view.room.id && context.view.room.roomVersion > next.view.room.roomVersion) return;
  context = next; receivedAt = performance.now(); render();
}
async function api(path: string, payload?: unknown): Promise<SessionContext> {
  const response = await fetch(path, { method: payload === undefined ? 'GET' : 'POST', credentials: 'same-origin',
    headers: payload === undefined ? {} : { 'Content-Type': 'application/json' },
    body: payload === undefined ? undefined : JSON.stringify(payload) });
  const data = await response.json();
  if (!data.ok) throw new Error(data.error);
  return data.context;
}
function closeSocket() {
  window.clearTimeout(reconnectTimer);
  const old = socket; socket = undefined; old?.close();
}
async function refresh() { apply(await api('/api/session')); }
function connect() {
  if (!context?.view || stopped || socket?.readyState === WebSocket.OPEN || socket?.readyState === WebSocket.CONNECTING) return;
  window.clearTimeout(reconnectTimer);
  const ws = new WebSocket(`${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/ws`); socket = ws;
  ws.onmessage = event => {
    if (socket !== ws) return;
    const message: ServerMessage = JSON.parse(event.data);
    if (message.type === 'snapshot') {
      const previous = context?.view?.mission, next = message.context.view?.mission;
      if (previous && next && (next.id !== previous.id || next.turn > previous.turn || (!!next.result && !previous.result))) commandFeedback = undefined;
      if (previous && next?.id === previous.id && next.foundry?.movement !== 'independent' && next.turn === previous.turn
          && !next.result && next.planningRevision > previous.planningRevision && (previous.ready.A || previous.ready.B)) commandFeedback = 'Plan changed - check it and confirm again.';
      apply(message.context);
      if (pendingAcknowledged) { clearPending(); render(); }
      if (!context?.view) { clearPending(); status(endedText()); closeSocket(); }
      else {
        status(context.view.room.phase === 'paused' ? 'Room paused - waiting for reconnection.' : commandFeedback ?? 'Room connected.', !!commandFeedback);
        // Reconnect rebinds the controller epoch only. Sequence, request ID and intent stay unchanged.
        if (pending && pending.controllerEpoch !== context.view.self.controllerEpoch) {
          pending = { ...pending, controllerEpoch: context.view.self.controllerEpoch }; transmit();
        }
      }
    } else if (message.type === 'error') {
      clearPending();
      status(messages[message.error] ?? message.error, true);
      if (message.error === 'CONTROLLER_REPLACED') { stopped = true; clearPending(); render(); }
      else render();
    } else if (message.type === 'ack' && pending?.requestId === message.requestId) {
      pendingAcknowledged = true; window.clearTimeout(retryCommandTimer);
      if (!message.ok) { commandFeedback = messages[message.error!] ?? message.error!; status(commandFeedback, true); }
    }
  };
  ws.onopen = () => { if (socket === ws) render(); };
  ws.onclose = async event => {
    if (socket !== ws) return;
    socket = undefined;
    if (event.code === 4002) stopped = true;
    try {
      await refresh();
      if (!context?.view) { clearPending(); status(endedText()); return; }
      const active = context.view.room.players.find(p => p.role === context?.view?.self.role)?.connected;
      if (active) { stopped = true; status(messages.CONTROLLER_ACTIVE!, true); }
      else if (!stopped) { status('Connection lost. Reconnecting…'); reconnectTimer = window.setTimeout(connect, 1500); }
    } catch { status('Server unavailable. Retry connection to check your session.', true); el('retry').hidden = false; }
    render();
  };
  ws.onerror = () => { /* onclose checks authoritative session state and displays recovery. */ };
}
async function bootstrap() {
  busy = true; el('retry').hidden = true; status('Connecting to the server…'); render();
  try {
    apply(await api('/api/session', {})); stopped = false;
    if (!context?.view) clearPending();
    status(context?.ended ? endedText() : 'Create a room or join your friend.'); connect();
  } catch (error) { status(messages[(error as Error).message] ?? 'Server unavailable. Retry connection.', true); el('retry').hidden = false; }
  finally { busy = false; render(); }
}
async function admit(path: string, code?: string) {
  if (busy || !context) return;
  busy = true; render();
  const payload = { requestId: crypto.randomUUID(), expectedContextVersion: context.contextVersion, ...(code ? { code } : {}) };
  try {
    let next: SessionContext;
    try { next = await api(path, payload); }
    catch (error) {
      // Retry only uncertain transport failure with exactly the same admission request.
      if (error instanceof TypeError) next = await api(path, payload);
      else throw error;
    }
    if (path.includes('takeover')) closeSocket();
    stopped = false; apply(next); connect();
  } catch (error) {
    status(messages[(error as Error).message] ?? 'Request failed. Check your connection.', true);
    try { await refresh(); } catch { /* Preserve understandable request failure. */ }
  } finally { busy = false; render(); }
}
type Action = Command extends infer C ? C extends Command ? Omit<C, 'type' | 'requestId' | 'sequence' | 'roomId' | 'controllerEpoch'> : never : never;
function clearPending() { pending = undefined; pendingAcknowledged = false; window.clearTimeout(retryCommandTimer); }
function transmit() {
  window.clearTimeout(retryCommandTimer);
  if (!pending || socket?.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify(pending));
  retryCommandTimer = window.setTimeout(transmit, 2000);
}
function sendAction(action: Action) {
  const view = context?.view;
  if (!view || pending || socket?.readyState !== WebSocket.OPEN || stopped) return;
  commandFeedback = undefined; pendingAcknowledged = false;
  pending = { type: 'command', requestId: crypto.randomUUID(), sequence: view.self.nextCommandSequence,
    roomId: view.room.id, controllerEpoch: view.self.controllerEpoch, ...action } as Command;
  transmit(); render();
}
function gameAction(action: 'ready' | 'propose' | 'signal', cell?: number) {
  const m = context?.view?.mission;
  if (!m) return;
  if (m.foundry?.movement === 'independent') {
    if (action === 'propose') sendAction({ action: 'move', missionId: m.id, from: m.positions[context!.view!.self.role], destination: cell! });
    else if (action === 'signal') sendAction({ action: 'ping', missionId: m.id, cell: cell! });
    return;
  }
  const base = { missionId: m.id, turn: m.turn, planningRevision: m.planningRevision };
  if (action === 'propose') sendAction({ ...base, action, destination: cell! });
  else if (action === 'signal') sendAction({ ...base, action, cell: cell! });
  else sendAction({ ...base, action });
}
const ownTiles: HTMLElement[] = [], partnerTiles: HTMLButtonElement[] = [];
for (let cell = 0; cell < 9; cell++) {
  const own = document.createElement('div'); own.className = 'cell'; ownTiles.push(own); el('own-board').append(own);
  const tile = document.createElement('button'); tile.type = 'button'; tile.className = 'cell';
  tile.onclick = () => gameAction('signal', cell); partnerTiles.push(tile); el('partner-board').append(tile);
}
const moves = ['up', 'left', 'wait', 'right', 'down'] as const;
const foundryTiles: HTMLButtonElement[] = [];
let inspectedCell: number | undefined;
for (let cell = 0; cell < 12; cell++) {
  const tile = document.createElement('button'); tile.type = 'button'; tile.className = 'factory-tile';
  tile.onclick = () => { inspectedCell = cell; gameAction('signal', cell); };
  tile.onfocus = tile.onpointerenter = () => {
    inspectedCell = cell;
    const view = context?.view;
    if (view?.mission?.foundry) showFoundryLink(view.mission, cell);
  };
  foundryTiles.push(tile); el('foundry-board').append(tile);
}
function showFoundryLink(m: MissionView, cell: number) {
  const link = m.foundry!.gates.find(g => g.cell === cell || g.relay === cell);
  el('foundry-link').textContent = link ? `Relay ${link.relay} → Gate ${link.cell} · ${link.latched ? 'Latched open' : link.powered ? 'Powered' : 'Closed'}`
    : 'Relay 8 → Gate 1 · Relay 2 → Gate 9';
  for (let index = 0; index < foundryTiles.length; index++) foundryTiles[index]!.classList.toggle('linked', !!link && (index === link.cell || index === link.relay));
}
function destination(direction: typeof moves[number], from: number, m: MissionView): number | null {
  const width = m.foundry?.width ?? 3, height = m.foundry?.height ?? 3;
  let target = from;
  if (direction === 'up') target = from >= width ? from - width : -1;
  if (direction === 'down') target = from < width * (height - 1) ? from + width : -1;
  if (direction === 'left') target = from % width ? from - 1 : -1;
  if (direction === 'right') target = from % width < width - 1 ? from + 1 : -1;
  return target < 0 || m.foundry?.walls.includes(target) ? null : target;
}
function renderFoundry(m: MissionView, role: Role, planning: boolean) {
  const board = m.foundry!;
  el('foundry-self').textContent = `You: Robot ${role}`;
  el('foundry-hint').textContent = m.result ? 'Both robots reached their exits. Restore the room with Practice again.' : role === 'B' && m.positions.B === 8 && !board.gates[0]!.latched
    ? 'You are powering Gate 1. Let A through; A can then power your gate.'
    : role === 'A' && m.positions.A === 0 ? 'B powers Gate 1 for you. Cross it and reach Relay 2 to help B.'
    : 'Help your partner through, then bring both robots to their exits.';
  const link = board.gates.find(g => g.cell === inspectedCell || g.relay === inspectedCell);
  el('foundry-link').textContent = link ? `Relay ${link.relay} → Gate ${link.cell} · ${link.latched ? 'Latched open' : link.powered ? 'Powered' : 'Closed'}`
    : 'Relay 8 → Gate 1 · Relay 2 → Gate 9';
  for (let cell = 0; cell < 12; cell++) {
    const tile = foundryTiles[cell]!, wall = board.walls.includes(cell);
    const gate = board.gates.find(g => g.cell === cell), relay = board.gates.find(g => g.relay === cell);
    const exit = (['A', 'B'] as const).find(r => m.exits[r] === cell);
    const robot = (['A', 'B'] as const).find(r => m.positions[r] === cell);
    const label = wall ? 'Wall' : gate ? `Gate ${cell}` : relay ? `Relay ${cell}` : exit ? `Exit ${exit}` : 'Floor';
    const state = gate ? gate.latched ? 'Latched open' : gate.powered ? 'Powered' : 'Closed' : relay ? `→ Gate ${relay.cell}` : '';
    tile.className = `factory-tile${wall ? ' wall' : gate ? gate.open ? ' gate-open' : ' gate-closed' : relay ? ' relay' : exit ? ' exit' : ''}${link && (cell === link.cell || cell === link.relay) ? ' linked' : ''}`;
    tile.disabled = wall || !planning || (board.movement !== 'independent' && !!m.signals[role]);
    tile.setAttribute('aria-label', `${cell}: ${label}${state ? `, ${state}` : ''}${robot ? `, Robot ${robot}${robot === role ? ', you' : ', partner'}` : ''}. ${wall ? 'Impassable.' : 'Point out this tile.'}`);
    // Stable tile nodes preserve focus; only their visual contents change.
    tile.replaceChildren();
    const number = document.createElement('span'); number.className = 'tile-number'; number.textContent = String(cell); tile.append(number);
    const name = document.createElement('span'); name.className = 'tile-name'; name.textContent = label; tile.append(name);
    const description = document.createElement('span'); description.className = 'tile-state'; description.textContent = state; tile.append(description);
    if (robot) {
      const bot = document.createElement('span'); bot.className = `robot robot-${robot}`; bot.textContent = robot;
      bot.setAttribute('aria-hidden', 'true'); tile.append(bot);
    }
    tile.classList.toggle('pinged', Object.values(m.signals).some(p => p?.cell === cell));
  }
}
function renderMission() {
  const view = context?.view, m = view?.mission;
  const active = !!view && socket?.readyState === WebSocket.OPEN && !stopped && !pending;
  const start = el<HTMLButtonElement>('start'); start.hidden = !!m;
  const independent = view?.releaseId === 'sys-04-free-move';
  start.hidden = !!m || independent;
  start.disabled = !active || view?.room.phase !== 'waiting' || view.room.players.length !== 2 || !view.room.players.every(p => p.connected) || !!view.room.startAgreements[view.self.role];
  start.textContent = view?.room.startAgreements[view.self.role] ? 'Waiting for partner to start' : 'Ready to start';
  el('start-agreements').hidden = !!m || independent;
  el('start-agreements').textContent = view ? `A: ${view.room.startAgreements.A ? 'ready' : 'not ready'} · B: ${view.room.startAgreements.B ? 'ready' : 'not ready'}` : '';
  el('game').hidden = !m;
  if (!m || !view) return;
  const role = view.self.role, partner = role === 'A' ? 'B' : 'A';
  const planning = active && view.room.phase === 'planning';
  const foundry = !!m.foundry;
  el('j1-instructions').hidden = foundry; el('j1-maps').hidden = foundry; el('j1-legend').hidden = foundry;
  el('foundry-instructions').hidden = !foundry; el('foundry-map').hidden = !foundry;
  el('objective').textContent = foundry ? 'Power your partner’s gate. Bring A to Exit 3 and B to Exit 11 together.' : 'Bring both robots to their own exits together. You can leave your exit to make room.';
  el('mission-title').textContent = m.title;
  el('progress').textContent = independent ? `Team moves: ${m.turnsResolved} · Move independently · No move limit` : foundry ? `Turn ${m.turn} · ${m.turnsResolved} turns completed · No turn limit` : `Turn ${m.turn} / 8 · Resolved ${m.turnsResolved} · Strikes ${m.strikes} / 3`;
  el('move-heading').textContent = independent ? 'Move your robot' : 'Propose your move';
  el('move-help').hidden = !independent;
  for (const id of ['shared-plan', 'plan-warning', 'readiness']) el(id).hidden = independent;
  if (foundry) renderFoundry(m, role, planning);
  el('own-label').textContent = `Your route · ${role}`;
  el('partner-label').textContent = `Partner's dangers · ${partner} only`;
  for (let cell = 0; !foundry && cell < 9; cell++) {
    const known = m.ownKnownCells[cell]; const danger = m.partnerHazards.includes(cell);
    const markers = (['A', 'B'] as const).filter(r => m.positions[r] === cell).map(r => `Robot ${r}`)
      .concat((['A', 'B'] as const).filter(r => m.exits[r] === cell).map(r => `Exit ${r}`)).join(' · ');
    const own = ownTiles[cell]!, tile = partnerTiles[cell]!;
    own.textContent = `${cell}: ${known ? known.safety === 'Danger' ? '! Danger' : known.source === 'deduction' ? 'Safe (deduced)' : 'Safe' : '? Unknown'}${markers ? ` · ${markers}` : ''}`;
    own.className = `cell ${known?.safety === 'Danger' ? 'danger' : !known ? 'unknown' : ''}`;
    tile.textContent = `${cell}: ${danger ? '! Danger' : 'Safe'} for ${partner}${markers ? ` · ${markers}` : ''}`;
    tile.className = `cell ${danger ? 'danger' : ''}`;
    tile.setAttribute('aria-label', `Signal cell ${cell}: ${danger ? 'Danger' : 'Safe'} for ${partner}`);
    tile.disabled = !planning || !!m.signals[role];
  }
  el('signals').textContent = (['A', 'B'] as const).map(r => {
    const clue = m.signals[r]; return foundry ? `${r}: ${clue ? `points to tile ${clue.cell}` : 'no ping'}` : `${r} signal: ${clue ? `${clue.cell} ${clue.safety}` : 'not sent'}`;
  }).join(' · ') + (independent ? '. Select a tile to update your location ping.' : foundry ? '. One tile ping per player per turn.' : '. Learned cells persist.');
  for (const direction of moves) {
    const target = destination(direction, m.positions[role], m);
    const button = el<HTMLButtonElement>(`move-${direction}`);
    button.hidden = independent && direction === 'wait';
    const known = target === null ? undefined : m.ownKnownCells[target];
    button.disabled = !planning || target === null;
    const gate = m.foundry?.gates.find(g => g.cell === target);
    button.textContent = `${direction === 'wait' ? 'Wait' : direction[0]!.toUpperCase() + direction.slice(1)}${target === null ? ' (blocked)' : ` ${target}${foundry ? gate && !gate.open ? ' · Closed gate' : '' : !known ? ' · Unverified' : known.safety === 'Danger' ? ' · Danger' : ''}`}`;
    if (independent) button.removeAttribute('aria-pressed');
    else button.setAttribute('aria-pressed', String(target !== null && m.proposals[role] === target));
  }
  el('shared-plan').textContent = `Shared plan: A → ${m.proposals.A} · B → ${m.proposals.B}`;
  el('plan-warning').textContent = m.proposals.A === m.proposals.B ? 'Both propose the same cell. Check the plan.'
    : m.proposals.A === m.positions.B && m.proposals.B === m.positions.A ? 'Direct swaps are blocked. Find space to pass.' : '';
  el('readiness').textContent = `A: ${m.ready.A ? 'ready' : 'not ready'} · B: ${m.ready.B ? 'ready' : 'not ready'}`;
  el<HTMLButtonElement>('ready').disabled = !planning || m.ready[role];
  el('ready').hidden = !!m.result || independent;
  el('resolution').textContent = m.explanations.join(' ');
  el('result').hidden = !m.result;
  el('result-title').textContent = m.result === 'success' ? foundry ? 'Factory restored. You made it together!' : 'Rescued together' : m.result === 'strikes' ? 'Mission ended: three strikes' : 'Mission ended: turn limit';
  el('result-stats').textContent = independent ? `Completed in ${m.turnsResolved} team moves. Both robots are at their exits.` : foundry ? `Completed in ${m.turnsResolved} turns. Both robots are at their exits.` : `Turns used: ${m.turnsResolved} / 8 · Strikes: ${m.strikes} / 3`;
  el<HTMLButtonElement>('practice').disabled = !active || view.room.phase !== 'terminal' || m.retryAgreements[role];
  el('retry-agreements').textContent = `Practice again: A ${m.retryAgreements.A ? 'agreed' : 'not yet'} · B ${m.retryAgreements.B ? 'agreed' : 'not yet'}`;
}
for (const direction of moves) el(`move-${direction}`).onclick = () => {
  const m = context?.view?.mission; if (!m) return;
  const target = destination(direction, m.positions[context!.view!.self.role], m);
  if (target !== null) gameAction('propose', target);
};
let lastKeyboardMove = -Infinity;
window.addEventListener('keydown', event => {
  const m = context?.view?.mission;
  if (m?.foundry?.movement !== 'independent' || event.altKey || event.ctrlKey || event.metaKey
    || (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable="true"]'))) return;
  const keys: Record<string, typeof moves[number]> = { arrowup: 'up', w: 'up', arrowdown: 'down', s: 'down', arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right' };
  const direction = keys[event.key.toLowerCase()];
  if (!direction) return;
  event.preventDefault();
  if (m.result || context?.view?.room.phase !== 'planning' || pending || performance.now() - lastKeyboardMove < 120) return;
  const target = destination(direction, m.positions[context!.view!.self.role], m);
  if (target !== null) { lastKeyboardMove = performance.now(); gameAction('propose', target); }
});
el('start').onclick = () => { if (context?.view) sendAction({ action: 'startAgreement', lobbyRevision: context.view.room.lobbyRevision }); };
el('ready').onclick = () => gameAction('ready');
el('practice').onclick = () => { if (context?.view?.mission) sendAction({ action: 'retryAgreement', missionId: context.view.mission.id }); };
el('create').onclick = () => { void admit('/api/rooms'); };
el<HTMLFormElement>('join-form').onsubmit = event => { event.preventDefault(); void admit('/api/rooms/join', el<HTMLInputElement>('code').value.trim().toUpperCase()); };
el('takeover').onclick = () => { void admit('/api/controller/takeover'); };
el('reconnect').onclick = () => { stopped = false; connect(); };
el('retry').onclick = () => { closeSocket(); void bootstrap(); };
el('leave').onclick = () => sendAction({ action: 'leave' });
el('copy').onclick = async () => {
  try { await navigator.clipboard.writeText(context?.view?.room.code ?? ''); status('Room code copied.'); }
  catch { status('Copy the room code shown above.'); }
};
window.setInterval(() => {
  const view = context?.view;
  if (view?.room.phase === 'paused' && !stopped) el('timer').textContent = `Room paused. Reconnection window: ${Math.ceil(Math.max(0, (view.timers.recoveryRemainingMs ?? 0) - (performance.now() - receivedAt)) / 1000)} seconds.`;
}, 1000);
void bootstrap();
