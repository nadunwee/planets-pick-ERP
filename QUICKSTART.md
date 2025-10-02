# Quick Start Guide - AI Financial Insights

This guide will help you start the AI Financial Insights service quickly.

## Prerequisites

- Python 3.12+ (installed)
- Node.js 18+ (installed)
- MongoDB (optional - mock data will be used if unavailable)

## Quick Start (All Services)

### Option 1: Use the startup script (Recommended)

```bash
# Start all services at once
./start-services.sh
```

This will start:
- 🤖 AI Service on port 5001
- 🔧 Backend on port 4000  
- 🌐 Frontend on port 5173

To stop all services:
```bash
./stop-services.sh
```

### Option 2: Start services manually

#### 1. Start AI Service (Required for predictions)

```bash
cd ai-service
pip3 install -r requirements.txt  # First time only
python3 app.py
```

The AI service will start on http://localhost:5001

#### 2. Start Backend (Required)

Open a new terminal:
```bash
cd backend
npm install  # First time only
npm start
```

The backend will start on http://localhost:4000

#### 3. Start Frontend (Optional for testing)

Open another terminal:
```bash
npm install  # First time only
npm run dev
```

The frontend will start on http://localhost:5173

## Testing the AI Service

### 1. Health Check
```bash
curl http://localhost:5001/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "Finance AI Prediction Service",
  "version": "1.0.0"
}
```

### 2. Get Predictions
```bash
curl http://localhost:5001/predict
```

### 3. Test through Backend
```bash
curl http://localhost:4000/api/finance-ai/predict
```

## Accessing the Finance Page

1. Make sure all services are running
2. Open your browser and go to: http://localhost:5173/finance
3. The AI Financial Insights section will appear with:
   - 3-month financial predictions
   - AI-generated insights
   - Prediction chart showing trends

## Troubleshooting

### AI Service won't start

**Problem**: `ModuleNotFoundError` or import errors

**Solution**: 
```bash
cd ai-service
pip3 install -r requirements.txt
```

### Port already in use

**Problem**: `Address already in use` error

**Solution**: Find and kill the process using the port:
```bash
# For AI service (port 5001)
lsof -ti:5001 | xargs kill

# For backend (port 4000)  
lsof -ti:4000 | xargs kill

# For frontend (port 5173)
lsof -ti:5173 | xargs kill
```

### "AI prediction service is currently unavailable" error

**Problem**: Frontend shows this error message

**Solution**: Make sure the AI service is running on port 5001:
```bash
cd ai-service
python3 app.py
```

### Database connection failed

**Problem**: Backend shows "Database connection error"

**Solution**: This is normal if MongoDB is not set up. The backend will use mock data and still work with the AI service.

## Production Deployment

For production deployment, consider:

1. **Use a production WSGI server** for Flask:
   ```bash
   pip3 install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5001 app:app
   ```

2. **Use PM2 for process management**:
   ```bash
   npm install -g pm2
   pm2 start ai-service/app.py --name ai-service --interpreter python3
   pm2 start backend/server.js --name backend
   pm2 save
   ```

3. **Set up as systemd service** (see `ai-service/ai-service.service` for example)

## Architecture

```
Frontend (React) :5173
    ↓
Backend (Express) :4000
    ↓
AI Service (Flask) :5001
```

The frontend calls the backend's `/api/finance-ai/predict` endpoint, which proxies the request to the Python AI service.

## Features

- **Financial Predictions**: 3-month forecasts for income, expenses, and profit
- **AI Insights**: Automated analysis and recommendations
- **Historical Trends**: Visualize past 6 months of data
- **Machine Learning**: Linear regression models trained on your transaction data

## More Information

See `AI_FINANCE_PREDICTION.md` for detailed documentation.
