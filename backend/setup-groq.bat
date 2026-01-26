@echo off
REM Groq LLM Integration Quick Setup Script (Windows)

echo.
echo 🚀 Codeverse Groq LLM Integration Setup
echo ========================================
echo.

REM Check if we're in the backend directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the backend directory
    echo Usage: cd backend ^&^& setup-groq.bat
    pause
    exit /b 1
)

echo ✅ Found package.json
echo.

REM Install groq-sdk
echo 📦 Installing Groq SDK...
call npm install groq-sdk

if errorlevel 1 (
    echo ❌ Failed to install groq-sdk
    pause
    exit /b 1
)

echo ✅ Groq SDK installed
echo.

REM Check if .env exists
if not exist ".env" (
    echo ⚠️  .env file not found
    echo Creating .env from .env.example...
    copy .env.example .env
    echo ✅ Created .env file
) else (
    echo ✅ .env file already exists
)

echo.
echo 📋 NEXT STEPS:
echo ==============
echo.
echo 1. Get your Groq API Key:
echo    👉 Visit https://console.groq.com/keys
echo    👉 Sign up / Login
echo    👉 Create new API key
echo.
echo 2. Add API Key to .env:
echo    👉 Open: .env
echo    👉 Find: GROQ_API_KEY=...
echo    👉 Replace with your key: GROQ_API_KEY=gsk_your_key_here
echo.
echo 3. Save .env and restart backend:
echo    👉 npm run dev
echo.
echo 4. Test the integration:
echo    👉 Submit code with high complexity
echo    👉 Check console for LLM validation logs
echo.
echo ✨ Setup complete! Happy coding!
echo.
pause
