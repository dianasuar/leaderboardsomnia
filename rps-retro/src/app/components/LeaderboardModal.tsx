"use client";
import { useEffect, useState } from "react";

type Row = { address: string; balance: string; balanceRaw: string };

export default function LeaderboardModal({
  open,
  onClose,
  limit = 50,
}: {
  open: boolean;
  onClose: () => void;
  limit?: number;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // read contract + decimals from env
  const token = process.env.NEXT_PUBLIC_TOKEN_ADDRESS!;
  const decimals = Number(process.env.NEXT_PUBLIC_TOKEN_DECIMALS || "18");

useEffect(() => {
  if (!open) return;

  const token =
    process.env.NEXT_PUBLIC_TOKEN_ADDRESS ??
    "0x32D146ff24E2AAe2a266A872f86474C9595C0C4F"; // fallback while wiring

  const decimals = Number(process.env.NEXT_PUBLIC_TOKEN_DECIMALS ?? "18");

  (async () => {
    setLoading(true);
    setErr(null);
    try {
      const url = `/api/leaderboard?contract=${token}&limit=${limit}&decimals=${decimals}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        // keep errors short & readable
        throw new Error(`HTTP ${res.status}`);
      }
      const data: Row[] = await res.json();
      setRows(data);
    } catch (e: any) {
      setRows([]);
      setErr(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  })();
}, [open, limit]);


  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-label="Close leaderboard backdrop"
      />
      {/* modal */}
      <div className="relative z-10 w-full max-w-3xl border border-green-500/40 bg-black text-green-400 shadow-[0_0_30px_rgba(16,185,129,0.25)]">
        <div className="flex items-center justify-between border-b border-green-700/40 px-4 py-3">
          <h2 className="tracking-widest text-2xl">LEADERBOARD</h2>
          <button
            onClick={onClose}
            className="text-pink-400 hover:text-pink-300"
            aria-label="Close leaderboard"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[60vh] overflow-auto px-4 py-3">
          {loading && <div className="py-8 text-center">Loading…</div>}
          {err && <div className="py-8 text-center text-red-400">{err}</div>}

          {!loading && !err && (
            <table className="w-full text-left text-green-300/90">
              <thead className="sticky top-0 bg-black/80 border-b border-green-700/40 text-green-400">
                <tr>
                  <th className="px-2 py-2 w-16">#</th>
                  <th className="px-2 py-2">Address</th>
                  <th className="px-2 py-2 text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr
                    key={`${r.address}-${i}`}
                    className="border-b border-green-700/20 hover:bg-green-900/10"
                  >
                    <td className="px-2 py-2 text-pink-400">#{i + 1}</td>
                    <td className="px-2 py-2 font-mono">{short(r.address)}</td>
                    <td className="px-2 py-2 text-right">{r.balance}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center opacity-70">
                      No data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="border-t border-green-700/40 px-4 py-2 text-xs text-green-300/70">
          Showing top {Math.min(limit, rows.length || limit)} holders
        </div>
      </div>
    </div>
  );
}

function short(a?: string) {
  return a ? `${a.slice(0, 6)}...${a.slice(-4)}` : "-";
}