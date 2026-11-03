import Link from 'next/link';
import { SITE } from '@/lib/config';
import { Logo, XIcon } from './Brand';
import CopyCA from './CopyCA';

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-row">
        <Link href="/" className="brand" aria-label={`${SITE.name} home`}>
          <Logo />
          <span>{SITE.name}</span>
        </Link>
        <nav className="nav" aria-label="Main">
          <Link href="/#live" className="nav-link">Live</Link>
          <Link href="/#how" className="nav-link">How it works</Link>
          <Link href="/#coins" className="nav-link">Coins</Link>
          <Link href="/docs" className="nav-link">Docs</Link>
          {SITE.x && (
            <a href={SITE.x} className="icon-btn" target="_blank" rel="noopener noreferrer" aria-label={`${SITE.name} on X`}>
              <XIcon />
            </a>
          )}
          <CopyCA />
        </nav>
      </div>
    </header>
  );
}
