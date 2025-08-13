import express, { Request, Response } from 'express';
import { zohoSDK } from '../services/ZohoUnifiedSDK';
import { logger } from '../utils/logger';

const router = express.Router();

function ok(res: Response, data: any) {
  return res.json({ success: true, ...data });
}
function fail(res: Response, error: any, code = 500) {
  const message = (error && (error.message || error.toString())) || 'Unknown error';
  logger.error('Client portal route error', { error: message });
  return res.status(code).json({ success: false, error: message });
}

// 1) Urgent Care
router.post('/urgent-care', async (req: Request, res: Response) => {
  const { clientId, requestType = 'medical' } = req.body || {};
  if (!clientId) return res.status(400).json({ success: false, error: 'clientId is required' });
  try {
    // Fetch client record via criteria (no direct getById helper available)
    const { data: clients } = await zohoSDK.getCRMRecords<any>('Contacts', {
      criteria: `(id:equals:${clientId})`,
      fields: ['Full_Name', 'Assigned_Contractor']
    });
    const client = clients?.[0] || {};
    const contractor = client.Assigned_Contractor || 'Unassigned';

    const ticket = await zohoSDK.createCRMRecord<any>('Cases', {
      Subject: `Urgent ${requestType} request from ${client.Full_Name || clientId}`,
      Priority: 'High',
      Status: 'Open',
      Contact_Name: clientId,
      Assigned_To: contractor,
      Created_Time: new Date().toISOString()
    });

    const ticketId = (ticket as any)?.id || `CASE_${Date.now()}`;
    return ok(res, { ticketId, assignedContractor: contractor, estimatedResponse: '< 15 minutes' });
  } catch (error) {
    logger.warn('Falling back to stub urgent-care', { error });
    const ticketId = `CASE_${Date.now()}`;
    return ok(res, { ticketId, assignedContractor: 'Unassigned', estimatedResponse: '< 15 minutes', mode: 'stub' });
  }
});

// 2) Contact Care Provider
router.post('/contact-provider', async (req: Request, res: Response) => {
  const { clientId } = req.body || {};
  if (!clientId) return res.status(400).json({ success: false, error: 'clientId is required' });
  try {
    const { data: clients } = await zohoSDK.getCRMRecords<any>('Contacts', {
      criteria: `(id:equals:${clientId})`,
      fields: ['Full_Name', 'Assigned_Doula', 'Assigned_Contractor']
    });
    const client = clients?.[0] || {};
    const assignedDoula = client.Assigned_Doula || client.Assigned_Contractor || 'Assigned Doula';

    const task = await zohoSDK.createCRMRecord<any>('Tasks', {
      Subject: `Contact request from client ${clientId}`,
      Status: 'Not Started',
      Priority: 'Normal',
      Due_Date: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      Who_Id: assignedDoula,
      What_Id: clientId
    });

    return ok(res, { providerName: assignedDoula, expectedResponse: '5-10 minutes', contactMethod: 'phone_call', taskId: (task as any)?.id });
  } catch (error) {
    logger.warn('Falling back to stub contact-provider', { error });
    return ok(res, { providerName: 'Assigned Doula', expectedResponse: '5-10 minutes', contactMethod: 'phone_call', mode: 'stub' });
  }
});

// 3) Schedule Appointment
router.post('/schedule-appointment', async (req: Request, res: Response) => {
  const { clientId, appointmentType = 'consultation' } = req.body || {};
  if (!clientId) return res.status(400).json({ success: false, error: 'clientId is required' });
  try {
    // Placeholder for Zoho Bookings integration
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5369';
    const bookingUrl = `${frontendUrl}/client/appointments/confirmation?client=${clientId}&type=${appointmentType}`;
    return ok(res, { bookingUrl, availableSlots: 5, serviceType: appointmentType });
  } catch (error) {
    return fail(res, error);
  }
});

// 4) Message Care Team
router.post('/message-team', async (req: Request, res: Response) => {
  const { clientId, message, priority = 'normal' } = req.body || {};
  if (!clientId || !message) return res.status(400).json({ success: false, error: 'clientId and message are required' });
  try {
    const thread = await zohoSDK.createCRMRecord<any>('Messages', {
      Subject: `Message from client ${clientId}`,
      Content: message, // Consider encryption for PHI
      From_Client: clientId,
      Priority: priority,
      Status: 'Sent',
      Created_Time: new Date().toISOString()
    });
    const messageId = (thread as any)?.id || `MSG_${Date.now()}`;
    return ok(res, { messageId, deliveredTo: 3, estimatedResponse: priority === 'urgent' ? '2-3 minutes' : '1-2 hours' });
  } catch (error) {
    logger.warn('Falling back to stub messaging', { error });
    const messageId = `MSG_${Date.now()}`;
    return ok(res, { messageId, deliveredTo: 0, estimatedResponse: '1-2 hours', mode: 'stub' });
  }
});

// 5) Start Video Call
router.post('/video-call', async (req: Request, res: Response) => {
  const { clientId, callType = 'consultation' } = req.body || {};
  if (!clientId) return res.status(400).json({ success: false, error: 'clientId is required' });
  try {
    // Placeholder for Zoho Meeting SDK integration
    const meetingId = `MEET_${Date.now()}`;
    const meetingUrl = `https://meeting.zoho.com/join/${meetingId}`;
    const password = Math.random().toString(36).slice(2, 8).toUpperCase();
    return ok(res, { meetingUrl, meetingId, password, estimatedWaitTime: '30-60 seconds' });
  } catch (error) {
    return fail(res, error);
  }
});

export default router;
