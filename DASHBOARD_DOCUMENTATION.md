# Business Intelligence Dashboard

## Overview

The Business Intelligence Dashboard provides business owners with a comprehensive, real-time overview of their entire ERP system performance. It aggregates data from all modules and displays key metrics with period-over-period growth analysis.

## Features

### Comprehensive Metrics Display

The dashboard shows metrics from all ERP modules:

1. **Financial Health**
   - Net Worth (Assets - Liabilities)
   - Total Revenue
   - Net Profit/Loss
   - Expenses
   - Profit Margin
   - Period-over-period growth percentages

2. **Workforce Management**
   - Active Employees
   - Employees on Leave
   - Monthly Payroll
   - System Users
   - Pending Approvals

3. **Inventory Management**
   - Total Inventory Value
   - Total Items
   - Low Stock Alerts
   - Stock Health Percentage

4. **Production Performance**
   - Total Batches (in period)
   - Completed Batches
   - Active Batches
   - Yield Efficiency
   - Actual vs Target Yield

5. **Sales Performance**
   - Total Orders
   - Completed Orders
   - Pending Orders
   - Total Sales Amount
   - Average Order Value

6. **Customer Base**
   - Total Customers
   - New Customers (in period)
   - Customer Growth Rate

### Time Period Filters

Business owners can analyze their performance over different time periods:
- **30 Days** (30D) - Recent performance
- **6 Months** (6M) - Short-term trends
- **1 Year** (1Y) - Annual performance
- **2 Years** (2Y) - Multi-year growth
- **5 Years** (5Y) - Long-term growth

### Growth Indicators

All metrics display:
- Visual indicators (up/down arrows)
- Percentage change from previous period
- Color-coded positive (green) and negative (red) changes

## API Endpoint

### GET `/api/dashboard/metrics`

Fetches aggregated dashboard metrics.

**Query Parameters:**
- `period` (string, optional): Time period filter
  - Values: `30days`, `6months`, `1year`, `2years`, `5years`
  - Default: `30days`

**Response Format:**
```json
{
  "success": true,
  "period": "30days",
  "dateRange": {
    "start": "2025-09-13T00:00:00.000Z",
    "end": "2025-10-13T00:00:00.000Z"
  },
  "financial": {
    "netWorth": 12500000,
    "totalAssets": 18750000,
    "totalLiabilities": 6250000,
    "revenue": 5420000,
    "expenses": 3280000,
    "netProfit": 2140000,
    "revenueChange": 15.8,
    "expenseChange": 8.2,
    "profitChange": 28.5
  },
  "employees": {
    "total": 42,
    "active": 38,
    "onLeave": 4,
    "totalPayroll": 2850000,
    "change": 5.0
  },
  "inventory": {
    "totalValue": 2450000,
    "totalItems": 156,
    "lowStockItems": 12,
    "stockHealthPercentage": "92.31"
  },
  "production": {
    "totalBatches": 48,
    "completedBatches": 42,
    "activeBatches": 6,
    "totalYield": 8520,
    "targetYield": 9000,
    "yieldEfficiency": "94.67",
    "change": 12.5
  },
  "sales": {
    "totalOrders": 128,
    "completedOrders": 115,
    "pendingOrders": 13,
    "totalSales": 5420000,
    "averageOrderValue": "42343.75",
    "orderChange": 18.5,
    "salesChange": 15.8
  },
  "customers": {
    "total": 89,
    "new": 14
  },
  "users": {
    "total": 24,
    "pending": 3
  },
  "trends": {
    "revenue": [
      { "month": "2025-08", "value": 1200000 },
      { "month": "2025-09", "value": 1580000 },
      { "month": "2025-10", "value": 2640000 }
    ]
  }
}
```

## Backend Implementation

### Data Sources

The dashboard controller aggregates data from multiple MongoDB collections:
- `transactions` - Financial income and expenses
- `assetliabilities` - Assets and liabilities
- `employees` - Employee data and payroll
- `production` - Production batches and yield
- `inventory` - Inventory items and stock levels
- `orders` - Sales orders and amounts
- `customers` - Customer information
- `users` - System users

### Calculations

**Net Worth:**
```javascript
Net Worth = Total Assets - Total Liabilities
```

**Profit Margin:**
```javascript
Profit Margin = (Net Profit / Revenue) × 100
```

**Yield Efficiency:**
```javascript
Yield Efficiency = (Actual Yield / Target Yield) × 100
```

**Stock Health:**
```javascript
Stock Health = ((Total Items - Low Stock Items) / Total Items) × 100
```

**Growth Percentage:**
```javascript
Growth % = ((Current Value - Previous Value) / Previous Value) × 100
```

### Mock Data

When the database is unavailable, the API returns realistic mock data to ensure the UI remains functional for testing and development.

## Frontend Implementation

### Component Structure

```
Dashboard.tsx
├── Header (Business Intelligence Dashboard)
├── Period Selector (30D, 6M, 1Y, 2Y, 5Y)
├── Key Metrics Row
│   ├── Net Worth Card
│   ├── Revenue Card
│   ├── Net Profit Card
│   └── Expenses Card
├── Operations Metrics Row
│   ├── Active Employees Card
│   ├── Inventory Value Card
│   ├── Total Sales Card
│   └── Production Efficiency Card
├── Detailed Sections Grid
│   ├── Financial Health Section
│   ├── Workforce Management Section
│   ├── Inventory Management Section
│   ├── Production Performance Section
│   ├── Sales Performance Section
│   └── Customer Base Section
└── Growth Summary
```

### State Management

- Uses React Hooks (`useState`, `useEffect`)
- Fetches data on mount and when period changes
- Shows loading spinner during data fetch
- Displays error message if API call fails

### Styling

- Tailwind CSS for responsive design
- Gradient backgrounds for visual appeal
- Color-coded metrics:
  - Purple: Net Worth/Financial
  - Green: Revenue/Positive metrics
  - Blue: Profit/Performance
  - Orange: Expenses/Warnings
  - Indigo: Employees/HR
  - Teal: Inventory
  - Pink: Sales
  - Yellow: Production
  - Cyan: Customers

## Usage

### Access the Dashboard

1. Navigate to `/dashboard` in the application
2. Ensure you're logged in (localStorage must contain user name)
3. Dashboard loads with default 30-day period

### Change Time Period

1. Click any period button (30D, 6M, 1Y, 2Y, 5Y)
2. Dashboard fetches new data for selected period
3. All metrics update automatically
4. Growth indicators recalculate for new period

### Interpret Metrics

- **Green arrows (↑)** indicate positive growth
- **Red arrows (↓)** indicate decline
- Larger percentages show more significant changes
- Hover over sections for detailed information

## Development

### Add New Metrics

1. Update backend controller (`dashboardController.js`):
   ```javascript
   // Add new aggregation query
   const newMetric = await Model.aggregate([...]);
   
   // Add to response
   res.json({
     // ...existing metrics
     newSection: {
       value: newMetric,
       change: calculateChange(...)
     }
   });
   ```

2. Update TypeScript interface in `Dashboard.tsx`:
   ```typescript
   interface DashboardMetrics {
     // ...existing
     newSection: {
       value: number;
       change: number;
     };
   }
   ```

3. Add UI component in Dashboard:
   ```tsx
   <MetricCard
     title="New Metric"
     value={formatNumber(metrics.newSection.value)}
     change={metrics.newSection.change}
     icon={NewIcon}
     color="bg-gradient-to-br from-color-600 to-color-700"
   />
   ```

### Testing

To test with real data, ensure MongoDB is connected and contains data in the relevant collections. The API will automatically switch from mock to real data.

## Screenshots

### Full Dashboard View
![Dashboard showing all metrics with 30-day period selected](https://github.com/user-attachments/assets/70c02a30-7f7f-4d01-b2c1-e85a111838a7)

### Detailed Sections (6-Month Period)
![Dashboard showing detailed sections with 6-month growth metrics](https://github.com/user-attachments/assets/d6cffdc0-2aac-436f-ac16-0172a3df4893)

## Performance Considerations

- API response is cached in component state
- Data only refetches when period changes
- MongoDB aggregations are optimized with indexes
- Frontend uses React's efficient rendering

## Future Enhancements

Potential improvements:
- [ ] Export dashboard as PDF report
- [ ] Add charts/graphs for trend visualization
- [ ] Email scheduled dashboard reports
- [ ] Add drill-down capability to detailed views
- [ ] Custom date range selector
- [ ] Dashboard personalization/favorites
- [ ] Real-time data updates with WebSockets
- [ ] Mobile-optimized responsive layout
