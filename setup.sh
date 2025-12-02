#!/bin/bash

# AI Verifier Setup Script
# This script helps you set up the AI Verifier application

set -e

echo "================================"
echo "AI Verifier Setup Script"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo "Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed.${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✓ Node.js is installed: $(node --version)${NC}"

# Check if Yarn is installed
if ! command -v yarn &> /dev/null; then
    echo -e "${YELLOW}⚠ Warning: Yarn is not installed.${NC}"
    echo "Installing Yarn globally via npm..."
    npm install -g yarn
    echo -e "${GREEN}✓ Yarn installed: $(yarn --version)${NC}"
else
    echo -e "${GREEN}✓ Yarn is installed: $(yarn --version)${NC}"
fi

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo -e "${YELLOW}⚠ Warning: MySQL is not installed or not in PATH.${NC}"
    echo "Please install MySQL from https://dev.mysql.com/downloads/mysql/"
    echo ""
    read -p "Do you want to continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✓ MySQL is installed${NC}"
fi

echo ""
echo "================================"
echo "Step 1: Backend Setup"
echo "================================"
echo ""

# Backend setup
cd backend

echo "Installing backend dependencies..."
yarn install

echo ""
echo -e "${GREEN}✓ Backend dependencies installed${NC}"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo -e "${YELLOW}⚠ Please edit backend/.env file with your MySQL credentials${NC}"
    echo ""
    read -p "Enter MySQL password: " mysql_password

    # Update .env file with password
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/DB_PASSWORD=your_password/DB_PASSWORD=$mysql_password/" .env
    else
        # Linux
        sed -i "s/DB_PASSWORD=your_password/DB_PASSWORD=$mysql_password/" .env
    fi

    echo -e "${GREEN}✓ .env file created and configured${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

echo ""
read -p "Initialize database now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Initializing database..."
    yarn init-db
    echo -e "${GREEN}✓ Database initialized${NC}"
fi

cd ..

echo ""
echo "================================"
echo "Step 2: Frontend Setup"
echo "================================"
echo ""

# Frontend setup
cd frontend

echo "Installing frontend dependencies..."
yarn install

echo ""
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

cd ..

echo ""
echo "================================"
echo "Setup Complete! 🎉"
echo "================================"
echo ""
echo "To start the application:"
echo ""
echo -e "${GREEN}Terminal 1 (Backend):${NC}"
echo "  cd backend"
echo "  yarn dev"
echo ""
echo -e "${GREEN}Terminal 2 (Frontend):${NC}"
echo "  cd frontend"
echo "  yarn dev"
echo ""
echo "Then open http://localhost:3000 in your browser"
echo ""
echo "Next steps:"
echo "1. Register/Login to create your account"
echo "2. Go to Settings page"
echo "3. Add at least one AI provider with API key"
echo "4. Mark one provider as 'Verifier'"
echo "5. Start chatting!"
echo ""
echo "For detailed instructions, see QUICKSTART.md"
echo ""
