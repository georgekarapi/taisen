# Taisen

Taisen is a decentralized tournament platform built on Sui.

## Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v20+)
- [pnpm](https://pnpm.io/)
- [Sui CLI](https://docs.sui.io/guides/developer/getting-started/sui-install)

## Quick Start

### 1. Installation

Install dependencies:

```bash
pnpm install
```

### 2. Smart Contracts

Build the Move contracts:

```bash
pnpm build:sui
```

Deploy to the network (requires `~/.sui/sui_config/client.yaml` to be configured):

```bash
pnpm deploy:contracts
```

This will deploy the package and update your `.env` file with the new package ID.

### 3. Development

Start the development server:

```bash
pnpm dev
```

Visit `http://localhost:3000` to see the app.

### 4. Seeding Data

Populate the platform with test tournaments:

```bash
pnpm seed:tournaments
```