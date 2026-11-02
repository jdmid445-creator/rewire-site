import { PublicKey } from '@solana/web3.js';
import { DESTINATIONS } from './config';

export function solAddress(s) {
  if (typeof s !== 'string') return null;
  const v = s.trim();
  if (v.length < 32 || v.length > 44) return null;
  try {
    const k = new PublicKey(v);
    return k.toBase58() === v ? k : null;
  } catch {
    return null;
  }
}

const RULES = {
  evm: /^0x[a-fA-F0-9]{40}$/,
  btc: /^(bc1[02-9ac-hj-np-z]{11,71}|[13][1-9A-HJ-NP-Za-km-z]{25,34})$/,
  zec: /^(t1|t3)[1-9A-HJ-NP-Za-km-z]{33}$/,
  doge: /^D[1-9A-HJ-NP-Za-km-z]{25,34}$/,
  near: /^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$|^[a-f0-9]{64}$/,
};

export function destination(id) {
  return DESTINATIONS.find((d) => d.id === id) || null;
}

export function recipientOk(dest, address) {
  if (!dest || typeof address !== 'string') return false;
  const a = address.trim();
  if (dest.addr === 'sol') return !!solAddress(a);
  const rule = RULES[dest.addr];
  return rule ? rule.test(a) && a.length <= 100 : false;
}
