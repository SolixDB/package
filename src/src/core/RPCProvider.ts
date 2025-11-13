import { Connection } from '@solana/web3.js';
import { Environment, RPCProvider } from './types';
import { logger } from '../utils/logger';

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export abstract class BaseRPCProvider implements RPCProvider {
  protected connection: Connection;
  protected endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
    this.connection = new Connection(endpoint, 'confirmed');
  }

  getConnection(): Connection {
    return this.connection;
  }

  getEndpoint(): string {
    return this.endpoint;
  }

  async ensureConnected(): Promise<void> {
    let attempt = 0;
    const maxDelay = 30000;

    while (true) {
      try {
        await this.connection.getVersion();
        return;
      } catch (err) {
        attempt += 1;
        // its an exponential backoff with max delay
        const delay = Math.min(1000 * Math.pow(2, attempt), maxDelay);
        logger.warn(`RPC connection to ${this.endpoint} failed (attempt ${attempt}), reconnecting in ${delay}ms`);

        try {
          // try to recreate the connection
          this.connection = new Connection(this.endpoint, 'confirmed');
        } catch (e) {
          logger.error('Error recreating Connection object:', e);
        }

        await sleep(delay);
      }
    }
  }
}

export function createRPCProvider(env: Environment, customUrl?: string): RPCProvider {
  if (customUrl) {
    return new DefaultRPCProvider(customUrl);
  }

  const endpoints: Record<Environment, string> = {
    mainnet: 'https://api.mainnet-beta.solana.com',
    devnet: 'https://api.devnet.solana.com',
    testnet: 'https://api.testnet.solana.com',
    localnet: 'http://localhost:8899',
  };

  return new DefaultRPCProvider(endpoints[env]);
}

class DefaultRPCProvider extends BaseRPCProvider {
  constructor(endpoint: string) {
    super(endpoint);
  }
}