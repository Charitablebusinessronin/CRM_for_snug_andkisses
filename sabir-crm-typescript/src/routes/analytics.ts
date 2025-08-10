import { Router, Response } from 'express';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { CacheService } from '../services/cache.service';
import { CRMContactsRepo } from '../repositories/catalyst/tables/CRM_Contacts.repo';
import { CRMLeadsRepo } from '../repositories/catalyst/tables/CRM_Leads.repo';
import { logger } from '../utils/logger';

const router = Router();

// GET /api/analytics/dashboard - KPI aggregation with cache (Catalyst parity)
router.get('/dashboard',
  authMiddleware.authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse<any>>): Promise<void> => {
    logger.info(`User ${req.user?.email} requesting analytics dashboard (Catalyst)`);

    // Try cache first
    const cached = await CacheService.get<any>('dashboard_analytics');
    if (cached) {
      res.json({ success: true, data: cached, message: 'Analytics dashboard (cache)' });
      return;
    }

    const contacts = await CRMContactsRepo.getAll();
    const leads = await CRMLeadsRepo.getAll();

    const activeContacts = contacts.filter(c => c.status === 'active');
    const convertedLeads = leads.filter(l => l.status === 'converted');

    const data = {
      contacts: { total: contacts.length, active: activeContacts.length },
      leads: {
        total: leads.length,
        converted: convertedLeads.length,
        conversion_rate: leads.length ? (convertedLeads.length / leads.length) * 100 : 0,
      },
      generated_at: new Date().toISOString(),
    };

    // Cache for 30 minutes
    await CacheService.set('dashboard_analytics', data, 1800);

    res.json({ success: true, data, message: 'Analytics dashboard (fresh)' });
  })
);

export { router as analyticsRoutes };