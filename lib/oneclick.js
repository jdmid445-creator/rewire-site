import { SOL_ASSET } from './config';

const BASE = 'https://1click.chaindefuser.com';

function headers() {
  const h = { 'content-type': 'application/json', accept: 'application/json' };
  if (process.env.ONECLICK_JWT) h.authorization = `Bearer ${process.env.ONECLICK_JWT}`;
  return h;
}

async function call(path, init = {}) {
  const res = await fetch(BASE + path, { ...init, headers: headers(), cache: 'no-store', signal: AbortSignal.timeout(20000) });
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = { message: text }; }
  if (!res.ok) {
    const msg = body?.message || `NEAR Intents returned ${res.status}`;
    const err = new Error(Array.isArray(msg) ? msg.join(', ') : String(msg));
    err.status = res.status;
    throw err;
  }
  return body;
}

// App fee, in basis points, paid to our NEAR account on every swap. Off unless both are set.
function appFees() {
  const bps = Number(process.env.APP_FEE_BPS || 0);
  const to = process.env.APP_FEE_RECIPIENT;
  if (!to || !Number.isFinite(bps) || bps <= 0) return undefined;
  return [{ recipient: to, fee: Math.min(Math.round(bps), 200) }];
}

export function appFeeBps() {
  return appFees()?.[0].fee || 0;
}

export async function quote({ wallet, lamports, dest, recipient, dry }) {
  const body = {
    dry,
    swapType: 'EXACT_INPUT',
    slippageTolerance: 100,
    originAsset: SOL_ASSET,
    depositType: 'ORIGIN_CHAIN',
    destinationAsset: dest.assetId,
    amount: lamports.toString(),
    refundTo: wallet,
    refundType: 'ORIGIN_CHAIN',
    recipient: recipient.trim(),
    recipientType: 'DESTINATION_CHAIN',
    deadline: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    referral: 'rewire',
    quoteWaitingTimeMs: 3000,
  };
  const fees = appFees();
  if (fees) body.appFees = fees;
  return call('/v0/quote', { method: 'POST', body: JSON.stringify(body) });
}

export async function status(depositAddress) {
  return call(`/v0/status?depositAddress=${encodeURIComponent(depositAddress)}`);
}

export async function submitDeposit(txHash, depositAddress) {
  return call('/v0/deposit/submit', { method: 'POST', body: JSON.stringify({ txHash, depositAddress }) });
}
