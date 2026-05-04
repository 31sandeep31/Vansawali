// Devanagari → Roman transliteration (Hunterian-style).
// Manual overrides win for names where the rule-based output differs from
// how the family commonly writes the name in English.

const NAME_OVERRIDES: Record<string, string> = {
  'वसन्त उपाध्याय काफ्ले': 'Basanta Upadhyaya Kafle',
  'वसन्त': 'Basanta',
  'हिरामणि': 'Hiramani',
  'वृहस्पति': 'Brihaspati',
  'द्वारिका': 'Dwarika',
  'चिन्तामणि': 'Chintamani',
  'भिमलाल': 'Bhimlal',
  'कान्छा': 'Kancha',
  'कान्छो': 'Kancho',
  'दुर्गादाश': 'Durgadas',
  'डासिराज': 'Dasiraj',
  'डासीराम': 'Dasiram',
  'एकदेव': 'Ekdev',
  'बालकृष्ण': 'Balkrishna',
  'भोजराज': 'Bhojraj',
  'चुरामणी': 'Churamani',
  'चुरामणि': 'Churamani',
  'णप्रसाद (वेपत्ता)': 'Naprasad (missing)',
  'गङ्गाराम': 'Gangaram',
  'पूर्षोत्तम': 'Purshottam',
  'उत्तम': 'Uttam',
  'जनक': 'Janak',
  'सुजनउत्तम': 'Sujan Uttam',
  'सुमन': 'Suman',
  'देवराज': 'Devraj',
  'किरण': 'Kiran',
  'अरूण': 'Arun',
  'प्रदिप': 'Pradip',
  'साधुराम': 'Sadhuram',
  'अमृत': 'Amrit',
  'कृष्ण': 'Krishna',
  'नारायण': 'Narayan',
  'मनोज': 'Manoj',
  'दिपक': 'Dipak',
  'सन्तोष': 'Santosh',
  'मुकेश': 'Mukesh',
  'उपेन्द्र': 'Upendra',
  'छविलाल': 'Chhabilal',
  'ढुन्डिराम': 'Dhundiram',
  'केशव': 'Keshav',
  'नन्दलाल': 'Nandalal',
  'हुमकान्त': 'Humkanta',
  'लिलावल्लभ': 'Lilavallabha',
  'बाबुराम': 'Baburam',
  'एकनारायण': 'Eknarayan',
  'गोपीकृष्ण': 'Gopikrishna',
  'दिर्घनारायण': 'Dirghanarayan',
  'डिलराज': 'Dilraj',
  'बोधराज': 'Bodhraj',
  'निलकण्ठ': 'Nilkantha',
  'धुर्व': 'Dhruva',
  'प्रकाश': 'Prakash',
  'सन्जोग': 'Sanjog',
  'दिपेन्द्र': 'Dipendra',
  'सुदिप': 'Sudip',
  'अर्जुन, इश्वरीप्रसाद': 'Arjun / Ishwariprasad',
  'शोभाकान्त': 'Shobhakanta',
  'तुलसीराम': 'Tulasiram',
  'सफल': 'Saphal',
  'सृजीत': 'Srijit',
  'सोसील': 'Sosil',
  'उज्वल': 'Ujwal',
  'उत्सव': 'Utsav',
  'दिनेश': 'Dinesh',
  'तुलसी, कमल': 'Tulasi / Kamal',
  'हिरा': 'Hira',
  'सुनिल, मुकुन्द': 'Sunil / Mukund',
  'अशोक, चोलाकान्त': 'Ashok / Cholakanta',
  'डिल्लीराम': 'Dilliram',
  'गोपाल': 'Gopal',
  'ज्योति': 'Jyoti',
  'शंकर': 'Shankar',
  'सुर्य': 'Surya',
  'मोहन': 'Mohan',
  'हरी': 'Hari',
  'बलराम': 'Balram',
  'सागर': 'Sagar',
  'सन्दिप': 'Sandip',
  'जयपति': 'Jayapati',
  'शक्तिवल्लभ': 'Shaktivallabha',
  'श्रीकृष्ण': 'Shrikrishna',
  'दामोदर': 'Damodar',
  'जयवल्लभ': 'Jayavallabha',
  'खेमनारायण': 'Khemnarayan',
  'हिमलाल': 'Himlal',
  'गंगा': 'Ganga',
  'भगवान': 'Bhagwan',
  'लक्ष्मण': 'Laxman',
  'चोलाकान्त': 'Cholakanta',
  'महेश्वर': 'Maheshwar',
  'पर्शुराम': 'Parshuram',
  'भरत': 'Bharat',
  'रामु': 'Ramu',
  'नवराज': 'Navaraj',
  'प्रशन्न': 'Prasanna',
  'प्रशान्त': 'Prashant',
  'आरूस': 'Aarus',
  'विपन': 'Bipan',
  'इश्वर': 'Ishwar',
  'कोपिल': 'Kopil',
  'सुजन': 'Sujan',
  'जगदिश': 'Jagdish',
  'तेजनारायण': 'Tejnarayan',
  'रत्नाकर': 'Ratnakar',
  'काशिराम': 'Kashiram',
  'रेस्मीराज': 'Resmiraj',
  'विश्वप्रेम': 'Bishwaprem',
  'हुमलाल': 'Humlal',
  'सनु': 'Sanu',
  'गोविन्द': 'Gobinda',
  'आनन्द': 'Ananda',
  'लोकनाथ': 'Lokanath',
  'मनोज, मुनिराज': 'Manoj / Muniraj',
  'भुवन': 'Bhuvan',
  'नमराज': 'Namraj',
  'समर्थ': 'Samartha',
  'दिवस हमाल': 'Diwas Hamal',
  'रामु, हुमकान्त': 'Ramu / Humkanta',
  'कमल, वेतप्रसाद': 'Kamal / Betaprasad',
  'प्रविन, शिव': 'Prabin / Shiva',
  'खेमबहादुर': 'Khembahadur',
  'रेशमबहादुर': 'Reshambahadur',
  'किष्ण': 'Kishna',
  'विष्णु': 'Bishnu',
  'थानेश्वर': 'Thaneshwar',
  'नविन': 'Nabin',
  'विश्वास': 'Bishwas',
  'गणेश': 'Ganesh',
  'मनिस': 'Manis',
  'सुयोग': 'Suyog',
  'संन्जोग': 'Sanjog',
  'हार्दिक': 'Hardik',
  'सर्विण': 'Sarbin',
  'रोनक': 'Ronak',
  'शिशिर': 'Shishir',
};

const CONSONANTS: Record<string, string> = {
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
  'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
  'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'b',
  'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
  'क्ष': 'ksh', 'त्र': 'tr', 'ज्ञ': 'gy', 'श्र': 'shr',
};

const VOWELS: Record<string, string> = {
  'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ऋ': 'ri',
  'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'ऑ': 'aw',
};

const MATRAS: Record<string, string> = {
  'ा': 'aa', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ृ': 'ri',
  'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ॅ': 'aw',
};

/**
 * Devanagari → Roman transliteration, Hunterian-style.
 * Returns the override if one exists; otherwise a rule-based approximation.
 */
export function transliterate(input: string): string {
  if (NAME_OVERRIDES[input]) return NAME_OVERRIDES[input];

  let out = '';
  let i = 0;
  const s = input;

  while (i < s.length) {
    const c = s[i];
    const c3 = s.substr(i, 3);

    // whitespace, punctuation, and Devanagari digits pass through (digits → ASCII)
    if (c === ' ' || c === '\t' || c === '\n') { out += ' '; i++; continue; }
    if (c === ',' || c === '/' || c === '(' || c === ')' || c === '-') { out += c; i++; continue; }
    if ('०१२३४५६७८९'.includes(c)) { out += '०१२३४५६७८९'.indexOf(c); i++; continue; }

    // try 3-char ligatures first, then single consonants
    if (CONSONANTS[c3]) {
      out += CONSONANTS[c3];
      i += 3;
    } else if (CONSONANTS[c]) {
      out += CONSONANTS[c];
      i += 1;
    } else if (VOWELS[c]) {
      out += VOWELS[c];
      i++;
      continue;
    } else if (c === 'ं' || c === 'ँ') { out += 'n'; i++; continue; }
    else if (c === 'ः') { out += 'h'; i++; continue; }
    else { out += c; i++; continue; }

    // post-consonant: halant suppresses the implicit vowel; matra adds explicit;
    // bare consonant gets implicit 'a'.
    if (s[i] === '्') { i++; continue; }
    const matra = s[i] ? MATRAS[s[i]] : undefined;
    if (matra !== undefined) { out += matra; i++; }
    else { out += 'a'; }
  }

  // collapse trailing implicit 'a' before a word boundary or end of string.
  out = out.replace(/a(\b|$)/g, '$1');

  // capitalize each word
  return out
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ') || input;
}
