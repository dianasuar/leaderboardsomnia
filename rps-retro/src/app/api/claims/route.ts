import { NextRequest, NextResponse } from 'next/server';

type Claims = { gamesPlayed: number };

// simple in-memory store (good for dev)
const memory = new Map<string, Claims>();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = (searchParams.get('address') || '').toLowerCase();
  const claimsData = memory.get(address) ?? { gamesPlayed: 0 };
  return NextResponse.json({ ok: true, claimsData }, { status: 200 });
}

export async function POST(req: NextRequest) {
  let body: any = null;
  try { body = await req.json(); } catch {}
  const address = String(body?.address || '').toLowerCase();
  const gamesPlayed = Number(body?.gamesPlayed ?? 0);
  if (!address) {
    return NextResponse.json({ ok: false, error: 'address required' }, { status: 400 });
  }
  memory.set(address, { gamesPlayed: Math.max(0, gamesPlayed|0) });
  return NextResponse.json({ ok: true }, { status: 200 });
}