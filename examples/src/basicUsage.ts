import { JSONStorage, LogLevel, SolanaIndexer, logger } from 'solana-indexers';
import "dotenv/config"

logger.setLevel(LogLevel.INFO);

const storage = new JSONStorage('./data/transactions.json');

const indexer = new SolanaIndexer(
  {
    env: 'devnet',
    type: 'transaction',
    accounts: [
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', // SPL Token program
    ],
    batchSize: 50,
    rpcUrl: process.env.RPC_URL || "https://api.mainnet-beta.solana.com"
  },
  storage
);

// Start indexing
async function main() {
  try {
    await indexer.start();
    
    console.log('SolixDB is running! Press Ctrl+C to stop.');
    
    setTimeout(async () => {
      const data = await indexer.query({});
      console.log(`Indexed ${data.length} transactions`);
    }, 30000);
  } catch (error) {
    console.error('Error:', error);
    await indexer.stop();
  }
}

process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  await indexer.stop();
  process.exit(0);
});

main();