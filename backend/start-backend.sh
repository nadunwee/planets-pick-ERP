#!/bin/bash

echo "🚀 Planet's Pick ERP Backend Startup Script"
echo "=============================================="

# Check if MongoDB is running
if pgrep -x "mongod" > /dev/null; then
    echo "✅ MongoDB is running"
    echo "Starting backend with database connection..."
    npm run dev
else
    echo "❌ MongoDB is not running"
    echo ""
    echo "Options:"
    echo "1. Start backend without database (for testing API structure)"
    echo "2. Install and start MongoDB locally"
    echo "3. Use MongoDB Atlas (cloud database)"
    echo ""
    read -p "Choose option (1-3): " choice
    
    case $choice in
        1)
            echo "Starting backend without database..."
            npm run dev-no-db
            ;;
        2)
            echo "Installing MongoDB..."
            if command -v brew &> /dev/null; then
                brew tap mongodb/brew
                brew install mongodb-community
                brew services start mongodb-community
                echo "MongoDB installed and started. Now starting backend..."
                sleep 3
                npm run dev
            else
                echo "Homebrew not found. Please install MongoDB manually."
                echo "Visit: https://docs.mongodb.com/manual/installation/"
            fi
            ;;
        3)
            echo "Please update your .env file with MongoDB Atlas connection string:"
            echo "MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/planets-pick-erp"
            echo ""
            echo "Then run: npm run dev"
            ;;
        *)
            echo "Invalid option. Exiting."
            exit 1
            ;;
    esac
fi
