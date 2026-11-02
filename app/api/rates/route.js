import { DESTINATIONS, SOL_ASSET } from '@/lib/config';
import { ok, fail } from '@/lib/http';

// Live reference prices from NEAR Intents' own token list: what 1 SOL is worth in each payout coin.
// Indicative only; the real quote in the tool includes fees and slippage.
export const revalidate = 60;

export async function GET() {
  try {
    const res = await fetch('https://1click.chaindefuser.com/v0/tokens', { next: { revalidate: 60 }, signal: AbortSignal.timeout(15000) });
    if (!res.ok) return fail('Rates are unavailable right now.', 502);
    const tokens = await res.json();
    const price = (id) => tokens.find((t) => t.assetId === id)?.price;
    const sol = price(SOL_ASSET);
    if (!sol) return fail('Rates are unavailable right now.', 502);
    const rows = DESTINATIONS.map((d) => {
      const p = price(d.assetId);
      return p ? { id: d.id, symbol: d.symbol, chain: d.chain, perSol: sol / p, usd: p } : null;
    }).filter(Boolean);
    return ok({ solUsd: sol, rows, at: Date.now() });
  } catch {
    return fail('Rates are unavailable right now.', 502);
  }
}
