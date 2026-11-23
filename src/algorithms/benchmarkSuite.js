/**
 * Benchmark & Comparison Engine
 * Executes Branch & Bound, Christofides, 2-Approximation, Nearest Neighbor, and 2-Opt.
 * Measures Execution Time, Total Route Cost, and Solution Quality (Optimality Gap & Ratio).
 */

import { calculateDistanceMatrix } from './tspMetrics.js';
import { solveBranchAndBound } from './branchAndBound.js';
import { solveMST2Approx, primMST } from './mst2Approx.js';
import { solveChristofides } from './christofides.js';
import { solveNearestNeighbor } from './nearestNeighbor.js';
import { solveTwoOpt } from './twoOpt.js';
import { solveSimulatedAnnealing } from './simulatedAnnealing.js';

export function runFullComparison(cities, options = {}) {
  const n = cities.length;
  const matrix = calculateDistanceMatrix(cities);
  const includeBB = options.includeBB !== undefined ? options.includeBB : n <= 16;

  const results = {
    cityCount: n,
    cities,
    timestamp: new Date().toISOString(),
    algorithms: {}
  };

  let optCost = null;

  // 1. Branch and Bound (Exact Optimal)
  if (includeBB) {
    const bbRes = solveBranchAndBound(matrix, options.bbTimeoutMs || 15000);
    results.algorithms['branchAndBound'] = {
      ...bbRes,
      color: '#10b981', // emerald green
      description: 'Exact optimal route using matrix reduction & state-space pruning'
    };
    optCost = bbRes.cost;
  } else {
    // For large N, calculate MST lower bound as theoretical baseline
    const mst = primMST(matrix);
    const mstLowerBound = Math.round(mst.reduce((acc, e) => acc + e.weight, 0) * 100) / 100;
    results.algorithms['branchAndBound'] = {
      algorithm: 'Branch and Bound (Skipped)',
      name: 'Branch & Bound (Skipped for N > 16)',
      tour: [],
      cost: null,
      timeMs: null,
      mstLowerBound,
      color: '#6b7280',
      description: 'Skipped to prevent combinatorial explosion O(N!) - MST lower bound used for gap estimation'
    };
    optCost = mstLowerBound;
  }

  // 2. Christofides Algorithm (1.5-Approximation)
  const chrisRes = solveChristofides(matrix);
  results.algorithms['christofides'] = {
    ...chrisRes,
    color: '#6366f1', // indigo
    description: 'Guaranteed <= 1.5x OPT on metric TSP using MST + Min-Weight Matching'
  };

  // 3. 2-Approximation Algorithm (MST Preorder Walk)
  const mstRes = solveMST2Approx(matrix);
  results.algorithms['mst2Approx'] = {
    ...mstRes,
    color: '#f59e0b', // amber
    description: 'Guaranteed <= 2.0x OPT using doubled MST and preorder shortcutting'
  };

  // 4. Nearest Neighbor
  const nnRes = solveNearestNeighbor(matrix);
  results.algorithms['nearestNeighbor'] = {
    ...nnRes,
    color: '#ec4899', // pink
    description: 'Greedy heuristic visiting nearest unvisited city at each step'
  };

  // 5. Christofides + 2-Opt Post Optimization
  const twoOptRes = solveTwoOpt(chrisRes.tour, matrix);
  twoOptRes.timeMs = Math.round((twoOptRes.timeMs + chrisRes.timeMs) * 100) / 100;
  results.algorithms['twoOpt'] = {
    ...twoOptRes,
    color: '#06b6d4', // cyan
    description: 'Iterative 2-opt edge-untangling applied on Christofides tour'
  };

  // 6. Simulated Annealing (if N >= 20)
  if (n >= 20) {
    const saRes = solveSimulatedAnnealing(matrix);
    results.algorithms['simulatedAnnealing'] = {
      ...saRes,
      color: '#8b5cf6', // purple
      description: 'Probabilistic metaheuristic for large TSP landscapes'
    };
  }

  // Calculate Solution Quality Metrics (Optimality Gap & Ratio)
  for (const key of Object.keys(results.algorithms)) {
    const entry = results.algorithms[key];
    if (entry.cost !== null && optCost !== null && optCost > 0) {
      const gap = ((entry.cost - optCost) / optCost) * 100;
      const ratio = entry.cost / optCost;
      entry.optimalityGapPct = Math.round(gap * 100) / 100;
      entry.approxRatio = Math.round(ratio * 1000) / 1000;
      entry.isExactBaseline = key === 'branchAndBound' && includeBB;
    }
  }

  return results;
}
