const catalyst = require('zcatalyst-sdk-node');

class CatalystManager {
  constructor() {
    this.app = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      const config = {
        projectId: process.env.CATALYST_PROJECT_ID,
        projectKey: process.env.CATALYST_PROJECT_KEY,
        projectDomain: process.env.CATALYST_PROJECT_DOMAIN,
        environment: process.env.CATALYST_ENVIRONMENT || 'development',
        platform: 'server',
        authType: 'token',
      };

      this.app = catalyst.initialize(config);
      this.initialized = true;
      console.log('✅ Catalyst SDK initialized successfully');
      return this.app;
    } catch (error) {
      console.error('❌ Catalyst initialization failed:', error);
      this.initialized = false;
      throw error;
    }
  }

  getApp() {
    if (!this.initialized || !this.app) {
      throw new Error('Catalyst SDK not initialized');
    }
    return this.app;
  }

  async getDataStore(tableName) {
    const app = this.getApp();
    return app.datastore().table(tableName);
  }

  async getFileStore() {
    const app = this.getApp();
    return app.filestore();
  }
}

module.exports = new CatalystManager();
