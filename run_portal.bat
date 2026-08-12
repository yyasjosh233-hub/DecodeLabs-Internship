@echo off
echo Starting Industrial Automation Platform Portal on http://localhost:5000/
cd /d "%~dp0"
call npm run build
python quality_inspection_system/app.py
pause
