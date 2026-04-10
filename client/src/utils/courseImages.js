/**
 * Per-course cover images (Unsplash) — each title maps to a topic-relevant photo.
 * URLs verified (200); size params keep catalog cards consistent.
 */
const q = "w=400&h=260&fit=crop&auto=format";

/** Exact course name → image (lowercase keys, must match courses.js titles) */
const BY_COURSE_NAME = {
  "computer fundamentals": `https://images.unsplash.com/photo-1517694712202-14dd9538aa97?${q}`,
  "ms office (word, excel, powerpoint)": `https://images.unsplash.com/photo-1586281380349-632531db7ed4?${q}`,
  "internet & email essentials": `https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?${q}`,
  "digital literacy & cyber safety": `https://images.unsplash.com/photo-1550751827-4bd374c3f58b?${q}`,
  "typing skills (english & marathi/hindi)": `https://images.unsplash.com/photo-1455390582262-044cdead277a?${q}`,
  "computer hardware basics": `https://images.unsplash.com/photo-1518770660439-4636190af475?${q}`,
  "introduction to operating systems (windows)": `https://images.unsplash.com/photo-1558494949-ef010cbdcc31?${q}`,
  "paint & basic design tools": `https://images.unsplash.com/photo-1513364776144-60967b0f800f?${q}`,

  "advance excel (dashboard, pivot, macros)": `https://images.unsplash.com/photo-1551288049-bebda4e38f71?${q}`,
  "advance powerpoint (presentation design)": `https://images.unsplash.com/photo-1552664730-d307ca884978?${q}`,
  "google workspace (docs, sheets, slides)": `https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?${q}`,
  "html, css, bootstrap": `https://images.unsplash.com/photo-1498050108023-c5249f4df085?${q}`,
  "javascript (es6+)": `https://images.unsplash.com/photo-1661956602116-aa6865609028?${q}`,
  "git & github": `https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?${q}`,
  "python programming (basic + intermediate)": `https://images.unsplash.com/photo-1526379095098-d400fd0bf935?${q}`,
  "ui/ux basics": `https://images.unsplash.com/photo-1561070791-2526d30994b5?${q}`,
  "canva & graphic design": `https://images.unsplash.com/photo-1461749280684-dccba630e2f6?${q}`,
  "figma basics": `https://images.unsplash.com/photo-1561070791-2526d30994b5?${q}`,

  "c programming": `https://images.unsplash.com/photo-1518770660439-4636190af475?${q}`,
  "c++ programming": `https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?${q}`,
  "java programming": `https://images.unsplash.com/photo-1627398242454-45a1465c2479?${q}`,
  "data structures & algorithms (dsa)": `https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?${q}`,
  "operating system fundamentals": `https://images.unsplash.com/photo-1558494949-ef010cbdcc31?${q}`,
  "computer networks": `https://images.unsplash.com/photo-1544197150-b99a580bb7a8?${q}`,
  "database management system (sql + mongodb)": `https://images.unsplash.com/photo-1544383835-bda2bc66a55d?${q}`,

  "mern stack (mongodb, express, react, node)": `https://images.unsplash.com/photo-1627398242454-45a1465c2479?${q}`,
  "advanced react.js": `https://images.unsplash.com/photo-1633356122544-f134324a6cee?${q}`,
  "next.js": `https://images.unsplash.com/photo-1498050108023-c5249f4df085?${q}`,
  "api development (node.js / express)": `https://images.unsplash.com/photo-1555066931-4365d14bab8c?${q}`,
  "aws basics (s3, ec2, lambda)": `https://images.unsplash.com/photo-1451187580459-43490279c0fa?${q}`,
  "ci/cd (github actions, devops basics)": `https://images.unsplash.com/photo-1605745341112-85968b19335b?${q}`,
  "data analytics (excel + power bi)": `https://images.unsplash.com/photo-1551288049-bebda4e38f71?${q}`,
  "python for data science": `https://images.unsplash.com/photo-1526379095098-d400fd0bf935?${q}`,
  "ai fundamentals": `https://images.unsplash.com/photo-1677442136019-21780ecad995?${q}`,

  "machine learning basics": `https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?${q}`,
  "full stack developer program (3-6 months)": `https://images.unsplash.com/photo-1627398242454-45a1465c2479?${q}`,
  "data science master program": `https://images.unsplash.com/photo-1522071820081-009f0129c71c?${q}`,
  "ai + machine learning with projects": `https://images.unsplash.com/photo-1620712943543-bcc4688e7485?${q}`,

  "cyber security fundamentals": `https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?${q}`,
  "ethical hacking basics": `https://images.unsplash.com/photo-1550751827-4bd374c3f58b?${q}`,
  "robotics & automation basics": `https://images.unsplash.com/photo-1518770660439-4636190af475?${q}`,
  "vision ai for industry (factory use cases)": `https://images.unsplash.com/photo-1581092160562-40aa08e78837?${q}`,
  "industrial automation concepts (plc basics intro)": `https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?${q}`,

  "basic computer for kids": `https://images.unsplash.com/photo-1503676260728-1c00da094a0b?${q}`,
  "drawing & coloring (activity-based)": `https://images.unsplash.com/photo-1513364776144-60967b0f800f?${q}`,
  "scratch programming": `https://images.unsplash.com/photo-1531482615713-2afd69097998?${q}`,
  "beginner coding (games & logic)": `https://images.unsplash.com/photo-1511512578047-dfb367046420?${q}`,
  "spoken english & communication": `https://images.unsplash.com/photo-1523240795612-9a054b0db644?${q}`,
  "handwriting improvement": `https://images.unsplash.com/photo-1455390582262-044cdead277a?${q}`,
  "ms office for kids": `https://images.unsplash.com/photo-1586281380349-632531db7ed4?${q}`,

  "basic computer crash course": `https://images.unsplash.com/photo-1517694712202-14dd9538aa97?${q}`,
  "excel in 30 days": `https://images.unsplash.com/photo-1551288049-bebda4e38f71?${q}`,
  "web design basics": `https://images.unsplash.com/photo-1498050108023-c5249f4df085?${q}`,
  "spoken english": `https://images.unsplash.com/photo-1523240795612-9a054b0db644?${q}`,
  "coding for beginners": `https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?${q}`,

  "full stack development": `https://images.unsplash.com/photo-1627398242454-45a1465c2479?${q}`,
  "advanced excel + mis": `https://images.unsplash.com/photo-1551288049-bebda4e38f71?${q}`,
  "data analyst course": `https://images.unsplash.com/photo-1460925895917-afdab827c52f?${q}`,
  "software testing (manual + automation)": `https://images.unsplash.com/photo-1515879218367-8466d910aaa4?${q}`,
  "resume building + interview preparation": `https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?${q}`,

  "beginner package (basic + ms office + internet)": `https://images.unsplash.com/photo-1556740738-b6a63e27c4df?${q}`,
  "developer package (html + css + js + react)": `https://images.unsplash.com/photo-1461749280684-dccba630e2f6?${q}`,
  "pro package (dsa + full stack + projects)": `https://images.unsplash.com/photo-1515879218367-8466d910aaa4?${q}`,
};

/** Automation & robotics catalog — one distinct cover per title (URLs verified). */
const INDUSTRY_COURSE_COVERS = {
  "introduction to automation and robotics": `https://images.unsplash.com/photo-1581092160562-40aa08e78837?${q}`,
  "smart manufacturing basics": `https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?${q}`,
  "basics of automation & control systems": `https://images.unsplash.com/photo-1503387762-592deb58ef4e?${q}`,
  "sensors & actuators fundamentals": `https://images.unsplash.com/photo-1518709268805-4e9042af2176?${q}`,
  "industrial safety & standards": `https://images.unsplash.com/photo-1504307651254-35680f356dfd?${q}`,
  "electrical & electronics basics for automation": `https://images.unsplash.com/photo-1581094794329-c8112a89af12?${q}`,
  "basics of plc (introduction)": `https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?${q}`,
  "introduction to robotics & automation": `https://images.unsplash.com/photo-1617791160505-6f00504e3519?${q}`,
  "basics of iot (internet of things)": `https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?${q}`,
  "plc programming (siemens / allen bradley basics)": `https://images.unsplash.com/photo-1518770660439-4636190af475?${q}`,
  "scada systems & hmi development": `https://images.unsplash.com/photo-1661956602116-aa6865609028?${q}`,
  "industrial instrumentation": `https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?${q}`,
  "industrial iot (iiot) with arduino / raspberry pi": `https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?${q}`,
  "robotics programming (basic level)": `https://images.unsplash.com/photo-1498050108023-c5249f4df085?${q}`,
  "mechatronics systems": `https://images.unsplash.com/photo-1518770660439-4636190af475?${q}`,
  "data acquisition & monitoring systems": `https://images.unsplash.com/photo-1551288049-bebda4e38f71?${q}`,
  "industrial communication protocols (modbus, opc)": `https://images.unsplash.com/photo-1555066931-4365d14bab8c?${q}`,
  "python for industrial applications": `https://images.unsplash.com/photo-1526379095098-d400fd0bf935?${q}`,
  "advanced sensors & signal processing": `https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?${q}`,
  "introduction to machine vision systems": `https://images.unsplash.com/photo-1677442136019-21780ecad995?${q}`,
  "lean manufacturing & six sigma basics": `https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?${q}`,
  "production planning & smart factory concepts": `https://images.unsplash.com/photo-1552664730-d307ca884978?${q}`,
  "ai & machine learning for manufacturing": `https://images.unsplash.com/photo-1620712943543-bcc4688e7485?${q}`,
  "advanced plc programming (pid, networking)": `https://images.unsplash.com/photo-1605745341112-85968b19335b?${q}`,
  "advanced scada & industrial automation": `https://images.unsplash.com/photo-1555066931-4365d14bab8c?${q}`,
  "industrial robotics (fanuc / abb / kuka)": `https://images.unsplash.com/photo-1611532736597-de2d4265fba3?${q}`,
  "cobot programming & applications": `https://images.unsplash.com/photo-1614624532983-4ce03382d63d?${q}`,
  "machine vision & vision ai (opencv / ai models)": `https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?${q}`,
  "predictive maintenance systems (ai-based)": `https://images.unsplash.com/photo-1451187580459-43490279c0fa?${q}`,
  "digital twin technology": `https://images.unsplash.com/photo-1627398242454-45a1465c2479?${q}`,
  "industrial iot architecture (mqtt, opc-ua)": `https://images.unsplash.com/photo-1544197150-b99a580bb7a8?${q}`,
  "edge computing in manufacturing": `https://images.unsplash.com/photo-1544383835-bda2bc66a55d?${q}`,
  "advanced data analytics for manufacturing": `https://images.unsplash.com/photo-1460925895917-afdab827c52f?${q}`,
  "amr / agv systems (autonomous robots)": `https://images.unsplash.com/photo-1485827404703-89b55fcc595e?${q}`,
  "automation and robotics capstone project (real use case)": `https://images.unsplash.com/photo-1517694712202-14dd9538aa97?${q}`,
};

const BY_COURSE_NAME_MERGED = { ...BY_COURSE_NAME, ...INDUSTRY_COURSE_COVERS };

const DEFAULT = `https://images.unsplash.com/photo-1498050108023-c5249f4df085?${q}`;

/** Fallback for new courses not yet in the map */
const KEYWORD_FALLBACK = [
  // --- Core IT (programming / systems / data) ---
  {
    test: (n) => n.includes("data structures") || n.includes("(dsa)") || n.includes("dsa"),
    url: `https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?${q}`,
  },
  {
    test: (n) =>
      n.includes("operating system") || (n.includes("windows") && n.includes("os")) || n.includes("os fundamentals"),
    url: `https://images.unsplash.com/photo-1558494949-ef010cbdcc31?${q}`,
  },
  {
    test: (n) => n.includes("computer networks") || (n.includes("networks") && n.includes("computer")),
    url: `https://images.unsplash.com/photo-1544197150-b99a580bb7a8?${q}`,
  },
  {
    test: (n) => n.includes("database management") || n.includes("sql") || n.includes("mongodb"),
    url: `https://images.unsplash.com/photo-1544383835-bda2bc66a55d?${q}`,
  },
  {
    test: (n) => n.includes("mern") || (n.includes("react") && n.includes("node")) || (n.includes("mongodb") && n.includes("express")),
    url: `https://images.unsplash.com/photo-1627398242454-45a1465c2479?${q}`,
  },
  {
    test: (n) => n.includes("next.js") || (n.includes("next") && !n.includes("next to")),
    url: `https://images.unsplash.com/photo-1498050108023-c5249f4df085?${q}`,
  },
  {
    test: (n) => n.includes("api development") || (n.includes("express") && n.includes("api")) || (n.includes("node.js") && n.includes("express")),
    url: `https://images.unsplash.com/photo-1555066931-4365d14bab8c?${q}`,
  },
  {
    test: (n) => n.includes("aws") || (n.includes("s3") && n.includes("ec2")) || n.includes("lambda"),
    url: `https://images.unsplash.com/photo-1451187580459-43490279c0fa?${q}`,
  },
  {
    test: (n) => n.includes("devops") || n.includes("ci/cd") || n.includes("github actions") || n.includes("github action"),
    url: `https://images.unsplash.com/photo-1605745341112-85968b19335b?${q}`,
  },
  {
    test: (n) => n.includes("react") || n.includes("javascript") || n.includes("es6"),
    url: `https://images.unsplash.com/photo-1633356122544-f134324a6cee?${q}`,
  },
  {
    test: (n) => n.includes("machine learning") || n.includes("artificial intelligence") || n.includes("ai fundamentals"),
    url: `https://images.unsplash.com/photo-1677442136019-21780ecad995?${q}`,
  },
  {
    test: (n) => n.includes("excel") || n.includes("power bi") || n.includes("mis") || n.includes("dashboard") || n.includes("pivot"),
    url: `https://images.unsplash.com/photo-1551288049-bebda4e38f71?${q}`,
  },

  {
    test: (n) => n.includes("c++"),
    url: `https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?${q}`,
  },
  {
    test: (n) => n.includes("java"),
    url: `https://images.unsplash.com/photo-1627398242454-45a1465c2479?${q}`,
  },
  {
    test: (n) => n.includes("c programming") || (n.includes("c ") && n.includes("programming")),
    url: `https://images.unsplash.com/photo-1518770660439-4636190af475?${q}`,
  },
  {
    test: (n) =>
      (n.includes("automation") ||
        n.includes("control systems") ||
        n.includes("controller") ||
        (n.includes("control") && n.includes("system"))) &&
      !n.includes("robot") &&
      !n.includes("plc") &&
      !n.includes("scada"),
    url: `https://images.unsplash.com/photo-1503387762-592deb58ef4e?${q}`,
  },
  {
    test: (n) =>
      n.includes("sensor") ||
      n.includes("actuator") ||
      n.includes("instrumentation") ||
      n.includes("transmitter") ||
      n.includes("signal processing") ||
      n.includes("vibration"),
    url: `https://images.unsplash.com/photo-1518709268805-4e9042af2176?${q}`,
  },
  {
    test: (n) => n.includes("safety") || n.includes("standards") || n.includes("loto"),
    url: `https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?${q}`,
  },
  {
    test: (n) =>
      (n.includes("electrical") || n.includes("electronics")) && n.includes("industrial"),
    url: `https://images.unsplash.com/photo-1581094794329-c8112a89af12?${q}`,
  },
  {
    test: (n) => n.includes("digital skills") || n.includes("smart industry") || n.includes("smart industries"),
    url: `https://images.unsplash.com/photo-1551288049-bebda4e38f71?${q}`,
  },
  {
    test: (n) =>
      n.includes("data acquisition") ||
      n.includes("monitoring") ||
      n.includes("daq") ||
      n.includes("telemetry"),
    url: `https://images.unsplash.com/photo-1551288049-bebda4e38f71?${q}`,
  },
  {
    test: (n) => n.includes("lean") || n.includes("six sigma") || n.includes("5s") || n.includes("kaizen"),
    url: `https://images.unsplash.com/photo-1451187580459-43490279c0fa?${q}`,
  },
  {
    test: (n) =>
      n.includes("production planning") ||
      n.includes("planning &") ||
      n.includes("smart factory") ||
      n.includes("value stream") ||
      n.includes("mes") ||
      n.includes("oee"),
    url: `https://images.unsplash.com/photo-1581092160562-40aa08e78837?${q}`,
  },

  {
    test: (n) => n.includes("digital twin"),
    url: `https://images.unsplash.com/photo-1627398242454-45a1465c2479?${q}`,
  },
  {
    test: (n) => n.includes("predictive maintenance"),
    url: `https://images.unsplash.com/photo-1677442136019-21780ecad995?${q}`,
  },
  {
    test: (n) => n.includes("machine vision") || n.includes("opencv") || n.includes("vision ai"),
    url: `https://images.unsplash.com/photo-1581092160562-40aa08e78837?${q}`,
  },
  {
    test: (n) => n.includes("scada") || n.includes("hmi"),
    url: `https://images.unsplash.com/photo-1581092160562-40aa08e78837?${q}`,
  },
  {
    test: (n) => n.includes("plc"),
    url: `https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?${q}`,
  },
  {
    test: (n) =>
      n.includes("robot") ||
      n.includes("cobot") ||
      n.includes("amr") ||
      n.includes("agv") ||
      n.includes("fanuc") ||
      n.includes("abb") ||
      n.includes("kuka"),
    url: `https://images.unsplash.com/photo-1518770660439-4636190af475?${q}`,
  },
  {
    test: (n) => n.includes("mqtt") || n.includes("iiot") || n.includes("iot") || n.includes("opc-ua") || n.includes("opc ua"),
    url: `https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?${q}`,
  },
  {
    test: (n) => n.includes("modbus") || n.includes("opc") || n.includes("protocol"),
    url: `https://images.unsplash.com/photo-1544197150-b99a580bb7a8?${q}`,
  },
  {
    test: (n) =>
      n.includes("cyber") ||
      n.includes("security") ||
      n.includes("ot security") ||
      n.includes("iec 62443") ||
      n.includes("ransomware"),
    url: `https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?${q}`,
  },
  {
    test: (n) => n.includes("analytics") || n.includes("data analytics") || n.includes("dashboards") || n.includes("kpi"),
    url: `https://images.unsplash.com/photo-1551288049-bebda4e38f71?${q}`,
  },
  {
    test: (n) => n.includes("cloud") || n.includes("aws") || n.includes("azure"),
    url: `https://images.unsplash.com/photo-1451187580459-43490279c0fa?${q}`,
  },
  {
    test: (n) => n.includes("edge computing") || n.includes("edge "),
    url: `https://images.unsplash.com/photo-1451187580459-43490279c0fa?${q}`,
  },

  {
    test: (n) => n.includes("industry 4.0") || n.includes("automation and robotics"),
    url: `https://images.unsplash.com/photo-1581092160562-40aa08e78837?${q}`,
  },
  { test: (n) => n.includes("digital literacy") || n.includes("cyber safety"), url: `https://images.unsplash.com/photo-1550751827-4bd374c3f58b?${q}` },
  { test: (n) => n.includes("internet") || n.includes("email"), url: `https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?${q}` },
  { test: (n) => n.includes("computer") && n.includes("basic"), url: `https://images.unsplash.com/photo-1517694712202-14dd9538aa97?${q}` },
  { test: (n) => n.includes("office") || n.includes("excel") || n.includes("powerpoint"), url: `https://images.unsplash.com/photo-1586281380349-632531db7ed4?${q}` },
  { test: (n) => n.includes("python"), url: `https://images.unsplash.com/photo-1526379095098-d400fd0bf935?${q}` },
  { test: (n) => n.includes("react") || n.includes("mern") || n.includes("javascript"), url: `https://images.unsplash.com/photo-1633356122544-f134324a6cee?${q}` },
  { test: (n) => n.includes("machine learning") || n.includes("artificial intelligence"), url: `https://images.unsplash.com/photo-1677442136019-21780ecad995?${q}` },
  { test: (n) => n.includes("generative") || n.includes("chatgpt"), url: `https://images.unsplash.com/photo-1620712943543-bcc4688e7485?${q}` },
];

/** Unsplash imgix-style params — sharp 16∶9-style covers for catalog (Udemy/Coursera-like). */
const IMAGE_VARIANT_PARAMS = {
  /** Main grid / course cards */
  card: "w=960&h=540&fit=crop&auto=format&q=82",
  /** Tier row mini cards */
  compact: "w=640&h=400&fit=crop&auto=format&q=80",
  /** Small list avatars */
  thumb: "w=256&h=256&fit=crop&auto=format&q=78",
  /** Course detail hero */
  detail: "w=1280&h=720&fit=crop&auto=format&q=82",
};

const SOURCE_DIMS = {
  card: { w: 960, h: 540 },
  compact: { w: 640, h: 400 },
  thumb: { w: 256, h: 256 },
  detail: { w: 1280, h: 720 },
};

function hash32(input) {
  // small, stable, non-crypto hash for unsplash sig + gradients
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) || 1;
}

// Avoid duplicates on a page: assign each cover once if possible.
const _coverAssignedByCourse = new Map(); // courseName(lower) -> cover path
const _coverUsed = new Set(); // cover path

function pickFromPool(courseName, pool) {
  const key = String(courseName || "").toLowerCase();
  if (_coverAssignedByCourse.has(key)) return _coverAssignedByCourse.get(key);

  const seed = hash32(key);
  const start = seed % pool.length;
  let chosen = pool[start];

  // Try to find an unused cover to reduce duplicates.
  for (let i = 0; i < pool.length; i += 1) {
    const candidate = pool[(start + i) % pool.length];
    if (!_coverUsed.has(candidate)) {
      chosen = candidate;
      break;
    }
  }

  _coverAssignedByCourse.set(key, chosen);
  _coverUsed.add(chosen);
  return chosen;
}

function pickLocalCover(courseName) {
  const n = String(courseName || "").toLowerCase();

  // --- Programming languages (order matters: JavaScript before Java; C++ before C) ---
  if (n.includes("javascript") || n.includes("es6") || n.includes("typescript"))
    return pickFromPool(courseName, ["/course-covers/cover-js.jpg", "/course-covers/cover-js2.jpg"]);
  if (n.includes("c++") || n.includes("c ++")) return "/course-covers/cover-cpp.jpg";
  if (n.includes("c programming") || /^c\s+programming\b/.test(n)) return "/course-covers/cover-c.jpg";
  if (n.includes("java") && !n.includes("javascript")) {
    return pickFromPool(courseName, ["/course-covers/cover-java.jpg", "/course-covers/cover-node.jpg"]);
  }

  // --- AI / Data ---
  if (n.includes("machine learning") || n.includes("ml"))
    return pickFromPool(courseName, ["/course-covers/cover-ml.jpg", "/course-covers/cover-ml2.jpg", "/course-covers/cover-ml3.jpg"]);
  if (n.includes("ai"))
    return pickFromPool(courseName, ["/course-covers/cover-ai.jpg", "/course-covers/cover-ai2.jpg", "/course-covers/cover-ai3.jpg"]);
  if (n.includes("data science"))
    return pickFromPool(courseName, [
      "/course-covers/cover-ml.jpg",
      "/course-covers/cover-ml2.jpg",
      "/course-covers/cover-ml3.jpg",
      "/course-covers/cover-analytics.jpg",
      "/course-covers/cover-analytics2.jpg",
      "/course-covers/cover-analytics3.jpg",
    ]);
  if (n.includes("data analyst") || n.includes("data analytics") || n.includes("power bi"))
    return pickFromPool(courseName, [
      "/course-covers/cover-analytics.jpg",
      "/course-covers/cover-analytics2.jpg",
      "/course-covers/cover-analytics3.jpg",
      "/course-covers/cover-excel.jpg",
    ]);

  // --- Programming / Web ---
  if (n.includes("python"))
    return pickFromPool(courseName, ["/course-covers/cover-python.jpg", "/course-covers/cover-python2.jpg", "/course-covers/cover-python3.jpg"]);
  if (n.includes("data structures") || n.includes("(dsa)") || n.includes("dsa")) return "/course-covers/cover-dsa.jpg";
  if (n.includes("react"))
    return pickFromPool(courseName, ["/course-covers/cover-react.jpg", "/course-covers/cover-react2.jpg"]);
  if (n.includes("full stack"))
    return pickFromPool(courseName, [
      "/course-covers/cover-web.jpg",
      "/course-covers/cover-web2.jpg",
      "/course-covers/cover-web3.jpg",
      "/course-covers/cover-web4.jpg",
      "/course-covers/cover-web5.jpg",
    ]);
  if (n.includes("next.js") || n.includes("nextjs") || n.includes("html") || n.includes("css") || n.includes("bootstrap"))
    return pickFromPool(courseName, [
      "/course-covers/cover-web.jpg",
      "/course-covers/cover-web2.jpg",
      "/course-covers/cover-web3.jpg",
      "/course-covers/cover-web4.jpg",
      "/course-covers/cover-web5.jpg",
    ]);
  if (n.includes("web design"))
    return pickFromPool(courseName, [
      "/course-covers/cover-web.jpg",
      "/course-covers/cover-web2.jpg",
      "/course-covers/cover-design.jpg",
      "/course-covers/cover-web4.jpg",
    ]);
  if (n.includes("coding for beginners") || (n.includes("beginner") && n.includes("coding")))
    return pickFromPool(courseName, [
      "/course-covers/cover-js.jpg",
      "/course-covers/cover-js2.jpg",
      "/course-covers/cover-web3.jpg",
      "/course-covers/cover-python.jpg",
    ]);
  if (n.includes("api") || n.includes("node") || n.includes("express"))
    return pickFromPool(courseName, ["/course-covers/cover-node.jpg", "/course-covers/cover-node2.jpg"]);
  if (n.includes("git") || n.includes("github"))
    return pickFromPool(courseName, ["/course-covers/cover-devops.jpg", "/course-covers/cover-devops2.jpg", "/course-covers/cover-git2.jpg"]);

  // --- Systems / Infra ---
  if (n.includes("operating system")) return "/course-covers/cover-os.jpg";
  if (n.includes("computer networks") || (n.includes("network") && n.includes("computer")))
    return "/course-covers/cover-networks.jpg";
  if (n.includes("database") || n.includes("sql") || n.includes("mongodb"))
    return pickFromPool(courseName, ["/course-covers/cover-db.jpg", "/course-covers/cover-db2.jpg"]);
  if (n.includes("aws") || n.includes("cloud") || n.includes("s3") || n.includes("ec2") || n.includes("lambda"))
    return pickFromPool(courseName, ["/course-covers/cover-cloud.jpg", "/course-covers/cover-cloud2.jpg"]);
  if (n.includes("ci/cd") || n.includes("devops") || n.includes("github actions"))
    return pickFromPool(courseName, ["/course-covers/cover-devops.jpg", "/course-covers/cover-devops2.jpg"]);

  // --- Security ---
  if (n.includes("cyber") || n.includes("security") || n.includes("hacking"))
    return pickFromPool(courseName, [
      "/course-covers/cover-cyber.jpg",
      "/course-covers/cover-cyber2.jpg",
      "/course-covers/cover-cyber3.jpg",
      "/course-covers/cover-cyber4.jpg",
      "/course-covers/cover-cyber5.jpg",
    ]);

  // --- Office / Basics ---
  if (n.includes("excel"))
    return pickFromPool(courseName, [
      "/course-covers/cover-excel.jpg",
      "/course-covers/cover-analytics.jpg",
      "/course-covers/cover-analytics2.jpg",
      "/course-covers/cover-analytics3.jpg",
    ]);
  if (n.includes("ms office") || n.includes("powerpoint") || n.includes("word"))
    return pickFromPool(courseName, ["/course-covers/cover-office.jpg", "/course-covers/cover-office2.jpg"]);
  if (n.includes("computer fundamentals") || n.includes("basic computer"))
    return pickFromPool(courseName, ["/course-covers/cover-web.jpg", "/course-covers/cover-web2.jpg", "/course-covers/cover-web4.jpg"]);
  if (n.includes("resume") || n.includes("interview")) return "/course-covers/cover-resume.jpg";
  if (n.includes("spoken english") || n.includes("communication")) return "/course-covers/cover-communication.jpg";
  if (n.includes("ui/ux") || n.includes("figma") || n.includes("canva") || n.includes("graphic design"))
    return pickFromPool(courseName, ["/course-covers/cover-design.jpg", "/course-covers/cover-web3.jpg", "/course-covers/cover-web4.jpg"]);
  if (n.includes("kids") || n.includes("scratch") || n.includes("drawing") || n.includes("handwriting"))
    return "/course-covers/cover-kids.jpg";

  // --- Automation & Robotics (specific topics before generic "automation") ---
  if (n.includes("smart manufacturing")) return "/course-covers/cover-smart-mfg.jpg";
  if (n.includes("lean manufacturing") || n.includes("six sigma") || n.includes("5s") || n.includes("kaizen"))
    return "/course-covers/cover-lean.jpg";
  if (
    n.includes("production planning") ||
    n.includes("smart factory") ||
    n.includes("value stream") ||
    (n.includes("planning") && n.includes("factory"))
  ) {
    return pickFromPool(courseName, ["/course-covers/cover-production.jpg", "/course-covers/cover-smart-mfg.jpg", "/course-covers/cover-industry.jpg"]);
  }
  if (n.includes("advanced sensors") || (n.includes("signal processing") && n.includes("sensor"))) {
    return pickFromPool(courseName, ["/course-covers/cover-instrumentation.jpg", "/course-covers/cover-sensors.jpg", "/course-covers/cover-electronics.jpg"]);
  }
  if (n.includes("sensor") || n.includes("actuator")) {
    return pickFromPool(courseName, ["/course-covers/cover-sensors.jpg", "/course-covers/cover-electronics.jpg", "/course-covers/cover-instrumentation.jpg"]);
  }
  if (n.includes("instrumentation")) return "/course-covers/cover-instrumentation.jpg";
  if (n.includes("mechatronics")) return "/course-covers/cover-mechatronics.jpg";
  if (n.includes("data acquisition") || n.includes("monitoring systems") || n.includes("daq") || n.includes("telemetry")) {
    return pickFromPool(courseName, ["/course-covers/cover-daq.jpg", "/course-covers/cover-analytics.jpg", "/course-covers/cover-analytics2.jpg"]);
  }

  if (n.includes("plc")) return "/course-covers/cover-plc.jpg";
  if (n.includes("machine vision") || n.includes("vision ai") || n.includes("computer vision"))
    return pickFromPool(courseName, ["/course-covers/cover-vision.jpg", "/course-covers/cover-industry2.jpg", "/course-covers/cover-industry3.jpg"]);
  if (n.includes("iot") || n.includes("iiot") || n.includes("mqtt") || n.includes("opc"))
    return pickFromPool(courseName, ["/course-covers/cover-iot.jpg", "/course-covers/cover-industry.jpg", "/course-covers/cover-industry2.jpg"]);
  if (n.includes("edge computing") || (/\bedge\b/.test(n) && n.includes("manufacturing")))
    return pickFromPool(courseName, [
      "/course-covers/cover-iot.jpg",
      "/course-covers/cover-industry2.jpg",
      "/course-covers/cover-cloud.jpg",
      "/course-covers/cover-industry3.jpg",
    ]);
  if (n.includes("safety") || n.includes("standards")) return "/course-covers/cover-safety.jpg";
  if (n.includes("electrical") || n.includes("electronics")) return "/course-covers/cover-electronics.jpg";
  if (n.includes("scada") || n.includes("hmi") || n.includes("automation"))
    return pickFromPool(courseName, ["/course-covers/cover-industry.jpg", "/course-covers/cover-industry2.jpg", "/course-covers/cover-industry3.jpg"]);
  if (n.includes("robot") || n.includes("cobot") || n.includes("agv") || n.includes("amr"))
    return pickFromPool(courseName, ["/course-covers/cover-robotics.jpg", "/course-covers/cover-robotics2.jpg", "/course-covers/cover-robotics3.jpg"]);
  if (n.includes("testing")) return "/course-covers/cover-testing.jpg";

  return null;
}

/**
 * Local SVG fallback (used when a remote image fails to load).
 * @param {string} courseName
 * @param {"card"|"compact"|"thumb"|"detail"} [variant="card"]
 */
export function getCourseImageFallback(courseName, variant = "card") {
  const key = String(courseName || "").trim() || "Course";
  const seed = hash32(key);
  const { w, h } = SOURCE_DIMS[variant] || SOURCE_DIMS.card;
  const a = (seed % 360);
  const b = ((seed * 7) % 360);
  const label = key.length > 38 ? `${key.slice(0, 38)}…` : key;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${a} 80% 60%)"/>
      <stop offset="1" stop-color="hsl(${b} 80% 45%)"/>
    </linearGradient>
    <radialGradient id="r" cx="30%" cy="30%" r="80%">
      <stop offset="0" stop-color="#fff" stop-opacity="0.22"/>
      <stop offset="0.55" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <rect width="${w}" height="${h}" fill="url(#r)"/>
  <g opacity="0.9">
    <rect x="${Math.round(w * 0.06)}" y="${Math.round(h * 0.70)}" width="${Math.round(w * 0.88)}" height="${Math.round(h * 0.22)}" rx="16" fill="rgba(255,255,255,0.16)"/>
    <text x="${Math.round(w * 0.09)}" y="${Math.round(h * 0.82)}" fill="rgba(255,255,255,0.92)" font-family="Plus Jakarta Sans, system-ui, -apple-system, Segoe UI, sans-serif" font-size="${Math.max(18, Math.round(w * 0.035))}" font-weight="800">${label.replace(/&/g, "&amp;")}</text>
  </g>
</svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

/**
 * Returns a unique, topic-relevant cover image.
 * NOTE: External image CDNs (like Unsplash) can be blocked on some networks/environments.
 * To ensure the UI always renders without broken thumbnails, we use a local SVG cover as the primary source.
 *
 * @param {string} courseName
 * @param {"card"|"compact"|"thumb"|"detail"} [variant="card"]
 */
export function getCourseImage(courseName, variant = "card") {
  // Prefer local bundled images to avoid external CDN blocks.
  // If a local cover isn't matched, use an SVG fallback.
  const local = pickLocalCover(courseName);
  return local || getCourseImageFallback(courseName, variant);
}
