#!/bin/bash

# Start All Services for Planets Pick ERP
# This script starts the AI service, backend, and frontend

echo "🚀 Starting Planets Pick ERP Services..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        return 0
    else
        return 1
    fi
}

# Check and start AI Service (Port 5001)
echo -e "${YELLOW}1. Starting AI Prediction Service (Port 5001)...${NC}"
if check_port 5001; then
    echo -e "${GREEN}   ✓ AI service already running on port 5001${NC}"
else
    cd ai-service
    python3 app.py > ../logs/ai-service.log 2>&1 &
    AI_PID=$!
    echo $AI_PID > ../logs/ai-service.pid
    echo -e "${GREEN}   ✓ AI service started (PID: $AI_PID)${NC}"
    cd ..
fi
echo ""

# Wait a moment for AI service to start
sleep 2

# Check and start Backend (Port 4000)
echo -e "${YELLOW}2. Starting Backend Server (Port 4000)...${NC}"
if check_port 4000; then
    echo -e "${GREEN}   ✓ Backend already running on port 4000${NC}"
else
    cd backend
    npm start > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../logs/backend.pid
    echo -e "${GREEN}   ✓ Backend started (PID: $BACKEND_PID)${NC}"
    cd ..
fi
echo ""

# Wait a moment for backend to start
sleep 3

# Check and start Frontend (Port 5173)
echo -e "${YELLOW}3. Starting Frontend (Port 5173)...${NC}"
if check_port 5173; then
    echo -e "${GREEN}   ✓ Frontend already running on port 5173${NC}"
else
    npm run dev > logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > logs/frontend.pid
    echo -e "${GREEN}   ✓ Frontend started (PID: $FRONTEND_PID)${NC}"
fi
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ All services started successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Services running on:"
echo "  🤖 AI Service:  http://localhost:5001"
echo "  🔧 Backend:     http://localhost:4000"
echo "  🌐 Frontend:    http://localhost:5173"
echo ""
echo "To stop all services, run: ./stop-services.sh"
echo "Or press Ctrl+C if running in foreground"
