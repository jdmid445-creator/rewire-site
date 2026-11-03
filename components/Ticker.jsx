'use client';

import { useEffect, useState } from 'react';
import { CoinIcon } from './Brand';
import { DESTINATIONS } from '@/lib/config';

const fmt = (n) => Number(n).toLocaleString('en-US', { maximumFractionDigits: n >= 100 ? 2 : n >= 1 ? 4 : 6 });

// A slow strip of live rates under the hero. Hidden entirely until real prices arrive.
export default function Ticker() {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    let live = true;
    const load = () => fetch('/api/rates').then((r) => (r.ok ? r.json() : null)).then((j) => { if (live && j?.rows?.length) setRows(j.rows); }).catch(() => {});
    load();
    const t = setInterval(load, 60000);
    return () => { live = false; clearInterval(t); };
  }, []);

  if (!rows) return <div className="ticker is-empty" aria-hidden="true" />;

  const items = rows.map((r) => {
    const d = DESTINATIONS.find((x) => x.id === r.id);
    return (
      <li key={r.id}>
        <span className="tk-sol">1 SOL</span>
        <span className="tk-arrow" aria-hidden="true">
          <svg viewBox="0 0 20 8" width="20" height="8"><path d="M0 4h17M14 1l3 3-3 3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
        <CoinIcon dest={d} size={20} />
        <span className="tk-val num">{fmt(r.perSol)} {r.symbol}</span>
        <span className="tk-chain">{r.chain}</span>
      </li>
    );
  });

  return (
    <div className="ticker" role="region" aria-label="Live rates">
      <ul className="tk-track">
        {items}
        {/* Second copy makes the loop seamless; hidden from screen readers. */}
        <li aria-hidden="true" className="tk-gap" />
        {rows.map((r) => {
          const d = DESTINATIONS.find((x) => x.id === r.id);
          return (
            <li key={`b-${r.id}`} aria-hidden="true">
              <span className="tk-sol">1 SOL</span>
              <span className="tk-arrow"><svg viewBox="0 0 20 8" width="20" height="8"><path d="M0 4h17M14 1l3 3-3 3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
              <CoinIcon dest={d} size={20} />
              <span className="tk-val num">{fmt(r.perSol)} {r.symbol}</span>
              <span className="tk-chain">{r.chain}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
