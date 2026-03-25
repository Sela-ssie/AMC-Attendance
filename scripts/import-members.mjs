#!/usr/bin/env node
/**
 * Import members from the Excel file into Supabase.
 *
 * Usage:
 *   node scripts/import-members.mjs path/to/file.xlsx
 *
 * Requires environment variables (put them in .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *
 * You also need a Supabase service-role key for this script
 * (anon key respects RLS — use service role key for bulk import):
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import ExcelJS from "exceljs";
import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local
config({ path: resolve(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: node scripts/import-members.mjs <path-to-xlsx>");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile(filePath);
const sheet = workbook.worksheets[0];

// Skip header row, collect non-empty names from column 1
const names = [];
sheet.eachRow((row, rowNumber) => {
  if (rowNumber === 1) return; // skip header
  const val = String(row.getCell(1).value ?? "").trim();
  if (val) names.push(val);
});

console.log(`Found ${names.length} members to import…`);

const members = names.map((name) => ({
  name,
  is_active: true,
  join_date: null,
  phone: null,
  email: null,
}));

// Insert in batches of 50
const BATCH = 50;
let inserted = 0;

for (let i = 0; i < members.length; i += BATCH) {
  const batch = members.slice(i, i + BATCH);
  const { error, data } = await supabase
    .from("members")
    .insert(batch)
    .select();
  if (error) {
    console.error("Error inserting batch:", error.message);
  } else {
    inserted += data?.length ?? 0;
  }
}

console.log(`✓ Import complete: ${inserted} members inserted.`);