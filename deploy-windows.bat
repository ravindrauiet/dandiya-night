@echo off
REM Deploys this site to Netlify directly from your computer (no GitHub needed).
REM Requires Node.js 20+ from https://nodejs.org

cd /d "%~dp0"
echo.
echo === Installing packages ===
call npm install || goto :error

echo.
echo === Logging in to Netlify (a browser window will open) ===
call npx -y netlify-cli login || goto :error

if not exist ".netlify\state.json" (
  echo.
  echo === Creating a new Netlify site ===
  call npx -y netlify-cli sites:create || goto :error
)

echo.
set /p EUSER=Enter the Gmail address that sends emails:
set /p EPASS=Enter the Gmail App Password:
call npx -y netlify-cli env:set EMAIL_USER "%EUSER%" || goto :error
call npx -y netlify-cli env:set EMAIL_PASS "%EPASS%" || goto :error

echo.
echo === Building and deploying ===
call npx -y netlify-cli deploy --build --prod || goto :error

echo.
echo Done! Open the "Website URL" shown above and test a booking.
pause
exit /b 0

:error
echo.
echo Something failed. Copy the red error text above and send it to Claude.
pause
exit /b 1
