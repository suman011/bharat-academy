import { useId } from "react";

const muted = "rgba(148, 163, 184, 0.35)";
const line = "rgba(186, 230, 253, 0.55)";
const lineStrong = "rgba(125, 211, 252, 0.85)";
const fillSoft = "rgba(56, 189, 248, 0.08)";
const accentSoft = "rgba(251, 191, 36, 0.45)";

function Defs({ rid }) {
  return (
    <defs>
      <linearGradient id={`${rid}-ln`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.45" />
      </linearGradient>
      <linearGradient id={`${rid}-or`} x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#fb923c" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#f97316" stopOpacity="0.12" />
      </linearGradient>
    </defs>
  );
}

/** AI: neural hub — nodes on a ring, distinct from ML chart */
function GraphicAi({ rid }) {
  return (
    <svg viewBox="0 0 140 160" className="course-tech-banner__svg" aria-hidden>
      <Defs rid={rid} />
      <circle cx="72" cy="82" r="38" fill={fillSoft} stroke={`url(#${rid}-ln)`} strokeWidth="1" opacity="0.9" />
      <g fill="none" stroke={lineStrong} strokeWidth="1.15" strokeLinecap="round">
        <line x1="72" y1="44" x2="72" y2="56" />
        <line x1="72" y1="108" x2="72" y2="120" />
        <line x1="34" y1="82" x2="46" y2="82" />
        <line x1="98" y1="82" x2="110" y2="82" />
        <line x1="45" y1="55" x2="54" y2="64" />
        <line x1="99" y1="55" x2="90" y2="64" />
        <line x1="45" y1="109" x2="54" y2="100" />
        <line x1="99" y1="109" x2="90" y2="100" />
      </g>
      <circle cx="72" cy="82" r="6" fill={`url(#${rid}-or)`} stroke={lineStrong} strokeWidth="0.9" />
      <circle cx="72" cy="56" r="3.5" fill="rgba(186,230,253,0.35)" stroke={line} strokeWidth="0.8" />
      <circle cx="72" cy="108" r="3.5" fill="rgba(186,230,253,0.35)" stroke={line} strokeWidth="0.8" />
      <circle cx="46" cy="82" r="3.5" fill="rgba(186,230,253,0.35)" stroke={line} strokeWidth="0.8" />
      <circle cx="98" cy="82" r="3.5" fill="rgba(186,230,253,0.35)" stroke={line} strokeWidth="0.8" />
    </svg>
  );
}

/** ML: model fit — scatter + smooth curve (not the same as AI hub) */
function GraphicMl({ rid }) {
  return (
    <svg viewBox="0 0 140 160" className="course-tech-banner__svg" aria-hidden>
      <Defs rid={rid} />
      <rect x="34" y="38" width="74" height="88" rx="10" fill="rgba(15,23,42,0.35)" stroke={muted} strokeWidth="0.9" />
      <path
        d="M 42 108 Q 58 72, 72 68 T 102 44"
        fill="none"
        stroke={`url(#${rid}-ln)`}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.95"
      />
      {[
        [48, 102],
        [54, 96],
        [62, 88],
        [70, 74],
        [78, 62],
        [88, 54],
        [96, 48],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.8" fill="rgba(186,230,253,0.5)" stroke={lineStrong} strokeWidth="0.6" />
      ))}
      <path d="M 40 118 H 102" stroke={muted} strokeWidth="0.75" strokeDasharray="3 4" />
      <path d="M 40 118 V 44" stroke={muted} strokeWidth="0.75" strokeDasharray="3 4" />
    </svg>
  );
}

/** Python: abstract dual-track (readable, not generic wireframe) */
function GraphicPython({ rid }) {
  return (
    <svg viewBox="0 0 140 160" className="course-tech-banner__svg" aria-hidden>
      <Defs rid={rid} />
      <path
        d="M 48 42 Q 38 52 38 68 Q 38 84 50 92 L 78 92 Q 92 84 92 68 Q 92 52 80 44 Q 66 36 48 42 Z"
        fill="rgba(14,165,233,0.12)"
        stroke={`url(#${rid}-ln)`}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M 52 100 Q 40 110 40 126 Q 40 138 54 142 L 82 142 Q 96 136 96 120 Q 96 104 84 98 Q 70 92 52 100 Z"
        fill="rgba(251,146,60,0.08)"
        stroke={`url(#${rid}-or)`}
        strokeWidth="1.1"
        strokeLinejoin="round"
        opacity="0.95"
      />
      <circle cx="56" cy="62" r="2.5" fill="rgba(255,255,255,0.5)" />
      <circle cx="70" cy="118" r="2.5" fill="rgba(255,255,255,0.45)" />
    </svg>
  );
}

function GraphicRobot({ rid }) {
  return (
    <svg viewBox="0 0 140 160" className="course-tech-banner__svg" aria-hidden>
      <Defs rid={rid} />
      <g fill="none" stroke={`url(#${rid}-ln)`} strokeWidth="1.15" strokeLinejoin="round">
        <rect x="50" y="42" width="52" height="40" rx="8" fill={fillSoft} />
        <path d="M58 82 V 102 L 44 118 M82 82 V 102 L 96 118" strokeLinecap="round" />
        <path d="M66 128 H 86 L 90 144 H 62 Z" fill="rgba(56,189,248,0.06)" />
        <path d="M70 34 V 42 M58 38 H 82" strokeLinecap="round" />
      </g>
      <circle cx="62" cy="58" r="5" stroke={muted} strokeWidth="0.9" fill="rgba(15,23,42,0.4)" />
      <circle cx="90" cy="58" r="5" stroke={muted} strokeWidth="0.9" fill="rgba(15,23,42,0.4)" />
    </svg>
  );
}

function GraphicFactory({ rid }) {
  return (
    <svg viewBox="0 0 140 160" className="course-tech-banner__svg" aria-hidden>
      <Defs rid={rid} />
      <g fill="none" stroke={`url(#${rid}-ln)`} strokeWidth="1.1">
        <path d="M38 122 V 74 L 54 62 V 122" fill="rgba(56,189,248,0.05)" />
        <path d="M54 70 L 78 54 V 122" />
        <rect x="78" y="90" width="46" height="32" rx="3" fill={fillSoft} />
        <path d="M86 90 V 74 L 100 66 L 114 74 V 90" />
      </g>
      <rect x="92" y="102" width="18" height="10" rx="2" fill={accentSoft} opacity="0.5" />
    </svg>
  );
}

function GraphicCode({ rid }) {
  return (
    <svg viewBox="0 0 140 160" className="course-tech-banner__svg" aria-hidden>
      <Defs rid={rid} />
      <g fill="none" stroke={`url(#${rid}-ln)`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M54 50 L 38 80 L 54 110" />
        <path d="M86 50 L 102 80 L 86 110" />
      </g>
      <g stroke={muted} strokeWidth="0.85" strokeLinecap="round">
        <line x1="48" y1="128" x2="94" y2="128" />
        <line x1="52" y1="136" x2="84" y2="136" />
        <line x1="56" y1="144" x2="78" y2="144" />
      </g>
    </svg>
  );
}

function GraphicData({ rid }) {
  return (
    <svg viewBox="0 0 140 160" className="course-tech-banner__svg" aria-hidden>
      <Defs rid={rid} />
      <g fill="none" stroke={`url(#${rid}-ln)`} strokeWidth="1.05">
        <ellipse cx="70" cy="54" rx="34" ry="12" fill={fillSoft} />
        <ellipse cx="70" cy="82" rx="42" ry="14" fill="rgba(56,189,248,0.05)" />
        <ellipse cx="70" cy="112" rx="36" ry="12" fill="rgba(251,146,60,0.06)" />
      </g>
      <g stroke={muted} strokeWidth="0.75">
        <line x1="52" y1="54" x2="48" y2="82" />
        <line x1="88" y1="54" x2="92" y2="82" />
        <line x1="48" y1="82" x2="52" y2="112" />
        <line x1="92" y1="82" x2="88" y2="112" />
      </g>
    </svg>
  );
}

function GraphicNetwork({ rid }) {
  return (
    <svg viewBox="0 0 140 160" className="course-tech-banner__svg" aria-hidden>
      <Defs rid={rid} />
      <g stroke={muted} strokeWidth="0.85" fill="none">
        <path d="M54 66 L 70 88 L 90 52 M70 88 L 74 112" />
      </g>
      <g stroke={`url(#${rid}-ln)`} strokeWidth="1.05" fill={fillSoft}>
        <rect x="42" y="46" width="26" height="18" rx="4" />
        <rect x="78" y="38" width="26" height="18" rx="4" />
        <rect x="58" y="98" width="30" height="20" rx="4" />
      </g>
    </svg>
  );
}

function GraphicCloud({ rid }) {
  return (
    <svg viewBox="0 0 140 160" className="course-tech-banner__svg" aria-hidden>
      <Defs rid={rid} />
      <path
        d="M50 106 Q34 106 34 88 Q34 72 50 66 Q54 46 74 42 Q90 32 106 44 Q124 40 124 58 Q136 62 136 80 Q136 100 118 106 Z"
        fill="rgba(56,189,248,0.07)"
        stroke={`url(#${rid}-ln)`}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GraphicOffice({ rid }) {
  return (
    <svg viewBox="0 0 140 160" className="course-tech-banner__svg" aria-hidden>
      <Defs rid={rid} />
      <rect
        x="40"
        y="46"
        width="62"
        height="46"
        rx="5"
        fill="rgba(15,23,42,0.35)"
        stroke={`url(#${rid}-ln)`}
        strokeWidth="1.05"
      />
      <g stroke={muted} strokeWidth="0.8">
        <line x1="48" y1="58" x2="94" y2="58" />
        <line x1="48" y1="70" x2="82" y2="70" />
        <line x1="48" y1="82" x2="76" y2="82" />
      </g>
      <rect x="54" y="102" width="34" height="8" rx="2" fill={`url(#${rid}-or)`} opacity="0.35" stroke={line} strokeWidth="0.6" />
    </svg>
  );
}

function GraphicCircuit({ rid }) {
  return (
    <svg viewBox="0 0 140 160" className="course-tech-banner__svg" aria-hidden>
      <Defs rid={rid} />
      <g fill="none" stroke={`url(#${rid}-ln)`} strokeWidth="1.1" strokeLinejoin="round" strokeLinecap="round">
        <path d="M36 82 H 54 L 62 58 L 72 106 L 82 52 L 92 98 L 100 74 H 108" />
      </g>
      <circle cx="36" cy="82" r="3.5" fill={fillSoft} stroke={muted} strokeWidth="0.8" />
      <circle cx="108" cy="74" r="3.5" fill={fillSoft} stroke={muted} strokeWidth="0.8" />
    </svg>
  );
}

const MAP = {
  ai: GraphicAi,
  ml: GraphicMl,
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
  const rid = useId().replace(/:/g, "");
  const Cmp = MAP[glyph] || GraphicCircuit;
  return <Cmp rid={rid} />;
}
