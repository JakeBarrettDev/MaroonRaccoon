function SwessoArt() {
  return (
    <svg viewBox="0 0 320 180" className="project-art" aria-hidden="true">
      <defs>
        <linearGradient id="sw-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3a1512" />
          <stop offset="1" stopColor="#6b0f0c" />
        </linearGradient>
        <linearGradient id="sw-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e0574a" />
          <stop offset="1" stopColor="#f2c9a0" />
        </linearGradient>
        <clipPath id="sw-clip">
          <rect x="-40" y="-54" width="80" height="84" rx="6" />
        </clipPath>
      </defs>

      <rect width="320" height="180" fill="url(#sw-bg)" />

      <path d="M80 90h-24m8-8-8 8 8 8" className="art-hint" />
      <path d="M240 90h24m-8-8 8 8-8 8" className="art-hint" />

      <g transform="translate(160 92) rotate(-12)">
        <rect x="-44" y="-58" width="88" height="116" rx="10" fill="#2e2621" stroke="rgba(255,255,255,0.12)" />
      </g>
      <g transform="translate(160 92) rotate(8)">
        <rect x="-44" y="-58" width="88" height="116" rx="10" fill="#4a3f36" stroke="rgba(255,255,255,0.12)" />
        <circle cx="-8" cy="-12" r="18" fill="#950000" opacity="0.6" />
        <circle cx="14" cy="4" r="12" fill="#cfc8bd" opacity="0.35" />
      </g>

      <g transform="translate(160 90)">
        <g className="swesso-top">
          <rect x="-46" y="-60" width="92" height="120" rx="10" fill="#f4ede3" />
          <g clipPath="url(#sw-clip)">
            <rect x="-40" y="-54" width="80" height="84" fill="url(#sw-sky)" />
            <circle cx="12" cy="-26" r="13" fill="#fff4e0" />
            <path d="M-40 14Q-18-12 2 6T40-2v32h-80Z" fill="#950000" />
            <path d="M-40 30q30-24 58-8t22-4v12h-80Z" fill="#5c0a08" />
          </g>
          <rect x="-40" y="38" width="46" height="5" rx="2.5" fill="#534a40" opacity="0.7" />
          <rect x="-40" y="47" width="30" height="4" rx="2" fill="#534a40" opacity="0.4" />
          <circle cx="30" cy="45" r="9" fill="#bb0101" />
          <path d="M30 49.5l-4.2-4.1a2.6 2.6 0 0 1 3.7-3.7l.5.5.5-.5a2.6 2.6 0 0 1 3.7 3.7Z" fill="#fff" />
        </g>
      </g>
    </svg>
  );
}

function JeffConnersArt() {
  return (
    <svg viewBox="0 0 320 180" className="project-art" aria-hidden="true">
      <defs>
        <linearGradient id="jc-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b332c" />
          <stop offset="1" stopColor="#2a241f" />
        </linearGradient>
        <linearGradient id="jc-beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff4e0" stopOpacity="0.28" />
          <stop offset="1" stopColor="#fff4e0" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="320" height="180" fill="url(#jc-wall)" />
      <rect y="152" width="320" height="28" fill="#211b17" />
      <path d="M136 0h48l66 152H70Z" fill="url(#jc-beam)" className="jc-beam" />

      <rect x="102" y="32" width="116" height="88" rx="2" fill="#c9a36a" />
      <rect x="108" y="38" width="104" height="76" fill="#8f7045" />
      <rect x="112" y="42" width="96" height="68" fill="#f4ede3" />

      <path d="M120 96c22-36 42 8 84-38" pathLength="1" className="jc-stroke" stroke="#950000" strokeWidth="10" />
      <path d="M122 64c30 14 50-16 80 26" pathLength="1" className="jc-stroke jc-stroke-late" stroke="#534a40" strokeWidth="5" />
      <circle cx="178" cy="60" r="9" fill="#e0574a" />

      <rect x="146" y="130" width="28" height="7" rx="1.5" fill="#c9a36a" opacity="0.85" />
    </svg>
  );
}

function TetradArt() {
  const fibers = [
    { d: "M-10 40C60 40 90 70 160 70s110-40 170-40", color: "#bb0101", duration: "3.2s" },
    { d: "M-10 140c70 0 90-44 170-44s100 30 170 30", color: "#e0574a", duration: "4.1s" },
    { d: "M-10 92c80 0 120 30 170 30s100-60 170-60", color: "#f2c9a0", duration: "5.3s" },
  ];

  return (
    <svg viewBox="0 0 320 180" className="project-art" aria-hidden="true">
      <defs>
        <linearGradient id="td-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#231d19" />
          <stop offset="1" stopColor="#3a1512" />
        </linearGradient>
        <pattern id="td-grid" width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M16 0H0v16" fill="none" stroke="rgba(255,255,255,0.05)" />
        </pattern>
      </defs>

      <rect width="320" height="180" fill="url(#td-bg)" />
      <rect width="320" height="180" fill="url(#td-grid)" />

      {fibers.map((fiber) => (
        <g key={fiber.d}>
          <path d={fiber.d} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
          <path
            d={fiber.d}
            fill="none"
            stroke={fiber.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            className="td-pulse"
            style={{ animationDuration: fiber.duration }}
          />
        </g>
      ))}

      <g transform="translate(160 90)">
        <rect x="-50" y="-50" width="44" height="44" rx="6" fill="#950000" />
        <rect x="6" y="-50" width="44" height="44" rx="6" fill="#534a40" stroke="rgba(255,255,255,0.15)" />
        <rect x="-50" y="6" width="44" height="44" rx="6" fill="#534a40" stroke="rgba(255,255,255,0.15)" />
        <rect x="6" y="6" width="44" height="44" rx="6" fill="#423b33" stroke="rgba(255,255,255,0.15)" />
      </g>
    </svg>
  );
}

const artwork = {
  swesso: SwessoArt,
  jeffconners: JeffConnersArt,
  tetrad: TetradArt,
};

export default function ProjectArt({ name }) {
  const Art = artwork[name];
  if (!Art) return null;
  return (
    <div className="project-cover">
      <Art />
    </div>
  );
}
