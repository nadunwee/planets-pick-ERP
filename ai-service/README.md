# Finance AI Prediction Service

This service provides AI-powered financial predictions and intelligent chatbot responses using machine learning and Google's Gemini AI.

## Features

- **Gemini AI Integration**: Natural language understanding for intelligent chatbot responses
- **Financial Predictions**: Predicts future income and expenses using linear regression
- **AI Insights**: Provides financial recommendations and actionable insights
- **Hybrid Approach**: Combines ML predictions with Gemini AI for contextual responses
- **Graceful Fallback**: Works with rule-based responses if AI service is unavailable

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env and add your Gemini API key
```

## Configuration

### Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to your `.env` file

### Environment Variables

Create a `.env` file with:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
BACKEND_URL=http://localhost:4000/api/finance
```

## Running the Service

```bash
python app.py
```

The service will start on `http://localhost:5001`

## API Endpoints

### POST /chatbot

Processes user messages and generates AI-powered responses with predictions.

**Request:**
```json
{
  "message": "What will be our profit next month?",
  "metrics": {
    "financial": { ... },
    "employees": { ... },
    "inventory": { ... }
  }
}
```

**Response:**
```json
{
  "success": true,
  "response": "💰 Profit Forecast for Next 3 Months: ...",
  "predictions": [...],
  "ai_powered": true
}
```

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

### Chatbot with Gemini AI

1. Receives user message and current business metrics
2. Detects if query requires financial predictions
3. If predictions needed, trains ML models and generates forecasts
4. Uses Gemini AI to generate contextual, intelligent responses
5. Falls back to rule-based responses if Gemini is unavailable
6. Returns formatted response with predictions

### Financial Predictions

1. Fetches transaction data from the backend API
2. Processes and groups data by month
3. Trains linear regression models for income and expenses
4. Predicts future values for the next 3 months
5. Generates actionable insights based on predictions

## AI Features

### Gemini AI Capabilities

- Natural language understanding for any business question
- Contextual responses based on current metrics
- Intelligent interpretation of financial data
- Conversational and helpful tone
- Automatic formatting with emojis and bullet points

### Example Queries Handled by Gemini

- "How is my business performing?"
- "What can I do to improve profit margins?"
- "Which areas need attention?"
- "Compare my revenue to expenses"
- "Give me a business health summary"
- "What will be our financial situation next quarter?"

### Prediction Queries

- "Predict next month's revenue"
- "What will be our future expenses?"
- "Show me profit forecast"
- "What's the revenue projection?"

## Security

- API keys are stored in `.env` file (not committed to git)
- Environment variables loaded securely
- CORS enabled for frontend integration
- Error handling prevents API key exposure

## Troubleshooting

### Gemini AI Not Working

If you see "⚠️ Gemini API key not found":
1. Check `.env` file exists in `ai-service/` directory
2. Verify `GEMINI_API_KEY` is set correctly
3. Ensure no extra spaces in the API key
4. Restart the Python service

The chatbot will still work with fallback responses if Gemini fails.

### Connection Errors

If backend connection fails:
1. Verify backend is running on port 4000
2. Check `BACKEND_URL` in `.env`
3. Ensure MongoDB is connected

## Development

### Testing Gemini Integration

```python
# Test Gemini API directly
import google.generativeai as genai
genai.configure(api_key="your_key")
model = genai.GenerativeModel('gemini-pro')
response = model.generate_content("Test message")
print(response.text)
```

## Dependencies

- Flask: Web framework
- Flask-CORS: Cross-origin support
- google-generativeai: Gemini AI SDK
- scikit-learn: ML models
- pandas: Data processing
- numpy: Numerical operations
- python-dotenv: Environment variables
