/**
 * 2-Opt Local Search Improvement Operator
 * Iteratively removes crossing edges by reversing subpaths until a local optimum is achieved.
 */

import { computeTourCost } from './tspMetrics.js';

/**
 * 2-Opt Optimizer
 * @param {number[]} initialTour
 * @param {number[][]} distMatrix
 * @param {number} maxIterations
 * @returns {object}
 */
export function solveTwoOpt(initialTour, distMatrix, maxIterations = 500) {
  const tour = initialTour.slice(0, -1);
  const n = tour.length;
  if (n < 4) {
    return {
      algorithm: '2-Opt Local Search',
      name: '2-Opt Post-Optimization',
      tour: initialTour,
      cost: computeTourCost(initialTour, distMatrix),
      timeMs: 0,
      swapsPerformed: 0
    };
  }

  const startTime = performance.now();
  let improved = true;
  let iterations = 0;
  let swapsPerformed = 0;

  while (improved && iterations < maxIterations) {
    improved = false;
    iterations++;

    for (let i = 0; i < n; i++) {
      for (let j = i + 2; j < n; j++) {
        if (i === 0 && j === n - 1) continue;

        const u1 = tour[i];
        const u2 = tour[(i + 1) % n];
        const v1 = tour[j];
        const v2 = tour[(j + 1) % n];

        const currentDist = distMatrix[u1][u2] + distMatrix[v1][v2];
        const newDist = distMatrix[u1][v1] + distMatrix[u2][v2];

        if (newDist < currentDist - 1e-6) {
          // Reverse subsegment between i+1 and j
          const sub = tour.slice(i + 1, j + 1).reverse();
          tour.splice(i + 1, j - i, ...sub);
          improved = true;
          swapsPerformed++;
          break;
        }
      }
      if (improved) break;
    }
  }

  const fullTour = [...tour, tour[0]];
  const elapsedMs = performance.now() - startTime;
  const cost = computeTourCost(fullTour, distMatrix);

  return {
    algorithm: '2-Opt Local Search',
    name: 'Christofides + 2-Opt (Near-Optimal)',
    tour: fullTour,
    cost,
    timeMs: Math.round(elapsedMs * 100) / 100,
    swapsPerformed,
    iterations
  };
}
