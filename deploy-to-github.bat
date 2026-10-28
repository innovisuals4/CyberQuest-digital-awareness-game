@echo off
REM ============================================================
REM  CyberQuest - one-click upload to GitHub
REM  Double-click this file and follow the prompts.
REM ============================================================
setlocal
cd /d "%~dp0"

where git >nul 2>nul
if errorlevel 1 (
  echo.
  echo  [X] Git is not installed yet. Install it first, then run this again.
  echo      Download: https://git-scm.com/download/win
  echo.
  pause
  exit /b 1
)

REM first-time identity for commits (only used inside this project)
git config user.name >nul 2>nul || git config user.name "%USERNAME%"
git config user.email >nul 2>nul || git config user.email "%USERNAME%@users.noreply.github.com"

if not exist ".git" (
  echo  [1/4] Preparing project...
  git init -b main >nul 2>nul || git init >nul 2>nul
  git add .
  git commit -m "CyberQuest - The Digital Awareness Challenge" >nul
) else (
  echo  [1/4] Project already prepared - committing latest changes...
  git add .
  git commit -m "Update" >nul 2>nul
)

echo  [2/4] Your repository web address:
echo        Example: https://github.com/your-username/digital-awareness-game.git
echo.
set /p REPO_URL="       Paste it here and press Enter: "

if "%REPO_URL%"=="" (
  echo  [X] No address entered. Run this again and paste the URL.
  pause
  exit /b 1
)

echo  [3/4] Connecting to GitHub...
git remote remove origin >nul 2>nul
git remote add origin "%REPO_URL%"

echo  [4/4] Uploading... a browser window will open for you to log in to GitHub.
git push -u origin main
if errorlevel 1 (
  echo.
  echo  [X] Upload failed. Most common cause: the GitHub repo already has files.
  echo      Tick "Initialize this repository with a README" is OFF when creating it,
  echo      or run:  git push -u origin main --force   ^(only for the first upload^)
  echo.
  pause
  exit /b 1
)

echo.
echo  ============================================================
echo   DONE! Now on GitHub:
echo     Settings -^> Pages -^> Source: "GitHub Actions"
echo   Then wait ~2 minutes for the "Deploy to GitHub Pages" run.
echo   Your game will be live at:
echo     https://your-username.github.io/your-repo-name/
echo  ============================================================
echo.
pause
