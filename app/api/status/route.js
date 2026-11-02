import { solAddress } from '@/lib/validate';
import { status } from '@/lib/oneclick';
import { ok, fail, upstream } from '@/lib/http';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const deposit = solAddress(new URL(req.url).searchParams.get('deposit'));
  if (!deposit) return fail('Missing the deposit address.');
  try {
    const s = await status(deposit.toBase58());
    const d = s.swapDetails || {};
    return ok({
      status: s.status,
      amountIn: d.amountInFormatted,
      amountOut: d.amountOutFormatted,
      amountOutUsd: d.amountOutUsd,
      refunded: d.refundedAmountFormatted,
      originTx: (d.originChainTxHashes || []).map((t) => t.explorerUrl).filter(Boolean),
      destinationTx: (d.destinationChainTxHashes || []).map((t) => t.explorerUrl).filter(Boolean),
      updatedAt: s.updatedAt,
    });
  } catch (e) {
    return upstream(e);
  }
}
