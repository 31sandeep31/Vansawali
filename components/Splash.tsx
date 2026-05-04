'use client';

import { useEffect, useState } from 'react';

interface Props {
  fadeAfterMs?: number;
}

export default function Splash({ fadeAfterMs = 600 }: Props) {
  const [gone, setGone] = useState(false);
  const [unmounted, setUnmounted] = useState(false);

  useEffect(() => {
    const fadeT = window.setTimeout(() => setGone(true), fadeAfterMs);
    const unmountT = window.setTimeout(() => setUnmounted(true), fadeAfterMs + 800);
    return () => {
      window.clearTimeout(fadeT);
      window.clearTimeout(unmountT);
    };
  }, [fadeAfterMs]);

  if (unmounted) return null;
  return (
    <div className={`splash${gone ? ' gone' : ''}`}>
      <div className="om">ॐ</div>
      <div className="lbl deva">वंशावली खुल्दैछ</div>
    </div>
  );
}
