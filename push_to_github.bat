@echo off
title Push Capstone Project to GitHub
echo ======================================================================
echo   Pushing Capstone Project to GitHub:
echo   Repository: https://github.com/kunalyadav-lab/CAPSTONE-PROJECT-.git
echo ======================================================================
echo.
echo Pushing branch 'main' to origin...
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
  echo ======================================================================
  echo   SUCCESS! Your project is live at:
  echo   https://github.com/kunalyadav-lab/CAPSTONE-PROJECT-
  echo ======================================================================
) else (
  echo.
  echo An error occurred during push. Please check your network connection.
)
echo.
pause
