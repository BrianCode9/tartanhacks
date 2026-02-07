const DEDALUS_URL = process.env.DEDALUS_API_URL || "https://api.dedaluslabs.ai/v1";
const DEDALUS_KEY = process.env.DEDALUS_API_KEY || "";

interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function queryAI(messages: AIMessage[], model = process.env.DEDALUS_MODEL_ID || "anthropic/claude-4.5-sonnet"): Promise<string> {
  const res = await fetch(`${DEDALUS_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEDALUS_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 4096,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Dedalus API error: ${res.status} - ${error}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

export async function analyzeBudget(transactions: string): Promise<string> {
  return queryAI([
    {
      role: "system",
      content: `You are a financial advisor AI. Analyze the user's transaction data and provide budget insights.
Return your response as JSON with this structure:
{
  "categories": [
    { "name": "Category Name", "amount": 123.45, "subcategories": [{ "name": "Sub", "amount": 50 }] }
  ],
  "totalIncome": 5000,
  "totalSpending": 3500,
  "insights": ["insight 1", "insight 2"],
  "strategies": [
    { "id": "s1", "type": "mission|goal|strategy|suggestion|warning", "label": "Title", "description": "Details", "amount": 100 }
  ]
}`,
    },
    {
      role: "user",
      content: `Analyze these transactions and create a budget breakdown:\n${transactions}`,
    },
  ]);
}

export async function generateStrategies(budgetSummary: string): Promise<string> {
  return queryAI([
    {
      role: "system",
      content: `You are a visionary financial strategist AI. Your goal is to define a "Financial Mission" for the user based on their spending habits and income, and then map out strategies to achieve it.

First, identify a single, overarching "Financial Mission" (e.g., "Achieve Financial Independence," "Maximize Travel Experiences," "Debt-Free Living").
Then, generate goals, strategies, and specific actions that support this mission.

Return as JSON:
{
  "nodes": [
    { "id": "n1", "type": "mission|income|goal|strategy|suggestion|warning", "label": "Title", "description": "Details", "amount": 100 }
  ],
  "edges": [
    { "source": "n1", "target": "n2", "label": "connection reason" }
  ]
}

Ensure the 'mission' node is the central root of the strategy graph.`,
    },
    {
      role: "user",
      content: budgetSummary,
    },
  ]);
}
