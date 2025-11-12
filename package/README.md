# solixdb

A powerful and flexible indexer for Solana blockchain data. Configure what you want to index, add custom processing logic, and store data in your preferred database.

## Features

- **Simple Configuration** - Get started with minimal setup
- **Flexible Storage** - Support for JSON files, MongoDB, PostgreSQL, or custom adapters
- **Custom Processing** - Transform and filter data before storage
- **Multiple Index Types** - Index accounts, transactions, or program activity
- **TypeScript Support** - Full type safety and IntelliSense

## Installation

```bash
npm install solixdb
```

### Optional Dependencies

Install based on your storage needs:

```bash
# For MongoDB storage
npm install mongodb

# For PostgreSQL storage
npm install pg
```

## Quick Start

```typescript
import { SolanaIndexer, JSONStorage } from 'solixdb';

// Initialize storage
const storage = new JSONStorage('./blockchain-data.json');

// Configure indexer
const indexer = new SolanaIndexer(
  {
    env: 'mainnet',
    type: 'transaction',
    accounts: ['TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'],
    pollInterval: 5000,
  },
  storage
);

// Start indexing
await indexer.start();

// Query indexed data
const transactions = await indexer.query({});
console.log(`Indexed ${transactions.length} transactions`);

// Stop indexer
await indexer.stop();
```

## Configuration

### Indexer Types

#### Account Indexer

Monitor specific accounts for state changes:

```typescript
{
  env: 'mainnet',
  type: 'account',
  accounts: [
    'So11111111111111111111111111111111111111112',
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
  ],
  pollInterval: 10000
}
```

#### Transaction Indexer

Index transactions for specific accounts:

```typescript
{
  env: 'devnet',
  type: 'transaction',
  accounts: ['YourAccountPublicKey'],
  pollInterval: 5000,
  batchSize: 50
}
```

#### Program Indexer

Index all transactions for a specific program:

```typescript
{
  env: 'mainnet',
  type: 'program',
  programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  pollInterval: 15000
}
```

### Storage Adapters

#### JSON Storage

File-based storage for simple use cases:

```typescript
import { JSONStorage } from 'solixdb';

const storage = new JSONStorage('./data/solana-data.json');
```

#### MongoDB Storage

```typescript
import { MongoStorage } from 'solixdb';

const storage = new MongoStorage(
  'mongodb://localhost:27017',
  'myDatabase',
  'myCollection'
);
```

#### PostgreSQL Storage

```typescript
import { PostgresStorage } from 'solixdb';

const storage = new PostgresStorage(
  'postgresql://user:password@localhost:5432/mydb'
);
```

## Custom Processing

Transform or filter data before storage using processors:

```typescript
import { DataProcessor } from 'solixdb';

// Filter transactions by fee amount
const highValueFilter: DataProcessor = async (data, context) => {
  if ('signature' in data && data.fee > 10000) {
    return data;
  }
  return null; // Skip low-value transactions
};

// Enrich data with metadata
const enricher: DataProcessor = async (data, context) => {
  return {
    ...data,
    data: {
      ...data.data,
      processedAt: new Date(),
      network: context.config.env
    }
  };
};

// Add processors to indexer
indexer.addProcessor(highValueFilter);
indexer.addProcessor(enricher);
```

## Querying Data

```typescript
// Retrieve all indexed data
const all = await indexer.query({});

// Filter by properties
const successful = await indexer.query({ success: true });

// MongoDB-style queries (when using MongoStorage)
const recent = await indexer.query({
  timestamp: { $gte: new Date('2024-01-01') }
});
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `env` | `'mainnet' \| 'devnet' \| 'testnet' \| 'localnet'` | Required | Solana network environment |
| `type` | `'account' \| 'transaction' \| 'program'` | Required | Type of data to index |
| `rpcUrl` | `string` | Auto-detected | Custom RPC endpoint URL |
| `pollInterval` | `number` | `5000` | Polling interval in milliseconds |
| `batchSize` | `number` | `100` | Maximum items per batch |
| `accounts` | `string[]` | - | Account addresses to monitor |
| `programId` | `string` | - | Program ID for program indexer |

<!-- ## Examples

See the `examples/` directory for complete examples:

- `basic-usage.ts` - Simple transaction indexer
- `custom-processor.ts` - Using custom data processors
- `account-indexer.ts` - Monitoring account changes
- `mongo-storage.ts` - MongoDB integration -->

## Development

```bash
# Install dependencies
pnpm install

# Build the project
pnpm build

# Development mode with watch
pnpm dev

# Run tests
pnpm test
```

## Roadmap

- WebSocket support for real-time indexing
- Built-in analytics and metrics
- Additional storage adapters (SQLite, Redis)
- Advanced query builder
- Index migration tools
- Performance optimizations

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)

<!-- ## Support

- [Documentation](https://github.com/yourusername/solixdb#readme)
- [Issue Tracker](https://github.com/yourusername/solixdb/issues)
- [Discussions](https://github.com/yourusername/solixdb/discussions) -->