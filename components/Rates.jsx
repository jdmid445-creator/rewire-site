'use client';

import { useEffect, useState } from 'react';
import { CoinIcon } from './Brand';
import { DESTINATIONS } from '@/lib/config';

const fmt = (n) => {
  if (n == null) return '';
  const d = n >= 100 ? 2 : n >= 1 ? 4 : 6;
  return Number(n).toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: Math.min(d, 2) });
};
const usd = (n) => Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: n >= 1 ? 2 : 4 });

export default function Rates() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let live = true;
    const load = async () => {
      try {
        const r = await fetch('/api/rates');
        const j = await r.json();
        if (!live) return;
        if (r.ok) { setData(j); setErr(false); } else setErr(true);
      } catch { if (live) setErr(true); }
    };
    load();
    const t = setInterval(load, 60000);
    return () => { live = false; clearInterval(t); };
  }, []);

  const rows = data?.rows || DESTINATIONS.map((d) => ({ id: d.id, symbol: d.symbol, chain: d.chain }));

  return (
    <div className="rates">
      <div className="rates-head">
        <span className="rates-sol"><img src="/coins/sol.svg" alt="" width="22" height="22" /> 1 SOL {data && <span className="muted num">= {usd(data.solUsd)}</span>}</span>
        <span className="muted small">{err ? 'Rates unavailable right now' : data ? 'Prices from NEAR Intents, refreshed every minute' : 'Loading prices'}</span>
      </div>
      <ul className="rates-grid">
        {rows.map((r) => {
          const d = DESTINATIONS.find((x) => x.id === r.id);
          return (
            <li key={r.id}>
              <CoinIcon dest={d} size={30} />
              <span className="rate-name"><strong>{r.symbol}</strong><span>{r.chain}</span></span>
              <span className="rate-val num">{r.perSol ? fmt(r.perSol) : '—'}</span>
            </li>
          );
        })}
      </ul>
      <p className="fine">Reference prices. Your quote in the tool includes the Rewire fee, network costs and slippage.</p>
    </div>
  );
}
