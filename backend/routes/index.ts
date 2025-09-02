import { Router } from 'express';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running' });
});

// API info
router.get('/', (req, res) => {
  res.json({
    message: 'Planet\'s Pick ERP API',
    version: '1.0.0',
    endpoints: {
      auth: '/auth',
      users: '/users',
      inventory: '/inventory',
      production: '/production',
      finance: '/finance',
      orders: '/orders',
      delivery: '/delivery',
      wastage: '/wastage',
      reports: '/reports'
    }
  });
});

export default router;
