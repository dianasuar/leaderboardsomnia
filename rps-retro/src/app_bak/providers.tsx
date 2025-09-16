"use client";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { custom } from "viem";
import { injected, metaMask } from "wagmi/connectors";   // ⬅️ add this
import { somnia } from "../lib/somnia";


// chain select (abhi ke liye Sepolia)
const CHAIN = sepolia;

// RPC fallback agar wallet na ho
const RPC_URL = "https://api.infra.mainnet.somnia.network";

function getTransport() {
  if (typeof window !== "undefined" && (window as any).ethereum) {
    return { [CHAIN.id]: custom((window as any).ethereum) } as const; // native first
  }
  return { [CHAIN.id]: http(RPC_URL) } as const; // fallback
}

const config = createConfig({
  chains: [CHAIN],
  transports: getTransport(),
    connectors: [
    metaMask({ shimDisconnect: true }),
    injected({ shimDisconnect: true }), 
    ],
});

export default function Providers({ children }: { children: ReactNode }) {
  const [qc] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}