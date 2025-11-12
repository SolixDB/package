import * as fs from 'fs/promises';
import * as path from 'path';
import { BaseStorageAdapter } from '../../core/StorageAdapter';
import { IndexedData } from '../../core/types';

export class JSONStorage extends BaseStorageAdapter {
  private filePath: string;
  private data: IndexedData[] = [];

  constructor(filePath: string = './solixdb-data.json') {
    super();
    this.filePath = path.resolve(filePath);
  }

  async connect(): Promise<void> {
    try {
      const content = await fs.readFile(this.filePath, 'utf-8');
      this.data = JSON.parse(content);
    } catch (error) {
      this.data = [];
    }
  }

  async disconnect(): Promise<void> {
    await this.flush();
  }

  async save(data: IndexedData | IndexedData[]): Promise<void> {
    const items = this.normalizeData(data);
    this.data.push(...items);
    await this.flush();
  }

  async query(filter: any): Promise<IndexedData[]> {
    if (!filter || Object.keys(filter).length === 0) {
      return this.data;
    }

    return this.data.filter(item => {
      return Object.entries(filter).every(([key, value]) => {
        return (item as any)[key] === value;
      });
    });
  }

  private async flush(): Promise<void> {
    await fs.writeFile(
      this.filePath,
      JSON.stringify(this.data, null, 2),
      'utf-8'
    );
  }
}