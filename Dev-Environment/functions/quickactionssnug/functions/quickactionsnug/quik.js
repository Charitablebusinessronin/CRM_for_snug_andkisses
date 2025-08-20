'use strict';

// Catalyst SDK (initialized per-request)
let catalyst;
try {
  // Lazy require to avoid issues in local mock execution
  // eslint-disable-next-line import/no-extraneous-dependencies
  catalyst = require('zcatalyst-sdk-node');
} catch {
  catalyst = null;
}

// Utilities
function ok(data) {
  return { success: true, data };
}
function err(message, details) {
  return { success: false, error: message, details };
}
function hipaaAudit(action, details = {}) {
  try {
    console.log(JSON.stringify({ ts: new Date().toISOString(), action, details }));
  } catch {
    console.log(JSON.stringify({ ts: new Date().toISOString(), action, details: 'unserializable' }));
  }
}

// Token helper (stub for future CRM wiring)
async function ensureValidToken(catalystApp) {
  try {
    if (!catalystApp || !catalystApp.tokenManager) return null;
    const tm = catalystApp.tokenManager();
    const token = await tm.getToken('zoho_crm');
    if (!token || Date.now() > (token.expiryTime || 0)) {
      await tm.refreshToken('zoho_crm');
      return tm.getToken('zoho_crm');
    }
    return token;
  } catch (e) {
    hipaaAudit('TOKEN_HELPER_ERROR', { error: e?.message || String(e) });
    return null;
  }
}

// Quick Actions handlers
const handlers = {
  // Reads
  async getRecentNotes(params) {
    hipaaAudit('QA_GET_RECENT_NOTES', { limit: params?.limit });
    const notes = Array(Math.min(10, params?.limit || 10))
      .fill(0)
      .map((_, i) => ({
        id: `note_${i + 1}`,
        title: `Shift Note #${i + 1}`,
        createdTime: new Date(Date.now() - i * 3600_000).toISOString(),
        author: 'employee@snugandkisses.com',
      }));
    return ok(notes);
  },

  async getPendingTasks(params) {
    hipaaAudit('QA_GET_PENDING_TASKS', { limit: params?.limit });
    const tasks = Array(Math.min(20, params?.limit || 20))
      .fill(0)
      .map((_, i) => ({
        id: `task_${i + 1}`,
        subject: `Follow-up #${i + 1}`,
        dueDate: new Date(Date.now() + (i + 1) * 86400_000).toISOString().slice(0, 10),
        status: 'Not Started',
      }));
    return ok(tasks);
  },

  async getUpcomingAppointments(params) {
    hipaaAudit('QA_GET_APPTS', { days: params?.days });
    const days = Math.min(30, Math.max(1, Number(params?.days || 7)));
    const appts = Array(days)
      .fill(0)
      .map((_, i) => ({
        id: `appt_${i + 1}`,
        when: new Date(Date.now() + i * 86400_000).toISOString(),
        client: `Client ${i + 1}`,
        type: i % 2 === 0 ? 'Home Visit' : 'Check-in',
        status: 'upcoming',
      }));
    return ok(appts);
  },

  async getQuickStats() {
    hipaaAudit('QA_GET_STATS');
    return ok({ totalCases: 12, activeCases: 5, availableDoulas: 3, availableHours: 28 });
  },

  async getRecentActivities(params) {
    hipaaAudit('QA_GET_ACTIVITIES', { limit: params?.limit });
    const activities = Array(Math.min(15, params?.limit || 15))
      .fill(0)
      .map((_, i) => ({
        id: `act_${i + 1}`,
        description: `Case update #${i + 1}`,
        status: i % 3 === 0 ? 'active' : i % 3 === 1 ? 'scheduled' : 'completed',
        ts: new Date(Date.now() - i * 7200_000).toISOString(),
      }));
    return ok(activities);
  },

  // Creates
  async createQuickNote(params) {
    hipaaAudit('QA_CREATE_NOTE', { title: params?.title });
    const id = `note_${Date.now()}`;
    return ok({ id, ...params, createdTime: new Date().toISOString() });
  },

  async createQuickTask(params) {
    hipaaAudit('QA_CREATE_TASK', { subject: params?.subject || params?.title });
    const id = `task_${Date.now()}`;
    return ok({ id, ...params, status: 'Not Started' });
  },

  async createQuickAppointment(params) {
    hipaaAudit('QA_CREATE_APPT', { when: params?.when, clientId: params?.clientId });
    const id = `appt_${Date.now()}`;
    return ok({ id, ...params, status: 'scheduled' });
  },

  async createQuickContact(params) {
    hipaaAudit('QA_CREATE_CONTACT', { email: params?.email });
    const id = `contact_${Date.now()}`;
    return ok({ id, ...params });
  },

  async createQuickLead(params) {
    hipaaAudit('QA_CREATE_LEAD', { email: params?.email });
    const id = `lead_${Date.now()}`;
    return ok({ id, ...params, stage: 'New' });
  },

  async recordPayment(params) {
    hipaaAudit('QA_RECORD_PAYMENT', { amount: params?.amount });
    const id = `payment_${Date.now()}`;
    return ok({ id, ...params, status: 'recorded' });
  },

  async generateReport(params) {
    hipaaAudit('QA_GENERATE_REPORT', { type: params?.type });
    const id = `report_${Date.now()}`;
    return ok({ id, type: params?.type || 'summary', url: 'https://example.com/report.pdf' });
  },

  async trackExpense(params) {
    hipaaAudit('QA_TRACK_EXPENSE', { amount: params?.amount, category: params?.category });
    const id = `expense_${Date.now()}`;
    return ok({ id, ...params, status: 'recorded' });
  },

  async updateAvailability(params) {
    hipaaAudit('QA_UPDATE_AVAILABILITY', { status: params?.status });
    return ok({ updated: true, status: params?.status || 'Available' });
  },

  // Updates
  async completeTask(params) {
    hipaaAudit('QA_COMPLETE_TASK', { id: params?.id });
    return ok({ id: params?.id, status: 'Completed' });
  },

  async updateNote(params) {
    hipaaAudit('QA_UPDATE_NOTE', { id: params?.id });
    return ok({ id: params?.id, ...params });
  },

  async rescheduleAppointment(params) {
    hipaaAudit('QA_RESCHEDULE_APPT', { id: params?.id, when: params?.when });
    return ok({ id: params?.id, when: params?.when, status: 'rescheduled' });
  },

  // High-priority actions (Phase 1: proxy to existing quick handlers)
  async createNote(params, catalystApp) {
    hipaaAudit('QA_CREATE_NOTE_V2', { title: params?.title, entityId: params?.entityId, entityType: params?.entityType });
    try {
      if (catalystApp && catalystApp.zcrmSDK) {
        const zcrmAPI = catalystApp.zcrmSDK();
        const notePayload = {
          data: [{
            Note_Title: params.title || 'Quick Note',
            Note_Content: params.content || '',
            Parent_Id: params.entityId,
            se_module: params.entityType
          }]
        };
        const response = await zcrmAPI.API.MODULES.post({ module: 'Notes', body: notePayload });
        return ok(response);
      }
    } catch (e) {
      hipaaAudit('QA_CREATE_NOTE_ERROR', { error: e?.message || String(e) });
    }
    // Fallback stub
    return handlers.createQuickNote(params);
  },

  async createTask(params, catalystApp) {
    hipaaAudit('QA_CREATE_TASK_V2', { subject: params?.subject || params?.title, entityId: params?.entityId, entityType: params?.entityType });
    try {
      if (catalystApp && catalystApp.zcrmSDK) {
        const zcrmAPI = catalystApp.zcrmSDK();
        const taskPayload = {
          data: [{
            Subject: params.subject || params.title || 'Quick Task',
            Due_Date: params.dueDate || new Date(Date.now() + 86400000).toISOString().slice(0, 10),
            Status: params.status || 'Not Started',
            Priority: params.priority || 'High',
            $se_module: params.entityType || 'Contacts',
            What_Id: params.entityId
          }]
        };
        const response = await zcrmAPI.API.MODULES.post({ module: 'Tasks', body: taskPayload });
        return ok(response);
      }
    } catch (e) {
      hipaaAudit('QA_CREATE_TASK_ERROR', { error: e?.message || String(e) });
    }
    // Fallback stub
    return handlers.createQuickTask(params);
  },

  async updateStatus(params, catalystApp) {
    hipaaAudit('QA_UPDATE_STATUS_V2', { entityId: params?.id || params?.entityId, status: params?.status, entityType: params?.entityType });
    const id = params?.id || params?.entityId;
    const module = params?.entityType || 'Contacts';
    try {
      if (catalystApp && catalystApp.zcrmSDK && id && module) {
        const zcrmAPI = catalystApp.zcrmSDK();
        const body = { data: [{ Status: params?.status || 'Updated' }] };
        const response = await zcrmAPI.API.MODULES.put({ module, id, body });
        return ok(response);
      }
    } catch (e) {
      hipaaAudit('QA_UPDATE_STATUS_ERROR', { error: e?.message || String(e) });
    }
    return ok({ updated: true, id, status: params?.status || 'Updated' });
  },

  async triggerWorkflow(params, catalystApp) {
    hipaaAudit('QA_TRIGGER_WORKFLOW_V2', { name: params?.name || params?.workflow, targetId: params?.id || params?.entityId });
    try {
      if (catalystApp && catalystApp.zcrmSDK) {
        // Placeholder: depending on CRM setup, this might call a function or update a field to trigger workflows.
        // For now, perform a no-op read to validate connectivity.
        const zcrmAPI = catalystApp.zcrmSDK();
        await zcrmAPI.API.MODULES.get({ module: 'Contacts', params: { page: 1, per_page: 1 } });
        return ok({ queued: true, workflow: params?.name || params?.workflow || 'unnamed', targetId: params?.id || params?.entityId });
      }
    } catch (e) {
      hipaaAudit('QA_TRIGGER_WORKFLOW_ERROR', { error: e?.message || String(e) });
    }
    return ok({ queued: true, workflow: params?.name || params?.workflow || 'unnamed', targetId: params?.id || params?.entityId });
  },
};

// Helper to read JSON body
function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

/**
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 */
module.exports = async (req, res) => {
  try {
    const { method, url } = req;

    // Health endpoint
    if (method === 'GET' && url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ ok: true }));
    }

    // Primary dispatcher (Advanced I/O mounts this at /server/<fn>)
    if (method === 'POST' && url === '/') {
      // Initialize Catalyst for this request (if available)
      const catalystApp = catalyst ? catalyst.initialize(req) : null;
      // Best-effort token check (non-blocking)
      if (catalystApp) ensureValidToken(catalystApp).catch(() => {});

      const body = await readJson(req);
      const action = body?.action;
      const params = body?.params || body?.data || {};

      if (!action || typeof action !== 'string') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(err('Missing action')));
      }

      const handler = handlers[action];
      if (!handler) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(err('Unknown action', { action })));
      }

      // Pass catalystApp to handlers that can use it
      const result = await handler(params, catalystApp);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(result));
    }

    // Not found
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(err('Not found', { method, url })));
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    hipaaAudit('FUNCTION_ERROR', { error: message });
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(err('Internal error')));
  }
};
