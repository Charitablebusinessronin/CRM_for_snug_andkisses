import { Router, Response } from 'express';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// GET /api/quick-actions - Echo/health (Catalyst parity placeholder)
router.get('/',
  authMiddleware.authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse<any>>): Promise<void> => {
    res.json({
      success: true,
      data: {
        message: 'quick-actions is working',
        path: req.path,
        method: req.method
      }
    });
  })
);

export { router as quickActionsRoutes };