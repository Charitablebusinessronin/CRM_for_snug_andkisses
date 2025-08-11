import { Router, Request, Response } from 'express';
import { zohoService } from '../services/ZohoUnifiedService';

export const zohoRoutes = Router();

zohoRoutes.get('/health', async (_req: Request, res: Response) => {
  try {
    const status = await zohoService.getHealthStatus();
    res.json({ success: true, data: status });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Failed to get Zoho health' });
  }
});

zohoRoutes.get('/sync', async (_req: Request, res: Response) => {
  // TODO: implement synchronization status/trigger
  res.status(501).json({ success: false, message: 'Not implemented yet' });
});
