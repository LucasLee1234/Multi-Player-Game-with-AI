"""Bounded full-information audit of the provisional Signal Rescue rules.

This is an analysis tool, not the game implementation or a human playtest.
Run from the project root with Python 3. It writes no files by itself.
"""

from collections import Counter, deque
from itertools import combinations, product
import json

START = (3, 5)
GOALS = (5, 3)
EXTRACTED = 9
TURN_LIMIT = 8


def moves(position):
    if position == EXTRACTED:
        return [EXTRACTED]
    x, y = position % 3, position // 3
    return [position] + [
        ny * 3 + nx
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1))
        if 0 <= nx < 3 and 0 <= ny < 3
    ]


def shortest_safe_solution(hazards):
    """Search legal joint actions without hazard attempts or any strikes.

    Collisions leave both robots in place. Since they make no progress, BFS
    naturally discards them. Goal extraction occurs after collision handling.
    Signals and limited player knowledge are deliberately NOT modeled.
    """
    queue = deque([(START, 0)])
    visited = {START}
    while queue:
        state, depth = queue.popleft()
        if state == (EXTRACTED, EXTRACTED):
            return depth
        if depth == TURN_LIMIT:
            continue
        for targets in product(moves(state[0]), moves(state[1])):
            if any(targets[i] in hazards[i] for i in range(2)):
                continue
            active = EXTRACTED not in state
            collision = active and (
                targets[0] == targets[1] or targets == (state[1], state[0])
            )
            resolved = state if collision else targets
            successor = tuple(
                EXTRACTED if resolved[i] == GOALS[i] else resolved[i]
                for i in range(2)
            )
            if successor not in visited:
                visited.add(successor)
                queue.append((successor, depth + 1))
    return None


def main():
    # Sanity checks exercise clear outcomes independently of generated layouts.
    assert shortest_safe_solution((set(), set())) == 4
    assert shortest_safe_solution(({0, 4, 6}, set())) is None
    assert shortest_safe_solution(({4, 6}, {1, 2})) == 4
    eligible = [cell for cell in range(9) if cell not in START]
    hazard_sets = [set(pair) for pair in combinations(eligible, 2)]
    counts = Counter()
    unsolved = []
    for ha, hb in product(hazard_sets, repeat=2):
        depth = shortest_safe_solution((ha, hb))
        counts[str(depth) if depth is not None else "no_solution_within_8"] += 1
        if depth is None and len(unsolved) < 3:
            unsolved.append({"a_hazards": sorted(ha), "b_hazards": sorted(hb)})
    print(json.dumps({
        "scope": "Full-information, zero-strike routes on a 3x3 board",
        "cell_numbering": "row * 3 + column; top-left is 0",
        "starts": START,
        "goals": GOALS,
        "layouts_checked": len(hazard_sets) ** 2,
        "shortest_safe_turns": dict(sorted(counts.items())),
        "unsolved_examples": unsolved,
        "excluded": ["signal budget", "partial-information strategy", "human enjoyment", "networking"],
        "sanity_checks": "passed: empty board, blocked start, published example",
    }, indent=2))


if __name__ == "__main__":
    main()
