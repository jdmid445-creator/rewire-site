import { solAddress } from '@/lib/validate';
import { unclaimedLamports } from '@/lib/solana';
import { ok, fail, upstream } from '@/lib/http';
import { MIN_LAMPORTS } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const wallet = solAddress(new URL(req.url).searchParams.get('wallet'));
  if (!wallet) return fail('That isn’t a Solana wallet address.');
  try {
    const lamports = await unclaimedLamports(wallet);
    return ok({ wallet: wallet.toBase58(), lamports: lamports.toString(), sol: Number(lamports) / 1e9, enough: lamports >= BigInt(MIN_LAMPORTS), minSol: MIN_LAMPORTS / 1e9 });
  } catch (e) {
    return upstream(e);
  }
}
