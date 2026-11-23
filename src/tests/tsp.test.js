/**
 * Unit Tests for TSP Solvers (Node test runner)
 * Command: npm test
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { calculateDistanceMatrix, computeTourCost, isValidTour } from '../algorithms/tspMetrics.js';
import { solveBranchAndBound } from '../algorithms/branchAndBound.js';
import { solveMST2Approx } from '../algorithms/mst2Approx.js';
import { solveChristofides } from '../algorithms/christofides.js';
import { solveNearestNeighbor } from '../algorithms/nearestNeighbor.js';
import { solveTwoOpt } from '../algorithms/twoOpt.js';

describe('Travelling Salesperson Problem - Algorithmic Correctness', () => {
  const cities5 = [
    { id: 0, x: 0, y: 0 },
    { id: 1, x: 100, y: 0 },
    { id: 2, x: 100, y: 100 },
    { id: 3, x: 0, y: 100 },
    { id: 4, x: 50, y: 50 }
  ];
  const matrix5 = calculateDistanceMatrix(cities5);

  test('Branch and Bound finds exact optimal tour and valid cycle', () => {
    const res = solveBranchAndBound(matrix5);
    assert.strictEqual(res.optimal, true);
    assert.strictEqual(isValidTour(res.tour, 5), true);
    assert.ok(res.cost > 0, 'Cost should be positive');
  });

  test('2-Approximation satisfies <= 2.0 * OPT theoretical bound', () => {
    const bb = solveBranchAndBound(matrix5);
    const mst = solveMST2Approx(matrix5);

    assert.strictEqual(isValidTour(mst.tour, 5), true);
    assert.ok(
      mst.cost <= 2.0 * bb.cost + 1e-4,
      `2-Approx cost (${mst.cost}) exceeded 2.0 * OPT (${bb.cost * 2})`
    );
  });

  test('Christofides satisfies <= 1.5 * OPT theoretical bound', () => {
    const bb = solveBranchAndBound(matrix5);
    const chris = solveChristofides(matrix5);

    assert.strictEqual(isValidTour(chris.tour, 5), true);
    assert.ok(
      chris.cost <= 1.5 * bb.cost + 1e-4,
      `Christofides cost (${chris.cost}) exceeded 1.5 * OPT (${bb.cost * 1.5})`
    );
  });

  test('2-Opt improves or maintains initial tour cost', () => {
    const nn = solveNearestNeighbor(matrix5);
    const opt = solveTwoOpt(nn.tour, matrix5);

    assert.strictEqual(isValidTour(opt.tour, 5), true);
    assert.ok(
      opt.cost <= nn.cost + 1e-5,
      `2-Opt increased cost: before=${nn.cost}, after=${opt.cost}`
    );
  });
});
