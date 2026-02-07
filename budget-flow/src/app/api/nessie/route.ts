import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "http://api.nessieisreal.com";
const API_KEY = process.env.NESSIE_API_KEY || "";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path") || "/customers";

  try {
    const separator = path.includes("?") ? "&" : "?";
    const res = await fetch(`${BASE_URL}${path}${separator}key=${API_KEY}`);

    if (!res.ok) {
      return NextResponse.json(
        { error: `Nessie API error: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch from Nessie API", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path") || "";
  const body = await request.json();

  try {
    const separator = path.includes("?") ? "&" : "?";
    const res = await fetch(`${BASE_URL}${path}${separator}key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Nessie API error: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to post to Nessie API", details: String(error) },
      { status: 500 }
    );
  }
}
