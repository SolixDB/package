<div align="center">
    <img src="https://raw.githubusercontent.com/solixdb/solixdb/main/logo.png" width="50%" height="50%">
</div>

# SolixDB

<div align="center">

[![npm][npm-image]][npm-url]
[![npm-downloads][npm-downloads-image]][npm-url]
[![github][github-image]][github-url]

</div>

[npm-image]: https://img.shields.io/npm/v/solixdb.svg?style=flat
[npm-downloads-image]: https://img.shields.io/npm/dm/solixdb.svg?style=flat
[npm-url]: https://www.npmjs.com/package/solixdb
[github-image]: https://img.shields.io/badge/github-SolixDB/solixdb-8da0cb?style=flat&labelColor=555555&logo=github
[github-url]: https://github.com/SolixDB/solixdb

## Overview

`solixdb` is a lightweight, configurable, and high-performance indexing package for Solana. Use it to listen for on-chain events and stream them directly into your database of choice.

## Installation

### For use in your Node.js application

```bash
npm install --save solixdb
```

## Minimal Example

```ts
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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT License](LICENSE)