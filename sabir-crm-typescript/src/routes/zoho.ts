import { Router, Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { zohoSDK } from '../services/ZohoUnifiedSDK';
import { logger } from '../utils/logger';

const router = Router();

// Validation schemas
const syncRequestSchema = z.object({
  services: z.array(z.enum(['crm', 'books', 'analytics', 'campaigns', 'desk'])).optional(),
  modules: z.array(z.string()).optional(),
  fullSync: z.boolean().optional().default(false)
});

const crmModuleSchema = z.object({
  module: z.string().min(1, 'Module name is required'),
  page: z.number().int().min(1).optional().default(1),
  perPage: z.number().int().min(1).max(200).optional().default(50),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  fields: z.array(z.string()).optional(),
  criteria: z.string().optional()
});

const createRecordSchema = z.object({
  module: z.string().min(1, 'Module name is required'),
  data: z.record(z.any())
});

const updateRecordSchema = z.object({
  module: z.string().min(1, 'Module name is required'),
  recordId: z.string().min(1, 'Record ID is required'),
  data: z.record(z.any())
});

const booksInvoiceSchema = z.object({
  customer_id: z.string().min(1, 'Customer ID is required'),
  invoice_number: z.string().optional(),
  date: z.string().optional(),
  due_date: z.string().optional(),
  line_items: z.array(z.object({
    item_id: z.string().optional(),
    name: z.string().min(1, 'Item name is required'),
    description: z.string().optional(),
    rate: z.number().min(0, 'Rate must be non-negative'),
    quantity: z.number().min(0, 'Quantity must be non-negative'),
    tax_id: z.string().optional()
  })).min(1, 'At least one line item is required'),
  notes: z.string().optional(),
  terms: z.string().optional()
});

// =============================================================================
// HEALTH & STATUS ENDPOINTS
// =============================================================================

// GET /api/zoho/health - Check Zoho services health
router.get('/health',
  authMiddleware.authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse<any>>): Promise<void> => {
    logger.info(`User ${req.user?.email} requesting Zoho services health status`);

    try {
      const healthStatus = await zohoSDK.getHealthStatus();

      const overallHealth = Object.values(healthStatus.services).some(service => service);
      const tokenHealth = Object.values(healthStatus.tokens).filter(valid => valid).length;

      res.json({
        success: true,
        data: {
          ...healthStatus,
          overall: {
            healthy: overallHealth,
            services_configured: Object.values(healthStatus.services).filter(Boolean).length,
            tokens_valid: tokenHealth,
            environment: healthStatus.configuration.environment,
            domain: healthStatus.configuration.domain
          }
        },
        message: `Zoho services health check completed - ${overallHealth ? 'healthy' : 'issues detected'}`
      });
    } catch (error) {
      logger.error('Zoho health check failed', error);
      throw new AppError('Failed to check Zoho services health', 500, 'ZOHO_HEALTH_CHECK_FAILED');
    }
  })
);

// POST /api/zoho/sync - Trigger data synchronization
router.post('/sync',
  authMiddleware.authenticateToken,
  authMiddleware.requireRole(['admin', 'employee']),
  asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse<any>>): Promise<void> => {
    const { services, modules, fullSync } = syncRequestSchema.parse(req.body);

    logger.info(`User ${req.user?.email} triggering Zoho sync`, {
      services,
      modules,
      fullSync
    });

    try {
      const syncResults = {
        timestamp: new Date().toISOString(),
        services: services || ['crm'],
        modules: modules || ['Contacts', 'Leads', 'Accounts', 'Deals'],
        fullSync,
        results: {} as Record<string, any>
      };

      // Initialize SDK if not already done
      await zohoSDK.initialize();

      // Sync CRM data if requested
      if (!services || services.includes('crm')) {
        const crmModules = modules || ['Contacts', 'Leads', 'Accounts', 'Deals'];
        
        for (const module of crmModules) {
          try {
            const { data, info } = await zohoSDK.getCRMRecords(module, {
              page: 1,
              perPage: fullSync ? 200 : 50,
              sortBy: 'Modified_Time',
              sortOrder: 'desc'
            });

            syncResults.results[module] = {
              success: true,
              recordCount: data.length,
              hasMore: info.more_records || false,
              lastModified: data[0] ? (data[0] as any).Modified_Time : null
            };

            logger.info(`CRM ${module} sync completed`, {
              recordCount: data.length,
              hasMore: info.more_records
            });
          } catch (error) {
            syncResults.results[module] = {
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            };
            logger.error(`CRM ${module} sync failed`, error);
          }
        }
      }

      // Sync Books data if requested and configured
      if (services?.includes('books')) {
        try {
          const organizations = await zohoSDK.getBooksOrganizations();
          syncResults.results.books_organizations = {
            success: true,
            count: organizations.length
          };
        } catch (error) {
          syncResults.results.books_organizations = {
            success: false,
            error: error instanceof Error ? error.message : 'Books not configured'
          };
        }
      }

      // Sync Analytics data if requested and configured
      if (services?.includes('analytics')) {
        try {
          const workspaces = await zohoSDK.getAnalyticsWorkspaces();
          syncResults.results.analytics_workspaces = {
            success: true,
            count: workspaces.length
          };
        } catch (error) {
          syncResults.results.analytics_workspaces = {
            success: false,
            error: error instanceof Error ? error.message : 'Analytics not configured'
          };
        }
      }

      const successCount = Object.values(syncResults.results).filter(result => result.success).length;
      const totalCount = Object.keys(syncResults.results).length;

      res.json({
        success: successCount > 0,
        data: syncResults,
        message: `Zoho sync completed - ${successCount}/${totalCount} operations successful`
      });

    } catch (error) {
      logger.error('Zoho sync operation failed', error);
      throw new AppError('Zoho sync operation failed', 500, 'ZOHO_SYNC_FAILED');
    }
  })
);

// =============================================================================
// CRM ENDPOINTS
// =============================================================================

// GET /api/zoho/crm/:module - Get CRM records for a specific module
router.get('/crm/:module',
  authMiddleware.authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse<any>>): Promise<void> => {
    const module = req.params.module;
    const queryParams = crmModuleSchema.parse({
      module,
      ...req.query,
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      perPage: req.query.perPage ? parseInt(req.query.perPage as string, 10) : undefined
    });

    logger.info(`User ${req.user?.email} requesting CRM ${module} records`, queryParams);

    try {
      await zohoSDK.initialize();

      const { data, info } = await zohoSDK.getCRMRecords(module, {
        page: queryParams.page,
        perPage: queryParams.perPage,
        sortBy: queryParams.sortBy,
        sortOrder: queryParams.sortOrder,
        fields: queryParams.fields,
        criteria: queryParams.criteria
      });

      const hasNext = queryParams.page * queryParams.perPage < (info.count || 0);
      const hasPrev = queryParams.page > 1;

      res.json({
        success: true,
        data,
        count: data.length,
        message: `Retrieved ${data.length} ${module} records`,
        pagination: {
          page: queryParams.page,
          limit: queryParams.perPage,
          total: info.count || data.length,
          hasNext,
          hasPrev
        }
      });

    } catch (error) {
      logger.error(`Failed to get CRM ${module} records`, error);
      throw new AppError(`Failed to fetch ${module} records`, 500, 'ZOHO_CRM_FETCH_FAILED');
    }
  })
);

// POST /api/zoho/crm/records - Create CRM record
router.post('/crm/records',
  authMiddleware.authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse<any>>): Promise<void> => {
    const { module, data } = createRecordSchema.parse(req.body);

    logger.info(`User ${req.user?.email} creating CRM ${module} record`, {
      module,
      fields: Object.keys(data)
    });

    try {
      await zohoSDK.initialize();

      const createdRecord = await zohoSDK.createCRMRecord(module, data);

      res.status(201).json({
        success: true,
        data: createdRecord,
        message: `${module} record created successfully`
      });

    } catch (error) {
      logger.error(`Failed to create CRM ${module} record`, error);
      throw new AppError(`Failed to create ${module} record`, 500, 'ZOHO_CRM_CREATE_FAILED');
    }
  })
);

// PUT /api/zoho/crm/records - Update CRM record
router.put('/crm/records',
  authMiddleware.authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse<any>>): Promise<void> => {
    const { module, recordId, data } = updateRecordSchema.parse(req.body);

    logger.info(`User ${req.user?.email} updating CRM ${module} record`, {
      module,
      recordId,
      fields: Object.keys(data)
    });

    try {
      await zohoSDK.initialize();

      const updatedRecord = await zohoSDK.updateCRMRecord(module, recordId, data);

      res.json({
        success: true,
        data: updatedRecord,
        message: `${module} record updated successfully`
      });

    } catch (error) {
      logger.error(`Failed to update CRM ${module} record`, error);
      throw new AppError(`Failed to update ${module} record`, 500, 'ZOHO_CRM_UPDATE_FAILED');
    }
  })
);

// DELETE /api/zoho/crm/:module/:recordId - Delete CRM record
router.delete('/crm/:module/:recordId',
  authMiddleware.authenticateToken,
  authMiddleware.requireRole(['admin', 'employee']),
  asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> => {
    const module = req.params.module;
    const recordId = req.params.recordId;

    logger.info(`User ${req.user?.email} deleting CRM ${module} record`, {
      module,
      recordId
    });

    try {
      await zohoSDK.initialize();

      const deleted = await zohoSDK.deleteCRMRecord(module, recordId);

      if (!deleted) {
        throw new AppError(`${module} record not found`, 404, 'RECORD_NOT_FOUND');
      }

      res.json({
        success: true,
        message: `${module} record deleted successfully`
      });

    } catch (error) {
      logger.error(`Failed to delete CRM ${module} record`, error);
      throw new AppError(`Failed to delete ${module} record`, 500, 'ZOHO_CRM_DELETE_FAILED');
    }
  })
);

// =============================================================================
// BOOKS ENDPOINTS
// =============================================================================

// GET /api/zoho/books/organizations - Get Books organizations
router.get('/books/organizations',
  authMiddleware.authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse<any>>): Promise<void> => {
    logger.info(`User ${req.user?.email} requesting Books organizations`);

    try {
      await zohoSDK.initialize();

      const organizations = await zohoSDK.getBooksOrganizations();

      res.json({
        success: true,
        data: organizations,
        count: organizations.length,
        message: `Retrieved ${organizations.length} Books organizations`
      });

    } catch (error) {
      logger.error('Failed to get Books organizations', error);
      throw new AppError('Failed to fetch Books organizations', 500, 'ZOHO_BOOKS_FETCH_FAILED');
    }
  })
);

// POST /api/zoho/books/invoices - Create Books invoice
router.post('/books/invoices',
  authMiddleware.authenticateToken,
  authMiddleware.requireRole(['admin', 'employee']),
  asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse<any>>): Promise<void> => {
    const invoiceData = booksInvoiceSchema.parse(req.body);

    logger.info(`User ${req.user?.email} creating Books invoice`, {
      customerId: invoiceData.customer_id,
      lineItems: invoiceData.line_items.length
    });

    try {
      await zohoSDK.initialize();

      const invoice = await zohoSDK.createBooksInvoice(invoiceData);

      res.status(201).json({
        success: true,
        data: invoice,
        message: 'Books invoice created successfully'
      });

    } catch (error) {
      logger.error('Failed to create Books invoice', error);
      throw new AppError('Failed to create Books invoice', 500, 'ZOHO_BOOKS_CREATE_FAILED');
    }
  })
);

// =============================================================================
// ANALYTICS ENDPOINTS
// =============================================================================

// GET /api/zoho/analytics/workspaces - Get Analytics workspaces
router.get('/analytics/workspaces',
  authMiddleware.authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse<any>>): Promise<void> => {
    logger.info(`User ${req.user?.email} requesting Analytics workspaces`);

    try {
      await zohoSDK.initialize();

      const workspaces = await zohoSDK.getAnalyticsWorkspaces();

      res.json({
        success: true,
        data: workspaces,
        count: workspaces.length,
        message: `Retrieved ${workspaces.length} Analytics workspaces`
      });

    } catch (error) {
      logger.error('Failed to get Analytics workspaces', error);
      throw new AppError('Failed to fetch Analytics workspaces', 500, 'ZOHO_ANALYTICS_FETCH_FAILED');
    }
  })
);

// =============================================================================
// UTILITIES & DEBUGGING
// =============================================================================

// GET /api/zoho/modules - Get available CRM modules
router.get('/modules',
  authMiddleware.authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse<any>>): Promise<void> => {
    logger.info(`User ${req.user?.email} requesting available CRM modules`);

    const modules = [
      { name: 'Contacts', apiName: 'Contacts', description: 'Individual contacts and persons' },
      { name: 'Leads', apiName: 'Leads', description: 'Potential customers and prospects' },
      { name: 'Accounts', apiName: 'Accounts', description: 'Companies and organizations' },
      { name: 'Deals', apiName: 'Deals', description: 'Sales opportunities and deals' },
      { name: 'Products', apiName: 'Products', description: 'Product catalog and inventory' },
      { name: 'Quotes', apiName: 'Quotes', description: 'Sales quotes and proposals' },
      { name: 'Sales_Orders', apiName: 'Sales_Orders', description: 'Confirmed sales orders' },
      { name: 'Purchase_Orders', apiName: 'Purchase_Orders', description: 'Purchase orders to vendors' },
      { name: 'Invoices', apiName: 'Invoices', description: 'Customer invoices and billing' },
      { name: 'Campaigns', apiName: 'Campaigns', description: 'Marketing campaigns' },
      { name: 'Cases', apiName: 'Cases', description: 'Customer support cases' },
      { name: 'Solutions', apiName: 'Solutions', description: 'Knowledge base solutions' },
      { name: 'Events', apiName: 'Events', description: 'Calendar events and meetings' },
      { name: 'Tasks', apiName: 'Tasks', description: 'To-do items and tasks' },
      { name: 'Calls', apiName: 'Calls', description: 'Phone call records' },
      { name: 'Notes', apiName: 'Notes', description: 'Notes and comments' },
      { name: 'Attachments', apiName: 'Attachments', description: 'File attachments' }
    ];

    res.json({
      success: true,
      data: modules,
      count: modules.length,
      message: `Available CRM modules: ${modules.length}`
    });
  })
);

// POST /api/zoho/test-connection - Test Zoho API connectivity
router.post('/test-connection',
  authMiddleware.authenticateToken,
  authMiddleware.requireRole(['admin']),
  asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse<any>>): Promise<void> => {
    const { service } = z.object({
      service: z.enum(['crm', 'books', 'analytics', 'campaigns', 'desk']).optional().default('crm')
    }).parse(req.body);

    logger.info(`User ${req.user?.email} testing ${service} connection`);

    try {
      await zohoSDK.initialize();

      let testResult;

      switch (service) {
        case 'crm':
          const { data } = await zohoSDK.getCRMRecords('Contacts', { page: 1, perPage: 1 });
          testResult = { service: 'CRM', status: 'connected', sampleRecordCount: data.length };
          break;

        case 'books':
          const organizations = await zohoSDK.getBooksOrganizations();
          testResult = { service: 'Books', status: 'connected', organizationCount: organizations.length };
          break;

        case 'analytics':
          const workspaces = await zohoSDK.getAnalyticsWorkspaces();
          testResult = { service: 'Analytics', status: 'connected', workspaceCount: workspaces.length };
          break;

        default:
          testResult = { service, status: 'not_configured' };
      }

      res.json({
        success: true,
        data: testResult,
        message: `${service.toUpperCase()} connection test completed`
      });

    } catch (error) {
      logger.error(`${service} connection test failed`, error);
      
      res.json({
        success: false,
        data: {
          service,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        message: `${service.toUpperCase()} connection test failed`
      });
    }
  })
);

export { router as zohoRoutes };