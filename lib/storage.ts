import type { EditsMap, Lang } from './types';
import { DATA } from './data';

const STORAGE_KEY = 'vansavali_edits_v1';
const LANG_KEY = 'vansavali_lang';

/** Load saved edits from localStorage, then merge in any seed extras the user hasn't touched. */
export function loadEdits(): EditsMap {
  if (typeof window === 'undefined') return {};
  let edits: EditsMap = {};
  try {
    edits = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}') as EditsMap;
  } catch {
    edits = {};
  }
  // Apply seed extras (e.g. Sandeep's pre-known DOB) without overwriting user values.
  for (const [pid, extra] of Object.entries(DATA.seed_extras || {})) {
    edits[pid] = edits[pid] || {};
    if (extra.dob_bs_ascii && !edits[pid].dob_bs) {
      edits[pid].dob_bs = extra.dob_bs_ascii;
    }
  }
  return edits;
}

export function saveEdits(edits: EditsMap): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(edits));
}

export function loadLang(fallback: Lang = 'ne'): Lang {
  if (typeof window === 'undefined') return fallback;
  const v = window.localStorage.getItem(LANG_KEY);
  return v === 'ne' || v === 'en' ? v : fallback;
}

export function saveLang(lang: Lang): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LANG_KEY, lang);
}
