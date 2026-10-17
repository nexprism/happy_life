import React from "react";

// 1. Glowing Lotus Chakra Bullet Icon from Screenshot 2
export const LotusChakraIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    {/* Center core */}
    <circle cx="12" cy="12" r="2.5" fill="#9333EA" />
    {/* 4 cardinal petals */}
    <path d="M12 2.5 C13.2 5 13.2 7 12 9 C10.8 7 10.8 5 12 2.5 Z" fill="#A855F7" />
    <path d="M12 21.5 C13.2 19 13.2 17 12 15 C10.8 17 10.8 19 12 21.5 Z" fill="#A855F7" />
    <path d="M2.5 12 C5 13.2 7 13.2 9 12 C7 10.8 5 10.8 2.5 12 Z" fill="#A855F7" />
    <path d="M21.5 12 C19 13.2 17 13.2 15 12 C17 10.8 19 10.8 21.5 12 Z" fill="#A855F7" />
    {/* 4 diagonal petals */}
    <path d="M5.3 5.3 C7.5 6.5 8.5 7.8 8.2 9.2 C6.8 8.9 5.5 7.9 5.3 5.3 Z" fill="#C084FC" />
    <path d="M18.7 18.7 C16.5 17.5 15.5 16.2 15.8 14.8 C17.2 15.1 18.5 16.1 18.7 18.7 Z" fill="#C084FC" />
    <path d="M5.3 18.7 C6.5 16.5 7.8 15.5 9.2 15.8 C8.9 17.2 7.9 18.5 5.3 18.7 Z" fill="#C084FC" />
    <path d="M18.7 5.3 C17.5 7.5 16.2 8.5 14.8 8.2 C15.1 6.8 16.1 5.5 18.7 5.3 Z" fill="#C084FC" />
  </svg>
);

// 2. Card 1: Lucky Clover with Hand (Improving Your Luck)
export const VedicCloverIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* 4 leaf clover */}
    <path d="M38 18 C38 12 30 12 30 18 C30 22 36 24 38 26 C40 24 46 22 46 18 C46 12 38 12 38 18 Z" fill="#F3E8FF" />
    <path d="M46 26 C52 26 52 18 46 18 C42 18 40 24 38 26 C40 28 42 34 46 34 C52 34 52 26 46 26 Z" fill="#F3E8FF" />
    <path d="M38 34 C38 40 46 40 46 34 C46 30 40 28 38 26 C36 28 30 30 30 34 C30 40 38 40 38 34 Z" fill="#F3E8FF" />
    <path d="M30 26 C24 26 24 34 30 34 C34 34 36 28 38 26 C36 24 34 18 30 18 C24 18 24 26 30 26 Z" fill="#F3E8FF" />
    {/* Hand holding stem */}
    <path d="M38 28 C38 36 32 44 26 46" strokeWidth="2.5" />
    <path d="M10 48 L22 48 C25 48 28 46 30 43 L32 39 C33 37 36 37 37 39 C38 41 37 44 34 46 L28 50 C26 51 24 54 24 56 L10 56 Z" />
    <circle cx="16" cy="52" r="1.5" fill="currentColor" />
  </svg>
);

// 3. Card 2: Traditional North Indian Janam Kundali Diamond Chart
export const VedicKundaliIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Outer square */}
    <rect x="8" y="8" width="48" height="48" rx="2" fill="#FAF5FF" />
    {/* Diagonals from corners */}
    <line x1="8" y1="8" x2="56" y2="56" />
    <line x1="56" y1="8" x2="8" y2="56" />
    {/* Inscribed diamond connecting midpoints of edges */}
    <polygon points="32,8 56,32 32,56 8,32" strokeWidth="2.2" />
    {/* Small center sacred bindu */}
    <circle cx="32" cy="32" r="2" fill="currentColor" />
  </svg>
);

// 4. Card 3: Orbiting Planets with Rings
export const VedicPlanetsIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Central celestial body */}
    <circle cx="32" cy="32" r="8" fill="#F3E8FF" strokeWidth="2.5" />
    {/* Main orbit ring tilted */}
    <ellipse cx="32" cy="32" rx="26" ry="11" transform="rotate(-28 32 32)" strokeDasharray="1 0" />
    {/* Secondary orbit ring */}
    <ellipse cx="32" cy="32" rx="24" ry="9" transform="rotate(35 32 32)" opacity="0.4" strokeDasharray="3 3" />
    {/* Orbiting planet spheres */}
    <circle cx="12" cy="24" r="3.5" fill="currentColor" />
    <circle cx="52" cy="40" r="4.5" fill="currentColor" />
    <circle cx="45" cy="18" r="3" fill="currentColor" />
    <circle cx="20" cy="46" r="2.5" fill="currentColor" />
  </svg>
);

// 5. Card 4: 8-Pointed Vedic Compass Yantra
export const VedicYantraIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Outer cosmic border */}
    <circle cx="32" cy="32" r="26" strokeWidth="2.2" fill="#FAF5FF" />
    <circle cx="32" cy="32" r="22" strokeDasharray="3 3" opacity="0.6" />
    {/* 8-pointed star yantra */}
    <polygon points="32,8 36,24 52,16 40,28 56,32 40,36 52,48 36,40 32,56 28,40 12,48 24,36 8,32 24,28 12,16 28,24" strokeWidth="2" fill="#F3E8FF" />
    {/* Center bindu */}
    <circle cx="32" cy="32" r="4" fill="currentColor" />
  </svg>
);

// 6. Card 5: Rashi / 12-Zodiac Signs Mandala Wheel
export const VedicRashiIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Outer wheel */}
    <circle cx="32" cy="32" r="26" strokeWidth="2.2" fill="#FAF5FF" />
    <circle cx="32" cy="32" r="17" strokeWidth="1.8" />
    <circle cx="32" cy="32" r="8" fill="#F3E8FF" strokeWidth="1.5" />
    {/* 12 zodiac spokes */}
    <line x1="32" y1="6" x2="32" y2="15" />
    <line x1="32" y1="49" x2="32" y2="58" />
    <line x1="6" y1="32" x2="15" y2="32" />
    <line x1="49" y1="32" x2="58" y2="32" />
    <line x1="13.6" y1="13.6" x2="20" y2="20" />
    <line x1="44" y1="44" x2="50.4" y2="50.4" />
    <line x1="50.4" y1="13.6" x2="44" y2="20" />
    <line x1="20" y1="44" x2="13.6" y2="50.4" />
    {/* Sacred center symbol */}
    <circle cx="32" cy="32" r="3" fill="currentColor" />
  </svg>
);

// 7. Card 6: Lagna / Navamsha House Grid Chart
export const VedicLagnaIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Outer square */}
    <rect x="8" y="8" width="48" height="48" rx="2" fill="#FAF5FF" />
    {/* Inner square */}
    <rect x="20" y="20" width="24" height="24" rx="1" strokeWidth="1.8" />
    {/* Concentric house divisions */}
    <line x1="8" y1="8" x2="20" y2="20" />
    <line x1="56" y1="8" x2="44" y2="20" />
    <line x1="56" y1="56" x2="44" y2="44" />
    <line x1="8" y1="56" x2="20" y2="44" />
    {/* Center horizontal & vertical lines */}
    <line x1="32" y1="8" x2="32" y2="20" />
    <line x1="32" y1="44" x2="32" y2="56" />
    <line x1="8" y1="32" x2="20" y2="32" />
    <line x1="44" y1="32" x2="56" y2="32" />
    {/* Center Lagna lines */}
    <line x1="24" y1="28" x2="40" y2="28" strokeWidth="1.5" />
    <line x1="24" y1="36" x2="40" y2="36" strokeWidth="1.5" />
  </svg>
);

// 8. Celestial Zodiac Wheel for Hero Section Background (Behind Mentor)
export const CelestialZodiacWheel: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 400 400" fill="none" stroke="currentColor" className={className}>
    <defs>
      <radialGradient id="celestialGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.3" />
        <stop offset="60%" stopColor="#3B82F6" stopOpacity="0.15" />
        <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0" />
      </radialGradient>
    </defs>
    {/* Glowing background */}
    <circle cx="200" cy="200" r="195" fill="url(#celestialGlow)" stroke="none" />
    {/* Outer celestial circles */}
    <circle cx="200" cy="200" r="190" strokeWidth="2" strokeDasharray="4 6" opacity="0.4" />
    <circle cx="200" cy="200" r="175" strokeWidth="3" opacity="0.7" />
    <circle cx="200" cy="200" r="145" strokeWidth="1.5" opacity="0.5" />
    <circle cx="200" cy="200" r="115" strokeWidth="2.5" opacity="0.6" />
    <circle cx="200" cy="200" r="75" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
    <circle cx="200" cy="200" r="45" strokeWidth="2" opacity="0.5" />

    {/* 12 Zodiac Rays */}
    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
      <line
        key={deg}
        x1={200 + 115 * Math.cos((deg * Math.PI) / 180)}
        y1={200 + 115 * Math.sin((deg * Math.PI) / 180)}
        x2={200 + 175 * Math.cos((deg * Math.PI) / 180)}
        y2={200 + 175 * Math.sin((deg * Math.PI) / 180)}
        strokeWidth="2"
        opacity="0.45"
      />
    ))}

    {/* Asterisms and Constellation Stars */}
    {[
      [140, 90], [260, 90], [310, 140], [310, 260],
      [260, 310], [140, 310], [90, 260], [90, 140],
      [200, 70], [330, 200], [200, 330], [70, 200]
    ].map(([x, y], idx) => (
      <g key={idx} opacity="0.75">
        <circle cx={x} cy={y} r="3" fill="#93C5FD" />
        <circle cx={x} cy={y} r="6" stroke="#60A5FA" strokeWidth="1" strokeDasharray="2 2" />
      </g>
    ))}

    {/* Center 8-pointed radiant sun/star */}
    <polygon
      points="200,165 208,192 235,200 208,208 200,235 192,208 165,200 192,192"
      fill="#93C5FD"
      opacity="0.4"
    />
  </svg>
);

// Map icon string to component
export const getVedicIcon = (iconType: string, className?: string) => {
  switch ((iconType || "").toLowerCase()) {
    case "clover":
      return <VedicCloverIcon className={className} />;
    case "kundali":
      return <VedicKundaliIcon className={className} />;
    case "planets":
      return <VedicPlanetsIcon className={className} />;
    case "yantra":
      return <VedicYantraIcon className={className} />;
    case "rashi":
      return <VedicRashiIcon className={className} />;
    case "lagna":
      return <VedicLagnaIcon className={className} />;
    default:
      return <VedicKundaliIcon className={className} />;
  }
};
