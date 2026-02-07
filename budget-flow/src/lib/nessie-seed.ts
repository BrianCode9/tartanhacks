const BASE_URL = "http://api.nessieisreal.com";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SeededUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  customerId: string;
  accountId: string;
  balance: number;
  purchaseCount: number;
}

export interface SeedResult {
  users: SeededUser[];
  merchantIds: string[];
  totalPurchases: number;
}

// ─── Nessie helpers ──────────────────────────────────────────────────────────

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

// ─── 20 Demo Users ──────────────────────────────────────────────────────────

const USERS = [
  { first: "Alex", last: "Johnson", street_number: "123", street_name: "Craig St", city: "Pittsburgh", state: "PA", zip: "15213", balance: 5000 },
  { first: "Jordan", last: "Smith", street_number: "456", street_name: "Forbes Ave", city: "Pittsburgh", state: "PA", zip: "15213", balance: 7500 },
  { first: "Taylor", last: "Williams", street_number: "789", street_name: "Fifth Ave", city: "Pittsburgh", state: "PA", zip: "15213", balance: 3200 },
  { first: "Morgan", last: "Brown", street_number: "101", street_name: "Murray Ave", city: "Pittsburgh", state: "PA", zip: "15217", balance: 6100 },
  { first: "Casey", last: "Davis", street_number: "202", street_name: "Walnut St", city: "Pittsburgh", state: "PA", zip: "15232", balance: 4800 },
  { first: "Riley", last: "Garcia", street_number: "303", street_name: "Penn Ave", city: "Pittsburgh", state: "PA", zip: "15222", balance: 9200 },
  { first: "Avery", last: "Martinez", street_number: "404", street_name: "Liberty Ave", city: "Pittsburgh", state: "PA", zip: "15224", balance: 2800 },
  { first: "Quinn", last: "Anderson", street_number: "505", street_name: "Butler St", city: "Pittsburgh", state: "PA", zip: "15201", balance: 5500 },
  { first: "Drew", last: "Thomas", street_number: "606", street_name: "Carson St", city: "Pittsburgh", state: "PA", zip: "15203", balance: 8000 },
  { first: "Jamie", last: "Jackson", street_number: "707", street_name: "Baum Blvd", city: "Pittsburgh", state: "PA", zip: "15206", balance: 4200 },
  { first: "Sam", last: "White", street_number: "808", street_name: "Centre Ave", city: "Pittsburgh", state: "PA", zip: "15219", balance: 6700 },
  { first: "Charlie", last: "Harris", street_number: "909", street_name: "Ellsworth Ave", city: "Pittsburgh", state: "PA", zip: "15213", balance: 3500 },
  { first: "Parker", last: "Clark", street_number: "110", street_name: "Atwood St", city: "Pittsburgh", state: "PA", zip: "15213", balance: 5800 },
  { first: "Dakota", last: "Lewis", street_number: "220", street_name: "Bigelow Blvd", city: "Pittsburgh", state: "PA", zip: "15213", balance: 7000 },
  { first: "Reese", last: "Robinson", street_number: "330", street_name: "Negley Ave", city: "Pittsburgh", state: "PA", zip: "15232", balance: 4500 },
  { first: "Skyler", last: "Walker", street_number: "440", street_name: "Highland Ave", city: "Pittsburgh", state: "PA", zip: "15206", balance: 6300 },
  { first: "Emery", last: "Young", street_number: "550", street_name: "Shady Ave", city: "Pittsburgh", state: "PA", zip: "15232", balance: 3800 },
  { first: "Rowan", last: "King", street_number: "660", street_name: "Smithfield St", city: "Pittsburgh", state: "PA", zip: "15222", balance: 9500 },
  { first: "Sage", last: "Wright", street_number: "770", street_name: "Grant St", city: "Pittsburgh", state: "PA", zip: "15219", balance: 5200 },
  { first: "Finley", last: "Scott", street_number: "880", street_name: "Wood St", city: "Pittsburgh", state: "PA", zip: "15222", balance: 4100 },
];

// ─── Merchants ──────────────────────────────────────────────────────────────

const MERCHANTS = [
  { name: "Whole Foods Market", category: ["grocery"], address: { street_number: "100", street_name: "Main St", city: "Pittsburgh", state: "PA", zip: "15213" }, geocode: { lat: 40.4406, lng: -79.9959 } },
  { name: "Starbucks Coffee", category: ["coffee"], address: { street_number: "200", street_name: "Forbes Ave", city: "Pittsburgh", state: "PA", zip: "15213" }, geocode: { lat: 40.4416, lng: -79.9449 } },
  { name: "Shell Gas Station", category: ["gas"], address: { street_number: "300", street_name: "Fifth Ave", city: "Pittsburgh", state: "PA", zip: "15213" }, geocode: { lat: 40.4426, lng: -79.9549 } },
  { name: "Amazon", category: ["shopping"], address: { street_number: "410", street_name: "Terry Ave", city: "Seattle", state: "WA", zip: "98109" }, geocode: { lat: 47.6222, lng: -122.3366 } },
  { name: "Netflix", category: ["streaming"], address: { street_number: "100", street_name: "Winchester Cir", city: "Los Gatos", state: "CA", zip: "95032" }, geocode: { lat: 37.2529, lng: -121.9547 } },
  { name: "Spotify", category: ["streaming"], address: { street_number: "4", street_name: "World Trade Ctr", city: "New York", state: "NY", zip: "10007" }, geocode: { lat: 40.7128, lng: -74.0060 } },
  { name: "Chipotle", category: ["restaurant"], address: { street_number: "500", street_name: "Forbes Ave", city: "Pittsburgh", state: "PA", zip: "15213" }, geocode: { lat: 40.4436, lng: -79.9559 } },
  { name: "Target", category: ["shopping"], address: { street_number: "600", street_name: "Penn Ave", city: "Pittsburgh", state: "PA", zip: "15222" }, geocode: { lat: 40.4446, lng: -79.9969 } },
  { name: "CVS Pharmacy", category: ["pharmacy"], address: { street_number: "700", street_name: "Murray Ave", city: "Pittsburgh", state: "PA", zip: "15217" }, geocode: { lat: 40.4316, lng: -79.9249 } },
  { name: "Planet Fitness", category: ["fitness"], address: { street_number: "800", street_name: "Walnut St", city: "Pittsburgh", state: "PA", zip: "15232" }, geocode: { lat: 40.4516, lng: -79.9349 } },
  { name: "Uber", category: ["transportation"], address: { street_number: "1455", street_name: "Market St", city: "San Francisco", state: "CA", zip: "94103" }, geocode: { lat: 37.7749, lng: -122.4194 } },
  { name: "Comcast Xfinity", category: ["utilities"], address: { street_number: "1701", street_name: "JFK Blvd", city: "Philadelphia", state: "PA", zip: "19103" }, geocode: { lat: 39.9526, lng: -75.1652 } },
  { name: "Trader Joes", category: ["grocery"], address: { street_number: "215", street_name: "North Craig St", city: "Pittsburgh", state: "PA", zip: "15213" }, geocode: { lat: 40.4450, lng: -79.9510 } },
  { name: "McDonalds", category: ["restaurant"], address: { street_number: "3710", street_name: "Forbes Ave", city: "Pittsburgh", state: "PA", zip: "15213" }, geocode: { lat: 40.4390, lng: -79.9570 } },
  { name: "Duolingo HQ Store", category: ["education"], address: { street_number: "5900", street_name: "Penn Ave", city: "Pittsburgh", state: "PA", zip: "15206" }, geocode: { lat: 40.4620, lng: -79.9240 } },
];

// ─── Purchase templates (merchant index, amount range, descriptions) ─────────

interface PurchaseTemplate {
  merchantIdx: number;
  minAmt: number;
  maxAmt: number;
  descs: string[];
}

const PURCHASE_TEMPLATES: PurchaseTemplate[] = [
  { merchantIdx: 0, minAmt: 35, maxAmt: 120, descs: ["Weekly groceries", "Groceries", "Organic produce", "Meal prep supplies"] },
  { merchantIdx: 1, minAmt: 4, maxAmt: 8, descs: ["Latte", "Cold brew", "Drip coffee", "Iced mocha", "Cappuccino"] },
  { merchantIdx: 2, minAmt: 30, maxAmt: 55, descs: ["Gas fill-up", "Fuel", "Gas + car wash"] },
  { merchantIdx: 3, minAmt: 12, maxAmt: 200, descs: ["Household items", "Electronics", "Books", "Kitchen supplies", "Clothing"] },
  { merchantIdx: 4, minAmt: 15, maxAmt: 23, descs: ["Monthly subscription"] },
  { merchantIdx: 5, minAmt: 10, maxAmt: 17, descs: ["Monthly subscription"] },
  { merchantIdx: 6, minAmt: 9, maxAmt: 16, descs: ["Burrito bowl", "Burrito bowl + guac", "Bowl + chips", "Tacos"] },
  { merchantIdx: 7, minAmt: 15, maxAmt: 90, descs: ["Clothing", "Home goods", "Household essentials", "Decor"] },
  { merchantIdx: 8, minAmt: 8, maxAmt: 45, descs: ["Prescriptions", "OTC medicine", "Vitamins", "First aid supplies"] },
  { merchantIdx: 9, minAmt: 20, maxAmt: 35, descs: ["Monthly membership", "Gym membership"] },
  { merchantIdx: 10, minAmt: 8, maxAmt: 35, descs: ["Ride to campus", "Ride downtown", "Ride to airport", "Ride to grocery"] },
  { merchantIdx: 11, minAmt: 60, maxAmt: 110, descs: ["Internet bill", "Internet + cable bundle"] },
  { merchantIdx: 12, minAmt: 25, maxAmt: 80, descs: ["Groceries", "Snacks run", "Weekly haul"] },
  { merchantIdx: 13, minAmt: 5, maxAmt: 15, descs: ["Lunch combo", "Breakfast sandwich", "McFlurry + fries", "Big Mac meal"] },
  { merchantIdx: 14, minAmt: 10, maxAmt: 30, descs: ["Language course", "Study materials", "Merch"] },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
}

/** Seeded random based on user index so results are consistent */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function randomBetween(rng: () => number, min: number, max: number): number {
  return Math.round((min + rng() * (max - min)) * 100) / 100;
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function generatePurchases(
  userIdx: number,
  merchantIds: string[]
): { merchant_id: string; medium: string; purchase_date: string; amount: number; description: string; status: string }[] {
  const rng = seededRandom(userIdx * 1000 + 42);
  const purchases: ReturnType<typeof generatePurchases> = [];

  // Each user gets 15-30 purchases over the last 60 days
  const numPurchases = 15 + Math.floor(rng() * 16);

  for (let i = 0; i < numPurchases; i++) {
    const template = pick(rng, PURCHASE_TEMPLATES);
    const daysAgo = Math.floor(rng() * 60) + 1;
    const amount = randomBetween(rng, template.minAmt, template.maxAmt);
    const desc = pick(rng, template.descs);

    purchases.push({
      merchant_id: merchantIds[template.merchantIdx],
      medium: "balance",
      purchase_date: formatDate(daysAgo),
      amount,
      description: desc,
      status: "completed",
    });
  }

  return purchases;
}

function makeEmail(first: string, last: string): string {
  return `${first.toLowerCase()}.${last.toLowerCase()}@gmail.com`;
}

// ─── Main seed function ──────────────────────────────────────────────────────

export async function seedNessieData(apiKey: string): Promise<SeedResult> {
  // Check if data already exists (idempotent)
  const existingCustomers = await nessieGet<{ _id: string }[]>("/customers", apiKey);
  if (existingCustomers && existingCustomers.length >= 20) {
    // Already seeded — return existing data summary
    const users: SeededUser[] = [];
    for (let i = 0; i < Math.min(existingCustomers.length, 20); i++) {
      const cid = existingCustomers[i]._id;
      const accounts = await nessieGet<{ _id: string; balance: number }[]>(
        `/customers/${cid}/accounts`, apiKey
      );
      const acct = accounts?.[0];
      const purchases = acct
        ? await nessieGet<{ _id: string }[]>(`/accounts/${acct._id}/purchases`, apiKey)
        : [];
      const user = USERS[i] || USERS[0];
      users.push({
        email: makeEmail(user.first, user.last),
        password: "root",
        firstName: user.first,
        lastName: user.last,
        customerId: cid,
        accountId: acct?._id || "",
        balance: acct?.balance || 0,
        purchaseCount: purchases?.length || 0,
      });
    }
    return { users, merchantIds: [], totalPurchases: 0 };
  }

  // 1. Create merchants (shared across all users)
  const merchantIds: string[] = [];
  for (const merchant of MERCHANTS) {
    // API is rejecting 'category', so we omit it for now
    const { category, ...merchantPayload } = merchant;
    const result = await nessiePost<{ objectCreated: { _id: string } }>(
      "/merchants", merchantPayload, apiKey
    );
    merchantIds.push(result.objectCreated._id);
  }

  // 2. Create each user: customer → account → purchases
  const users: SeededUser[] = [];
  let totalPurchases = 0;

  for (let i = 0; i < USERS.length; i++) {
    const u = USERS[i];

    // Create customer
    const customerResult = await nessiePost<{ objectCreated: { _id: string } }>(
      "/customers",
      {
        first_name: u.first,
        last_name: u.last,
        address: {
          street_number: u.street_number,
          street_name: u.street_name,
          city: u.city,
          state: u.state,
          zip: u.zip,
        },
      },
      apiKey
    );
    const customerId = customerResult.objectCreated._id;

    // Create checking account
    const accountResult = await nessiePost<{ objectCreated: { _id: string } }>(
      `/customers/${customerId}/accounts`,
      {
        type: "Checking",
        nickname: `${u.first}'s Checking`,
        rewards: 0,
        balance: u.balance,
      },
      apiKey
    );
    const accountId = accountResult.objectCreated._id;

    // Create purchases
    const purchases = generatePurchases(i, merchantIds);
    for (const purchase of purchases) {
      await nessiePost(
        `/accounts/${accountId}/purchases`,
        purchase,
        apiKey
      );
    }

    totalPurchases += purchases.length;

    users.push({
      email: makeEmail(u.first, u.last),
      password: "root",
      firstName: u.first,
      lastName: u.last,
      customerId,
      accountId,
      balance: u.balance,
      purchaseCount: purchases.length,
    });
  }

  return { users, merchantIds, totalPurchases };
}

/** Returns the credentials list without hitting Nessie (for README / reference) */
export function getDefaultCredentials(): { email: string; password: string; name: string }[] {
  return USERS.map((u) => ({
    email: makeEmail(u.first, u.last),
    password: "root",
    name: `${u.first} ${u.last}`,
  }));
}
