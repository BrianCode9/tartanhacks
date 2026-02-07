import { NextRequest, NextResponse } from "next/server";

const DEDALUS_URL = process.env.DEDALUS_API_URL || "https://api.dedaluslabs.ai/v1";
const DEDALUS_KEY = process.env.DEDALUS_API_KEY || "";

export async function POST(request: NextRequest) {
  try {
    const { prompt, type } = await request.json();

    let systemMessage = "";
    switch (type) {
      case "budget-analysis":
        systemMessage = `You are a financial advisor AI. Analyze the user's transaction data and provide budget insights.
Return your response as JSON with this structure:
{
  "categories": [
    { "name": "Category Name", "amount": 123.45, "subcategories": [{ "name": "Sub", "amount": 50 }] }
  ],
  "totalIncome": 5000,
  "totalSpending": 3500,
  "insights": ["insight 1", "insight 2"],
  "strategies": [
    { "id": "s1", "type": "goal|strategy|suggestion|warning", "label": "Title", "description": "Details", "amount": 100 }
  ]
}`;
        break;
      case "strategy":
        systemMessage = `You are a financial strategist AI. Given the user's budget summary, generate a workflow of budget strategies,
future purchasing recommendations, and money-saving suggestions. Return as JSON:
{
  "nodes": [
    { "id": "n1", "type": "income|goal|strategy|suggestion|warning", "label": "Title", "description": "Details", "amount": 100 }
  ],
  "edges": [
    { "source": "n1", "target": "n2", "label": "connection reason" }
  ]
}`;
        break;
      default:
        systemMessage = "You are a helpful financial advisor.";
    }

    const res = await fetch(`${DEDALUS_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEDALUS_KEY}`,
      },
      body: JSON.stringify({
        model: "anthropic/claude-sonnet-4-5",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: prompt },
        ],
        max_tokens: 4096,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: `Dedalus API error: ${res.status}`, details: errorText },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({
      response: data.choices[0].message.content,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to query AI", details: String(error) },
      { status: 500 }
    );
  }
}
