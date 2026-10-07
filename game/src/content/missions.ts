// Server-only authored content. Never expose through the static asset allowlist.
export interface MissionDefinition { title: string; hazards: { A: readonly number[]; B: readonly number[] } }
export const differentDangers: MissionDefinition = { title: 'Different Dangers', hazards: { A: [1, 7], B: [0, 7] } };
