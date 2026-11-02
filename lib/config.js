// Working name. Change it here and it changes everywhere on the site.
export const SITE = {
  name: 'Rewire',
  tagline: 'Claim your pump.fun creator fees in any coin, on any chain.',
  x: '',
  ca: '',
};

// Coins people can receive. assetId values come from NEAR Intents 1Click (/v0/tokens).
// `chain` is what the recipient address must belong to.
// icon: /public/coins, badge: small chain mark on tokens that live on several chains.
export const DESTINATIONS = [
  { id: 'btc', label: 'Bitcoin', symbol: 'BTC', chain: 'Bitcoin', icon: 'btc', assetId: 'nep141:btc.omft.near', addr: 'btc' },
  { id: 'eth', label: 'Ether', symbol: 'ETH', chain: 'Ethereum', icon: 'eth', assetId: 'nep141:eth.omft.near', addr: 'evm' },
  { id: 'usdc-base', label: 'USDC on Base', symbol: 'USDC', chain: 'Base', icon: 'usdc', badge: 'base', assetId: 'nep141:base-0x833589fcd6edb6e08f4c7c32d4f71b54bda02913.omft.near', addr: 'evm' },
  { id: 'usdc-sol', label: 'USDC on Solana', symbol: 'USDC', chain: 'Solana', icon: 'usdc', badge: 'sol', assetId: 'nep141:sol-5ce3bf3a31af18be40ba30f721101b4341690186.omft.near', addr: 'sol' },
  { id: 'usdc-eth', label: 'USDC on Ethereum', symbol: 'USDC', chain: 'Ethereum', icon: 'usdc', badge: 'eth', assetId: 'nep141:eth-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.omft.near', addr: 'evm' },
  { id: 'usdc-arb', label: 'USDC on Arbitrum', symbol: 'USDC', chain: 'Arbitrum', icon: 'usdc', badge: 'arb', assetId: 'nep141:arb-0xaf88d065e77c8cc2239327c5edb3a432268e5831.omft.near', addr: 'evm' },
  { id: 'usdt-eth', label: 'USDT on Ethereum', symbol: 'USDT', chain: 'Ethereum', icon: 'usdt', badge: 'eth', assetId: 'nep141:eth-0xdac17f958d2ee523a2206206994597c13d831ec7.omft.near', addr: 'evm' },
  { id: 'zec', label: 'Zcash', symbol: 'ZEC', chain: 'Zcash', icon: 'zec', assetId: 'nep141:zec.omft.near', addr: 'zec' },
  { id: 'doge', label: 'Dogecoin', symbol: 'DOGE', chain: 'Dogecoin', icon: 'doge', assetId: 'nep141:doge.omft.near', addr: 'doge' },
  { id: 'near', label: 'NEAR', symbol: 'NEAR', chain: 'NEAR', icon: 'near', assetId: 'nep141:wrap.near', addr: 'near' },
];

export const SOL_ASSET = 'nep141:sol.omft.near';
export const MIN_LAMPORTS = 20_000_000; // 0.02 SOL. Below this, network costs eat too much of the payout.
