"""Boundary and interaction tests for the proposed gameplay, not networking."""
import unittest
from signal_rescue_rules import OUT, Planning, resolve, safe_route, signal_witness

EMPTY = (set(), set())
SAMPLE = ({4, 6}, {1, 2})


class RulesTests(unittest.TestCase):
    def test_same_cell_collision(self):
        r = resolve((3, 5), (4, 4), EMPTY)
        self.assertEqual(r["positions"], (3, 5))
        self.assertTrue(r["collision"])
        self.assertEqual(r["strikes"], 0)

    def test_swap_blocked(self):
        self.assertEqual(resolve((3, 4), (4, 3), EMPTY)["positions"], (3, 4))

    def test_following_allowed(self):
        self.assertEqual(resolve((3, 4), (4, 5), EMPTY)["positions"], (4, 5))

    def test_hazard_before_collision(self):
        r = resolve((3, 4), (0, 3), ({0}, set()))
        self.assertEqual(r["positions"], (3, 4))
        self.assertEqual(r["strikes"], 1)
        self.assertTrue(r["collision"])

    def test_two_hits_and_strike_limit(self):
        r = resolve((3, 5), (4, 4), ({4}, {4}), strikes=1)
        self.assertEqual(r["strikes"], 3)
        self.assertEqual(r["status"], "failed")

    def test_eighth_turn_success(self):
        r = resolve((2, 6), (5, 3), EMPTY, strikes=2, turn=8)
        self.assertEqual((r["status"], r["score"]), ("won", 80))

    def test_eighth_turn_failure(self):
        self.assertEqual(resolve((3, 5), (3, 5), EMPTY, turn=8)["status"], "failed")

    def test_extraction_with_partner_third_strike(self):
        r = resolve((2, 7), (5, 4), (set(), {4}), strikes=2)
        self.assertEqual(r["positions"], (OUT, 7))
        self.assertEqual(r["status"], "failed")

    def test_illegal_move(self):
        for target in (-1, 2, 9):
            with self.assertRaises(ValueError):
                resolve((3, 5), (target, 5), EMPTY)

    def test_free_truthful_signals_independent_quotas(self):
        p = Planning(SAMPLE)
        self.assertEqual(p.signal(0, 1, p.revision), "danger")
        self.assertEqual(p.signal(1, 0, p.revision), "safe")
        with self.assertRaises(ValueError):
            p.signal(0, 2, p.revision)
        self.assertEqual(signal_witness(SAMPLE, safe_route(SAMPLE))["score"], 100)

    def test_change_invalidates_both_ready_states(self):
        p = Planning(SAMPLE)
        p.ready(0, 0)
        p.propose(1, 8, 0)
        self.assertFalse(p.ready_players)
        with self.assertRaises(ValueError):
            p.ready(1, 0)
        p.ready(0, p.revision)
        p.signal(0, 8, p.revision)
        self.assertFalse(p.ready_players)

    def test_duplicate_ready_and_closed_turn(self):
        p = Planning(EMPTY)
        self.assertFalse(p.ready(0, 0))
        self.assertFalse(p.ready(0, 0))
        self.assertTrue(p.ready(1, 0))
        with self.assertRaises(ValueError):
            p.propose(0, 0, 0)

    def test_extracted_player_navigates_and_confirms(self):
        p = Planning(SAMPLE, (OUT, 6))
        self.assertEqual(p.signal(0, 3, p.revision), "safe")
        with self.assertRaises(ValueError):
            p.signal(1, 0, p.revision)
        self.assertFalse(p.ready(1, p.revision))
        self.assertTrue(p.ready(0, p.revision))

    def test_safe_routes_and_blocked_map(self):
        self.assertEqual(len(safe_route(SAMPLE)), 4)
        self.assertIsNone(safe_route(({0, 4}, {0, 4})))

    def test_documented_recoverable_mistake(self):
        positions, strikes = (3, 5), 0
        for turn, targets in enumerate([(4, 4), (0, 3), (1, OUT),
                                         (2, OUT), (5, OUT)], 1):
            r = resolve(positions, targets, SAMPLE, strikes, turn)
            positions, strikes = r["positions"], r["strikes"]
            if turn == 1:
                self.assertEqual(positions, (3, 4))
                self.assertFalse(r["collision"])
        self.assertEqual((r["status"], r["score"], strikes), ("won", 90, 1))


if __name__ == "__main__":
    unittest.main()
