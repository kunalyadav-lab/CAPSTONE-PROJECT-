"""
Unit Tests for TSP Algorithms
=============================
Tests correctness, optimality, approximation ratios, and Hamiltonian cycle integrity.
"""

import unittest
import itertools
from tsp_branch_and_bound import solve_tsp_branch_and_bound, calculate_euclidean_matrix
from tsp_approximations import (
    solve_tsp_mst_2_approximation,
    solve_tsp_christofides,
    solve_tsp_nearest_neighbor,
    two_opt_optimize,
    compute_tour_cost
)


class TestTSPAlgorithms(unittest.TestCase):

    def setUp(self):
        # 5-city known symmetric Euclidean configuration
        self.cities_5 = [
            (0.0, 0.0),
            (1.0, 0.0),
            (1.0, 1.0),
            (0.0, 1.0),
            (0.5, 0.5)
        ]
        self.matrix_5 = calculate_euclidean_matrix(self.cities_5)

    def is_valid_hamiltonian_cycle(self, tour, n):
        """Verifies tour is a valid Hamiltonian cycle."""
        if len(tour) != n + 1:
            return False
        if tour[0] != tour[-1]:
            return False
        visited = set(tour[:-1])
        return visited == set(range(n))

    def test_branch_and_bound_optimality(self):
        """Brute-force verification of Branch and Bound optimality for N=5."""
        n = 5
        # Brute force search
        best_cost = float('inf')
        for perm in itertools.permutations(range(1, n)):
            candidate = [0] + list(perm) + [0]
            cost = compute_tour_cost(candidate, self.matrix_5)
            if cost < best_cost:
                best_cost = cost

        bb_res = solve_tsp_branch_and_bound(self.matrix_5)
        self.assertTrue(self.is_valid_hamiltonian_cycle(bb_res['tour'], n))
        self.assertAlmostEqual(bb_res['cost'], best_cost, places=2)

    def test_2_approximation_bound(self):
        """Verify that 2-Approximation cost <= 2.0 * OPT."""
        n = 5
        bb_res = solve_tsp_branch_and_bound(self.matrix_5)
        mst_res = solve_tsp_mst_2_approximation(self.matrix_5)

        self.assertTrue(self.is_valid_hamiltonian_cycle(mst_res['tour'], n))
        self.assertLessEqual(mst_res['cost'], 2.0 * bb_res['cost'] + 1e-4)

    def test_christofides_approximation_bound(self):
        """Verify that Christofides cost <= 1.5 * OPT."""
        n = 5
        bb_res = solve_tsp_branch_and_bound(self.matrix_5)
        chris_res = solve_tsp_christofides(self.matrix_5)

        self.assertTrue(self.is_valid_hamiltonian_cycle(chris_res['tour'], n))
        self.assertLessEqual(chris_res['cost'], 1.5 * bb_res['cost'] + 1e-4)

    def test_two_opt_monotonicity(self):
        """Verify that 2-Opt never worsens route cost."""
        nn_res = solve_tsp_nearest_neighbor(self.matrix_5)
        opt_res = two_opt_optimize(nn_res['tour'], self.matrix_5)

        self.assertTrue(self.is_valid_hamiltonian_cycle(opt_res['tour'], 5))
        self.assertLessEqual(opt_res['cost'], nn_res['cost'] + 1e-5)


if __name__ == '__main__':
    unittest.main()
