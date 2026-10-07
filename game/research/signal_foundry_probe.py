"""Exhaustive audit of SF-T1 research rules; not the production game engine."""

from collections import deque
from itertools import product
import json

WIDTH = 4
FLOOR = frozenset({0, 1, 2, 3, 8, 9, 10, 11})
START = (0, 8, 0)  # A position, B position, latched-gate bit mask
GOAL = (3, 11)
GATES = {1: 8, 9: 2}  # gate cell -> controlling relay cell
BITS = {1: 1, 9: 2}


def won(state):
    return state[:2] == GOAL


def proposals(position):
    x, y = position % WIDTH, position // WIDTH
    adjacent = ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1))
    return [position] + [
        ny * WIDTH + nx for nx, ny in adjacent
        if 0 <= nx < WIDTH and 0 <= ny < 3 and ny * WIDTH + nx in FLOOR
    ]


def step(state, intent, disabled_gate=None, latch=True):
    if won(state):
        raise ValueError("Terminal state does not accept moves")
    if any(destination not in proposals(position)
           for position, destination in zip(state[:2], intent)):
        raise ValueError("Illegal geometry")
    tentative = []
    for position, destination in zip(state[:2], intent):
        entering_gate = destination != position and destination in GATES
        powered = GATES.get(destination) in state[:2]
        latched = bool(state[2] & BITS.get(destination, 0))
        closed = destination == disabled_gate or not (powered or latched)
        tentative.append(position if entering_gate and closed else destination)
    result = tuple(tentative)
    if result[0] == result[1] or result == (state[1], state[0]):
        result = state[:2]
    mask = state[2]
    if latch:
        for before, after in zip(state[:2], result):
            if after != before and after in GATES:
                mask |= BITS[after]
    return (*result, mask)


def explore(initial, disabled_gate=None, latch=True):
    routes = {initial: []}
    queue = deque([initial])
    transitions = 0
    while queue:
        state = queue.popleft()
        if won(state):
            continue
        for intent in product(*(proposals(position) for position in state[:2])):
            following = step(state, intent, disabled_gate, latch)
            transitions += 1
            if following not in routes:
                routes[following] = routes[state] + [following]
                queue.append(following)
    return routes, transitions


def completion(routes):
    return next((path for state, path in routes.items() if won(state)), None)


def main():
    checks = {}

    def check(name, actual, expected):
        if actual != expected:
            raise AssertionError(f"{name}: {actual!r} != {expected!r}")
        checks[name] = "PASS"

    check("closed gate blocks initial B advance", step(START, (0, 9)), START)
    check("first gate entry latches gate", step(START, (1, 8)), (1, 8, 1))
    check("new relay occupancy takes effect next turn", step((1, 8, 1), (2, 9)), (2, 8, 1))
    check("relay departure and gate entry can coincide", step((2, 8, 1), (3, 9)), (3, 9, 3))
    check("latched gate remains traversable", step((0, 10, 3), (1, 9)), (1, 9, 3))
    check("one exit alone is not terminal", won((3, 9, 3)), False)
    check("joint arrival succeeds", won(step((3, 10, 3), (3, 11))), True)
    for name, state, intent in (
        ("wall move rejected", START, (4, 8)),
        ("nonadjacent move rejected", START, (2, 8)),
        ("terminal move rejected", (3, 11, 3), GOAL),
    ):
        try:
            step(state, intent)
        except ValueError:
            checks[name] = "PASS"
        else:
            raise AssertionError(name)

    routes, transitions = explore(START)
    recovery = {state: completion(explore(state)[0]) for state in routes}
    check("every reachable state can complete", all(path is not None for path in recovery.values()), True)
    route = completion(routes)
    check("shortest completion uses five turns", len(route), 5)
    for gate in GATES:
        check(f"permanently disabling gate {gate} prevents completion",
              completion(explore(START, gate)[0]) is not None, False)
    witness = [START, (1, 8, 1), (2, 8, 1), (2, 9, 3), (2, 10, 3), (3, 11, 3)]
    for before, after in zip(witness, witness[1:]):
        check(f"witness {before} to {after}", step(before, after[:2]), after)
    baseline_witness = [START, (1, 8, 0), (2, 8, 0), (1, 9, 0), (0, 10, 0)]
    for before, after in zip(baseline_witness, baseline_witness[1:]):
        check(f"unlatched counterexample {before} to {after}", step(before, after[:2], latch=False), after)
    check("unlatched counterexample cannot recover", completion(explore(baseline_witness[-1], latch=False)[0]), None)
    minimum_moves = 3 + 3
    return {
        "candidate": "SF-T1 research model v2: latch-on-entry gates",
        "scope": "Full-information, two-corridor teaching room; no network or human validation",
        "checks": checks,
        "reachable_states_including_terminal": len(routes),
        "enumerated_transitions_excluding_terminal": transitions,
        "reachable_states_with_completion_route": sum(path is not None for path in recovery.values()),
        "maximum_shortest_recovery_turns": max(len(path) for path in recovery.values()),
        "shortest_completion_turns": len(route),
        "shortest_route": [list(START)] + [list(state) for state in route],
        "rejected_unlatched_softlock_witness": [list(state) for state in baseline_witness],
        "teaching_witness": [list(state) for state in witness],
        "minimum_individual_moves_on_shortest_completion": minimum_moves,
        "wait_slots_on_shortest_completion": 2 * len(route) - minimum_moves,
        "limitations": [
            "Not the TypeScript production engine",
            "Disjoint corridors do not exercise robot collisions or swaps",
            "Recovery assumes unlimited turns and reversible tile movement",
            "Solvability and required actions do not establish enjoyment or equal reasoning",
        ],
    }


if __name__ == "__main__":
    print(json.dumps(main(), indent=2))
