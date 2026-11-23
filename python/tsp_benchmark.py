"""
Comprehensive Benchmark & Comparison Suite for TSP Solvers
===========================================================
Compares:
1. Branch and Bound (Exact / Optimal)
2. Christofides-Serdyukov Algorithm (1.5-Approximation)
3. 2-Approximation Algorithm (MST Preorder)
4. Nearest Neighbor (Greedy Baseline)
5. Christofides + 2-Opt Local Search

Evaluates:
- Execution Time (ms)
- Total Route Cost
- Optimality Gap (%) = (Cost - OPT) / OPT * 100%
- Approximation Ratio = Cost / OPT
"""

import math
import random
import time
import json
from typing import List, Tuple, Dict, Any

from tsp_branch_and_bound import solve_tsp_branch_and_bound, calculate_euclidean_matrix
from tsp_approximations import (
    solve_tsp_mst_2_approximation,
    solve_tsp_christofides,
    solve_tsp_nearest_neighbor,
    two_opt_optimize,
    solve_tsp_simulated_annealing,
    prim_mst
)


def generate_random_cities(n: int, width: float = 1000.0, height: float = 1000.0, seed: int = 42) -> List[Tuple[float, float]]:
    """Generates reproducible 2D city coordinates on a plane."""
    rng = random.Random(seed)
    return [(round(rng.uniform(50, width - 50), 2), round(rng.uniform(50, height - 50), 2)) for _ in range(n)]


def run_single_comparison(coords: List[Tuple[float, float]], run_exact: bool = True) -> Dict[str, Any]:
    """Runs all algorithms on the given coordinates and gathers performance metrics."""
    n = len(coords)
    matrix = calculate_euclidean_matrix(coords)

    results: Dict[str, Any] = {'n': n, 'algorithms': {}}

    opt_cost: float = 0.0

    # 1. Branch and Bound (Exact)
    if run_exact and n <= 16:
        bb_res = solve_tsp_branch_and_bound(matrix, time_limit_sec=20.0)
        results['algorithms']['Branch & Bound'] = bb_res
        opt_cost = bb_res['cost']
    else:
        # Compute MST lower bound for estimating gap on larger instances: OPT >= cost(MST)
        mst_edges = prim_mst(matrix)
        mst_cost = sum(w for _, _, w in mst_edges)
        results['algorithms']['Branch & Bound'] = {
            'algorithm': 'Branch and Bound (Skipped - N > 16)',
            'tour': [],
            'cost': None,
            'time_ms': None,
            'mst_lower_bound': round(mst_cost, 4),
            'note': 'Exponential explosion O(N!) - exact solver skipped for N > 16'
        }
        opt_cost = mst_cost  # Used as theoretical lower bound

    # 2. Christofides Algorithm (1.5-Approximation)
    chris_res = solve_tsp_christofides(matrix)
    results['algorithms']['Christofides (1.5-Approx)'] = chris_res

    # 3. 2-Approximation Algorithm (MST Preorder)
    mst_res = solve_tsp_mst_2_approximation(matrix)
    results['algorithms']['2-Approximation (MST)'] = mst_res

    # 4. Nearest Neighbor
    nn_res = solve_tsp_nearest_neighbor(matrix)
    results['algorithms']['Nearest Neighbor'] = nn_res

    # 5. Christofides + 2-Opt Post Optimization
    two_opt_res = two_opt_optimize(chris_res['tour'], matrix)
    two_opt_res['time_ms'] += chris_res['time_ms']
    two_opt_res['algorithm'] = 'Christofides + 2-Opt'
    results['algorithms']['Christofides + 2-Opt'] = two_opt_res

    # 6. Simulated Annealing (for N >= 20)
    if n >= 20:
        sa_res = solve_tsp_simulated_annealing(matrix)
        results['algorithms']['Simulated Annealing'] = sa_res

    # Calculate Optimality Gap and Approximation Ratio
    for algo_name, res in results['algorithms'].items():
        if res.get('cost') is not None and opt_cost > 0:
            cost = res['cost']
            gap = ((cost - opt_cost) / opt_cost) * 100.0
            ratio = cost / opt_cost
            res['optimality_gap_pct'] = round(gap, 2)
            res['approx_ratio'] = round(ratio, 4)

    return results


def run_benchmark_suite(sizes: List[int] = [4, 6, 8, 10, 12, 14, 16, 20, 30, 50]) -> List[Dict[str, Any]]:
    """Runs tests across multiple problem sizes."""
    print("=" * 80)
    print("TRAVELLING SALESPERSON PROBLEM - BENCHMARK & COMPARISON SUITE")
    print("=" * 80)

    all_data = []

    for size in sizes:
        print(f"\nBenchmarking problem size N = {size} cities...")
        coords = generate_random_cities(size, seed=100 + size)
        res = run_single_comparison(coords, run_exact=(size <= 16))
        all_data.append(res)

        print("-" * 80)
        print(f"{'Algorithm':<30} | {'Cost':<10} | {'Time (ms)':<10} | {'Gap (%)':<10} | {'Ratio':<8}")
        print("-" * 80)

        for name, data in res['algorithms'].items():
            cost_str = f"{data['cost']:.2f}" if data.get('cost') is not None else "N/A"
            time_str = f"{data['time_ms']:.2f}" if data.get('time_ms') is not None else "N/A"
            gap_str = f"{data.get('optimality_gap_pct', 'N/A')}%" if data.get('optimality_gap_pct') is not None else "N/A"
            ratio_str = f"{data.get('approx_ratio', 'N/A')}" if data.get('approx_ratio') is not None else "N/A"

            print(f"{name:<30} | {cost_str:<10} | {time_str:<10} | {gap_str:<10} | {ratio_str:<8}")

    return all_data


if __name__ == '__main__':
    data = run_benchmark_suite()
    with open('benchmark_results.json', 'w') as f:
        json.dump(data, f, indent=2)
    print("\nBenchmark completed and saved to benchmark_results.json!")
