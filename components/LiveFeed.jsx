'use client';

import { useEffect, useRef, useState } from 'react';
import { CoinIcon } from './Brand';

function ago(ts) {
  const s = Math.max(0, (Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
const amt = (n, d = 4) => Number(n).toLocaleString('en-US', { maximumFractionDigits: d });
const usd = (n) => Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: n >= 1000 ? 0 : 2 });

export default function LiveFeed({ limit = 6 }) {
  const [state, setState] = useState({ status: 'loading' });
  const seen = useRef(new Set());
  const first = useRef(true);
  const [, tick] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await fetch('/api/feed');
        const j = await r.json();
        if (!alive) return;
        // Rows that weren't there on the previous load get the arrival animation.
        const fresh = new Set();
        for (const x of j.rewires || []) if (!first.current && !seen.current.has(x.id)) fresh.add(x.id);
        for (const x of j.rewires || []) seen.current.add(x.id);
        first.current = false;
        setState({ status: j.ok ? 'ok' : 'down', rewires: j.rewires || [], totals: j.totals, fresh });
      } catch {
        if (alive) setState((s) => (s.rewires ? s : { status: 'down', rewires: [] }));
      }
    };
    load();
    const t = setInterval(load, 15000);
    const clock = setInterval(() => tick((n) => n + 1), 30000); // keeps "2m ago" honest
    return () => { alive = false; clearInterval(t); clearInterval(clock); };
  }, []);

  const rows = (state.rewires || []).slice(0, limit);
  const totals = state.totals;

  return (
    <div className="feed" aria-live="polite">
      <div className="feed-head">
        <span className="feed-title"><span className={`live-dot ${state.status === 'ok' ? '' : 'is-off'}`} aria-hidden="true" />Latest rewires</span>
        {totals && totals.count > 0 ? (
          <span className="feed-totals num">
            {totals.capped ? 'Recent: ' : ''}{totals.count.toLocaleString('en-US')} rewire{totals.count === 1 ? '' : 's'} &middot; {amt(totals.sol, 2)} SOL &middot; {usd(totals.usd)}
          </span>
        ) : (
          <span className="feed-totals">Refreshes every 15s</span>
        )}
      </div>

      {state.status === 'loading' && <p className="feed-empty">Loading the latest rewires&hellip;</p>}
      {state.status === 'down' && rows.length === 0 && <p className="feed-empty">The feed can&rsquo;t reach NEAR Intents right now. It retries every 15 seconds.</p>}
      {state.status === 'ok' && rows.length === 0 && <p className="feed-empty">No rewires yet. The first one shows up here the moment it lands.</p>}

      {rows.length > 0 && (
        <ul className="feed-list">
          {rows.map((r) => (
            <li key={r.id} className={state.fresh?.has(r.id) ? 'is-new' : ''}>
              <span className="feed-pair" aria-hidden="true">
                <img src="/coins/sol.svg" alt="" width="26" height="26" />
                <CoinIcon dest={r.dest} size={26} />
              </span>
              <span className="feed-main">
                <strong className="num">{amt(r.sol, 3)} SOL <span className="feed-arrow">to</span> {r.status === 'SUCCESS' ? `${amt(r.out, r.out >= 1 ? 2 : 6)} ` : ''}{r.symbol}</strong>
                <span className="feed-sub">{r.status === 'SUCCESS' ? `Delivered on ${r.chain}` : `Swapping to ${r.chain}`} &middot; {ago(r.at)}</span>
              </span>
              <span className="feed-side">
                {r.usd > 0 && <span className="feed-usd num">{usd(r.usd)}</span>}
                <span className="feed-wallet" title="Wallet hidden" aria-label="Wallet hidden">{r.wallet}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="fine">Real swaps read from NEAR Intents. Wallets are always hidden.</p>
    </div>
  );
}
