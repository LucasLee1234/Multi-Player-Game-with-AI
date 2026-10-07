import { createHash, randomBytes, randomInt, randomUUID } from 'node:crypto';
import type { Admission, ErrorCode, LeaveCommand, LobbyView, Role, ServerMessage, SessionContext } from '../contracts/lobby.js';

export class Fault extends Error {
  constructor(public code: ErrorCode, public status = 400) { super(code); }
}
export interface Channel { send(message: ServerMessage): void; close(code: number, reason: string): void }
interface CachedAdmission { hash: string; error?: ErrorCode; status?: number }
interface Session {
  key: string; expires: number; version: number; roomId?: string; role?: Role;
  ended: SessionContext['ended']; admissions: Map<string, CachedAdmission>; attempts: number[];
}
interface Seat {
  session: Session; epoch: number; nextSequence: number; channel?: Channel;
  acknowledgements: Map<number, { requestId: string; hash: string; error?: ErrorCode }>;
}
interface Room {
  id: string; code: string; created: number; lastAction: number; version: number; lobbyRevision: number;
  owner: Role; phase: 'waiting' | 'paused'; pauseDeadline?: number; seats: Partial<Record<Role, Seat>>;
}
export interface Limits { rooms: number; sessions: number; recoveryMs: number; idleMs: number; lifetimeMs: number }
const defaults: Limits = { rooms: 20, sessions: 500, recoveryMs: 60_000, idleMs: 600_000, lifetimeMs: 7_200_000 };
const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const digest = (text: string) => createHash('sha256').update(text).digest('hex');
const other = (role: Role): Role => role === 'A' ? 'B' : 'A';
function fields(value: unknown, allowed: string[]): asserts value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)
      || Object.keys(value).some(key => !allowed.includes(key))) throw new Fault('INVALID_INPUT');
}
export function admission(value: unknown, join = false): Admission {
  fields(value, join ? ['requestId', 'expectedContextVersion', 'code'] : ['requestId', 'expectedContextVersion']);
  if (typeof value.requestId !== 'string' || !/^[a-zA-Z0-9_-]{8,80}$/.test(value.requestId)
      || !Number.isSafeInteger(value.expectedContextVersion) || (value.expectedContextVersion as number) < 0
      || (join && (typeof value.code !== 'string' || !/^[A-Z2-9]{6}$/.test(value.code)))) throw new Fault('INVALID_INPUT');
  return value as unknown as Admission;
}
function command(value: unknown): LeaveCommand {
  fields(value, ['type', 'requestId', 'sequence', 'roomId', 'controllerEpoch', 'action']);
  if (value.type !== 'command' || value.action !== 'leave' || typeof value.requestId !== 'string'
    || !/^[a-zA-Z0-9_-]{8,80}$/.test(value.requestId) || typeof value.roomId !== 'string'
    || value.roomId.length > 80 || !Number.isSafeInteger(value.sequence) || (value.sequence as number) < 1
    || !Number.isSafeInteger(value.controllerEpoch) || (value.controllerEpoch as number) < 1) throw new Fault('INVALID_INPUT');
  return value as unknown as LeaveCommand;
}

/** All mutations are synchronous on one Node event loop: no await inside this store. */
export class Store {
  readonly bootId = randomUUID();
  readonly releaseId = 'sys-01';
  readonly limits: Limits;
  private sessions = new Map<string, Session>();
  private rooms = new Map<string, Room>();
  private codes = new Map<string, string>();
  private closed = new Map<string, number>();
  private globalAttempts: number[] = [];
  constructor(private now: () => number = () => performance.now(), limits: Partial<Limits> = {}) {
    this.limits = { ...defaults, ...limits };
  }
  bootstrap(token?: string): { token?: string; session: Session } {
    this.sweep();
    const previous = this.lookup(token);
    if (previous) return { session: previous };
    if (this.sessions.size >= this.limits.sessions) throw new Fault('SERVER_BUSY', 503);
    const capability = randomBytes(32).toString('base64url');
    const session: Session = { key: digest(capability), expires: this.now() + 7_200_000, version: 0,
      ended: token ? { reason: 'Previous session unavailable: it expired or the server restarted.' } : null,
      admissions: new Map(), attempts: [] };
    this.sessions.set(session.key, session);
    return { token: capability, session };
  }
  lookup(token?: string): Session | undefined {
    if (!token || !/^[\w-]{43}$/.test(token)) return undefined;
    const session = this.sessions.get(digest(token));
    if (!session || (!session.roomId && session.expires <= this.now())) return undefined;
    return session;
  }
  require(token?: string): Session {
    this.sweep();
    const session = this.lookup(token);
    if (!session) throw new Fault('NOT_AUTHORIZED', 401);
    return session;
  }
  context(session: Session): SessionContext {
    const room = session.roomId ? this.rooms.get(session.roomId) : undefined;
    const seat = room && session.role ? room.seats[session.role] : undefined;
    let view: LobbyView | null = null;
    if (room && seat && session.role) view = {
      protocolVersion: 1, releaseId: this.releaseId, bootId: this.bootId,
      room: { id: room.id, code: room.code, phase: room.phase, roomVersion: room.version,
        lobbyRevision: room.lobbyRevision, owner: room.owner,
        players: (['A', 'B'] as const).filter(role => room.seats[role]).map(role => ({ role, connected: !!room.seats[role]?.channel })) },
      self: { role: session.role, controllerEpoch: seat.epoch, nextCommandSequence: seat.nextSequence },
      timers: { recoveryRemainingMs: room.pauseDeadline === undefined ? null : Math.max(0, room.pauseDeadline - this.now()),
        lifetimeRemainingMs: Math.max(0, room.created + this.limits.lifetimeMs - this.now()) },
      gameplayImplemented: false
    };
    return { bootId: this.bootId, contextVersion: session.version, view, ended: session.ended };
  }
  admit(session: Session, input: Admission, action: 'create' | 'join' | 'takeover'): SessionContext {
    this.sweep();
    const hash = digest(JSON.stringify([action, input.expectedContextVersion, input.code ?? null]));
    const cached = session.admissions.get(input.requestId);
    if (cached) {
      if (cached.hash !== hash) throw new Fault('REQUEST_CONFLICT', 409);
      if (cached.error) throw new Fault(cached.error, cached.status ?? 409);
      return this.context(session);
    }
    if (input.expectedContextVersion !== session.version) throw new Fault('STALE_CONTEXT', 409);
    this.rate(session);
    try {
      if (action === 'takeover') this.takeover(session);
      else {
        if (session.roomId) throw new Fault('STALE_CONTEXT', 409);
        let room: Room;
        let role: Role;
        if (action === 'create') {
          if (this.rooms.size >= this.limits.rooms) throw new Fault('SERVER_BUSY', 503);
          let code: string;
          do { code = Array.from({ length: 6 }, () => alphabet[randomInt(alphabet.length)]).join(''); }
          while (this.codes.has(code) || this.closed.has(code));
          room = { id: randomUUID(), code, created: this.now(), lastAction: this.now(), version: 0,
            lobbyRevision: 0, owner: 'A', phase: 'waiting', seats: {} };
          this.rooms.set(room.id, room); this.codes.set(code, room.id); role = 'A';
        } else {
          const id = this.codes.get(input.code!);
          const found = id ? this.rooms.get(id) : undefined;
          if (!found) throw new Fault('ROOM_UNAVAILABLE', 404);
          if (found.phase === 'paused') throw new Fault('PAUSED', 409);
          room = found;
          if (room.seats.A && room.seats.B) throw new Fault('ROOM_FULL', 409);
          role = room.seats.A ? 'B' : 'A';
        }
        room.seats[role] = { session, epoch: 0, nextSequence: 1, acknowledgements: new Map() };
        session.roomId = room.id; session.role = role; session.ended = null; session.version++;
        session.expires = this.now() + this.limits.lifetimeMs;
        this.changed(room, true);
      }
      session.admissions.set(input.requestId, { hash });
    } catch (error) {
      if (error instanceof Fault) session.admissions.set(input.requestId, { hash, error: error.code, status: error.status });
      throw error;
    } finally {
      if (session.admissions.size > 128) session.admissions.delete(session.admissions.keys().next().value!);
    }
    return this.context(session);
  }
  private rate(session: Session): void {
    const since = this.now() - 60_000;
    session.attempts = session.attempts.filter(t => t > since);
    this.globalAttempts = this.globalAttempts.filter(t => t > since);
    if (session.attempts.length >= 5 || this.globalAttempts.length >= 60) throw new Fault('RATE_LIMITED', 429);
    session.attempts.push(this.now()); this.globalAttempts.push(this.now());
  }
  private roomFor(session: Session): { room: Room; seat: Seat; role: Role } {
    const room = session.roomId ? this.rooms.get(session.roomId) : undefined;
    const role = session.role;
    const seat = room && role ? room.seats[role] : undefined;
    if (!room || !role || !seat || seat.session !== session) throw new Fault('ROOM_CLOSED', 409);
    return { room, seat, role };
  }
  canConnect(session: Session): void {
    this.sweep();
    if (this.roomFor(session).seat.channel) throw new Fault('CONTROLLER_ACTIVE', 409);
  }
  connect(session: Session, channel: Channel): number {
    this.canConnect(session);
    const { room, seat } = this.roomFor(session);
    seat.epoch++; seat.channel = channel;
    if (room.phase === 'paused' && Object.values(room.seats).every(s => s.channel)) {
      room.phase = 'waiting'; room.pauseDeadline = undefined;
    }
    this.changed(room, true, false);
    return seat.epoch;
  }
  disconnect(session: Session, channel: Channel): void {
    this.sweep();
    if (!session.roomId) return;
    const { room, seat } = this.roomFor(session);
    if (seat.channel !== channel) return;
    seat.channel = undefined;
    if (room.phase !== 'paused') {
      room.phase = 'paused'; room.pauseDeadline = this.now() + this.limits.recoveryMs;
    }
    this.changed(room, true, false);
  }
  private takeover(session: Session): void {
    const { room, seat } = this.roomFor(session);
    const previous = seat.channel;
    seat.channel = undefined; seat.epoch++; session.version++;
    if (room.phase !== 'paused') { room.phase = 'paused'; room.pauseDeadline = this.now() + this.limits.recoveryMs; }
    this.changed(room, true);
    previous?.send({ type: 'error', error: 'CONTROLLER_REPLACED' });
    previous?.close(4002, 'Controller replaced');
  }
  receive(session: Session, channel: Channel, raw: unknown): void {
    this.sweep();
    const input = command(raw);
    const { room, seat, role } = this.roomFor(session);
    if (seat.channel !== channel || input.controllerEpoch !== seat.epoch) throw new Fault('CONTROLLER_REPLACED', 409);
    if (input.roomId !== room.id) throw new Fault('NOT_AUTHORIZED', 403);
    const hash = digest(JSON.stringify([input.action, input.roomId, input.controllerEpoch]));
    const cached = seat.acknowledgements.get(input.sequence);
    if (cached) {
      if (cached.hash !== hash || cached.requestId !== input.requestId) throw new Fault('REQUEST_CONFLICT', 409);
      channel.send({ type: 'ack', requestId: input.requestId, sequence: input.sequence, ok: !cached.error, error: cached.error });
      channel.send({ type: 'snapshot', context: this.context(session) }); return;
    }
    if (Array.from(seat.acknowledgements.values()).some(a => a.requestId === input.requestId)) throw new Fault('REQUEST_CONFLICT', 409);
    if (input.sequence < seat.nextSequence) throw new Fault('REQUEST_TOO_OLD', 409);
    if (input.sequence > seat.nextSequence) throw new Fault('OUT_OF_ORDER', 409);
    seat.nextSequence++;
    seat.acknowledgements.set(input.sequence, { requestId: input.requestId, hash });
    if (seat.acknowledgements.size > 128) seat.acknowledgements.delete(seat.acknowledgements.keys().next().value!);
    channel.send({ type: 'ack', requestId: input.requestId, sequence: input.sequence, ok: true });
    if (room.phase === 'paused') { this.closeRoom(room, 'A player left the paused room. Create a new room.'); return; }
    // SYS-01 has only waiting/paused waiting rooms. Explicit leave allows waiting-seat replacement.
    seat.channel = undefined; delete room.seats[role];
    this.detach(session, room, 'You left the room.');
    channel.send({ type: 'snapshot', context: this.context(session) }); channel.close(4001, 'Left room');
    if (!room.seats.A && !room.seats.B) this.closeRoom(room, 'All players left.');
    else {
      if (room.owner === role) room.owner = other(role);
      if (Object.values(room.seats).every(s => s.channel)) { room.phase = 'waiting'; room.pauseDeadline = undefined; }
      this.changed(room, true);
    }
  }
  private detach(session: Session, room: Room, reason: string): void {
    session.roomId = undefined; session.role = undefined; session.version++;
    session.ended = { code: room.code, reason }; session.expires = this.now() + 7_200_000;
  }
  private changed(room: Room, lobby: boolean, interaction = true): void {
    room.version++; if (lobby) room.lobbyRevision++;
    if (interaction) room.lastAction = this.now();
    for (const seat of Object.values(room.seats)) seat.channel?.send({ type: 'snapshot', context: this.context(seat.session) });
  }
  private closeRoom(room: Room, reason: string): void {
    this.rooms.delete(room.id); this.codes.delete(room.code); this.closed.set(room.code, this.now() + 600_000);
    if (this.closed.size > 200) this.closed.delete(this.closed.keys().next().value!);
    for (const seat of Object.values(room.seats)) {
      this.detach(seat.session, room, reason);
      seat.channel?.send({ type: 'snapshot', context: this.context(seat.session) }); seat.channel?.close(4001, 'Room ended');
    }
  }
  sweep(): void {
    const now = this.now();
    for (const room of this.rooms.values()) {
      if (room.pauseDeadline !== undefined && now >= room.pauseDeadline) this.closeRoom(room, 'Reconnection time expired. Create a new room.');
      else if (now >= room.created + this.limits.lifetimeMs || now >= room.lastAction + this.limits.idleMs) this.closeRoom(room, 'Room expired. Create a new room.');
    }
    for (const [key, session] of this.sessions) if (!session.roomId && now >= session.expires) this.sessions.delete(key);
    for (const [code, expiry] of this.closed) if (now >= expiry) this.closed.delete(code);
  }
  shutdown(): void { for (const room of this.rooms.values()) this.closeRoom(room, 'Server stopped. Create a new room.'); }
}
