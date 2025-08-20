@echo off
call venv\Scripts\activate.bat
black app/ tests/
flake8 app/ tests/
