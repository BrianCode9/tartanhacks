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
      case "budget-flow-proposal":
        systemMessage = `Propose a realistic monthly budget as JSON only. Adjust spending, add savings, merge small categories.

{"categories":[{"name":"Name","amount":1200,"color":"#6366f1","subcategories":[{"name":"Sub","amount":800}]}],"proposedIncome":5000,"rationale":[{"category":"Name","explanation":"Brief reason"}],"summary":"2 sentence budget overview"}

Rules: 4-8 categories, 1-5 subcategories each, subcategories sum to category amount, integers only, colors from ["#6366f1","#10b981","#f59e0b","#ec4899","#8b5cf6","#ef4444","#14b8a6","#3b82f6"], include Savings (10-20% of income), merge tiny categories into Other, proposedIncome = stated income. No markdown fences.`;
        break;
      case "budget-tips":
        systemMessage = `You are a friendly and expert personal financial advisor. Based on the user's spending data and planned events, provide personalized, actionable budgeting advice.

Be specific with dollar amounts and percentages. Reference their actual spending patterns.
Keep your response concise but helpful (2-4 tips max).
Use a warm, encouraging tone.

Return your response as JSON:
{
  "summary": "A 1-2 sentence personalized summary of their financial situation",
  "tips": [
    {
      "title": "Short catchy title",
      "description": "Detailed actionable advice with specific numbers",
      "priority": "high|medium|low",
      "potentialSavings": 50
    }
  ],
  "encouragement": "A motivational closing message"
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
        max_tokens: type === "budget-flow-proposal" ? 2048 : 4096,
        temperature: type === "budget-flow-proposal" ? 0.4 : 0.7,
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
