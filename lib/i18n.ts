import type { Lang } from './types';

export interface Strings {
  eyebrow: string;
  title: string;
  topdown: string;
  bottomup: string;
  full: string;
  lineage: string;
  edit: string;
  view: string;
  search_ph: string;
  bs: string;
  ad: string;
  fit: string;
  ne_lang: string;
  en_lang: string;
  full_name: string;
  full_name_en: string;
  dob_bs: string;
  dob_ad: string;
  father: string;
  mother: string;
  sons: string;
  place: string;
  notes: string;
  photo: string;
  save: string;
  reset: string;
  export: string;
  show_lineage: string;
  show_full: string;
  edit_this: string;
  of: string;
  gen: string;
  not_set: string;
  legend: string;
  no_results: string;
  click_a_name: string;
  book: string;
  page: string;
  prev: string;
  next: string;
  show_all: string;
  no_record: string;
  generation_short: string;
}

export const I18N: Record<Lang, Strings> = {
  ne: {
    eyebrow: 'नेपाल राज्य उत्तरखण्डे · गण्डकी प्रदेश · स्याङ्जा · वालिङ नगरपालिका वडा नं. ०१ मनसाङ्गकोट',
    title: 'शर्वाणि गोत्रे काफ्ले बन्धुको वंशावली',
    topdown: 'माथिबाट तल',
    bottomup: 'तलबाट माथि',
    full: 'पुरै वंशावली',
    lineage: 'वंश रेखा',
    edit: 'सम्पादन',
    view: 'अवलोकन',
    search_ph: 'नाम खोज्नुहोस्…',
    bs: 'बि.सं.',
    ad: 'ई.स.',
    fit: 'सम्पूर्ण देखाउनुहोस्',
    ne_lang: 'नेपाली',
    en_lang: 'English',
    full_name: 'पुरै नाम',
    full_name_en: 'पुरै नाम (अंग्रेजी)',
    dob_bs: 'जन्म मिति (बि.सं.)',
    dob_ad: 'जन्म मिति (ई.स.)',
    father: 'पिता',
    mother: 'आमा',
    sons: 'सन्तान',
    place: 'स्थान',
    notes: 'उल्लेखनीय',
    photo: 'तस्बिर URL',
    save: 'सुरक्षित गर्नुहोस्',
    reset: 'पूर्व मूल्य',
    export: 'JSON निकाल्नुहोस्',
    show_lineage: 'यसको वंश रेखा देखाउनुहोस्',
    show_full: 'पुरै वंशावली देखाउनुहोस्',
    edit_this: 'सम्पादन गर्नुहोस्',
    of: 'को',
    gen: 'पुस्ता',
    not_set: 'उल्लेख छैन',
    legend: 'तानेर सर्नुस् · व्हील घुमाएर जुम · क्लिकले ३ पुस्ता वर/तल देखाउँछ',
    no_results: 'कुनै परिणाम छैन',
    click_a_name: 'पहिले कुनै नाममा क्लिक गर्नुहोस्',
    book: 'पुस्तक',
    page: 'पृष्ठ',
    prev: 'अघिल्लो',
    next: 'अर्को',
    show_all: 'सबै देखाउनुहोस्',
    no_record: 'विवरण उल्लेख छैन',
    generation_short: 'पुस्ता',
  },
  en: {
    eyebrow: 'Nepal · Gandaki Pradesh · Syangja · Waling Municipality, Ward 1, Mansangkot',
    title: 'Genealogy of the Sharvani-gotra Kafle Brethren',
    topdown: 'Top → Down',
    bottomup: 'Bottom → Up',
    full: 'Full Tree',
    lineage: 'Lineage',
    edit: 'Edit',
    view: 'View',
    search_ph: 'Search a name…',
    bs: 'BS',
    ad: 'AD',
    fit: 'Fit',
    ne_lang: 'नेपाली',
    en_lang: 'English',
    full_name: 'Full name',
    full_name_en: 'Full name (English)',
    dob_bs: 'Date of birth (BS)',
    dob_ad: 'Date of birth (AD)',
    father: 'Father',
    mother: 'Mother',
    sons: 'Sons',
    place: 'Current place',
    notes: 'Notes',
    photo: 'Photo URL',
    save: 'Save',
    reset: 'Reset',
    export: 'Export JSON',
    show_lineage: 'Show lineage of this person',
    show_full: 'Show full tree',
    edit_this: 'Edit details',
    of: 'of',
    gen: 'Generation',
    not_set: '—',
    legend: 'drag to pan · wheel to zoom · click a name to focus 3 generations up & down',
    no_results: 'No matches',
    click_a_name: 'First click a name to choose a person',
    book: 'Book',
    page: 'Page',
    prev: 'Prev',
    next: 'Next',
    show_all: 'Show all',
    no_record: 'No record',
    generation_short: 'Gen.',
  },
};
