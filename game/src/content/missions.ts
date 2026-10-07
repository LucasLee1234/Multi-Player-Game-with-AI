// Server-only authored content. Never expose through the static asset allowlist.
export interface MissionDefinition { title: string; mode?: 'foundry'; hazards: { A: readonly number[]; B: readonly number[] } }
export const differentDangers: MissionDefinition = { title: 'Different Dangers', hazards: { A: [1, 7], B: [0, 7] } };
export const firstConnection: MissionDefinition = { title: 'First Connection', mode: 'foundry', hazards: { A: [], B: [] } };
