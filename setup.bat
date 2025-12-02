@echo off
REM AI Verifier Setup Script for Windows
REM This script helps you set up the AI Verifier application

echo ================================
echo AI Verifier Setup Script
echo ================================
echo.

REM Check if Node.js is installed
echo Checking prerequisites...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

node --version
echo Node.js is installed

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: npm is not installed.
    pause
    exit /b 1
)

npm --version
echo npm is installed

REM Check if MySQL is installed
where mysql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Warning: MySQL is not installed or not in PATH.
    echo Please install MySQL from https://dev.mysql.com/downloads/mysql/
    echo.
    set /p continue="Do you want to continue anyway? (y/n): "
    if /i not "%continue%"=="y" exit /b 1
) else (
    echo MySQL is installed
)

echo.
echo ================================
echo Step 1: Backend Setup
echo ================================
echo.

cd backend

echo Installing backend dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo Error installing backend dependencies
    pause
    exit /b 1
)

echo Backend dependencies installed successfully
echo.

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo.
    echo Please edit backend\.env file with your MySQL credentials
    echo.
    set /p mysql_password="Enter MySQL password: "

    REM Note: This is a simple replacement. For production, use a proper tool
    powershell -Command "(gc .env) -replace 'DB_PASSWORD=your_password', 'DB_PASSWORD=%mysql_password%' | Out-File -encoding ASCII .env"

    echo .env file created and configured
) else (
    echo .env file already exists
)

echo.
set /p init_db="Initialize database now? (y/n): "
if /i "%init_db%"=="y" (
    echo Initializing database...
    call npm run init-db
    if %ERRORLEVEL% EQU 0 (
        echo Database initialized successfully
    ) else (
        echo Error initializing database. Please check your MySQL connection.
    )
)

cd ..

echo.
echo ================================
echo Step 2: Frontend Setup
echo ================================
echo.

cd frontend

echo Installing frontend dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo Error installing frontend dependencies
    pause
    exit /b 1
)

echo Frontend dependencies installed successfully

cd ..

echo.
echo ================================
echo Setup Complete!
echo ================================
echo.
echo To start the application:
echo.
echo Terminal 1 (Backend):
echo   cd backend
echo   npm run dev
echo.
echo Terminal 2 (Frontend):
echo   cd frontend
echo   npm run dev
echo.
echo Then open http://localhost:3000 in your browser
echo.
echo Next steps:
echo 1. Go to Settings page
echo 2. Add at least one AI provider with API key
echo 3. Mark one provider as 'Verifier'
echo 4. Start chatting!
echo.
echo For detailed instructions, see QUICKSTART.md
echo.
pause
