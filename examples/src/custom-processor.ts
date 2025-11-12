import {
  DataProcessor,
  IndexedData,
  IndexedTransaction,
  JSONStorage,
  ProcessorContext,
  SolanaIndexer
} from 'solana-indexers';

// Custom processor: Filter only successful transactions with high fees
const highFeeProcessor: DataProcessor = async (
  data: IndexedData,
  context: ProcessorContext
) => {
  // Only process transactions
  if (!('signature' in data)) {
    return data;
  }

  const tx = data as IndexedTransaction;

  // Filter: Only successful transactions with fee > 5000 lamports
  if (!tx.success || tx.fee < 5000) {
    return null; // Skip this transaction
  }

  // Add custom metadata
  return {
    ...tx,
    data: {
      feeInSol: tx.fee / 1e9,
      category: 'high-fee',
    },
  };
};

// Custom processor: Add enriched data
const enrichmentProcessor: DataProcessor = async (
  data: IndexedData,
  context: ProcessorContext
) => {
  if (!('signature' in data)) return data;

  const tx = data as IndexedTransaction;

  return {
    ...tx,
    data: {
      ...tx.data,
      accountCount: tx.accounts.length,
      processedAt: new Date().toISOString(),
    },
  };
};

async function main() {
  const storage = new JSONStorage('./data/filtered-transactions.json');

  const indexer = new SolanaIndexer(
    {
      env: 'devnet',
      type: 'transaction',
      accounts: ['TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'],
      pollInterval: 5000,
    },
    storage
  );

  // Add custom processors
  indexer.addProcessor(highFeeProcessor);
  indexer.addProcessor(enrichmentProcessor);

  await indexer.start();
  console.log('Indexing with custom processors...');
}

process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  process.exit(0);
});

main();