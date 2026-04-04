const stroke = "rgba(56, 189, 248, 0.95)";
const strokeDim = "rgba(56, 189, 248, 0.45)";
const accent = "rgba(248, 113, 113, 0.95)";

function Node({ cx, cy, r = 2 }) {
  return <circle cx={cx} cy={cy} r={r} fill={accent} />;
}

/** Wireframe robot head profile (left-facing), AI / robotics vibe */
function GraphicAi() {
  return (
    <svg viewBox="0 0 140 160" className="course-tech-banner__svg" aria-hidden>
      <g fill="none" stroke={stroke} strokeWidth="1.2" strokeLinejoin="round">
        <path d="M98 28 L118 42 L122 88 L108 128 L78 142 L52 130 L44 96 L48 52 L72 32 Z" />
        <path d="M72 32 L88 24 L104 34" />
        <path d="M58 72 L92 68" />
        <path d="M56 96 L96 92" />
        <path d="M108 56 L124 48 L128 72 L116 78" />
        <path d="M62 118 L88 124" />
      </g>
      <Node cx={76} cy={48} />
      <Node cx={98} cy={62} />
      <Node cx={104} cy={96} />
      <Node cx={72} cy={108} />
    </svg>
  );
}

function GraphicRobot() {
  return (
    <svg viewBox="0 0 140 160" className="course-tech-banner__svg" aria-hidden>
      <g fill="none" stroke={stroke} strokeWidth="1.2">
        <rect x="48" y="36" width="56" height="44" rx="6" />
        <path d="M56 80 L56 108 L40 124 M84 80 L84 108 L100 124" />
        <circle cx="62" cy="58" r="6" stroke={strokeDim} />
        <circle cx="90" cy="58" r="6" stroke={strokeDim} />
        <path d="M68 118 L92 118 L96 138 L64 138 Z" />
        <path d="M76 24 L76 36 M64 28 L88 28" />
      </g>
      <Node cx={54} cy={94} />
      <Node cx={96} cy={100} />
    </svg>
  );
}

function GraphicFactory() {
  return (
    <svg viewBox="0 0 140 160" className="course-tech-banner__svg" aria-hidden>
      <g fill="none" stroke={stroke} strokeWidth="1.2">
        <path d="M36 120 L36 72 L52 60 L52 120 M52 68 L76 52 L76 120" />
        <rect x="76" y="88" width="48" height="32" />
        <path d="M84 88 L84 72 L100 64 L116 72 L116 88" />
        <line x1="44" y1="96" x2="44" y2="104" stroke={strokeDim} />
        <line x1="64" y1="88" x2="64" y2="100" stroke={strokeDim} />
      </g>
      <Node cx={98} cy={102} />
      <Node cx={112} cy={78} />
    </svg>
  );
}

function GraphicCode() {
  return (
    <svg viewBox="0 0 140 160" className="course-tech-banner__svg" aria-hidden>
      <g fill="none" stroke={stroke} strokeWidth="1.4" strokeLinecap="round">
        <path d="M52 48 L36 80 L52 112" />
        <path d="M88 48 L104 80 L88 112" />
        <line x1="72" y1="40" x2="68" y2="120" stroke={strokeDim} strokeWidth="1" />
      </g>
      <g stroke={strokeDim} strokeWidth="1">
        <line x1="44" y1="128" x2="96" y2="128" />
        <line x1="48" y1="136" x2="88" y2="136" />
      </g>
      <Node cx={70} cy={64} />
    </svg>
  );
}

function GraphicPython() {
  return (
    <svg viewBox="0 0 140 160" className="course-tech-banner__svg" aria-hidden>
      <g fill="none" stroke={stroke} strokeWidth="1.2">
        <path d="M58 36 Q42 48 42 68 Q42 88 58 96 L82 96 Q98 88 98 68 Q98 48 82 36 Z" />
        <path d="M58 96 Q42 108 42 128 Q42 140 58 148 L82 148 Q98 140 98 120 Q98 100 82 96" stroke={strokeDim} />
        <circle cx="62" cy="58" r="3" fill={accent} />
        <circle cx="78" cy="124" r="3" fill={accent} />
      </g>
    </svg>
  );
}

function GraphicData() {
  return (
    <svg viewBox="0 0 140 160" className="course-tech-banner__svg" aria-hidden>
      <g fill="none" stroke={stroke} strokeWidth="1.2">
        <ellipse cx="70" cy="52" rx="36" ry="14" />
        <ellipse cx="70" cy="80" rx="44" ry="16" />
        <ellipse cx="70" cy="110" rx="38" ry="14" />
        <line x1="52" y1="52" x2="48" y2="80" stroke={strokeDim} />
        <line x1="88" y1="52" x2="92" y2="80" stroke={strokeDim} />
        <line x1="48" y1="80" x2="52" y2="110" stroke={strokeDim} />
        <line x1="92" y1="80" x2="88" y2="110" stroke={strokeDim} />
      </g>
      <Node cx={70} cy={80} />
    </svg>
  );
}

function GraphicNetwork() {
  return (
    <svg viewBox="0 0 140 160" className="course-tech-banner__svg" aria-hidden>
      <g fill="none" stroke={stroke} strokeWidth="1.2">
        <rect x="40" y="44" width="28" height="20" rx="3" />
        <rect x="76" y="36" width="28" height="20" rx="3" />
        <rect x="58" y="96" width="32" height="22" rx="3" />
        <path d="M54 64 L70 84 M90 56 L74 84 M74 118 L70 96" stroke={strokeDim} />
      </g>
      <Node cx={54} cy={54} />
      <Node cx={90} cy={46} />
      <Node cx={74} cy={107} />
    </svg>
  );
}

function GraphicCloud() {
  return (
    <svg viewBox="0 0 140 160" className="course-tech-banner__svg" aria-hidden>
      <path
        d="M48 104 Q32 104 32 88 Q32 72 48 68 Q52 48 72 44 Q88 32 104 44 Q124 40 124 60 Q136 64 136 80 Q136 100 118 104 Z"
        fill="none"
        stroke={stroke}
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <Node cx={78} cy={72} />
      <Node cx={108} cy={78} />
    </svg>
  );
}

function GraphicOffice() {
  return (
    <svg viewBox="0 0 140 160" className="course-tech-banner__svg" aria-hidden>
      <g fill="none" stroke={stroke} strokeWidth="1.2">
        <rect x="38" y="44" width="64" height="48" rx="4" />
        <path d="M46 56 L94 56 M46 68 L82 68 M46 80 L76 80" stroke={strokeDim} />
        <rect x="52" y="100" width="36" height="8" rx="2" fill="rgba(56,189,248,0.15)" stroke={stroke} />
      </g>
      <Node cx={88} cy={62} />
    </svg>
  );
}

function GraphicCircuit() {
  return (
    <svg viewBox="0 0 140 160" className="course-tech-banner__svg" aria-hidden>
      <g fill="none" stroke={stroke} strokeWidth="1.2">
        <path d="M36 80 H56 L64 56 L72 104 L80 48 L88 96 L96 72 H108" />
        <circle cx="36" cy="80" r="4" stroke={strokeDim} />
        <circle cx="108" cy="72" r="4" stroke={strokeDim} />
      </g>
      <Node cx={72} cy={56} />
      <Node cx={88} cy={96} />
    </svg>
  );
}

const MAP = {
  ai: GraphicAi,
  robot: GraphicRobot,
  factory: GraphicFactory,
  code: GraphicCode,
  python: GraphicPython,
  data: GraphicData,
  network: GraphicNetwork,
  cloud: GraphicCloud,
  office: GraphicOffice,
  circuit: GraphicCircuit,
};

export default function CourseBannerGraphic({ glyph }) {
  const Cmp = MAP[glyph] || GraphicCircuit;
  return <Cmp />;
}
