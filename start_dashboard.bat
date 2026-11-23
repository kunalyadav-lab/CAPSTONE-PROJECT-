@echo off
title TSP Route Optimizer - Capstone Dashboard
echo ======================================================================
echo   TRAVELLING SALESPERSON PROBLEM - CAPSTONE PROJECT DASHBOARD
echo   Optimal (Branch and Bound) vs Approximation (Christofides & MST)
echo ======================================================================
echo.
echo Starting local web dashboard on http://localhost:3000 ...
start http://localhost:3000
node server.js
pause
