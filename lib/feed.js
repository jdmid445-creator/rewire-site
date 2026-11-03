import { createHash } from 'node:crypto';
import { DESTINATIONS, SOL_ASSET } from './config';
import { REFERRAL } from './oneclick';

// Real Rewire swaps, read back from the NEAR Intents explorer by our referral tag.
// Nothing here is invented: no swaps means an empty feed. Wallets never leave the server.

const URL_BASE = 'https://explorer.near-intents.org/api/v0/transactions';
const TTL = 20_000; // the explorer allows one request per 5s per partner; cache well above that

let cache = { at: 0, data: null };

function jwt() {
  return process.env.EXPLORER_JWT || process.env.ONECLICK_JWT || '';
}

const short = (s) => createHash('sha256').update(String(s)).digest('hex');

// Blurred stand-in for a wallet: derived from a hash, so it is stable per swap but is not an address.
function filler(seed) {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const h = short(`w:${seed}`);
  let out = '';
  for (let i = 0; i < 8; i++) out += chars[parseInt(h.slice(i * 2, i * 2 + 2), 16) % chars.length];
  return `${out.slice(0, 4)}...${out.slice(4)}`;
}

function shape(tx) {
  const dest = DESTINATIONS.find((d) => d.assetId === tx.destinationAsset);
  if (!dest || tx.originAsset !== SOL_ASSET) return null;
  const key = tx.depositAddress || tx.intentHashes || tx.createdAt;
  return {
    id: short(key).slice(0, 16),
    at: (tx.createdAtTimestamp ? tx.createdAtTimestamp * 1000 : Date.parse(tx.createdAt)) || Date.now(),
    status: tx.status,
    sol: Number(tx.amountInFormatted) || 0,
    usd: Number(tx.amountOutUsd) || Number(tx.amountInUsd) || 0,
    out: Number(tx.amountOutFormatted) || 0,
    dest: dest.id,
    symbol: dest.symbol,
    chain: dest.chain,
    wallet: filler(key),
  };
}

export async function getFeed() {
  if (cache.data && Date.now() - cache.at < TTL) return cache.data;
  const token = jwt();
  if (!token) return { ok: false, reason: 'not-configured', rewires: [] };

  const q = new URLSearchParams({
    referral: REFERRAL,
    numberOfTransactions: '200',
    statuses: 'SUCCESS,PROCESSING',
    fromTokenId: SOL_ASSET,
  });
  // When we take an app fee, only count swaps that paid it to our account.
  if (process.env.APP_FEE_RECIPIENT) q.set('affiliate', process.env.APP_FEE_RECIPIENT);

  try {
    const res = await fetch(`${URL_BASE}?${q}`, {
      headers: { authorization: `Bearer ${token}`, accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) {
      // Keep serving the last good result through rate limits and blips.
      if (cache.data) return cache.data;
      let msg = '';
      try { const e = await res.json(); msg = String(e?.error?.message || e?.message || '').slice(0, 160); } catch {}
      return { ok: false, reason: res.status === 401 ? 'unauthorized' : `http-${res.status}${msg ? `: ${msg}` : ''}`, rewires: [] };
    }
    const list = await res.json();
    const rewires = (Array.isArray(list) ? list : []).map(shape).filter(Boolean).sort((a, b) => b.at - a.at);
    const done = rewires.filter((r) => r.status === 'SUCCESS');
    const data = {
      ok: true,
      rewires: rewires.slice(0, 20),
      totals: {
        count: done.length,
        sol: done.reduce((s, r) => s + r.sol, 0),
        usd: done.reduce((s, r) => s + r.usd, 0),
        capped: rewires.length >= 200,
      },
    };
    cache = { at: Date.now(), data };
    return data;
  } catch {
    if (cache.data) return cache.data;
    return { ok: false, reason: 'unreachable', rewires: [] };
  }
}
