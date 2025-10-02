# AI Finance Prediction Feature

## Overview
The Finance module now includes AI-powered predictions that forecast future income, expenses, and profit for the next 3 months using machine learning.

## Architecture

```
Frontend (React/TypeScript)
    ↓
Backend API (Node.js/Express) :4000
    ↓
AI Service (Python/Flask) :5001
    ↓
MongoDB (Transaction Data)
```

## Components

### 1. AI Service (`ai-service/`)
- **Technology**: Python, Flask, scikit-learn, pandas
- **Port**: 5001
- **Endpoint**: `/predict`
- **Model**: Linear Regression for time-series forecasting

### 2. Backend Integration
- **Route**: `/api/finance-ai/predict`
- **Controller**: `financeAiController.js`
- **Function**: Proxies requests to Python AI service

### 3. Frontend UI (`Finance.tsx`)
- **AI Insights Box**: Displays actionable financial insights
- **Prediction Cards**: Shows 3-month forecast with income/expenses/profit
- **Prediction Chart**: Visualizes historical and predicted trends

## How It Works

1. **Data Collection**: AI service fetches transaction data from backend API
2. **Data Processing**: Groups transactions by month, separates income/expenses
3. **Model Training**: Linear regression models learn from historical patterns
4. **Prediction**: Forecasts next 3 months based on trends
5. **Insights Generation**: Analyzes predictions to provide actionable advice

## Setup Instructions

### Prerequisites
- Python 3.12+
- Node.js 18+
- MongoDB (optional, uses mock data if unavailable)

### Installation

1. **Install AI Service Dependencies**
   ```bash
   cd ai-service
   pip install -r requirements.txt
   ```

2. **Start AI Service**
   ```bash
   python app.py
   # Service starts on http://localhost:5001
   ```

3. **Start Backend** (separate terminal)
   ```bash
   cd backend
   npm install
   npm start
   # API starts on http://localhost:4000
   ```

4. **Start Frontend** (separate terminal)
   ```bash
   cd ..
   npm install
   npm run dev
   # App starts on http://localhost:5173
   ```

5. **Access Finance Page**
   Navigate to http://localhost:5173/finance

## API Reference

### GET /predict

Returns financial predictions for the next 3 months.

**Response:**
```json
{
  "success": true,
  "predictions": [
    {
      "month": "2025-11",
      "predicted_income": 525000,
      "predicted_expense": 367500,
      "predicted_profit": 157500
    }
  ],
  "insights": [
    "Income projected to grow by 9.5% over the next 3 months."
  ],
  "historical": [],
  "model_trained": true,
  "data_points": 10
}
```

## Features

✅ **Automatic Predictions**: Updates when new transactions are added
✅ **Intelligent Insights**: AI-generated financial advice
✅ **Visual Charts**: Historical and predicted data visualization
✅ **Fallback Handling**: Works even with limited data
✅ **Currency Formatting**: Displays amounts in LKR format

## Customization

### Adjust Prediction Period
In `ai-service/app.py`, modify:
```python
predictions = predict_future(income_model, expense_model, monthly_data, months_ahead=3)
```

### Change Model Algorithm
Replace `LinearRegression` with other scikit-learn models:
```python
from sklearn.ensemble import RandomForestRegressor
model = RandomForestRegressor()
```

## Troubleshooting

### AI Service Not Starting
- Check Python version: `python3 --version`
- Install dependencies: `pip install -r requirements.txt`
- Check port availability: `lsof -i :5001`

### No Predictions Showing
- Verify AI service is running
- Check browser console for errors
- Ensure backend can reach AI service
- Add some transaction data for better predictions

### Service Connection Errors
- Backend must be on port 4000
- AI service must be on port 5001
- Check CORS settings in AI service

## Future Enhancements

- [ ] Advanced models (ARIMA, Prophet, LSTM)
- [ ] Confidence intervals for predictions
- [ ] What-if scenario analysis
- [ ] Budget recommendations
- [ ] Anomaly detection
- [ ] Multi-year forecasting
- [ ] Export prediction reports

## Technical Details

### Model Training
- Uses historical transaction data grouped by month
- Trains separate models for income and expenses
- Minimum 2 data points required for training
- Falls back to growth-based estimates with insufficient data

### Insight Generation
- Calculates growth rates and trends
- Analyzes profit margins
- Detects cash flow issues
- Provides contextual recommendations

## License
Part of the Planets Pick ERP system.
