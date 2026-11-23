/**
 * Node.js CLI Benchmark Runner
 * Command: npm run benchmark
 */

import { runFullComparison } from '../algorithms/benchmarkSuite.js';
import { generateRandomCities } from '../data/presetDatasets.js';

console.log('='.repeat(95));
console.log('  TRAVELLING SALESPERSON PROBLEM (TSP) - ALGORITHMIC BENCHMARK SUITE');
console.log('='.repeat(95));

const testSizes = [4, 6, 8, 10, 12, 14, 16, 20, 30, 50];

for (const n of testSizes) {
  console.log(`\n▶ Problem Instance: N = ${n} Cities`);
  const cities = generateRandomCities(n, 1000, 1000);
  const includeBB = n <= 14; // Fast benchmark threshold for CLI
  const results = runFullComparison(cities, { includeBB, bbTimeoutMs: 10000 });

  console.log('-'.repeat(95));
  console.log(
    `${'Algorithm'.padEnd(30)} | ${'Cost'.padEnd(12)} | ${'Time (ms)'.padEnd(12)} | ${'Gap (%)'.padEnd(12)} | ${'Ratio'.padEnd(8)} | Class`
  );
  console.log('-'.repeat(95));

  for (const [key, data] of Object.entries(results.algorithms)) {
    const costStr = data.cost !== null ? data.cost.toFixed(2) : 'N/A';
    const timeStr = data.timeMs !== null ? data.timeMs.toFixed(2) : 'N/A';
    const gapStr = data.optimalityGapPct !== undefined ? `${data.optimalityGapPct.toFixed(1)}%` : 'N/A';
    const ratioStr = data.approxRatio !== undefined ? data.approxRatio.toFixed(3) : 'N/A';
    let complexity = 'O(N^2)';
    if (key === 'branchAndBound') complexity = 'O(N!)';
    if (key === 'christofides') complexity = 'O(N^3)';
    if (key === 'twoOpt') complexity = 'O(N^2)';

    console.log(
      `${data.name.padEnd(30)} | ${costStr.padEnd(12)} | ${timeStr.padEnd(12)} | ${gapStr.padEnd(12)} | ${ratioStr.padEnd(8)} | ${complexity}`
    );
  }
}

console.log('\n' + '='.repeat(95));
console.log('Benchmark completed successfully.');
console.log('='.repeat(95));
