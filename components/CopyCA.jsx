'use client';

import { useState } from 'react';
import { SITE } from '@/lib/config';

export default function CopyCA({ full = false }) {
  const [copied, setCopied] = useState(false);
  if (!SITE.ca) return <span className="ca-pill is-soon">CA: soon</span>;
  const short = `${SITE.ca.slice(0, 4)}...${SITE.ca.slice(-4)}`;
  async function copy() {
    try { await navigator.clipboard.writeText(SITE.ca); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch {}
  }
  return (
    <button type="button" className="ca-pill" onClick={copy} aria-label="Copy contract address">
      <span className="muted">CA:</span> {copied ? 'Copied' : full ? SITE.ca : short}
    </button>
  );
}
