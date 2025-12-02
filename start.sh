#!/bin/bash

# AI Verifier Start Script
# Starts both backend and frontend in separate terminal windows

echo "Starting AI Verifier..."
echo ""

# Check OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    echo "Starting backend..."
    osascript -e 'tell app "Terminal" to do script "cd '"$PWD"'/backend && yarn dev"'

    sleep 2

    echo "Starting frontend..."
    osascript -e 'tell app "Terminal" to do script "cd '"$PWD"'/frontend && yarn dev"'

elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "cd $PWD/backend && yarn dev; exec bash"
        sleep 2
        gnome-terminal -- bash -c "cd $PWD/frontend && yarn dev; exec bash"
    elif command -v xterm &> /dev/null; then
        xterm -e "cd $PWD/backend && yarn dev" &
        sleep 2
        xterm -e "cd $PWD/frontend && yarn dev" &
    else
        echo "No suitable terminal found. Please start manually:"
        echo ""
        echo "Terminal 1: cd backend && yarn dev"
        echo "Terminal 2: cd frontend && yarn dev"
        exit 1
    fi
else
    echo "Unsupported OS. Please start manually:"
    echo ""
    echo "Terminal 1: cd backend && yarn dev"
    echo "Terminal 2: cd frontend && yarn dev"
    exit 1
fi

echo ""
echo "✓ Services starting..."
echo ""
echo "Backend will be available at: http://localhost:3001"
echo "Frontend will be available at: http://localhost:3000"
echo ""
echo "Open http://localhost:3000 in your browser"
echo ""
