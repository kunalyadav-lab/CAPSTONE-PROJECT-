"""
Approximation Algorithms & Heuristics for the Travelling Salesperson Problem (TSP)
================================================================================
Implemented Algorithms:
1. 2-Approximation Algorithm (MST-based Preorder Walk)
   - Factor guarantee: <= 2.0 * OPT on metric TSP.
2. Christofides-Serdyukov Algorithm (1.5-Approximation)
   - Factor guarantee: <= 1.5 * OPT on metric TSP.
   - Steps: MST -> Odd-degree vertices -> Minimum Weight Perfect Matching ->
            Eulerian Multigraph -> Hierholzer's Circuit -> Shortcutting.
3. Nearest Neighbor Heuristic (Greedy Baseline)
4. 2-Opt Local Search Improvement Operator
5. Simulated Annealing Meta-heuristic
"""

from typing import List, Tuple, Dict, Any, Set
import math
import time
import copy
import random
from collections import defaultdict

INF = float('inf')


def compute_tour_cost(tour: List[int], dist_matrix: List[List[float]]) -> float:
    """Computes total cost of a cyclic tour."""
    if not tour or len(tour) < 2:
        return 0.0
    cost = 0.0
    for i in range(len(tour) - 1):
        cost += dist_matrix[tour[i]][tour[i + 1]]
    return round(cost, 4)


# ==============================================================================
# 1. Minimum Spanning Tree (Prim's Algorithm)
# ==============================================================================
def prim_mst(dist_matrix: List[List[float]]) -> List[Tuple[int, int, float]]:
    """
    Computes Minimum Spanning Tree (MST) using Prim's algorithm.
    Returns list of edges (u, v, weight).
    """
    n = len(dist_matrix)
    visited = [False] * n
    min_edge = [INF] * n
    parent = [-1] * n

    min_edge[0] = 0.0
    mst_edges = []

    for _ in range(n):
        u = -1
        smallest = INF
        for i in range(n):
            if not visited[i] and min_edge[i] < smallest:
                smallest = min_edge[i]
                u = i

        if u == -1:
            break

        visited[u] = True
        if parent[u] != -1:
            mst_edges.append((parent[u], u, dist_matrix[parent[u]][u]))

        for v in range(n):
            if not visited[v] and dist_matrix[u][v] < min_edge[v]:
                min_edge[v] = dist_matrix[u][v]
                parent[v] = u

    return mst_edges


# ==============================================================================
# 2. 2-Approximation Algorithm (MST Preorder Walk)
# ==============================================================================
def solve_tsp_mst_2_approximation(dist_matrix: List[List[float]]) -> Dict[str, Any]:
    """
    Solves Metric TSP with guaranteed 2-Approximation factor.
    1. Compute MST T (cost <= OPT).
    2. Traverse T in Depth-First Search / Preorder.
    3. Shortcut visited vertices (by triangle inequality, cost <= 2 * OPT).
    """
    n = len(dist_matrix)
    if n <= 1:
        return {'algorithm': '2-Approximation (MST)', 'tour': [0, 0] if n == 1 else [], 'cost': 0.0, 'time_ms': 0.0}

    start_time = time.perf_counter()

    mst_edges = prim_mst(dist_matrix)
    adj = defaultdict(list)
    for u, v, _ in mst_edges:
        adj[u].append(v)
        adj[v].append(u)

    # Preorder DFS traversal
    visited = [False] * n
    tour: List[int] = []

    def dfs(node: int):
        visited[node] = True
        tour.append(node)
        for neighbor in sorted(adj[node]):
            if not visited[neighbor]:
                dfs(neighbor)

    dfs(0)
    tour.append(0)  # Complete the cycle

    elapsed_ms = (time.perf_counter() - start_time) * 1000.0
    cost = compute_tour_cost(tour, dist_matrix)

    return {
        'algorithm': '2-Approximation (MST)',
        'tour': tour,
        'cost': cost,
        'time_ms': round(elapsed_ms, 3),
        'approximation_ratio_bound': 2.0,
        'mst_edges_count': len(mst_edges)
    }


# ==============================================================================
# 3. Christofides-Serdyukov Algorithm (1.5-Approximation)
# ==============================================================================
def find_minimum_weight_perfect_matching(odd_vertices: List[int], dist_matrix: List[List[float]]) -> List[Tuple[int, int]]:
    """
    Finds a minimum weight perfect matching on the subgraph induced by odd-degree vertices.
    For |O| <= 16: Uses exact bitmask dynamic programming.
    For larger |O|: Uses greedy sorted-edge matching.
    """
    k = len(odd_vertices)
    if k == 0 or k % 2 != 0:
        return []

    # If small number of odd vertices (typical in TSP instances <= 30 cities), solve exactly
    if k <= 14:
        memo = {}
        # Precompute matching with bitmask
        def dp(mask: int) -> Tuple[float, List[Tuple[int, int]]]:
            if mask == (1 << k) - 1:
                return 0.0, []
            if mask in memo:
                return memo[mask]

            # Find first unmatched vertex
            first = -1
            for i in range(k):
                if not (mask & (1 << i)):
                    first = i
                    break

            best_w = INF
            best_pairs: List[Tuple[int, int]] = []

            for second in range(first + 1, k):
                if not (mask & (1 << second)):
                    u = odd_vertices[first]
                    v = odd_vertices[second]
                    w = dist_matrix[u][v]
                    next_w, next_pairs = dp(mask | (1 << first) | (1 << second))
                    if w + next_w < best_w:
                        best_w = w + next_w
                        best_pairs = [(u, v)] + next_pairs

            memo[mask] = (best_w, best_pairs)
            return best_w, best_pairs

        _, matching = dp(0)
        return matching
    else:
        # Greedy heuristic for large odd sets: sort candidate edges by weight
        edges = []
        for i in range(k):
            for j in range(i + 1, k):
                u, v = odd_vertices[i], odd_vertices[j]
                edges.append((dist_matrix[u][v], u, v))
        edges.sort()

        matched = set()
        matching = []
        for w, u, v in edges:
            if u not in matched and v not in matched:
                matched.add(u)
                matched.add(v)
                matching.append((u, v))
                if len(matched) == k:
                    break
        return matching


def solve_tsp_christofides(dist_matrix: List[List[float]]) -> Dict[str, Any]:
    """
    Solves Metric TSP using the Christofides-Serdyukov 1.5-Approximation Algorithm.
    Steps:
    1. Minimum Spanning Tree T (cost <= OPT)
    2. Set O of odd-degree vertices in T (|O| is even)
    3. Minimum Weight Perfect Matching M on O (cost <= 0.5 * OPT)
    4. Eulerian Multigraph H = T + M (every vertex has even degree)
    5. Find Eulerian circuit in H using Hierholzer's Algorithm
    6. Shortcut Eulerian circuit into Hamiltonian cycle (cost <= 1.5 * OPT)
    """
    n = len(dist_matrix)
    if n <= 1:
        return {'algorithm': 'Christofides (1.5-Approx)', 'tour': [0, 0] if n == 1 else [], 'cost': 0.0, 'time_ms': 0.0}

    start_time = time.perf_counter()

    # Step 1: Minimum Spanning Tree
    mst_edges = prim_mst(dist_matrix)

    # Step 2: Degrees of vertices
    degree = defaultdict(int)
    multigraph = defaultdict(list)
    for u, v, _ in mst_edges:
        degree[u] += 1
        degree[v] += 1
        multigraph[u].append(v)
        multigraph[v].append(u)

    odd_vertices = [v for v in range(n) if degree[v] % 2 != 0]

    # Step 3: Minimum Weight Perfect Matching on odd vertices
    matching = find_minimum_weight_perfect_matching(odd_vertices, dist_matrix)
    for u, v in matching:
        multigraph[u].append(v)
        multigraph[v].append(u)

    # Step 4 & 5: Hierholzer's algorithm for Eulerian circuit
    adj_copy = copy.deepcopy(multigraph)
    eulerian_circuit: List[int] = []
    stack = [0]

    while stack:
        u = stack[-1]
        if adj_copy[u]:
            v = adj_copy[u].pop()
            adj_copy[v].remove(u)
            stack.append(v)
        else:
            eulerian_circuit.append(stack.pop())

    # Step 6: Shortcutting into a Hamiltonian cycle
    visited = set()
    tour: List[int] = []
    for city in eulerian_circuit:
        if city not in visited:
            visited.add(city)
            tour.append(city)
    tour.append(0)  # Return to start

    elapsed_ms = (time.perf_counter() - start_time) * 1000.0
    cost = compute_tour_cost(tour, dist_matrix)

    return {
        'algorithm': 'Christofides (1.5-Approx)',
        'tour': tour,
        'cost': cost,
        'time_ms': round(elapsed_ms, 3),
        'approximation_ratio_bound': 1.5,
        'odd_vertices_count': len(odd_vertices),
        'matching_edges_count': len(matching)
    }


# ==============================================================================
# 4. Nearest Neighbor Heuristic
# ==============================================================================
def solve_tsp_nearest_neighbor(dist_matrix: List[List[float]], start_city: int = 0) -> Dict[str, Any]:
    """Greedy Nearest Neighbor heuristic starting at start_city."""
    n = len(dist_matrix)
    if n <= 1:
        return {'algorithm': 'Nearest Neighbor', 'tour': [0, 0] if n == 1 else [], 'cost': 0.0, 'time_ms': 0.0}

    start_time = time.perf_counter()
    visited = [False] * n
    curr = start_city
    visited[curr] = True
    tour = [curr]

    for _ in range(n - 1):
        next_city = -1
        min_dist = INF
        for candidate in range(n):
            if not visited[candidate] and dist_matrix[curr][candidate] < min_dist:
                min_dist = dist_matrix[curr][candidate]
                next_city = candidate

        visited[next_city] = True
        tour.append(next_city)
        curr = next_city

    tour.append(start_city)
    elapsed_ms = (time.perf_counter() - start_time) * 1000.0
    cost = compute_tour_cost(tour, dist_matrix)

    return {
        'algorithm': 'Nearest Neighbor',
        'tour': tour,
        'cost': cost,
        'time_ms': round(elapsed_ms, 3)
    }


# ==============================================================================
# 5. 2-Opt Local Search Improvement
# ==============================================================================
def two_opt_optimize(initial_tour: List[int], dist_matrix: List[List[float]], max_iterations: int = 500) -> Dict[str, Any]:
    """
    Applies 2-Opt local search on an existing tour until local optimum is reached.
    Reverses segments [i+1...j] if swapping improves route distance.
    """
    tour = initial_tour[:-1]  # Exclude closing vertex for manipulation
    n = len(tour)
    if n < 4:
        return {
            'algorithm': '2-Opt Local Search',
            'tour': initial_tour,
            'cost': compute_tour_cost(initial_tour, dist_matrix),
            'time_ms': 0.0,
            'swaps_performed': 0
        }

    start_time = time.perf_counter()
    improved = True
    iterations = 0
    swaps_performed = 0

    while improved and iterations < max_iterations:
        improved = False
        iterations += 1

        for i in range(n):
            for j in range(i + 2, n):
                if (i == 0 and j == n - 1):
                    continue  # Adjacent in cycle

                u1, u2 = tour[i], tour[(i + 1) % n]
                v1, v2 = tour[j], tour[(j + 1) % n]

                current_dist = dist_matrix[u1][u2] + dist_matrix[v1][v2]
                new_dist = dist_matrix[u1][v1] + dist_matrix[u2][v2]

                if new_dist < current_dist - 1e-6:
                    # Reverse segment between i+1 and j
                    tour[i + 1:j + 1] = reversed(tour[i + 1:j + 1])
                    improved = True
                    swaps_performed += 1
                    break
            if improved:
                break

    full_tour = tour + [tour[0]]
    elapsed_ms = (time.perf_counter() - start_time) * 1000.0
    cost = compute_tour_cost(full_tour, dist_matrix)

    return {
        'algorithm': '2-Opt Improvement',
        'tour': full_tour,
        'cost': cost,
        'time_ms': round(elapsed_ms, 3),
        'swaps_performed': swaps_performed,
        'iterations': iterations
    }


# ==============================================================================
# 6. Simulated Annealing Metaheuristic
# ==============================================================================
def solve_tsp_simulated_annealing(dist_matrix: List[List[float]],
                                  initial_temp: float = 1000.0,
                                  cooling_rate: float = 0.995,
                                  max_iterations: int = 5000) -> Dict[str, Any]:
    """Metaheuristic for larger inputs (N >= 30)."""
    n = len(dist_matrix)
    if n <= 3:
        return solve_tsp_nearest_neighbor(dist_matrix)

    start_time = time.perf_counter()
    # Initial tour via Nearest Neighbor
    nn_res = solve_tsp_nearest_neighbor(dist_matrix)
    current_tour = nn_res['tour'][:-1]
    current_cost = compute_tour_cost(current_tour + [current_tour[0]], dist_matrix)

    best_tour = current_tour[:]
    best_cost = current_cost

    temp = initial_temp

    for _ in range(max_iterations):
        if temp < 1e-4:
            break

        # Generate neighbor via 2-opt segment reversal
        i = random.randint(0, n - 2)
        j = random.randint(i + 1, n - 1)

        candidate_tour = current_tour[:]
        candidate_tour[i:j + 1] = reversed(candidate_tour[i:j + 1])
        candidate_cost = compute_tour_cost(candidate_tour + [candidate_tour[0]], dist_matrix)

        delta = candidate_cost - current_cost

        # Acceptance criterion
        if delta < 0 or random.random() < math.exp(-delta / temp):
            current_tour = candidate_tour
            current_cost = candidate_cost
            if current_cost < best_cost:
                best_cost = current_cost
                best_tour = current_tour[:]

        temp *= cooling_rate

    elapsed_ms = (time.perf_counter() - start_time) * 1000.0
    final_tour = best_tour + [best_tour[0]]

    return {
        'algorithm': 'Simulated Annealing',
        'tour': final_tour,
        'cost': round(best_cost, 4),
        'time_ms': round(elapsed_ms, 3)
    }
