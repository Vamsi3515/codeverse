#!/bin/bash

# Groq LLM Integration Quick Setup Script
# This script helps you quickly set up Groq LLM integration

echo "🚀 Codeverse Groq LLM Integration Setup"
echo "========================================"
echo ""

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    echo "Usage: cd backend && bash setup-groq.sh"
    exit 1
fi

echo "✅ Found package.json"
echo ""

# Install groq-sdk
echo "📦 Installing Groq SDK..."
npm install groq-sdk

if [ $? -ne 0 ]; then
    echo "❌ Failed to install groq-sdk"
    exit 1
fi

echo "✅ Groq SDK installed"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "📋 NEXT STEPS:"
echo "=============="
echo ""
echo "1. Get your Groq API Key:"
echo "   👉 Visit https://console.groq.com/keys"
echo "   👉 Sign up / Login"
echo "   👉 Create new API key"
echo ""
echo "2. Add API Key to .env:"
echo "   👉 Open: .env"
echo "   👉 Find: GROQ_API_KEY=..."
echo "   👉 Replace with your key: GROQ_API_KEY=gsk_your_key_here"
echo ""
echo "3. Save .env and restart backend:"
echo "   👉 npm run dev"
echo ""
echo "4. Test the integration:"
echo "   👉 Submit code with high complexity"
echo "   👉 Check console for LLM validation logs"
echo ""
echo "✨ Setup complete! Happy coding!"
