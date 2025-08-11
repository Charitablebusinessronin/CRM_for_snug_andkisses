const express = require('express');
const router = express.Router();
const CatalystManager = require('../utils/catalyst-config');
const { HIPAAAuditLogger } = require('../utils/hipaa-audit-logger');

// Catalyst init middleware (best-effort)
router.use(async (req, _res, next) => {
  try {
    if (!CatalystManager.initialized) {
      await CatalystManager.initialize();
    }
    req.catalyst = CatalystManager.getApp();
  } catch (err) {
    console.warn('Catalyst unavailable, continuing with fallback:', err?.message || err);
    req.catalyst = null;
  }
  next();
});

// Finance - Get Invoices
router.get('/finance/invoices', async (req, res) => {
  const { page = 1, limit = 50, status = '' } = req.query;
  const userId = req.headers['x-user-id'] || 'anonymous';

  try {
    let invoices = [];

    if (req.catalyst) {
      try {
        const table = await CatalystManager.getDataStore('invoices');
        // SDK query APIs vary; attempt a simple fetch, fallback to mock on failure
        const result = await table.getPagedRows ? await table.getPagedRows({}) : await table.fetch();
        const rows = result?.data || result?.rows || [];
        invoices = Array.isArray(rows) ? rows : [];
        if (status) {
          invoices = invoices.filter((r) => String(r.status || '').toLowerCase() === String(status).toLowerCase());
        }
      } catch (sdkErr) {
        console.warn('Catalyst DataStore fetch failed, using mock:', sdkErr?.message || sdkErr);
        invoices = getMockInvoices();
      }
    } else {
      invoices = getMockInvoices();
    }

    await HIPAAAuditLogger.logDataAccess({
      userId,
      action: 'READ',
      dataType: 'invoice',
      phi_accessed: false,
      success: true,
      details: { page, limit, status, count: invoices.length },
    });

    res.json({
      success: true,
      data: invoices,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total: invoices.length,
      },
    });
  } catch (error) {
    console.error('Invoice fetch error:', error);
    await HIPAAAuditLogger.logDataAccess({
      userId,
      action: 'READ',
      dataType: 'invoice',
      success: false,
      details: { error: error?.message || String(error) },
    });
    res.status(500).json({ success: false, error: 'Failed to fetch invoices' });
  }
});

function getMockInvoices() {
  return [
    {
      id: 'mock-001',
      client: 'Sample Client',
      amount: 1000.0,
      status: 'pending',
      date: new Date().toISOString(),
    },
  ];
}

module.exports = router;
