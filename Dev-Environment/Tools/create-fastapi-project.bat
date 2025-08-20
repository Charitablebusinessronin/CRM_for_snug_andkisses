@echo off
setlocal ENABLEDELAYEDEXPANSION

REM Usage: create-fastapi-project.bat project-name
set PROJECT_NAME=%1
if "%PROJECT_NAME%"=="" (
  echo Usage: create-fastapi-project.bat project-name
  echo Example: create-fastapi-project.bat snug-kisses-api
  exit /b 1
)

set ROOT_DIR=%~dp0..
for %%I in ("%ROOT_DIR%") do set ROOT_DIR=%%~fI
set PROJECTS_DIR=%ROOT_DIR%\python-projects

REM Prefer Python 3.9 if available via py launcher
where py >NUL 2>&1
if %ERRORLEVEL%==0 (
  py -3.9 -c "import sys;print(sys.version)" >NUL 2>&1
  if %ERRORLEVEL%==0 (
    set PY_CMD=py -3.9
  ) else (
    set PY_CMD=py
  )
) else (
  set PY_CMD=python
)

REM Prefer uv if available
where uv >NUL 2>&1
if %ERRORLEVEL%==0 (
  set PIP_CMD=uv pip
) else (
  set PIP_CMD=%PY_CMD% -m pip
)

echo ------------------------------------------------------------
echo 🚀 Creating FastAPI project: %PROJECT_NAME%
echo Root: %ROOT_DIR%
echo Python: %PY_CMD%
echo Installer: %PIP_CMD%
echo ------------------------------------------------------------

pushd "%PROJECTS_DIR%"
mkdir "%PROJECT_NAME%" 2>NUL
pushd "%PROJECT_NAME%"

echo 📦 Setting up virtual environment...
%PY_CMD% -m venv venv
if not exist "venv\Scripts\activate.bat" (
  echo ❌ Failed to create virtual environment. Aborting.
  exit /b 1
)
call venv\Scripts\activate.bat

echo 📥 Upgrading pip/setuptools/wheel...
%PY_CMD% -m pip install --upgrade pip setuptools wheel >NUL

echo 📥 Installing dependencies...
%PIP_CMD% install fastapi "uvicorn[standard]" sqlalchemy pydantic python-dotenv requests >NUL
%PIP_CMD% install pytest black flake8 >NUL

echo 📂 Creating project structure...
mkdir app 2>NUL
mkdir app\api 2>NUL
mkdir app\core 2>NUL
mkdir app\models 2>NUL
mkdir app\schemas 2>NUL
mkdir app\services 2>NUL
mkdir tests 2>NUL
mkdir docs 2>NUL
mkdir data 2>NUL
mkdir logs 2>NUL

echo 📄 Creating main application file...
> app\main.py echo from fastapi import FastAPI
>> app\main.py echo from fastapi.middleware.cors import CORSMiddleware
>> app\main.py echo
>> app\main.py echo app = FastAPI(
>> app\main.py echo ^    title="%PROJECT_NAME%",
>> app\main.py echo ^    description="Sabir's %PROJECT_NAME% API",
>> app\main.py echo ^    version="1.0.0"
>> app\main.py echo ^)
>> app\main.py echo
>> app\main.py echo # CORS Configuration
>> app\main.py echo app.add_middleware(
>> app\main.py echo ^    CORSMiddleware,
>> app\main.py echo ^    allow_origins=["http://localhost:4728", "http://localhost:3000"],
>> app\main.py echo ^    allow_credentials=True,
>> app\main.py echo ^    allow_methods=["*"],
>> app\main.py echo ^    allow_headers=["*"],
>> app\main.py echo )
>> app\main.py echo
>> app\main.py echo @app.get("/")
>> app\main.py echo def read_root():
>> app\main.py echo ^    return {
>> app\main.py echo ^        "project": "%PROJECT_NAME%",
>> app\main.py echo ^        "status": "running",
>> app\main.py echo ^        "port": 4728,
>> app\main.py echo ^        "developer": "Sabir Asheed",
>> app\main.py echo ^    }
>> app\main.py echo
>> app\main.py echo @app.get("/health")
>> app\main.py echo def health_check():
>> app\main.py echo ^    return {"status": "healthy"}

echo 🔧 Creating environment file from template...
if exist "%ROOT_DIR%\.env.template" (
  copy /Y "%ROOT_DIR%\.env.template" ".env" >NUL
) else (
  echo WARNING: .env.template not found in %ROOT_DIR% ^- creating minimal .env
  > .env echo DEBUG=True
  >> .env echo PORT=4728
)

echo # %PROJECT_NAME% Requirements> requirements.txt
echo # Generated on %DATE% %TIME%>> requirements.txt
%PY_CMD% -m pip freeze >> requirements.txt

echo 🧪 Creating test file...
> tests\test_main.py echo from fastapi.testclient import TestClient
>> tests\test_main.py echo from app.main import app
>> tests\test_main.py echo
>> tests\test_main.py echo client = TestClient(app)
>> tests\test_main.py echo
>> tests\test_main.py echo def test_read_root():
>> tests\test_main.py echo ^    response = client.get("/")
>> tests\test_main.py echo ^    assert response.status_code == 200
>> tests\test_main.py echo ^    assert response.json()["status"] == "running"

echo 📋 Creating run scripts...
> run-dev.bat echo @echo off
>> run-dev.bat echo call venv\Scripts\activate.bat
>> run-dev.bat echo uvicorn app.main:app --reload --port 4728 --host 0.0.0.0

> run-tests.bat echo @echo off
>> run-tests.bat echo call venv\Scripts\activate.bat
>> run-tests.bat echo pytest tests/ -v

> format-code.bat echo @echo off
>> format-code.bat echo call venv\Scripts\activate.bat
>> format-code.bat echo black app/ tests/
>> format-code.bat echo flake8 app/ tests/

echo 🐳 Creating Docker assets...
> Dockerfile echo FROM python:3.9-slim
>> Dockerfile echo ENV PYTHONDONTWRITEBYTECODE=1 ^\
>> Dockerfile echo ^    PYTHONUNBUFFERED=1 ^\
>> Dockerfile echo ^    PIP_NO_CACHE_DIR=1
>> Dockerfile echo WORKDIR /app
>> Dockerfile echo COPY requirements.txt ./
>> Dockerfile echo RUN pip install --upgrade pip ^&^& pip install -r requirements.txt
>> Dockerfile echo COPY . .
>> Dockerfile echo EXPOSE 4728
>> Dockerfile echo CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "4728"]

> .dockerignore echo __pycache__/
>> .dockerignore echo .pytest_cache/
>> .dockerignore echo .mypy_cache/
>> .dockerignore echo venv/
>> .dockerignore echo .env
>> .dockerignore echo .DS_Store
>> .dockerignore echo *.pyc

> compose.yml echo services:
>> compose.yml echo ^  api:
>> compose.yml echo ^    build: .
>> compose.yml echo ^    env_file:
>> compose.yml echo ^      - .env
>> compose.yml echo ^    ports:
>> compose.yml echo ^      - "4728:4728"
>> compose.yml echo ^    volumes:
>> compose.yml echo ^      - .:/app
>> compose.yml echo ^    depends_on:
>> compose.yml echo ^      - db
>> compose.yml echo ^  db:
>> compose.yml echo ^    image: postgres:16
>> compose.yml echo ^    environment:
>> compose.yml echo ^      POSTGRES_USER: sabir
>> compose.yml echo ^      POSTGRES_PASSWORD: devpass
>> compose.yml echo ^      POSTGRES_DB: sabir_dev
>> compose.yml echo ^    ports:
>> compose.yml echo ^      - "5432:5432"
>> compose.yml echo ^    volumes:
>> compose.yml echo ^      - pgdata:/var/lib/postgresql/data
>> compose.yml echo volumes:
>> compose.yml echo ^  pgdata:

> run-docker.bat echo @echo off
>> run-docker.bat echo docker compose -f compose.yml up --build

echo ✅ Project %PROJECT_NAME% created successfully!
echo.
echo 🚀 Quick Start:
echo   cd python-projects\%PROJECT_NAME%
echo   .\run-dev.bat
echo   rem Or with Docker:
echo   docker compose -f compose.yml up --build
echo.
echo 🌐 API:   http://localhost:4728
echo 📖 Docs:  http://localhost:4728/docs
echo 🧾 ReDoc: http://localhost:4728/redoc

popd
popd
endlocal
exit /b 0
