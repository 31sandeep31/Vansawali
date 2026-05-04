'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { EditsMap, Lang } from '@/lib/types';
import { I18N } from '@/lib/i18n';
import { toNeDigits } from '@/lib/bsAd';
import { transliterate } from '@/lib/transliterate';
import { PEOPLE, SURNAME_EN, SURNAME_NE } from '@/lib/data';
import { resolvePerson } from '@/lib/resolve';
import { ancestorsOf, generationOf } from '@/lib/layout';

interface Props {
  rootId: string;
  selectedId: string | null;
  edits: EditsMap;
  lang: Lang;
  onPickPerson: (id: string) => void;
}

/**
 * Pre-order traversal of the family tree → a flat list of person ids.
 * The book is paged through in this order (one person per page).
 */
function buildOrder(rootId: string): string[] {
  const out: string[] = [];
  const visit = (id: string): void => {
    out.push(id);
    (PEOPLE[id]?.children_ids || []).forEach(visit);
  };
  visit(rootId);
  return out;
}

/**
 * BookView — a flippable "page" UI. Each page is one person's biography
 * (parents on the verso/left, the person + sons on the recto/right).
 * Use ← / → arrows or the on-screen prev/next buttons.
 */
export default function BookView({ rootId, selectedId, edits, lang, onPickPerson }: Props) {
  const t = I18N[lang];
  const order = useMemo(() => buildOrder(rootId), [rootId]);

  // Keep an internal page index. When `selectedId` changes from outside
  // (e.g. the search box), jump to that page.
  const [page, setPage] = useState(() => {
    if (selectedId) {
      const idx = order.indexOf(selectedId);
      if (idx >= 0) return idx;
    }
    return 0;
  });
  const [flipDir, setFlipDir] = useState<'next' | 'prev' | null>(null);

  useEffect(() => {
    if (!selectedId) return;
    const idx = order.indexOf(selectedId);
    if (idx >= 0 && idx !== page) {
      setFlipDir(idx > page ? 'next' : 'prev');
      setPage(idx);
      const t = window.setTimeout(() => setFlipDir(null), 700);
      return () => window.clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const goNext = () => {
    if (page >= order.length - 1) return;
    setFlipDir('next');
    setPage((p) => p + 1);
    window.setTimeout(() => setFlipDir(null), 700);
  };
  const goPrev = () => {
    if (page <= 0) return;
    setFlipDir('prev');
    setPage((p) => p - 1);
    window.setTimeout(() => setFlipDir(null), 700);
  };

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.matches('input, textarea')) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') goNext();
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const id = order[page];
  const person = resolvePerson(id, edits);
  if (!person) return null;

  const ancestors = ancestorsOf(id, PEOPLE).slice(1).reverse(); // root → parent
  const sons = person.sons;
  const gen = generationOf(id, PEOPLE);

  const pageLbl = lang === 'ne'
    ? `${t.page} ${toNeDigits(page + 1)} / ${toNeDigits(order.length)}`
    : `${t.page} ${page + 1} / ${order.length}`;

  return (
    <div className="book-stage">
      <div className={`book ${flipDir ? `flip-${flipDir}` : ''}`}>
        {/* Left page — ancestor lineage */}
        <div className="book-page book-page-l">
          <div className="page-corner tl" />
          <div className="page-corner tr" />
          <div className="page-corner bl" />
          <div className="page-corner br" />

          <div className="page-header latin">{t.lineage}</div>
          <div className="ornament book-ornament">
            <span className="line" /><span>❦</span><span className="line" />
          </div>

          {ancestors.length === 0 ? (
            <div className="page-empty deva">— मूल पुरुष —</div>
          ) : (
            <ol className="lineage-trail">
              {ancestors.map((aid, i) => {
                const a = resolvePerson(aid, edits);
                if (!a) return null;
                const ag = generationOf(aid, PEOPLE);
                return (
                  <li
                    key={aid}
                    className="trail-item"
                    onClick={() => onPickPerson(aid)}
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="trail-gen latin">{`${t.gen} ${lang === 'ne' ? toNeDigits(ag) : ag}`}</div>
                    <div className="trail-name">{lang === 'ne' ? a.full_name : a.full_name_en}</div>
                    {lang === 'ne' && <div className="trail-name-en latin">{a.full_name_en}</div>}
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* Right page — the focal person + their sons */}
        <div className="book-page book-page-r">
          <div className="page-corner tl" />
          <div className="page-corner tr" />
          <div className="page-corner bl" />
          <div className="page-corner br" />

          <div className="page-header latin">
            {`${t.gen} ${lang === 'ne' ? toNeDigits(gen) : gen}`}
          </div>

          <h2 className="bio-name deva">{person.full_name}</h2>
          <div className="bio-name-en latin">{person.full_name_en}</div>

          <div className="ornament book-ornament">
            <span className="line" /><span>❦</span><span className="line" />
          </div>

          {person.photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="bio-photo"
              src={person.photo}
              alt=""
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}

          <dl className="bio-grid">
            {person.dob_bs && (
              <Row label={t.dob_bs} val={lang === 'ne' ? toNeDigits(person.dob_bs) : person.dob_bs} />
            )}
            {person.dob_ad && <Row label={t.dob_ad} val={person.dob_ad} />}
            {person.father && (
              <Row
                label={t.father}
                val={lang === 'ne'
                  ? `${person.father.name} ${SURNAME_NE}`
                  : `${transliterate(person.father.name)} ${SURNAME_EN}`}
                onClick={() => onPickPerson(person.father!.id)}
              />
            )}
            {person.mother && <Row label={t.mother} val={person.mother} />}
            {person.place && <Row label={t.place} val={person.place} />}
            {person.notes && <Row label={t.notes} val={person.notes} />}
          </dl>

          {sons.length > 0 && (
            <>
              <div className="page-section latin">{t.sons}</div>
              <ul className="bio-sons">
                {sons.map((s) => (
                  <li key={s.id} onClick={() => onPickPerson(s.id)}>
                    <span className="deva">{s.name}</span>
                    <span className="sep">·</span>
                    <span className="latin">{transliterate(s.name)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Spine */}
        <div className="book-spine" aria-hidden />
      </div>

      <div className="book-nav">
        <button
          className="book-btn"
          onClick={goPrev}
          disabled={page === 0}
          aria-label={t.prev}
        >‹ {t.prev}</button>
        <div className="book-pager latin">{pageLbl}</div>
        <button
          className="book-btn"
          onClick={goNext}
          disabled={page >= order.length - 1}
          aria-label={t.next}
        >{t.next} ›</button>
      </div>
    </div>
  );
}

function Row({ label, val, onClick }: { label: string; val: string; onClick?: () => void }) {
  return (
    <>
      <dt className="latin">{label}</dt>
      <dd className={onClick ? 'clickable' : undefined} onClick={onClick}>{val}</dd>
    </>
  );
}
