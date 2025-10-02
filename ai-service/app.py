from flask import Flask, jsonify, request
from flask_cors import CORS
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta
import requests

app = Flask(__name__)
CORS(app)

# Configuration
BACKEND_URL = "http://localhost:4000/api/finance"

def fetch_transactions():
    """Fetch transaction data from backend"""
    try:
        response = requests.get(f"{BACKEND_URL}/transactions")
        if response.status_code == 200:
            return response.json()
        return []
    except Exception as e:
        print(f"Error fetching transactions: {e}")
        return []

def prepare_data(transactions):
    """Prepare data for ML model"""
    if not transactions:
        return None, None
    
    df = pd.DataFrame(transactions)
    
    # Convert date to datetime
    df['date'] = pd.to_datetime(df['date'])
    
    # Sort by date
    df = df.sort_values('date')
    
    # Group by month and type
    df['month'] = df['date'].dt.to_period('M')
    
    # Calculate monthly income and expenses
    monthly_data = df.groupby(['month', 'type'])['amount'].sum().unstack(fill_value=0)
    
    if 'income' not in monthly_data.columns:
        monthly_data['income'] = 0
    if 'expense' not in monthly_data.columns:
        monthly_data['expense'] = 0
    
    # Reset index to get month as a column
    monthly_data = monthly_data.reset_index()
    monthly_data['month_num'] = range(len(monthly_data))
    
    return monthly_data, df

def train_model(monthly_data):
    """Train linear regression model"""
    if monthly_data is None or len(monthly_data) < 2:
        return None, None
    
    X = monthly_data[['month_num']].values
    y_income = monthly_data['income'].values
    y_expense = monthly_data['expense'].values
    
    # Train models
    income_model = LinearRegression()
    expense_model = LinearRegression()
    
    income_model.fit(X, y_income)
    expense_model.fit(X, y_expense)
    
    return income_model, expense_model

def predict_future(income_model, expense_model, monthly_data, months_ahead=3):
    """Predict future income and expenses"""
    if income_model is None or expense_model is None or monthly_data is None:
        return generate_dummy_predictions()
    
    last_month_num = monthly_data['month_num'].max()
    
    predictions = []
    for i in range(1, months_ahead + 1):
        future_month_num = last_month_num + i
        
        # Predict
        predicted_income = max(0, income_model.predict([[future_month_num]])[0])
        predicted_expense = max(0, expense_model.predict([[future_month_num]])[0])
        
        # Calculate future date
        last_date = pd.to_datetime(str(monthly_data['month'].iloc[-1]))
        future_date = last_date + pd.DateOffset(months=i)
        
        predictions.append({
            'month': future_date.strftime('%Y-%m'),
            'predicted_income': round(predicted_income, 2),
            'predicted_expense': round(predicted_expense, 2),
            'predicted_profit': round(predicted_income - predicted_expense, 2)
        })
    
    return predictions

def generate_dummy_predictions():
    """Generate dummy predictions when no data is available"""
    predictions = []
    current_date = datetime.now()
    
    # Generate 3 months of dummy data with some variance
    base_income = 500000
    base_expense = 350000
    
    for i in range(1, 4):
        future_date = current_date + timedelta(days=30 * i)
        # Add some random variance
        variance = 1 + (i * 0.05)  # 5% growth per month
        
        income = base_income * variance
        expense = base_expense * variance
        
        predictions.append({
            'month': future_date.strftime('%Y-%m'),
            'predicted_income': round(income, 2),
            'predicted_expense': round(expense, 2),
            'predicted_profit': round(income - expense, 2)
        })
    
    return predictions

def calculate_insights(predictions, monthly_data):
    """Generate AI insights from predictions"""
    insights = []
    
    if predictions and len(predictions) > 0:
        # Calculate average growth
        if len(predictions) >= 2:
            income_growth = ((predictions[-1]['predicted_income'] - predictions[0]['predicted_income']) / 
                           predictions[0]['predicted_income'] * 100)
            expense_growth = ((predictions[-1]['predicted_expense'] - predictions[0]['predicted_expense']) / 
                            predictions[0]['predicted_expense'] * 100)
            
            if income_growth > 5:
                insights.append(f"Income projected to grow by {income_growth:.1f}% over the next 3 months.")
            elif income_growth < -5:
                insights.append(f"⚠️ Income projected to decline by {abs(income_growth):.1f}%. Consider revenue optimization strategies.")
            
            if expense_growth > 10:
                insights.append(f"⚠️ Expenses growing rapidly at {expense_growth:.1f}%. Review cost control measures.")
            
        # Profit margin analysis
        avg_profit_margin = sum(p['predicted_profit'] / p['predicted_income'] * 100 
                               for p in predictions if p['predicted_income'] > 0) / len(predictions)
        
        if avg_profit_margin < 20:
            insights.append(f"Profit margin at {avg_profit_margin:.1f}% is below optimal. Consider cost reduction or pricing adjustments.")
        elif avg_profit_margin > 30:
            insights.append(f"Strong profit margin of {avg_profit_margin:.1f}% projected. Good financial health.")
        
        # Cash flow alert
        negative_months = [p for p in predictions if p['predicted_profit'] < 0]
        if negative_months:
            insights.append(f"⚠️ Potential cash flow issues in {len(negative_months)} month(s). Plan accordingly.")
    
    if not insights:
        insights.append("Maintain current financial practices. Monitor trends regularly.")
    
    return insights

@app.route('/predict', methods=['GET'])
def predict():
    """Main prediction endpoint"""
    try:
        # Fetch data
        transactions = fetch_transactions()
        
        # Prepare data
        monthly_data, df = prepare_data(transactions)
        
        # Train model
        income_model, expense_model = train_model(monthly_data)
        
        # Predict
        predictions = predict_future(income_model, expense_model, monthly_data)
        
        # Generate insights
        insights = calculate_insights(predictions, monthly_data)
        
        # Calculate historical data for chart
        historical = []
        if monthly_data is not None and not monthly_data.empty:
            for _, row in monthly_data.tail(6).iterrows():  # Last 6 months
                historical.append({
                    'month': str(row['month']),
                    'income': float(row['income']),
                    'expense': float(row['expense']),
                    'profit': float(row['income'] - row['expense'])
                })
        
        return jsonify({
            'success': True,
            'predictions': predictions,
            'insights': insights,
            'historical': historical,
            'model_trained': income_model is not None,
            'data_points': len(monthly_data) if monthly_data is not None else 0
        })
    
    except Exception as e:
        print(f"Prediction error: {e}")
        import traceback
        traceback.print_exc()
        
        # Return dummy data on error
        predictions = generate_dummy_predictions()
        return jsonify({
            'success': True,
            'predictions': predictions,
            'insights': ['Using estimated projections. Add more transaction data for accurate predictions.'],
            'historical': [],
            'model_trained': False,
            'data_points': 0,
            'error': str(e)
        })

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Finance AI Prediction Service',
        'version': '1.0.0'
    })

if __name__ == '__main__':
    print("🤖 Starting Finance AI Prediction Service on port 5001...")
    app.run(host='0.0.0.0', port=5001, debug=True)
