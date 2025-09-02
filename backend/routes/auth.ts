import { Router, Request, Response } from 'express';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import User from '../models/User';

// Extend Express Request to include user
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: Record<string, unknown>;
    }
  }
}

const router = Router();

// Register new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password, firstName, lastName, role, department } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists',
        message: 'Email or username is already taken'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName,
      role,
      department
    });

    await user.save();

    // Generate JWT token
    const secret: Secret = process.env.JWT_SECRET || 'fallback-secret';
    const options: SignOptions = { expiresIn: '7d' };
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      secret,
      options
    );

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        department: user.department
      },
      token
    });
    return;
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'Could not create user'
    });
    return;
  }
});

// Login user
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Find user by username or email
    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    });

    if (!user) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        error: 'Account suspended',
        message: 'Your account has been suspended'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const secret: Secret = process.env.JWT_SECRET || 'fallback-secret';
    const options: SignOptions = { expiresIn: '7d' };
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      secret,
      options
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        department: user.department
      },
      token
    });
    return;
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'Could not authenticate user'
    });
    return;
  }
});

// Get current user profile
router.get('/profile', async (req: Request, res: Response) => {
  try {
    // This would typically use middleware to verify JWT token
    // For now, we'll return a placeholder
    res.json({
      message: 'Profile endpoint - requires authentication middleware'
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      error: 'Profile fetch failed',
      message: 'Could not retrieve profile'
    });
  }
});

export default router;
