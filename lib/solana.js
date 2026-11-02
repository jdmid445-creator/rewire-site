import { Connection } from '@solana/web3.js';
import { OnlinePumpSdk } from '@pump-fun/pump-sdk';

let conn;
export function connection() {
  if (!conn) {
    const url = process.env.SOLANA_RPC_URL;
    if (!url) throw new Error('SOLANA_RPC_URL is not set');
    conn = new Connection(url, 'confirmed');
  }
  return conn;
}

export function pumpSdk() {
  return new OnlinePumpSdk(connection());
}

// Unclaimed SOL creator fees across the bonding curve program and PumpSwap, in lamports.
export async function unclaimedLamports(creator) {
  const bn = await pumpSdk().getCreatorVaultBalanceBothPrograms(creator);
  return BigInt(bn.toString());
}
