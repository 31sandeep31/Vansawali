// Core domain types for the Vansavali app.

/** A person as stored in the source data (read-only). */
export interface Person {
  id: string;
  name: string;          // Devanagari short-form (as in the original chart)
  parent_id: string | null;
  children_ids: string[];
  multi_names?: boolean; // true if the original entry combined two names with a comma
}

/** Optional, user-editable overrides — saved to localStorage. */
export interface PersonEdit {
  full_name?: string;
  full_name_en?: string;
  dob_bs?: string;
  dob_ad?: string;
  mother?: string;
  place?: string;
  photo?: string;
  notes?: string;
}

export type EditsMap = Record<string, PersonEdit>;

/** The on-disk JSON shape (lib/data.json). */
export interface DataFile {
  title: { ne: string; en: string };
  default_surname: string;
  default_surname_en: string;
  root_id: string;
  people: Record<string, Person>;
  seed_extras?: Record<string, { dob_bs?: string; dob_bs_ascii?: string }>;
}

/** Computed projection of a person merged with their edits + relatives. */
export interface ResolvedPerson extends Person {
  full_name: string;     // "<name> <surname>" or override
  full_name_en: string;  // transliterated or override
  name_en: string;       // transliterated short form
  dob_bs: string;
  dob_ad: string;
  mother: string;
  place: string;
  notes: string;
  photo: string;
  father: Person | null;
  sons: Person[];
}

export type Lang = 'ne' | 'en';
export type ViewMode = 'top-down' | 'bottom-up' | 'book';

/** Which slice of the tree is shown (and which is dimmed). */
export type FocusScope = 'all' | 'focus' | 'lineage';

/** Result of the tree layout pass. */
export interface Layout {
  pos: Record<string, { x: number; y: number; depth: number; leaf?: boolean }>;
  width: number;
  height: number;
}

/** Pan/zoom state — kept in a ref, not React state, to avoid re-renders during drag. */
export interface Camera {
  x: number;
  y: number;
  zoom: number;
}
