import dataJson from './data.json';
import type { DataFile, Person } from './types';

// JSON modules in TS need a small cast — the JSON shape matches DataFile.
export const DATA = dataJson as unknown as DataFile;

export const PEOPLE: Record<string, Person> = DATA.people;
export const ROOT_ID: string = DATA.root_id;
export const SURNAME_NE: string = DATA.default_surname;
export const SURNAME_EN: string = DATA.default_surname_en;
