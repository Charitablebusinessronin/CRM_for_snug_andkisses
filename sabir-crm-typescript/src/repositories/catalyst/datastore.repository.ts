import catalyst from 'zcatalyst-sdk-node';
import { logger } from '../../utils/logger';

export type CatalystTableName = 'CRM_Contacts' | 'CRM_Leads';

export interface CatalystRow {
  ROWID?: string | number;
  [key: string]: any;
}

export interface CatalystQuery {
  where?: Array<{ column_name: string; comparator: 'is' | 'contains' | '>' | '<' | '>=' | '<='; value: any }>;
}

function getApp() {
  try {
    const app = catalyst.initialize({});
    return app;
  } catch (err) {
    logger.warn('Catalyst initialization failed in datastore.repository', err);
    throw err;
  }
}

export class CatalystDatastoreRepository {
  static table(name: CatalystTableName) {
    const app = getApp();
    const ds = app.datastore();
    const table = ds.table(name);

    return {
      async getAllRows(query?: CatalystQuery): Promise<CatalystRow[]> {
        const t: any = table as any;
        if (query?.where && query.where.length) {
          return await t.getAllRows({ where: query.where });
        }
        return await t.getAllRows();
      },

      async getRow(rowId: string | number): Promise<CatalystRow | null> {
        try {
          const t: any = table as any;
          if (typeof t.getRow === 'function') {
            return await t.getRow(rowId);
          }
          const rows = await t.getAllRows({ where: [{ column_name: 'ROWID', comparator: 'is', value: String(rowId) }] });
          return rows && rows.length ? rows[0] : null;
        } catch (err) {
          logger.warn('Catalyst getRow failed', { name, rowId, err });
          return null;
        }
      },

      async insertRow(payload: CatalystRow): Promise<CatalystRow> {
        const t: any = table as any;
        return await t.insertRow(payload as any);
      },

      async updateRow(payload: CatalystRow): Promise<CatalystRow> {
        if (!payload.ROWID && payload.ROWID !== 0) {
          throw new Error('updateRow requires ROWID');
        }
        const t: any = table as any;
        return await t.updateRow(payload as any);
      }
    };
  }
}
