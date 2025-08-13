import { Router, Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, Contact, ApiResponse, PaginationParams, FilterParams } from '../types';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { CRMContactsRepo } from '../repositories/catalyst/tables/CRM_Contacts.repo';

const router = Router();

// Validation schemas
const createContactSchema = z.object({
  First_Name: z.string().min(1, 'First name is required').max(50),
  Last_Name: z.string().min(1, 'Last name is required').max(50),
  Email: z.string().email('Valid email is required').max(100),
  Phone: z.string().max(20).optional(),
  Mobile: z.string().max(20).optional(),
  Account_Name: z.string().max(100).optional(),
  Lead_Source: z.string().max(50).optional(),
  Department: z.string().max(50).optional(),
  Title: z.string().max(100).optional(),
  Description: z.string().max(500).optional()
});

const updateContactSchema = createContactSchema.partial();

const queryParamsSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 50),
  search: z.string().optional(),
  sortBy: z.string().optional().default('Modified_Time'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  source: z.string().optional(),
  owner: z.string().optional()
});

// Mock Zoho CRM SDK functions (replace with actual SDK when available)
class ZohoCRMService {
  async getContacts(params: {
    page: number;
    limit: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: Contact[]; total: number }> {
    // Mock implementation - replace with actual Zoho CRM SDK calls
    logger.info('Fetching contacts from Zoho CRM', params);
    
    // Simulate API call
    const mockContacts: Contact[] = [
      {
        id: '1',
        First_Name: 'John',
        Last_Name: 'Doe',
        Email: 'john.doe@example.com',
        Phone: '555-0123',
        Account_Name: 'Acme Corp',
        Lead_Source: 'Website',
        Created_Time: new Date().toISOString(),
        Modified_Time: new Date().toISOString()
      },
      {
        id: '2',
        First_Name: 'Jane',
        Last_Name: 'Smith',
        Email: 'jane.smith@example.com',
        Phone: '555-0124',
        Account_Name: 'TechCorp',
        Lead_Source: 'Referral',
        Created_Time: new Date().toISOString(),
        Modified_Time: new Date().toISOString()
      }
    ];

    return {
      data: mockContacts,
      total: mockContacts.length
    };
  }

  async createContact(contactData: Contact): Promise<Contact> {
    logger.info('Creating contact in Zoho CRM', { email: contactData.Email });
    
    // Mock implementation
    const newContact: Contact = {
      ...contactData,
      id: Date.now().toString(),
      Created_Time: new Date().toISOString(),
      Modified_Time: new Date().toISOString()
    };

    return newContact;
  }

  async getContact(id: string): Promise<Contact | null> {
    logger.info('Fetching contact from Zoho CRM', { id });
    
    // Mock implementation
    if (id === '1') {
      return {
        id: '1',
        First_Name: 'John',
        Last_Name: 'Doe',
        Email: 'john.doe@example.com',
        Phone: '555-0123',
        Account_Name: 'Acme Corp',
        Lead_Source: 'Website',
        Created_Time: new Date().toISOString(),
        Modified_Time: new Date().toISOString()
      };
    }
    
    return null;
  }

  async updateContact(id: string, updateData: Partial<Contact>): Promise<Contact | null> {
    logger.info('Updating contact in Zoho CRM', { id, updateData });
    
    // Mock implementation
    const existingContact = await this.getContact(id);
    if (!existingContact) {
      return null;
    }

    const updatedContact: Contact = {
      ...existingContact,
      ...updateData,
      Modified_Time: new Date().toISOString()
    };

    return updatedContact;
  }

  async deleteContact(id: string): Promise<boolean> {
    logger.info('Deleting contact from Zoho CRM', { id });
    
    // Mock implementation
    const contact = await this.getContact(id);
    return !!contact;
  }
}

const zohoCRMService = new ZohoCRMService();

// GET /api/contacts - List all contacts (Catalyst parity)
router.get('/', 
  authMiddleware.authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse<any[]>>): Promise<void> => {
    logger.info(`User ${req.user?.email} requesting contacts list (Catalyst)`);

    const rows = await CRMContactsRepo.getAll();

    res.json({
      success: true,
      data: rows,
      count: rows.length,
      message: `Retrieved ${rows.length} contacts (Catalyst)`
    });
  })
);

// POST /api/contacts - Create new contact (Catalyst parity)
router.post('/',
  authMiddleware.authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse<any>>): Promise<void> => {
    const payload = req.body || {};
    payload.created_date = new Date().toISOString();
    if (payload.status == null) payload.status = 'active';

    logger.info(`User ${req.user?.email} creating contact (Catalyst)`);

    const created = await CRMContactsRepo.insert(payload);

    res.status(201).json({
      success: true,
      data: created,
      message: 'Contact created successfully (Catalyst)'
    });
  })
);

// GET /api/contacts/:id - Get single contact (Catalyst parity)
router.get('/:id',
  authMiddleware.authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse<any>>): Promise<void> => {
    const contactId = req.params.id;

    logger.info(`User ${req.user?.email} requesting contact (Catalyst): ${contactId}`);

    const contact = await CRMContactsRepo.getById(contactId);

    if (!contact) {
      throw new AppError('Contact not found', 404, 'CONTACT_NOT_FOUND');
    }

    res.json({
      success: true,
      data: contact,
      message: 'Contact retrieved successfully (Catalyst)'
    });
  })
);

// PUT /api/contacts/:id - Update contact (Catalyst parity)
router.put('/:id',
  authMiddleware.authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse<any>>): Promise<void> => {
    const contactId = req.params.id;
    const updateData = req.body || {};
    updateData.ROWID = contactId;
    updateData.updated_date = new Date().toISOString();

    logger.info(`User ${req.user?.email} updating contact (Catalyst): ${contactId}`);

    const updated = await CRMContactsRepo.update(updateData);

    res.json({
      success: true,
      data: updated,
      message: 'Contact updated successfully (Catalyst)'
    });
  })
);

// DELETE /api/contacts/:id - Delete contact
router.delete('/:id',
  authMiddleware.authenticateToken,
  authMiddleware.requireRole(['admin', 'employee']),
  asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> => {
    const contactId = req.params.id;
    
    logger.info(`User ${req.user?.email} deleting contact: ${contactId}`);
    
    const deleted = await zohoCRMService.deleteContact(contactId);
    
    if (!deleted) {
      throw new AppError('Contact not found', 404, 'CONTACT_NOT_FOUND');
    }
    
    logger.info(`Contact deleted successfully: ${contactId}`);
    
    res.json({
      success: true,
      message: 'Contact deleted successfully'
    });
  })
);

// GET /api/contacts/search/:query - Search contacts
router.get('/search/:query',
  authMiddleware.authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse<Contact[]>>): Promise<void> => {
    const query = req.params.query;
    const queryParams = queryParamsSchema.parse(req.query);
    
    logger.info(`User ${req.user?.email} searching contacts: ${query}`);
    
    const { data: contacts, total } = await zohoCRMService.getContacts({
      page: queryParams.page,
      limit: queryParams.limit,
      search: query,
      sortBy: queryParams.sortBy,
      sortOrder: queryParams.sortOrder
    });
    
    res.json({
      success: true,
      data: contacts,
      count: contacts.length,
      message: `Found ${contacts.length} contacts matching "${query}"`
    });
  })
);

export { router as contactRoutes };