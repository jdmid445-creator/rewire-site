import { solAddress } from '@/lib/validate';
import { submitDeposit } from '@/lib/oneclick';
import { ok, fail, readJson } from '@/lib/http';

export const dynamic = 'force-dynamic';

// Tells NEAR Intents about the deposit early so the swap starts sooner. Optional; failure is harmless.
export async function POST(req) {
  const b = await readJson(req);
  const deposit = solAddress(b.depositAddress);
  const txHash = typeof b.txHash === 'string' && /^[1-9A-HJ-NP-Za-km-z]{64,90}$/.test(b.txHash) ? b.txHash : null;
  if (!deposit || !txHash) return fail('Missing the transaction or deposit address.');
  try {
    await submitDeposit(txHash, deposit.toBase58());
  } catch {}
  return ok({ submitted: true });
}
