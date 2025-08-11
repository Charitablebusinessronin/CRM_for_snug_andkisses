const fs = require('fs').promises;
const path = require('path');

class HIPAAAuditLoggerClass {
  constructor() {
    this.logDirectory = path.join('/app', 'logs', 'hipaa');
    this.ensureLogDirectory();
  }

  async ensureLogDirectory() {
    try {
      await fs.mkdir(this.logDirectory, { recursive: true });
    } catch (error) {
      console.error('Failed to create HIPAA log directory:', error);
    }
  }

  async logAccess(data) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: 'ACCESS',
      userId: data.userId || 'anonymous',
      action: data.action,
      resource: data.resource,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      success: data.success,
      details: data.details || {},
    };

    await this.writeLog(logEntry);
  }

  async logDataAccess(data) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: 'DATA_ACCESS',
      userId: data.userId || 'anonymous',
      action: data.action, // CREATE, READ, UPDATE, DELETE
      dataType: data.dataType, // patient, invoice, appointment, etc.
      recordId: data.recordId,
      phi_accessed: data.phiAccessed || false,
      success: data.success,
      details: data.details || {},
    };

    await this.writeLog(logEntry);
  }

  async writeLog(logEntry) {
    try {
      const fileName = `hipaa-audit-${new Date().toISOString().split('T')[0]}.log`;
      const logFile = path.join(this.logDirectory, fileName);
      const logLine = JSON.stringify(logEntry) + '\n';
      await fs.appendFile(logFile, logLine);

      if ((process.env.NODE_ENV || 'development') === 'development') {
        console.log('AUDIT LOG (DEV MODE):', logEntry);
      }
    } catch (error) {
      console.error('Failed to write HIPAA audit log:', error);
    }
  }
}

module.exports = { HIPAAAuditLogger: new HIPAAAuditLoggerClass() };
