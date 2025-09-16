"use client";

import { useMemo, useState } from "react";
import { useAccount, useBalance, useChainId, useConnect, useDisconnect } from "wagmi";

function short(a?: string) {
  return a ? `${a.slice(0, 6)}...${a.slice(-4)}` : "-";
}

export default function Page() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: bal } = useBalance({ address, query: { enabled: isConnected } });

  const { connect, connectors, status: connectStatus } = useConnect();
  const { disconnect } = useDisconnect();

  // Choose injected connector safely (MetaMask/Rabby etc.)
  const preferredConnector = useMemo(() => {
  return (
    connectors.find((c) => c.id === "metaMask") ||   // prefer MetaMask
    connectors.find((c) => c.id === "injected") ||   // else generic injected
    connectors[0]                                    // last fallback
  );
}, [connectors]);

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-green-400 flex items-center justify-center">
      <div className="w-full max-w-3xl p-6">
        {/* Title */}
        <div className="text-center mb-10">
          <div className="text-6xl font-black tracking-widest select-none">
            <span className="text-green-500">RPS</span>
            <span className="mx-4 text-pink-500">CORE</span>
          </div>
          <p className="mt-2 text-green-300/80 tracking-[.3em] uppercase">
            Retro Futurism in Digital Form
          </p>
        </div>

        {/* Main buttons */}
        <div className="space-y-4">
          {/* Wallet button */}
          <div className="relative">
            {!isConnected ? (
              <button
                className="w-full bg-black border border-green-500/60 py-3 uppercase hover:bg-green-950"
                onClick={() => connect({ connector: preferredConnector })}
                disabled={connectStatus === "pending"}
              >
                {connectStatus === "pending" ? "CONNECTING..." : "CONNECT WALLET"}
              </button>
            ) : (
              <>
                <button
                  className="w-full bg-black border border-green-500/60 py-3 uppercase hover:bg-green-950 flex items-center justify-between px-4"
                  onClick={() => setMenuOpen((v) => !v)}
                >
                  <span className="opacity-80">{short(address)}</span>
                  <span className="text-xs opacity-60">▼</span>
                </button>
                {menuOpen && (
                  <div className="absolute left-0 right-0 z-10 bg-black border border-green-600/40 mt-1">
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-green-900/30"
                      onClick={() => {
                        if (address) navigator.clipboard?.writeText(address);
                        setMenuOpen(false);
                      }}
                    >
                      Copy Address
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-green-900/30"
                      onClick={() => {
                        disconnect();
                        setMenuOpen(false);
                      }}
                    >
                      Disconnect
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Other buttons (still placeholders) */}
          <button className="w-full bg-black border border-green-500/60 py-3 uppercase">
            Mint Cards
          </button>
          <button className="w-full bg-black border border-green-500/60 py-3 uppercase">
            Leaderboards
          </button>
          <button
            className="w-full bg-black border border-green-500/60 py-3 uppercase"
            onClick={() => alert("TODO: hook to your game route/loader")}
          >
            Start Game
          </button>
        </div>

        {/* System panel */}
        <div className="mt-8 text-center text-green-500/80">
          <div className="inline-block px-4 py-2 border border-green-500/40">SYSTEM INFO</div>
          <div className="mt-2 text-sm space-y-1">
            <div>Chain ID: {chainId ?? "-"}</div>
            <div>
              Wallet Balance:{" "}
              {bal ? `${Number(bal.value) / 10 ** bal.decimals} ${bal.symbol}` : "-"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}