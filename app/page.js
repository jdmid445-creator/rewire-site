import Converter from '@/components/Converter';
import Rates from '@/components/Rates';
import { CoinIcon } from '@/components/Brand';
import Reveal from '@/components/Reveal';
import LiveFeed from '@/components/LiveFeed';

const HOPS = [
  { t: 'Claim', where: 'pump.fun', d: 'Your unclaimed fees from the bonding curve and PumpSwap move into your wallet.' },
  { t: 'Hand off', where: 'NEAR Intents', d: 'In the same transaction, exactly the quoted SOL goes to a one-time deposit address.' },
  { t: 'Deliver', where: 'your chain', d: 'Solvers fill the swap and your coin lands at your address, usually within minutes.' },
];

const COMPARE = [
  ['Transactions to sign', 'Three or more', 'One'],
  ['Apps involved', 'pump.fun, a DEX, a bridge', 'Rewire'],
  ['See the final amount first', 'Rarely', 'Always'],
  ['If something fails', 'Funds stuck mid-bridge', 'Refunded to your wallet'],
  ['Fee settings changed', 'Sometimes', 'Never'],
];

const FAQ = [
  ['Do you ever hold my fees?', 'No. The transaction moves your fees from pump.fun to your wallet and on into a one-time NEAR Intents deposit address that only pays out to the address you entered. If the swap can’t finish, the SOL is refunded to your wallet.'],
  ['Do I change anything on pump.fun?', 'No. pump.fun lets you change fee recipients only once per coin, so Rewire never asks you to. Your fees keep going to your wallet, and you rewire them whenever you want.'],
  ['What does it cost?', 'A small Rewire fee is built into the quote and shown before you sign, plus normal Solana network fees.'],
  ['My fees are split with a team. Does that work?', 'Paste your own wallet. Your share shows once it has been paid out to you. Fees still sitting in a split need to be distributed on pump.fun first.'],
  ['Is there a minimum?', 'Yes, 0.02 SOL. Below that, network costs would take too much of the payout.'],
];

export default function Home() {
  return (
    <>
      <Reveal />
      <section className="hero">
        <Backdrop />
        <div className="container hero-inner">
          <h1><span className="rise" style={{ '--d': '0ms' }}>Your pump.fun fees,</span> <span className="rise" style={{ '--d': '120ms' }}>paid out in any coin.</span></h1>
          <p className="lede rise" style={{ '--d': '260ms' }}>Claim your creator fees and receive BTC, ETH or USDC on their own chains. One signature, and the money never passes through us.</p>
          <div className="board rise" style={{ '--d': '420ms' }}>
            <Side side="in" />
            <Converter />
            <Side side="out" />
          </div>
        </div>
      </section>

      <section id="live" className="section container" data-reveal>
        <h2 className="h2 center-text">Rewires, as they happen</h2>
        <p className="lede center-text">Every swap below is real, read straight from NEAR Intents.</p>
        <LiveFeed />
      </section>

      <section id="how" className="section container" data-reveal>
        <h2 className="h2 center-text">One transaction, three hops</h2>
        <p className="lede center-text">Everything below happens from a single signature in your own wallet.</p>
        <ol className="track">
          <span className="track-line" aria-hidden="true" />
          {HOPS.map((h, i) => (
            <li key={h.t}>
              <span className="track-n num">{i + 1}</span>
              <h3>{h.t} <span className="track-where">on {h.where}</span></h3>
              <p>{h.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="coins" className="section container" data-reveal>
        <h2 className="h2 center-text">What 1 SOL gets you right now</h2>
        <Rates />
      </section>

      <section className="section container" data-reveal>
        <h2 className="h2 center-text">Cashing out, compared</h2>
        <div className="table-wrap">
          <table className="compare-table">
            <thead>
              <tr><th scope="col"><span className="sr-only">Step</span></th><th scope="col">The usual way</th><th scope="col">With Rewire</th></tr>
            </thead>
            <tbody>
              {COMPARE.map(([k, a, b]) => (
                <tr key={k}><th scope="row">{k}</th><td>{a}</td><td>{b}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section container narrow-col" data-reveal>
        <h2 className="h2 center-text">Questions</h2>
        <div className="faq">
          {FAQ.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}

// Schematic on either side of the tool: fee sources wire in on the left, payout coins wire out on the right.
function Side({ side }) {
  const items = side === 'in'
    ? [{ label: 'Bonding curve', sub: 'Creator fees' }, { label: 'PumpSwap', sub: 'Creator fees' }, { label: 'Fee split', sub: 'Your share' }]
    : [{ coin: 'btc' }, { coin: 'eth' }, { coin: 'usdc-base' }];
  return (
    <div className={`side side-${side}`} aria-hidden="true">
      {items.map((it, i) => (
        <div className="node-row" key={i}>
          <span className="node">
            {it.coin ? (
              <>
                <CoinIcon dest={it.coin} size={22} />
                <span><strong>{it.coin === 'usdc-base' ? 'USDC' : it.coin.toUpperCase()}</strong><span>{it.coin === 'btc' ? 'Bitcoin' : it.coin === 'eth' ? 'Ethereum' : 'Base'}</span></span>
              </>
            ) : (
              <>
                <img src="/coins/sol.svg" alt="" width="22" height="22" />
                <span><strong>{it.label}</strong><span>{it.sub}</span></span>
              </>
            )}
          </span>
          <span className="wire"><span className="pulse" style={{ '--i': i }} /></span>
        </div>
      ))}
    </div>
  );
}

// Hero backdrop: a bundle of cables that pinches through the tool, a horizon arc, and a few live strands.
function Backdrop() {
  const strands = [];
  for (let k = 0; k < 14; k++) {
    const spread = (k - 6.5) * 22;
    const y0 = 600 + spread * 1.35;
    const yc = 640 + spread * 0.12;
    strands.push(`M-40 ${y0.toFixed(1)} C 420 ${y0.toFixed(1)}, 520 ${yc.toFixed(1)}, 720 ${yc.toFixed(1)} S 1020 ${y0.toFixed(1)}, 1480 ${y0.toFixed(1)}`);
  }
  return (
    <div className="backdrop" aria-hidden="true">
      <div className="horizon" />
      <svg className="cables" viewBox="0 0 1440 940" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="cable-fade" x1="0" x2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset=".3" stopColor="#fff" stopOpacity=".07" />
            <stop offset=".5" stopColor="#fff" stopOpacity=".02" />
            <stop offset=".7" stopColor="#fff" stopOpacity=".07" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g fill="none" stroke="url(#cable-fade)" strokeWidth="1">
          {strands.map((d, i) => <path key={i} d={d} />)}
        </g>
        <g fill="none" stroke="#2E9BFF" strokeWidth="1.4" strokeLinecap="round">
          {[2, 6, 9, 12].map((i, n) => <path key={i} className="strand-live" d={strands[i]} style={{ '--n': n }} pathLength="100" />)}
        </g>
      </svg>
    </div>
  );
}
