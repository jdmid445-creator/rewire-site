import { DESTINATIONS, MIN_LAMPORTS } from '@/lib/config';
import { CoinIcon } from '@/components/Brand';

export const metadata = { title: 'Docs' };

const NAV = [
  ['overview', 'Overview'],
  ['how', 'How a rewire works'],
  ['safety', 'What keeps it safe'],
  ['coins', 'Coins and chains'],
  ['fees', 'Fees and minimums'],
  ['splits', 'Team fee splits'],
  ['refunds', 'Refunds'],
];

export default function Docs() {
  return (
    <div className="container docs">
      <nav className="docs-nav" aria-label="Docs">
        <p>Rewire docs</p>
        {NAV.map(([id, t]) => <a key={id} href={`#${id}`}>{t}</a>)}
      </nav>
      <article className="docs-body">
        <h1 id="overview">Rewire docs</h1>
        <p>Rewire claims your pump.fun creator fees and pays them out in another coin, on its own chain, in one transaction you sign yourself. Swaps are filled by NEAR Intents.</p>

        <h2 id="how">How a rewire works</h2>
        <ol>
          <li>You paste the wallet that receives your creator fees. Rewire reads what&rsquo;s unclaimed on the bonding curve and PumpSwap.</li>
          <li>You pick a coin and the address it should land in. Rewire shows a live NEAR Intents rate.</li>
          <li>When you claim, Rewire gets a fresh quote with a one-time Solana deposit address, then builds one transaction: claim your fees, then send exactly the quoted SOL to that deposit address.</li>
          <li>You sign it in your own wallet. NEAR Intents swaps the SOL and delivers your coin. The page tracks it until it lands.</li>
        </ol>

        <h2 id="safety">What keeps it safe</h2>
        <ul>
          <li><strong>Non-custodial.</strong> Rewire never holds keys or funds. Your wallet signs every transaction.</li>
          <li><strong>Quotes are re-checked.</strong> Before building a transaction, the server reads the quote back from NEAR Intents and confirms it&rsquo;s a SOL deposit that refunds to the same wallet.</li>
          <li><strong>Never more than your fees.</strong> The transfer is capped at your unclaimed fees, so Rewire never pulls from the rest of your balance.</li>
          <li><strong>Test run first.</strong> Every transaction is simulated before your wallet sees it.</li>
          <li><strong>No fee settings touched.</strong> pump.fun allows one fee-recipient change per coin. Rewire never uses it.</li>
        </ul>

        <h2 id="coins">Coins and chains</h2>
        <ul className="docs-coins">
          {DESTINATIONS.map((d) => <li key={d.id}><CoinIcon dest={d} size={24} /> {d.symbol} <span>on {d.chain}</span></li>)}
        </ul>

        <h2 id="fees">Fees and minimums</h2>
        <p>A small Rewire fee is built into each quote and shown before you sign. You also pay normal Solana network fees. The minimum is {MIN_LAMPORTS / 1e9} SOL of unclaimed fees, since smaller amounts lose too much to network costs.</p>

        <h2 id="splits">Team fee splits</h2>
        <p>If your coin splits fees across several wallets, each person rewires their own share once it has been paid out to their wallet. Fees still sitting in the split need to be distributed on pump.fun first.</p>

        <h2 id="refunds">Refunds</h2>
        <p>If NEAR Intents can&rsquo;t complete a swap before its deadline, the SOL is refunded to the wallet that sent it. The status card on the page shows when that happens.</p>
      </article>
    </div>
  );
}
