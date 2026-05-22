@echo off
REM Run Expo from plain CMD (interactive TTY) so the QR renders.
REM Cursor/CI terminals set CI=true, which hides the QR in Expo CLI.

cd /d "%~dp0"
set CI=
set EXPO_NO_QR_CODE=

REM Use offline start if expo.dev fetch fails ("TypeError: fetch failed");
REM remove --offline if your network is fine — better for tunnel updates.
echo Starting Expo Haven…
echo Tip: widen this window ~100 columns for a clearer QR scan.
echo.
npx expo start --offline --port 8088

pause
