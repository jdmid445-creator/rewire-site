import Link from 'next/link';
import { SITE } from '@/lib/config';
import { Logo } from './Brand';
import CopyCA from './CopyCA';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-row">
        <span className="brand small-brand"><Logo size={24} /> {SITE.name}</span>
        <nav className="footer-links" aria-label="Footer">
          <Link href="/docs">Docs</Link>
          {SITE.x && <a href={SITE.x} target="_blank" rel="noopener noreferrer">X</a>}
          <CopyCA full />
        </nav>
      </div>
      <p className="container fine-print">Swaps run on NEAR Intents. Not affiliated with pump.fun or NEAR. Not financial advice.</p>
    </footer>
  );
}
