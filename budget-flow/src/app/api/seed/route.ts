import { NextResponse } from "next/server";
import { seedNessieData } from "@/lib/nessie-seed";

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
      message: "Seed data created successfully",
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to seed data", details: String(error) },
      { status: 500 }
    );
  }
}
