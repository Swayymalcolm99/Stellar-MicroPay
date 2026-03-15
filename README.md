# 🌟 Stellar MicroPay

> Cross-border micro-payments, powered by the Stellar blockchain.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Stellar](https://img.shields.io/badge/Stellar-Testnet-blue)](https://stellar.org)

Stellar MicroPay is an open-source platform that lets anyone send small payments across borders instantly using XLM on the Stellar network. No banks. No high fees. No waiting.

---

## ✨ Features (v1)

- 🔗 **Connect Wallet** — Freighter browser wallet integration
- 💸 **Send XLM** — Send micro-payments to any Stellar address globally
- 📜 **Transaction History** — View your recent payment activity
- 🌍 **Cross-border** — Works anywhere in the world, near-zero fees

## 🗂 Project Structure

```
stellar-micropay/
├── frontend/          # Next.js + React + Tailwind CSS
├── backend/           # Node.js + Express API
├── contracts/         # Stellar Soroban smart contracts (Rust)
├── docs/              # Architecture & API documentation
├── scripts/           # Deployment & utility scripts
├── .github/           # CI/CD workflows & issue templates
├── CONTRIBUTING.md
├── ROADMAP.md
└── LICENSE
```

## 🚀 Quick Start

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18.x |
| npm / yarn | Latest |
| Rust + Cargo | ≥ 1.74 (for contracts) |
| Freighter Wallet | Browser extension |

### 1. Clone the repository

```bash
git clone https://github.com/your-org/stellar-micropay.git
cd stellar-micropay
```

### 2. Start the Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Visit `http://localhost:3000`

### 3. Start the Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

API runs at `http://localhost:4000`

### 4. Build Soroban Contracts (optional)

```bash
cd contracts/stellar-micropay-contract
cargo build --target wasm32-unknown-unknown --release
```

---

## 🔑 Environment Variables

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Backend (`backend/.env`)

```env
PORT=4000
STELLAR_NETWORK=testnet
HORIZON_URL=https://horizon-testnet.stellar.org
```

---

## 🧪 Get Testnet XLM

1. Install [Freighter Wallet](https://freighter.app)
2. Switch to **Testnet** in Freighter settings
3. Visit [Stellar Friendbot](https://friendbot.stellar.org) and paste your public key
4. You'll receive 10,000 test XLM instantly

---

## 🤝 Contributing

We love contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) to get started.

## 🗺 Roadmap

See [ROADMAP.md](ROADMAP.md) for planned features.

## 📄 License

MIT — see [LICENSE](LICENSE)
