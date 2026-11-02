import { DESTINATIONS } from '@/lib/config';

// Logo: two wires that cross once and come out the other side.
export function Logo({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#F2F4F7" />
      <path d="M7 11.5h5.5c4 0 3 9 7 9H25" stroke="#0A0D12" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M7 20.5h5.5c4 0 3-9 7-9H25" stroke="#2E9BFF" strokeWidth="2.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function CoinIcon({ dest, size = 28 }) {
  const d = typeof dest === 'string' ? DESTINATIONS.find((x) => x.id === dest) : dest;
  if (!d) return null;
  return (
    <span className="coin" style={{ width: size, height: size }}>
      <img src={`/coins/${d.icon}.svg`} alt="" width={size} height={size} />
      {d.badge && <img className="coin-badge" src={`/chains/${d.badge}.svg`} alt="" width={Math.round(size * 0.48)} height={Math.round(size * 0.48)} />}
    </span>
  );
}

export function XIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
      <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
