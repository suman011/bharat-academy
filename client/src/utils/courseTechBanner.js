/**
 * Two-line titles + graphic theme for tech-banner thumbnails (AI Fundamentals style).
 */

const GLYPHS = {
  AI: "ai",
  ML: "ml",
  ROBOT: "robot",
  FACTORY: "factory",
  CODE: "code",
  PYTHON: "python",
  DATA: "data",
  NETWORK: "network",
  CLOUD: "cloud",
  OFFICE: "office",
  CIRCUIT: "circuit",
};

/** [regex, top, bottom, glyphKey] — order matters (first match wins). */
const OVERRIDES = [
  [/ai\s+fundamentals/i, "AI", "FUNDAMENTALS", GLYPHS.AI],
  [/machine\s+learning/i, "MACHINE", "LEARNING", GLYPHS.ML],
  [/ai\s*\+\s*machine\s+learning|ai.*machine.*projects/i, "AI", "ML PROJECTS", GLYPHS.ML],
  [/data\s+science\s+master/i, "DATA", "SCIENCE", GLYPHS.DATA],
  [/python\s+for\s+data/i, "PYTHON", "DATA SCIENCE", GLYPHS.PYTHON],
  [/python\s+programming/i, "PYTHON", "PROGRAMMING", GLYPHS.PYTHON],
  [/mern\s+stack/i, "MERN", "STACK", GLYPHS.CODE],
  [/data\s+structures|(?:^|\s)dsa(?:\s|$)/i, "DATA", "STRUCTURES", GLYPHS.CODE],
  [/full\s+stack/i, "FULL", "STACK", GLYPHS.CODE],
  [/react\.?js|advanced\s+react/i, "REACT", "ADVANCED", GLYPHS.CODE],
  [/next\.?js/i, "NEXT", "JS", GLYPHS.CODE],
  [/javascript/i, "JAVA", "SCRIPT", GLYPHS.CODE],
  [/html.*css|bootstrap/i, "WEB", "FRONTEND", GLYPHS.CODE],
  [/java\s+programming/i, "JAVA", "PROGRAMMING", GLYPHS.CODE],
  [/\bc\s*programming\b/i, "C", "PROGRAMMING", GLYPHS.CODE],
  [/c\+\+\s+programming/i, "C++", "PROGRAMMING", GLYPHS.CODE],
  [/git\s+&?\s*github/i, "GIT", "GITHUB", GLYPHS.CODE],
  [/api\s+development/i, "API", "DEVELOPMENT", GLYPHS.CODE],
  [/aws\s+basics/i, "AWS", "CLOUD", GLYPHS.CLOUD],
  [/ci\/cd|devops/i, "DEV", "OPS", GLYPHS.CLOUD],
  [/data\s+analytics|power\s*bi/i, "DATA", "ANALYTICS", GLYPHS.DATA],
  [/database\s+management|sql.*mongo/i, "DATABASE", "SYSTEMS", GLYPHS.DATA],
  [/computer\s+networks/i, "NETWORKS", "TCP/IP", GLYPHS.NETWORK],
  [/operating\s+system/i, "OS", "SYSTEMS", GLYPHS.CIRCUIT],
  [/cyber\s+security|ethical\s+hacking/i, "CYBER", "SECURITY", GLYPHS.NETWORK],
  [/plc\b/i, "PLC", "CONTROL", GLYPHS.FACTORY],
  [/scada/i, "SCADA", "HMI", GLYPHS.FACTORY],
  [/iiot|industrial\s+iot/i, "IIoT", "CONNECT", GLYPHS.FACTORY],
  [/\biot\b/i, "IOT", "SYSTEMS", GLYPHS.FACTORY],
  [/robotics|fanuc|abb|kuka|cobot/i, "ROBOT", "ICS", GLYPHS.ROBOT],
  [/amr\s*\/?\s*agv/i, "AMR", "AGV", GLYPHS.ROBOT],
  [/vision|opencv|machine\s+vision/i, "VISION", "SYSTEMS", GLYPHS.AI],
  [/digital\s+twin/i, "DIGITAL", "TWIN", GLYPHS.FACTORY],
  [/predictive\s+maintenance/i, "PREDICT", "MAINTAIN", GLYPHS.DATA],
  [/edge\s+computing/i, "EDGE", "COMPUTE", GLYPHS.CLOUD],
  [/cloud\s+for\s+industry/i, "CLOUD", "INDUSTRY", GLYPHS.CLOUD],
  [/industrial\s+cybersecurity|ot\s+security/i, "OT", "SECURITY", GLYPHS.NETWORK],
  [/automation\s+and\s+robotics|intro(?:duction)?\s+to\s+automation/i, "AUTO", "ROBOTICS", GLYPHS.ROBOT],
  [/smart\s+manufacturing/i, "SMART", "FACTORY", GLYPHS.FACTORY],
  [/ms\s+office|word.*excel/i, "MS", "OFFICE", GLYPHS.OFFICE],
  [/computer\s+fundamentals/i, "COMPUTER", "BASICS", GLYPHS.OFFICE],
  [/digital\s+literacy/i, "DIGITAL", "LITERACY", GLYPHS.OFFICE],
  [/advanc(?:e|ed)\s+excel/i, "ADVANCED", "EXCEL", GLYPHS.DATA],
  [/advance\s+powerpoint|powerpoint/i, "DECK", "DESIGN", GLYPHS.OFFICE],
  [/software\s+testing/i, "QA", "TESTING", GLYPHS.CIRCUIT],
  [/resume|interview/i, "CAREER", "PREP", GLYPHS.OFFICE],
  [/package|developer\s+package|pro\s+package/i, "BUNDLE", "TRACK", GLYPHS.CIRCUIT],
];

function detectGlyph(lower) {
  if (/machine\s+learning/.test(lower)) return GLYPHS.ML;
  if (/\bml\b/.test(lower)) return GLYPHS.ML;
  if (/\bai\b|artificial|neural|deep\s+learn/.test(lower)) return GLYPHS.AI;
  if (/robot|cobot|fanuc|abb|kuka|amr|agv|welding\s+robot/.test(lower)) return GLYPHS.ROBOT;
  if (/plc|scada|mes|factory|manufacturing|instrumentation|automation|hydraulic|pneumatic|conveyor|packaging|batch|dcs|opc/.test(lower))
    return GLYPHS.FACTORY;
  if (/python|java\b|c\+\+|programming|react|node|mern|html|css|javascript|dsa|api|stack|git/.test(lower)) return GLYPHS.CODE;
  if (/data|analytics|excel|sql|mongo|database|science|bi\b|historian|spc/.test(lower)) return GLYPHS.DATA;
  if (/network|cyber|security|hacking|firewall|encryption/.test(lower)) return GLYPHS.NETWORK;
  if (/aws|azure|cloud|devops|ci\/cd|kubernetes|docker|edge\s+comput/.test(lower)) return GLYPHS.CLOUD;
  if (/office|word|powerpoint|fundamentals|typing|literacy|crash/.test(lower)) return GLYPHS.OFFICE;
  return GLYPHS.CIRCUIT;
}

function truncate(s, max) {
  const t = String(s || "").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, Math.max(0, max - 1))}…`;
}

/**
 * @param {string} courseName
 * @param {"card"|"compact"|"detail"} variant
 * @returns {{ top: string, bottom: string, glyph: string, mark: string }}
 */
export function getTechBannerMeta(courseName, variant = "card") {
  const raw = String(courseName || "").trim();
  const lower = raw.toLowerCase();
  const bottomMax = variant === "compact" ? 16 : variant === "detail" ? 28 : 20;

  for (const row of OVERRIDES) {
    const [re, top, bottom, glyph] = row;
    if (re.test(raw)) {
      return {
        top,
        bottom: truncate(bottom, bottomMax),
        glyph,
        mark: top.replace(/[^A-Z0-9]/gi, "").slice(0, 1) || "B",
      };
    }
  }

  let main = raw.replace(/\([^)]*\)/g, " ").replace(/,/g, " ").replace(/\s+/g, " ").trim();
  const words = main.split(/\s+/).filter(Boolean);
  const glyph = detectGlyph(lower);

  if (words.length === 0) {
    return { top: "COURSE", bottom: "CATALOG", glyph, mark: "B" };
  }
  if (words.length === 1) {
    const w = words[0].toUpperCase();
    const mid = Math.max(2, Math.ceil(w.length / 2));
    return {
      top: truncate(w.slice(0, mid), 10),
      bottom: truncate(w.slice(mid), bottomMax),
      glyph,
      mark: w.slice(0, 1),
    };
  }

  const top = truncate(words[0].toUpperCase(), 11);
  const bottom = truncate(words.slice(1).join(" ").toUpperCase(), bottomMax);
  return { top, bottom, glyph, mark: top.replace(/[^A-Z0-9]/gi, "").slice(0, 1) || "B" };
}

export function getTechMicroAcronym(courseName) {
  const cleaned = String(courseName || "").replace(/[^a-zA-Z0-9+& ]/g, " ");
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  return (parts[0] || "B").slice(0, 2).toUpperCase();
}
