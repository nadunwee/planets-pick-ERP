# Planet's Pick ERP Backend

This is the backend API for the Planet's Pick ERP system, built with Node.js, Express, TypeScript, and MongoDB.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   Then edit `.env` with your configuration.

3. **Start MongoDB:**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Update MONGO_URI in .env
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## 📁 Project Structure

```
backend/
├── models/          # Mongoose models
├── routes/          # API route handlers
├── controllers/     # Business logic
├── middleware/      # Custom middleware
├── server.ts        # Main server file
├── tsconfig.json    # TypeScript configuration
└── package.json     # Dependencies and scripts
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests (to be implemented)

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Health Check
- `GET /api/health` - API health status
- `GET /api` - API information

## 🔒 Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/planets-pick-erp

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=12
```

## 🗄️ Database Models

### User Model
- Username and email (unique)
- Password (hashed with bcrypt)
- Role-based access control
- Department assignment
- Account status tracking

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT token authentication
- CORS configuration
- Helmet security headers
- Input validation
- Rate limiting (to be implemented)

## 📊 Monitoring

- Request logging with Morgan
- Health check endpoints
- Error handling middleware
- Graceful shutdown handling

## 🚧 Development

### Adding New Routes
1. Create route file in `routes/` directory
2. Import and use in `server.ts`
3. Add validation and error handling

### Adding New Models
1. Create model file in `models/` directory
2. Define TypeScript interfaces
3. Add validation and middleware

## 🔍 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Ensure MongoDB is running
   - Check MONGO_URI in .env
   - Verify network connectivity

2. **Port Already in Use**
   - Change PORT in .env
   - Kill existing process on port

3. **TypeScript Compilation Errors**
   - Run `npm run build` to see detailed errors
   - Check type definitions
   - Verify tsconfig.json

### Logs
- Server logs are displayed in console
- Use Morgan for HTTP request logging
- Check MongoDB logs for database issues

## 📈 Next Steps

- [ ] Implement authentication middleware
- [ ] Add more API endpoints for ERP modules
- [ ] Implement rate limiting
- [ ] Add comprehensive testing
- [ ] Set up CI/CD pipeline
- [ ] Add API documentation with Swagger
- [ ] Implement caching with Redis
- [ ] Add monitoring and metrics
