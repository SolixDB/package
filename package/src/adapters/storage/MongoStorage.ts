import { BaseStorageAdapter } from '../../core/StorageAdapter';
import { IndexedData } from '../../core/types';

export class MongoStorage extends BaseStorageAdapter {
  private client: any;
  private db: any;
  private collection: any;
  private connectionString: string;
  private dbName: string;
  private collectionName: string;

  constructor(
    connectionString: string,
    dbName: string = 'solixdb',
    collectionName: string = 'indexed_data'
  ) {
    super();
    this.connectionString = connectionString;
    this.dbName = dbName;
    this.collectionName = collectionName;
  }

  async connect(): Promise<void> {
    try {
      const { MongoClient } = require('mongodb');
      this.client = new MongoClient(this.connectionString);
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      this.collection = this.db.collection(this.collectionName);
      
      // Create indexes
      await this.collection.createIndex({ signature: 1 });
      await this.collection.createIndex({ address: 1 });
      await this.collection.createIndex({ slot: 1 });
      await this.collection.createIndex({ timestamp: -1 });
    } catch (error) {
      throw new Error(
        `MongoDB connection failed. Make sure 'mongodb' is installed: npm install mongodb`
      );
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
    }
  }

  async save(data: IndexedData | IndexedData[]): Promise<void> {
    const items = this.normalizeData(data);
    if (items.length === 1) {
      await this.collection.insertOne(items[0]);
    } else {
      await this.collection.insertMany(items);
    }
  }

  async query(filter: any): Promise<IndexedData[]> {
    return await this.collection.find(filter).toArray();
  }
}