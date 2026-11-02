'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { DESTINATIONS } from '@/lib/config';
import { CoinIcon } from './Brand';

const isSol = (s) => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test((s || '').trim());

function provider() {
  if (typeof window === 'undefined') return null;
  return window.phantom?.solana || window.solflare || window.backpack?.solana || window.solana || null;
}

async function post(path, body) {
  const r = await fetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || 'Something went wrong. Try again.');
  return j;
}

function b64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

const fmt = (n, d = 4) => (n == null || n === '' ? '' : Number(n).toLocaleString('en-US', { maximumFractionDigits: d }));
const usd = (n) => (n == null ? '' : Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD' }));

export default function Converter() {
  const [wallet, setWallet] = useState('');
  const [connected, setConnected] = useState('');
  const [fees, setFees] = useState({ state: 'idle' });
  const [dest, setDest] = useState('btc');
  const [recipient, setRecipient] = useState('');
  const [preview, setPreview] = useState({ state: 'idle' });
  const [run, setRun] = useState({ state: 'idle' });
  const [mobileNoWallet, setMobileNoWallet] = useState(false);
  const [picking, setPicking] = useState(false);
  const pollRef = useRef(null);

  const d = DESTINATIONS.find((x) => x.id === dest);

  useEffect(() => {
    const mobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
    setMobileNoWallet(mobile && !provider());
    return () => clearInterval(pollRef.current);
  }, []);

  // Read unclaimed fees once a real address is in the box.
  useEffect(() => {
    const w = wallet.trim();
    if (!isSol(w)) { setFees({ state: 'idle' }); return; }
    let live = true;
    setFees({ state: 'loading' });
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/fees?wallet=${w}`);
        const j = await r.json();
        if (!live) return;
        if (!r.ok) setFees({ state: 'error', error: j.error });
        else setFees({ state: 'done', ...j });
      } catch {
        if (live) setFees({ state: 'error', error: 'Couldn’t reach the site. Check your connection.' });
      }
    }, 350);
    return () => { live = false; clearTimeout(t); };
  }, [wallet]);

  // Live rate preview. No wallet connection needed.
  useEffect(() => {
    if (fees.state !== 'done' || !fees.enough) { setPreview({ state: 'idle' }); return; }
    let live = true;
    setPreview((p) => ({ ...p, state: 'loading' }));
    const t = setTimeout(async () => {
      try {
        const j = await post('/api/quote', { wallet: fees.wallet, dest, recipient, dry: true });
        if (live) setPreview({ state: 'done', ...j });
      } catch (e) {
        if (live) setPreview({ state: 'error', error: e.message });
      }
    }, 300);
    return () => { live = false; clearTimeout(t); };
  }, [fees, dest, recipient]);

  const connect = useCallback(async () => {
    const p = provider();
    if (!p) {
      if (mobileNoWallet) window.location.href = `https://phantom.app/ul/browse/${encodeURIComponent(location.href)}?ref=${encodeURIComponent(location.origin)}`;
      else window.open('https://phantom.com/download', '_blank');
      return null;
    }
    const res = await p.connect();
    const pk = (res?.publicKey || p.publicKey)?.toString();
    if (pk) { setConnected(pk); setWallet(pk); }
    return pk;
  }, [mobileNoWallet]);

  async function claim() {
    setRun({ state: 'working', step: 'Connecting your wallet' });
    try {
      const pk = connected || (await connect());
      if (!pk) { setRun({ state: 'idle' }); return; }
      if (pk !== wallet.trim()) {
        setRun({ state: 'error', error: 'Your connected wallet is different from the one you checked. We switched the box to your connected wallet, so check the amount and try again.' });
        return;
      }
      setRun({ state: 'working', step: 'Locking in your rate' });
      const q = await post('/api/quote', { wallet: pk, dest, recipient, dry: false });
      setRun({ state: 'working', step: 'Preparing the transaction' });
      const b = await post('/api/build', { wallet: pk, depositAddress: q.depositAddress });
      setRun({ state: 'working', step: 'Approve in your wallet' });
      const { Transaction } = await import('@solana/web3.js');
      const tx = Transaction.from(b64ToBytes(b.tx));
      const { signature } = await provider().signAndSendTransaction(tx);
      post('/api/submit', { txHash: signature, depositAddress: q.depositAddress }).catch(() => {});
      setRun({ state: 'tracking', signature, deposit: q.depositAddress, quote: q, status: 'PENDING_DEPOSIT' });
      track(q.depositAddress);
    } catch (e) {
      const msg = /reject|denied|cancel/i.test(e?.message || '') ? 'You cancelled in your wallet. Nothing was sent.' : e.message;
      setRun({ state: 'error', error: msg });
    }
  }

  function track(deposit) {
    clearInterval(pollRef.current);
    const tick = async () => {
      try {
        const r = await fetch(`/api/status?deposit=${deposit}`);
        const j = await r.json();
        if (!r.ok) return;
        setRun((s) => ({ ...s, ...j, status: j.status }));
        if (['SUCCESS', 'REFUNDED', 'FAILED'].includes(j.status)) clearInterval(pollRef.current);
      } catch {}
    };
    tick();
    pollRef.current = setInterval(tick, 5000);
  }

  const addrOk = recipient.trim().length > 0;
  const canClaim = fees.state === 'done' && fees.enough && addrOk && preview.state === 'done' && run.state !== 'working';
  const busy = run.state === 'working';

  const mins = Math.max(1, Math.round((preview.timeEstimate || 60) / 60));

  return (
    <div className="tool card" aria-live="polite">
      <div className="tool-head">
        <h2 className="tool-title">Rewire your fees</h2>
        <span className="tag"><span className="tag-dot" />Non-custodial</span>
      </div>

      <div className="pane">
        <div className="pane-top">
          <span className="label">You claim</span>
          <span className="pane-src"><img src="/coins/sol.svg" alt="" width="18" height="18" />pump.fun fees</span>
        </div>
        <input
          className="input"
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
          placeholder="Paste your creator wallet"
          aria-label="Creator wallet"
          spellCheck={false}
          autoComplete="off"
        />
        <div className="pane-amount">
          {fees.state === 'done' ? (
            <p className="big num">{fmt(fees.sol)}<span> SOL</span></p>
          ) : (
            <p className="big num is-empty">0.00<span> SOL</span></p>
          )}
          <p className={fees.state === 'error' || (fees.state === 'done' && !fees.enough) ? 'note warn' : 'note'}>
            {fees.state === 'idle' && 'Unclaimed fees show up as soon as you paste.'}
            {fees.state === 'loading' && 'Reading pump.fun\u2026'}
            {fees.state === 'error' && fees.error}
            {fees.state === 'done' && (fees.enough ? 'Unclaimed and ready to rewire.' : `Below the ${fees.minSol} SOL minimum, so network costs would eat most of it.`)}
          </p>
        </div>
      </div>

      <div className="swap-arrow" aria-hidden="true">
        <svg viewBox="0 0 16 16" width="14" height="14"><path d="M8 2v11M3.5 8.5 8 13l4.5-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>

      <div className="pane">
        <div className="pane-top">
          <span className="label">You receive</span>
        </div>
        <div className="pane-row">
          {preview.state === 'done' ? (
            <p className="big num">&asymp; {fmt(preview.amountOut, 6)}</p>
          ) : (
            <p className="big num is-empty">{preview.state === 'loading' ? '\u2026' : '0.00'}</p>
          )}
          <button type="button" className="coin-btn" aria-expanded={picking} onClick={() => setPicking((v) => !v)}>
            <CoinIcon dest={d} size={26} />
            <span className="coin-btn-text"><strong>{d.symbol}</strong><span>{d.chain}</span></span>
            <svg viewBox="0 0 12 8" width="11" height="8" aria-hidden="true"><path d="M1 1.5 6 6.5l5-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>
        </div>
        {picking && (
          <div className="coin-grid" role="group" aria-label="Pick a coin">
            {DESTINATIONS.map((x) => (
              <button key={x.id} type="button" className="coin-opt" aria-pressed={dest === x.id} onClick={() => { setDest(x.id); setPicking(false); }}>
                <CoinIcon dest={x} size={22} />
                <span><strong>{x.symbol}</strong><span>{x.chain}</span></span>
              </button>
            ))}
          </div>
        )}
        <input
          className="input"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder={`Your ${d.label} address`}
          aria-label={`Your ${d.label} address`}
          spellCheck={false}
          autoComplete="off"
        />
        {preview.state === 'error' && <p className="note warn">{preview.error}</p>}
      </div>

      <dl className="rows">
        <div><dt>Value</dt><dd className="num">{preview.state === 'done' ? usd(preview.amountOutUsd) : '\u2014'}</dd></div>
        <div><dt>Rewire fee</dt><dd className="num">{preview.state === 'done' ? `${(preview.feeBps / 100).toFixed(2)}%` : '\u2014'}</dd></div>
        <div><dt>Arrives in</dt><dd className="num">{preview.state === 'done' ? `About ${mins} min` : '\u2014'}</dd></div>
      </dl>

      {run.state === 'tracking' ? (
        <Tracking run={run} symbol={d.symbol} />
      ) : (
        <>
          <button className="btn btn-primary btn-block" type="button" disabled={!canClaim || busy} onClick={claim}>
            {busy ? run.step : connected ? 'Claim and rewire' : 'Connect wallet and claim'}
          </button>
          {run.state === 'error' && <p className="note warn center">{run.error}</p>}
          {mobileNoWallet && <p className="note center">On a phone, this opens Rewire inside Phantom so you can sign.</p>}
        </>
      )}
    </div>
  );
}

const LABEL = {
  PENDING_DEPOSIT: 'Waiting for your transaction to land',
  KNOWN_DEPOSIT_TX: 'Deposit seen, starting the swap',
  PROCESSING: 'Swapping',
  SUCCESS: 'Delivered',
  INCOMPLETE_DEPOSIT: 'The deposit came in short',
  REFUNDED: 'Refunded to your wallet',
  FAILED: 'The swap failed',
};

function Tracking({ run, symbol }) {
  const done = run.status === 'SUCCESS';
  return (
    <div className="track" data-done={done}>
      <p className="track-status">{LABEL[run.status] || run.status}</p>
      {done && run.amountOut && <p className="big num">{fmt(run.amountOut, 6)}<span> {symbol}</span></p>}
      {run.status === 'REFUNDED' && <p className="note">The SOL went back to your wallet. You can try again.</p>}
      <p className="links">
        <a href={`https://solscan.io/tx/${run.signature}`} target="_blank" rel="noreferrer">Your claim on Solscan</a>
        {(run.destinationTx || []).map((u) => (
          <a key={u} href={u} target="_blank" rel="noreferrer">Delivery transaction</a>
        ))}
      </p>
    </div>
  );
}
