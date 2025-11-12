import { PublicKey } from '@solana/web3.js';
import { logger } from '../utils/logger';
import { createRPCProvider } from './RPCProvider';
import {
  DataProcessor,
  IndexedAccount,
  IndexedTransaction,
  IndexerConfig,
  ProcessorContext,
  RPCProvider,
  StorageAdapter,
} from './types';

export class SolanaIndexer {
  private config: IndexerConfig;
  private storage: StorageAdapter;
  private rpcProvider: RPCProvider;
  private processors: DataProcessor[] = [];
  private isRunning: boolean = false;
  private pollInterval: NodeJS.Timeout | null = null;
  private lastSignature: string | undefined;
  private lastSlot: number = 0;

  constructor(config: IndexerConfig, storage: StorageAdapter) {
    this.config = {
      pollInterval: 5000,
      batchSize: 100,
      ...config,
    };
    this.storage = storage;
    this.rpcProvider = createRPCProvider(config.env, config.rpcUrl);
  }

  addProcessor(processor: DataProcessor): void {
    this.processors.push(processor);
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Indexer is already running');
      return;
    }

    logger.info('Starting SolixDB indexer...', {
      env: this.config.env,
      type: this.config.type,
      endpoint: this.rpcProvider.getEndpoint(),
    });

    await this.storage.connect();
    this.isRunning = true;

    await this.indexOnce();

    this.pollInterval = setInterval(async () => {
      await this.indexOnce();
    }, this.config.pollInterval);

    logger.info('Indexer started successfully');
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    logger.info('Stopping indexer...');
    this.isRunning = false;

    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    await this.storage.disconnect();
    logger.info('Indexer stopped');
  }

  private async indexOnce(): Promise<void> {
    try {
      switch (this.config.type) {
        case 'account':
          await this.indexAccounts();
          break;
        case 'transaction':
          await this.indexTransactions();
          break;
        case 'program':
          await this.indexProgram();
          break;
      }
    } catch (error) {
      logger.error('Indexing error:', error);
    }
  }

  private async indexAccounts(): Promise<void> {
    const config = this.config as any;
    const connection = this.rpcProvider.getConnection();

    for (const address of config.accounts || []) {
      try {
        const pubkey = new PublicKey(address);
        const accountInfo = await connection.getAccountInfo(pubkey);
        
        if (!accountInfo) continue;

        const slot = await connection.getSlot();
        const indexed: IndexedAccount = {
          address,
          lamports: accountInfo.lamports,
          owner: accountInfo.owner.toBase58(),
          executable: accountInfo.executable,
          rentEpoch: accountInfo.rentEpoch || 0,
          data: accountInfo.data,
          slot,
          timestamp: new Date(),
        };

        const processed = await this.processData(indexed);
        if (processed) {
          await this.storage.save(processed);
          logger.debug('Indexed account:', address);
        }
      } catch (error) {
        logger.error(`Error indexing account ${address}:`, error);
      }
    }
  }

  private async indexTransactions(): Promise<void> {
    const config = this.config as any;
    const connection = this.rpcProvider.getConnection();
    
    const accounts = config.accounts || [];
    
    if (accounts.length === 0) {
      logger.warn('No accounts configured for transaction indexing');
      return;
    }

    for (const address of accounts) {
      try {
        const pubkey = new PublicKey(address);
        const signatures = await connection.getSignaturesForAddress(pubkey, {
          limit: this.config.batchSize,
          before: this.lastSignature,
        });

        if (signatures.length === 0) continue;

        for (const sig of signatures.reverse()) {
          const tx = await connection.getParsedTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0,
          });

          if (!tx) continue;

          const indexed: IndexedTransaction = {
            signature: sig.signature,
            slot: sig.slot,
            blockTime: sig.blockTime || null,
            accounts: tx.transaction.message.accountKeys.map((k: any) => 
              typeof k === 'object' ? k.pubkey.toBase58() : k.toBase58()
            ),
            success: tx.meta?.err === null,
            fee: tx.meta?.fee || 0,
            timestamp: new Date((sig.blockTime || 0) * 1000),
          };

          const processed = await this.processData(indexed);
          if (processed) {
            await this.storage.save(processed);
            logger.debug('Indexed transaction:', sig.signature.slice(0, 8));
          }
        }

        this.lastSignature = signatures[0].signature;
      } catch (error) {
        logger.error(`Error indexing transactions for ${address}:`, error);
      }
    }
  }

  private async indexProgram(): Promise<void> {
    const config = this.config as any;
    const connection = this.rpcProvider.getConnection();
    const programId = new PublicKey(config.programId);

    try {
      const signatures = await connection.getSignaturesForAddress(programId, {
        limit: this.config.batchSize,
        before: this.lastSignature,
      });

      if (signatures.length === 0) return;

      for (const sig of signatures.reverse()) {
        const tx = await connection.getParsedTransaction(sig.signature, {
          maxSupportedTransactionVersion: 0,
        });

        if (!tx) continue;

        const indexed: IndexedTransaction = {
          signature: sig.signature,
          slot: sig.slot,
          blockTime: sig.blockTime || null,
          accounts: tx.transaction.message.accountKeys.map((k: any) =>
            typeof k === 'object' ? k.pubkey.toBase58() : k.toBase58()
          ),
          programId: config.programId,
          success: tx.meta?.err === null,
          fee: tx.meta?.fee || 0,
          timestamp: new Date((sig.blockTime || 0) * 1000),
        };

        const processed = await this.processData(indexed);
        if (processed) {
          await this.storage.save(processed);
          logger.debug('Indexed program tx:', sig.signature.slice(0, 8));
        }
      }

      this.lastSignature = signatures[0].signature;
    } catch (error) {
      logger.error('Error indexing program:', error);
    }
  }

  private async processData(
    data: IndexedTransaction | IndexedAccount
  ): Promise<IndexedTransaction | IndexedAccount | null> {
    let result: any = data;

    for (const processor of this.processors) {
      const context: ProcessorContext = {
        connection: this.rpcProvider.getConnection(),
        config: this.config,
      };

      result = await processor(result, context);
      if (!result) return null;
    }

    return result;
  }

  async query(filter: any): Promise<any[]> {
    return await this.storage.query(filter);
  }
}