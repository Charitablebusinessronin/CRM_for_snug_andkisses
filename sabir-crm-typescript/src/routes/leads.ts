import { Router, Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, Lead, ApiResponse, PaginationParams } from '../types';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { CRMLeadsRepo } from '../repositories/catalyst/tables/CRM_Leads.repo';
import { CacheService } from '../services/cache.service';

const router = Router();

// Validation schemas
const createLeadSchema = z.object({
  First_Name: z.string().min(1, 'First name is required').max(50),
  Last_Name: z.string().min(1, 'Last name is required').max(50),
  Company: z.string().min(1, 'Company is required').max(100),
  Email: z.string().email('Valid email is required').max(100),
  Phone: z.string().max(20).optional(),
  Mobile: z.string().max(20).optional(),
  Lead_Source: z.string().max(50).optional(),
  Lead_Status: z.enum(['Not Contacted', 'Contacted', 'Qualified', 'Unqualified', 'Converted']).optional().default('Not Contacted'),
  Industry: z.string().max(50).optional(),
  Annual_Revenue: z.number().positive().optional(),
  No_of_Employees: z.number().int().positive().optional(),
  Description: z.string().max(500).optional()
});

const updateLeadSchema = createLeadSchema.partial();

const queryParamsSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 50),
  search: z.string().optional(),
  sortBy: z.string().optional().default('Modified_Time'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  status: z.string().optional(),
  source: z.string().optional(),
  industry: z.string().optional(),
  owner: z.string().optional()
});

// Mock Zoho CRM Service for Leads
class ZohoLeadService {
  async getLeads(params: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    source?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: Lead[]; total: number }> {
    logger.info('Fetching leads from Zoho CRM', params);
    
    // Mock implementation - replace with actual Zoho CRM SDK calls
    const mockLeads: Lead[] = [
      {
        id: '1',
        First_Name: 'John',
        Last_Name: 'Smith',
        Company: 'Tech Solutions Inc',
        Email: 'john.smith@techsolutions.com',
        Phone: '555-0101',
        Lead_Source: 'Website',
        Lead_Status: 'Not Contacted',
        Industry: 'Technology',
        Annual_Revenue: 1000000,
        No_of_Employees: 50,
        Description: 'Interested in our postpartum care services',
        Created_Time: new Date().toISOString(),
        Modified_Time: new Date().toISOString()
      },
      {
        id: '2',
        First_Name: 'Sarah',
        Last_Name: 'Johnson',
        Company: 'Healthcare Partners',
        Email: 'sarah.johnson@healthcarepartners.com',
        Phone: '555-0102',
        Lead_Source: 'Referral',
        Lead_Status: 'Contacted',
        Industry: 'Healthcare',
        Annual_Revenue: 2000000,
        No_of_Employees: 100,
        Description: 'Looking for comprehensive doula services',
        Created_Time: new Date().toISOString(),
        Modified_Time: new Date().toISOString()
      },
      {
        id: '3',
        First_Name: 'Michael',
        Last_Name: 'Brown',
        Company: 'Family First Clinic',
        Email: 'michael.brown@familyfirst.com',
        Phone: '555-0103',
        Lead_Source: 'Social Media',
        Lead_Status: 'Qualified',
        Industry: 'Healthcare',
        Annual_Revenue: 500000,
        No_of_Employees: 25,
        Description: 'Expanding their postpartum support services',
        Created_Time: new Date().toISOString(),
        Modified_Time: new Date().toISOString()
      }
    ];

    // Apply filters
    let filteredLeads = mockLeads;
    
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredLeads = filteredLeads.filter(lead =>
        lead.First_Name.toLowerCase().includes(searchLower) ||
        lead.Last_Name.toLowerCase().includes(searchLower) ||
        lead.Company.toLowerCase().includes(searchLower) ||
        lead.Email.toLowerCase().includes(searchLower)
      );
    }

    if (params.status) {
      filteredLeads = filteredLeads.filter(lead => lead.Lead_Status === params.status);
    }

    if (params.source) {
      filteredLeads = filteredLeads.filter(lead => lead.Lead_Source === params.source);
    }

    return {
      data: filteredLeads,
      total: filteredLeads.length
    };
  }

  async createLead(leadData: Lead): Promise<Lead> {
    logger.info('Creating lead in Zoho CRM', { email: leadData.Email, company: leadData.Company });
    
    // Mock implementation
    const newLead: Lead = {
      ...leadData,
      id: Date.now().toString(),
      Created_Time: new Date().toISOString(),
      Modified_Time: new Date().toISOString()
    };

    return newLead;
  }

  async getLead(id: string): Promise<Lead | null> {
    logger.info('Fetching lead from Zoho CRM', { id });
    
    // Mock implementation
    if (id === '1') {
      return {
        id: '1',
        First_Name: 'John',
        Last_Name: 'Smith',
        Company: 'Tech Solutions Inc',
        Email: 'john.smith@techsolutions.com',
        Phone: '555-0101',
        Lead_Source: 'Website',
        Lead_Status: 'Not Contacted',
        Industry: 'Technology',
        Annual_Revenue: 1000000,
        No_of_Employees: 50,
        Description: 'Interested in our postpartum care services',
        Created_Time: new Date().toISOString(),
        Modified_Time: new Date().toISOString()
      };
    }
    
    return null;
  }

  async updateLead(id: string, updateData: Partial<Lead>): Promise<Lead | null> {
    logger.info('Updating lead in Zoho CRM', { id, updateData });
    
    const existingLead = await this.getLead(id);
    if (!existingLead) {
      return null;
    }

    const updatedLead: Lead = {
      ...existingLead,
      ...updateData,
      Modified_Time: new Date().toISOString()
    };

    return updatedLead;
  }

  async deleteLead(id: string): Promise<boolean> {
    logger.info('Deleting lead from Zoho CRM', { id });
    
    const lead = await this.getLead(id);
    return !!lead;
  }

  async convertLead(id: string, contactData?: any, accountData?: any): Promise<{ contact: any; account?: any; deal?: any }> {
    logger.info('Converting lead in Zoho CRM', { id });
    
    const lead = await this.getLead(id);
    if (!lead) {
      throw new AppError('Lead not found', 404, 'LEAD_NOT_FOUND');
    }

    // Mock conversion - in real implementation, use Zoho CRM conversion API
    const contact = {
      id: Date.now().toString(),
      First_Name: lead.First_Name,
      Last_Name: lead.Last_Name,
      Email: lead.Email,
      Phone: lead.Phone,
      Account_Name: lead.Company,
      Lead_Source: lead.Lead_Source,
      Created_Time: new Date().toISOString()
    };

    const account = accountData ? {
      id: (Date.now() + 1).toString(),
      Account_Name: lead.Company,
      Industry: lead.Industry,
      Annual_Revenue: lead.Annual_Revenue,
      No_of_Employees: lead.No_of_Employees,
      Created_Time: new Date().toISOString()
    } : null;

    return { contact, account };
  }
}

const zohoLeadService = new ZohoLeadService();

// GET /api/leads - List all leads (Catalyst parity)
router.get('/',
  authMiddleware.authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse<any[]>>): Promise<void> => {
    logger.info(`User ${req.user?.email} requesting leads list (Catalyst)`);

    const rows = await CRMLeadsRepo.getAll();

    res.json({
      success: true,
      data: rows,
      count: rows.length,
      message: `Retrieved ${rows.length} leads (Catalyst)`
    });
  })
);

// POST /api/leads - Create new lead (Catalyst parity)
router.post('/',
  authMiddleware.authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse<any>>): Promise<void> => {
    const payload = req.body || {};
    if (!payload.status) payload.status = 'pending';
    payload.created_date = new Date().toISOString();
    payload.created_by = req.user?.email || 'api_user';

    logger.info(`User ${req.user?.email} creating lead (Catalyst)`);

    const created = await CRMLeadsRepo.insert(payload);

    res.status(201).json({
      success: true,
      data: created,
      message: 'Lead created successfully (Catalyst)'
    });
  })
);

// GET /api/leads/:id - Get lead by ID (Catalyst parity)
router.get('/:id',
  authMiddleware.authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse<any>>): Promise<void> => {
    const leadId = req.params.id;

    logger.info(`User ${req.user?.email} requesting lead (Catalyst): ${leadId}`);

    const lead = await CRMLeadsRepo.getById(leadId);

    if (!lead) {
      throw new AppError('Lead not found', 404, 'LEAD_NOT_FOUND');
    }

    res.json({
      success: true,
      data: lead,
      message: 'Lead retrieved successfully (Catalyst)'
    });
  })
);

// PUT /api/leads/:id - Update lead (Catalyst parity)
router.put('/:id',
  authMiddleware.authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse<any>>): Promise<void> => {
    const leadId = req.params.id;
    const payload = req.body || {};
    payload.ROWID = leadId;
    payload.updated_date = new Date().toISOString();
    payload.updated_by = req.user?.email || 'api_user';

    logger.info(`User ${req.user?.email} updating lead (Catalyst): ${leadId}`);

    const updated = await CRMLeadsRepo.update(payload);

    res.json({
      success: true,
      data: updated,
      message: 'Lead updated successfully (Catalyst)'
    });
  })
);

// DELETE /api/leads/:id - Soft delete lead (Catalyst parity)
router.delete('/:id',
  authMiddleware.authenticateToken,
  authMiddleware.requireRole(['admin', 'employee']),
  asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> => {
    const leadId = req.params.id;

    logger.info(`User ${req.user?.email} soft deleting lead (Catalyst): ${leadId}`);

    await CRMLeadsRepo.update({
      ROWID: leadId,
      status: 'deleted',
      deleted_date: new Date().toISOString(),
      deleted_by: req.user?.email || 'api_user'
    });

    res.json({
      success: true,
      message: 'Lead deleted successfully (soft delete, Catalyst)'
    });
  })
);

// POST /api/leads/process - Bulk process pending leads (Catalyst parity)
router.post('/process',
  authMiddleware.authenticateToken,
  authMiddleware.requireRole(['admin', 'employee']),
  asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse<any>>): Promise<void> => {
    logger.info(`User ${req.user?.email} processing pending leads (Catalyst)`);

    const pending = await CRMLeadsRepo.getPending();
    let count = 0;

    for (const lead of pending) {
      if (!lead.ROWID) continue;
      await CRMLeadsRepo.update({
        ROWID: lead.ROWID,
        status: 'processed',
        processed_date: new Date().toISOString(),
        processed_by: 'catalyst_automation'
      });
      count += 1;
    }

    await CacheService.set('last_processed_count', count, 3600);

    res.json({
      success: true,
      message: `Processed ${count} leads`,
      data: { count }
    });
  })
);

// POST /api/leads/:id/convert - Convert lead to contact/account
router.post('/:id/convert',
  authMiddleware.authenticateToken,
  authMiddleware.requireRole(['admin', 'employee']),
  asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse<any>>): Promise<void> => {
    const leadId = req.params.id;
    const { createAccount = true, createDeal = false, ...conversionData } = req.body;
    
    logger.info(`User ${req.user?.email} converting lead: ${leadId}`, { createAccount, createDeal });
    
    const result = await zohoLeadService.convertLead(leadId, conversionData, createAccount ? {} : null);
    
    logger.info(`Lead converted successfully: ${leadId}`);
    
    res.json({
      success: true,
      data: result,
      message: 'Lead converted successfully'
    });
  })
);

// GET /api/leads/search/:query - Search leads
router.get('/search/:query',
  authMiddleware.authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse<Lead[]>>): Promise<void> => {
    const query = req.params.query;
    const queryParams = queryParamsSchema.parse(req.query);
    
    logger.info(`User ${req.user?.email} searching leads: ${query}`);
    
    const { data: leads, total } = await zohoLeadService.getLeads({
      page: queryParams.page,
      limit: queryParams.limit,
      search: query,
      sortBy: queryParams.sortBy,
      sortOrder: queryParams.sortOrder
    });
    
    res.json({
      success: true,
      data: leads,
      count: leads.length,
      message: `Found ${leads.length} leads matching "${query}"`
    });
  })
);

// GET /api/leads/stats/overview - Get leads statistics
router.get('/stats/overview',
  authMiddleware.authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse<any>>): Promise<void> => {
    logger.info(`User ${req.user?.email} requesting leads statistics`);
    
    // Mock statistics - replace with actual Zoho CRM analytics
    const stats = {
      total: 150,
      notContacted: 45,
      contacted: 60,
      qualified: 30,
      converted: 15,
      bySource: {
        'Website': 50,
        'Referral': 40,
        'Social Media': 30,
        'Email Campaign': 20,
        'Other': 10
      },
      byIndustry: {
        'Healthcare': 70,
        'Technology': 40,
        'Education': 25,
        'Other': 15
      },
      conversionRate: 10.0,
      averageValue: 5000
    };
    
    res.json({
      success: true,
      data: stats,
      message: 'Lead statistics retrieved successfully'
    });
  })
);

export { router as leadRoutes };