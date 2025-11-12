import { Connection, PublicKey } from '@solana/web3.js';

export type Environment = 'mainnet' | 'devnet' | 'testnet' | 'localnet';

export type IndexerType = 'account' | 'transaction' | 'program';

export interface BaseIndexerConfig {
  env: Environment;
  type: IndexerType;
  rpcUrl?: string;
  pollInterval?: number; // ms
  batchSize?: number;
}

export interface AccountIndexerConfig extends BaseIndexerConfig {
  type: 'account';
  accounts: string[];
  includeTokenAccounts?: boolean;
}

export interface TransactionIndexerConfig extends BaseIndexerConfig {
  type: 'transaction';
  accounts?: string[];
  programs?: string[];
}

export interface ProgramIndexerConfig extends BaseIndexerConfig {
  type: 'program';
  programId: string;
  includeInnerInstructions?: boolean;
}

export type IndexerConfig = 
  | AccountIndexerConfig 
  | TransactionIndexerConfig 
  | ProgramIndexerConfig;

export interface IndexedTransaction {
  signature: string;
  slot: number;
  blockTime: number | null;
  accounts: string[];
  programId?: string;
  data?: any;
  success: boolean;
  fee: number;
  timestamp: Date;
}

export interface IndexedAccount {
  address: string;
  lamports: number;
  owner: string;
  executable: boolean;
  rentEpoch: number;
  data?: any;
  slot: number;
  timestamp: Date;
}

export type IndexedData = IndexedTransaction | IndexedAccount;

export interface ProcessorContext {
  connection: Connection;
  config: IndexerConfig;
}

export type DataProcessor = (
  data: IndexedData,
  context: ProcessorContext
) => Promise<IndexedData | null>;

export interface StorageAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  save(data: IndexedData | IndexedData[]): Promise<void>;
  query(filter: any): Promise<IndexedData[]>;
}

export interface RPCProvider {
  getConnection(): Connection;
  getEndpoint(): string;
}