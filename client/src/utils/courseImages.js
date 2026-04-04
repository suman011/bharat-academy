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

/**
 * @param {string} courseName
 * @param {"card"|"compact"|"thumb"|"detail"} [variant="card"]
 */
export function getCourseImage(courseName, variant = "card") {
  const key = (courseName || "").toLowerCase().trim();
  let url = BY_COURSE_NAME_MERGED[key] || null;
  if (!url) {
    for (const { test, url: u } of KEYWORD_FALLBACK) {
      if (test(key)) {
        url = u;
        break;
      }
    }
  }
  if (!url) url = DEFAULT;
  const base = url.split("?")[0];
  const params = IMAGE_VARIANT_PARAMS[variant] || IMAGE_VARIANT_PARAMS.card;
  return `${base}?${params}`;
}
