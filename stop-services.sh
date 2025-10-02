#!/bin/bash

# Stop All Services for Planets Pick ERP

echo "🛑 Stopping Planets Pick ERP Services..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Stop AI Service
if [ -f logs/ai-service.pid ]; then
    AI_PID=$(cat logs/ai-service.pid)
    if ps -p $AI_PID > /dev/null 2>&1; then
        kill $AI_PID
        echo -e "${GREEN}✓ AI service stopped (PID: $AI_PID)${NC}"
    fi
    rm logs/ai-service.pid
else
    # Try to find and kill by port
    AI_PID=$(lsof -ti:5001)
    if [ ! -z "$AI_PID" ]; then
        kill $AI_PID
        echo -e "${GREEN}✓ AI service stopped (PID: $AI_PID)${NC}"
    fi
fi

# Stop Backend
if [ -f logs/backend.pid ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        kill $BACKEND_PID
        echo -e "${GREEN}✓ Backend stopped (PID: $BACKEND_PID)${NC}"
    fi
    rm logs/backend.pid
else
    # Try to find and kill by port
    BACKEND_PID=$(lsof -ti:4000)
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID
        echo -e "${GREEN}✓ Backend stopped (PID: $BACKEND_PID)${NC}"
    fi
fi

# Stop Frontend
if [ -f logs/frontend.pid ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        kill $FRONTEND_PID
        echo -e "${GREEN}✓ Frontend stopped (PID: $FRONTEND_PID)${NC}"
    fi
    rm logs/frontend.pid
else
    # Try to find and kill by port
    FRONTEND_PID=$(lsof -ti:5173)
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID
        echo -e "${GREEN}✓ Frontend stopped (PID: $FRONTEND_PID)${NC}"
    fi
fi

echo ""
echo -e "${GREEN}✓ All services stopped${NC}"
