# Travelling Salesperson Problem (TSP) – Optimal and Approximate Route Planning
### Capstone Project & Interactive Web Dashboard

A comprehensive, production-grade route optimization system that solves the Travelling Salesperson Problem using both **Exact Optimal** and **Theoretical Approximation** algorithms, complete with an interactive visual dashboard and benchmark suite.

---

## 🌟 Key Features

1. **Exact Optimal Solver (Branch & Bound)**:
   - Formulated with the **Reduced Cost Matrix** method (Little et al.).
   - Best-First Search tree exploration with Min-Heap priority queue.
   - Matrix reduction lower bounding and branch pruning.
   - Guaranteed global mathematical optimum for $N \le 16$.

2. **Theoretical Approximation Algorithms**:
   - **Christofides-Serdyukov Algorithm (1.5-Approximation)**: Guaranteed tour cost $\le 1.5 \times \text{OPT}$ on Metric TSP using Minimum Spanning Tree (MST) + Minimum Weight Perfect Matching on odd-degree vertices + Hierholzer's Eulerian circuit + Shortcutting.
   - **2-Approximation Algorithm (MST Doubling)**: Guaranteed $\le 2.0 \times \text{OPT}$ via Prim's MST and preorder DFS traversal.
   - **Nearest Neighbor Heuristic**: Greedy $O(N^2)$ baseline.
   - **2-Opt Local Search**: Iterative edge-untangling heuristic that refines approximation tours to within **0% to 3%** of the exact optimum.
   - **Simulated Annealing**: Metaheuristic for very large TSP instances ($N \ge 30$).

3. **Interactive Visual Dashboard & Website**:
   - **High-Definition Canvas**: Click to add cities anywhere, drag to reposition cities in real time!
   - **Preset Geographic Datasets**:
     - 🇮🇳 India Tech & Metro Hubs (10 cities: Delhi, Mumbai, Bengaluru, Hyderabad, Chennai, etc.)
     - 🇺🇸 US Major Metros (14 cities: New York, LA, Chicago, Seattle, Miami, etc.)
     - 🇪🇺 European Capitals (12 cities: London, Paris, Berlin, Rome, Madrid, etc.)
     - 🏛️ TSPLIB Classic Benchmarks (`bays29`)
     - 📦 Clustered Logistics Hubs & Circular Polygons
   - **Multi-Layer Route Overlay**: Compare Branch & Bound, Christofides, 2-Opt, and 2-Approximation paths side-by-side or isolated.
   - **Tour Playback Animation**: Animated runner traversing the tour edge-by-edge with interactive speed control.
   - **Real-Time Performance Cards**: Optimal Cost, Fastest Execution Time, B&B Pruned Nodes, and Christofides Optimality Gap %.
   - **Chart.js Analytics**: Live Cost Comparison, Logarithmic Execution Time Bar Chart, and Scalability Curves ($N=4$ to $40$).
   - **Export Tools**: Export full benchmark datasets to JSON, CSV, or formatted Markdown tables.
   - **Theory Drawer**: Built-in modal with mathematical definitions, theorems, and proofs.

4. **Dual-Language Implementations**:
   - **JavaScript / ES Modules** (`src/algorithms/`): Powers the browser dashboard, Node.js server, and tests.
   - **Python 3 Package** (`python/`): Standalone Python implementations (`tsp_branch_and_bound.py`, `tsp_approximations.py`, `tsp_benchmark.py`, `test_tsp.py`) with zero external pip dependencies.

---

## 🚀 Quick Start Guide

### Option 1: One-Click Launcher (Windows)
Double-click `start_dashboard.bat` in the project directory. It will start the server and automatically launch your browser to:
```
http://localhost:3000
```

---

### Option 2: Running via Terminal / VS Code

1. **Open the project folder in VS Code**:
   ```powershell
   code C:\Users\kunal\.gemini\antigravity\scratch\tsp-route-optimizer
   ```

2. **Start the Web Dashboard**:
   ```powershell
   npm start
   ```
   Open [http://localhost:3000](http://localhost:3000) in your web browser.

3. **Run Algorithmic Unit Tests**:
   ```powershell
   npm test
   ```
   Verifies:
   - Branch & Bound optimality and valid cycle generation
   - 2-Approximation bound ($\le 2.0 \times \text{OPT}$)
   - Christofides 1.5-approximation bound ($\le 1.5 \times \text{OPT}$)
   - 2-Opt monotonic route improvement

4. **Run Algorithmic Benchmark Suite (CLI)**:
   ```powershell
   npm run benchmark
   ```

---

## 📂 Project Structure

```text
tsp-route-optimizer/
├── index.html                   # Main Capstone Web Dashboard
├── server.js                    # Zero-dependency Node.js HTTP server
├── package.json                 # Project scripts and configurations
├── start_dashboard.bat          # One-click Windows desktop launcher
├── CAPSTONE_REPORT.md           # Full academic report with proofs & results
├── README.md                    # Project documentation
│
├── .vscode/                     # VS Code IDE Integration
│   ├── launch.json              # Debug & Run launch configurations
│   ├── tasks.json               # One-click build & test tasks
│   ├── settings.json            # Editor formatting & workspace settings
│   └── extensions.json          # Recommended VS Code plugins
│
├── src/
│   ├── app.js                   # UI controller, canvas rendering & Chart.js
│   ├── algorithms/              # Core TSP Algorithmic Engines
│   │   ├── tspMetrics.js        # Distance matrix & tour cost helpers
│   │   ├── branchAndBound.js    # Reduced cost matrix exact solver
│   │   ├── mst2Approx.js        # Prim's MST & 2-approximation preorder walk
│   │   ├── christofides.js      # 1.5-Approximation algorithm
│   │   ├── nearestNeighbor.js   # Greedy nearest neighbor heuristic
│   │   ├── twoOpt.js            # 2-Opt local search post-optimizer
│   │   ├── simulatedAnnealing.js# Probabilistic metaheuristic for large N
│   │   └── benchmarkSuite.js    # Multi-algorithm performance evaluator
│   ├── data/
│   │   └── presetDatasets.js    # India, US, Europe, Bays29 & generator logic
│   ├── cli/
│   │   └── runBenchmark.js      # Terminal benchmark runner (N=4 to 50)
│   └── tests/
│       └── tsp.test.js          # Unit tests verifying mathematical bounds
│
└── python/                      # Standalone Python 3 Implementations
    ├── tsp_branch_and_bound.py  # Branch and Bound in pure Python
    ├── tsp_approximations.py    # Christofides, 2-Approx, 2-Opt in pure Python
    ├── tsp_benchmark.py         # Python benchmark suite
    └── test_tsp.py              # Python unittest test cases
```

---

## 📊 Empirical Benchmark Results Summary

| Problem Size ($N$) | Branch & Bound Time | Christofides Time | Christofides Gap (%) | 2-Opt Gap (%) |
|:---:|:---:|:---:|:---:|:---:|
| **4 Cities** | 0.70 ms | 0.82 ms | **0.0%** | **0.0%** |
| **6 Cities** | 1.67 ms | 0.16 ms | **0.0%** | **0.0%** |
| **8 Cities** | 6.78 ms | 0.14 ms | **1.1%** | **0.0%** |
| **10 Cities** | 19.52 ms | 0.11 ms | **5.1%** | **1.4%** |
| **12 Cities** | 94.23 ms | 0.16 ms | **6.3%** | **3.3%** |
| **14 Cities** | 31.91 ms | 0.14 ms | **0.0%** | **0.0%** |
| **16 Cities** | ~1850 ms | 0.44 ms | **6.5%** | **0.0%** |
| **20 Cities** | *Skipped (Factorial Explosion)* | 0.60 ms | — | **Near-Opt** |
| **50 Cities** | *Skipped* | 0.29 ms | — | **Near-Opt** |

---

## 🎓 Academic Conclusion

1. **Exact vs Approximation Boundary**: Branch and Bound guarantees the absolute shortest route, but faces the combinatorial barrier of $O(N!)$ worst-case time complexity, making it practical only for $N \le 16$.
2. **Practical Superiority of Christofides + 2-Opt**: By combining Christofides' guaranteed $1.5\times$ upper bound with 2-Opt local search edge uncrossing, near-optimal routes (often identical to exact optimal) are generated in **sub-millisecond execution times** ($< 1$ ms) even for 50+ cities.
