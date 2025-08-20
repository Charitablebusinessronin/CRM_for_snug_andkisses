@echo off
call venv\Scripts\activate.bat
uvicorn app.main:app --reload --port 4728 --host 0.0.0.0
