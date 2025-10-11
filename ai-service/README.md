# Finance AI Prediction Service

This service provides AI-powered financial predictions using machine learning.

## Features

- Predicts future income and expenses using linear regression
- Provides financial insights and recommendations
- Integrates with the main Finance module
- Returns historical data for visualization

## Installation

```bash
pip install -r requirements.txt
```

## Running the Service

```bash
python app.py
```

The service will start on `http://localhost:5001`

## API Endpoints

### GET /predict
Returns financial predictions for the next 3 months

**Response:**
```json
{
  "success": true,
  "predictions": [
    {
      "month": "2024-02",
      "predicted_income": 500000,
      "predicted_expense": 350000,
      "predicted_profit": 150000
    }
  ],
  "insights": ["Income projected to grow by 15% over the next 3 months."],
  "historical": [],
  "model_trained": true,
  "data_points": 10
}
```

### GET /health
Health check endpoint

## How It Works

1. Fetches transaction data from the backend API
2. Processes and groups data by month
3. Trains linear regression models for income and expenses
4. Predicts future values for the next 3 months
5. Generates actionable insights based on predictions
