import { defineChain } from 'viem';

function envNum(name: string, fallback: number) {
  const v = process.env[name];
  if (!v) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

const SOMNIA_CHAIN_ID = envNum('NEXT_PUBLIC_SOMNIA_CHAIN_ID', 5031);
const SOMNIA_NAME = process.env.NEXT_PUBLIC_SOMNIA_NAME ?? 'Somnia';
const SOMNIA_RPC = process.env.NEXT_PUBLIC_SOMNIA_RPC ?? 'https://api.infra.mainnet.somnia.network';
const SOMNIA_SYMBOL = process.env.NEXT_PUBLIC_SOMNIA_CURRENCY_SYMBOL ?? 'SOM';
const SOMNIA_EXPLORER_NAME = process.env.NEXT_PUBLIC_SOMNIA_EXPLORER_NAME ?? 'SomniaScan';
const SOMNIA_EXPLORER_URL = process.env.NEXT_PUBLIC_SOMNIA_EXPLORER_URL ?? 'https://explorer.somnia.w3us.site';

export const somnia = defineChain({
  id: SOMNIA_CHAIN_ID,
  name: SOMNIA_NAME,
  nativeCurrency: { name: SOMNIA_SYMBOL, symbol: SOMNIA_SYMBOL, decimals: 18 },
  rpcUrls: {
    default: { http: [SOMNIA_RPC] },
    public: { http: [SOMNIA_RPC] },
  },
  blockExplorers: {
    default: { name: SOMNIA_EXPLORER_NAME, url: SOMNIA_EXPLORER_URL },
  },
});