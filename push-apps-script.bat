@echo off
chcp 65001 > nul
echo ========================================================
echo   STF GROUP · SUBIENDO MODULOS A GOOGLE APPS SCRIPT
echo ========================================================
echo.
echo Sincronizando carpetas y modulos de backend-apps-script
echo hacia el proyecto oficial en la nube...
echo.
npx @google/clasp push -f
echo.
echo ========================================================
echo   SINCRONIZACION COMPLETADA CON EXITO
echo ========================================================
pause
