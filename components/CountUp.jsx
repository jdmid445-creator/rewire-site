'use client';

import { useEffect, useRef, useState } from 'react';

// Rolls a number up to its new value when it changes. Instant when reduced motion is on.
export default function CountUp({ value, digits = 4 }) {
  const [shown, setShown] = useState(value);
  const from = useRef(0);

  useEffect(() => {
    const target = Number(value) || 0;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setShown(target); from.current = target; return; }
    const start = performance.now();
    const a = from.current;
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / 700);
      const e = 1 - Math.pow(1 - p, 3);
      setShown(a + (target - a) * e);
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <>{Number(shown).toLocaleString('en-US', { maximumFractionDigits: digits })}</>;
}
