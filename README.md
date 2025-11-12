[![npm][npm-image]][npm-url]
[![npm-downloads][npm-downloads-image]][npm-url]

[npm-downloads-image]: https://img.shields.io/npm/dm/solixdb.svg?style=flat
[npm-image]: https://img.shields.io/npm/v/solixdb.svg?style=flat
[npm-url]: https://www.npmjs.com/package/solixdb
[semantic-release-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg

> [!NOTE]
> This package is in active development. The goal is to evolve it from a simple data pipeline (RPC -> DB) into a powerful "data factory" that allows for custom, async processing of on-chain data. Contributions are welcome!

# solixdb

Because you've got better things to do than write *another* RPC poller.

`solixdb` is a lightweight, configurable, and high-performance indexing package for Solana. Use it to listen for on-chain events and stream them directly into your database of choice.

## Installation

### For use in your Node.js application

```
npm install --save solixdb
```

## Documentation and Examples

Documentation is still being built as the API is finalized.

For now, the best place to see usage is the `/examples` directory in this repository. It will cover:
* `simple-dump.js`: How to dump all program logs to a JSON file.
* `custom-processor.js`: How to enrich data (e.g., fetch cNFT metadata) before saving.
* `multi-storage.js`: How to configure Postgres, Mongo, and Redis sinks.

## Getting Help

Have a bug, question, or feature request?

Please **[file an issue](https://github.com/SolixDB/solixdb/issues/new)**. The more detail, the better:
* A clear description of your goal or problem.
* A minimal code snippet to reproduce the issue.
* The text of any errors or stack traces.

## Roadmap & Status

`solixdb` is currently in Phase 1. We are actively seeking contributors to help build out the processing and storage layers.

* **Phase 1: Robust Foundation (In Progress)**
    * [ ] Add `postgres` adapter.
    * [ ] Robust WebSocket error handling and auto-reconnect logic.

* **Phase 2: Custom Processing Layer (Help Wanted!)**
    * [ ] Implement the `processor.handler` hook for custom `async` data transformation. This is the **top priority**.

* **Phase 3: Multi-Sink Support**
    * [ ] Add `mongodb` adapter.
    * [ ] Add `redis` adapter.

* **Phase 4: Polish & Growth**
    * [ ] Abstract RPC providers (Helius, Triton, etc.).
    * [ ] Finalize the public API and publish 1.0.

## Development Environment Setup

Ready to contribute? Get your local environment running in 2 minutes.

1.  **Fork & Clone:**
    ```bash
    git clone [https://github.com/SolixDB/package.git](https://github.com/SolixDB/package.git)
    cd solixdb
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Run the Build:**
    ```bash
    # Run a build once
    npm run build

    # Or, build in watch-mode for active development
    npm run build:watch
    ```

4.  **Run Tests:**
    ```shell
    # Run the full test suite
    npm test

    # Or, run in watch-mode
    npm test:watch
    ```

## Contributing

We love PRs. If you'd like to contribute, please:

1.  Find an [open issue](https://github.com/SolixDB/solixdb/issues) or create a new one to discuss the feature or bug you want to tackle.
2.  Fork the repo and create a new branch (e.g., `feature/add-mongo-adapter`).
3.  Write your code. Please add tests to cover your changes!
4.  Ensure all tests and linting checks pass: `npm test` and `npm run lint`.
5.  Open a Pull Request against the `main` branch.

## License

[MIT](LICENSE)