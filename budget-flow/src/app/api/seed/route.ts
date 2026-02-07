import { NextResponse } from "next/server";
import { seedNessieData, getDefaultCredentials } from "@/lib/nessie-seed";

const API_KEY = process.env.NESSIE_API_KEY || "";

export async function POST() {
  if (!API_KEY) {
    return NextResponse.json(
      { error: "NESSIE_API_KEY is not configured" },
      { status: 500 }
    );
  }

  try {
    const result = await seedNessieData(API_KEY);
    return NextResponse.json({
      message: `Seeded ${result.users.length} users with ${result.totalPurchases} total purchases`,
      users: result.users,
      merchantCount: result.merchantIds.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to seed data", details: String(error) },
      { status: 500 }
    );
  }
}

/** GET returns the default credentials list (no Nessie calls needed) */
export async function GET() {
  const credentials = getDefaultCredentials();
  return NextResponse.json({ credentials });
}
