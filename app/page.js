import Converter from '@/components/Converter';
import { CoinIcon } from '@/components/Brand';
import { DESTINATIONS } from '@/lib/config';

const STATS = [
  { n: '10', l: 'Coins to receive' },
  { n: '8', l: 'Chains' },
  { n: '1', l: 'Signature' },
  { n: '0', l: 'Funds held by us' },
];

const STEPS = [
  { t: 'Paste your wallet', d: 'We read the unclaimed creator fees on the bonding curve and PumpSwap. No wallet connection needed to look.' },
  { t: 'Pick a coin', d: 'BTC, ETH, USDC on four chains and more. You see the live rate and the address it lands in before you sign.' },
  { t: 'Sign once', d: 'One transaction claims your fees and hands them to a NEAR Intents swap. Your coins arrive in a few minutes.' },
];

const BEFORE = [
  'Claim on pump.fun, then open a bridge',
  'Swap, bridge, wait, then swap again',
  'Three or four transactions and fees on each',
  'Bridges and swaps that each take a cut',
];
const AFTER = [
  'Claim and convert in one transaction',
  'Any of 10 coins, delivered on its own chain',
  'Live rate shown before you sign',
  'Refunds go straight back to your wallet',
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
      <section className="hero">
        <Wires />
        <div className="container hero-inner">
          <h1>Your pump.fun fees, paid out in any coin.</h1>
          <p className="lede">
            Claim your creator fees and receive BTC, ETH, USDC and more on their own chains. One signature, and your fees never touch our wallets.
          </p>
          <Converter />
        </div>
      </section>

      <section className="container">
        <ul className="stats">
          {STATS.map((s) => (
            <li key={s.l}><strong className="num">{s.n}</strong><span>{s.l}</span></li>
          ))}
        </ul>
      </section>

      <section id="how" className="section container">
        <h2 className="h2 center-text">How it works</h2>
        <ol className="steps">
          {STEPS.map((s, i) => (
            <li key={s.t} className="card step">
              <span className="step-num num">{i + 1}</span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="coins" className="section container">
        <h2 className="h2 center-text">Receive it how you want it</h2>
        <p className="lede center-text">Every payout is delivered on its own chain, straight to your address.</p>
        <ul className="coin-row">
          {DESTINATIONS.map((d) => (
            <li key={d.id}>
              <CoinIcon dest={d} size={28} />
              <span><strong>{d.symbol}</strong><span>{d.chain}</span></span>
            </li>
          ))}
        </ul>
      </section>

      <section className="section container">
        <h2 className="h2 center-text">One step instead of several</h2>
        <div className="compare">
          <div className="card compare-card">
            <h3>Cashing out the usual way</h3>
            <ul>{BEFORE.map((x) => <li key={x}><Dash />{x}</li>)}</ul>
          </div>
          <div className="card compare-card is-rewire">
            <h3>With Rewire</h3>
            <ul>{AFTER.map((x) => <li key={x}><Check />{x}</li>)}</ul>
          </div>
        </div>
      </section>

      <section className="section container narrow-col">
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

// Two wires come in from each side and meet behind the tool. Mirrored so the hero stays symmetric.
function Wires() {
  const side = (
    <>
      <path d="M0 140 C 260 140, 330 300, 560 300" />
      <path d="M0 230 C 240 230, 340 340, 560 340" />
      <path d="M0 330 C 250 330, 330 380, 560 380" />
    </>
  );
  return (
    <svg className="wires" viewBox="0 0 1440 640" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
      <defs>
        <linearGradient id="wire-l" x1="0" x2="1">
          <stop offset="0" stopColor="#2E9BFF" stopOpacity="0" />
          <stop offset="1" stopColor="#2E9BFF" stopOpacity=".55" />
        </linearGradient>
        <linearGradient id="wire-r" x1="1" x2="0">
          <stop offset="0" stopColor="#2E9BFF" stopOpacity="0" />
          <stop offset="1" stopColor="#2E9BFF" stopOpacity=".55" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#wire-l)" strokeWidth="1.5">{side}</g>
      <g fill="none" stroke="url(#wire-r)" strokeWidth="1.5" transform="translate(1440 0) scale(-1 1)">{side}</g>
    </svg>
  );
}

function Check() {
  return <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M3 8.5 6.5 12 13 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function Dash() {
  return <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M4 8h8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
}
