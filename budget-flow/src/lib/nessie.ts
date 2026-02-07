import { NessieCustomer, NessieAccount, NessiePurchase, NessieMerchant } from "./types";

const BASE_URL = "http://api.nessieisreal.com";
const API_KEY = process.env.NESSIE_API_KEY || "";

async function nessieGet<T>(path: string): Promise<T> {
  const separator = path.includes("?") ? "&" : "?";
  const res = await fetch(`${BASE_URL}${path}${separator}key=${API_KEY}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Nessie API error: ${res.status}`);
  return res.json();
}

export async function getCustomers(): Promise<NessieCustomer[]> {
  return nessieGet<NessieCustomer[]>("/customers");
}

export async function getCustomer(id: string): Promise<NessieCustomer> {
  return nessieGet<NessieCustomer>(`/customers/${id}`);
}

export async function getAccounts(customerId: string): Promise<NessieAccount[]> {
  return nessieGet<NessieAccount[]>(`/customers/${customerId}/accounts`);
}

export async function getAccount(accountId: string): Promise<NessieAccount> {
  return nessieGet<NessieAccount>(`/accounts/${accountId}`);
}

export async function getPurchases(accountId: string): Promise<NessiePurchase[]> {
  return nessieGet<NessiePurchase[]>(`/accounts/${accountId}/purchases`);
}

export async function getMerchants(): Promise<NessieMerchant[]> {
  return nessieGet<NessieMerchant[]>("/merchants");
}

export async function getMerchant(merchantId: string): Promise<NessieMerchant> {
  return nessieGet<NessieMerchant>(`/merchants/${merchantId}`);
}

// Create a customer (for sign-up flow)
export async function createCustomer(data: {
  first_name: string;
  last_name: string;
  address: { street_number: string; street_name: string; city: string; state: string; zip: string };
}): Promise<{ objectCreated: NessieCustomer }> {
  const res = await fetch(`${BASE_URL}/customers?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Nessie API error: ${res.status}`);
  return res.json();
}

// Create an account for a customer
export async function createAccount(
  customerId: string,
  data: { type: string; nickname: string; rewards: number; balance: number }
): Promise<{ objectCreated: NessieAccount }> {
  const res = await fetch(`${BASE_URL}/customers/${customerId}/accounts?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Nessie API error: ${res.status}`);
  return res.json();
}

// Create a purchase
export async function createPurchase(
  accountId: string,
  data: { merchant_id: string; medium: string; purchase_date: string; amount: number; description: string }
): Promise<{ objectCreated: NessiePurchase }> {
  const res = await fetch(`${BASE_URL}/accounts/${accountId}/purchases?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Nessie API error: ${res.status}`);
  return res.json();
}
