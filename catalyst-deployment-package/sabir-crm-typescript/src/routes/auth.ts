import { Router, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { AuthenticatedRequest, User, LoginRequest, LoginResponse, RegisterRequest, RefreshTokenRequest, ApiResponse } from '../types';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = Router();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const registerSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  role: z.enum(['admin', 'user', 'client', 'employee', 'contractor']).default('user')
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').max(100)
});

// Mock user database (replace with actual database)
class UserService {
  private users: Map<string, User & { password: string; refreshToken?: string }> = new Map();

  constructor() {
    // Initialize with a test admin user
    this.users.set('admin@snugsandkisses.com', {
      id: '1',
      email: 'admin@snugsandkisses.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewAZGc6.v4V.14ne', // hashed 'admin123'
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      permissions: ['read', 'write', 'delete', 'admin'],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Test employee user
    this.users.set('employee@snugsandkisses.com', {
      id: '2',
      email: 'employee@snugsandkisses.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewAZGc6.v4V.14ne', // hashed 'employee123'
      role: 'employee',
      firstName: 'Employee',
      lastName: 'User',
      permissions: ['read', 'write'],
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  async findByEmail(email: string): Promise<(User & { password: string; refreshToken?: string }) | null> {
    return this.users.get(email.toLowerCase()) || null;
  }

  async findById(id: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.id === id) {
        const { password, refreshToken, ...userWithoutSensitiveData } = user;
        return userWithoutSensitiveData;
      }
    }
    return null;
  }

  async create(userData: RegisterRequest & { id: string; hashedPassword: string; permissions: string[] }): Promise<User> {
    const user = {
      id: userData.id,
      email: userData.email.toLowerCase(),
      password: userData.hashedPassword,
      role: userData.role,
      firstName: userData.firstName,
      lastName: userData.lastName,
      permissions: userData.permissions,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.users.set(user.email, user);
    
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateRefreshToken(email: string, refreshToken: string | null): Promise<void> {
    const user = this.users.get(email.toLowerCase());
    if (user) {
      user.refreshToken = refreshToken || undefined;
      user.updatedAt = new Date();
    }
  }

  async updatePassword(email: string, hashedPassword: string): Promise<void> {
    const user = this.users.get(email.toLowerCase());
    if (user) {
      user.password = hashedPassword;
      user.updatedAt = new Date();
    }
  }
}

const userService = new UserService();

// POST /api/auth/login - User login
router.post('/login',
  asyncHandler(async (req: AuthenticatedRequest, res: Response<LoginResponse>): Promise<void> => {
    const { email, password } = loginSchema.parse(req.body);
    
    logger.info(`Login attempt for email: ${email}`);
    
    // Find user by email
    const user = await userService.findByEmail(email);
    if (!user) {
      logger.warn(`Login failed - user not found: ${email}`);
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }
    
    // Verify password
    const isValidPassword = await authMiddleware.verifyPassword(password, user.password);
    if (!isValidPassword) {
      logger.warn(`Login failed - invalid password for: ${email}`);
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }
    
    // Generate tokens
    const { password: _, refreshToken: __, ...userWithoutSensitiveData } = user;
    const tokens = authMiddleware.generateTokens(userWithoutSensitiveData);
    
    // Store refresh token
    await userService.updateRefreshToken(email, tokens.refreshToken);
    
    logger.info(`User logged in successfully: ${email}`);
    
    res.json({
      success: true,
      message: 'Login successful',
      user: userWithoutSensitiveData,
      tokens
    });
  })
);

// POST /api/auth/register - User registration
router.post('/register',
  asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse<User>>): Promise<void> => {
    const userData = registerSchema.parse(req.body);
    
    logger.info(`Registration attempt for email: ${userData.email}`);
    
    // Check if user already exists
    const existingUser = await userService.findByEmail(userData.email);
    if (existingUser) {
      logger.warn(`Registration failed - user already exists: ${userData.email}`);
      throw new AppError('User already exists with this email', 409, 'USER_ALREADY_EXISTS');
    }
    
    // Hash password
    const hashedPassword = await authMiddleware.hashPassword(userData.password);
    
    // Set default permissions based on role
    let permissions: string[] = ['read'];
    switch (userData.role) {
      case 'admin':
        permissions = ['read', 'write', 'delete', 'admin'];
        break;
      case 'employee':
        permissions = ['read', 'write'];
        break;
      case 'contractor':
        permissions = ['read', 'write'];
        break;
      default:
        permissions = ['read'];
    }
    
    // Create user
    const newUser = await userService.create({
      ...userData,
      id: uuidv4(),
      hashedPassword,
      permissions
    });
    
    logger.info(`User registered successfully: ${userData.email}`);
    
    res.status(201).json({
      success: true,
      data: newUser,
      message: 'User registered successfully'
    });
  })
);

// POST /api/auth/refresh - Refresh access token
router.post('/refresh',
  asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse<{ tokens: any }>>): Promise<void> => {
    const { refreshToken } = refreshTokenSchema.parse(req.body);
    
    logger.info('Token refresh attempt');
    
    // Verify refresh token
    const decoded = authMiddleware.verifyRefreshToken(refreshToken);
    if (!decoded) {
      logger.warn('Token refresh failed - invalid refresh token');
      throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }
    
    // Find user
    const user = await userService.findById(decoded.userId);
    if (!user) {
      logger.warn(`Token refresh failed - user not found: ${decoded.userId}`);
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    
    // Generate new tokens
    const tokens = authMiddleware.generateTokens(user);
    
    // Update refresh token in database
    await userService.updateRefreshToken(user.email, tokens.refreshToken);
    
    logger.info(`Token refreshed successfully for user: ${user.email}`);
    
    res.json({
      success: true,
      data: { tokens },
      message: 'Token refreshed successfully'
    });
  })
);

// POST /api/auth/logout - User logout
router.post('/logout',
  authMiddleware.authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> => {
    const user = req.user!;
    
    logger.info(`Logout request from user: ${user.email}`);
    
    // Remove refresh token from database
    await userService.updateRefreshToken(user.email, null);
    
    logger.info(`User logged out successfully: ${user.email}`);
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  })
);

// GET /api/auth/profile - Get user profile
router.get('/profile',
  authMiddleware.authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse<User>>): Promise<void> => {
    const user = req.user!;
    
    logger.info(`Profile request from user: ${user.email}`);
    
    // Get fresh user data from database
    const userData = await userService.findById(user.id);
    if (!userData) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    
    res.json({
      success: true,
      data: userData,
      message: 'Profile retrieved successfully'
    });
  })
);

// PUT /api/auth/change-password - Change user password
router.put('/change-password',
  authMiddleware.authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> => {
    const user = req.user!;
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    
    logger.info(`Password change request from user: ${user.email}`);
    
    // Get user with password
    const userWithPassword = await userService.findByEmail(user.email);
    if (!userWithPassword) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    
    // Verify current password
    const isValidPassword = await authMiddleware.verifyPassword(currentPassword, userWithPassword.password);
    if (!isValidPassword) {
      logger.warn(`Password change failed - invalid current password for: ${user.email}`);
      throw new AppError('Current password is incorrect', 401, 'INVALID_CURRENT_PASSWORD');
    }
    
    // Hash new password
    const hashedNewPassword = await authMiddleware.hashPassword(newPassword);
    
    // Update password
    await userService.updatePassword(user.email, hashedNewPassword);
    
    // Remove refresh token to force re-login
    await userService.updateRefreshToken(user.email, null);
    
    logger.info(`Password changed successfully for user: ${user.email}`);
    
    res.json({
      success: true,
      message: 'Password changed successfully. Please log in again.'
    });
  })
);

// GET /api/auth/verify - Verify token validity
router.get('/verify',
  authMiddleware.authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse<{ user: User; valid: boolean }>>): Promise<void> => {
    const user = req.user!;
    
    res.json({
      success: true,
      data: {
        user,
        valid: true
      },
      message: 'Token is valid'
    });
  })
);

export { router as authRoutes };