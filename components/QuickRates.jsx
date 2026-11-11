'use client';

import { useEffect, useState } from 'react';
import { CoinIcon } from './Brand';
import { DESTINATIONS } from '@/lib/config';

const PICK = ['btc', 'eth', 'usdc-base', 'zec', 'doge'];
const fmt = (n) => Number(n).toLocaleString('en-US', { maximumFractionDigits: n >= 100 ? 2 : n >= 1 ? 4 : 6 });

// Five live prices beside the claim card. Dashes until real prices arrive.
export default function QuickRates() {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    let live = true;
    const load = () => fetch('/api/rates').then((r) => (r.ok ? r.json() : null)).then((j) => { if (live && j?.rows?.length) setRows(j.rows); }).catch(() => {});
    load();
    const t = setInterval(load, 60000);
    return () => { live = false; clearInterval(t); };
  }, []);

  return (
    <ul className="quick">
      {PICK.map((id) => {
        const d = DESTINATIONS.find((x) => x.id === id);
        const r = rows?.find((x) => x.id === id);
        return (
          <li key={id}>
            <CoinIcon dest={d} size={26} />
            <span className="quick-name"><strong>{d.symbol}</strong><span>{d.chain}</span></span>
            <span className="quick-val">{r?.perSol ? fmt(r.perSol) : '—'}</span>
          </li>
        );
      })}
    </ul>
  );
}
