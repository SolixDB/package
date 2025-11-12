import { IndexedData, StorageAdapter } from './types';

export abstract class BaseStorageAdapter implements StorageAdapter {
  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract save(data: IndexedData | IndexedData[]): Promise<void>;
  abstract query(filter: any): Promise<IndexedData[]>;

  protected normalizeData(data: IndexedData | IndexedData[]): IndexedData[] {
    return Array.isArray(data) ? data : [data];
  }
}