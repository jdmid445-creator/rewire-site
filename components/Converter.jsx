'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { DESTINATIONS } from '@/lib/config';

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

  return (
    <div className="tool" aria-live="polite">
      <div className="slip">
        <label className="field">
          <span className="field-label">Creator wallet</span>
          <input
            className="input"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            placeholder="Paste a Solana address"
            spellCheck={false}
            autoComplete="off"
          />
        </label>

        <div className="amount" data-state={fees.state}>
          {fees.state === 'idle' && <p className="hint">Unclaimed fees show up here.</p>}
          {fees.state === 'loading' && <p className="hint">Reading pump.fun&hellip;</p>}
          {fees.state === 'error' && <p className="error">{fees.error}</p>}
          {fees.state === 'done' && (
            <>
              <p className="big">{fmt(fees.sol)} <span>SOL</span></p>
              <p className="hint">
                {fees.enough
                  ? 'Unclaimed creator fees, ready to convert.'
                  : `Under the ${fees.minSol} SOL minimum. Network costs would eat too much of it.`}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="slip">
        <fieldset className="field">
          <legend className="field-label">Receive as</legend>
          <div className="picker">
            {DESTINATIONS.map((x) => (
              <button key={x.id} type="button" className="pick" aria-pressed={dest === x.id} onClick={() => setDest(x.id)}>
                <strong>{x.symbol}</strong>
                <span>{x.chain}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <label className="field">
          <span className="field-label">Your {d.label} address</span>
          <input
            className="input"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder={d.addr === 'evm' ? '0x…' : d.addr === 'btc' ? 'bc1…' : d.addr === 'near' ? 'name.near' : 'Address'}
            spellCheck={false}
            autoComplete="off"
          />
        </label>

        <div className="amount out" data-state={preview.state}>
          {preview.state === 'idle' && <p className="hint">You&rsquo;ll see the live rate here.</p>}
          {preview.state === 'loading' && <p className="hint">Getting a rate&hellip;</p>}
          {preview.state === 'error' && <p className="error">{preview.error}</p>}
          {preview.state === 'done' && (
            <>
              <p className="big">&asymp; {fmt(preview.amountOut, 6)} <span>{preview.symbol}</span></p>
              <p className="hint">About {usd(preview.amountOutUsd)}, arriving in roughly {Math.max(1, Math.round((preview.timeEstimate || 60) / 60))} min.</p>
            </>
          )}
        </div>
      </div>

      {run.state === 'tracking' ? (
        <Tracking run={run} symbol={d.symbol} />
      ) : (
        <>
          <button className="go" type="button" disabled={!canClaim || busy} onClick={claim}>
            {busy ? run.step : connected ? 'Claim and convert' : 'Connect wallet and claim'}
          </button>
          {run.state === 'error' && <p className="error center">{run.error}</p>}
          {mobileNoWallet && <p className="hint center">On a phone, this opens the site inside Phantom so you can sign.</p>}
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
      {done && run.amountOut && <p className="big">{fmt(run.amountOut, 6)} <span>{symbol}</span></p>}
      {run.status === 'REFUNDED' && <p className="hint">The SOL went back to your wallet. You can try again.</p>}
      <p className="links">
        <a href={`https://solscan.io/tx/${run.signature}`} target="_blank" rel="noreferrer">Your claim on Solscan</a>
        {(run.destinationTx || []).map((u) => (
          <a key={u} href={u} target="_blank" rel="noreferrer">Delivery transaction</a>
        ))}
      </p>
    </div>
  );
}
