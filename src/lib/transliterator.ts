const DEVANAGARI_MAP: Record<string, string> = {
  'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ऋ': 'ri', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
  'क': 'ka', 'ख': 'kha', 'ग': 'ga', 'घ': 'gha', 'ङ': 'nga',
  'च': 'cha', 'छ': 'chha', 'ज': 'ja', 'झ': 'jha', 'ञ': 'nya',
  'ट': 'ta', 'ठ': 'tha', 'ड': 'da', 'ढ': 'dha', 'ण': 'na',
  'त': 'ta', 'थ': 'tha', 'द': 'da', 'ध': 'dha', 'न': 'na',
  'प': 'pa', 'फ': 'pha', 'ब': 'ba', 'भ': 'bha', 'म': 'ma',
  'य': 'ya', 'र': 'ra', 'ल': 'la', 'व': 'va', 'श': 'sha', 'ष': 'sha', 'स': 'sa', 'ह': 'ha',
  'ा': 'aa', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ृ': 'ri', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au',
  '्': '', 'ं': 'n', 'ः': 'ah', '।': '.', '॥': '..',
  '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9', '०': '0'
};

export const transliterateDevanagari = (text: string): string => {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    // Check if character is in Devanagari range
    if (char >= '\u0900' && char <= '\u097F') {
        // If it's a consonant followed by a halant (्), remove the inherent 'a'
        if (DEVANAGARI_MAP[char] && DEVANAGARI_MAP[char].endsWith('a') && nextChar === '्') {
          result += DEVANAGARI_MAP[char].slice(0, -1);
          i++; // skip halant
          continue;
        }
        
        // If it's a consonant followed by a matra (vowel sign)
        if (DEVANAGARI_MAP[char] && DEVANAGARI_MAP[char].endsWith('a') && nextChar && DEVANAGARI_MAP[nextChar] && nextChar >= 'ा' && nextChar <= 'ौ') {
          result += DEVANAGARI_MAP[char].slice(0, -1);
          result += DEVANAGARI_MAP[nextChar];
          i++; // skip matra
          continue;
        }

        result += DEVANAGARI_MAP[char] || char;
    } else {
        result += char;
    }
  }
  return result;
};
