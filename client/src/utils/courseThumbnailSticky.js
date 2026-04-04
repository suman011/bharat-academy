/**
 * Short label for sticky-note style thumbnails (handwritten / marker caps).
 */

const STOP = new Set([
  "to",
  "of",
  "and",
  "for",
  "the",
  "a",
  "an",
  "in",
  "with",
  "basic",
  "skill",
  "skills",
  "development",
  "professional",
  "foundation",
  "courses",
  "course",
  "level",
  "introduction",
  "intro",
  "essentials",
  "systems",
  "system",
]);

const ALIAS = [
  [/^\s*ai\s+fundamentals/i, "AI"],
  [/machine\s+learning/i, "ML"],
  [/python\s+for\s+data/i, "PYTHON\nDATA"],
  [/python\s+programming/i, "PYTHON"],
  [/mern\s+stack/i, "MERN"],
  [/(?:^|\s)dsa(?:\s|$)|data\s+structures/i, "DSA"],
  [/\bplc\b/i, "PLC"],
  [/scada/i, "SCADA"],
  [/iiot/i, "IIoT"],
  [/(?:^|\s)iot(?:\s|$)/i, "IOT"],
  [/cobot/i, "COBOT"],
  [/amr\s*\/?\s*agv/i, "AMR"],
];

/**
 * 2–3 lines max feel: prefer significant words, ALL CAPS, trimmed length.
 */
export function getStickyThumbnailLabel(courseName) {
  const raw = String(courseName || "").trim();
  if (!raw) return "COURSE";
  for (const [re, label] of ALIAS) {
    if (re.test(raw)) return label;
  }
  let main = raw.replace(/\([^)]*\)/g, " ").replace(/,/g, " ").replace(/\s+/g, " ").trim();
  let parts = main.split(" ").filter(Boolean);
  parts = parts.filter((w) => !STOP.has(w.toLowerCase().replace(/[^a-z]/g, "")));
  if (parts.length < 2) parts = main.split(" ").filter(Boolean);
  let line = parts.slice(0, 4).join(" ").toUpperCase();
  if (line.length > 28) line = `${line.slice(0, 26)}…`;
  return line;
}

/** Tiny list avatars (category cards). */
export function getStickyMicroAcronym(courseName) {
  const cleaned = String(courseName || "").replace(/[^a-zA-Z0-9+& ]/g, " ");
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0][0] || "";
    const b = parts[1][0] || "";
    return `${a}${b}`.toUpperCase();
  }
  const w = parts[0] || "C";
  return w.slice(0, 2).toUpperCase();
}
