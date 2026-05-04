'use client';

import { useEffect, useState } from 'react';
import type { EditsMap, Lang, PersonEdit, ResolvedPerson, ViewMode } from '@/lib/types';
import { I18N, type Strings } from '@/lib/i18n';
import { toNeDigits } from '@/lib/bsAd';
import { transliterate } from '@/lib/transliterate';
import { ancestorsOf } from '@/lib/layout';
import { PEOPLE } from '@/lib/data';
import { resolvePerson } from '@/lib/resolve';

type Mode = 'edit' | 'lineage';

interface Props {
  open: boolean;
  mode: Mode;
  personId: string | null;
  edits: EditsMap;
  lang: Lang;
  view: ViewMode;
  onClose: () => void;
  onSaveEdit: (id: string, edit: PersonEdit) => void;
  onResetEdit: (id: string) => void;
  onShowLineage: (id: string) => void;
  onShowFull: () => void;
  onSwitchToEdit: (id: string) => void;
  onFocusPerson: (id: string) => void;
}

/** Empty placeholder we render when there is no selected person yet. */
const EMPTY_EDIT: PersonEdit = {};

export default function SidePanel(props: Props) {
  const { open, mode, personId, edits, lang, view, onClose } = props;
  const t = I18N[lang];

  // Local form state for edit mode — synced when `personId` changes.
  const [form, setForm] = useState<PersonEdit>(EMPTY_EDIT);
  useEffect(() => {
    if (personId && mode === 'edit') {
      const merged = edits[personId] || {};
      const resolved = resolvePerson(personId, edits);
      setForm({
        full_name: merged.full_name ?? resolved?.full_name ?? '',
        full_name_en: merged.full_name_en ?? resolved?.full_name_en ?? '',
        dob_bs: merged.dob_bs ?? '',
        dob_ad: merged.dob_ad ?? '',
        mother: merged.mother ?? '',
        place: merged.place ?? '',
        photo: merged.photo ?? '',
        notes: merged.notes ?? '',
      });
    }
  }, [personId, mode, edits]);

  if (!personId) {
    return <aside className={`side-panel${open ? ' open' : ''}`} aria-hidden />;
  }

  const subject = resolvePerson(personId, edits);
  if (!subject) return null;

  const heading =
    mode === 'edit'
      ? `${t.edit} · ${lang === 'ne' ? subject.name : transliterate(subject.name)}`
      : `${t.lineage} ${t.of} ${lang === 'ne' ? subject.name : transliterate(subject.name)}`;

  return (
    <aside className={`side-panel${open ? ' open' : ''}`} aria-hidden={!open}>
      <div className="sp-head">
        <h3>{heading}</h3>
        <button className="sp-close" onClick={onClose} aria-label="Close">×</button>
      </div>

      {mode === 'edit'
        ? <EditBody form={form} setForm={setForm} t={t} />
        : <LineageBody personId={personId} edits={edits} lang={lang} view={view} onFocus={props.onFocusPerson} />}

      {mode === 'edit'
        ? (
          <div className="sp-foot">
            <button
              className="btn primary"
              onClick={() => {
                // strip empty values before saving
                const clean: PersonEdit = {};
                (Object.keys(form) as (keyof PersonEdit)[]).forEach((k) => {
                  const v = form[k];
                  if (typeof v === 'string' && v.trim()) clean[k] = v.trim();
                });
                props.onSaveEdit(personId, clean);
              }}
            >{t.save}</button>
            <button className="btn" onClick={() => props.onShowLineage(personId)}>{t.show_lineage}</button>
            <button
              className="btn danger"
              style={{ marginLeft: 'auto' }}
              onClick={() => props.onResetEdit(personId)}
            >{t.reset}</button>
          </div>
        )
        : (
          <div className="sp-foot">
            <button className="btn primary" onClick={() => props.onShowLineage(personId)}>{t.show_lineage}</button>
            <button className="btn" onClick={props.onShowFull}>{t.show_full}</button>
            <button className="btn" onClick={() => props.onSwitchToEdit(personId)}>{t.edit_this}</button>
          </div>
        )
      }
    </aside>
  );
}

/* ---------- subcomponents ---------- */

function EditBody({
  form,
  setForm,
  t,
}: {
  form: PersonEdit;
  setForm: React.Dispatch<React.SetStateAction<PersonEdit>>;
  t: Strings;
}) {
  // Helper to update one field
  const set = <K extends keyof PersonEdit>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="sp-body">
      <Field label={t.full_name}>
        <input value={form.full_name ?? ''} onChange={set('full_name')} />
      </Field>
      <Field label={t.full_name_en}>
        <input value={form.full_name_en ?? ''} onChange={set('full_name_en')} />
      </Field>
      <Field label={t.dob_bs} hint="e.g. 2058/06/29">
        <input value={form.dob_bs ?? ''} onChange={set('dob_bs')} placeholder="YYYY/MM/DD" />
      </Field>
      <Field label={t.dob_ad}>
        <input value={form.dob_ad ?? ''} onChange={set('dob_ad')} placeholder="YYYY-MM-DD" />
      </Field>
      <Field label={t.mother}>
        <input value={form.mother ?? ''} onChange={set('mother')} />
      </Field>
      <Field label={t.place}>
        <input value={form.place ?? ''} onChange={set('place')} />
      </Field>
      <Field label={t.photo}>
        <input value={form.photo ?? ''} onChange={set('photo')} placeholder="https://…" />
      </Field>
      <Field label={t.notes}>
        <textarea value={form.notes ?? ''} onChange={set('notes')} />
      </Field>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="field">
      <label>
        {label}
        {hint && <span className="hint">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function LineageBody({
  personId,
  edits,
  lang,
  view,
  onFocus,
}: {
  personId: string;
  edits: EditsMap;
  lang: Lang;
  view: ViewMode;
  onFocus: (id: string) => void;
}) {
  const t = I18N[lang];
  const ancestors = ancestorsOf(personId, PEOPLE);
  // top-down: root first; bottom-up: subject first.
  const ordered = view === 'bottom-up' ? ancestors : [...ancestors].reverse();

  return (
    <div className="sp-body">
      {ordered.map((aid, idx) => {
        const a = resolvePerson(aid, edits);
        if (!a) return null;
        const gen = view === 'bottom-up' ? ancestors.length - idx : idx + 1;
        return (
          <div key={aid} className="lineage-card" onClick={() => onFocus(aid)} role="button" tabIndex={0}>
            <div className="gen latin">{`${t.gen} ${gen}`}</div>
            <div className="nm">{lang === 'ne' ? a.full_name : a.full_name_en}</div>
            {lang === 'ne' && <div className="nm-en">{a.full_name_en}</div>}
            {a.dob_bs && (
              <div className="nm-en">
                {t.dob_bs}: {lang === 'ne' ? toNeDigits(a.dob_bs) : a.dob_bs}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
