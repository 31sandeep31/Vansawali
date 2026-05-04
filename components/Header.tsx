'use client';

import { useEffect, useRef, useState } from 'react';
import type { FocusScope, Lang, ViewMode } from '@/lib/types';
import { I18N } from '@/lib/i18n';
import { adToBs, bsToAd, toEnDigits, toNeDigits } from '@/lib/bsAd';
import { transliterate } from '@/lib/transliterate';
import { generationOf } from '@/lib/layout';
import { PEOPLE } from '@/lib/data';

interface SearchHit {
  id: string;
  name: string;
  nameEn: string;
  generation: number;
}

interface Props {
  lang: Lang;
  view: ViewMode;
  scope: FocusScope;
  hasSelected: boolean;
  editMode: boolean;
  hidden: boolean;
  onViewChange: (v: ViewMode) => void;
  onScopeChange: (s: FocusScope) => void;
  onLangChange: (l: Lang) => void;
  onEditModeToggle: () => void;
  onExport: () => void;
  onSearchPick: (id: string) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export default function Header({
  lang,
  view,
  scope,
  hasSelected,
  editMode,
  hidden,
  onViewChange,
  onScopeChange,
  onLangChange,
  onEditModeToggle,
  onExport,
  onSearchPick,
  onMouseEnter,
  onMouseLeave,
}: Props) {
  const t = I18N[lang];

  // ---- Search ----
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setHits([]);
      setShowDropdown(false);
      return;
    }
    const q = query.toLowerCase().trim();
    const out: SearchHit[] = [];
    for (const id in PEOPLE) {
      const p = PEOPLE[id];
      const en = transliterate(p.name).toLowerCase();
      if (p.name.includes(query.trim()) || en.includes(q)) {
        out.push({
          id,
          name: p.name,
          nameEn: transliterate(p.name),
          generation: generationOf(id, PEOPLE),
        });
        if (out.length >= 30) break;
      }
    }
    setHits(out);
    setShowDropdown(true);
  }, [query]);

  const pickHit = (id: string) => {
    setQuery('');
    setShowDropdown(false);
    onSearchPick(id);
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setQuery('');
      setShowDropdown(false);
    } else if (e.key === 'Enter' && hits.length) {
      pickHit(hits[0].id);
    }
  };

  // ---- Date converter ----
  const [bsStr, setBsStr] = useState('');
  const [adStr, setAdStr] = useState('');

  const onBsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = toEnDigits(e.target.value);
    setBsStr(e.target.value);
    const m = v.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
    if (!m) {
      setAdStr('');
      return;
    }
    const r = bsToAd(+m[1], +m[2], +m[3]);
    setAdStr(r ? `${r[0]}-${String(r[1]).padStart(2, '0')}-${String(r[2]).padStart(2, '0')}` : '?');
  };

  const onAdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = toEnDigits(e.target.value);
    setAdStr(e.target.value);
    const m = v.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
    if (!m) {
      setBsStr('');
      return;
    }
    const r = adToBs(+m[1], +m[2], +m[3]);
    if (!r) {
      setBsStr('?');
      return;
    }
    const formatted = `${r[0]}/${String(r[1]).padStart(2, '0')}/${String(r[2]).padStart(2, '0')}`;
    setBsStr(lang === 'ne' ? toNeDigits(formatted) : formatted);
  };

  // ---- Click-outside for dropdown ----
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div
      className={`topbar${hidden ? ' hidden' : ''}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="title-row">
        <div className="title-block">
          <div className="eyebrow latin">{t.eyebrow}</div>
          <h1 className="title deva">{t.title}</h1>
        </div>
      </div>

      <div className="ornament">
        <span className="line" /><span>❦</span><span className="line" />
      </div>

      <div className="ctrl-row">
        <div className="ctrl-group" role="tablist" aria-label="View">
          <button
            className={`ctrl-btn${view === 'top-down' ? ' active' : ''}`}
            onClick={() => onViewChange('top-down')}
          >{t.topdown}</button>
          <button
            className={`ctrl-btn${view === 'bottom-up' ? ' active' : ''}`}
            onClick={() => onViewChange('bottom-up')}
          >{t.bottomup}</button>
          <button
            className={`ctrl-btn${view === 'book' ? ' active' : ''}`}
            onClick={() => onViewChange('book')}
          >📖 {t.book}</button>
        </div>

        {view !== 'book' && (
          <div className="ctrl-group" role="tablist" aria-label="Scope">
            <button
              className={`ctrl-btn${scope === 'all' ? ' active' : ''}`}
              onClick={() => onScopeChange('all')}
            >{t.full}</button>
            <button
              className={`ctrl-btn${scope === 'focus' ? ' active' : ''}`}
              onClick={() => onScopeChange('focus')}
              title="3 generations up + 3 down"
            >{t.lineage}</button>
          </div>
        )}

        <div className="search-wrap" ref={wrapRef}>
          <div className="search">
            <span style={{ color: 'var(--ink-faint)' }}>⚲</span>
            <input
              placeholder={t.search_ph}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKey}
              autoComplete="off"
            />
          </div>
          {showDropdown && (
            <div className="search-results">
              {hits.length === 0
                ? (
                  <div className="sr-item" style={{ color: 'var(--ink-faint)', fontStyle: 'italic' }}>
                    {t.no_results}
                  </div>
                )
                : hits.map((h) => (
                  <div key={h.id} className="sr-item" onClick={() => pickHit(h.id)}>
                    <span className="deva">{h.name}</span>{' '}
                    <span style={{ color: 'var(--ink-faint)' }}>·</span>{' '}
                    <span className="latin" style={{ fontStyle: 'italic' }}>{h.nameEn}</span>
                    <small>{`${t.gen} ${lang === 'ne' ? toNeDigits(h.generation) : h.generation}`}</small>
                  </div>
                ))
              }
            </div>
          )}
        </div>

        <div className="date-conv">
          <label>{t.bs}</label>
          <input value={bsStr} onChange={onBsChange} placeholder="2058/06/29" />
          <span className="arrow">⇌</span>
          <label>{t.ad}</label>
          <input value={adStr} onChange={onAdChange} placeholder="2001-10-15" />
        </div>

        <div className="ctrl-group">
          <button
            className={`ctrl-btn${lang === 'ne' ? ' active' : ''}`}
            onClick={() => onLangChange('ne')}
          >{t.ne_lang}</button>
          <button
            className={`ctrl-btn${lang === 'en' ? ' active' : ''}`}
            onClick={() => onLangChange('en')}
          >{t.en_lang}</button>
        </div>

        <div className="ctrl-group">
          <button
            className={`ctrl-btn${editMode ? ' active' : ''}`}
            onClick={onEditModeToggle}
          >{t.edit}</button>
          <button className="ctrl-btn" onClick={onExport}>{t.export}</button>
        </div>
      </div>
    </div>
  );
}
