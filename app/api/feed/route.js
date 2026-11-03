import { NextResponse } from 'next/server';
import { getFeed } from '@/lib/feed';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await getFeed();
  if (!data.ok) console.error('[feed]', data.reason);
  // The reason stays in the server logs; visitors only learn whether the feed is up.
  return NextResponse.json(
    { ok: data.ok, rewires: data.rewires, totals: data.totals || null },
    { headers: { 'cache-control': 'public, s-maxage=15, stale-while-revalidate=30' } },
  );
}
