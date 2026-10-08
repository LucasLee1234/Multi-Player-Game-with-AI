export type Role = 'A' | 'B';
export type ErrorCode = 'INVALID_INPUT' | 'NOT_AUTHORIZED' | 'STALE_CONTEXT' | 'ROOM_UNAVAILABLE'
  | 'ROOM_FULL' | 'ROOM_CLOSED' | 'PAUSED' | 'RATE_LIMITED' | 'SERVER_BUSY'
  | 'CONTROLLER_ACTIVE' | 'CONTROLLER_REPLACED' | 'OUT_OF_ORDER' | 'REQUEST_TOO_OLD' | 'REQUEST_CONFLICT';
export type GameError = 'STALE_PLAN' | 'STALE_POSITION' | 'STALE_MISSION' | 'SIGNAL_UNAVAILABLE' | 'NOT_PLANNING';
export type Knowledge = { safety: 'Safe' | 'Danger'; source: 'start/exit' | 'signal' | 'visit' | 'hazard attempt' | 'deduction' } | null;
export interface MissionView {
  id: string; ruleVersion: 'J1-C1' | 'SF-T1-v2' | 'SF-T1-v3' | 'SF-M2-v1' | 'SF-M3-v1'; title: string; turn: number; turnsResolved: number; strikes: number;
  foundry?: { width: number; height: number; walls: number[]; movement: 'independent' | 'confirmed';
    stage: number; hint: string; nextTitle: string | null; choices: Record<Role, 'retry' | 'next' | null>;
    crate: { cell: number; target: number } | null;
    gates: { cell: number; relay: number; kind: 'latching' | 'pressure'; powered: boolean; latched: boolean; open: boolean }[] };
  positions: Record<Role, number>; exits: Record<Role, number>; proposals: Record<Role, number>;
  planningRevision: number; ready: Record<Role, boolean>;
  signals: Record<Role, { cell: number; safety: 'Safe' | 'Danger' } | null>;
  ownKnownCells: Knowledge[]; partnerHazards: number[];
  result: 'success' | 'strikes' | 'turns' | null; explanations: string[];
  retryAgreements: Record<Role, boolean>;
}
export interface LobbyView {
  protocolVersion: 1; releaseId: string; bootId: string;
  room: { id: string; code: string; phase: 'waiting' | 'planning' | 'terminal' | 'paused'; roomVersion: number;
    lobbyRevision: number; owner: Role; players: { role: Role; connected: boolean }[]; startAgreements: Record<Role, boolean> };
  self: { role: Role; controllerEpoch: number; nextCommandSequence: number };
  timers: { recoveryRemainingMs: number | null; lifetimeRemainingMs: number };
  gameplayImplemented: boolean; mission: MissionView | null;
}
export interface SessionContext {
  bootId: string; contextVersion: number; view: LobbyView | null;
  ended: { code?: string; reason: string; outcome?: { result: NonNullable<MissionView['result']>; turnsResolved: number; strikes: number } } | null;
}
export interface Admission { requestId: string; expectedContextVersion: number; code?: string }
export interface LeaveCommand {
  type: 'command'; requestId: string; sequence: number; roomId: string; controllerEpoch: number;
  action: 'leave';
}
interface Envelope { type: 'command'; requestId: string; sequence: number; roomId: string; controllerEpoch: number }
export type Command = LeaveCommand
  | (Envelope & { action: 'crateMove'; missionId: string; from: number; crateFrom: number; destination: number; kind: 'move' | 'pull' })
  | (Envelope & { action: 'move'; missionId: string; from: number; destination: number })
  | (Envelope & { action: 'ping'; missionId: string; cell: number })
  | (Envelope & { action: 'startAgreement'; lobbyRevision: number })
  | (Envelope & { action: 'propose'; missionId: string; turn: number; planningRevision: number; destination: number })
  | (Envelope & { action: 'signal'; missionId: string; turn: number; planningRevision: number; cell: number })
  | (Envelope & { action: 'ready'; missionId: string; turn: number; planningRevision: number })
  | (Envelope & { action: 'retryAgreement'; missionId: string })
  | (Envelope & { action: 'nextAgreement'; missionId: string });
export type ServerMessage = { type: 'snapshot'; context: SessionContext }
  | { type: 'ack'; requestId: string; sequence: number; ok: boolean; error?: ErrorCode | GameError }
  | { type: 'error'; error: ErrorCode | GameError };
