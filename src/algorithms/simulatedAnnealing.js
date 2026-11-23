/**
 * Simulated Annealing Metaheuristic for Large TSP Instances (N >= 30)
 */

import { computeTourCost } from './tspMetrics.js';
import { solveNearestNeighbor } from './nearestNeighbor.js';

export function solveSimulatedAnnealing(distMatrix, initialTemp = 1000.0, coolingRate = 0.995, maxIter = 5000) {
  const n = distMatrix.length;
  if (n <= 3) return solveNearestNeighbor(distMatrix);

  const startTime = performance.now();
  const nn = solveNearestNeighbor(distMatrix);
  let currentTour = nn.tour.slice(0, -1);
  let currentCost = computeTourCost([...currentTour, currentTour[0]], distMatrix);

  let bestTour = [...currentTour];
  let bestCost = currentCost;

  let temp = initialTemp;

  for (let iter = 0; iter < maxIter; iter++) {
    if (temp < 1e-4) break;

    const i = Math.floor(Math.random() * (n - 2));
    const j = i + 1 + Math.floor(Math.random() * (n - 1 - i));

    const candidate = [...currentTour];
    const sub = candidate.slice(i, j + 1).reverse();
    candidate.splice(i, j - i + 1, ...sub);

    const candCost = computeTourCost([...candidate, candidate[0]], distMatrix);
    const delta = candCost - currentCost;

    if (delta < 0 || Math.random() < Math.exp(-delta / temp)) {
      currentTour = candidate;
      currentCost = candCost;
      if (currentCost < bestCost) {
        bestCost = currentCost;
        bestTour = [...currentTour];
      }
    }

    temp *= coolingRate;
  }

  const fullTour = [...bestTour, bestTour[0]];
  const elapsedMs = performance.now() - startTime;

  return {
    algorithm: 'Simulated Annealing',
    name: 'Simulated Annealing (Metaheuristic)',
    tour: fullTour,
    cost: Math.round(bestCost * 100) / 100,
    timeMs: Math.round(elapsedMs * 100) / 100
  };
}
