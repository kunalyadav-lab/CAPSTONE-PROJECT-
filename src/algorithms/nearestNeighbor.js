/**
 * Nearest Neighbor Heuristic
 * Fast greedy tour construction starting from origin or best starting vertex.
 */

import { INF, computeTourCost } from './tspMetrics.js';

export function solveNearestNeighbor(distMatrix, startCity = 0) {
  const n = distMatrix.length;
  if (n <= 1) {
    return {
      algorithm: 'Nearest Neighbor',
      name: 'Nearest Neighbor (Greedy)',
      tour: n === 1 ? [0, 0] : [],
      cost: 0,
      timeMs: 0
    };
  }

  const startTime = performance.now();
  const visited = Array(n).fill(false);
  let curr = startCity;
  visited[curr] = true;
  const tour = [curr];

  for (let step = 0; step < n - 1; step++) {
    let nextCity = -1;
    let minDist = INF;

    for (let candidate = 0; candidate < n; candidate++) {
      if (!visited[candidate] && distMatrix[curr][candidate] < minDist) {
        minDist = distMatrix[curr][candidate];
        nextCity = candidate;
      }
    }

    visited[nextCity] = true;
    tour.push(nextCity);
    curr = nextCity;
  }

  tour.push(startCity);
  const elapsedMs = performance.now() - startTime;
  const cost = computeTourCost(tour, distMatrix);

  return {
    algorithm: 'Nearest Neighbor',
    name: 'Nearest Neighbor (Greedy)',
    tour,
    cost,
    timeMs: Math.round(elapsedMs * 100) / 100
  };
}
