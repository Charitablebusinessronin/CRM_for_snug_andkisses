import { Router, Request, Response } from 'express';

export const authRoutes = Router();

// Placeholder login endpoint
authRoutes.post('/login', async (req: Request, res: Response) => {
  // TODO: implement real auth logic
  res.status(501).json({ success: false, message: 'Not implemented yet' });
});
