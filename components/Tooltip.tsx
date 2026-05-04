'use client';

import { useEffect, useRef } from 'react';
import type { Lang, ResolvedPerson } from '@/lib/types';
import { I18N } from '@/lib/i18n';
import { toNeDigits } from '@/lib/bsAd';
import { transliterate } from '@/lib/transliterate';
import { SURNAME_NE, SURNAME_EN } from '@/lib/data';

interface Props {
  person: ResolvedPerson | null;
  mouseX: number;
  mouseY: number;
  lang: Lang;
}

/**
 * Fixed-position tooltip that follows the cursor.
 * Renders nothing if there is no person to show.
 */
export default function Tooltip({ person, mouseX, mouseY, lang }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Reposition on every render (cheap; tooltip is tiny).
  useEffect(() => {
    const el = ref.current;
    if (!el || !person) return;
    const W = window.innerWidth;
    const H = window.innerHeight;
    const ttW = el.offsetWidth;
    const ttH = el.offsetHeight;
    let x = mouseX + 16;
    let y = mouseY + 16;
    if (x + ttW > W - 12) x = mouseX - ttW - 16;
    if (y + ttH > H - 12) y = mouseY - ttH - 16;
    el.style.left = `${Math.max(8, x)}px`;
    el.style.top = `${Math.max(8, y)}px`;
  }, [mouseX, mouseY, person]);

  if (!person) {
    return <div className="tooltip" ref={ref} aria-hidden />;
  }

  const t = I18N[lang];
  const fatherName = person.father
    ? lang === 'ne'
      ? `${person.father.name} ${SURNAME_NE}`
      : `${transliterate(person.father.name)} ${SURNAME_EN}`
    : '';
  const sonsList = person.sons
    .map((s) => (lang === 'ne' ? s.name : transliterate(s.name)))
    .join(', ');
  const dobBs = person.dob_bs
    ? lang === 'ne'
      ? toNeDigits(person.dob_bs)
      : person.dob_bs
    : '';

  return (
    <div className="tooltip show" ref={ref}>
      {person.photo && (
        // Plain <img> is fine here — we don't want Next.js image optimization on user URLs.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="tt-photo"
          src={person.photo}
          alt=""
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      )}
      <div className="tt-title">{person.full_name}</div>
      <div className="tt-title-en">{person.full_name_en}</div>
      <div className="tt-divider" />
      {dobBs && <Row label={t.dob_bs} val={dobBs} />}
      {person.dob_ad && <Row label={t.dob_ad} val={person.dob_ad} />}
      {fatherName && <Row label={t.father} val={fatherName} />}
      {person.mother && <Row label={t.mother} val={person.mother} />}
      {sonsList && <Row label={t.sons} val={sonsList} />}
      {person.place && <Row label={t.place} val={person.place} />}
      {person.notes && <Row label={t.notes} val={person.notes} />}
      <div className="tt-hint latin">click to focus · double-click for lineage</div>
    </div>
  );
}

function Row({ label, val }: { label: string; val: string }) {
  return (
    <div className="tt-row">
      <div className="lbl latin">{label}</div>
      <div className="val">{val}</div>
    </div>
  );
}
