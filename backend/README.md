# Planets Pick ERP - Backend

Node.js/Express backend for the Planets Pick ERP system.

## Setup

### Prerequisites
- Node.js 18+
- MongoDB (optional, uses mock data if unavailable)

### Installation

```bash
npm install
```

If you're in a restricted environment where downloading Chrome for Puppeteer fails:
```bash
PUPPETEER_SKIP_DOWNLOAD=true npm install
```

### Environment Variables

Create a `.env` file in the backend directory with:
```
MONGO_URI=your_mongodb_connection_string
PORT=4000
SECRET=your_jwt_secret
```

### Running the Server

```bash
npm start
```

The server will start on http://localhost:4000

## Features

- **User Management**: Authentication, authorization, and user administration
- **Employee Management**: Employee records, attendance, payroll
- **Inventory Management**: Stock tracking, inventory levels
- **Customer Management**: Customer records and relationship management
- **Order Management**: Order processing and tracking
- **Finance Management**: Financial transactions and reporting
- **Production Management**: Production batches and process tracking
- **Procurement**: Supplier management, purchase orders
- **Reports**: PDF report generation using Puppeteer

## Dependencies

### Key Dependencies
- **express**: Web framework
- **mongoose**: MongoDB object modeling
- **puppeteer**: PDF generation for reports
- **jsonwebtoken**: JWT authentication
- **bcrypt**: Password hashing
- **axios**: HTTP client
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variable management

## API Routes

- `/api/users` - User management
- `/api/employees` - Employee management
- `/api/inventory` - Inventory management
- `/api/customers` - Customer management
- `/api/orders` - Order management
- `/api/finance` - Finance management
- `/api/finance-ai` - AI-powered finance predictions
- `/api/production` - Production management
- `/api/reports` - Report generation
- `/api/suppliers` - Supplier management
- `/api/purchase-orders` - Purchase order management
- `/api/procurement-reports` - Procurement reporting

## Troubleshooting

### "Cannot find module 'puppeteer'" Error
This error occurs when backend dependencies are not installed. Run:
```bash
npm install
```

If you're in a restricted environment:
```bash
PUPPETEER_SKIP_DOWNLOAD=true npm install
```

### Database Connection Error
If MongoDB is not available, the server will still start but database operations will fail. The server logs will show:
```
❌ Database connection error: ...
✅ Server listening on port 4000 (without DB)
```

This is expected in development environments without MongoDB access.
