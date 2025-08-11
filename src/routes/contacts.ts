import { Router, Request, Response } from 'express';
import { zohoService } from '../services/ZohoUnifiedService';

export const contactRoutes = Router();

contactRoutes.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt((req.query.page as string) || '1', 10);
    const perPage = parseInt((req.query.perPage as string) || '50', 10);
    const contacts = await zohoService.getContacts(page, perPage);
    res.json({ success: true, data: contacts });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Failed to fetch contacts' });
  }
});

contactRoutes.post('/', async (req: Request, res: Response) => {
  try {
    const created = await zohoService.createContact(req.body || {});
    res.status(201).json({ success: true, data: created });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Failed to create contact' });
  }
});
