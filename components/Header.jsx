import Link from 'next/link';
import { SITE } from '@/lib/config';
import { Logo, XIcon } from './Brand';
import CopyCA from './CopyCA';
import ClaimJump from './ClaimJump';
import HeaderFade from './HeaderFade';

export default function Header() {
  return (
    <header className="site-header">
      <HeaderFade />
      <div className="container header-row">
        <Link href="/" className="brand" aria-label={`${SITE.name} home`}>
          <Logo size={28} />
          <span>{SITE.name}</span>
        </Link>
        <nav className="seg" aria-label="Main">
          <Link href="/#how">How it works</Link>
          <Link href="/#live">Live</Link>
          <Link href="/#coins">Coins</Link>
          <Link href="/docs">Docs</Link>
        </nav>
        <div className="header-end">
          {SITE.x && (
            <a href={SITE.x} className="icon-btn" target="_blank" rel="noopener noreferrer" aria-label={`${SITE.name} on X`}>
              <XIcon />
            </a>
          )}
          <CopyCA />
          <ClaimJump className="btn btn-ink btn-sm">Claim fees</ClaimJump>
        </div>
      </div>
    </header>
  );
}
