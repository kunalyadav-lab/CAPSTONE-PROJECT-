/**
 * Christofides-Serdyukov Algorithm (1.5-Approximation for Metric TSP)
 * Theoretical Guarantee: Tour Cost <= 1.5 * OPT
 * 
 * Steps:
 * 1. Find Minimum Spanning Tree (MST) T
 * 2. Identify odd-degree vertices O in T (|O| is guaranteed even)
 * 3. Find Minimum Weight Perfect Matching M on subgraph induced by O
 * 4. Combine T and M to form Eulerian Multigraph H (all degrees even)
 * 5. Compute Eulerian circuit in H using Hierholzer's Algorithm
 * 6. Shortcut Eulerian circuit into Hamiltonian cycle using triangle inequality
 */

import { INF, computeTourCost } from './tspMetrics.js';
import { primMST } from './mst2Approx.js';

/**
 * Minimum Weight Perfect Matching on odd degree vertices
 * @param {number[]} oddVertices
 * @param {number[][]} distMatrix
 * @returns {Array<{u: number, v: number, weight: number}>}
 */
function findMinimumWeightPerfectMatching(oddVertices, distMatrix) {
  const k = oddVertices.length;
  if (k === 0 || k % 2 !== 0) return [];

  // Exact DP for small odd sets (k <= 14)
  if (k <= 14) {
    const memo = new Map();

    function dp(mask) {
      if (mask === (1 << k) - 1) return { cost: 0, pairs: [] };
      if (memo.has(mask)) return memo.get(mask);

      let first = -1;
      for (let i = 0; i < k; i++) {
        if (!(mask & (1 << i))) {
          first = i;
          break;
        }
      }

      let bestCost = INF;
      let bestPairs = [];

      for (let second = first + 1; second < k; second++) {
        if (!(mask & (1 << second))) {
          const u = oddVertices[first];
          const v = oddVertices[second];
          const w = distMatrix[u][v];

          const res = dp(mask | (1 << first) | (1 << second));
          if (w + res.cost < bestCost) {
            bestCost = w + res.cost;
            bestPairs = [{ u, v, weight: w }, ...res.pairs];
          }
        }
      }

      const result = { cost: bestCost, pairs: bestPairs };
      memo.set(mask, result);
      return result;
    }

    return dp(0).pairs;
  } else {
    // Greedy matching for large odd sets: sort candidate edges by weight
    const edges = [];
    for (let i = 0; i < k; i++) {
      for (let j = i + 1; j < k; j++) {
        const u = oddVertices[i];
        const v = oddVertices[j];
        edges.push({ u, v, weight: distMatrix[u][v] });
      }
    }
    edges.sort((a, b) => a.weight - b.weight);

    const matched = new Set();
    const matching = [];

    for (const edge of edges) {
      if (!matched.has(edge.u) && !matched.has(edge.v)) {
        matched.add(edge.u);
        matched.add(edge.v);
        matching.push(edge);
        if (matched.size === k) break;
      }
    }
    return matching;
  }
}

/**
 * Solves TSP using Christofides Algorithm
 * @param {number[][]} distMatrix
 * @returns {object}
 */
export function solveChristofides(distMatrix) {
  const n = distMatrix.length;
  if (n <= 1) {
    return {
      algorithm: 'Christofides (1.5-Approx)',
      name: 'Christofides (1.5-Approximation)',
      tour: n === 1 ? [0, 0] : [],
      cost: 0,
      timeMs: 0,
      approxBound: 1.5,
      oddVertices: [],
      matchingEdges: [],
      mstEdges: []
    };
  }

  const startTime = performance.now();

  // 1. Minimum Spanning Tree
  const mstEdges = primMST(distMatrix);

  // 2. Degrees of vertices in MST
  const degrees = Array(n).fill(0);
  const multigraph = Array.from({ length: n }, () => []);

  for (const { u, v } of mstEdges) {
    degrees[u]++;
    degrees[v]++;
    multigraph[u].push(v);
    multigraph[v].push(u);
  }

  const oddVertices = [];
  for (let i = 0; i < n; i++) {
    if (degrees[i] % 2 !== 0) oddVertices.push(i);
  }

  // 3. Minimum Weight Perfect Matching on odd vertices
  const matchingEdges = findMinimumWeightPerfectMatching(oddVertices, distMatrix);
  for (const { u, v } of matchingEdges) {
    multigraph[u].push(v);
    multigraph[v].push(u);
  }

  // 4 & 5. Hierholzer's Algorithm for Eulerian Circuit
  const adjCopy = multigraph.map(list => [...list]);
  const circuit = [];
  const stack = [0];

  while (stack.length > 0) {
    const u = stack[stack.length - 1];
    if (adjCopy[u] && adjCopy[u].length > 0) {
      const v = adjCopy[u].pop();
      const revIdx = adjCopy[v].indexOf(u);
      if (revIdx !== -1) adjCopy[v].splice(revIdx, 1);
      stack.push(v);
    } else {
      circuit.push(stack.pop());
    }
  }

  // 6. Shortcutting into Hamiltonian Cycle
  const visited = new Set();
  const tour = [];
  for (const city of circuit) {
    if (!visited.has(city)) {
      visited.add(city);
      tour.push(city);
    }
  }
  tour.push(0); // Return to start

  const elapsedMs = performance.now() - startTime;
  const cost = computeTourCost(tour, distMatrix);

  return {
    algorithm: 'Christofides (1.5-Approx)',
    name: 'Christofides (1.5-Approximation)',
    tour,
    cost,
    timeMs: Math.round(elapsedMs * 100) / 100,
    approxBound: 1.5,
    oddVertices,
    matchingEdges,
    mstEdges
  };
}
