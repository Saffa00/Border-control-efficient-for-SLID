import "dotenv/config";
import { supabaseAdmin } from "./lib/supabaseAdmin";

async function seed() {
  console.log("🌱 Seeding Sierra Leone Immigration System database...\n");

  // 1. Seed Visa Types
  console.log("1. Seeding visa types...");
  const visaTypes = [
    {
      name: "Tourist Visa (Single Entry)",
      description: "Standard tourist entry visa for tourism, holidays, and visiting family.",
      fee_amount: 80.0,
      validity_days: 90,
      max_stay_days: 30,
      available_on_arrival: true,
    },
    {
      name: "Tourist Visa (Multiple Entry)",
      description: "Multiple entry tourist visa for frequent short-term visitors.",
      fee_amount: 150.0,
      validity_days: 180,
      max_stay_days: 90,
      available_on_arrival: false,
    },
    {
      name: "Business Visa (Single Entry)",
      description: "For commercial visits, conferences, business meetings, and trade inquiries.",
      fee_amount: 160.0,
      validity_days: 90,
      max_stay_days: 30,
      available_on_arrival: true,
    },
    {
      name: "Business Visa (Multiple Entry)",
      description: "Longer validity business visa for verified company representatives.",
      fee_amount: 300.0,
      validity_days: 365,
      max_stay_days: 90,
      available_on_arrival: false,
    },
    {
      name: "Transit Visa",
      description: "Short stay transit visa for travelers passing through Sierra Leone to a third country.",
      fee_amount: 40.0,
      validity_days: 7,
      max_stay_days: 3,
      available_on_arrival: true,
    },
    {
      name: "Study / Student Visa",
      description: "For international students enrolled in accredited educational institutions in Sierra Leone.",
      fee_amount: 120.0,
      validity_days: 365,
      max_stay_days: 365,
      available_on_arrival: false,
    },
  ];

  for (const vt of visaTypes) {
    const { data: existing } = await supabaseAdmin
      .from("visa_types")
      .select("visa_type_id")
      .eq("name", vt.name)
      .maybeSingle();

    if (!existing) {
      const { error } = await supabaseAdmin.from("visa_types").insert(vt);
      if (error) {
        console.warn(`  - Visa type (${vt.name}):`, error.message);
      } else {
        console.log(`  ✓ Inserted ${vt.name}`);
      }
    } else {
      console.log(`  • Already exists: ${vt.name}`);
    }
  }

  // 2. Seed Checkpoints
  console.log("\n2. Seeding border checkpoints...");
  const checkpoints = [
    {
      name: "Freetown-Lungi International Airport (FNA)",
      location: "Lungi, Port Loko District",
      checkpoint_type: "airport",
    },
    {
      name: "Queen Elizabeth II Quay (Deep Water Quay)",
      location: "Cline Town, Freetown",
      checkpoint_type: "seaport",
    },
    {
      name: "Gbalamuya (Kambia) Border Post",
      location: "Kambia District (Guinea Border)",
      checkpoint_type: "land_border",
    },
    {
      name: "Jendema (Mano River Union) Border Post",
      location: "Pujehun District (Liberia Border)",
      checkpoint_type: "land_border",
    },
    {
      name: "Koindu (Kailahun) Border Post",
      location: "Kailahun District (Tri-border area)",
      checkpoint_type: "land_border",
    },
  ];

  for (const cp of checkpoints) {
    const { data: existing } = await supabaseAdmin
      .from("checkpoints")
      .select("checkpoint_id")
      .eq("name", cp.name)
      .maybeSingle();

    if (!existing) {
      const { error } = await supabaseAdmin.from("checkpoints").insert(cp);
      if (error) {
        console.warn(`  - Checkpoint (${cp.name}):`, error.message);
      } else {
        console.log(`  ✓ Inserted ${cp.name}`);
      }
    } else {
      console.log(`  • Already exists: ${cp.name}`);
    }
  }

  // 3. Seed Watchlist Demo Items
  console.log("\n3. Seeding demo watchlist records...");
  const watchlist = [
    {
      passport_number: "WL-TEST-999",
      full_name: "Johnathan Redacted Doe",
      reason: "Interpol Red Notice — Wanted for financial fraud in ECOWAS jurisdiction",
      risk_level: "high",
    },
    {
      passport_number: "WL-TEST-888",
      full_name: "Amadou Alpha Barry",
      reason: "Active Deportation Order — Previous immigration violation",
      risk_level: "high",
    },
    {
      passport_number: "WL-TEST-777",
      full_name: "Marcus Alexander Vance",
      reason: "Court Travel Restriction — Pending judicial proceedings in High Court",
      risk_level: "medium",
    },
  ];

  for (const item of watchlist) {
    const { data: existing } = await supabaseAdmin
      .from("watchlist")
      .select("watchlist_id")
      .eq("passport_number", item.passport_number)
      .maybeSingle();

    if (!existing) {
      const { error } = await supabaseAdmin.from("watchlist").insert(item);
      if (error) {
        console.warn(`  - Watchlist (${item.passport_number}):`, error.message);
      } else {
        console.log(`  ✓ Inserted ${item.passport_number} (${item.full_name})`);
      }
    } else {
      console.log(`  • Already exists: ${item.passport_number}`);
    }
  }

  console.log("\n🎉 Seeding completed successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
