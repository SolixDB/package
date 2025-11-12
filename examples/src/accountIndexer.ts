import { JSONStorage, SolanaIndexer } from 'solixdb';

async function main() {
  const storage = new JSONStorage('./data/accounts.json');

  // Index specific accounts
  const indexer = new SolanaIndexer(
    {
      env: 'mainnet',
      type: 'account',
      accounts: [
        'So11111111111111111111111111111111111111112', // Wrapped SOL
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
        'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
      ],
      pollInterval: 20000, // Check every 20 seconds,
    },
    storage
  );

  await indexer.start();
  console.log('Monitoring account changes...');

  // Print account status every minute
  setInterval(async () => {
    const accounts = await indexer.query({});
    console.log('\n=== Account Status ===');
    accounts.forEach((acc: any) => {
      console.log(`${acc.address.slice(0, 8)}... ${acc.lamports / 1e9} SOL`);
    });
  }, 60000);
}

process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  process.exit(0);
});

main();