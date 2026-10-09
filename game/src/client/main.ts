import { crateAction, crateFailure, pullDirection } from './crate-help.js';
import { GameAudio, transitionSound } from './audio.js';
import type { SessionContext, ServerMessage, Command, MissionView, Role, LobbyView, TeamSignal, TeamSignalKind } from '../contracts/lobby.js';
const el = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const audio=new GameAudio();
for(const event of ['pointerdown','keydown'] as const) document.addEventListener(event,e=>{if(e.isTrusted) audio.unlock();},{capture:true});
const messages: Record<string, string> = {
  ROOM_FULL: 'This room already has two players.', ROOM_UNAVAILABLE: 'Room not found or expired. Check the code.',
  PAUSED: 'This room is paused and its seats are reserved.', CONTROLLER_ACTIVE: 'Another tab controls your seat. Choose Use this tab to switch.',
  CONTROLLER_REPLACED: 'Another tab now controls your seat.', STALE_CONTEXT: 'Your session changed. Refresh its current state.',
  NOT_AUTHORIZED: 'Your session is unavailable. Retry connection.', RATE_LIMITED: 'Too many requests. Wait a moment before trying again.',
  SERVER_BUSY: 'The server is busy. Please try again shortly.', INVALID_INPUT: 'Check your input and try again.',
  SIGNAL_COOLDOWN: 'Wait two seconds between team signals. You can keep moving.',
  ROOM_CLOSED: 'This room ended. Create a new room.',
  STALE_PLAN: 'Plan changed - check it and confirm again.', STALE_MISSION: 'The mission changed. Check the current board.',
  STALE_POSITION: 'The robot or crate moved already. Check the board and choose your next direction.',
  STALE_RESTART: 'Restart request changed. Check the current request before agreeing.',
  STALE_LEVEL: 'Level request changed. Check the current choice before agreeing.',
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
const homeSlots = new Map<HTMLElement, Comment>();
for (const id of ['room-details','foundry-instructions','restart-panel','cargo-controls','leave']) {
  const node = el(id), slot = document.createComment(`home:${id}`); node.before(slot); homeSlots.set(node, slot);
}
const mapHelp = document.querySelector<HTMLElement>('.map-help')!, moveButtons = document.querySelector<HTMLElement>('.moves')!;
for (const node of [mapHelp, moveButtons, el('foundry-link')]) { const slot = document.createComment('home'); node.before(slot); homeSlots.set(node, slot); }
let arrowsHidden = false;
try { arrowsHidden = localStorage.getItem('foundry.controls.v1.hidden') === 'yes'; } catch { /* Session-only fallback. */ }
function hideTeachingArrows() {
  arrowsHidden = true;
  try { localStorage.setItem('foundry.controls.v1.hidden','yes'); } catch { /* Session-only fallback. */ }
}
let compactMissionId: string | undefined;
let exitRequested = false;
const completedStages = new Set<number>();
try { const saved:unknown=JSON.parse(localStorage.getItem('foundry.completed.v1') ?? '[]'); if(Array.isArray(saved)) for(const stage of saved) if(Number.isSafeInteger(stage) && stage>0) completedStages.add(stage); } catch { /* Session-only progress. */ }
let levelCatalog = '';
function renderLevels() {
  const view=context?.view; if (!view) return;
  const campaign=view.campaign;
  for(const stage of campaign.completed) completedStages.add(stage);
  try { localStorage.setItem('foundry.completed.v1',JSON.stringify([...completedStages])); } catch { /* Session-only progress. */ }
  const catalog=JSON.stringify(campaign.levels);
  if(levelCatalog!==catalog) {
    levelCatalog=catalog; el('level-buttons').replaceChildren();
    for(const level of campaign.levels) {
      const button=document.createElement('button');button.className='secondary';button.dataset.stage=String(level.stage);
      button.onclick=()=>{const v=context?.view;if(v?.mission)sendAction({action:'selectLevel',missionId:v.mission.id,levelRevision:v.campaign.revision,stage:level.stage});};
      el('level-buttons').append(button);
    }
  }
  const active=socket?.readyState===WebSocket.OPEN && !stopped && !pending && !exitRequested && ['planning','terminal'].includes(view.room.phase);
  for(const button of el('level-buttons').querySelectorAll<HTMLButtonElement>('button')) {
    const stage=Number(button.dataset.stage),level=campaign.levels.find(l=>l.stage===stage)!;
    const completed=completedStages.has(stage),current=view.mission?.foundry?.stage===stage;
    button.classList.toggle('level-completed',completed);button.disabled=!active;
    button.textContent=`${completed?'✓ ':''}${stage}. ${level.title}${current?' · Current':''}`;
    button.setAttribute('aria-label',`${level.title}${completed?', completed':''}${current?', current level':''}. Request this level.`);
  }
  const requested=campaign.requestedBy!==null;
  const title=campaign.levels.find(l=>l.stage===campaign.target)?.title;
  el('level-status').textContent=requested ? `${campaign.requestedBy} requests ${title}. Switch together?` : '✓ Completed · Switching needs both players.';
  el('level-agree').hidden=!requested;el<HTMLButtonElement>('level-agree').disabled=!active||campaign.requestedBy===view.self.role;
  el('level-agree').textContent=campaign.requestedBy===view.self.role?'Waiting for partner':'Agree & switch';
  el('level-cancel').hidden=!requested;el<HTMLButtonElement>('level-cancel').disabled=!active;
  el('level-cancel').textContent=campaign.requestedBy===view.self.role?'Cancel selection':'Keep current level';
}
type Lesson = 'movement' | 'push' | 'pull' | 'conveyor';
let tutorialKind: Lesson = 'movement';
const seenLessons = new Set<string>(), offeredLessons = new Set<string>();
const lessonKey = (kind: string) => `foundry.lesson.${kind === 'movement' ? 'v1' : kind === 'conveyor' ? 'v4' : 'v3'}.${kind}`;
try { for (const kind of ['movement','push','pull','conveyor']) if (localStorage.getItem(lessonKey(kind)) === 'seen') seenLessons.add(kind); } catch { /* Session-only fallback. */ }
function learn(kind: Lesson) {
  seenLessons.add(kind);
  try { localStorage.setItem(lessonKey(kind), 'seen'); } catch { /* Session-only fallback. */ }
}
let crateTip = '', crateTipUntil = 0, crateTipTimer: number | undefined;
function coach(text: string) {
  crateTip = text; crateTipUntil = performance.now() + 7000;
  window.clearTimeout(crateTipTimer);
  crateTipTimer = window.setTimeout(() => { crateTip = ''; render(); }, 7000);
}
function showLesson(kind: Lesson) {
  tutorialKind = kind; offeredLessons.add(kind);
  el('tutorial-title').textContent = kind === 'conveyor' ? 'Hold the switch. Clear the belt.' : kind === 'push' ? 'Push the crate' : kind === 'pull' ? 'Pull the crate' : 'Move together';
  el('tutorial-text').textContent = kind === 'conveyor' ? 'Switch 16 runs the blue conveyor; it does not open a gate. Hold the switch to carry the crate along 12 → 13 → Dock 18. Tile 13 is the belt corner. Keep the route clear: the crate waits safely if a robot is in the way. You do not need to push it. Then reach both robot exits.' : kind === 'push' ? 'Walk into the crate to push it one tile. The space behind it must be clear.'
    : kind === 'pull' ? 'Pull moves straight away from the crate. With the crate on your left, pull RIGHT; UP and DOWN will not work. Turn Pull OFF with F or the button to walk freely.'
    : 'Use arrow keys / WASD, or tap a tile next to your robot to move. Tap a distant tile to point it out. Stand on relays to power your partner’s gates. Staying still is waiting.';
  el('tutorial-demo').hidden = kind === 'movement' || kind === 'conveyor';
  el('tutorial-next').hidden = kind === 'conveyor';
  const before = kind === 'push' ? ['robot','crate','empty'] : ['crate','robot','empty'];
  const after = kind === 'push' ? ['empty','robot','crate'] : ['empty','crate','robot'];
  for (const [selector, arrangement] of [['.demo-before', before], ['.demo-after', after]] as const) {
    document.querySelectorAll<HTMLElement>(`${selector} span`).forEach((node, index) => {
      const item = arrangement[index]!; node.className = `demo-${item}`;
      node.textContent = item === 'robot' ? 'You' : item === 'crate' ? 'Crate' : 'Empty';
    });
  }
  el('tutorial-next').textContent = kind === 'push' ? 'How to pull' : 'How to push';
  el('demo-direction').textContent = kind === 'push' ? '→ Walk right into the crate' : '→ Pull mode: step right, away from the crate';
  el('tutorial-dismiss').textContent = kind === 'movement' ? 'Got it' : 'Try it';
  const dialog = el<HTMLDialogElement>('tutorial'); if (!dialog.open) dialog.showModal();
}
function togglePull() {
  const board=context?.view?.mission?.foundry;
  if(board?.crate && board.conveyor) {
    coach(board.crate.cell===board.crate.target?'Cargo delivered. The dock holds the crate. Reach both robot exits.':`The belt carries this crate. Hold Switch ${board.conveyor.relay} and clear the arrow route. No pushing needed.`);render();return;
  }
  pullMode = !pullMode;
  if (pullMode && !seenLessons.has('pull') && !offeredLessons.has('pull')) showLesson('pull');
  render();
}
function compactLayout(enabled: boolean, m?: MissionView) {
  document.body.classList.toggle('single-screen', enabled);
  document.body.classList.toggle('has-cargo',enabled && !!m?.foundry?.crate);
  el('game-menu-open').hidden = !enabled;
  if (!enabled) {
    el('team-bubbles').replaceChildren();
    el('team-open').hidden=true; markingTile=false; closeTeamPanel(); visibleSignals.clear();
    if(teamTimer!==undefined) window.clearTimeout(teamTimer);
    compactMissionId = undefined;
    for (const [node, slot] of homeSlots) slot.after(node);
    el('crate-coach').hidden = true;
    for (const id of ['game-menu','tutorial']) el<HTMLDialogElement>(id).close();
    el('restart-alert').hidden = el('mode-indicator').hidden = true;
    return;
  }
  if (compactMissionId !== m?.id) {
    el<HTMLDialogElement>('game-menu').close();
    if (m?.result) el<HTMLDialogElement>('tutorial').close();
  }
  compactMissionId = m?.id;
  if ((m?.foundry?.stage ?? 0) > 1) hideTeachingArrows();
  for (const [id, host] of [['leave','menu-exit'],['room-details','menu-room'],['foundry-instructions','menu-help'],['restart-panel','menu-restart'],['cargo-controls','menu-cargo']] as const) if (el(id).parentElement !== el(host)) el(host).append(el(id));
  el<HTMLDetailsElement>('room-details').open=true;
  el('menu-room-identity').textContent = `Room ${context!.view!.room.code} · Player ${context!.view!.self.role}`;
  el('tab-play').textContent = context?.view?.restart.requestedBy || context?.view?.campaign.requestedBy ? 'Play •' : 'Play';
  if (mapHelp.parentElement !== el('menu-help')) el('menu-help').append(mapHelp);
  if (el('foundry-link').parentElement !== mapHelp) mapHelp.append(el('foundry-link'));
  el('menu-shortcuts').textContent = m?.foundry?.crate ? 'Move: arrows / WASD or adjacent tile. Push: walk into crate. Pull: F.' : 'Move: arrows / WASD or adjacent tile. Stay still to wait.';
  el('sound-toggle').textContent=audio.enabled?'Sound ON':'Sound OFF';
  el('sound-toggle').setAttribute('aria-pressed',String(audio.enabled));
  const teachingArrows = m?.foundry?.stage === 1 && !arrowsHidden;
  if (teachingArrows) { if (moveButtons.parentElement !== homeSlots.get(moveButtons)!.parentElement) homeSlots.get(moveButtons)!.after(moveButtons); }
  else if (moveButtons.parentElement !== el('menu-moves')) el('menu-moves').append(moveButtons);
  document.body.classList.toggle('teaching-arrows', teachingArrows);
  el('hide-controls').hidden = !teachingArrows;
  el('restart-alert').hidden = !context?.view?.restart.requestedBy && !context?.view?.campaign.requestedBy;
  el('restart-alert').textContent = context?.view?.campaign.requestedBy ? 'Level switch request' : 'Restart request';
  el('mode-indicator').hidden = !m?.foundry?.crate;
  const pull = m && context?.view ? pullDirection(m, context.view.self.role) : null;
  el('mode-indicator').textContent = pullMode ? `Pull ON ${pull?.arrow ?? ''} · F` : 'Pull OFF · F';
  el('mode-indicator').title = pullMode ? pull ? `Pull ${pull.name}, straight away from the crate. Turn OFF to walk in other directions.` : 'Stand next to the crate. Turn Pull OFF to walk freely.' : 'Turn Pull ON to drag a crate. F switches modes.';
  el('mode-indicator').setAttribute('aria-pressed',String(pullMode));
  if(m?.foundry?.conveyor) {
    el('mode-indicator').textContent=m.foundry.crate!.cell===m.foundry.crate!.target?'✓ Cargo delivered':`Belt · Switch ${m.foundry.conveyor.relay}`;
    el('mode-indicator').title='Hold the switch and clear the arrow route. The delivery dock locks the crate in place.';
  }
  el<HTMLButtonElement>('mode-indicator').disabled = !context?.view || context.view.room.phase !== 'planning' || socket?.readyState!==WebSocket.OPEN || stopped || !!pending || exitRequested;
  el('crate-coach').hidden = !m?.foundry?.crate || !!m.result || performance.now() >= crateTipUntil || !crateTip;
  el('crate-coach-text').textContent = crateTip;
  renderLevels();
  if (m && context?.view?.room.phase === 'planning' && !el<HTMLDialogElement>('game-menu').open) {
    const kind: Lesson = m.foundry?.conveyor ? 'conveyor' : m.foundry?.crate ? 'push' : 'movement';
    if (!seenLessons.has(kind) && !offeredLessons.has(kind)) showLesson(kind);
  }
}
const status = (text: string, error = false) => { el('status').textContent = text; el('status').classList.toggle('error', error); el('status').hidden = text === 'Room connected.' && !!context?.view?.mission && context.view.room.phase !== 'paused' && !error; };
function endedText() {
  const ended = context?.ended, outcome = ended?.outcome;
  return (ended?.reason ?? 'Room ended.') + (outcome ? ` Previous mission: ${outcome.result}.` : '');
}
function render() {
  const view = context?.view;
  const connected = socket?.readyState === WebSocket.OPEN;
  if (!view) exitRequested=false;
  if (exitRequested && view && connected && !stopped && !pending && !busy) { sendAction({action:'leave'}); return; }
  document.body.classList.toggle('entry-screen', !view);
  document.body.classList.toggle('waiting-screen', !!view && !view.mission);
  el('waiting-room').hidden = !view || !!view.mission;
  document.body.classList.toggle('playing', !!view?.mission);
  document.body.classList.toggle('foundry-playing', !!view?.mission?.foundry);
  const roomDetails = el<HTMLDetailsElement>('room-details');
  if (!view?.mission) roomDetails.open = true;
  else if (document.body.dataset.mission !== view.mission.id) roomDetails.open = false;
  document.body.dataset.mission = view?.mission?.id ?? '';
  el('status').hidden = el('status').textContent === 'Room connected.' && !!view?.mission && view.room.phase !== 'paused' && !el('status').classList.contains('error');
  el('entry').hidden = !!view; el('lobby').hidden = !view;
  el<HTMLButtonElement>('create').disabled = !context || busy;
  el<HTMLButtonElement>('join').disabled = !context || busy;
  el<HTMLButtonElement>('leave').disabled = exitRequested;
  el('leave').textContent = exitRequested ? 'Leaving when connected…' : 'Leave room';
  el('takeover').hidden = !view || connected || !stopped;
  el('reconnect').hidden = !view || connected || stopped;
  if (view) {
    const liveLobby = connected && !stopped;
    el('waiting-title').textContent = stopped ? 'Your workshop is open in another tab.'
      : view.room.phase === 'paused' ? 'Your workshop is waiting.'
      : 'Your workshop is ready.';
    el('waiting-description').textContent = liveLobby ? 'One little adventure. Two essential teammates.'
      : 'Reconnect here to see the latest crew status.';
    for (const role of ['A', 'B'] as const) {
      const seat = view.room.players.find(p => p.role === role);
      el(`seat-${role}-name`).textContent = `Robot ${role}${role === view.self.role ? ' · You' : ' · Partner'}`;
      el(`seat-${role}-state`).textContent = !liveLobby ? 'Checking connection' : !seat ? 'Waiting for a player' : seat.connected ? 'Connected' : 'Reconnecting';
      el(`seat-${role}`).classList.toggle('crew-connected', liveLobby && !!seat?.connected);
    }
    const foundry = view.releaseId !== 'sys-02';
    document.title = foundry ? 'Signal Foundry' : 'Signal Rescue';
    el('page-eyebrow').textContent = foundry ? 'Signal Foundry · A cooperative robot adventure' : 'Signal Rescue · Cooperative navigation';
    el('page-title').textContent = foundry ? 'Signal Foundry' : 'Find a way out together.';
    el('page-subtitle').textContent = foundry ? 'Two robots. One escape. Open a route for your partner, then find your way out together.' : 'You see your partner’s dangers. They see yours. Find a safe route together.';
    el('page-notice').textContent = foundry ? 'Six rooms. Power gates, share passages, and carry freight together.' : 'Try Different Dangers, a cooperative navigation mission.';
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
    } else el('timer').textContent = view.room.phase === 'waiting' ? view.releaseId !== 'sys-02' && view.releaseId !== 'sys-03-sf-t1' ? 'The mission begins when both players are connected.' : 'Both players must confirm before the mission starts.' : 'Move at your own pace; inactive rooms still expire.';
  }
  renderMission();
  compactLayout(view?.mission?.foundry?.movement === 'independent', view?.mission ?? undefined);
}
function apply(next: SessionContext) {
  if (context?.bootId === next.bootId && context.contextVersion > next.contextVersion) return;
  if (context?.bootId === next.bootId && context.view && next.view
      && context.view.room.id === next.view.room.id && context.view.room.roomVersion > next.view.room.roomVersion) return;
  const previous = context?.view?.mission, mission = next.view?.mission, role = next.view?.self.role;
  if (previous && mission && role && previous.id === mission.id && previous.planningRevision !== mission.planningRevision) {
    const own = mission.explanations.find(t => t.startsWith(`${role}: `));
    if (own?.includes('pushed the crate') && previous.foundry?.crate?.cell !== mission.foundry?.crate?.cell && previous.positions[role] !== mission.positions[role] && !seenLessons.has('push')) { learn('push'); coach('Nice push! Park the crate on its matching dock. Need to pull? Tap Pull or press F.'); }
    if (own?.includes('pulled the crate') && previous.foundry?.crate?.cell !== mission.foundry?.crate?.cell && previous.positions[role] !== mission.positions[role] && !seenLessons.has('pull')) { learn('pull'); coach('Nice pull! Tap Pull or press F again to return to normal movement.'); }
    if (own && /closed|block|cannot|Pull needs|Occupied/.test(own) && mission.foundry?.crate) coach(crateFailure(own, mission, role));
    if (mission.foundry?.crate && mission.foundry.crate.cell === mission.foundry.crate.target && previous.foundry?.crate?.cell !== mission.foundry.crate.target) coach('✓ Crate parked. Keep it here, then reach both robot exits.');
  }
  if (previous?.id !== mission?.id) { crateTip = ''; pullMode = false; }
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
      if (pending?.action==='leave') exitRequested=false;
      clearPending();
      status(messages[message.error] ?? message.error, true);
      if (message.error === 'CONTROLLER_REPLACED') { stopped = true; clearPending(); render(); }
      else render();
    } else if (message.type === 'ack' && pending?.requestId === message.requestId) {
      pendingAcknowledged = true; window.clearTimeout(retryCommandTimer);
      if (!message.ok && pending.action==='leave') exitRequested=false;
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
  if (!view || pending || socket?.readyState !== WebSocket.OPEN || stopped || (exitRequested && action.action!=='leave')) return;
  commandFeedback = undefined; pendingAcknowledged = false;
  pending = { type: 'command', requestId: crypto.randomUUID(), sequence: view.self.nextCommandSequence,
    roomId: view.room.id, controllerEpoch: view.self.controllerEpoch, ...action } as Command;
  transmit(); render();
}
function gameAction(action: 'ready' | 'propose' | 'signal', cell?: number) {
  const m = context?.view?.mission;
  if (!m) return;
  if (m.foundry?.movement === 'independent') {
    if (action === 'propose') {
      if(m.foundry.crate) sendAction({action:'crateMove',missionId:m.id,from:m.positions[context!.view!.self.role],crateFrom:m.foundry.crate.cell,destination:cell!,kind:pullMode?'pull':'move'});
      else sendAction({ action: 'move', missionId: m.id, from: m.positions[context!.view!.self.role], destination: cell! });
    }
    else if (action === 'signal') sendTeamSignal('point',cell!);
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
let markingTile=false, teamMissionId:string|undefined, teamView:LobbyView|undefined;
let teamCooldown=0, teamTimer:number|undefined;
const visibleSignals=new Map<Role, {signal:TeamSignal;deadline:number}>();
function closeTeamPanel() { el('team-panel').hidden=true; el('team-open').setAttribute('aria-expanded','false'); }
function sendTeamSignal(kind:TeamSignalKind,cell:number) {
  const m=context?.view?.mission;
  if(!m || performance.now()<teamCooldown) return;
  markingTile=false; closeTeamPanel();
  sendAction({action:'communicate',missionId:m.id,kind,cell});
}
function renderTeamSignals(m:MissionView,role:Role,planning:boolean) {
  const view=context!.view!, available=m.foundry?.movement==='independent';
  el('team-open').hidden=!available; el<HTMLButtonElement>('team-open').disabled=!planning;
  if(teamMissionId!==m.id) {
    teamMissionId=m.id; teamView=undefined; visibleSignals.clear(); markingTile=false; closeTeamPanel();
    const select=el<HTMLSelectElement>('team-gate'); select.replaceChildren();
    for(const g of m.foundry?.gates??[]) { const option=document.createElement('option'); option.value=String(g.cell); option.textContent=`Gate ${g.cell} · Relay ${g.relay}`; select.append(option); }
  }
  if(teamView!==view) {
    const hadView=!!teamView;
    teamView=view; teamCooldown=performance.now()+(view.communication?.cooldownMs??0);
    for(const r of ['A','B'] as const) {
      const signal=view.communication?.signals[r], old=visibleSignals.get(r);
      if(!signal) visibleSignals.delete(r);
      else if(old?.signal.id!==signal.id) {
        visibleSignals.set(r,{signal,deadline:performance.now()+signal.remainingMs});
        if(hadView && r!==role) audio.play('signal');
      }
    }
  }
  const now=performance.now();
  const canSend=planning && now>=teamCooldown;
  for(const id of ['team-power','team-hold','team-ack','team-point']) el<HTMLButtonElement>(id).disabled=!canSend;
  el('team-help').textContent=markingTile?'Tap any floor tile to mark it. This tap will not move your robot.':now<teamCooldown?'Wait two seconds between signals. Movement is still available.':'Requests only. Your partner can keep moving.';
  el('team-point').textContent=markingTile?'Cancel marking':'Mark a tile';
  el('team-open').classList.toggle('marking-tile',markingTile);
  for(const tile of foundryTiles) { tile.classList.remove('team-mark-A','team-mark-B'); tile.querySelector('.team-marker')?.remove(); }
  const messages:string[]=[];
  const bubbles=el('team-bubbles'); bubbles.replaceChildren();
  const bubbleBounds:DOMRect[]=[];
  for(const r of ['A','B'] as const) {
    const entry=visibleSignals.get(r); if(!entry || entry.deadline<=now || !planning && !!m.result) continue;
    const s=entry.signal, gate=m.foundry?.gates.find(g=>g.cell===s.cell);
    const target=s.kind==='needPower'?gate?.relay:s.kind==='ack'?undefined:s.cell;
    const text=s.kind==='point'?`${r} marks tile ${s.cell}.`:s.kind==='needPower'?`${r} needs Relay ${gate?.relay} for Gate ${s.cell}.`:s.kind==='hold'?`${r} asks ${r==='A'?'B':'A'} to hold tile ${s.cell}.`:`${r}: Got it.`;
    messages.push(text);
    const robot=foundryTiles[m.positions[r]]?.querySelector<HTMLElement>('.robot');
    if(robot) {
      const bubble=document.createElement('div'); bubble.className=`robot-speech robot-speech-${r}`;
      const short=s.kind==='needPower'?`Power Gate ${s.cell}!`:s.kind==='hold'?'Hold position!':s.kind==='point'?`Look at tile ${s.cell}!`:'Got it!';
      bubble.textContent=`${r}: ${short}`; bubbles.append(bubble);
      const head=robot.getBoundingClientRect(), width=bubble.getBoundingClientRect().width;
      const center=Math.max(width/2+8,Math.min(innerWidth-width/2-8,head.left+head.width/2));
      bubble.style.left=`${center}px`; bubble.style.top=`${head.top-7}px`;
      let bounds=bubble.getBoundingClientRect();
      for(const other of bubbleBounds) if(bounds.left<other.right+4 && bounds.right>other.left-4 && bounds.top<other.bottom+4 && bounds.bottom>other.top-4) {
        bubble.style.top=`${other.top-6}px`; bounds=bubble.getBoundingClientRect();
      }
      if(bounds.top<8) bubble.style.top=`${8+bounds.height}px`;
      bubble.style.setProperty('--speech-tail-x',`${Math.max(8,Math.min(width-8,head.left+head.width/2-(center-width/2)))}px`);
      bubbleBounds.push(bubble.getBoundingClientRect());
    }
    if(target!==undefined && foundryTiles[target]) {
      const tile=foundryTiles[target]!; tile.classList.add(`team-mark-${r}`);
      const badge=document.createElement('span'); badge.className=`team-marker team-marker-${r}`; badge.textContent=`${r}${s.kind==='needPower'?' ⚡':s.kind==='hold'?' ·':''}`; badge.setAttribute('aria-hidden','true'); tile.append(badge);
    }
  }
  if(markingTile && planning) messages.unshift('Tap a tile to mark it; your robot will stay still.');
  if(messages.length && !el('resolution').classList.contains('feedback-blocked')) el('resolution').textContent=messages.join(' ');
  if(teamTimer!==undefined) window.clearTimeout(teamTimer);
  const deadlines=[teamCooldown,...[...visibleSignals.values()].map(s=>s.deadline)].filter(t=>t>now);
  if(deadlines.length) teamTimer=window.setTimeout(()=>render(),Math.min(...deadlines)-now+10);
  if(!planning) { markingTile=false; closeTeamPanel(); }
}
let boardMissionId: string | undefined;
let pullMode = false;
let lastVisual: MissionView | undefined;
const motionUntil = new Map<string, number>();
function prepareFoundryBoard(m: MissionView) {
  if (boardMissionId === m.id) return;
  boardMissionId = m.id; inspectedCell = undefined; pullMode = false; foundryTiles.length = 0; el('foundry-board').replaceChildren();
  el('foundry-board').style.gridTemplateColumns = `repeat(${m.foundry!.width}, minmax(0, 1fr))`;
  el('foundry-board').dataset.rows = String(m.foundry!.height);
  for (let cell = 0; cell < m.foundry!.width * m.foundry!.height; cell++) {
  const tile = document.createElement('button'); tile.type = 'button'; tile.className = 'factory-tile';
  tile.onclick = () => {
    inspectedCell = cell;
    if(markingTile) { sendTeamSignal('point',cell); return; }
    const view = context?.view, mission = view?.mission;
    const adjacent = mission && view && ['up','left','right','down'].some(d => destination(d as typeof moves[number],mission.positions[view.self.role],mission) === cell);
    gameAction(mission?.foundry?.movement === 'independent' && adjacent ? 'propose' : 'signal', cell);
  };
  tile.onfocus = tile.onpointerenter = () => {
    inspectedCell = cell;
    const view = context?.view;
    if (view?.mission?.foundry) showFoundryLink(view.mission, cell);
  };
  foundryTiles.push(tile); el('foundry-board').append(tile);
  }
}
function showFoundryLink(m: MissionView, cell: number) {
  const link = m.foundry!.gates.find(g => g.cell === cell || g.relay === cell);
  el('foundry-link').textContent = link ? link.kind === 'pressure'
    ? !link.open && Object.values(m.positions).includes(link.cell)
      ? `Gate ${link.cell} · Exit only. The robot inside can step onto a clear adjacent tile. Power Relay ${link.relay} before entering again.`
      : `Gate ${link.cell} · ${link.powered ? 'Powered' : 'Closed'}. Keep Relay ${link.relay} occupied to hold it open.`
    : link.latched ? `Gate ${link.cell} · Locked open after entry. Relay ${link.relay} is no longer needed.`
    : `Gate ${link.cell} · ${link.powered ? 'Powered' : 'Closed'}. Stand on Relay ${link.relay}; entering locks it open.`
    : m.foundry!.gates.map(g => `Relay ${g.relay} → ${g.kind === 'pressure' ? 'Hold-open' : 'Latching'} Gate ${g.cell}`).join(' · ');
  const belt=m.foundry!.conveyor;
  if(belt && (belt.path.includes(cell)||belt.relay===cell||cell===-1))el('foundry-link').textContent+=` · Blue conveyor ${belt.path.join(' → ')}: hold Switch ${belt.relay} and clear the route. The dock locks delivered cargo.`;
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
  prepareFoundryBoard(m);
  const previous = lastVisual?.id === m.id ? lastVisual : undefined;
  const cue=transitionSound(previous,m); if(cue) audio.play(cue);
  if (!previous) motionUntil.clear();
  if (previous?.foundry?.crate && board.crate && previous.foundry.crate.cell !== board.crate.cell) motionUntil.set('crate', performance.now() + 260);
  if(board.conveyor && previous?.foundry?.crate?.cell!==board.crate?.cell && previous)motionUntil.set('belt',performance.now()+900);
  for (const r of ['A', 'B'] as const) if (previous && previous.positions[r] !== m.positions[r]) motionUntil.set(`robot-${r}`, performance.now() + 260);
  for (const g of board.gates) if (previous && previous.foundry!.gates.find(old => old.cell === g.cell)?.open !== g.open) motionUntil.set(`gate-${g.cell}`, performance.now() + 400);
  if (previous && previous.planningRevision !== m.planningRevision && previous.turnsResolved === m.turnsResolved && m.explanations.some(t => /closed|overlap|block|cannot|Pull needs/.test(t))) motionUntil.set('blocked', performance.now() + 300);
  el('foundry-self').textContent = `You · ${role}`;
  el('foundry-self').className = `role-badge role-${role}`;
  el('foundry-hint').textContent = m.result ? board.nextTitle ? `Both robots reached their exits. Choose ${board.nextTitle} together, or practice this room again.` : 'Both robots reached their exits. Practice this room again, or leave to start a new adventure.' : board.stage > 1 ? board.hint : role === 'B' && m.positions.B === 8 && !board.gates[0]!.latched
    ? 'You are powering Gate 1. Let A through; A can then power your gate.'
    : role === 'A' && m.positions.A === 0 ? 'B powers Gate 1 for you. Cross it and reach Relay 2 to help B.'
    : 'Help your partner through, then bring both robots to their exits.';
  const link = board.gates.find(g => g.cell === inspectedCell || g.relay === inspectedCell);
  showFoundryLink(m, inspectedCell ?? -1);
  for (let cell = 0; cell < board.width * board.height; cell++) {
    const tile = foundryTiles[cell]!, wall = board.walls.includes(cell);
    const gate = board.gates.find(g => g.cell === cell), relay = board.gates.find(g => g.relay === cell);
    const exit = (['A', 'B'] as const).find(r => m.exits[r] === cell);
    const robot = (['A', 'B'] as const).find(r => m.positions[r] === cell);
    const cargo = board.crate?.cell===cell;
    const exitOnly = !!gate && !gate.open && !!robot;
    const crateTarget = board.crate?.target === cell;
    const belt=board.conveyor, beltIndex=belt?.path.indexOf(cell)??-1, beltSwitch=belt?.relay===cell;
    const beltNext=beltIndex>=0?belt?.path[beltIndex+1]:undefined;
    const beltArrow=beltNext===undefined?'END':beltNext===cell+1?'→':beltNext===cell-1?'←':beltNext===cell+board.width?'↓':'↑';
    const label = wall ? 'Wall' : gate ? `${gate.kind === 'pressure' ? 'Hold-open' : 'Latching'} Gate ${cell}` : beltSwitch ? `Conveyor Switch ${cell}` : beltIndex>=0 ? 'Conveyor' : relay ? `Relay ${cell}` : exit ? `Exit ${exit}` : 'Floor';
    const state = gate ? exitOnly ? 'Exit only; the robot inside can leave' : gate.latched ? 'Latched open' : gate.powered ? 'Powered' : 'Closed' : relay ? `→ Gate ${relay.cell}` : '';
    tile.className = `factory-tile${wall ? ' wall' : gate ? gate.open ? ' gate-open' : ' gate-closed' : relay ? ' relay' : exit ? ' exit' : ''}${link && (cell === link.cell || cell === link.relay) ? ' linked' : ''}`;
    tile.classList.toggle('has-robot', !!robot);
    tile.classList.toggle('gate-exit-only', exitOnly);
    tile.classList.toggle('gate-tile', !!gate);
    tile.classList.toggle('relay-powered', !!relay?.powered);
    tile.classList.toggle('exit-A', exit === 'A');
    tile.classList.toggle('exit-B', exit === 'B');
    tile.classList.toggle('crate-target', crateTarget);
    tile.classList.toggle('crate-parked', crateTarget && cargo);
    tile.classList.toggle('has-crate', cargo);
    tile.classList.toggle('conveyor-tile',beltIndex>=0);
    tile.classList.toggle('conveyor-powered',beltIndex>=0 && !!belt?.powered);
    tile.classList.toggle('conveyor-switch',beltSwitch);
    if(beltIndex>=0 && (motionUntil.get('belt')??0)>performance.now())tile.classList.add('belt-transfer');
    if ((motionUntil.get(`gate-${cell}`) ?? 0) > performance.now()) tile.classList.add('power-flash');
    if (cell === m.positions[role] && (motionUntil.get('blocked') ?? 0) > performance.now()) tile.classList.add('blocked-flash');
    tile.disabled = wall || !planning || (board.movement !== 'independent' && !!m.signals[role]);
    const gateRule = gate ? ` Relay ${gate.relay}. ${gate.kind === 'pressure' ? 'Requires continuous relay power.' : 'Stays open after first entry.'}` : '';
    const adjacentMove = m.foundry!.movement === 'independent' && ['up','left','right','down'].some(d => destination(d as typeof moves[number],m.positions[role],m) === cell);
    const preview = planning ? crateAction(m, role, cell, pullMode) : null;
    tile.classList.toggle('crate-action', !!preview);
    tile.setAttribute('aria-label', `${cell}: ${label}${state ? `, ${state}` : ''}${cargo?', Crate':''}${robot ? `, Robot ${robot}${robot === role ? ', you' : ', partner'}` : ''}.${crateTarget ? ` Crate parking target. ${cargo ? 'Crate parked; keep it here.' : 'Leave the crate here to complete the room.'}` : ''}${gateRule} ${wall ? 'Impassable.' : adjacentMove ? preview === 'pull' ? 'Pull toward this tile.' : pullMode ? 'Turn Pull OFF to walk here.' : preview === 'push' ? 'Push the crate toward this tile.' : 'Move toward this tile.' : 'Point out this tile.'}`);
    if(beltIndex>=0||beltSwitch)tile.setAttribute('aria-label',tile.getAttribute('aria-label')+` ${beltSwitch?`Conveyor Switch ${cell}: stand here to run the belt.`:`Conveyor ${beltArrow}, ${belt!.powered?'powered':'waiting for switch'}, ${beltNext===undefined?'belt end':`next Tile ${beltNext}`}. Use Switch ${belt!.relay} to move the crate.`}`);
    // Stable tile nodes preserve focus; only their visual contents change.
    tile.replaceChildren();
    const number = document.createElement('span'); number.className = 'tile-number'; number.textContent = String(cell); tile.append(number);
    const icon = document.createElement('span'); icon.className = 'tile-icon'; icon.setAttribute('aria-hidden', 'true'); icon.textContent = crateTarget ? 'C' : wall ? '' : gate ? gate.kind === 'pressure' ? '▤' : '▥' : relay ? '◇' : exit ? '↗' : ''; tile.append(icon);
    if (!crateTarget && (gate || relay || exit)) {
      icon.textContent = '';
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 28 28'); svg.setAttribute('focusable', 'false');
      const shape = (tag: string, attributes: Record<string,string>) => {
        const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (const [key,value] of Object.entries(attributes)) node.setAttribute(key,value);
        svg.append(node);
      };
      if (gate) {
        shape('rect',{x:'4',y:'5',width:'20',height:'19',rx:'3',fill:'none',stroke:'currentColor','stroke-width':'2'});
        shape('path',{d:gate.open || exitOnly?'M8 9v11m12-11v11':'M9 9v11m5-11v11m5-11v11',fill:'none',stroke:'currentColor','stroke-width':'2','stroke-linecap':'round'});
        shape('circle',{cx:'14',cy:'2',r:'2',fill:'currentColor'});
      } else if (relay) {
        shape('path',{d:'M14 3 25 14 14 25 3 14Z',fill:'none',stroke:'currentColor','stroke-width':'2'});
        shape('circle',{cx:'14',cy:'14',r:'4',fill:'currentColor'});
      } else {
        shape('rect',{x:'3',y:'3',width:'22',height:'22',rx:'6',fill:'none',stroke:'currentColor','stroke-width':'1.5'});
        shape('path',{d:'M9 19 19 9m-8 0h8v8',fill:'none',stroke:'currentColor','stroke-width':'2','stroke-linecap':'round','stroke-linejoin':'round'});
      }
      icon.append(svg);
    }
    const name = document.createElement('span'); name.className = 'tile-name'; name.textContent = crateTarget ? 'Crate dock' : beltSwitch ? `Switch ${cell}` : beltIndex>=0&&!gate ? 'Conveyor' : wall || label === 'Floor' ? '' : gate ? `Gate ${cell}` : exit ? `Exit ${exit}` : 'Relay'; tile.append(name);
    if(beltIndex>=0&&!crateTarget) {const badge=document.createElement('span');badge.className='belt-arrow';badge.textContent=beltArrow;badge.setAttribute('aria-hidden','true');tile.append(badge);}
    if (crateTarget) {
      const marker = document.createElement('span'); marker.className = 'crate-target-label';
      marker.textContent = cargo ? '✓ Crate parked' : 'Park crate here'; tile.append(marker);
    }
    if (gate) {
      const rule = document.createElement('span'); rule.className = 'tile-rule'; rule.textContent = gate.kind === 'pressure' ? 'Hold relay' : 'Stays open'; tile.append(rule);
      const source = document.createElement('span'); source.className = 'tile-source'; source.textContent = `Relay ${gate.relay}`; tile.append(source);
    }
    const description = document.createElement('span'); description.className = 'tile-state'; description.textContent = gate ? exitOnly ? 'Exit only' : gate.latched ? 'Locked open' : gate.powered ? 'Powered' : 'Closed' : beltSwitch ? '→ Conveyor' : beltIndex>=0&&!crateTarget ? `Switch ${belt!.relay} · ${belt!.powered?'ON':'OFF'}` : relay ? `→ Gate ${relay.cell}` : ''; tile.append(description);
    if (robot) {
      const bot = document.createElement('span'); bot.className = `robot robot-${robot}`; bot.textContent = robot;
      bot.setAttribute('aria-hidden', 'true'); tile.append(bot);
      if ((motionUntil.get(`robot-${robot}`) ?? 0) > performance.now()) bot.classList.add('bot-step');
    }
    if (preview) { const hint = document.createElement('span'); hint.className = 'crate-action-label'; hint.textContent = `${cell > m.positions[role] ? cell - m.positions[role] === board.width ? '↓' : '→' : m.positions[role] - cell === board.width ? '↑' : '←'} ${preview === 'pull' ? 'Pull here' : 'Push'} `; tile.append(hint); }
    if(cargo){const crate=document.createElement('span');crate.className='crate';crate.textContent='C';crate.setAttribute('aria-hidden','true');tile.append(crate);if((motionUntil.get('crate')??0)>performance.now())crate.classList.add('bot-step');}
    tile.classList.toggle('pinged', Object.values(m.signals).some(p => p?.cell === cell));
  }
  lastVisual = structuredClone(m);
}
function renderMission() {
  const view = context?.view, m = view?.mission;
  const active = !!view && socket?.readyState === WebSocket.OPEN && !stopped && !pending;
  const start = el<HTMLButtonElement>('start'); start.hidden = !!m;
  const independent = view?.releaseId === 'sys-04-free-move' || view?.releaseId === 'sys-05-shared-passage' || view?.releaseId === 'sys-06-crate';
  start.hidden = !!m || independent;
  start.disabled = !active || view?.room.phase !== 'waiting' || view.room.players.length !== 2 || !view.room.players.every(p => p.connected) || !!view.room.startAgreements[view.self.role];
  start.textContent = view?.room.startAgreements[view.self.role] ? 'Waiting for partner to start' : 'Ready to start';
  el('start-agreements').hidden = !!m || independent;
  el('start-agreements').textContent = view ? `A: ${view.room.startAgreements.A ? 'ready' : 'not ready'} · B: ${view.room.startAgreements.B ? 'ready' : 'not ready'}` : '';
  el('game').hidden = !m;
  if (!m || !view) return;
  const role = view.self.role, partner = role === 'A' ? 'B' : 'A';
  const planning = active && view.room.phase === 'planning';
  const restart = view.restart, requester = restart.requestedBy;
  el('restart-panel').hidden = !independent || view.room.phase !== 'planning';
  el('restart-status').textContent = requester === null ? 'Restart only this room. Both players must agree.'
    : requester === role ? 'Restart requested. Your partner must agree. You can keep playing or cancel.'
    : `Player ${requester} wants to restart this room. Agree to reset the robots, crate and progress, or decline.`;
  el('restart-panel').classList.toggle('restart-pending', requester !== null);
  el<HTMLButtonElement>('restart-room').disabled = !planning || requester === role;
  el('restart-room').textContent = requester === null ? 'Request restart' : requester === role ? 'Waiting for partner' : 'Agree & restart';
  el('cancel-restart').hidden = requester === null;
  el<HTMLButtonElement>('cancel-restart').disabled = !planning;
  el('cancel-restart').textContent = requester === role ? 'Cancel request' : 'Keep playing';
  const foundry = !!m.foundry;
  el('j1-instructions').hidden = foundry; el('j1-maps').hidden = foundry; el('j1-legend').hidden = foundry;
  el('foundry-instructions').hidden = !foundry; el('foundry-map').hidden = !foundry;
  const crateTargetLabel = m.foundry?.crate ? `${m.foundry.gates.some(g=>g.relay===m.foundry!.crate!.target)?'Relay':'Dock'} ${m.foundry.crate.target}` : '';
  el('objective').textContent = m.foundry?.crate ? m.foundry.crate.cell === m.foundry.crate.target ? '✓ Crate parked. Keep it here; reach both robot exits.' : `Park the crate on ${crateTargetLabel}, then reach both exits.` : foundry ? 'Power the path. Reach both exits together.' : 'Bring both robots to their own exits together. You can leave your exit to make room.';
  if(m.foundry?.conveyor && m.foundry.crate?.cell!==m.foundry.crate?.target)el('objective').textContent=`Hold Switch ${m.foundry.conveyor.relay}. Clear the belt → Dock ${m.foundry.crate!.target}.`;
  const unpoweredDoor = m.foundry?.gates.find(g => !g.open && g.cell === m.positions[role]);
  if (unpoweredDoor && !m.result) el('objective').textContent = `Gate ${unpoweredDoor.cell}: you can leave onto a clear adjacent tile${pullMode ? ' with Pull OFF' : ''}. Power Relay ${unpoweredDoor.relay} to return.`;
  el('mission-title').textContent = m.title;
  el('progress').textContent = independent ? `ROOM ${String(m.foundry!.stage).padStart(2,'0')} / ${String(view.campaign.levels.length).padStart(2,'0')} · ${m.turnsResolved} moves` : foundry ? `Turn ${m.turn} · ${m.turnsResolved} turns completed · No turn limit` : `Turn ${m.turn} / 8 · Resolved ${m.turnsResolved} · Strikes ${m.strikes} / 3`;
  el('move-heading').textContent = independent ? 'Move your robot' : 'Propose your move';
  el('move-help').hidden = !independent;
  for (const id of ['shared-plan', 'plan-warning', 'readiness']) el(id).hidden = independent;
  if (foundry) renderFoundry(m, role, planning);
  el('cargo-controls').hidden = !m.foundry?.crate;
  el<HTMLButtonElement>('pull-mode').disabled = !planning;
  el('pull-mode').hidden=!!m.foundry?.conveyor;
  el('pull-mode').setAttribute('aria-pressed',String(pullMode));
  el('pull-mode').textContent = pullMode?'Pull mode · step away':'Move / Push · switch to Pull';
  el('cargo-help').textContent = m.foundry?.crate ? `Walk into C to push. Pull: step away with C behind you. ${m.foundry.crate.cell===m.foundry.crate.target?'✓':'○'} Crate on ${crateTargetLabel} · ${m.positions.A===m.exits.A?'✓':'○'} A exit · ${m.positions.B===m.exits.B?'✓':'○'} B exit` : '';
  if(m.foundry?.conveyor)el('cargo-help').textContent=`Switch ${m.foundry.conveyor.relay} runs the blue conveyor. Tile 13 is its corner. Hold the switch and clear robots from the route; no pushing needed. ${m.foundry.crate!.cell===m.foundry.crate!.target?'✓':'○'} Crate dock · ${m.positions.A===m.exits.A?'✓':'○'} A exit · ${m.positions.B===m.exits.B?'✓':'○'} B exit`;
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
  el('j1-signals').hidden = foundry; el('j1-signals').textContent = el('signals').textContent;
  for (const direction of moves) {
    const target = destination(direction, m.positions[role], m);
    const button = el<HTMLButtonElement>(`move-${direction}`);
    button.hidden = independent && direction === 'wait';
    const known = target === null ? undefined : m.ownKnownCells[target];
    button.disabled = !planning || target === null;
    const gate = m.foundry?.gates.find(g => g.cell === target);
    const fullLabel = `${direction === 'wait' ? 'Wait' : direction[0]!.toUpperCase() + direction.slice(1)}${target === null ? ' (blocked)' : ` ${target}${foundry ? gate && !gate.open ? ' · Closed gate' : '' : !known ? ' · Unverified' : known.safety === 'Danger' ? ' · Danger' : ''}`}`;
    button.textContent = independent ? ({up:'↑',left:'←',right:'→',down:'↓',wait:'·'})[direction] : fullLabel;
    button.setAttribute('aria-label', fullLabel); button.title = fullLabel;
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
  el('menu-feedback').textContent = m.explanations.join(' ');
  el('resolution').classList.toggle('feedback-blocked', !!m.foundry && m.explanations.some(t => /closed|overlap|block|cannot|Pull needs/.test(t)));
  if(foundry) renderTeamSignals(m,role,planning);
  el('result').hidden = !m.result;
  el('result-title').textContent = m.result === 'success' ? foundry ? 'Factory restored. You made it together!' : 'Rescued together' : m.result === 'strikes' ? 'Mission ended: three strikes' : 'Mission ended: turn limit';
  el('result-stats').textContent = independent ? `Completed in ${m.turnsResolved} team moves. Both robots are at their exits.` : foundry ? `Completed in ${m.turnsResolved} turns. Both robots are at their exits.` : `Turns used: ${m.turnsResolved} / 8 · Strikes: ${m.strikes} / 3`;
  el<HTMLButtonElement>('practice').disabled = !active || view.room.phase !== 'terminal' || m.retryAgreements[role];
  el('next-room').hidden = !m.foundry?.nextTitle || m.result !== 'success';
  el<HTMLButtonElement>('next-room').disabled = !active || view.room.phase !== 'terminal' || m.foundry?.choices[role] === 'next';
  el('next-room').textContent = `Next room: ${m.foundry?.nextTitle ?? ''}`;
  el('result-leave').hidden = !foundry || m.result !== 'success' || !!m.foundry?.nextTitle;
  el<HTMLButtonElement>('result-leave').disabled = exitRequested;
  el('result-leave').textContent = exitRequested ? 'Leaving when connected…' : 'Leave room';
  el('retry-agreements').textContent = m.foundry ? (['A', 'B'] as const).map(r => `${r}: ${m.foundry!.choices[r] === 'next' ? 'Next room' : m.foundry!.choices[r] === 'retry' ? 'Practice again' : 'not chosen'}`).join(' · ') + '. Both players must choose the same option. You can change your choice.'
    : `Practice again: A ${m.retryAgreements.A ? 'agreed' : 'not yet'} · B ${m.retryAgreements.B ? 'agreed' : 'not yet'}`;
  if (foundry && m.result === 'success' && !m.foundry?.nextTitle) el('retry-agreements').textContent = m.retryAgreements.A || m.retryAgreements.B
    ? 'Waiting for both players to replay. You can leave at any time.' : 'Replay together, or leave the room.';
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
    || exitRequested
    || el<HTMLDialogElement>('tutorial').open || el<HTMLDialogElement>('game-menu').open
    || (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable="true"]'))) return;
  if(event.key.toLowerCase()==='f' && m.foundry.crate) {
    event.preventDefault(); if(!event.repeat && !pending && context?.view?.room.phase==='planning' && socket?.readyState===WebSocket.OPEN && !stopped) { togglePull(); } return;
  }
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
for (const [id, action] of [['restart-room','restartAgreement'],['cancel-restart','cancelRestart']] as const) {
  el(id).onclick = () => {
    const view = context?.view;
    if (view?.mission) sendAction({action,missionId:view.mission.id,restartRevision:view.restart.revision});
  };
}
el('practice').onclick = () => { if (context?.view?.mission) sendAction({ action: 'retryAgreement', missionId: context.view.mission.id }); };
el('next-room').onclick = () => { if (context?.view?.mission) sendAction({ action: 'nextAgreement', missionId: context.view.mission.id }); };
el('pull-mode').onclick = () => { togglePull(); };
el('mode-indicator').onclick = () => { togglePull(); };
el('level-agree').onclick = () => {const v=context?.view;if(v?.mission && v.campaign.target!==null)sendAction({action:'selectLevel',missionId:v.mission.id,levelRevision:v.campaign.revision,stage:v.campaign.target});};
el('level-cancel').onclick = () => {const v=context?.view;if(v?.mission)sendAction({action:'cancelLevel',missionId:v.mission.id,levelRevision:v.campaign.revision});};
const menuSections = ['play','controls','room'] as const;
function selectMenuSection(section: typeof menuSections[number], focus=false) {
  for (const name of menuSections) {
    const selected=name===section,tab=el<HTMLButtonElement>(`tab-${name}`);
    tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;el(`panel-${name}`).hidden=!selected;
    if(selected && focus)tab.focus();
  }
  document.querySelector<HTMLElement>('.menu-body')!.scrollTop=0;
}
for(const [index,name] of menuSections.entries()) {
  el(`tab-${name}`).onclick=()=>selectMenuSection(name);
  el(`tab-${name}`).onkeydown=event=>{
    const next=event.key==='ArrowRight'?(index+1)%3:event.key==='ArrowLeft'?(index+2)%3:event.key==='Home'?0:event.key==='End'?2:undefined;
    if(next!==undefined){event.preventDefault();selectMenuSection(menuSections[next]!,true);}
  };
}
el('game-menu-open').onclick = el('restart-alert').onclick = () => {
  markingTile=false; closeTeamPanel();
  selectMenuSection('play'); el<HTMLDialogElement>('game-menu').showModal();
};
el('game-menu-close').onclick = () => el<HTMLDialogElement>('game-menu').close();
el('sound-toggle').onclick=()=>{audio.toggle();render();};
el('team-open').onclick=()=>{
  const panel=el('team-panel'); panel.hidden=!panel.hidden;
  el('team-open').setAttribute('aria-expanded',String(!panel.hidden));
  const gate=context?.view?.mission?.foundry?.gates.find(g=>g.cell===inspectedCell||g.relay===inspectedCell);
  if(gate) el<HTMLSelectElement>('team-gate').value=String(gate.cell);
};
el('team-close').onclick=()=>{markingTile=false;closeTeamPanel();render();};
el('team-power').onclick=()=>sendTeamSignal('needPower',Number(el<HTMLSelectElement>('team-gate').value));
el('team-hold').onclick=()=>sendTeamSignal('hold',context!.view!.mission!.positions[context!.view!.self.role]);
el('team-ack').onclick=()=>sendTeamSignal('ack',context!.view!.mission!.positions[context!.view!.self.role]);
el('team-point').onclick=()=>{markingTile=!markingTile;closeTeamPanel();render();};
window.addEventListener('keydown',event=>{if(event.key==='Escape'){markingTile=false;closeTeamPanel();render();}});
window.addEventListener('resize',()=>{if(context?.view?.mission?.foundry) render();});
el('menu-resume').onclick = () => el<HTMLDialogElement>('game-menu').close();
el('hide-controls').onclick = () => { hideTeachingArrows(); render(); };
el('replay-tutorial').onclick = () => { el<HTMLDialogElement>('game-menu').close(); showLesson(context?.view?.mission?.foundry?.conveyor ? 'conveyor' : context?.view?.mission?.foundry?.crate ? 'push' : 'movement'); };
el('tutorial-next').onclick = () => showLesson(tutorialKind === 'push' ? 'pull' : 'push');
el('crate-coach-dismiss').onclick = () => { crateTip = ''; render(); };
el('tutorial-dismiss').onclick = () => {
  if (tutorialKind === 'movement' || tutorialKind === 'conveyor') learn(tutorialKind);
  else coach(tutorialKind === 'push' ? 'Walk into the crate to push. Its matching dock says “Park crate here”.' : 'Crate on your left? Pull RIGHT. Turn Pull OFF (F or the button) to walk UP, DOWN or toward the crate.');
  el<HTMLDialogElement>('tutorial').close(); render();
};
el<HTMLDialogElement>('tutorial').addEventListener('cancel', event => { event.preventDefault(); el('tutorial-dismiss').click(); });
el('create').onclick = () => { void admit('/api/rooms'); };
el<HTMLFormElement>('join-form').onsubmit = event => { event.preventDefault(); void admit('/api/rooms/join', el<HTMLInputElement>('code').value.trim().toUpperCase()); };
el('takeover').onclick = () => { void admit('/api/controller/takeover'); };
el('reconnect').onclick = () => { stopped = false; connect(); };
el('retry').onclick = () => { closeSocket(); void bootstrap(); };
function requestLeave() {
  exitRequested=true;
  if(socket?.readyState!==WebSocket.OPEN) { status('Leave requested. Reconnect this seat to finish leaving.'); connect(); }
  render();
}
el('leave').onclick = el('result-leave').onclick = requestLeave;
el('copy').onclick = async () => {
  try { await navigator.clipboard.writeText(context?.view?.room.code ?? ''); status('Room code copied.'); }
  catch { status('Copy the room code shown above.'); }
};
window.setInterval(() => {
  const view = context?.view;
  if (view?.room.phase === 'paused' && !stopped) el('timer').textContent = `Room paused. Reconnection window: ${Math.ceil(Math.max(0, (view.timers.recoveryRemainingMs ?? 0) - (performance.now() - receivedAt)) / 1000)} seconds.`;
}, 1000);
void bootstrap();
