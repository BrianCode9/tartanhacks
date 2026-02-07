import { seedNessieData } from "../src/lib/nessie-seed";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const API_KEY = process.env.NESSIE_API_KEY;

if (!API_KEY) {
    console.error("Error: NESSIE_API_KEY not found in .env.local");
    process.exit(1);
}

console.log("Starting seed process...");
seedNessieData(API_KEY)
    .then((result) => {
        console.log("Seeding complete!");
        console.log(`Created ${result.users.length} users`);
        console.log(`Created ${result.merchantIds.length} merchants`);
        console.log(`Created ${result.totalPurchases} purchases`);
    })
    .catch((err) => {
        console.error("Seeding failed:", err);
        process.exit(1);
    });
