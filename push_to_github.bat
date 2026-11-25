@echo off
title Push Capstone Project to GitHub
echo ======================================================================
echo   Pushing Capstone Project to GitHub:
echo   Repository: https://github.com/kunal2007yadav-ctrl/CAPSTONE-PROJECT.git
echo ======================================================================
echo.
echo Checking if remote repository exists...
echo If you have not created it yet on GitHub, create it at:
echo https://github.com/new?name=CAPSTONE-PROJECT
echo.
echo Pushing branch 'main' to origin...
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
  echo ======================================================================
  echo   SUCCESS! Your project is live at:
  echo   https://github.com/kunal2007yadav-ctrl/CAPSTONE-PROJECT
  echo ======================================================================
) else (
  echo.
  echo [NOTE] If you saw "repository not found", please open:
  echo https://github.com/new?name=CAPSTONE-PROJECT
  echo Click "Create repository" (leave it empty), then run this file again!
)
echo.
pause
