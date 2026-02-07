const DEDALUS_URL = process.env.DEDALUS_API_URL || "https://api.dedaluslabs.ai/v1";
const DEDALUS_KEY = process.env.DEDALUS_API_KEY || "";

interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function queryAI(messages: AIMessage[], model = "anthropic/claude-sonnet-4-5"): Promise<string> {
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
    { "id": "s1", "type": "goal|strategy|suggestion|warning", "label": "Title", "description": "Details", "amount": 100 }
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
      content: `You are a financial strategist AI. Given the user's budget summary, generate a workflow of budget strategies,
future purchasing recommendations, and money-saving suggestions. Return as JSON:
{
  "nodes": [
    { "id": "n1", "type": "income|goal|strategy|suggestion|warning", "label": "Title", "description": "Details", "amount": 100 }
  ],
  "edges": [
    { "source": "n1", "target": "n2", "label": "connection reason" }
  ]
}`,
    },
    {
      role: "user",
      content: budgetSummary,
    },
  ]);
}
