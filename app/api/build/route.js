import { ComputeBudgetProgram, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { solAddress } from '@/lib/validate';
import { connection, pumpSdk, unclaimedLamports } from '@/lib/solana';
import { status } from '@/lib/oneclick';
import { ok, fail, readJson, upstream } from '@/lib/http';
import { SOL_ASSET } from '@/lib/config';

export const dynamic = 'force-dynamic';

// Builds ONE unsigned transaction: claim the creator's pump.fun fees, then send exactly the
// quoted amount to the NEAR Intents deposit address. The creator signs it in their own wallet.
// We never hold keys or funds.
export async function POST(req) {
  const b = await readJson(req);
  const wallet = solAddress(b.wallet);
  const deposit = solAddress(b.depositAddress);
  if (!wallet) return fail('That isn’t a Solana wallet address.');
  if (!deposit) return fail('Missing the deposit address. Get a fresh quote.');

  try {
    // Never trust the browser about where money goes: read the quote back from NEAR Intents
    // and check it's a SOL deposit that refunds to this same wallet.
    const s = await status(deposit.toBase58());
    const qr = s?.quoteResponse?.quoteRequest || {};
    const q = s?.quoteResponse?.quote || {};
    if (s.status !== 'PENDING_DEPOSIT') return fail('That quote is no longer waiting for a deposit. Get a fresh quote.');
    if (qr.originAsset !== SOL_ASSET || qr.refundTo !== wallet.toBase58() || q.depositAddress !== deposit.toBase58()) {
      return fail('That quote doesn’t match this wallet. Get a fresh quote.');
    }
    if (q.deadline && Date.parse(q.deadline) < Date.now() + 60_000) return fail('That quote is about to expire. Get a fresh quote.');

    const amount = BigInt(q.amountIn || qr.amount || '0');
    const unclaimed = await unclaimedLamports(wallet);
    if (amount <= 0n || amount > unclaimed) {
      return fail('Your unclaimed fees changed since the quote. Get a fresh quote.');
    }

    const claim = await pumpSdk().collectCoinCreatorFeeInstructions(wallet, wallet);
    const tx = new Transaction();
    tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 200_000 }));
    tx.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 50_000 }));
    tx.add(...claim);
    tx.add(SystemProgram.transfer({ fromPubkey: wallet, toPubkey: new PublicKey(deposit), lamports: amount }));
    const { blockhash, lastValidBlockHeight } = await connection().getLatestBlockhash('confirmed');
    tx.recentBlockhash = blockhash;
    tx.feePayer = wallet;

    // Simulate first so a broken transaction never reaches the wallet popup.
    const sim = await connection().simulateTransaction(tx);
    if (sim.value.err) return fail('The claim didn’t pass a test run, so nothing was sent. Try again, or claim on pump.fun first.');

    return ok({
      tx: tx.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64'),
      lastValidBlockHeight,
      amount: amount.toString(),
    });
  } catch (e) {
    return upstream(e);
  }
}
