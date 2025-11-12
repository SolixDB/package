import { MongoStorage, SolanaIndexer } from 'solixdb';

async function main() {
  // MongoDB storage adapter
  const storage = new MongoStorage(
    'mongodb://localhost:27017',
    'solana_data',
    'transactions'
  );

  const indexer = new SolanaIndexer(
    {
      env: 'mainnet',
      type: 'program',
      programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
      pollInterval: 15000,
      batchSize: 100,
    },
    storage
  );

  await indexer.start();
  console.log('Indexing to MongoDB...');

  // Query example
  setTimeout(async () => {
    const recentTxs = await indexer.query({ 
      success: true 
    });
    console.log(`Found ${recentTxs.length} successful transactions`);
  }, 60000);
}

process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  process.exit(0);
});

main();