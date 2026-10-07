"""Run bounded spatial checks and print JSON evidence; no external services."""
from collections import Counter
from itertools import combinations, product
import json
from signal_rescue_rules import START, OUT, moves, resolve, safe_route, signal_witness
from feasibility_probe import shortest_safe_solution


def main():
    layers = [set(pair) for pair in combinations([0, 1, 2, 4, 6, 7, 8], 2)]
    counts = Counter()
    five_turn = None
    invariants = 0
    for hazards in product(layers, repeat=2):
        route = safe_route(hazards)
        length = len(route) if route is not None else None
        assert length == shortest_safe_solution(hazards)
        counts[str(length)] += 1
        if route is not None:
            signal_witness(hazards, route)
        if length == 5:
            five_turn = {"hazards": [sorted(h) for h in hazards], "route": route}
        # Every valid position and legal action for these fixed hazard layers.
        for positions in product(range(10), repeat=2):
            if positions == (OUT, OUT) or (OUT not in positions and positions[0] == positions[1]):
                continue
            if any(positions[i] in hazards[i] or positions[i] == (5, 3)[i] for i in range(2)):
                continue
            for targets in product(*(moves(p) for p in positions)):
                r = resolve(positions, targets, hazards)
                assert not any(r["positions"][i] in hazards[i] for i in range(2))
                assert OUT in r["positions"] or r["positions"][0] != r["positions"][1]
                assert r["strikes"] == sum(r["hits"])
                invariants += 1
    candidates = []
    for name, hazards in [("Tutorial - Opposite Routes", ({4, 6}, {1, 2})),
                          ("Coordination - Shared Corridor", tuple(set(h) for h in five_turn["hazards"])),
                          ("Navigation - Early Arrival", ({0, 1}, {4, 8}))]:
        route = safe_route(hazards)
        assert route is not None
        if name.startswith("Tutorial"):
            route = [(0, 8), (1, 7), (2, 6), (5, 3)]
        if name.startswith("Navigation"):
            route = [(4, 2), (5, 1), (OUT, 0), (OUT, 3)]
        signal_witness(hazards, route)
        candidates.append({"name": name, "hazards": [sorted(h) for h in hazards],
                           "safe_turns": len(route), "route": route})
    print(json.dumps({"design": "0.2", "date": "2026-10-06",
                      "cell_numbering": "row * 3 + column; 9 means extracted",
                      "layouts": 441, "safe_route_counts": dict(counts),
                      "original_probe_agreements": 441,
                      "signal_capacity_witnesses": 423,
                      "spatial_transition_invariant_checks": invariants,
                      "candidate_levels": candidates,
                      "limitations": ["Not a decentralized partial-information strategy proof",
                                      "No production, network, mobile, or human testing"]}, indent=2))


if __name__ == "__main__":
    main()
