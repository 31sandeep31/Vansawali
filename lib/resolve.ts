import { useCallback } from 'react';
import { PEOPLE, SURNAME_NE, SURNAME_EN } from './data';
import { transliterate } from './transliterate';
import type { EditsMap, Person, ResolvedPerson } from './types';

/** Merge a person's base record with any user edits, plus their father/sons. */
export function resolvePerson(id: string, edits: EditsMap): ResolvedPerson | null {
  const base = PEOPLE[id];
  if (!base) return null;
  const e = edits[id] || {};
  const father = base.parent_id ? PEOPLE[base.parent_id] ?? null : null;
  const sons = (base.children_ids || [])
    .map((cid) => PEOPLE[cid])
    .filter((s): s is Person => Boolean(s));

  return {
    ...base,
    full_name: e.full_name || `${base.name} ${SURNAME_NE}`,
    full_name_en: e.full_name_en || `${transliterate(base.name)} ${SURNAME_EN}`.trim(),
    name_en: transliterate(base.name),
    dob_bs: e.dob_bs || '',
    dob_ad: e.dob_ad || '',
    mother: e.mother || '',
    place: e.place || '',
    notes: e.notes || '',
    photo: e.photo || '',
    father,
    sons,
  };
}

/** Stable callback wrapper around resolvePerson, bound to current edits. */
export function useResolvePerson(edits: EditsMap): (id: string) => ResolvedPerson | null {
  return useCallback((id: string) => resolvePerson(id, edits), [edits]);
}
