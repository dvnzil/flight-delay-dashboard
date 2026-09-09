"use client";

import { useEffect, useRef, useState } from "react";

export function CountUp({ target, durationMs = 1400 }: { target: number; durationMs?: number }) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    let raf: number;
    function tick(now: number) {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      const t = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return <>{value.toLocaleString()}</>;
}
