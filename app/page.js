import Converter from '@/components/Converter';
import Rates from '@/components/Rates';
import Reveal from '@/components/Reveal';
import LiveFeed from '@/components/LiveFeed';
import ClaimJump from '@/components/ClaimJump';
import Ribbon from '@/components/Ribbon';
import QuickRates from '@/components/QuickRates';

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
        <Ribbon />
        <div className="container hero-inner">
          <h1 className="hero-title">
            <span className="rise" style={{ '--d': '80ms' }}>Your pump.fun fees,</span>
            <span className="rise" style={{ '--d': '180ms' }}>paid out in any coin.</span>
          </h1>
          <div className="hero-side rise" style={{ '--d': '320ms' }}>
            <p>Claim your creator fees and receive BTC, ETH or USDC on their own chains. One signature, and the money never passes through us.</p>
            <div className="hero-actions">
              <ClaimJump className="btn btn-ink">Check my fees</ClaimJump>
              <a href="/docs" className="btn btn-soft">Read the docs</a>
            </div>
          </div>
        </div>
      </section>

      <section className="desk container" aria-label="Claim">
        <aside className="desk-side desk-left" id="how">
          <h2 className="side-title">One signature, three hops</h2>
          <ol className="hops">
            {HOPS.map((h, i) => (
              <li key={h.t}>
                <span className="hop-n">{i + 1}</span>
                <span>
                  <strong>{h.t}</strong> <span className="hop-where">on {h.where}</span>
                  <span className="hop-d">{h.d}</span>
                </span>
              </li>
            ))}
          </ol>
        </aside>
        <div className="desk-main">
          <Converter />
        </div>
        <aside className="desk-side desk-right">
          <h2 className="side-title">1 SOL right now</h2>
          <QuickRates />
          <a href="#coins" className="side-link">All ten coins</a>
        </aside>
      </section>

      <section id="live" className="section container" data-reveal>
        <div className="sec-head">
          <h2 className="h2">Every rewire, out in the open</h2>
          <p className="lede">Read straight from NEAR Intents. Only real swaps, wallets always hidden.</p>
        </div>
        <LiveFeed />
      </section>

      <section id="coins" className="section container" data-reveal>
        <div className="sec-head">
          <h2 className="h2">Ten coins, eight chains</h2>
          <p className="lede">Priced live by NEAR Intents. The quote in the card is the exact amount, fees included.</p>
        </div>
        <Rates />
      </section>

      <section className="section container" data-reveal>
        <div className="sec-head">
          <h2 className="h2">Cashing out, compared</h2>
          <p className="lede">What it takes to turn creator fees into another coin, the usual way and with Rewire.</p>
        </div>
        <div className="panel table-wrap">
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

      <section className="section container" data-reveal>
        <div className="sec-head">
          <h2 className="h2">Questions</h2>
          <p className="lede">More detail in the <a href="/docs" className="inline-link">docs</a>.</p>
        </div>
        <div className="panel faq">
          {FAQ.map(([q, a]) => (
            <details key={q}>
              <summary>{q}<span className="plus" aria-hidden="true" /></summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="section container" data-reveal>
        <div className="cta panel">
          <h2 className="cta-title">Your fees are sitting there.</h2>
          <p className="lede">Paste your creator wallet and see what&rsquo;s waiting. Checking is free and needs no wallet connection.</p>
          <ClaimJump className="btn btn-ink">Check my fees</ClaimJump>
        </div>
      </section>
    </>
  );
}
