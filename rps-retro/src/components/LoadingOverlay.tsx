"use client";

import { useEffect, useState } from "react";
import ProgressTrack from "./animate-ui/base/progress";

export default function LoadingOverlay() {
  const [value, setValue] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // smoothly ramp to ~90% while the page is loading
    let raf = 0;
    const tick = () => {
      setValue((v) => (v < 90 ? Math.min(90, v + Math.max(0.8, (90 - v) * 0.05)) : v));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const finish = () => {
      cancelAnimationFrame(raf);
      // animate to 100 then fade out
      let v = 90;
      const id = setInterval(() => {
        v += 2.5;
        setValue(v);
        if (v >= 100) {
          clearInterval(id);
          setTimeout(() => setHidden(true), 200);
        }
      }, 16);
    };

    const onLoad = () => finish();
    if (document.readyState === "complete") finish();
    else window.addEventListener("load", onLoad, { once: true });

    // also finish after fonts settle (reduces FOUC)
    const fonts: any = (document as any).fonts;
    fonts?.ready?.then?.(() => finish());

    return () => window.removeEventListener("load", onLoad);
  }, []);

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[9999] grid place-items-center bg-black/95 transition-opacity duration-300 ${
        hidden ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="w-[min(520px,80vw)]">
        <ProgressTrack value={value} showValue className="w-full" />
        <p className="mt-2 text-center text-xs tracking-widest text-[#b9ffb9]">LOADING…</p>
      </div>
    </div>
  );
}