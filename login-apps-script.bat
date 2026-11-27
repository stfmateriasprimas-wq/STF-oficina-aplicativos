@echo off
chcp 65001 > nul
echo ========================================================
echo   STF GROUP · INICIAR SESION EN GOOGLE APPS SCRIPT
echo ========================================================
echo.
echo Se abrira tu navegador para autorizar a @google/clasp
echo con la cuenta de Google que administra este proyecto.
echo.
echo IMPORTANTE: Si es la primera vez que usas clasp, asegurate
echo de tener activada la API de Google Apps Script en:
echo https://script.google.com/home/usersettings
echo.
npx @google/clasp login
pause
