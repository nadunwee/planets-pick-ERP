import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('combined')); // Logging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    message: 'Backend running without database (dev mode)'
  });
});

// API routes (will be added here)
app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'Planet\'s Pick ERP API',
    version: '1.0.0',
    status: 'running',
    mode: 'development (no database)'
  });
});

// Mock authentication endpoints for testing
app.post('/api/auth/register', (req: Request, res: Response) => {
  res.status(201).json({
    message: 'User registration endpoint (mock)',
    note: 'Database connection required for actual registration'
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'User login endpoint (mock)',
    note: 'Database connection required for actual authentication'
  });
});

app.get('/api/auth/profile', (req: Request, res: Response) => {
  res.json({
    message: 'User profile endpoint (mock)',
    note: 'Authentication middleware required for actual profile access'
  });
});

// Error handling middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Development Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API endpoint: http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⚠️  Running in DEV MODE - No database connection`);
  console.log(`💡 To enable full functionality, start MongoDB and use 'npm run dev'`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
