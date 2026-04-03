/**
 * One-off / maintenance: writes client/src/data/phoneCountries.json from world-countries.
 * Run: node scripts/generatePhoneCountries.mjs
 * Requires: npm install world-countries (in client or repo root)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const wcPath = path.join(root, "client", "node_modules", "world-countries", "countries.json");

if (!fs.existsSync(wcPath)) {
  console.error("Missing world-countries. Run: npm install world-countries --prefix client");
  process.exit(1);
}

const countries = JSON.parse(fs.readFileSync(wcPath, "utf8"));

function buildDial(c) {
  const idd = c.idd;
  if (!idd?.root || idd.root === "+0") return null;
  const r = idd.root;
  const suf = idd.suffixes || [];
  if (suf.length === 0) return r;
  // NANP: +1 with many area-code suffixes
  if (r === "+1" && suf.length > 1) return "+1";
  // +7 shared (RU, KZ, etc.): digit suffixes are trunk/area, not full CC
  if (r === "+7" && suf.length > 1) return "+7";
  return r + suf[0];
}

const rows = [];
for (const c of countries) {
  const dial = buildDial(c);
  if (!dial) continue;
  rows.push({ iso2: c.cca2, dial, name: c.name.common });
}

rows.sort((a, b) => a.name.localeCompare(b.name, "en"));

const out = path.join(root, "client", "src", "data", "phoneCountries.json");
fs.writeFileSync(out, JSON.stringify(rows, null, 0));
console.log("Wrote", rows.length, "rows to", out);
