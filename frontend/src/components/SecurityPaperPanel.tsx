import { ReactNode } from "react";

interface SecurityPaperPanelProps {
  children: ReactNode;
  className?: string;
  /** Show the diamond lattice border strip on the right edge, like the passport page's edge pattern. */
  showLatticeBorder?: boolean;
  /** Show the faint rosette watermark near the bottom, like the flower motif in the reference photo. */
  showRosette?: boolean;
}

/**
 * Recreates the official Sierra Leone biometric passport security-paper texture:
 * authentic wavy guilloché engraving, watermark palm motif, diamond
 * lattice pattern along the edge, and the 8-petal rosette watermark.
 */
export function SecurityPaperPanel({
  children,
  className = "",
  showLatticeBorder = true,
  showRosette = false,
}: SecurityPaperPanelProps) {
  return (
    <div
      className={`relative overflow-hidden bg-white border border-primary-light rounded-lg shadow-xs ${className}`}
    >
      {/* Authentic Sierra Leone biometric passport sheet watermark background */}
      <div
        className="absolute inset-0 pointer-events-none bg-cover bg-center opacity-[0.08] mix-blend-multiply"
        style={{
          backgroundImage: "url('/passport-bg.png')",
        }}
      />

      {/* Wavy guilloché engraving — tiled across the entire panel */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='10'%3E%3Cpath d='M0 5 Q5.5 0 11 5 T22 5 T33 5 T44 5' stroke='%230B4F6C' stroke-width='0.5' fill='none' opacity='0.55'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          opacity: 0.1,
        }}
      />

      {/* Diamond lattice border strip, right edge — matches the passport page's edge pattern */}
      {showLatticeBorder && (
        <div
          className="absolute top-0 right-0 bottom-0 w-6 pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cpath d='M12 2 L22 12 L12 22 L2 12 Z' fill='none' stroke='%23C98A2E' stroke-width='0.8' opacity='0.7'/%3E%3C/svg%3E\")",
            backgroundRepeat: "repeat-y",
            opacity: 0.35,
          }}
        />
      )}

      {/* Faint rosette watermark, bottom-center — echoes the flower motif near the page number */}
      {showRosette && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none opacity-[0.1]">
          <PassportRosette size={56} />
        </div>
      )}

      {/* Actual panel content, above all decorative layers */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/**
 * The 8-petal rosette / flower motif from the Sierra Leone biometric passport page.
 */
export function PassportRosette({ size = 64, color = "#0B4F6C" }: { size?: number; color?: string }) {
  const petals = Array.from({ length: 8 });
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* paired swoosh marks above the flower */}
      <path d="M30 22 Q35 14 42 20" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M58 20 Q65 14 70 22" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />

      <g transform="translate(50,58)">
        {petals.map((_, i) => (
          <path
            key={i}
            d="M0,-6 L7,-22 Q0,-28 -7,-22 Z"
            fill={color}
            transform={`rotate(${i * 45})`}
          />
        ))}
      </g>
    </svg>
  );
}
