"""Executable v0.2 design model, not the production server or network protocol."""
from collections import deque
from itertools import product

START = (3, 5)
GOALS = (5, 3)
OUT = 9


def moves(cell):
    if cell == OUT:
        return [OUT]
    x, y = cell % 3, cell // 3
    return [cell] + [b * 3 + a for a, b in
                     ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1))
                     if 0 <= a < 3 and 0 <= b < 3]


def resolve(positions, targets, hazards, strikes=0, turn=1):
    """Hazards, collisions, extraction, then terminal precedence."""
    if any(targets[i] not in moves(positions[i]) for i in range(2)):
        raise ValueError("Illegal move")
    hits = tuple(targets[i] != OUT and targets[i] in hazards[i] for i in range(2))
    next_pos = tuple(positions[i] if hits[i] else targets[i] for i in range(2))
    collision = OUT not in positions and (
        next_pos[0] == next_pos[1] or next_pos == positions[::-1])
    if collision:
        next_pos = positions
    next_pos = tuple(OUT if next_pos[i] == GOALS[i] else next_pos[i] for i in range(2))
    strikes += sum(hits)
    status = ("failed" if strikes >= 3 else "won" if next_pos == (OUT, OUT)
              else "failed" if turn >= 8 else "playing")
    return {"positions": next_pos, "strikes": strikes, "hits": hits,
            "collision": collision, "status": status,
            "score": 100 - 10 * strikes if status == "won" else 0}


class Planning:
    """Single-turn model: revision-bound ready and independent signal quotas."""
    def __init__(self, hazards, positions=START):
        self.hazards = hazards
        self.positions = positions
        self.targets = list(positions)
        self.revision = 0
        self.ready_players = set()
        self.sent = [None, None]
        self.known = [{START[i]: "safe", GOALS[i]: "safe"} for i in range(2)]
        self.closed = False

    def check(self, player, revision):
        if player not in (0, 1) or self.closed or revision != self.revision:
            raise ValueError("Invalid player, closed turn, or stale revision")

    def changed(self):
        self.revision += 1
        self.ready_players.clear()

    def propose(self, player, target, revision):
        self.check(player, revision)
        if target not in moves(self.positions[player]):
            raise ValueError("Illegal move")
        if target != self.targets[player]:
            self.targets[player] = target
            self.changed()

    def signal(self, player, cell, revision):
        self.check(player, revision)
        partner = 1 - player
        if self.positions[partner] == OUT or cell not in range(9):
            raise ValueError("No active recipient or invalid cell")
        if self.sent[player] is not None:
            raise ValueError("Signal already used this turn")
        label = "danger" if cell in self.hazards[partner] else "safe"
        self.sent[player] = (cell, label)
        self.known[partner][cell] = label
        self.changed()
        return label

    def ready(self, player, revision):
        self.check(player, revision)
        self.ready_players.add(player)
        if len(self.ready_players) == 2:
            self.closed = True
        return self.closed


def safe_route(hazards):
    """Full-information BFS; returns an action witness, never a human strategy."""
    queue = deque([(START, [])])
    seen = {START}
    while queue:
        positions, route = queue.popleft()
        if positions == (OUT, OUT):
            return route
        if len(route) == 8:
            continue
        for targets in product(*(moves(p) for p in positions)):
            result = resolve(positions, targets, hazards, turn=len(route) + 1)
            if any(result["hits"]) or result["positions"] in seen:
                continue
            seen.add(result["positions"])
            queue.append((result["positions"], route + [targets]))
    return None


def signal_witness(hazards, route):
    """Replay a supplied route with truthful partner signals before every step.

    This proves channel capacity for that route, not decentralized discovery.
    """
    positions = START
    for turn, targets in enumerate(route, 1):
        plan = Planning(hazards, positions)
        for player in range(2):
            partner = 1 - player
            if positions[partner] != OUT:
                assert plan.signal(player, targets[partner], plan.revision) == "safe"
        for player in range(2):
            plan.propose(player, targets[player], plan.revision)
        assert not plan.ready(0, plan.revision)
        assert plan.ready(1, plan.revision)
        result = resolve(positions, tuple(plan.targets), hazards, turn=turn)
        assert not any(result["hits"])
        positions = result["positions"]
    assert result["status"] == "won"
    return result
