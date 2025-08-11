import { Router, Request, Response } from 'express';

export const leadRoutes = Router();

leadRoutes.get('/', async (_req: Request, res: Response) => {
  // TODO: implement lead listing via Zoho CRM
  res.status(501).json({ success: false, message: 'Not implemented yet' });
});

leadRoutes.post('/', async (_req: Request, res: Response) => {
  // TODO: implement lead creation via Zoho CRM
  res.status(501).json({ success: false, message: 'Not implemented yet' });
});
