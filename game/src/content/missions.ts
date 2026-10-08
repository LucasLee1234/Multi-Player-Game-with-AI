// Server-only authored content. Never expose through the static asset allowlist.
export interface FactoryDefinition {
  width: number; height: number; walls: readonly number[];
  starts: { A: number; B: number }; exits: { A: number; B: number };
  gates: readonly { cell: number; relay: number; kind: 'latching' | 'pressure' }[];
  hint: string;
}
export interface MissionDefinition {
  title: string; mode?: 'foundry'; independent?: boolean; hazards: { A: readonly number[]; B: readonly number[] };
  factory?: FactoryDefinition; stage?: number; nextMission?: MissionDefinition;
}
export const differentDangers: MissionDefinition = { title: 'Different Dangers', hazards: { A: [1, 7], B: [0, 7] } };
export const firstConnection: MissionDefinition = { title: 'First Connection', mode: 'foundry', hazards: { A: [], B: [] } };
export const firstConnectionFree: MissionDefinition = { ...firstConnection, independent: true };
export const teachingFactory: FactoryDefinition = {
  width: 4, height: 3, walls: [4, 5, 6, 7], starts: { A: 0, B: 8 }, exits: { A: 3, B: 11 },
  gates: [{ cell: 1, relay: 8, kind: 'latching' }, { cell: 9, relay: 2, kind: 'latching' }],
  hint: 'B is powering Gate 1 from Relay 8. Help A through, then A can power Gate 9.'
};
export const tradePlaces: MissionDefinition = {
  title: 'Trade Places', mode: 'foundry', independent: true, stage: 2, hazards: { A: [], B: [] },
  factory: { width: 5, height: 3, walls: [5, 7, 9], starts: { A: 0, B: 14 }, exits: { A: 4, B: 10 },
    gates: [{ cell: 2, relay: 6, kind: 'latching' }, { cell: 11, relay: 8, kind: 'pressure' }],
    hint: 'Share the passages. Hold Relay 8 for Gate 11, or use Relay 6 to latch Gate 2. Make room for your partner.' }
};
export const foundryAdventure: MissionDefinition = { ...firstConnectionFree, stage: 1, nextMission: tradePlaces };
