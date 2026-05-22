# Blockchain HomeTask Project

A blockchain implementation with a layered Express backend and a React frontend.

> **For Applicants:** See [INSTRUCTIONS.md](./INSTRUCTIONS.md) for task requirements (2 tasks, 4–6 hours).
> See [SETUP.md](./SETUP.md) for a quick-start guide.

---

## Project Structure

```
hometask-blockchain/
│
├── config/
│   └── index.js                  # Environment config (port, CORS, blockchain settings)
│
├── models/
│   ├── blockchain.js             # Block, Transaction, Blockchain domain classes
│   └── index.js                  # Singleton instance + demo data seeding
│
├── utils/
│   ├── logger.js                 # Levelled logger (error / warn / info / debug)
│   ├── response.js               # Unified sendSuccess / sendCreated / sendError helpers
│   └── validator.js              # isValidAddress, isValidAmount, sanitizers
│
├── middleware/
│   ├── cors.middleware.js        # CORS policy
│   ├── logger.middleware.js      # Morgan HTTP request logger
│   ├── errorHandler.middleware.js# Centralised error handler (must be last)
│   ├── notFound.middleware.js    # 404 handler
│   ├── validateRequest.middleware.js  # validateBody / validateParams factories
│   └── rateLimit.middleware.js   # apiLimiter (100 req/min) + writeLimiter (20 req/min)
│
├── routes/
│   ├── index.js                  # Aggregates all /api sub-routes
│   ├── blockchain.routes.js      # /api/chain
│   ├── transaction.routes.js     # /api/transactions
│   ├── mining.routes.js          # /api/mine
│   ├── balance.routes.js         # /api/balance
│   ├── stats.routes.js           # /api/stats
│   └── health.routes.js          # /health (no rate limit)
│
├── controllers/
│   ├── blockchain.controller.js
│   ├── transaction.controller.js
│   ├── mining.controller.js
│   ├── balance.controller.js
│   └── stats.controller.js
│
├── src/                          # React frontend
│   ├── api/
│   │   ├── client.js             # Axios instance with request/response interceptors
│   │   ├── endpoints.js          # All API URL constants
│   │   └── blockchain.api.js     # Typed fetch functions (fetchChain, addTransaction…)
│   ├── hooks/
│   │   ├── useBlockchain.js      # Polls /api/chain + /api/stats, returns state
│   │   └── usePolling.js         # Reusable interval-based polling hook
│   ├── utils/
│   │   ├── formatters.js         # truncateHash, formatTimestamp, formatAmount
│   │   └── helpers.js            # isPositiveNumber, groupTransactionsByBlock, etc.
│   ├── constants/
│   │   └── index.js              # POLL_INTERVAL_MS, DEFAULT_MINER_ADDRESS, enums
│   ├── components/
│   │   ├── BlockchainViewer.js
│   │   ├── TransactionForm.js
│   │   ├── StatsPanel.js
│   │   ├── Header.js
│   │   └── ErrorBoundary.js      # React class error boundary
│   ├── App.js
│   └── index.js
│
├── blockchain.js                 # Backward-compat re-export → models/blockchain.js
├── server.js                     # Entry point — wires middleware, routes, starts server
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js v16 or higher
- npm

### Install & Configure

```bash
npm install
```

### Run in Development

```bash
# Terminal 1 — React dev server on http://localhost:3000
npm start

# Terminal 2 — API server on http://localhost:3002, with auto-reload
npm run dev
```

The React app proxies all `/api/*` requests to the API server automatically via `src/setupProxy.js`.

### Run in Production

```bash
npm run serve   # builds the React app, then serves everything from port 3002
```

---

## API Reference

All API responses share a common envelope:

```json
{ "success": true, ...payload }
{ "success": false, "error": "message" }
```

### Chain

| Method | Path | Description |
|---|---|---|
| GET | `/api/chain` | Full chain + length |
| GET | `/api/chain/valid` | `{ isValid: bool }` |

### Transactions

| Method | Path | Description |
|---|---|---|
| POST | `/api/transactions` | Add a pending transaction |
| GET | `/api/transactions/pending` | All pending transactions |
| GET | `/api/transactions/all` | All confirmed transactions |

**POST `/api/transactions` body:**
```json
{ "fromAddress": "address1", "toAddress": "address2", "amount": 100 }
```

### Mining

| Method | Path | Description |
|---|---|---|
| POST | `/api/mine` | Mine pending transactions into a new block |

**POST `/api/mine` body:**
```json
{ "miningRewardAddress": "miner1" }
```

### Balance

| Method | Path | Description |
|---|---|---|
| GET | `/api/balance/:address` | Confirmed balance of an address |

### Stats

| Method | Path | Description |
|---|---|---|
| GET | `/api/stats` | Chain length, difficulty, validity, pending count |

### Health

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Server uptime, env, timestamp — no rate limit |

---

## Frontend Architecture

The React app is organised into distinct concerns:

- **`src/api/`** — all network calls live here. Components never call `fetch`/`axios` directly.
- **`src/hooks/useBlockchain`** — single source of truth for chain + stats state; polls every 5 s.
- **`src/utils/formatters`** — pure formatting functions (hash truncation, timestamps, amounts).
- **`src/constants/`** — magic strings and numbers in one place.
- **`ErrorBoundary`** — catches any unhandled React render errors gracefully.

---

## Technologies

### Backend
- Node.js + Express
- `morgan` — HTTP request logging
- `dotenv` — environment variable loading
- `express-rate-limit` — API rate limiting
- `cors` — CORS policy middleware
- Node.js built-in `crypto` — SHA-256 hashing

### Frontend
- React 18
- Axios (with interceptors)
- CSS3 (glassmorphism, gradients, animations)

---

## Troubleshooting

**Port already in use**
```bash
# Use a different port
PORT=3003 npm run dev
```

**Frontend can't reach the API**
- Confirm `npm run dev` is running on port 3002
- Confirm `src/setupProxy.js` target matches `PORT`

**Chain resets on every restart**
- This is expected until you implement Task 2 (Data Persistence) from INSTRUCTIONS.md

---

**JMC Added on 22 May 2026**

- Install package: npm install elliptic (elliptic because the blockchain is using public/private key cryptography (ECDSA) to sign and verify transactions)

        - It helps to Generate key pairs (wallets)
        - It helps to Sign transactions (frontend)
        - It helps to Verify transactions (backend)

Backend modification:-

- New Wallet.contrall.js being added into the controllers
- Updated transaction contoller
- Updated blockchain and index models
- New wallet.routes.js being added into the routes
- Updated transaction routes
- Added service as new DIR and included persistence.service.js for the persistence.
- Updated the validator.js
- *** new blockchain.json file will be generated once the app gets started to store the transaction related info. It's also placed in the gitingore so that it do not get uploaded into the Repo.


Frontend modification:-
- New Wallet as new component has been added.
- Updated the TransactionForm
- new wallet.api.js has been added inside api DIR
- Updated addTransaction function in the blockchain.api.js
- Updated the App.js to include the wallet feature into the app.

Important Note: Browse the App in two different web browser as the wallet private key being stored locally and in order to simulate the fund transfer between two wallet's public key.

Do this:-
    -  Firstly open one browser and access the app: http://localhost:3000/
    -  Generate the wallet ( you will see the publick key and newly generated wallet balance will be zero (0)).

    -  Secondly open another browser and access the app: http://localhost:3000/
    -  Generate the wallet ( you will see the publick key and newly generated wallet balance will be zero (0)).

    -Finally from any of the opened browser, Create a Transaction
            - From Address Field: key in the exact public key from the browser wallet you are creating the transaction
            - To Address Field: key in the exact public key from another browser wallet
            - put any amount you want to transfer
            - Click on Add Transaction button
            - Click on the Mine block so that it can be immediately completed.
            - now refres the page from both browser and see the balance gets reflect.
    
    But it would be better to use userstate to reflect the balance correctly once the transaction is being completed.


## License

MIT — for learning and assessment purposes.
