import { BaseStorageAdapter } from '../../core/StorageAdapter';
import { IndexedData, RedisMode, RedisStorageOptions } from '../../core/types';
import Redis from 'ioredis';

/**
 * RedisStorage - lightweight adapter for streaming/caching via Redis.
 *
 * Modes:
 * - 'list'    : LPUSH JSON items to a Redis list (key is list name)
 * - 'publish' : PUBLISH JSON items to a Redis channel (key is channel name)
 */
export class RedisStorage extends BaseStorageAdapter {
  private client: Redis | null = null;
  private connectionString: string;
  private mode: RedisMode;
  private key: string;

  constructor(options: RedisStorageOptions) {
    super();
    this.connectionString = options.connectionString;
    this.mode = options.mode ?? 'list';
    this.key = options.key ?? 'solixdb-events';
  }

  async connect(): Promise<void> {
    try {
      this.client = new Redis(this.connectionString);
      // Test connection
      await this.client.ping();
    } catch (error) {
      throw new Error(
        "Redis connection failed. Make sure 'ioredis' is installed: npm install ioredis"
      );
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.quit();
      } catch (e) {
        // some redis clients may not implement quit in certain modes; just ignore
      }
    }
  }

  async save(data: IndexedData | IndexedData[]): Promise<void> {
    const items = this.normalizeData(data);
    if (!this.client) {
      throw new Error('Redis client not connected. Call connect() first.');
    }

    if (this.mode === 'list') {
      // Use pipeline for throughput
      const pipeline = this.client.pipeline();
      for (const item of items) {
        pipeline.lpush(this.key, JSON.stringify(item));
      }
      await pipeline.exec();
    } else if (this.mode === 'publish') {
      for (const item of items) {
        await this.client.publish(this.key, JSON.stringify(item));
      }
    }
  }

  async query(filter: any): Promise<IndexedData[]> {
    if (!this.client) {
      throw new Error('Redis client not connected. Call connect() first.');
    }

    if (this.mode === 'list') {
      // Return all items in the list
      const raw: string[] = await this.client.lrange(this.key, 0, -1);
      const parsed = raw.map(r => {
        try {
          return JSON.parse(r);
        } catch (e) {
          return null;
        }
      }).filter(Boolean) as IndexedData[];

      if (!filter || Object.keys(filter).length === 0) {
        return parsed;
      }

      return parsed.filter(item => {
        return Object.entries(filter).every(([key, value]) => {
          return (item as any)[key] === value;
        });
      });
    }

    // publish mode: no stored data to query
    return [];
  }
}
