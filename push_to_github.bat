@echo off
title Push Capstone Project to GitHub
echo ======================================================================
echo   Pushing Capstone Project to GitHub:
echo   Repository: https://github.com/kunal2007yadav-ctrl/capstone-project.git
echo ======================================================================
echo.
echo Make sure you have created the empty repository on GitHub:
echo https://github.com/new (Name: capstone-project)
echo.
echo Pushing branch 'main' to origin...
git push -u origin main
echo.
echo If push succeeded, your repository is live at:
echo https://github.com/kunal2007yadav-ctrl/capstone-project
echo.
pause
