import { Connection } from '@solana/web3.js';
import { Environment, RPCProvider } from './types';

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