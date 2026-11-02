import Converter from '@/components/Converter';
import { SITE, DESTINATIONS } from '@/lib/config';

export default function Home() {
  return (
    <>
      <header className="top wrap">
        <a className="brand" href="/" aria-label={`${SITE.name} home`}>
          <Mark />
          <span>{SITE.name}</span>
        </a>
        <nav className="top-links">
          <a href="#how">How it works</a>
          {SITE.x && <a href={SITE.x} target="_blank" rel="noreferrer">X</a>}
        </nav>
      </header>

      <main>
        <section className="hero wrap">
          <div className="hero-copy">
            <h1>Your pump.fun fees, paid out in any coin.</h1>
            <p className="lede">
              Paste your creator wallet to see what you have waiting. Pick BTC, ETH, USDC or another coin, and one
              transaction claims your fees and sends them to any chain.
            </p>
            <ul className="facts">
              <li>Nothing to set up on pump.fun</li>
              <li>Your fees never touch our wallets</li>
              <li>Swaps run on NEAR Intents</li>
            </ul>
          </div>
          <Converter />
        </section>

        <section id="how" className="how wrap">
          <h2>How it works</h2>
          <ol className="steps">
            <li>
              <h3>Check your fees</h3>
              <p>Paste the wallet that receives your creator fees. We read what&rsquo;s unclaimed on the bonding curve and PumpSwap.</p>
            </li>
            <li>
              <h3>Pick a coin and address</h3>
              <p>Choose what you want and where it should land. You see the live rate before you sign anything.</p>
            </li>
            <li>
              <h3>Sign once</h3>
              <p>Your wallet signs one transaction that claims the fees and sends them into a NEAR Intents swap. Coins arrive in a few minutes.</p>
            </li>
          </ol>
        </section>

        <section className="coins wrap" aria-labelledby="coins-h">
          <h2 id="coins-h">What you can receive</h2>
          <ul className="coin-list">
            {DESTINATIONS.map((d) => (
              <li key={d.id}><strong>{d.symbol}</strong><span>{d.label.replace(`${d.symbol} on `, '')}</span></li>
            ))}
          </ul>
        </section>

        <section className="faq wrap">
          <h2>Questions</h2>
          <details>
            <summary>Do you ever hold my fees?</summary>
            <p>No. The transaction moves fees from pump.fun to your wallet and straight into a one-time NEAR Intents deposit address that only pays out to the address you entered. If the swap can&rsquo;t finish, NEAR Intents refunds the SOL to your wallet.</p>
          </details>
          <details>
            <summary>Do I have to change my fee settings on pump.fun?</summary>
            <p>No. pump.fun only lets you change fee recipients once per coin, so we don&rsquo;t ask you to. Your fees keep going to your wallet, and you convert them whenever you want.</p>
          </details>
          <details>
            <summary>What does it cost?</summary>
            <p>A small swap fee is built into the quote, and you pay normal Solana network fees. The amount you see before signing is the amount the quote is for.</p>
          </details>
          <details>
            <summary>My fees are split with a team. Does that work?</summary>
            <p>Paste your own wallet. If your share has been paid out to it, it shows up. Fees still waiting in a split need to be distributed on pump.fun first.</p>
          </details>
        </section>
      </main>

      <footer className="foot wrap">
        <span>{SITE.name}</span>
        {SITE.ca ? <span className="ca">CA: {SITE.ca}</span> : <span className="muted">Not affiliated with pump.fun or NEAR.</span>}
      </footer>
    </>
  );
}

function Mark() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
      <rect width="26" height="26" rx="8" fill="var(--ink)" />
      <path d="M7 17c3 0 4-8 7-8h5" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <circle cx="19" cy="9" r="2.4" fill="var(--signal)" />
    </svg>
  );
}
