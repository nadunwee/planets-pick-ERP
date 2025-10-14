# AI-Powered Chatbot Feature

## Overview
The Dashboard Chatbot has been enhanced with Google Gemini AI to provide intelligent, context-aware responses and future financial predictions. The chatbot combines Gemini's natural language understanding with machine learning forecasts for comprehensive business insights.

## Architecture

```
Frontend (React/TypeScript)
  DashboardChatbot.tsx
       ↓
Backend API (Node.js/Express) :4000
  /api/chatbot/chat
       ↓
AI Service (Python/Flask) :5001
  /chatbot endpoint
       ↓
  ┌─────────────────┬──────────────────────┐
  │                 │                      │
  │  Gemini AI      │  ML Models          │
  │  (Natural       │  (LinearRegression) │
  │   Language)     │  (Predictions)      │
  └─────────────────┴──────────────────────┘
```

## Features

### 🤖 Gemini AI Integration (NEW!)
- **Natural Language Understanding**: Understands any business question naturally
- **Context-Aware Responses**: Analyzes current metrics to provide relevant insights
- **Intelligent Recommendations**: Suggests actionable steps to improve business
- **Conversational Tone**: Friendly, helpful responses with emojis
- **Adaptive Learning**: Better understanding through Google's advanced AI

### 🔮 AI-Powered Predictions
- **Future Revenue Forecasts**: Predict revenue for the next 3 months
- **Expense Predictions**: Forecast upcoming expenses with trend analysis
- **Profit Projections**: Calculate expected profit margins
- **Financial Insights**: AI-generated recommendations based on data

### 📊 Current Metrics Queries
- Revenue and income analysis
- Profit margins and trends
- Expense breakdowns
- Sales performance
- Inventory status
- Employee/payroll information
- Production metrics
- Customer base analytics

### ✨ Smart Features
- **Hybrid Responses**: Gemini AI + ML predictions + built-in responses
- **Graceful Fallback**: Works even if Gemini API is unavailable
- **Visual Indicators**: Shows "AI Response" badge for AI-generated answers
- **Loading States**: Real-time feedback while AI processes requests
- **Context-Aware**: Uses current dashboard metrics for personalized responses
- **Secure**: API keys stored securely in environment variables

## API Reference

### Backend Endpoint

#### POST /api/chatbot/chat

Sends user message to AI service and returns intelligent response.

**Request:**
```json
{
  "message": "predict next month's revenue",
  "metrics": {
    "financial": { ... },
    "employees": { ... },
    "inventory": { ... },
    "production": { ... },
    "sales": { ... },
    "customers": { ... }
  }
}
```

**Response:**
```json
{
  "success": true,
  "response": "📊 **Revenue Forecast for Next 3 Months:**\n\n• 2025-11: LKR 525,000.00\n• 2025-12: LKR 551,250.00\n• 2026-01: LKR 578,812.50\n\n💡 **Insights:** Income projected to grow by 9.5% over the next 3 months.",
  "predictions": [
    {
      "month": "2025-11",
      "predicted_income": 525000,
      "predicted_expense": 367500,
      "predicted_profit": 157500
    }
  ]
}
```

### AI Service Endpoint

#### POST /chatbot

Processes user messages and generates AI-powered responses with predictions.

**Request:**
```json
{
  "message": "what will be our profit next month?",
  "metrics": { ... }
}
```

**Response:**
```json
{
  "success": true,
  "response": "💰 **Profit Forecast for Next 3 Months:**...",
  "predictions": [ ... ]
}
```

## Usage Examples

### Example Queries

#### Future Predictions:
- "Predict next month's revenue"
- "What will be our future expenses?"
- "Show me profit forecast"
- "What's the revenue projection?"
- "Forecast our financial performance"

#### Current Metrics:
- "What's my current revenue?"
- "How are sales doing?"
- "Show me inventory status"
- "What's the employee count?"
- "Give me a business summary"

### Response Examples

#### AI Prediction Response:
```
🔮 Financial Forecast - Next 3 Months:

📈 Expected Revenue: LKR 1,655,062.50
📉 Expected Expenses: LKR 1,158,543.75
💰 Expected Profit: LKR 496,518.75 (30.0% margin)

Monthly Breakdown:
• 2025-11: Profit LKR 157,500.00
• 2025-12: Profit LKR 183,750.00
• 2026-01: Profit LKR 210,937.50

💡 AI Insights:
• Income projected to grow by 9.5% over the next 3 months.
• Strong profit margin of 30.0% projected. Good financial health.
```

#### Built-in Response:
```
Your revenue for Last 30 Days is LKR 500,000. This represents an increased of 5.2% compared to the previous period. Great job! 🎉
```

## Implementation Details

### Frontend Integration

The chatbot component uses the `api` service to communicate with the backend:

```typescript
const response = await api.post("/chatbot/chat", {
  message: currentInput,
  metrics: metrics
});

if (response.data.success && response.data.response) {
  // Display AI-generated response
} else {
  // Fall back to built-in responses
}
```

### AI Response Detection

AI-generated responses include special indicators:

```typescript
interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  isAiResponse?: boolean; // Flag for AI-generated responses
}
```

### Keyword Detection

The AI service detects prediction-related keywords:
- predict, future, forecast
- next month, coming months
- projection, trend
- what will, will be

## Access Control

- **Authentication Required**: All users must be logged in
- **Permission Levels**: All authenticated users (L1-L4) can use the chatbot
- **Data Access**: Respects existing finance AI permissions (L3+ for detailed predictions)

## Error Handling

### AI Service Unavailable
If the AI service fails or is unreachable:
1. Backend returns `response: null`
2. Frontend falls back to built-in responses
3. User experience is uninterrupted

### Network Errors
- Graceful error handling with try-catch blocks
- Automatic fallback to built-in responses
- Error logging for debugging

### Invalid Queries
- AI service returns appropriate error messages
- Frontend displays user-friendly error responses

## Configuration

### Backend Configuration
Located in `backend/controllers/chatbotController.js`:
```javascript
const response = await axios.post("http://localhost:5001/chatbot", {
  message,
  metrics
});
```

### AI Service Configuration
Located in `ai-service/app.py`:
```python
@app.route('/chatbot', methods=['POST'])
def chatbot():
    # AI processing logic
```

## Testing

### Manual Testing

1. **Start the AI Service**:
```bash
cd ai-service
pip install -r requirements.txt
python app.py
```

2. **Start the Backend**:
```bash
cd backend
npm start
```

3. **Start the Frontend**:
```bash
npm run dev
```

4. **Test Prediction Queries**:
- Open chatbot in dashboard
- Type: "predict next month's revenue"
- Verify AI response with forecast data

5. **Test Current Metrics**:
- Type: "what's my current revenue?"
- Verify built-in response with current data

6. **Test Fallback**:
- Stop AI service
- Type prediction query
- Verify fallback to built-in response

## Troubleshooting

### Chatbot Not Responding
- Check browser console for errors
- Verify backend is running on port 4000
- Ensure user is authenticated

### No AI Predictions
- Verify AI service is running on port 5001
- Check backend can reach `http://localhost:5001`
- Review AI service logs for errors
- Ensure transaction data exists in database

### AI Service Connection Failed
- Backend will automatically fall back to built-in responses
- Check CORS settings in AI service
- Verify firewall settings for port 5001

### Incomplete Predictions
- Add more transaction data for better accuracy
- AI requires at least 2 months of data
- Check data preparation in AI service logs

## Future Enhancements

### Potential Improvements:
1. **Natural Language Processing**: Better query understanding
2. **Multi-language Support**: Support for multiple languages
3. **Voice Input**: Speech-to-text capabilities
4. **Conversation History**: Persistent chat history
5. **Custom Predictions**: User-configurable prediction periods
6. **Export Options**: Download predictions as PDF/Excel
7. **Notification Integration**: Alert users about important predictions
8. **Learning from Feedback**: Improve predictions based on user feedback

## Security Considerations

- All chatbot requests require authentication
- User tokens validated via JWT middleware
- No sensitive data exposed in responses
- Rate limiting can be added for production
- Input sanitization to prevent injection attacks

## Performance

- **Response Time**: < 2 seconds for AI predictions
- **Fallback Time**: < 500ms for built-in responses
- **Scalability**: Can handle multiple concurrent users
- **Caching**: Consider caching predictions for better performance

## Dependencies

### Backend
- express: ^5.1.0
- axios: ^1.11.0
- jsonwebtoken: ^9.0.2

### AI Service
- Flask
- Flask-CORS
- scikit-learn
- pandas
- numpy

### Frontend
- react: ^19.1.0
- axios: ^1.11.0
- lucide-react: ^0.536.0

## Maintenance

### Regular Tasks:
1. Monitor AI service logs for errors
2. Update ML models with new data
3. Review and improve keyword detection
4. Collect user feedback for improvements
5. Update built-in responses based on usage patterns

## Support

For issues or questions:
1. Check logs in backend and AI service
2. Review this documentation
3. Test with sample queries
4. Verify all services are running
5. Check authentication and permissions
