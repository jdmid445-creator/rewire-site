import Converter from '@/components/Converter';
import Rates from '@/components/Rates';
import { CoinIcon } from '@/components/Brand';

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
      <section className="hero">
        <div className="container hero-inner">
          <h1>Your pump.fun fees, paid out in any coin.</h1>
          <p className="lede">Claim your creator fees and receive BTC, ETH or USDC on their own chains. One signature, and the money never passes through us.</p>
          <div className="board">
            <Side side="in" />
            <Converter />
            <Side side="out" />
          </div>
        </div>
      </section>

      <section id="how" className="section container">
        <h2 className="h2 center-text">One transaction, three hops</h2>
        <p className="lede center-text">Everything below happens from a single signature in your own wallet.</p>
        <ol className="track">
          {HOPS.map((h, i) => (
            <li key={h.t}>
              <span className="track-n num">{i + 1}</span>
              <h3>{h.t} <span className="track-where">on {h.where}</span></h3>
              <p>{h.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="coins" className="section container">
        <h2 className="h2 center-text">What 1 SOL gets you right now</h2>
        <Rates />
      </section>

      <section className="section container">
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
          <span className="wire" />
        </div>
      ))}
    </div>
  );
}
