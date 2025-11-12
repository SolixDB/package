import { BaseStorageAdapter } from '../../core/StorageAdapter';
import { IndexedData, IndexedTransaction, IndexedAccount } from '../../core/types';

export class PostgresStorage extends BaseStorageAdapter {
  private client: any;
  private connectionString: string;

  constructor(connectionString: string) {
    super();
    this.connectionString = connectionString;
  }

  async connect(): Promise<void> {
    try {
      const { Client } = require('pg');
      this.client = new Client({ connectionString: this.connectionString });
      await this.client.connect();
      await this.createTables();
    } catch (error) {
      throw new Error(
        `PostgreSQL connection failed. Make sure 'pg' is installed: npm install pg`
      );
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.end();
    }
  }

  private async createTables(): Promise<void> {
    await this.client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        signature TEXT PRIMARY KEY,
        slot BIGINT NOT NULL,
        block_time BIGINT,
        accounts TEXT[],
        program_id TEXT,
        data JSONB,
        success BOOLEAN,
        fee BIGINT,
        timestamp TIMESTAMP NOT NULL
      );
    `);

    await this.client.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        address TEXT PRIMARY KEY,
        lamports BIGINT NOT NULL,
        owner TEXT NOT NULL,
        executable BOOLEAN,
        rent_epoch BIGINT,
        data JSONB,
        slot BIGINT NOT NULL,
        timestamp TIMESTAMP NOT NULL
      );
    `);

    await this.client.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_slot ON transactions(slot);
      CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);
      CREATE INDEX IF NOT EXISTS idx_accounts_owner ON accounts(owner);
      CREATE INDEX IF NOT EXISTS idx_accounts_slot ON accounts(slot);
    `);
  }

  async save(data: IndexedData | IndexedData[]): Promise<void> {
    const items = this.normalizeData(data);
    
    for (const item of items) {
      if ('signature' in item) {
        await this.saveTransaction(item as IndexedTransaction);
      } else {
        await this.saveAccount(item as IndexedAccount);
      }
    }
  }

  private async saveTransaction(tx: IndexedTransaction): Promise<void> {
    await this.client.query(
      `INSERT INTO transactions 
       (signature, slot, block_time, accounts, program_id, data, success, fee, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (signature) DO UPDATE SET
         slot = EXCLUDED.slot,
         block_time = EXCLUDED.block_time,
         accounts = EXCLUDED.accounts,
         program_id = EXCLUDED.program_id,
         data = EXCLUDED.data,
         success = EXCLUDED.success,
         fee = EXCLUDED.fee,
         timestamp = EXCLUDED.timestamp`,
      [
        tx.signature,
        tx.slot,
        tx.blockTime,
        tx.accounts,
        tx.programId,
        JSON.stringify(tx.data),
        tx.success,
        tx.fee,
        tx.timestamp,
      ]
    );
  }

  private async saveAccount(account: IndexedAccount): Promise<void> {
    await this.client.query(
      `INSERT INTO accounts 
       (address, lamports, owner, executable, rent_epoch, data, slot, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (address) DO UPDATE SET
         lamports = EXCLUDED.lamports,
         owner = EXCLUDED.owner,
         executable = EXCLUDED.executable,
         rent_epoch = EXCLUDED.rent_epoch,
         data = EXCLUDED.data,
         slot = EXCLUDED.slot,
         timestamp = EXCLUDED.timestamp`,
      [
        account.address,
        account.lamports,
        account.owner,
        account.executable,
        account.rentEpoch,
        JSON.stringify(account.data),
        account.slot,
        account.timestamp,
      ]
    );
  }

  async query(filter: any): Promise<IndexedData[]> {
    const { table, ...where } = filter;
    const tableName = table || 'transactions';
    
    if (Object.keys(where).length === 0) {
      const result = await this.client.query(`SELECT * FROM ${tableName}`);
      return result.rows;
    }

    const conditions = Object.keys(where).map((key, idx) => `${key} = $${idx + 1}`);
    const values = Object.values(where);
    
    const result = await this.client.query(
      `SELECT * FROM ${tableName} WHERE ${conditions.join(' AND ')}`,
      values
    );
    
    return result.rows;
  }
}