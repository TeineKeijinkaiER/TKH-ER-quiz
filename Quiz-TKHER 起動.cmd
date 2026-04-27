@echo off
setlocal

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\open-local.ps1"
if errorlevel 1 (
  echo.
  pause
)
