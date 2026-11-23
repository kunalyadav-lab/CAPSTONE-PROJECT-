/**
 * Branch and Bound TSP Solver (Reduced Cost Matrix Method)
 * Finds the exact mathematically optimal Hamiltonian cycle.
 */

import { INF, computeTourCost } from './tspMetrics.js';

class MinHeap {
  constructor() {
    this.heap = [];
  }

  push(node) {
    this.heap.push(node);
    this._bubbleUp(this.heap.length - 1);
  }

  pop() {
    if (this.heap.length === 0) return null;
    const top = this.heap[0];
    const bottom = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = bottom;
      this._bubbleDown(0);
    }
    return top;
  }

  size() {
    return this.heap.length;
  }

  _bubbleUp(idx) {
    while (idx > 0) {
      const parentIdx = Math.floor((idx - 1) / 2);
      if (this.heap[idx].bound < this.heap[parentIdx].bound) {
        [this.heap[idx], this.heap[parentIdx]] = [this.heap[parentIdx], this.heap[idx]];
        idx = parentIdx;
      } else {
        break;
      }
    }
  }

  _bubbleDown(idx) {
    const len = this.heap.length;
    while (true) {
      let left = 2 * idx + 1;
      let right = 2 * idx + 2;
      let smallest = idx;

      if (left < len && this.heap[left].bound < this.heap[smallest].bound) {
        smallest = left;
      }
      if (right < len && this.heap[right].bound < this.heap[smallest].bound) {
        smallest = right;
      }
      if (smallest !== idx) {
        [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]];
        idx = smallest;
      } else {
        break;
      }
    }
  }
}

/**
 * Reduces matrix by row and column minimums
 * @param {number[][]} matrix
 * @param {number} n
 * @returns {{ reduced: number[][], cost: number }}
 */
function reduceMatrix(matrix, n) {
  const reduced = matrix.map(row => [...row]);
  let reductionCost = 0;

  // Row reduction
  for (let r = 0; r < n; r++) {
    let rowMin = INF;
    for (let c = 0; c < n; c++) {
      if (reduced[r][c] < rowMin) rowMin = reduced[r][c];
    }
    if (rowMin !== INF && rowMin > 0) {
      reductionCost += rowMin;
      for (let c = 0; c < n; c++) {
        if (reduced[r][c] !== INF) reduced[r][c] -= rowMin;
      }
    }
  }

  // Column reduction
  for (let c = 0; c < n; c++) {
    let colMin = INF;
    for (let r = 0; r < n; r++) {
      if (reduced[r][c] < colMin) colMin = reduced[r][c];
    }
    if (colMin !== INF && colMin > 0) {
      reductionCost += colMin;
      for (let r = 0; r < n; r++) {
        if (reduced[r][c] !== INF) reduced[r][c] -= colMin;
      }
    }
  }

  return { reduced, cost: reductionCost };
}

/**
 * Solves TSP using Branch and Bound with Reduced Cost Matrix
 * @param {number[][]} distMatrix
 * @param {number} timeLimitMs
 * @returns {object}
 */
export function solveBranchAndBound(distMatrix, timeLimitMs = 15000) {
  const n = distMatrix.length;
  if (n <= 1) {
    return {
      algorithm: 'Branch and Bound',
      tour: n === 1 ? [0, 0] : [],
      cost: 0,
      timeMs: 0,
      nodesExplored: 0,
      nodesPruned: 0,
      optimal: true
    };
  }

  const startTime = performance.now();

  // Root reduction
  const initial = distMatrix.map((row, i) =>
    row.map((val, j) => (i === j ? INF : val))
  );
  const { reduced: rootMatrix, cost: rootBound } = reduceMatrix(initial, n);

  const pq = new MinHeap();
  pq.push({
    matrix: rootMatrix,
    bound: rootBound,
    city: 0,
    level: 1,
    path: [0],
    visitedMask: 1
  });

  let bestCost = INF;
  let bestTour = [];
  let nodesExplored = 0;
  let nodesPruned = 0;
  let timedOut = false;

  while (pq.size() > 0) {
    if (nodesExplored % 2000 === 0 && performance.now() - startTime > timeLimitMs) {
      timedOut = true;
      break;
    }

    const current = pq.pop();
    nodesExplored++;

    // Prune if current node's lower bound is already >= best upper bound
    if (current.bound >= bestCost) {
      nodesPruned += 1 + pq.size();
      continue;
    }

    // Leaf condition: visited all cities
    if (current.level === n) {
      const returnCost = distMatrix[current.city][0];
      if (returnCost !== INF) {
        if (current.bound < bestCost) {
          bestCost = current.bound;
          bestTour = [...current.path, 0];
        }
      }
      continue;
    }

    // Branch to unvisited cities
    for (let nxt = 0; nxt < n; nxt++) {
      if (!(current.visitedMask & (1 << nxt))) {
        const edgeCost = current.matrix[current.city][nxt];
        if (edgeCost === INF) continue;

        // Invalidate row current.city, col nxt, and back-edge nxt -> 0
        const childMatrix = current.matrix.map(row => [...row]);
        for (let c = 0; c < n; c++) childMatrix[current.city][c] = INF;
        for (let r = 0; r < n; r++) childMatrix[r][nxt] = INF;

        if (current.level < n - 1) {
          childMatrix[nxt][0] = INF;
        }

        const { reduced: childReduced, cost: redCost } = reduceMatrix(childMatrix, n);
        const childBound = current.bound + edgeCost + redCost;

        if (childBound < bestCost) {
          pq.push({
            matrix: childReduced,
            bound: childBound,
            city: nxt,
            level: current.level + 1,
            path: [...current.path, nxt],
            visitedMask: current.visitedMask | (1 << nxt)
          });
        } else {
          nodesPruned++;
        }
      }
    }
  }

  const elapsedMs = performance.now() - startTime;
  const actualCost = bestTour.length > 0 ? computeTourCost(bestTour, distMatrix) : 0;

  return {
    algorithm: 'Branch and Bound',
    name: 'Branch & Bound (Exact OPT)',
    tour: bestTour,
    cost: actualCost,
    timeMs: Math.round(elapsedMs * 100) / 100,
    nodesExplored,
    nodesPruned,
    optimal: !timedOut,
    timedOut
  };
}
