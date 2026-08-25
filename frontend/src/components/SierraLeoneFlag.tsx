interface SierraLeoneFlagProps {
  className?: string;
  width?: number;
  height?: number;
}

/**
 * Official Republic of Sierra Leone National Flag
 * Clean, pure rectangular tricolour (3:2 ratio):
 * - Top: Leaf Green (#1EB53A)
 * - Middle: Pure White (#FFFFFF)
 * - Bottom: Cobalt Blue (#0072C6)
 * No artificial shapes, circles, or ornamental frames.
 */
export function SierraLeoneFlag({
  className = "",
  width = 36,
  height = 24,
}: SierraLeoneFlagProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 36 24"
      className={`border border-black/10 shadow-2xs ${className}`}
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <rect width="36" height="8" y="0" fill="#1EB53A" />
      <rect width="36" height="8" y="8" fill="#FFFFFF" />
      <rect width="36" height="8" y="16" fill="#0072C6" />
    </svg>
  );
}

/**
 * Large Official Sierra Leone Flag (Direct Flag Display - No Shape Wrapper)
 */
export function SierraLeoneLargeFlag({
  width = 140,
  height = 93,
  className = "",
}: {
  width?: number;
  height?: number;
  className?: string;
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 150 100"
      className={`rounded-xs border border-black/15 shadow-sm ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Top Stripe: Leaf Green */}
      <rect width="150" height="33.33" y="0" fill="#1EB53A" />
      {/* Middle Stripe: Pure White */}
      <rect width="150" height="33.34" y="33.33" fill="#FFFFFF" />
      {/* Bottom Stripe: Cobalt Blue */}
      <rect width="150" height="33.33" y="66.67" fill="#0072C6" />
    </svg>
  );
}
