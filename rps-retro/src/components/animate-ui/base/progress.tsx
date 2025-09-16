"use client";
import * as React from "react";

// tiny class joiner (no external deps)
function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export type ProgressTrackProps = {
  value?: number;        // 0–100
  showValue?: boolean;   // show % above the bar
  className?: string;
};

export function ProgressTrack({
  value = 0,
  showValue = false,
  className,
}: ProgressTrackProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={cn(
      "relative w-full h-2 rounded-full",
      "border border-[#00ff00]/60 bg-black/50",
      "shadow-[0_0_10px_rgba(0,255,0,0.25)]",
      className
    )}>
      {/* fill */}
      <div
        className="h-full rounded-full bg-[#00ff00]/80 transition-[width] duration-300 ease-out"
        style={{ width: `${clamped}%` }}
      />

      {/* label */}
{showValue && (
  <span
    className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] tracking-widest text-[#b9ffb9]"
    style={{ fontFamily: "'Press Start 2P', cursive" }}
  >
    {Math.round(clamped)}%
  </span>
)}

    </div>
  );
}

export default ProgressTrack;