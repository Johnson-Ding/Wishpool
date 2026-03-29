import { useMemo } from "react";

export function CloudField() {
  const clouds = useMemo(() => [
    { x: 15, y: 12, w: 120, h: 60, opacity: 0.15, dur: 8 },
    { x: 65, y: 25, w: 100, h: 50, opacity: 0.1, dur: 10 },
    { x: 35, y: 45, w: 140, h: 65, opacity: 0.12, dur: 12 },
    { x: 80, y: 55, w: 90, h: 45, opacity: 0.08, dur: 9 },
  ], []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {clouds.map((c, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${c.x}%`,
            top: `${c.y}%`,
            width: c.w,
            height: c.h,
            background: i % 2 === 0
              ? "oklch(var(--primary-lch) / 25%)"
              : "oklch(var(--accent-lch) / 20%)",
            opacity: c.opacity,
            filter: "blur(30px)",
            animation: `float ${c.dur}s ease-in-out infinite`,
            animationDelay: `${i * 1.5}s`,
          }}
        />
      ))}
    </div>
  );
}