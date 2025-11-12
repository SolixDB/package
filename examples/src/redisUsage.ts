import { SolanaIndexer, RedisStorage } from 'solixdb';

// Example 1: Redis List Mode (for queues, job workers)
async function listModeExample() {
  const storage = new RedisStorage({
    connectionString: process.env.REDIS_URL || 'redis://localhost:6379',
    mode: 'list',
    key: 'solana-transactions-queue'
  });

  const config = {
    env: 'devnet' as const,
    type: 'transaction' as const,
    accounts: ['4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'], // USDC on devnet
    pollInterval: 5000
  };

  const indexer = new SolanaIndexer(config, storage);

  console.log('Starting indexer in LIST mode...');
  console.log('Data will be pushed to Redis list:', storage);
  
  await indexer.start();
  
  // Let it run for 30 seconds
  setTimeout(async () => {
    await indexer.stop();
    console.log('Indexer stopped');
  }, 30000);
}

// Example 2: Redis Publish Mode (for real-time broadcasts)
async function publishModeExample() {
  const storage = new RedisStorage({
    connectionString: process.env.REDIS_URL || 'redis://localhost:6379',
    mode: 'publish',
    key: 'solana-events-stream'
  });

  const config = {
    env: 'devnet' as const,
    type: 'account' as const,
    accounts: ['4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'],
    pollInterval: 5000
  };

  const indexer = new SolanaIndexer(config, storage);

  console.log('Starting indexer in PUBLISH mode...');
  console.log('Data will be published to Redis channel:', storage);
  console.log('Subscribers can listen with: SUBSCRIBE solana-events-stream');
  
  await indexer.start();
  
  // Let it run for 30 seconds
  setTimeout(async () => {
    await indexer.stop();
    console.log('Indexer stopped');
  }, 30000);
}

// Run the example
const mode = process.argv[2] || 'list';

if (mode === 'list') {
  listModeExample().catch(console.error);
} else if (mode === 'publish') {
  publishModeExample().catch(console.error);
} else {
  console.log('Usage: npm run redis-example [list|publish]');
}
