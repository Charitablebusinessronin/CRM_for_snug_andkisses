import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AuthenticatedRequest, User, AuthTokens } from '../types';
import { logger } from '../utils/logger';

export class AuthMiddleware {
  private privateKey: string;
  private publicKey: string;
  private refreshSecret: string;

  constructor() {
    this.privateKey = process.env.JWT_PRIVATE_KEY || 'dev-private-key';
    this.publicKey = process.env.JWT_PUBLIC_KEY || 'dev-public-key';
    this.refreshSecret = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret';
  }

  // Generate access token
  generateAccessToken = (user: User): string => {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      permissions: user.permissions
    };

    return jwt.sign(payload, this.privateKey, {
      algorithm: 'HS256',
      expiresIn: '15m', // Short-lived access token
      issuer: 'sabir-crm',
      audience: 'sabir-crm-users'
    });
  };

  // Generate refresh token
  generateRefreshToken = (userId: string): string => {
    return jwt.sign(
      { userId, type: 'refresh' },
      this.refreshSecret,
      {
        algorithm: 'HS256',
        expiresIn: '7d', // Long-lived refresh token
        issuer: 'sabir-crm',
        audience: 'sabir-crm-users'
      }
    );
  };

  // Generate token pair
  generateTokens = (user: User): AuthTokens => {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user.id);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    return {
      accessToken,
      refreshToken,
      expiresAt,
      tokenType: 'Bearer'
    };
  };

  // Hash password
  hashPassword = async (password: string): Promise<string> => {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  };

  // Verify password
  verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
  };

  // Authenticate token middleware
  authenticateToken = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        res.status(401).json({
          success: false,
          error: 'Access token required',
          code: 'MISSING_TOKEN'
        });
        return;
      }

      const decoded = jwt.verify(token, this.privateKey, {
        algorithms: ['HS256'],
        issuer: 'sabir-crm',
        audience: 'sabir-crm-users'
      }) as User;

      req.user = decoded;
      logger.info(`User authenticated: ${decoded.email} (${decoded.role})`);
      next();

    } catch (error) {
      logger.error('Authentication failed:', error);
      
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          success: false,
          error: 'Access token expired',
          code: 'TOKEN_EXPIRED'
        });
      } else if (error instanceof jwt.JsonWebTokenError) {
        res.status(403).json({
          success: false,
          error: 'Invalid access token',
          code: 'INVALID_TOKEN'
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Authentication error',
          code: 'AUTH_ERROR'
        });
      }
    }
  };

  // Verify refresh token
  verifyRefreshToken = (token: string): { userId: string } | null => {
    try {
      const decoded = jwt.verify(token, this.refreshSecret, {
        algorithms: ['HS256'],
        issuer: 'sabir-crm',
        audience: 'sabir-crm-users'
      }) as { userId: string; type: string };

      if (decoded.type !== 'refresh') {
        return null;
      }

      return { userId: decoded.userId };
    } catch (error) {
      logger.error('Refresh token verification failed:', error);
      return null;
    }
  };

  // Role-based authorization middleware
  requireRole = (roles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'NOT_AUTHENTICATED'
        });
      }

      if (!roles.includes(req.user.role)) {
        logger.warn(`Access denied for user ${req.user.email}. Required roles: ${roles.join(', ')}, User role: ${req.user.role}`);
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
          requiredRoles: roles,
          userRole: req.user.role
        });
      }

      logger.info(`Role authorization passed for user ${req.user.email} with role ${req.user.role}`);
      next();
    };
  };

  // Permission-based authorization middleware
  requirePermission = (permission: string) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'NOT_AUTHENTICATED'
        });
      }

      if (!req.user.permissions.includes(permission)) {
        logger.warn(`Access denied for user ${req.user.email}. Required permission: ${permission}`);
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
          requiredPermission: permission,
          userPermissions: req.user.permissions
        });
      }

      logger.info(`Permission authorization passed for user ${req.user.email} with permission ${permission}`);
      next();
    };
  };

  // Admin only middleware
  requireAdmin = () => {
    return this.requireRole(['admin']);
  };

  // Employee or admin middleware
  requireEmployee = () => {
    return this.requireRole(['admin', 'employee']);
  };

  // Optional authentication (doesn't fail if no token)
  optionalAuth = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];

      if (token) {
        const decoded = jwt.verify(token, this.privateKey, {
          algorithms: ['HS256'],
          issuer: 'sabir-crm',
          audience: 'sabir-crm-users'
        }) as User;
        req.user = decoded;
      }

      next();
    } catch (error) {
      // Don't fail, just continue without user
      logger.debug('Optional auth failed, continuing without user:', error);
      next();
    }
  };
}

export const authMiddleware = new AuthMiddleware();