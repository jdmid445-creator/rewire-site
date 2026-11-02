# Rewire

Claim pump.fun creator fees and receive them in any coin, on any chain. Non-custodial: the creator signs one
transaction that claims their fees and sends them into a one-time NEAR Intents (1Click) swap.

## Environment variables (Vercel → Settings → Environment Variables)

| Name | Required | What it is |
| --- | --- | --- |
| `SOLANA_RPC_URL` | yes | Full Solana RPC URL, e.g. your Helius mainnet URL with key |
| `ONECLICK_JWT` | recommended | NEAR Intents partner API key (avoids the 1Click fee) |
| `APP_FEE_BPS` | optional | Rewire's fee in basis points, e.g. `25` = 0.25%. Max 200 |
| `APP_FEE_RECIPIENT` | optional | NEAR account that receives the app fee |

## How a claim works

1. `GET /api/fees?wallet=` reads unclaimed SOL fees (bonding curve + PumpSwap) with the official pump.fun SDK.
2. `POST /api/quote` gets a 1Click quote (dry for previews, live for a one-time deposit address).
3. `POST /api/build` re-reads the quote from NEAR Intents, checks it's a SOL deposit refunding to the same wallet and
   no larger than the unclaimed fees, then builds one unsigned transaction: claim fees + transfer to the deposit
   address. It is simulated before it's returned.
4. The browser wallet signs and sends it; `/api/submit` notifies 1Click; `/api/status` tracks delivery.
