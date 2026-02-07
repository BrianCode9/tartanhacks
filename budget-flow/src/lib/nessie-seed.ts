const BASE_URL = "http://api.nessieisreal.com";

interface SeedResult {
  customerId: string;
  accountId: string;
  merchantIds: string[];
  purchaseCount: number;
}

async function nessiePost<T>(path: string, body: object, apiKey: string): Promise<T> {
  const separator = path.includes("?") ? "&" : "?";
  const res = await fetch(`${BASE_URL}${path}${separator}key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Nessie POST ${path} failed: ${res.status} - ${text}`);
  }
  return res.json();
}

async function nessieGet<T>(path: string, apiKey: string): Promise<T> {
  const separator = path.includes("?") ? "&" : "?";
  const res = await fetch(`${BASE_URL}${path}${separator}key=${apiKey}`);
  if (!res.ok) throw new Error(`Nessie GET ${path} failed: ${res.status}`);
  return res.json();
}

const MERCHANTS_TO_CREATE = [
  { name: "Whole Foods Market", category: ["grocery"], address: { street_number: "100", street_name: "Main St", city: "Pittsburgh", state: "PA", zip: "15213" }, geocode: { lat: 40.4406, lng: -79.9959 } },
  { name: "Starbucks Coffee", category: ["coffee"], address: { street_number: "200", street_name: "Forbes Ave", city: "Pittsburgh", state: "PA", zip: "15213" }, geocode: { lat: 40.4416, lng: -79.9449 } },
  { name: "Shell Gas Station", category: ["gas"], address: { street_number: "300", street_name: "Fifth Ave", city: "Pittsburgh", state: "PA", zip: "15213" }, geocode: { lat: 40.4426, lng: -79.9549 } },
  { name: "Amazon", category: ["shopping"], address: { street_number: "410", street_name: "Terry Ave", city: "Seattle", state: "WA", zip: "98109" }, geocode: { lat: 47.6222, lng: -122.3366 } },
  { name: "Netflix", category: ["streaming"], address: { street_number: "100", street_name: "Winchester Cir", city: "Los Gatos", state: "CA", zip: "95032" }, geocode: { lat: 37.2529, lng: -121.9547 } },
  { name: "Spotify", category: ["streaming"], address: { street_number: "4", street_name: "World Trade Center", city: "New York", state: "NY", zip: "10007" }, geocode: { lat: 40.7128, lng: -74.0060 } },
  { name: "Chipotle", category: ["restaurant"], address: { street_number: "500", street_name: "Forbes Ave", city: "Pittsburgh", state: "PA", zip: "15213" }, geocode: { lat: 40.4436, lng: -79.9559 } },
  { name: "Target", category: ["shopping"], address: { street_number: "600", street_name: "Penn Ave", city: "Pittsburgh", state: "PA", zip: "15222" }, geocode: { lat: 40.4446, lng: -79.9969 } },
  { name: "CVS Pharmacy", category: ["pharmacy"], address: { street_number: "700", street_name: "Murray Ave", city: "Pittsburgh", state: "PA", zip: "15217" }, geocode: { lat: 40.4316, lng: -79.9249 } },
  { name: "Planet Fitness", category: ["fitness"], address: { street_number: "800", street_name: "Walnut St", city: "Pittsburgh", state: "PA", zip: "15232" }, geocode: { lat: 40.4516, lng: -79.9349 } },
  { name: "Uber", category: ["transportation"], address: { street_number: "1455", street_name: "Market St", city: "San Francisco", state: "CA", zip: "94103" }, geocode: { lat: 37.7749, lng: -122.4194 } },
  { name: "Comcast Xfinity", category: ["utilities"], address: { street_number: "1701", street_name: "JFK Blvd", city: "Philadelphia", state: "PA", zip: "19103" }, geocode: { lat: 39.9526, lng: -75.1652 } },
];

// Purchases to create: merchant index, amount, days ago, description
const PURCHASES_TO_CREATE = [
  { merchantIdx: 0, amount: 85.32, daysAgo: 2, desc: "Weekly groceries" },
  { merchantIdx: 0, amount: 62.18, daysAgo: 9, desc: "Groceries" },
  { merchantIdx: 0, amount: 94.50, daysAgo: 16, desc: "Weekly groceries" },
  { merchantIdx: 0, amount: 71.44, daysAgo: 23, desc: "Groceries" },
  { merchantIdx: 1, amount: 5.75, daysAgo: 1, desc: "Latte" },
  { merchantIdx: 1, amount: 6.25, daysAgo: 3, desc: "Cold brew" },
  { merchantIdx: 1, amount: 5.75, daysAgo: 5, desc: "Latte" },
  { merchantIdx: 1, amount: 4.95, daysAgo: 8, desc: "Drip coffee" },
  { merchantIdx: 1, amount: 6.25, daysAgo: 12, desc: "Cold brew" },
  { merchantIdx: 1, amount: 5.75, daysAgo: 15, desc: "Latte" },
  { merchantIdx: 2, amount: 42.50, daysAgo: 4, desc: "Gas fill-up" },
  { merchantIdx: 2, amount: 38.75, daysAgo: 14, desc: "Gas fill-up" },
  { merchantIdx: 2, amount: 45.20, daysAgo: 25, desc: "Gas fill-up" },
  { merchantIdx: 3, amount: 29.99, daysAgo: 6, desc: "Household items" },
  { merchantIdx: 3, amount: 149.99, daysAgo: 12, desc: "Electronics" },
  { merchantIdx: 3, amount: 24.95, daysAgo: 20, desc: "Books" },
  { merchantIdx: 4, amount: 17.99, daysAgo: 1, desc: "Monthly subscription" },
  { merchantIdx: 5, amount: 14.99, daysAgo: 1, desc: "Monthly subscription" },
  { merchantIdx: 6, amount: 11.50, daysAgo: 3, desc: "Burrito bowl" },
  { merchantIdx: 6, amount: 12.75, daysAgo: 7, desc: "Burrito bowl + guac" },
  { merchantIdx: 6, amount: 11.50, daysAgo: 14, desc: "Burrito bowl" },
  { merchantIdx: 6, amount: 13.25, daysAgo: 21, desc: "Bowl + chips" },
  { merchantIdx: 7, amount: 67.43, daysAgo: 5, desc: "Clothing" },
  { merchantIdx: 7, amount: 32.99, daysAgo: 18, desc: "Home goods" },
  { merchantIdx: 8, amount: 18.50, daysAgo: 10, desc: "Prescriptions" },
  { merchantIdx: 8, amount: 12.99, daysAgo: 22, desc: "OTC medicine" },
  { merchantIdx: 9, amount: 24.99, daysAgo: 1, desc: "Monthly membership" },
  { merchantIdx: 10, amount: 18.45, daysAgo: 2, desc: "Ride to airport" },
  { merchantIdx: 10, amount: 12.30, daysAgo: 11, desc: "Ride downtown" },
  { merchantIdx: 11, amount: 89.99, daysAgo: 1, desc: "Internet bill" },
];

function formatDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  // Nessie expects MM-DD-YYYY
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
}

export async function seedNessieData(apiKey: string): Promise<SeedResult> {
  // Check if data already exists
  const existingCustomers = await nessieGet<{ _id: string }[]>("/customers", apiKey);
  if (existingCustomers && existingCustomers.length > 0) {
    // Check if first customer has accounts with purchases
    const customerId = existingCustomers[0]._id;
    const accounts = await nessieGet<{ _id: string }[]>(
      `/customers/${customerId}/accounts`,
      apiKey
    );
    if (accounts && accounts.length > 0) {
      const purchases = await nessieGet<{ _id: string }[]>(
        `/accounts/${accounts[0]._id}/purchases`,
        apiKey
      );
      if (purchases && purchases.length > 0) {
        return {
          customerId,
          accountId: accounts[0]._id,
          merchantIds: [],
          purchaseCount: purchases.length,
        };
      }
    }
  }

  // 1. Create customer
  const customerResult = await nessiePost<{ objectCreated: { _id: string } }>(
    "/customers",
    {
      first_name: "Alex",
      last_name: "Demo",
      address: {
        street_number: "123",
        street_name: "Craig St",
        city: "Pittsburgh",
        state: "PA",
        zip: "15213",
      },
    },
    apiKey
  );
  const customerId = customerResult.objectCreated._id;

  // 2. Create checking account
  const accountResult = await nessiePost<{ objectCreated: { _id: string } }>(
    `/customers/${customerId}/accounts`,
    {
      type: "Checking",
      nickname: "Main Checking",
      rewards: 0,
      balance: 5000,
    },
    apiKey
  );
  const accountId = accountResult.objectCreated._id;

  // 3. Create merchants
  const merchantIds: string[] = [];
  for (const merchant of MERCHANTS_TO_CREATE) {
    const result = await nessiePost<{ objectCreated: { _id: string } }>(
      "/merchants",
      merchant,
      apiKey
    );
    merchantIds.push(result.objectCreated._id);
  }

  // 4. Create purchases
  let purchaseCount = 0;
  for (const purchase of PURCHASES_TO_CREATE) {
    await nessiePost(
      `/accounts/${accountId}/purchases`,
      {
        merchant_id: merchantIds[purchase.merchantIdx],
        medium: "balance",
        purchase_date: formatDate(purchase.daysAgo),
        amount: purchase.amount,
        description: purchase.desc,
        status: "completed",
      },
      apiKey
    );
    purchaseCount++;
  }

  return { customerId, accountId, merchantIds, purchaseCount };
}
