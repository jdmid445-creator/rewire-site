import { NextResponse } from 'next/server';

export const ok = (data) => NextResponse.json(data);
export const fail = (message, status = 400) => NextResponse.json({ error: message }, { status });

export async function readJson(req) {
  try { return await req.json(); } catch { return {}; }
}

// Turns upstream errors into something a person can act on.
export function upstream(e) {
  const m = String(e?.message || '');
  if (/SOLANA_RPC_URL/.test(m)) return fail('The site is missing its Solana connection. Set SOLANA_RPC_URL.', 503);
  if (/amount is too low|too low/i.test(m)) return fail('That amount is too small to route. Let more fees build up, or pick another coin.', 400);
  if (/recipient/i.test(m)) return fail('NEAR Intents rejected the receiving address. Check it matches the coin and chain you picked.', 400);
  if (e?.status === 401) return fail('NEAR Intents rejected the API key. Check ONECLICK_JWT.', 502);
  return fail(m ? `Couldn't complete that: ${m}` : 'Something upstream failed. Try again in a moment.', 502);
}
