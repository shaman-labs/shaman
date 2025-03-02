# Shaman.fun

Shaman is an agentic automation platform designed to let users create and deploy autonomous, AI-enhanced onchain agents that execute complex workflows. It leverages AI-powered oracles capable of running agent-generated TypeScript code in a secure, remote environment while ensuring full onchain execution and verification.

Shaman introduces a new paradigm for onchain automation, enabling self-executing, intelligent agents that interact with smart contracts, APIs, and other data sources without manual intervention. These agents, or Shamans, are hosted fully onchain, powered by MUD, and can operate autonomously based on predefined logic or real-time AI inference.

## How it's Made

Shaman is built with several key components:

- **Smart Contracts (MUD)**: The World Contract manages Shamans, while ZUG serves as a utility token for gas abstraction and incentives. Built on MUD's powerful ECS system for efficient data sync and execution.

- **Client**: A modern web application built with Next.js and Shadcn for a sleek UI, enhanced with AI capabilities for agent intelligence.

```bash
pnpm --filter client dev
```

- **[Workers](https://github.com/Interstation-Research/shaman-workers)**: Deno-powered secure execution environment for TypeScript code stored as Shaman metadata on IPFS. Features:

  - Secure sandbox environment for code execution
  - IPFS integration for decentralized code storage
  - Comprehensive logging and monitoring
  - Full TypeScript support

  The workers component consists of:

  - Code Execution Engine: Leverages Deno's secure runtime
  - Storage Layer: Combines IPFS, MUD Protocol, and Filebase
  - Blockchain Integration: Interacts with Arbitrum Sepolia

  For more details about the workers implementation, check out the [Shaman Workers repository](https://github.com/Interstation-Research/shaman-workers).

- **Integrations**:
  - Privy (@privy_io) for embedded wallets and delegated execution
  - MUD (@mud_dev) for onchain data synchronization
  - IPFS for decentralized code storage

## License

[MIT](https://choosealicense.com/licenses/mit/)
