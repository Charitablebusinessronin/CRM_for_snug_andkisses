import { CatalystDatastoreRepository, CatalystRow } from '../datastore.repository';

const TABLE_NAME = 'CRM_Leads' as const;

export interface CRMLeadRow extends CatalystRow {
  ROWID?: string | number;
  status?: string;
  processed_date?: string;
  processed_by?: string;
}

export class CRMLeadsRepo {
  static async getAll(): Promise<CRMLeadRow[]> {
    const table = CatalystDatastoreRepository.table(TABLE_NAME);
    return table.getAllRows();
  }

  static async getPending(): Promise<CRMLeadRow[]> {
    const table = CatalystDatastoreRepository.table(TABLE_NAME);
    return table.getAllRows({ where: [{ column_name: 'status', comparator: 'is', value: 'pending' }] });
  }

  static async insert(payload: CRMLeadRow): Promise<CRMLeadRow> {
    const table = CatalystDatastoreRepository.table(TABLE_NAME);
    return table.insertRow(payload);
  }

  static async update(payload: CRMLeadRow): Promise<CRMLeadRow> {
    const table = CatalystDatastoreRepository.table(TABLE_NAME);
    return table.updateRow(payload);
  }

  static async getById(id: string | number): Promise<CRMLeadRow | null> {
    const table = CatalystDatastoreRepository.table(TABLE_NAME);
    return table.getRow(id);
  }
}
