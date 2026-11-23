"""
Branch and Bound TSP Solver (Reduced Cost Matrix Method)
======================================================
Finds the exact optimal solution for the Travelling Salesperson Problem (TSP).

Technique:
- State Space Tree exploration with Best-First Search (Min-Heap priority queue).
- Lower Bounding via Matrix Reduction (Little et al. formulation):
  1. Row reduction: Subtract row minimums from each row, adding minimums to bound.
  2. Column reduction: Subtract col minimums from each col, adding minimums to bound.
- Branching:
  Transitioning from city `u` to unvisited city `v`:
  - Invalidate row `u` and col `v` (set to infinity).
  - Invalidate cell `(v, start_city)` to avoid premature sub-tours.
  - Compute additional reduction cost and branch.
- Pruning:
  Nodes with lower bound >= best known upper bound are strictly pruned.
"""

from typing import List, Tuple, Dict, Any, Optional
import math
import heapq
import time
import copy

INF = float('inf')


class StateNode:
    """Represents a state in the Branch and Bound search tree."""
    def __init__(self,
                 matrix: List[List[float]],
                 bound: float,
                 city: int,
                 level: int,
                 path: List[int],
                 visited_mask: int):
        self.matrix = matrix
        self.bound = bound
        self.city = city
        self.level = level
        self.path = path
        self.visited_mask = visited_mask

    def __lt__(self, other: 'StateNode') -> bool:
        # Best-First Search: prioritize lower bound, then deeper level
        if self.bound == other.bound:
            return self.level > other.level
        return self.bound < other.bound


def reduce_matrix(matrix: List[List[float]], n: int) -> Tuple[List[List[float]], float]:
    """
    Performs row and column reduction on a cost matrix.
    Returns the reduced matrix and the reduction cost (lower bound addition).
    """
    reduced = [row[:] for row in matrix]
    reduction_cost = 0.0

    # 1. Row reduction
    for r in range(n):
        row_min = INF
        for c in range(n):
            if reduced[r][c] < row_min:
                row_min = reduced[r][c]
        if row_min != INF and row_min > 0:
            reduction_cost += row_min
            for c in range(n):
                if reduced[r][c] != INF:
                    reduced[r][c] -= row_min

    # 2. Column reduction
    for c in range(n):
        col_min = INF
        for r in range(n):
            if reduced[r][c] < col_min:
                col_min = reduced[r][c]
        if col_min != INF and col_min > 0:
            reduction_cost += col_min
            for r in range(n):
                if reduced[r][c] != INF:
                    reduced[r][c] -= col_min

    return reduced, reduction_cost


def solve_tsp_branch_and_bound(dist_matrix: List[List[float]],
                               time_limit_sec: float = 30.0) -> Dict[str, Any]:
    """
    Solves TSP to exact optimality using Branch and Bound with Reduced Cost Matrix.
    
    Args:
        dist_matrix: NxN 2D matrix of pairwise distances.
        time_limit_sec: Maximum execution time before aborting.
        
    Returns:
        Dictionary containing optimal tour, tour cost, execution time, nodes explored, etc.
    """
    n = len(dist_matrix)
    if n <= 1:
        return {
            'tour': [0, 0] if n == 1 else [],
            'cost': 0.0,
            'time_ms': 0.0,
            'nodes_explored': 0,
            'nodes_pruned': 0,
            'optimal': True
        }

    start_time = time.perf_counter()

    # Initial reduction for the root node (start at city 0)
    initial_matrix = [[dist_matrix[i][j] if i != j else INF for j in range(n)] for i in range(n)]
    root_matrix, root_bound = reduce_matrix(initial_matrix, n)

    root = StateNode(
        matrix=root_matrix,
        bound=root_bound,
        city=0,
        level=1,
        path=[0],
        visited_mask=1  # bit 0 set
    )

    pq = [root]
    best_cost = INF
    best_tour: List[int] = []

    nodes_explored = 0
    nodes_pruned = 0
    timed_out = False

    while pq:
        # Check time limit periodically
        if (nodes_explored % 1000 == 0) and (time.perf_counter() - start_time > time_limit_sec):
            timed_out = True
            break

        current: StateNode = heapq.heappop(pq)
        nodes_explored += 1

        # Prune if bound exceeds or equals best known upper bound
        if current.bound >= best_cost:
            nodes_pruned += 1 + len(pq)
            continue

        # If all cities have been visited
        if current.level == n:
            last_city = current.city
            return_cost = dist_matrix[last_city][0]
            if return_cost != INF:
                total_cost = current.bound
                if total_cost < best_cost:
                    best_cost = total_cost
                    best_tour = current.path + [0]
            continue

        # Branch to all unvisited neighbors
        for nxt in range(n):
            if not (current.visited_mask & (1 << nxt)):
                cost_to_nxt = current.matrix[current.city][nxt]
                if cost_to_nxt == INF:
                    continue

                # Prepare child matrix:
                # 1. Invalidate row `current.city`
                # 2. Invalidate col `nxt`
                # 3. Invalidate back-edge (nxt -> 0) if not the last city
                child_matrix = [row[:] for row in current.matrix]
                for c in range(n):
                    child_matrix[current.city][c] = INF
                for r in range(n):
                    child_matrix[r][nxt] = INF

                if current.level < n - 1:
                    child_matrix[nxt][0] = INF

                # Reduce child matrix
                reduced_child, red_cost = reduce_matrix(child_matrix, n)
                child_bound = current.bound + cost_to_nxt + red_cost

                # Pruning condition
                if child_bound < best_cost:
                    child_node = StateNode(
                        matrix=reduced_child,
                        bound=child_bound,
                        city=nxt,
                        level=current.level + 1,
                        path=current.path + [nxt],
                        visited_mask=current.visited_mask | (1 << nxt)
                    )
                    heapq.heappush(pq, child_node)
                else:
                    nodes_pruned += 1

    elapsed_ms = (time.perf_counter() - start_time) * 1000.0

    # Calculate actual path cost from dist_matrix for numerical consistency
    actual_cost = 0.0
    if best_tour:
        for i in range(len(best_tour) - 1):
            actual_cost += dist_matrix[best_tour[i]][best_tour[i + 1]]

    return {
        'algorithm': 'Branch and Bound (Reduced Cost Matrix)',
        'tour': best_tour,
        'cost': round(actual_cost, 4),
        'time_ms': round(elapsed_ms, 3),
        'nodes_explored': nodes_explored,
        'nodes_pruned': nodes_pruned,
        'optimal': not timed_out,
        'timed_out': timed_out
    }


def calculate_euclidean_matrix(coords: List[Tuple[float, float]]) -> List[List[float]]:
    """Calculates NxN Euclidean distance matrix from 2D coordinates."""
    n = len(coords)
    matrix = [[0.0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            if i == j:
                matrix[i][j] = INF
            else:
                dx = coords[i][0] - coords[j][0]
                dy = coords[i][1] - coords[j][1]
                matrix[i][j] = math.hypot(dx, dy)
    return matrix
