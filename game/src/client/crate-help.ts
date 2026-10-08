import type { MissionView, Role } from '../contracts/lobby.js';

/** A preview only: the server remains authoritative for every move. */
export function crateAction(m: MissionView, role: Role, destination: number, pull: boolean): 'push' | 'pull' | null {
  const b = m.foundry, c = b?.crate;
  if (!b || !c || m.result) return null;
  const from = m.positions[role], partner = m.positions[role === 'A' ? 'B' : 'A'];
  const floor = (n: number) => n >= 0 && n < b.width * b.height && !b.walls.includes(n);
  const adjacent = (a: number, n: number) => floor(n) && Math.abs(a % b.width - n % b.width) + Math.abs(Math.floor(a / b.width) - Math.floor(n / b.width)) === 1;
  const enter = (n: number) => !b.gates.some(g => g.cell === n && !g.open);
  if (!adjacent(from, destination) || !enter(destination) || destination === partner) return null;
  if (pull) return adjacent(from, c.cell) && 2 * from - destination === c.cell && enter(from) ? 'pull' : null;
  const cargo = 2 * c.cell - from;
  return destination === c.cell && adjacent(c.cell, cargo) && enter(cargo) && cargo !== partner ? 'push' : null;
}

export function crateFailure(reason: string): string {
  if (reason.includes('Pull needs')) return 'Stand next to the crate, switch to Pull, then step away from it.';
  if (reason.includes('wall or off')) return 'No space behind the crate. Stand on another side, or use Pull.';
  if (reason.includes('closed')) return 'The gate is closed. Ask your partner to power its relay.';
  if (reason.includes('blocking') || reason.includes('Occupied')) return 'Your partner is in the way. Ask them to make room.';
  return reason.replace(/^[AB]: /, '');
}
