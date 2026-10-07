export type Role = 'A' | 'B';
export type ErrorCode = 'INVALID_INPUT' | 'NOT_AUTHORIZED' | 'STALE_CONTEXT' | 'ROOM_UNAVAILABLE'
  | 'ROOM_FULL' | 'ROOM_CLOSED' | 'PAUSED' | 'RATE_LIMITED' | 'SERVER_BUSY'
  | 'CONTROLLER_ACTIVE' | 'CONTROLLER_REPLACED' | 'OUT_OF_ORDER' | 'REQUEST_TOO_OLD' | 'REQUEST_CONFLICT';
export interface LobbyView {
  protocolVersion: 1; releaseId: string; bootId: string;
  room: { id: string; code: string; phase: 'waiting' | 'paused'; roomVersion: number;
    lobbyRevision: number; owner: Role; players: { role: Role; connected: boolean }[] };
  self: { role: Role; controllerEpoch: number; nextCommandSequence: number };
  timers: { recoveryRemainingMs: number | null; lifetimeRemainingMs: number };
  gameplayImplemented: false;
}
export interface SessionContext {
  bootId: string; contextVersion: number; view: LobbyView | null;
  ended: { code?: string; reason: string } | null;
}
export interface Admission { requestId: string; expectedContextVersion: number; code?: string }
export interface LeaveCommand {
  type: 'command'; requestId: string; sequence: number; roomId: string; controllerEpoch: number;
  action: 'leave';
}
export type ServerMessage = { type: 'snapshot'; context: SessionContext }
  | { type: 'ack'; requestId: string; sequence: number; ok: boolean; error?: ErrorCode }
  | { type: 'error'; error: ErrorCode };
