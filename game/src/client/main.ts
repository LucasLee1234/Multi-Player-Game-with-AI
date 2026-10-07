import type { SessionContext, ServerMessage, LeaveCommand } from '../contracts/lobby.js';
const el = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const messages: Record<string, string> = {
  ROOM_FULL: 'This room already has two players.', ROOM_UNAVAILABLE: 'Room not found or expired. Check the code.',
  PAUSED: 'This room is paused and its seats are reserved.', CONTROLLER_ACTIVE: 'Another tab controls your seat. Choose Use this tab to switch.',
  CONTROLLER_REPLACED: 'Another tab now controls your seat.', STALE_CONTEXT: 'Your session changed. Refresh its current state.',
  NOT_AUTHORIZED: 'Your session is unavailable. Retry connection.', RATE_LIMITED: 'Too many requests. Wait a moment before trying again.',
  SERVER_BUSY: 'The server is busy. Please try again shortly.', INVALID_INPUT: 'Check your input and try again.',
  ROOM_CLOSED: 'This room ended. Create a new room.'
};
let context: SessionContext | undefined;
let socket: WebSocket | undefined;
let stopped = false;
let busy = false;
let reconnectTimer: number | undefined;
let pendingLeave: LeaveCommand | undefined;
let receivedAt = performance.now();
const status = (text: string, error = false) => { el('status').textContent = text; el('status').classList.toggle('error', error); };
function render() {
  const view = context?.view;
  const connected = socket?.readyState === WebSocket.OPEN;
  el('entry').hidden = !!view; el('lobby').hidden = !view;
  el<HTMLButtonElement>('create').disabled = !context || busy;
  el<HTMLButtonElement>('join').disabled = !context || busy;
  el<HTMLButtonElement>('leave').disabled = busy || !connected || !!pendingLeave;
  el('takeover').hidden = !view || connected || !stopped;
  el('reconnect').hidden = !view || connected || stopped;
  if (view) {
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
    } else el('timer').textContent = 'Both players can connect. Start will be available in the gameplay increment.';
  }
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
      apply(message.context);
      if (!context?.view) { pendingLeave = undefined; status(context?.ended?.reason ?? 'Room ended.'); closeSocket(); }
      else {
        status(context.view.room.phase === 'paused' ? 'Room paused - waiting for reconnection.' : 'Room connected.');
        if (pendingLeave) {
          // Leave is idempotent by session context. If still associated after reconnect, reissue against the current controller.
          pendingLeave = { ...pendingLeave, sequence: context.view.self.nextCommandSequence, controllerEpoch: context.view.self.controllerEpoch };
          ws.send(JSON.stringify(pendingLeave));
        }
      }
    } else if (message.type === 'error') {
      pendingLeave = undefined;
      status(messages[message.error] ?? message.error, true);
      if (message.error === 'CONTROLLER_REPLACED') { stopped = true; pendingLeave = undefined; render(); }
      else render();
    } else if (message.type === 'ack' && pendingLeave?.requestId === message.requestId) {
      pendingLeave = undefined;
      if (!message.ok) status(messages[message.error!] ?? message.error!, true);
    }
  };
  ws.onopen = () => { if (socket === ws) render(); };
  ws.onclose = async event => {
    if (socket !== ws) return;
    socket = undefined;
    if (event.code === 4002) stopped = true;
    try {
      await refresh();
      if (!context?.view) { pendingLeave = undefined; status(context?.ended?.reason ?? 'Room ended.'); return; }
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
    status(context?.ended?.reason ?? 'Create a room or join your friend.'); connect();
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
el('create').onclick = () => { void admit('/api/rooms'); };
el<HTMLFormElement>('join-form').onsubmit = event => { event.preventDefault(); void admit('/api/rooms/join', el<HTMLInputElement>('code').value.trim().toUpperCase()); };
el('takeover').onclick = () => { void admit('/api/controller/takeover'); };
el('reconnect').onclick = () => { stopped = false; connect(); };
el('retry').onclick = () => { closeSocket(); void bootstrap(); };
el('leave').onclick = () => {
  if (!context?.view || socket?.readyState !== WebSocket.OPEN || pendingLeave) return;
  pendingLeave = { type: 'command', requestId: crypto.randomUUID(), sequence: context.view.self.nextCommandSequence,
    roomId: context.view.room.id, controllerEpoch: context.view.self.controllerEpoch, action: 'leave' };
  socket.send(JSON.stringify(pendingLeave)); render();
};
el('copy').onclick = async () => {
  try { await navigator.clipboard.writeText(context?.view?.room.code ?? ''); status('Room code copied.'); }
  catch { status('Copy the room code shown above.'); }
};
window.setInterval(render, 1000);
void bootstrap();
