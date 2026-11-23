/**
 * TSP Route Optimizer – Interactive Dashboard Application
 * Manages canvas rendering, drag-and-drop, route animation, Chart.js benchmarks, and UI state.
 */

import { PRESET_DATASETS, generateRandomCities, generateCircleCities } from './data/presetDatasets.js';
import { runFullComparison } from './algorithms/benchmarkSuite.js';
import { calculateDistanceMatrix } from './algorithms/tspMetrics.js';

// Application State
const state = {
  cities: [],
  results: null,
  activeLayer: 'all', // 'all', 'branchAndBound', 'christofides', 'twoOpt', 'mst2Approx'
  draggedCityIdx: null,
  isDragging: false,
  animation: {
    running: false,
    timer: null,
    step: 0,
    tour: [],
    algoKey: 'branchAndBound',
    speedMs: 250
  },
  charts: {
    cost: null,
    time: null,
    scalability: null
  }
};

// DOM Elements
const canvas = document.getElementById('tspCanvas');
const ctx = canvas.getContext('2d');
const presetSelect = document.getElementById('presetSelect');
const cityRange = document.getElementById('cityRange');
const cityCountLabel = document.getElementById('cityCountLabel');
const bbWarning = document.getElementById('bbWarning');
const checkIncludeBB = document.getElementById('checkIncludeBB');
const btnSolveAll = document.getElementById('btnSolveAll');
const btnRandomGen = document.getElementById('btnRandomGen');
const btnCircleGen = document.getElementById('btnCircleGen');
const btnClearCanvas = document.getElementById('btnClearCanvas');
const btnAnimate = document.getElementById('btnAnimate');
const animBtnText = document.getElementById('animBtnText');
const btnResetAnim = document.getElementById('btnResetAnim');
const animSpeed = document.getElementById('animSpeed');
const hudCoords = document.getElementById('hudCoords');
const hudCityCount = document.getElementById('hudCityCount');
const metricsTableBody = document.getElementById('metricsTableBody');
const tourSequenceText = document.getElementById('tourSequenceText');
const activeAlgoBadge = document.getElementById('activeAlgoBadge');

// KPI elements
const statBestCost = document.getElementById('statBestCost');
const statBestAlgo = document.getElementById('statBestAlgo');
const statFastTime = document.getElementById('statFastTime');
const statFastAlgo = document.getElementById('statFastAlgo');
const statPrunedNodes = document.getElementById('statPrunedNodes');
const statExploredNodes = document.getElementById('statExploredNodes');
const statChrisGap = document.getElementById('statChrisGap');

// Modals
const theoryModal = document.getElementById('theoryModal');
const exportModal = document.getElementById('exportModal');
const btnOpenTheory = document.getElementById('btnOpenTheory');
const btnCloseTheory = document.getElementById('btnCloseTheory');
const btnCloseTheoryBottom = document.getElementById('btnCloseTheoryBottom');
const btnExportModal = document.getElementById('btnExportModal');
const btnCloseExport = document.getElementById('btnCloseExport');
const btnExportJSON = document.getElementById('btnExportJSON');
const btnExportCSV = document.getElementById('btnExportCSV');
const btnExportMarkdown = document.getElementById('btnExportMarkdown');
const btnRunScalabilitySuite = document.getElementById('btnRunScalabilitySuite');

// Colors
const ALGO_COLORS = {
  branchAndBound: { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.15)', name: 'Branch & Bound (OPT)' },
  christofides: { stroke: '#6366f1', fill: 'rgba(99, 102, 241, 0.15)', name: 'Christofides (1.5-Approx)' },
  twoOpt: { stroke: '#06b6d4', fill: 'rgba(6, 182, 212, 0.15)', name: 'Christofides + 2-Opt' },
  mst2Approx: { stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.15)', name: '2-Approximation (MST)' },
  nearestNeighbor: { stroke: '#ec4899', fill: 'rgba(236, 72, 153, 0.15)', name: 'Nearest Neighbor' }
};

// ==============================================================================
// 1. Initialization & Canvas Setup
// ==============================================================================
function initApp() {
  resizeCanvas();
  window.addEventListener('resize', () => {
    resizeCanvas();
    draw();
  });

  loadPreset('indiaMetro');
  initEventListeners();
  initCharts();
  solveAndRender();
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.resetTransform?.() || ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
}

// Coordinate Normalization for Presets
function fitCitiesToCanvas(rawCities) {
  if (!rawCities || rawCities.length === 0) return [];
  const rect = canvas.getBoundingClientRect();
  const padding = 55;
  const w = rect.width - 2 * padding;
  const h = rect.height - 2 * padding;

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const c of rawCities) {
    if (c.x < minX) minX = c.x;
    if (c.x > maxX) maxX = c.x;
    if (c.y < minY) minY = c.y;
    if (c.y > maxY) maxY = c.y;
  }

  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  return rawCities.map((c, idx) => ({
    id: idx,
    name: c.name || `City ${idx + 1}`,
    x: padding + ((c.x - minX) / rangeX) * w,
    y: padding + ((c.y - minY) / rangeY) * h
  }));
}

function loadPreset(key) {
  if (PRESET_DATASETS[key]) {
    const preset = PRESET_DATASETS[key];
    state.cities = fitCitiesToCanvas(preset.cities);
    cityRange.value = state.cities.length;
    cityCountLabel.textContent = state.cities.length;
    updateBBSafetyCheck();
  }
}

function updateBBSafetyCheck() {
  const count = state.cities.length;
  if (count > 16) {
    bbWarning.classList.remove('hidden');
    checkIncludeBB.checked = false;
  } else {
    bbWarning.classList.add('hidden');
    checkIncludeBB.checked = true;
  }
}

// ==============================================================================
// 2. Canvas Drawing Engine
// ==============================================================================
function draw() {
  const rect = canvas.getBoundingClientRect();
  ctx.clearRect(0, 0, rect.width, rect.height);

  // Background subtle grid
  drawGrid(rect.width, rect.height);

  // Draw Routes
  if (state.results) {
    drawRoutes();
  }

  // Draw Cities & Labels
  drawCities();

  // Draw animated runner if active
  if (state.animation.running && state.animation.tour.length > 0) {
    drawAnimatedRunner();
  }

  hudCityCount.textContent = `${state.cities.length} Cities`;
}

function drawGrid(width, height) {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  const step = 40;
  for (let x = 0; x < width; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function drawRoutes() {
  const algos = state.results.algorithms;

  if (state.activeLayer === 'all') {
    // Overlaid mode: draw in priority sequence with varying line styles
    if (algos.mst2Approx?.tour?.length) drawSingleRoute(algos.mst2Approx.tour, ALGO_COLORS.mst2Approx.stroke, 1.5, [4, 4]);
    if (algos.twoOpt?.tour?.length) drawSingleRoute(algos.twoOpt.tour, ALGO_COLORS.twoOpt.stroke, 2, []);
    if (algos.christofides?.tour?.length) drawSingleRoute(algos.christofides.tour, ALGO_COLORS.christofides.stroke, 2.5, []);
    if (algos.branchAndBound?.tour?.length) drawSingleRoute(algos.branchAndBound.tour, ALGO_COLORS.branchAndBound.stroke, 3.5, []);
  } else {
    // Single isolated layer
    const activeData = algos[state.activeLayer];
    if (activeData?.tour?.length) {
      const col = ALGO_COLORS[state.activeLayer]?.stroke || '#6366f1';
      drawSingleRoute(activeData.tour, col, 3, []);
    }
  }
}

function drawSingleRoute(tour, strokeColor, lineWidth, lineDash = []) {
  if (!tour || tour.length < 2) return;
  ctx.save();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = lineWidth;
  ctx.setLineDash(lineDash);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  ctx.beginPath();
  for (let i = 0; i < tour.length; i++) {
    const city = state.cities[tour[i]];
    if (!city) continue;
    if (i === 0) ctx.moveTo(city.x, city.y);
    else ctx.lineTo(city.x, city.y);
  }
  ctx.stroke();
  ctx.restore();
}

function drawCities() {
  state.cities.forEach((city, idx) => {
    // Outer glow
    ctx.beginPath();
    ctx.arc(city.x, city.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = idx === 0 ? 'rgba(239, 68, 68, 0.35)' : 'rgba(99, 102, 241, 0.25)';
    ctx.fill();

    // Inner pin
    ctx.beginPath();
    ctx.arc(city.x, city.y, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = idx === 0 ? '#ef4444' : '#818cf8';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // City Name / Index Label
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    const label = city.name || `C${idx}`;
    ctx.fillText(label, city.x, city.y - 11);
  });
}

function drawAnimatedRunner() {
  const tour = state.animation.tour;
  if (!tour || tour.length === 0) return;
  const currentCityIdx = tour[state.animation.step % tour.length];
  const city = state.cities[currentCityIdx];
  if (!city) return;

  ctx.save();
  ctx.beginPath();
  ctx.arc(city.x, city.y, 11, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(236, 72, 153, 0.4)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(city.x, city.y, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#ec4899';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// ==============================================================================
// 3. Execution & Solving Controller
// ==============================================================================
export function solveAndRender() {
  if (state.cities.length < 3) {
    state.results = null;
    draw();
    renderEmptyTable();
    return;
  }

  const includeBB = checkIncludeBB.checked && state.cities.length <= 16;
  const res = runFullComparison(state.cities, { includeBB, bbTimeoutMs: 15000 });
  state.results = res;

  draw();
  updateKPIs(res);
  renderMetricsTable(res);
  updateTourInspector(res);
  updateCharts(res);
}

function updateKPIs(res) {
  const algos = res.algorithms;

  // Best Cost & Algo
  let bestCost = Infinity;
  let bestAlgo = '--';
  for (const [key, item] of Object.entries(algos)) {
    if (item.cost !== null && item.cost < bestCost) {
      bestCost = item.cost;
      bestAlgo = item.name;
    }
  }
  statBestCost.textContent = bestCost !== Infinity ? bestCost.toFixed(2) : '--';
  statBestAlgo.textContent = bestAlgo;

  // Fastest Runtime
  let fastTime = Infinity;
  let fastAlgo = '--';
  for (const [key, item] of Object.entries(algos)) {
    if (item.timeMs !== null && item.timeMs < fastTime) {
      fastTime = item.timeMs;
      fastAlgo = item.name;
    }
  }
  statFastTime.textContent = fastTime !== Infinity ? `${fastTime.toFixed(2)} ms` : '--';
  statFastAlgo.textContent = fastAlgo;

  // B&B Stats
  if (algos.branchAndBound?.nodesPruned !== undefined) {
    statPrunedNodes.textContent = algos.branchAndBound.nodesPruned.toLocaleString();
    statExploredNodes.textContent = `Explored: ${algos.branchAndBound.nodesExplored.toLocaleString()}`;
  } else {
    statPrunedNodes.textContent = 'N/A';
    statExploredNodes.textContent = 'Skipped (N > 16)';
  }

  // Christofides Gap
  if (algos.christofides?.optimalityGapPct !== undefined) {
    const gap = algos.christofides.optimalityGapPct;
    statChrisGap.textContent = `${gap.toFixed(1)}%`;
    statChrisGap.className = `text-xl font-bold ${gap <= 5 ? 'text-emerald-400' : gap <= 20 ? 'text-indigo-400' : 'text-amber-400'}`;
  } else {
    statChrisGap.textContent = '--';
  }
}

function renderMetricsTable(res) {
  metricsTableBody.innerHTML = '';

  const order = ['branchAndBound', 'christofides', 'twoOpt', 'mst2Approx', 'nearestNeighbor', 'simulatedAnnealing'];

  order.forEach(key => {
    const data = res.algorithms[key];
    if (!data) return;

    const tr = document.createElement('tr');
    tr.className = 'hover:bg-gray-800/40 transition cursor-pointer';

    // Click row to isolate layer on canvas
    tr.addEventListener('click', () => {
      selectLayer(key);
    });

    const costStr = data.cost !== null ? data.cost.toFixed(2) : '<span class="text-gray-500">N/A</span>';
    const timeStr = data.timeMs !== null ? `${data.timeMs.toFixed(2)} ms` : '<span class="text-gray-500">N/A</span>';
    
    let gapBadge = '<span class="text-gray-500">--</span>';
    if (data.optimalityGapPct !== undefined) {
      if (key === 'branchAndBound') {
        gapBadge = '<span class="text-emerald-400 font-bold">0.0% (OPT)</span>';
      } else {
        const gapVal = data.optimalityGapPct;
        const color = gapVal <= 3 ? 'text-emerald-400' : gapVal <= 15 ? 'text-indigo-400' : 'text-amber-400';
        gapBadge = `<span class="${color}">+${gapVal.toFixed(1)}%</span>`;
      }
    }

    const ratioStr = data.approxRatio !== undefined ? data.approxRatio.toFixed(3) : '--';
    const dotColor = ALGO_COLORS[key]?.stroke || '#94a3b8';

    tr.innerHTML = `
      <td class="py-2.5 font-sans flex items-center space-x-2">
        <span class="w-2 h-2 rounded-full" style="background-color: ${dotColor}"></span>
        <span class="text-gray-200 font-medium">${data.name}</span>
      </td>
      <td class="py-2.5 text-right text-gray-100">${costStr}</td>
      <td class="py-2.5 text-right text-gray-300">${timeStr}</td>
      <td class="py-2.5 text-right font-medium">${gapBadge}</td>
      <td class="py-2.5 text-center text-gray-400">${ratioStr}</td>
    `;

    metricsTableBody.appendChild(tr);
  });
}

function renderEmptyTable() {
  metricsTableBody.innerHTML = `
    <tr>
      <td colspan="5" class="py-6 text-center text-gray-500 font-sans text-xs">
        Add at least 3 cities to generate route comparisons.
      </td>
    </tr>
  `;
}

function updateTourInspector(res) {
  const chosenKey = state.activeLayer !== 'all' && res.algorithms[state.activeLayer]
    ? state.activeLayer
    : (res.algorithms.branchAndBound?.tour?.length ? 'branchAndBound' : 'christofides');

  const algo = res.algorithms[chosenKey];
  if (algo?.tour?.length) {
    activeAlgoBadge.textContent = algo.name;
    const pathNames = algo.tour.map(idx => state.cities[idx]?.name || `C${idx}`).join(' → ');
    tourSequenceText.textContent = pathNames;
    state.animation.tour = algo.tour;
    state.animation.algoKey = chosenKey;
  }
}

// ==============================================================================
// 4. Layer Selection & Animation
// ==============================================================================
function selectLayer(layerKey) {
  state.activeLayer = layerKey;
  document.querySelectorAll('.layer-pill').forEach(btn => {
    if (btn.getAttribute('data-layer') === layerKey) {
      btn.classList.add('active', 'bg-gray-800', 'text-white');
    } else {
      btn.classList.remove('active', 'bg-gray-800', 'text-white');
    }
  });

  if (state.results) {
    updateTourInspector(state.results);
  }
  draw();
}

function toggleAnimation() {
  if (state.animation.running) {
    stopAnimation();
  } else {
    startAnimation();
  }
}

function startAnimation() {
  if (!state.animation.tour || state.animation.tour.length === 0) return;
  state.animation.running = true;
  animBtnText.textContent = 'Pause';
  btnAnimate.querySelector('i')?.setAttribute('data-lucide', 'pause-circle');
  if (window.lucide) lucide.createIcons();

  clearInterval(state.animation.timer);
  state.animation.timer = setInterval(() => {
    state.animation.step++;
    draw();
  }, state.animation.speedMs);
}

function stopAnimation() {
  state.animation.running = false;
  clearInterval(state.animation.timer);
  animBtnText.textContent = 'Animate Tour';
  btnAnimate.querySelector('i')?.setAttribute('data-lucide', 'play-circle');
  if (window.lucide) lucide.createIcons();
}

function resetAnimation() {
  stopAnimation();
  state.animation.step = 0;
  draw();
}

// ==============================================================================
// 5. Chart.js Benchmarking Visualizations
// ==============================================================================
function initCharts() {
  // Chart 1: Cost Comparison Bar Chart
  const ctxCost = document.getElementById('chartCost').getContext('2d');
  state.charts.cost = new Chart(ctxCost, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [{
        label: 'Route Cost',
        data: [],
        backgroundColor: [
          'rgba(16, 185, 129, 0.7)',
          'rgba(99, 102, 241, 0.7)',
          'rgba(6, 182, 212, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(236, 72, 153, 0.7)'
        ],
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { display: false } },
        y: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } }
      }
    }
  });

  // Chart 2: Time Comparison Bar Chart
  const ctxTime = document.getElementById('chartTime').getContext('2d');
  state.charts.time = new Chart(ctxTime, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [{
        label: 'Execution Time (ms)',
        data: [],
        backgroundColor: [
          'rgba(16, 185, 129, 0.7)',
          'rgba(99, 102, 241, 0.7)',
          'rgba(6, 182, 212, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(236, 72, 153, 0.7)'
        ],
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { display: false } },
        y: { type: 'logarithmic', ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } }
      }
    }
  });

  // Chart 3: Scalability Line Chart
  const ctxScalability = document.getElementById('chartScalability').getContext('2d');
  state.charts.scalability = new Chart(ctxScalability, {
    type: 'line',
    data: {
      labels: ['4', '6', '8', '10', '12', '14', '16', '20', '30', '40'],
      datasets: [
        {
          label: 'Branch & Bound O(N!)',
          data: [0.7, 1.6, 6.8, 19.5, 94.2, 320.0, 1850.0, null, null, null],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.3
        },
        {
          label: 'Christofides O(N³)',
          data: [0.8, 0.16, 0.14, 0.11, 0.16, 0.14, 0.44, 0.60, 0.38, 0.42],
          borderColor: '#6366f1',
          tension: 0.3
        },
        {
          label: '2-Opt O(N²)',
          data: [0.83, 0.19, 0.15, 0.12, 0.19, 0.78, 0.49, 0.69, 1.05, 1.10],
          borderColor: '#06b6d4',
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { color: '#cbd5e1', font: { size: 9 }, boxWidth: 10 }
        }
      },
      scales: {
        x: { title: { display: true, text: 'Cities (N)', color: '#64748b', font: { size: 10 } }, ticks: { color: '#94a3b8', font: { size: 9 } } },
        y: { type: 'logarithmic', title: { display: true, text: 'Time (ms, log)', color: '#64748b', font: { size: 10 } }, ticks: { color: '#94a3b8', font: { size: 9 } } }
      }
    }
  });
}

function updateCharts(res) {
  const algos = res.algorithms;
  const labels = [];
  const costData = [];
  const timeData = [];

  const keys = ['branchAndBound', 'christofides', 'twoOpt', 'mst2Approx', 'nearestNeighbor'];
  const names = {
    branchAndBound: 'B&B (OPT)',
    christofides: 'Christofides',
    twoOpt: '2-Opt',
    mst2Approx: 'MST 2-Approx',
    nearestNeighbor: 'Greedy NN'
  };

  keys.forEach(k => {
    if (algos[k] && algos[k].cost !== null) {
      labels.push(names[k]);
      costData.push(algos[k].cost);
      timeData.push(Math.max(0.01, algos[k].timeMs));
    }
  });

  // Update Cost Chart
  state.charts.cost.data.labels = labels;
  state.charts.cost.data.datasets[0].data = costData;
  state.charts.cost.update();

  // Update Time Chart
  state.charts.time.data.labels = labels;
  state.charts.time.data.datasets[0].data = timeData;
  state.charts.time.update();
}

// Live Scalability Benchmark Suite
async function runLiveScalabilityBenchmark() {
  btnRunScalabilitySuite.disabled = true;
  btnRunScalabilitySuite.innerHTML = '<span class="animate-spin inline-block mr-1">⚙️</span> Running benchmark...';

  const sizes = [4, 6, 8, 10, 12, 14, 16, 20, 30, 40];
  const bbTimes = [];
  const chrisTimes = [];
  const twoOptTimes = [];

  for (const n of sizes) {
    const testCities = generateRandomCities(n, 800, 600);
    const matrix = calculateDistanceMatrix(testCities);

    // B&B
    if (n <= 14) {
      const { solveBranchAndBound } = await import('./algorithms/branchAndBound.js');
      const bRes = solveBranchAndBound(matrix, 6000);
      bbTimes.push(Math.max(0.01, bRes.timeMs));
    } else {
      bbTimes.push(null);
    }

    // Christofides
    const { solveChristofides } = await import('./algorithms/christofides.js');
    const cRes = solveChristofides(matrix);
    chrisTimes.push(Math.max(0.01, cRes.timeMs));

    // 2-Opt
    const { solveTwoOpt } = await import('./algorithms/twoOpt.js');
    const tRes = solveTwoOpt(cRes.tour, matrix);
    twoOptTimes.push(Math.max(0.01, tRes.timeMs + cRes.timeMs));
  }

  state.charts.scalability.data.datasets[0].data = bbTimes;
  state.charts.scalability.data.datasets[1].data = chrisTimes;
  state.charts.scalability.data.datasets[2].data = twoOptTimes;
  state.charts.scalability.update();

  btnRunScalabilitySuite.disabled = false;
  btnRunScalabilitySuite.innerHTML = '<i data-lucide="check" class="w-4 h-4 text-emerald-400 mr-1"></i> Benchmark Completed!';
  if (window.lucide) lucide.createIcons();
  setTimeout(() => {
    btnRunScalabilitySuite.innerHTML = '<i data-lucide="cpu" class="w-4 h-4 mr-1"></i> Run Scalability Benchmark';
    if (window.lucide) lucide.createIcons();
  }, 4000);
}

// ==============================================================================
// 6. Interactive Event Listeners & Dragging
// ==============================================================================
function initEventListeners() {
  // Preset selector
  presetSelect.addEventListener('change', (e) => {
    if (e.target.value !== 'custom') {
      loadPreset(e.target.value);
      solveAndRender();
    }
  });

  // City Range Slider
  cityRange.addEventListener('input', (e) => {
    cityCountLabel.textContent = e.target.value;
  });

  cityRange.addEventListener('change', (e) => {
    const count = parseInt(e.target.value, 10);
    state.cities = generateRandomCities(count);
    presetSelect.value = 'custom';
    updateBBSafetyCheck();
    solveAndRender();
  });

  // Random Generator Button
  btnRandomGen.addEventListener('click', () => {
    const count = parseInt(cityRange.value, 10);
    state.cities = generateRandomCities(count);
    presetSelect.value = 'custom';
    updateBBSafetyCheck();
    solveAndRender();
  });

  // Circle Generator Button
  btnCircleGen.addEventListener('click', () => {
    const count = parseInt(cityRange.value, 10);
    state.cities = generateCircleCities(count);
    presetSelect.value = 'custom';
    updateBBSafetyCheck();
    solveAndRender();
  });

  // Clear Canvas Button
  btnClearCanvas.addEventListener('click', () => {
    state.cities = [];
    state.results = null;
    presetSelect.value = 'custom';
    cityCountLabel.textContent = 0;
    draw();
    renderEmptyTable();
  });

  // Checkbox B&B
  checkIncludeBB.addEventListener('change', () => {
    solveAndRender();
  });

  // Solve Button
  btnSolveAll.addEventListener('click', () => {
    solveAndRender();
  });

  // Layer Selector Pills
  document.querySelectorAll('.layer-pill').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const layer = e.currentTarget.getAttribute('data-layer');
      selectLayer(layer);
    });
  });

  // Animation Controls
  btnAnimate.addEventListener('click', toggleAnimation);
  btnResetAnim.addEventListener('click', resetAnimation);
  animSpeed.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    // map 1..5 to 500ms..80ms
    const speedMap = { 1: 500, 2: 350, 3: 200, 4: 120, 5: 60 };
    state.animation.speedMs = speedMap[val] || 200;
    if (state.animation.running) {
      startAnimation();
    }
  });

  // Canvas Mouse Interactions: Click to add city, Drag to move
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    hudCoords.textContent = `X: ${Math.round(mouseX)}, Y: ${Math.round(mouseY)}`;

    if (state.isDragging && state.draggedCityIdx !== null) {
      state.cities[state.draggedCityIdx].x = mouseX;
      state.cities[state.draggedCityIdx].y = mouseY;
      draw();
    }
  });

  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check if clicked an existing city
    const hitRadius = 12;
    let foundIdx = null;

    for (let i = 0; i < state.cities.length; i++) {
      const c = state.cities[i];
      if (Math.hypot(c.x - mouseX, c.y - mouseY) <= hitRadius) {
        foundIdx = i;
        break;
      }
    }

    if (foundIdx !== null) {
      state.isDragging = true;
      state.draggedCityIdx = foundIdx;
    } else {
      // Add new city at mouse position
      const newId = state.cities.length;
      state.cities.push({
        id: newId,
        name: `City ${newId + 1}`,
        x: mouseX,
        y: mouseY
      });
      presetSelect.value = 'custom';
      cityRange.value = state.cities.length;
      cityCountLabel.textContent = state.cities.length;
      updateBBSafetyCheck();
      solveAndRender();
    }
  });

  window.addEventListener('mouseup', () => {
    if (state.isDragging) {
      state.isDragging = false;
      state.draggedCityIdx = null;
      solveAndRender();
    }
  });

  // Modals
  btnOpenTheory.addEventListener('click', () => theoryModal.classList.remove('hidden'));
  btnCloseTheory.addEventListener('click', () => theoryModal.classList.add('hidden'));
  btnCloseTheoryBottom.addEventListener('click', () => theoryModal.classList.add('hidden'));

  btnExportModal.addEventListener('click', () => exportModal.classList.remove('hidden'));
  btnCloseExport.addEventListener('click', () => exportModal.classList.add('hidden'));

  btnExportJSON.addEventListener('click', exportJSON);
  btnExportCSV.addEventListener('click', exportCSV);
  btnExportMarkdown.addEventListener('click', exportMarkdown);

  btnRunScalabilitySuite.addEventListener('click', runLiveScalabilityBenchmark);
}

// ==============================================================================
// 7. Export Utilities
// ==============================================================================
function exportJSON() {
  if (!state.results) return;
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state.results, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `tsp_benchmark_${Date.now()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function exportCSV() {
  if (!state.results) return;
  const algos = state.results.algorithms;
  let csv = 'Algorithm,Tour Cost,Execution Time (ms),Optimality Gap (%),Approximation Ratio,Complexity\n';

  for (const [key, data] of Object.entries(algos)) {
    const cost = data.cost !== null ? data.cost : '';
    const time = data.timeMs !== null ? data.timeMs : '';
    const gap = data.optimalityGapPct !== undefined ? data.optimalityGapPct : '';
    const ratio = data.approxRatio !== undefined ? data.approxRatio : '';
    let comp = 'O(N^2)';
    if (key === 'branchAndBound') comp = 'O(N!)';
    if (key === 'christofides') comp = 'O(N^3)';

    csv += `"${data.name}",${cost},${time},${gap},${ratio},"${comp}"\n`;
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', `tsp_results_${Date.now()}.csv`);
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function exportMarkdown() {
  if (!state.results) return;
  const algos = state.results.algorithms;
  let md = `### Travelling Salesperson Problem – Benchmark Results (N=${state.cities.length})\n\n`;
  md += '| Algorithm | Route Cost | Execution Time | Optimality Gap | Approx Ratio |\n';
  md += '|:---|:---:|:---:|:---:|:---:|\n';

  for (const [key, data] of Object.entries(algos)) {
    const cost = data.cost !== null ? data.cost.toFixed(2) : 'N/A';
    const time = data.timeMs !== null ? `${data.timeMs.toFixed(2)} ms` : 'N/A';
    const gap = data.optimalityGapPct !== undefined ? `${data.optimalityGapPct.toFixed(1)}%` : 'N/A';
    const ratio = data.approxRatio !== undefined ? data.approxRatio.toFixed(3) : 'N/A';
    md += `| **${data.name}** | ${cost} | ${time} | ${gap} | ${ratio} |\n`;
  }

  navigator.clipboard.writeText(md).then(() => {
    alert('Markdown benchmark summary copied to clipboard!');
  });
}

// Start application
initApp();
