// src/app/api/leaderboard/route.ts
import { NextRequest, NextResponse } from "next/server";

type HolderItem = {
  address: { hash: string };
  balance: string; // raw (decimals) string, e.g. "1038780000000000000000"
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const contract = searchParams.get("contract");
    const limit = Number(searchParams.get("limit") ?? "50");
    const decimals = Number(searchParams.get("decimals") ?? "18");

    if (!contract) {
      return NextResponse.json(
        { error: "Missing ?contract" },
        { status: 400 }
      );
    }

    // Call your external holder API
    const apiUrl = `https://somnia-leaderboard.vercel.app/top-holders?contract=${contract}&limit=${limit}`;
    const r = await fetch(apiUrl, { cache: "no-store" });

    if (!r.ok) {
      return NextResponse.json(
        { error: `Upstream error HTTP ${r.status}` },
        { status: 502 }
      );
    }

    const json = await r.json();

    const holders = (json.holders ?? []) as HolderItem[];

    const rows = holders.map((h) => ({
      address: h.address.hash,
      balance: formatUnits(h.balance, decimals),
    }));

    return NextResponse.json(rows, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}

// Helpers
function formatUnits(raw: string, decimals: number) {
  // big-int safe decimal formatter
  const neg = raw.startsWith("-");
  const s = neg ? raw.slice(1) : raw;

  const padded = s.padStart(decimals + 1, "0");
  const int = padded.slice(0, padded.length - decimals).replace(/^0+/, "") || "0";
  const frac = padded.slice(padded.length - decimals).replace(/0+$/, "");

  const out = frac ? `${int}.${frac}` : int;
  return neg ? `-${out}` : out;
}