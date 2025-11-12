import { PublicKey } from '@solana/web3.js';

export function parseAccountData(data: Buffer | null, encoding?: string): any {
  if (!data) return null;

  try {
    if (encoding === 'base64') {
      return data.toString('base64');
    }
    
    if (encoding === 'jsonParsed') {
      return JSON.parse(data.toString('utf-8'));
    }

    return data;
  } catch (error) {
    return data;
  }
}

export function isValidPublicKey(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export function shortenAddress(address: string, chars: number = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}