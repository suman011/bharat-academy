import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { courseCategories } from "../src/data/courses.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const slugify = (name) =>
  String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const BASE = "https://bharatskillacademy.com";

const staticUrls = [
  { loc: `${BASE}/`, changefreq: "weekly", priority: "1.0" },
  { loc: `${BASE}/courses`, changefreq: "weekly", priority: "0.9" },
  { loc: `${BASE}/about`, changefreq: "monthly", priority: "0.7" },
  { loc: `${BASE}/contact`, changefreq: "monthly", priority: "0.7" },
];

const slugSet = new Set();
for (const cat of courseCategories) {
  for (const item of cat.items || []) {
    const s = slugify(item.name);
    if (s) slugSet.add(s);
  }
}

const courseUrls = [...slugSet]
  .sort()
  .map((slug) => ({
    loc: `${BASE}/courses/${encodeURIComponent(slug)}`,
    changefreq: "weekly",
    priority: "0.75",
  }));

function urlEntry({ loc, changefreq, priority }) {
  return `  <url>
    <loc>${loc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...courseUrls].map(urlEntry).join("\n")}
</urlset>
`;

const out = path.join(__dirname, "..", "public", "sitemap.xml");
writeFileSync(out, xml, "utf8");
console.log(`Wrote ${staticUrls.length + courseUrls.length} URLs to public/sitemap.xml`);
