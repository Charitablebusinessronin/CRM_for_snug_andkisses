import { CatalystDatastoreRepository, CatalystRow } from '../datastore.repository';

const TABLE_NAME = 'CRM_Contacts' as const;

export interface CRMContactRow extends CatalystRow {
  ROWID?: string | number;
  status?: string;
  created_date?: string;
  updated_date?: string;
}

export class CRMContactsRepo {
  static async getAll(): Promise<CRMContactRow[]> {
    const table = CatalystDatastoreRepository.table(TABLE_NAME);
    return table.getAllRows();
  }

  static async insert(payload: CRMContactRow): Promise<CRMContactRow> {
    const table = CatalystDatastoreRepository.table(TABLE_NAME);
    return table.insertRow(payload);
  }

  static async update(payload: CRMContactRow): Promise<CRMContactRow> {
    const table = CatalystDatastoreRepository.table(TABLE_NAME);
    return table.updateRow(payload);
  }

  static async getById(id: string | number): Promise<CRMContactRow | null> {
    const table = CatalystDatastoreRepository.table(TABLE_NAME);
    return table.getRow(id);
  }
}
