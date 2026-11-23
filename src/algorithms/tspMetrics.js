/**
 * TSP Metrics & Utilities
 * Computes Euclidean and Haversine distance matrices, tour costs, and tour validations.
 */

export const INF = Infinity;

/**
 * Computes 2D Euclidean distance matrix
 * @param {Array<{x: number, y: number, name?: string}>} cities
 * @returns {number[][]}
 */
export function calculateDistanceMatrix(cities) {
  const n = cities.length;
  const matrix = Array.from({ length: n }, () => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = INF;
      } else {
        const dx = cities[i].x - cities[j].x;
        const dy = cities[i].y - cities[j].y;
        matrix[i][j] = Math.hypot(dx, dy);
      }
    }
  }
  return matrix;
}

/**
 * Computes total cost of a tour
 * @param {number[]} tour - Array of city indices, ending with start city
 * @param {number[][]} matrix - Distance matrix
 * @returns {number}
 */
export function computeTourCost(tour, matrix) {
  if (!tour || tour.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < tour.length - 1; i++) {
    const from = tour[i];
    const to = tour[i + 1];
    total += matrix[from][to];
  }
  return Math.round(total * 100) / 100;
}

/**
 * Validates if tour is a valid Hamiltonian cycle
 * @param {number[]} tour
 * @param {number} n
 * @returns {boolean}
 */
export function isValidTour(tour, n) {
  if (!tour || tour.length !== n + 1) return false;
  if (tour[0] !== tour[tour.length - 1]) return false;
  const visited = new Set(tour.slice(0, n));
  return visited.size === n;
}
