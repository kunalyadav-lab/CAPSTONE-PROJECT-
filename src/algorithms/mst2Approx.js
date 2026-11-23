/**
 * 2-Approximation Algorithm for Metric TSP (MST Doubling / Preorder Walk)
 * Theoretical Guarantee: Tour Cost <= 2.0 * OPT
 */

import { INF, computeTourCost } from './tspMetrics.js';

/**
 * Computes Prim's Minimum Spanning Tree
 * @param {number[][]} distMatrix
 * @returns {Array<{u: number, v: number, weight: number}>}
 */
export function primMST(distMatrix) {
  const n = distMatrix.length;
  const visited = Array(n).fill(false);
  const minEdge = Array(n).fill(INF);
  const parent = Array(n).fill(-1);

  minEdge[0] = 0;
  const edges = [];

  for (let step = 0; step < n; step++) {
    let u = -1;
    let smallest = INF;

    for (let i = 0; i < n; i++) {
      if (!visited[i] && minEdge[i] < smallest) {
        smallest = minEdge[i];
        u = i;
      }
    }

    if (u === -1) break;
    visited[u] = true;

    if (parent[u] !== -1) {
      edges.push({ u: parent[u], v: u, weight: distMatrix[parent[u]][u] });
    }

    for (let v = 0; v < n; v++) {
      if (!visited[v] && distMatrix[u][v] < minEdge[v]) {
        minEdge[v] = distMatrix[u][v];
        parent[v] = u;
      }
    }
  }

  return edges;
}

/**
 * 2-Approximation Solver
 * @param {number[][]} distMatrix
 * @returns {object}
 */
export function solveMST2Approx(distMatrix) {
  const n = distMatrix.length;
  if (n <= 1) {
    return {
      algorithm: '2-Approximation (MST)',
      name: '2-Approximation (MST Preorder)',
      tour: n === 1 ? [0, 0] : [],
      cost: 0,
      timeMs: 0,
      approxBound: 2.0,
      mstEdges: []
    };
  }

  const startTime = performance.now();
  const mstEdges = primMST(distMatrix);

  // Build adjacency list
  const adj = Array.from({ length: n }, () => []);
  for (const { u, v } of mstEdges) {
    adj[u].push(v);
    adj[v].push(u);
  }

  // Preorder traversal
  const visited = Array(n).fill(false);
  const tour = [];

  function dfs(node) {
    visited[node] = true;
    tour.push(node);
    adj[node].sort((a, b) => a - b);
    for (const neighbor of adj[node]) {
      if (!visited[neighbor]) {
        dfs(neighbor);
      }
    }
  }

  dfs(0);
  tour.push(0); // return to start

  const elapsedMs = performance.now() - startTime;
  const cost = computeTourCost(tour, distMatrix);

  return {
    algorithm: '2-Approximation (MST)',
    name: '2-Approximation (MST Preorder)',
    tour,
    cost,
    timeMs: Math.round(elapsedMs * 100) / 100,
    approxBound: 2.0,
    mstEdges
  };
}
