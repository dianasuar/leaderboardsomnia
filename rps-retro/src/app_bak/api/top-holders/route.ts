export const dynamic = "force-dynamic";

// Mock response abhi ke liye (baad me real indexer se replace karenge)
export async function GET() {
  const rows = [
    { address: "0x1242124212421242124212421242124212421242", balance: "1067830000000000000000" },
    { address: "0x1230000000000000000000000000000000000123", balance: "43316000000000000000" },
    { address: "0xeb8b00000000000000000000000000000000710d", balance: "30000000000000000000" }
  ];
  return Response.json(rows);
}