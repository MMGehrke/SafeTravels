#!/bin/bash

# Quick Start Script for Galois Testing
# This script helps you start both backend and frontend for testing

echo "🚀 Galois Testing Setup"
echo "============================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "safe-travels-backend" ]; then
  echo "❌ Error: Please run this script from the Galois root directory"
  exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing frontend dependencies..."
  npm install
fi

if [ ! -d "safe-travels-backend/node_modules" ]; then
  echo "📦 Installing backend dependencies..."
  cd safe-travels-backend
  npm install
  cd ..
fi

echo ""
echo "✅ Dependencies installed"
echo ""
echo "📋 To test the app, you need TWO terminal windows:"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd safe-travels-backend"
echo "  npm run dev"
echo ""
echo "Terminal 2 - Frontend:"
echo "  npm start"
echo "  Then press 'i' for iOS or 'a' for Android"
echo ""
echo "Or use the commands below:"
echo ""

# Ask user what they want to do
echo "What would you like to do?"
echo "1) Start backend server"
echo "2) Start frontend (React Native)"
echo "3) Start both (requires 2 terminals)"
echo "4) Test backend endpoints only"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
  1)
    echo "Starting backend server..."
    cd safe-travels-backend
    npm run dev
    ;;
  2)
    echo "Starting frontend..."
    echo "⚠️  Make sure backend is running first!"
    npm start
    ;;
  3)
    echo "⚠️  This will open backend in background"
    echo "Starting backend..."
    cd safe-travels-backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    sleep 2
    echo "Starting frontend..."
    npm start
    # Cleanup on exit
    trap "kill $BACKEND_PID" EXIT
    ;;
  4)
    echo "Testing backend endpoints..."
    cd safe-travels-backend
    echo ""
    echo "Testing health endpoint..."
    curl -s http://localhost:3000/health | head -5
    echo ""
    echo ""
    echo "Run these commands to test more:"
    echo "  ./test-endpoint.sh"
    echo "  ./test-pathfinding.sh"
    echo "  ./test-ai-advisor.sh"
    echo "  ./test-rate-limit.sh"
    ;;
  *)
    echo "Invalid choice"
    exit 1
    ;;
esac

