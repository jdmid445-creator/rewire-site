import { solAddress, destination, recipientOk } from '@/lib/validate';
import { unclaimedLamports } from '@/lib/solana';
import { quote, appFeeBps } from '@/lib/oneclick';
import { ok, fail, readJson, upstream } from '@/lib/http';
import { MIN_LAMPORTS } from '@/lib/config';

export const dynamic = 'force-dynamic';

// dry: true  → a preview, no deposit address (anyone can do this, no wallet needed)
// dry: false → a live quote with a one-time deposit address, used right before claiming
export async function POST(req) {
  const b = await readJson(req);
  const wallet = solAddress(b.wallet);
  const dest = destination(b.dest);
  if (!wallet) return fail('That isn’t a Solana wallet address.');
  if (!dest) return fail('Pick a coin to receive.');
  const dry = b.dry !== false;
  // A preview without an address still works: quote to a placeholder so people can see the rate.
  const recipient = typeof b.recipient === 'string' ? b.recipient.trim() : '';
  if (!dry && !recipientOk(dest, recipient)) return fail(`That doesn’t look like a ${dest.label} address.`);

  try {
    const lamports = await unclaimedLamports(wallet);
    if (lamports < BigInt(MIN_LAMPORTS)) {
      return fail(`This wallet has ${(Number(lamports) / 1e9).toFixed(4)} SOL in unclaimed fees. You need at least ${MIN_LAMPORTS / 1e9} SOL to convert.`, 400);
    }
    const r = await quote({
      wallet: wallet.toBase58(),
      lamports,
      dest,
      recipient: recipientOk(dest, recipient) ? recipient : placeholder(dest, wallet),
      dry,
    });
    const q = r.quote || {};
    return ok({
      dry,
      lamports: lamports.toString(),
      amountIn: q.amountInFormatted,
      amountInUsd: q.amountInUsd,
      amountOut: q.amountOutFormatted,
      amountOutUsd: q.amountOutUsd,
      minAmountOut: q.minAmountOut,
      timeEstimate: q.timeEstimate,
      depositAddress: dry ? undefined : q.depositAddress,
      deadline: dry ? undefined : q.deadline,
      symbol: dest.symbol,
      feeBps: appFeeBps(),
    });
  } catch (e) {
    return upstream(e);
  }
}

// Format-valid stand-in addresses, only used for dry previews before someone enters theirs (no funds move on a dry quote).
// NEAR Intents rejects burn addresses like 0x...dEaD, so these are ordinary-looking addresses nobody controls on purpose.
function placeholder(dest, wallet) {
  switch (dest.addr) {
    case 'evm': return '0x32caaa3c1481e7f7ed84516cce7cc0e453883a65';
    case 'btc': return 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';
    case 'sol': return wallet.toBase58();
    case 'zec': return 't1MUjBN4Xutp4HSASLv3m26HEB7Kt4xd8fL';
    case 'doge': return 'DH5yaieqoZN36fDVciNyRueRGvGLR3mr7L';
    case 'near': return 'intents.near';
    default: return wallet.toBase58();
  }
}
