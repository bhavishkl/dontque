// Transliteration utilities for Hindi and Kannada
// This implementation uses syllable-based phonetic transliteration for accurate pronunciation

/**
 * Hindi transliteration rules for syllable-based conversion
 * Ordered from most specific to most general to ensure proper matching
 */
const hindiTransliterationRules = [
  // Complex consonant clusters
  { pattern: 'ksh', replace: 'क्ष' },
  { pattern: 'gya', replace: 'ज्ञ' },
  { pattern: 'tra', replace: 'त्र' },
  { pattern: 'shr', replace: 'श्र' },
  
  // Conjunct consonants with 'h'
  { pattern: 'kh', replace: 'ख' },
  { pattern: 'gh', replace: 'घ' },
  { pattern: 'ch', replace: 'च' },
  { pattern: 'jh', replace: 'झ' },
  { pattern: 'th', replace: 'थ' },
  { pattern: 'dh', replace: 'ध' },
  { pattern: 'ph', replace: 'फ' },
  { pattern: 'bh', replace: 'भ' },
  { pattern: 'sh', replace: 'श' },
  
  // Vowel combinations (should come before single vowels)
  { pattern: 'aa', replace: 'आ' },
  { pattern: 'ee', replace: 'ई' },
  { pattern: 'oo', replace: 'ऊ' },
  { pattern: 'ai', replace: 'ऐ' },
  { pattern: 'au', replace: 'औ' },
  
  // Single vowels
  { pattern: 'a', replace: 'अ' },
  { pattern: 'e', replace: 'ए' },
  { pattern: 'i', replace: 'इ' },
  { pattern: 'o', replace: 'ओ' },
  { pattern: 'u', replace: 'उ' },
  
  // Consonants
  { pattern: 'k', replace: 'क' },
  { pattern: 'g', replace: 'ग' },
  { pattern: 'c', replace: 'क' },
  { pattern: 'j', replace: 'ज' },
  { pattern: 't', replace: 'त' },
  { pattern: 'd', replace: 'द' },
  { pattern: 'n', replace: 'न' },
  { pattern: 'p', replace: 'प' },
  { pattern: 'b', replace: 'ब' },
  { pattern: 'm', replace: 'म' },
  { pattern: 'y', replace: 'य' },
  { pattern: 'r', replace: 'र' },
  { pattern: 'l', replace: 'ल' },
  { pattern: 'v', replace: 'व' },
  { pattern: 'w', replace: 'व' },
  { pattern: 's', replace: 'स' },
  { pattern: 'h', replace: 'ह' },
  
  // Special consonants
  { pattern: 'z', replace: 'ज़' },
  { pattern: 'f', replace: 'फ़' },
  { pattern: 'q', replace: 'क़' },
  { pattern: 'x', replace: 'क्स' }
];

/**
 * Enhanced phonetic mapping for Kannada
 * Organized by linguistic patterns for more accurate pronunciation mapping
 */
const kannadaPhonemeMap = {
  // Vowels (independent form)
  vowels: {
    'a': 'ಅ',
    'aa': 'ಆ', 'ā': 'ಆ',
    'i': 'ಇ',
    'ee': 'ಈ', 'ī': 'ಈ',
    'u': 'ಉ',
    'oo': 'ಊ', 'ū': 'ಊ',
    'e': 'ಎ',
    'ae': 'ಏ', 'ē': 'ಏ',
    'ai': 'ಐ',
    'o': 'ಒ',
    'oa': 'ಓ', 'ō': 'ಓ',
    'au': 'ಔ',
    'ru': 'ಋ', 'r̥': 'ಋ',
    'am': 'ಅಂ', 'aṃ': 'ಅಂ',
    'aha': 'ಅಃ', 'aḥ': 'ಅಃ'
  },

  // Vowel marks (dependent form)
  vowelMarks: {
    'a': '',
    'aa': 'ಾ', 'ā': 'ಾ',
    'i': 'ಿ',
    'ee': 'ೀ', 'ī': 'ೀ',
    'u': 'ು',
    'oo': 'ೂ', 'ū': 'ೂ',
    'e': 'ೆ',
    'ae': 'ೇ', 'ē': 'ೇ',
    'ai': 'ೈ',
    'o': 'ೊ',
    'oa': 'ೋ', 'ō': 'ೋ',
    'au': 'ೌ',
    'am': 'ಂ', 'aṃ': 'ಂ',
    'aha': 'ಃ', 'aḥ': 'ಃ'
  },

  // Consonants
  consonants: {
    // Velar consonants
    'k': 'ಕ', 'ka': 'ಕ',
    'kh': 'ಖ', 'kha': 'ಖ',
    'g': 'ಗ', 'ga': 'ಗ',
    'gh': 'ಘ', 'gha': 'ಘ',
    'ng': 'ಙ', 'ṅ': 'ಙ', 'nga': 'ಙ',
    
    // Palatal consonants
    'ch': 'ಚ', 'c': 'ಚ', 'cha': 'ಚ', 'ca': 'ಚ',
    'chh': 'ಛ', 'ch\'': 'ಛ', 'chha': 'ಛ',
    'j': 'ಜ', 'ja': 'ಜ',
    'jh': 'ಝ', 'jha': 'ಝ',
    'nya': 'ಞ', 'ñ': 'ಞ', 'ña': 'ಞ',
    
    // Retroflex consonants
    'T': 'ಟ', 'Ta': 'ಟ', 'ṭa': 'ಟ',
    'Th': 'ಠ', 'Tha': 'ಠ', 'ṭha': 'ಠ',
    'D': 'ಡ', 'Da': 'ಡ', 'ḍa': 'ಡ',
    'Dh': 'ಢ', 'Dha': 'ಢ', 'ḍha': 'ಢ',
    'N': 'ಣ', 'Na': 'ಣ', 'ṇa': 'ಣ',
    
    // Dental consonants
    't': 'ತ', 'ta': 'ತ',
    'th': 'ಥ', 'tha': 'ಥ',
    'd': 'ದ', 'da': 'ದ',
    'dh': 'ಧ', 'dha': 'ಧ',
    'n': 'ನ', 'na': 'ನ',
    
    // Labial consonants
    'p': 'ಪ', 'pa': 'ಪ',
    'ph': 'ಫ', 'pha': 'ಫ', 'f': 'ಫ', 'fa': 'ಫ',
    'b': 'ಬ', 'ba': 'ಬ',
    'bh': 'ಭ', 'bha': 'ಭ',
    'm': 'ಮ', 'ma': 'ಮ',
    
    // Semi-vowels and approximants
    'y': 'ಯ', 'ya': 'ಯ',
    'r': 'ರ', 'ra': 'ರ',
    'l': 'ಲ', 'la': 'ಲ',
    'v': 'ವ', 'va': 'ವ', 'w': 'ವ', 'wa': 'ವ',
    
    // Sibilants
    'sh': 'ಶ', 'sha': 'ಶ', 'ś': 'ಶ', 'śa': 'ಶ',
    'Sh': 'ಷ', 'Sha': 'ಷ', 'ṣ': 'ಷ', 'ṣa': 'ಷ',
    's': 'ಸ', 'sa': 'ಸ',
    
    // Aspirate
    'h': 'ಹ', 'ha': 'ಹ',
    
    // Additional consonants
    'L': 'ಳ', 'La': 'ಳ', 'ḷa': 'ಳ',
    'zh': 'ೞ', 'zha': 'ೞ', 'ḻa': 'ೞ', // Rare consonant
    'R': 'ಱ', 'Ra': 'ಱ', 'ṟa': 'ಱ', // Rare consonant

    // Special sounds and conjuncts
    'ksh': 'ಕ್ಷ', 'ksha': 'ಕ್ಷ',
    'x': 'ಕ್ಸ', 'xa': 'ಕ್ಸ',
    'jnya': 'ಜ್ಞ', 'jña': 'ಜ್ಞ', 'gya': 'ಜ್ಞ', 'gña': 'ಜ್ಞ',
    'tra': 'ತ್ರ',
    'thra': 'ಥ್ರ',
    'dra': 'ದ್ರ',
    'dhra': 'ಧ್ರ',
    'shra': 'ಶ್ರ',
    'Shra': 'ಷ್ರ',
    'sra': 'ಸ್ರ',
    'kra': 'ಕ್ರ',
    'gra': 'ಗ್ರ',
    'pra': 'ಪ್ರ',
    'bra': 'ಬ್ರ',
    'vra': 'ವ್ರ',
    'mra': 'ಮ್ರ',
    
    // Foreign sounds
    'z': 'ಜ಼', 'za': 'ಜ಼',
    'q': 'ಕ್', 'qa': 'ಕ್'
  },

  // Special ending consonants (without implicit vowel)
  finalConsonants: {
    'k': 'ಕ್', 'ka': 'ಕ್',
    'kh': 'ಖ್', 'kha': 'ಖ್',
    'g': 'ಗ್', 'ga': 'ಗ್',
    'gh': 'ಘ್', 'gha': 'ಘ್',
    'ng': 'ಙ್', 'nga': 'ಙ್',
    
    'ch': 'ಚ್', 'cha': 'ಚ್', 'c': 'ಚ್',
    'chh': 'ಛ್', 'chha': 'ಛ್',
    'j': 'ಜ್', 'ja': 'ಜ್',
    'jh': 'ಝ್', 'jha': 'ಝ್',
    'nya': 'ಞ್', 'ña': 'ಞ್',
    
    'T': 'ಟ್', 'Ta': 'ಟ್',
    'Th': 'ಠ್', 'Tha': 'ಠ್',
    'D': 'ಡ್', 'Da': 'ಡ್',
    'Dh': 'ಢ್', 'Dha': 'ಢ್',
    'N': 'ಣ್', 'Na': 'ಣ್',
    
    't': 'ತ್', 'ta': 'ತ್',
    'th': 'ಥ್', 'tha': 'ಥ್',
    'd': 'ದ್', 'da': 'ದ್',
    'dh': 'ಧ್', 'dha': 'ಧ್',
    'n': 'ನ್', 'na': 'ನ್',
    
    'p': 'ಪ್', 'pa': 'ಪ್',
    'ph': 'ಫ್', 'pha': 'ಫ್', 'f': 'ಫ್',
    'b': 'ಬ್', 'ba': 'ಬ್',
    'bh': 'ಭ್', 'bha': 'ಭ್',
    'm': 'ಮ್', 'ma': 'ಮ್',
    
    'y': 'ಯ್', 'ya': 'ಯ್',
    'r': 'ರ್', 'ra': 'ರ್',
    'l': 'ಲ್', 'la': 'ಲ್',
    'v': 'ವ್', 'va': 'ವ್', 'w': 'ವ್',
    
    'sh': 'ಶ್', 'sha': 'ಶ್',
    'Sh': 'ಷ್', 'Sha': 'ಷ್',
    's': 'ಸ್', 'sa': 'ಸ್',
    
    'h': 'ಹ್', 'ha': 'ಹ್',
    'L': 'ಳ್', 'La': 'ಳ್'
  },
  
  // Numerals
  numerals: {
    '0': '೦',
    '1': '೧',
    '2': '೨',
    '3': '೩',
    '4': '೪',
    '5': '೫',
    '6': '೬',
    '7': '೭',
    '8': '೮',
    '9': '೯'
  }
};

// Enhanced phonetic patterns for more accurate transliteration
const enhancedPhoneticPatterns = [
  // Word endings
  { pattern: 'tion', replace: 'ಷನ್' },
  { pattern: 'sion', replace: 'ಷನ್' },
  { pattern: 'cian', replace: 'ಷನ್' },
  { pattern: 'ism', replace: 'ಇಸಮ್' },
  { pattern: 'ist', replace: 'ಇಸ್ಟ್' },
  { pattern: 'ology', replace: 'ಾಲಜಿ' },
  { pattern: 'graphy', replace: 'ಗ್ರಫಿ' },
  { pattern: 'ment', replace: 'ಮೆಂಟ್' },
  { pattern: 'ness', replace: 'ನೆಸ್' },
  { pattern: 'ship', replace: 'ಶಿಪ್' },
  { pattern: 'hood', replace: 'ಹುಡ್' },
  { pattern: 'able', replace: 'ೇಬಲ್' },
  { pattern: 'ible', replace: 'ಇಬಲ್' },
  { pattern: 'less', replace: 'ಲೆಸ್' },
  { pattern: 'ful', replace: 'ಫುಲ್' },
  { pattern: 'ity', replace: 'ಇಟಿ' },
  { pattern: 'ance', replace: 'ಅನ್ಸ್' },
  { pattern: 'ence', replace: 'ಎನ್ಸ್' },
  { pattern: 'ing', replace: 'ಇಂಗ್' },
  { pattern: 'ous', replace: 'ಅಸ್' },
  { pattern: 'ious', replace: 'ಇಯಸ್' },
  { pattern: 'ize', replace: 'ೈಝ್' },
  { pattern: 'ise', replace: 'ೈಝ್' },
  { pattern: 'ify', replace: 'ಇಫೈ' },
  { pattern: 'ate', replace: 'ೇಟ್' },
  { pattern: 'al', replace: 'ಅಲ್' },
  { pattern: 'ic', replace: 'ಇಕ್' },
  { pattern: 'ical', replace: 'ಇಕಲ್' },
  { pattern: 'ive', replace: 'ಇವ್' },
  { pattern: 'ative', replace: 'ೇಟಿವ್' },
  { pattern: 'ly', replace: 'ಲಿ' },
  
  // Common English digraphs with specific transliterations
  { pattern: 'ph', replace: 'ಫ್' },
  { pattern: 'th', replace: 'ತ್' },
  { pattern: 'ch', replace: 'ಚ್' },
  { pattern: 'sh', replace: 'ಶ್' },
  { pattern: 'wh', replace: 'ವ್' },
  { pattern: 'qu', replace: 'ಕ್ವ' },
  { pattern: 'ck', replace: 'ಕ್' },
  { pattern: 'ng', replace: 'ಂಗ್' },
  { pattern: 'nk', replace: 'ಂಕ್' },
  { pattern: 'dg', replace: 'ಡ್ಜ್' },
  { pattern: 'tch', replace: 'ಚ್' },
  { pattern: 'wr', replace: 'ರ್' },
  { pattern: 'kn', replace: 'ನ್' },
  { pattern: 'ps', replace: 'ಸ್' },
  { pattern: 'mn', replace: 'ಮ್ನ್' },
  { pattern: 'gn', replace: 'ನ್' },
  { pattern: 'gh', replace: 'ಗ್' },
  { pattern: 'sc', replace: 'ಸ್ಕ್' },
  
  // Vowel combinations for accurate phonetic mapping
  { pattern: 'ay', replace: 'ೇ' },
  { pattern: 'ey', replace: 'ೇ' },
  { pattern: 'ie', replace: 'ೀ' },
  { pattern: 'igh', replace: 'ೈ' },
  { pattern: 'ough', replace: 'ಔ' },
  { pattern: 'augh', replace: 'ಾಫ್' },
  { pattern: 'ea', replace: 'ೀ' },
  { pattern: 'ee', replace: 'ೀ' },
  { pattern: 'ei', replace: 'ೇ' },
  { pattern: 'ew', replace: 'ೂ' },
  { pattern: 'ui', replace: 'ುಇ' },
  { pattern: 'uy', replace: 'ಯ್' },
  { pattern: 'oe', replace: 'ೋ' },
  { pattern: 'oa', replace: 'ೋ' },
  { pattern: 'oi', replace: 'ಔ' },
  { pattern: 'oy', replace: 'ಔ' },
  { pattern: 'oo', replace: 'ೂ' },
  { pattern: 'ou', replace: 'ೌ' },
  { pattern: 'eau', replace: 'ೋ' },
  { pattern: 'ieu', replace: 'ಯೂ' },
  { pattern: 'ai', replace: 'ೈ' },
  { pattern: 'au', replace: 'ಔ' },
  { pattern: 'aw', replace: 'ಾ' },
  { pattern: 'eigh', replace: 'ೇ' },
  
  // Doubled consonants (simplify in Kannada)
  { pattern: 'bb', replace: 'ಬ್' },
  { pattern: 'cc', replace: 'ಕ್' },
  { pattern: 'dd', replace: 'ಡ್' },
  { pattern: 'ff', replace: 'ಫ್' },
  { pattern: 'gg', replace: 'ಗ್' },
  { pattern: 'll', replace: 'ಲ್' },
  { pattern: 'mm', replace: 'ಮ್' },
  { pattern: 'nn', replace: 'ನ್' },
  { pattern: 'pp', replace: 'ಪ್' },
  { pattern: 'rr', replace: 'ರ್' },
  { pattern: 'ss', replace: 'ಸ್' },
  { pattern: 'tt', replace: 'ಟ್' },
  { pattern: 'zz', replace: 'ಝ್' },
  
  // Common English word patterns
  { pattern: 'the', replace: 'ದಿ' },
  { pattern: 'and', replace: 'ಆಂಡ್' },
  { pattern: 'for', replace: 'ಫಾರ್' },
  { pattern: 'to', replace: 'ಟು' },
  { pattern: 'in', replace: 'ಇನ್' },
  { pattern: 'is', replace: 'ಇಸ್' },
  { pattern: 'of', replace: 'ಆಫ್' },
  { pattern: 'it', replace: 'ಇಟ್' },
  { pattern: 'on', replace: 'ಆನ್' },
  { pattern: 'at', replace: 'ಆಟ್' },
  { pattern: 'by', replace: 'ಬೈ' },
  { pattern: 'with', replace: 'ವಿತ್' },
  { pattern: 'as', replace: 'ಆಸ್' },
  { pattern: 'from', replace: 'ಫ್ರಮ್' },
  
  // Common conjunct consonants in Kannada
  { pattern: 'kk', replace: 'ಕ್ಕ' },
  { pattern: 'kv', replace: 'ಕ್ವ' },
  { pattern: 'ky', replace: 'ಕ್ಯ' },
  { pattern: 'kr', replace: 'ಕ್ರ' },
  { pattern: 'kl', replace: 'ಕ್ಲ' },
  { pattern: 'ks', replace: 'ಕ್ಸ' },
  { pattern: 'gn', replace: 'ಗ್ನ' },
  { pattern: 'gl', replace: 'ಗ್ಲ' },
  { pattern: 'gr', replace: 'ಗ್ರ' },
  { pattern: 'gy', replace: 'ಗ್ಯ' },
  { pattern: 'gv', replace: 'ಗ್ವ' },
  { pattern: 'ch', replace: 'ಚ್' },
  { pattern: 'jn', replace: 'ಜ್ಞ' },
  { pattern: 'jv', replace: 'ಜ್ವ' },
  { pattern: 'jy', replace: 'ಜ್ಯ' },
  { pattern: 'jr', replace: 'ಜ್ರ' },
  { pattern: 'tv', replace: 'ತ್ವ' },
  { pattern: 'ty', replace: 'ತ್ಯ' },
  { pattern: 'tr', replace: 'ತ್ರ' },
  { pattern: 'tn', replace: 'ತ್ನ' },
  { pattern: 'tm', replace: 'ತ್ಮ' },
  { pattern: 'dy', replace: 'ದ್ಯ' },
  { pattern: 'dv', replace: 'ದ್ವ' },
  { pattern: 'dr', replace: 'ದ್ರ' },
  { pattern: 'dg', replace: 'ದ್ಗ' },
  { pattern: 'db', replace: 'ದ್ಬ' },
  { pattern: 'nk', replace: 'ನ್ಕ' },
  { pattern: 'ng', replace: 'ನ್ಗ' },
  { pattern: 'nj', replace: 'ನ್ಜ' },
  { pattern: 'nd', replace: 'ನ್ದ' },
  { pattern: 'nt', replace: 'ನ್ತ' },
  { pattern: 'nm', replace: 'ನ್ಮ' },
  { pattern: 'ny', replace: 'ನ್ಯ' },
  { pattern: 'nv', replace: 'ನ್ವ' },
  { pattern: 'pr', replace: 'ಪ್ರ' },
  { pattern: 'pl', replace: 'ಪ್ಲ' },
  { pattern: 'py', replace: 'ಪ್ಯ' },
  { pattern: 'pv', replace: 'ಪ್ವ' },
  { pattern: 'br', replace: 'ಬ್ರ' },
  { pattern: 'bl', replace: 'ಬ್ಲ' },
  { pattern: 'by', replace: 'ಬ್ಯ' },
  { pattern: 'bv', replace: 'ಬ್ವ' },
  { pattern: 'mp', replace: 'ಮ್ಪ' },
  { pattern: 'mb', replace: 'ಮ್ಬ' },
  { pattern: 'ml', replace: 'ಮ್ಲ' },
  { pattern: 'my', replace: 'ಮ್ಯ' },
  { pattern: 'mr', replace: 'ಮ್ರ' },
  { pattern: 'yl', replace: 'ಯ್ಲ' },
  { pattern: 'yv', replace: 'ಯ್ವ' },
  { pattern: 'rk', replace: 'ರ್ಕ' },
  { pattern: 'rg', replace: 'ರ್ಗ' },
  { pattern: 'rc', replace: 'ರ್ಚ' },
  { pattern: 'rj', replace: 'ರ್ಜ' },
  { pattern: 'rt', replace: 'ರ್ತ' },
  { pattern: 'rd', replace: 'ರ್ದ' },
  { pattern: 'rn', replace: 'ರ್ನ' },
  { pattern: 'rp', replace: 'ರ್ಪ' },
  { pattern: 'rb', replace: 'ರ್ಬ' },
  { pattern: 'rm', replace: 'ರ್ಮ' },
  { pattern: 'ry', replace: 'ರ್ಯ' },
  { pattern: 'rl', replace: 'ರ್ಲ' },
  { pattern: 'rv', replace: 'ರ್ವ' },
  { pattern: 'rs', replace: 'ರ್ಸ' },
  { pattern: 'rh', replace: 'ರ್ಹ' },
  { pattern: 'lk', replace: 'ಲ್ಕ' },
  { pattern: 'lg', replace: 'ಲ್ಗ' },
  { pattern: 'lp', replace: 'ಲ್ಪ' },
  { pattern: 'lb', replace: 'ಲ್ಬ' },
  { pattern: 'lm', replace: 'ಲ್ಮ' },
  { pattern: 'ly', replace: 'ಲ್ಯ' },
  { pattern: 'lv', replace: 'ಲ್ವ' },
  { pattern: 'vr', replace: 'ವ್ರ' },
  { pattern: 'vy', replace: 'ವ್ಯ' },
  { pattern: 'vl', replace: 'ವ್ಲ' },
  { pattern: 'shk', replace: 'ಶ್ಕ' },
  { pattern: 'shc', replace: 'ಶ್ಚ' },
  { pattern: 'sht', replace: 'ಶ್ತ' },
  { pattern: 'shn', replace: 'ಶ್ನ' },
  { pattern: 'shp', replace: 'ಶ್ಪ' },
  { pattern: 'shm', replace: 'ಶ್ಮ' },
  { pattern: 'shy', replace: 'ಶ್ಯ' },
  { pattern: 'shr', replace: 'ಶ್ರ' },
  { pattern: 'shl', replace: 'ಶ್ಲ' },
  { pattern: 'shv', replace: 'ಶ್ವ' },
  { pattern: 'sk', replace: 'ಸ್ಕ' },
  { pattern: 'st', replace: 'ಸ್ತ' },
  { pattern: 'sp', replace: 'ಸ್ಪ' },
  { pattern: 'sm', replace: 'ಸ್ಮ' },
  { pattern: 'sy', replace: 'ಸ್ಯ' },
  { pattern: 'sr', replace: 'ಸ್ರ' },
  { pattern: 'sl', replace: 'ಸ್ಲ' },
  { pattern: 'sv', replace: 'ಸ್ವ' },
  { pattern: 'hm', replace: 'ಹ್ಮ' },
  { pattern: 'hy', replace: 'ಹ್ಯ' },
  { pattern: 'hr', replace: 'ಹ್ರ' },
  { pattern: 'hl', replace: 'ಹ್ಲ' },
  { pattern: 'hv', replace: 'ಹ್ವ' }, 

// Add these additional patterns to enhancedPhoneticPatterns array

// Additional three-consonant clusters
{ pattern: 'str', replace: 'ಸ್ಟ್ರ' },
{ pattern: 'spr', replace: 'ಸ್ಪ್ರ' },
{ pattern: 'scr', replace: 'ಸ್ಕ್ರ' },
{ pattern: 'spl', replace: 'ಸ್ಪ್ಲ' },
{ pattern: 'skr', replace: 'ಸ್ಕ್ರ' },
{ pattern: 'shr', replace: 'ಶ್ರ' },
{ pattern: 'thr', replace: 'ಥ್ರ' },
{ pattern: 'ntr', replace: 'ನ್ತ್ರ' },
{ pattern: 'ndr', replace: 'ನ್ದ್ರ' },
{ pattern: 'mpr', replace: 'ಮ್ಪ್ರ' },
{ pattern: 'mbr', replace: 'ಮ್ಬ್ರ' },

// Additional consonant-vowel combinations
{ pattern: 'kaa', replace: 'ಕಾ' },
{ pattern: 'ki', replace: 'ಕಿ' },
{ pattern: 'kee', replace: 'ಕೀ' },
{ pattern: 'ku', replace: 'ಕು' },
{ pattern: 'koo', replace: 'ಕೂ' },
{ pattern: 'ke', replace: 'ಕೆ' },
{ pattern: 'kae', replace: 'ಕೇ' },
{ pattern: 'kai', replace: 'ಕೈ' },
{ pattern: 'ko', replace: 'ಕೊ' },
{ pattern: 'koa', replace: 'ಕೋ' },
{ pattern: 'kau', replace: 'ಕೌ' },

{ pattern: 'gaa', replace: 'ಗಾ' },
{ pattern: 'gi', replace: 'ಗಿ' },
{ pattern: 'gee', replace: 'ಗೀ' },
{ pattern: 'gu', replace: 'ಗು' },
{ pattern: 'goo', replace: 'ಗೂ' },
{ pattern: 'ge', replace: 'ಗೆ' },
{ pattern: 'gae', replace: 'ಗೇ' },
{ pattern: 'gai', replace: 'ಗೈ' },
{ pattern: 'go', replace: 'ಗೊ' },
{ pattern: 'goa', replace: 'ಗೋ' },
{ pattern: 'gau', replace: 'ಗೌ' },

{ pattern: 'chaa', replace: 'ಚಾ' },
{ pattern: 'chi', replace: 'ಚಿ' },
{ pattern: 'chee', replace: 'ಚೀ' },
{ pattern: 'chu', replace: 'ಚು' },
{ pattern: 'choo', replace: 'ಚೂ' },
{ pattern: 'che', replace: 'ಚೆ' },
{ pattern: 'chae', replace: 'ಚೇ' },
{ pattern: 'chai', replace: 'ಚೈ' },
{ pattern: 'cho', replace: 'ಚೊ' },
{ pattern: 'choa', replace: 'ಚೋ' },
{ pattern: 'chau', replace: 'ಚೌ' },

{ pattern: 'jaa', replace: 'ಜಾ' },
{ pattern: 'ji', replace: 'ಜಿ' },
{ pattern: 'jee', replace: 'ಜೀ' },
{ pattern: 'ju', replace: 'ಜು' },
{ pattern: 'joo', replace: 'ಜೂ' },
{ pattern: 'je', replace: 'ಜೆ' },
{ pattern: 'jae', replace: 'ಜೇ' },
{ pattern: 'jai', replace: 'ಜೈ' },
{ pattern: 'jo', replace: 'ಜೊ' },
{ pattern: 'joa', replace: 'ಜೋ' },
{ pattern: 'jau', replace: 'ಜೌ' },

{ pattern: 'Taa', replace: 'ಟಾ' },
{ pattern: 'Ti', replace: 'ಟಿ' },
{ pattern: 'Tee', replace: 'ಟೀ' },
{ pattern: 'Tu', replace: 'ಟು' },
{ pattern: 'Too', replace: 'ಟೂ' },
{ pattern: 'Te', replace: 'ಟೆ' },
{ pattern: 'Tae', replace: 'ಟೇ' },
{ pattern: 'Tai', replace: 'ಟೈ' },
{ pattern: 'To', replace: 'ಟೊ' },
{ pattern: 'Toa', replace: 'ಟೋ' },
{ pattern: 'Tau', replace: 'ಟೌ' },

{ pattern: 'Daa', replace: 'ಡಾ' },
{ pattern: 'Di', replace: 'ಡಿ' },
{ pattern: 'Dee', replace: 'ಡೀ' },
{ pattern: 'Du', replace: 'ಡು' },
{ pattern: 'Doo', replace: 'ಡೂ' },
{ pattern: 'De', replace: 'ಡೆ' },
{ pattern: 'Dae', replace: 'ಡೇ' },
{ pattern: 'Dai', replace: 'ಡೈ' },
{ pattern: 'Do', replace: 'ಡೊ' },
{ pattern: 'Doa', replace: 'ಡೋ' },
{ pattern: 'Dau', replace: 'ಡೌ' },

{ pattern: 'taa', replace: 'ತಾ' },
{ pattern: 'ti', replace: 'ತಿ' },
{ pattern: 'tee', replace: 'ತೀ' },
{ pattern: 'tu', replace: 'ತು' },
{ pattern: 'too', replace: 'ತೂ' },
{ pattern: 'te', replace: 'ತೆ' },
{ pattern: 'tae', replace: 'ತೇ' },
{ pattern: 'tai', replace: 'ತೈ' },
{ pattern: 'to', replace: 'ತೊ' },
{ pattern: 'toa', replace: 'ತೋ' },
{ pattern: 'tau', replace: 'ತೌ' },

{ pattern: 'daa', replace: 'ದಾ' },
{ pattern: 'di', replace: 'ದಿ' },
{ pattern: 'dee', replace: 'ದೀ' },
{ pattern: 'du', replace: 'ದು' },
{ pattern: 'doo', replace: 'ದೂ' },
{ pattern: 'de', replace: 'ದೆ' },
{ pattern: 'dae', replace: 'ದೇ' },
{ pattern: 'dai', replace: 'ದೈ' },
{ pattern: 'do', replace: 'ದೊ' },
{ pattern: 'doa', replace: 'ದೋ' },
{ pattern: 'dau', replace: 'ದೌ' },

{ pattern: 'naa', replace: 'ನಾ' },
{ pattern: 'ni', replace: 'ನಿ' },
{ pattern: 'nee', replace: 'ನೀ' },
{ pattern: 'nu', replace: 'ನು' },
{ pattern: 'noo', replace: 'ನೂ' },
{ pattern: 'ne', replace: 'ನೆ' },
{ pattern: 'nae', replace: 'ನೇ' },
{ pattern: 'nai', replace: 'ನೈ' },
{ pattern: 'no', replace: 'ನೊ' },
{ pattern: 'noa', replace: 'ನೋ' },
{ pattern: 'nau', replace: 'ನೌ' },

{ pattern: 'paa', replace: 'ಪಾ' },
{ pattern: 'pi', replace: 'ಪಿ' },
{ pattern: 'pee', replace: 'ಪೀ' },
{ pattern: 'pu', replace: 'ಪು' },
{ pattern: 'poo', replace: 'ಪೂ' },
{ pattern: 'pe', replace: 'ಪೆ' },
{ pattern: 'pae', replace: 'ಪೇ' },
{ pattern: 'pai', replace: 'ಪೈ' },
{ pattern: 'po', replace: 'ಪೊ' },
{ pattern: 'poa', replace: 'ಪೋ' },
{ pattern: 'pau', replace: 'ಪೌ' },

{ pattern: 'baa', replace: 'ಬಾ' },
{ pattern: 'bi', replace: 'ಬಿ' },
{ pattern: 'bee', replace: 'ಬೀ' },
{ pattern: 'bu', replace: 'ಬು' },
{ pattern: 'boo', replace: 'ಬೂ' },
{ pattern: 'be', replace: 'ಬೆ' },
{ pattern: 'bae', replace: 'ಬೇ' },
{ pattern: 'bai', replace: 'ಬೈ' },
{ pattern: 'bo', replace: 'ಬೊ' },
{ pattern: 'boa', replace: 'ಬೋ' },
{ pattern: 'bau', replace: 'ಬೌ' },

{ pattern: 'maa', replace: 'ಮಾ' },
{ pattern: 'mi', replace: 'ಮಿ' },
{ pattern: 'mee', replace: 'ಮೀ' },
{ pattern: 'mu', replace: 'ಮು' },
{ pattern: 'moo', replace: 'ಮೂ' },
{ pattern: 'me', replace: 'ಮೆ' },
{ pattern: 'mae', replace: 'ಮೇ' },
{ pattern: 'mai', replace: 'ಮೈ' },
{ pattern: 'mo', replace: 'ಮೊ' },
{ pattern: 'moa', replace: 'ಮೋ' },
{ pattern: 'mau', replace: 'ಮೌ' },

{ pattern: 'yaa', replace: 'ಯಾ' },
{ pattern: 'yi', replace: 'ಯಿ' },
{ pattern: 'yee', replace: 'ಯೀ' },
{ pattern: 'yu', replace: 'ಯು' },
{ pattern: 'yoo', replace: 'ಯೂ' },
{ pattern: 'ye', replace: 'ಯೆ' },
{ pattern: 'yae', replace: 'ಯೇ' },
{ pattern: 'yai', replace: 'ಯೈ' },
{ pattern: 'yo', replace: 'ಯೊ' },
{ pattern: 'yoa', replace: 'ಯೋ' },
{ pattern: 'yau', replace: 'ಯೌ' },

{ pattern: 'raa', replace: 'ರಾ' },
{ pattern: 'ri', replace: 'ರಿ' },
{ pattern: 'ree', replace: 'ರೀ' },
{ pattern: 'ru', replace: 'ರು' },
{ pattern: 'roo', replace: 'ರೂ' },
{ pattern: 're', replace: 'ರೆ' },
{ pattern: 'rae', replace: 'ರೇ' },
{ pattern: 'rai', replace: 'ರೈ' },
{ pattern: 'ro', replace: 'ರೊ' },
{ pattern: 'roa', replace: 'ರೋ' },
{ pattern: 'rau', replace: 'ರೌ' },

{ pattern: 'laa', replace: 'ಲಾ' },
{ pattern: 'li', replace: 'ಲಿ' },
{ pattern: 'lee', replace: 'ಲೀ' },
{ pattern: 'lu', replace: 'ಲು' },
{ pattern: 'loo', replace: 'ಲೂ' },
{ pattern: 'le', replace: 'ಲೆ' },
{ pattern: 'lae', replace: 'ಲೇ' },
{ pattern: 'lai', replace: 'ಲೈ' },
{ pattern: 'lo', replace: 'ಲೊ' },
{ pattern: 'loa', replace: 'ಲೋ' },
{ pattern: 'lau', replace: 'ಲೌ' },

{ pattern: 'vaa', replace: 'ವಾ' },
{ pattern: 'vi', replace: 'ವಿ' },
{ pattern: 'vee', replace: 'ವೀ' },
{ pattern: 'vu', replace: 'ವು' },
{ pattern: 'voo', replace: 'ವೂ' },
{ pattern: 've', replace: 'ವೆ' },
{ pattern: 'vae', replace: 'ವೇ' },
{ pattern: 'vai', replace: 'ವೈ' },
{ pattern: 'vo', replace: 'ವೊ' },
{ pattern: 'voa', replace: 'ವೋ' },
{ pattern: 'vau', replace: 'ವೌ' },

{ pattern: 'shaa', replace: 'ಶಾ' },
{ pattern: 'shi', replace: 'ಶಿ' },
{ pattern: 'shee', replace: 'ಶೀ' },
{ pattern: 'shu', replace: 'ಶು' },
{ pattern: 'shoo', replace: 'ಶೂ' },
{ pattern: 'she', replace: 'ಶೆ' },
{ pattern: 'shae', replace: 'ಶೇ' },
{ pattern: 'shai', replace: 'ಶೈ' },
{ pattern: 'sho', replace: 'ಶೊ' },
{ pattern: 'shoa', replace: 'ಶೋ' },
{ pattern: 'shau', replace: 'ಶೌ' },

{ pattern: 'saa', replace: 'ಸಾ' },
{ pattern: 'si', replace: 'ಸಿ' },
{ pattern: 'see', replace: 'ಸೀ' },
{ pattern: 'su', replace: 'ಸು' },
{ pattern: 'soo', replace: 'ಸೂ' },
{ pattern: 'se', replace: 'ಸೆ' },
{ pattern: 'sae', replace: 'ಸೇ' },
{ pattern: 'sai', replace: 'ಸೈ' },
{ pattern: 'so', replace: 'ಸೊ' },
{ pattern: 'soa', replace: 'ಸೋ' },
{ pattern: 'sau', replace: 'ಸೌ' },

{ pattern: 'haa', replace: 'ಹಾ' },
{ pattern: 'hi', replace: 'ಹಿ' },
{ pattern: 'hee', replace: 'ಹೀ' },
{ pattern: 'hu', replace: 'ಹು' },
{ pattern: 'hoo', replace: 'ಹೂ' },
{ pattern: 'he', replace: 'ಹೆ' },
{ pattern: 'hae', replace: 'ಹೇ' },
{ pattern: 'hai', replace: 'ಹೈ' },
{ pattern: 'ho', replace: 'ಹೊ' },
{ pattern: 'hoa', replace: 'ಹೋ' },
{ pattern: 'hau', replace: 'ಹೌ' },

// Additional aspirated consonant combinations
{ pattern: 'khaa', replace: 'ಖಾ' },
{ pattern: 'khi', replace: 'ಖಿ' },
{ pattern: 'khee', replace: 'ಖೀ' },
{ pattern: 'khu', replace: 'ಖು' },
{ pattern: 'khoo', replace: 'ಖೂ' },
{ pattern: 'khe', replace: 'ಖೆ' },
{ pattern: 'khae', replace: 'ಖೇ' },
{ pattern: 'khai', replace: 'ಖೈ' },
{ pattern: 'kho', replace: 'ಖೊ' },
{ pattern: 'khoa', replace: 'ಖೋ' },
{ pattern: 'khau', replace: 'ಖೌ' },

{ pattern: 'ghaa', replace: 'ಘಾ' },
{ pattern: 'ghi', replace: 'ಘಿ' },
{ pattern: 'ghee', replace: 'ಘೀ' },
{ pattern: 'ghu', replace: 'ಘು' },
{ pattern: 'ghoo', replace: 'ಘೂ' },
{ pattern: 'ghe', replace: 'ಘೆ' },
{ pattern: 'ghae', replace: 'ಘೇ' },
{ pattern: 'ghai', replace: 'ಘೈ' },
{ pattern: 'gho', replace: 'ಘೊ' },
{ pattern: 'ghoa', replace: 'ಘೋ' },
{ pattern: 'ghau', replace: 'ಘೌ' },

{ pattern: 'chhaa', replace: 'ಛಾ' },
{ pattern: 'chhi', replace: 'ಛಿ' },
{ pattern: 'chhee', replace: 'ಛೀ' },
{ pattern: 'chhu', replace: 'ಛು' },
{ pattern: 'chhoo', replace: 'ಛೂ' },
{ pattern: 'chhe', replace: 'ಛೆ' },
{ pattern: 'chhae', replace: 'ಛೇ' },
{ pattern: 'chhai', replace: 'ಛೈ' },
{ pattern: 'chho', replace: 'ಛೊ' },
{ pattern: 'chhoa', replace: 'ಛೋ' },
{ pattern: 'chhau', replace: 'ಛೌ' },

{ pattern: 'jhaa', replace: 'ಝಾ' },
{ pattern: 'jhi', replace: 'ಝಿ' },
{ pattern: 'jhee', replace: 'ಝೀ' },
{ pattern: 'jhu', replace: 'ಝು' },
{ pattern: 'jhoo', replace: 'ಝೂ' },
{ pattern: 'jhe', replace: 'ಝೆ' },
{ pattern: 'jhae', replace: 'ಝೇ' },
{ pattern: 'jhai', replace: 'ಝೈ' },
{ pattern: 'jho', replace: 'ಝೊ' },
{ pattern: 'jhoa', replace: 'ಝೋ' },
{ pattern: 'jhau', replace: 'ಝೌ' },

{ pattern: 'Thaa', replace: 'ಠಾ' },
{ pattern: 'Thi', replace: 'ಠಿ' },
{ pattern: 'Thee', replace: 'ಠೀ' },
{ pattern: 'Thu', replace: 'ಠು' },
{ pattern: 'Thoo', replace: 'ಠೂ' },
{ pattern: 'The', replace: 'ಠೆ' },
{ pattern: 'Thae', replace: 'ಠೇ' },
{ pattern: 'Thai', replace: 'ಠೈ' },
{ pattern: 'Tho', replace: 'ಠೊ' },
{ pattern: 'Thoa', replace: 'ಠೋ' },
{ pattern: 'Thau', replace: 'ಠೌ' },

{ pattern: 'Dhaa', replace: 'ಢಾ' },
{ pattern: 'Dhi', replace: 'ಢಿ' },
{ pattern: 'Dhee', replace: 'ಢೀ' },
{ pattern: 'Dhu', replace: 'ಢು' },
{ pattern: 'Dhoo', replace: 'ಢೂ' },
{ pattern: 'Dhe', replace: 'ಢೆ' },
{ pattern: 'Dhae', replace: 'ಢೇ' },
{ pattern: 'Dhai', replace: 'ಢೈ' },
{ pattern: 'Dho', replace: 'ಢೊ' },
{ pattern: 'Dhoa', replace: 'ಢೋ' },
{ pattern: 'Dhau', replace: 'ಢೌ' },

{ pattern: 'thaa', replace: 'ಥಾ' },
{ pattern: 'thi', replace: 'ಥಿ' },
{ pattern: 'thee', replace: 'ಥೀ' },
{ pattern: 'thu', replace: 'ಥು' },
{ pattern: 'thoo', replace: 'ಥೂ' },
{ pattern: 'the', replace: 'ಥೆ' },
{ pattern: 'thae', replace: 'ಥೇ' },
{ pattern: 'thai', replace: 'ಥೈ' },
{ pattern: 'tho', replace: 'ಥೊ' },
{ pattern: 'thoa', replace: 'ಥೋ' },
{ pattern: 'thau', replace: 'ಥೌ' },

{ pattern: 'dhaa', replace: 'ಧಾ' },
{ pattern: 'dhi', replace: 'ಧಿ' },
{ pattern: 'dhee', replace: 'ಧೀ' },
{ pattern: 'dhu', replace: 'ಧು' },
{ pattern: 'dhoo', replace: 'ಧೂ' },
{ pattern: 'dhe', replace: 'ಧೆ' },
{ pattern: 'dhae', replace: 'ಧೇ' },
{ pattern: 'dhai', replace: 'ಧೈ' },
{ pattern: 'dho', replace: 'ಧೊ' },
{ pattern: 'dhoa', replace: 'ಧೋ' },
{ pattern: 'dhau', replace: 'ಧೌ' },

{ pattern: 'phaa', replace: 'ಫಾ' },
{ pattern: 'phi', replace: 'ಫಿ' },
{ pattern: 'phee', replace: 'ಫೀ' },
{ pattern: 'phu', replace: 'ಫು' },
{ pattern: 'phoo', replace: 'ಫೂ' },
{ pattern: 'phe', replace: 'ಫೆ' },
{ pattern: 'phae', replace: 'ಫೇ' },
{ pattern: 'phai', replace: 'ಫೈ' },
{ pattern: 'pho', replace: 'ಫೊ' },
{ pattern: 'phoa', replace: 'ಫೋ' },
{ pattern: 'phau', replace: 'ಫೌ' },

{ pattern: 'bhaa', replace: 'ಭಾ' },
{ pattern: 'bhi', replace: 'ಭಿ' },
{ pattern: 'bhee', replace: 'ಭೀ' },
{ pattern: 'bhu', replace: 'ಭು' },
{ pattern: 'bhoo', replace: 'ಭೂ' },
{ pattern: 'bhe', replace: 'ಭೆ' },
{ pattern: 'bhae', replace: 'ಭೇ' },
{ pattern: 'bhai', replace: 'ಭೈ' },
{ pattern: 'bho', replace: 'ಭೊ' },
{ pattern: 'bhoa', replace: 'ಭೋ' },
{ pattern: 'bhau', replace: 'ಭೌ' },

// Special consonant combinations with vowels
{ pattern: 'kshaa', replace: 'ಕ್ಷಾ' },
{ pattern: 'kshi', replace: 'ಕ್ಷಿ' },
{ pattern: 'kshee', replace: 'ಕ್ಷೀ' },
{ pattern: 'kshu', replace: 'ಕ್ಷು' },
{ pattern: 'kshoo', replace: 'ಕ್ಷೂ' },
{ pattern: 'kshe', replace: 'ಕ್ಷೆ' },
{ pattern: 'kshae', replace: 'ಕ್ಷೇ' },
{ pattern: 'kshai', replace: 'ಕ್ಷೈ' },
{ pattern: 'ksho', replace: 'ಕ್ಷೊ' },
{ pattern: 'kshoa', replace: 'ಕ್ಷೋ' },
{ pattern: 'kshau', replace: 'ಕ್ಷೌ' },

{ pattern: 'jnyaa', replace: 'ಜ್ಞಾ' },
{ pattern: 'jnyi', replace: 'ಜ್ಞಿ' },
{ pattern: 'jnyee', replace: 'ಜ್ಞೀ' },
{ pattern: 'jnyu', replace: 'ಜ್ಞು' },
{ pattern: 'jnyoo', replace: 'ಜ್ಞೂ' },
{ pattern: 'jnye', replace: 'ಜ್ಞೆ' },
{ pattern: 'jnyae', replace: 'ಜ್ಞೇ' },
{ pattern: 'jnyai', replace: 'ಜ್ಞೈ' },
{ pattern: 'jnyo', replace: 'ಜ್ಞೊ' },
{ pattern: 'jnyoa', replace: 'ಜ್ಞೋ' },
{ pattern: 'jnyau', replace: 'ಜ್ಞೌ' },

// Common English words with specific Kannada transliterations
{ pattern: 'computer', replace: 'ಕಂಪ್ಯೂಟರ್' },
{ pattern: 'mobile', replace: 'ಮೊಬೈಲ್' },
{ pattern: 'phone', replace: 'ಫೋನ್' },
{ pattern: 'internet', replace: 'ಇಂಟರ್ನೆಟ್' },
{ pattern: 'email', replace: 'ಇಮೇಲ್' },
{ pattern: 'website', replace: 'ವೆಬ್‌ಸೈಟ್' },
{ pattern: 'software', replace: 'ಸಾಫ್ಟ್‌ವೇರ್' },
{ pattern: 'hardware', replace: 'ಹಾರ್ಡ್‌ವೇರ್' },
{ pattern: 'keyboard', replace: 'ಕೀಬೋರ್ಡ್' },
{ pattern: 'mouse', replace: 'ಮೌಸ್' },
{ pattern: 'printer', replace: 'ಪ್ರಿಂಟರ್' },
{ pattern: 'scanner', replace: 'ಸ್ಕ್ಯಾನರ್' },
{ pattern: 'server', replace: 'ಸರ್ವರ್' },
{ pattern: 'network', replace: 'ನೆಟ್‌ವರ್ಕ್' },
{ pattern: 'password', replace: 'ಪಾಸ್ವರ್ಡ್' },
  
];

// Simple transliteration cache for improved performance
const transliterationCache = {
  kannada: new Map(),
  hindi: new Map()
};

/**
 * Advanced transliteration of English text to Kannada
 * Uses a syllable-based approach with comprehensive phonetic rules
 * 
 * @param {string} text - The text to transliterate
 * @returns {string} - Transliterated text in Kannada
 */
export function transliterateToKannada(text) {
  if (!text) return '';
  
  try {
    // Normalize input to handle case and trim whitespace
    const normalizedText = String(text).toLowerCase().trim();
    
    // Check cache first
    if (transliterationCache.kannada.has(normalizedText)) {
      return transliterationCache.kannada.get(normalizedText);
    }
    
    // Handle multi-word input
    let result;
    if (normalizedText.includes(' ')) {
      result = normalizedText.split(' ')
        .map(word => transliterateWordToKannada(word))
        .join(' ');
    } else {
      result = transliterateWordToKannada(normalizedText);
    }
    
    // Cache the result
    transliterationCache.kannada.set(normalizedText, result);
    return result;
  } catch (error) {
    console.error('Error transliterating to Kannada:', error);
    return String(text || '');
  }
}

/**
 * Transliterate a single word to Kannada with advanced phonetic rules
 * 
 * @param {string} word - The word to transliterate
 * @returns {string} - Transliterated word in Kannada
 */
function transliterateWordToKannada(word) {
  if (!word) return '';
  
  // Handle the common case of "walk-in customer"
  if (word === 'walk-in' || word === 'customer' || word === 'walk-in customer') {
    return word === 'walk-in' ? 'ವಾಕ್-ಇನ್' : 
           word === 'customer' ? 'ಕಸ್ಟಮರ್' : 
           'ವಾಕ್-ಇನ್ ಕಸ್ಟಮರ್';
  }
  
  // Apply complex syllable-based transliteration
  return applyAdvancedTransliteration(word);
}

/**
 * Apply advanced phonetic transliteration rules to convert a word to Kannada
 * 
 * @param {string} word - The word to transliterate
 * @returns {string} - Transliterated text in Kannada
 */
function applyAdvancedTransliteration(word) {
  // Pre-process special sequences
  for (const { pattern, replace } of enhancedPhoneticPatterns) {
    if (word.includes(pattern)) {
      word = word.replace(new RegExp(pattern, 'g'), replace);
    }
  }
  
  let result = '';
  let i = 0;
  
  // Process the word character by character with lookahead for multi-character sequences
  while (i < word.length) {
    let matched = false;
    
    // Check for consonant clusters (max 3 characters)
    for (let len = 3; len > 0; len--) {
      if (i + len <= word.length) {
        const cluster = word.substring(i, i + len);
        
        // Look for consonant + vowel pattern
        if (len >= 2) {
          for (const consonant in kannadaPhonemeMap.consonants) {
            if (cluster.startsWith(consonant)) {
              const remainingChars = cluster.substring(consonant.length);
              
              // Check if remaining chars are a vowel
              for (const vowel in kannadaPhonemeMap.vowelMarks) {
                if (remainingChars === vowel) {
                  // Consonant + vowel match found
                  result += kannadaPhonemeMap.consonants[consonant];
                  
                  // Add vowel mark if not the default 'a'
                  if (vowel !== 'a') {
                    result += kannadaPhonemeMap.vowelMarks[vowel];
                  }
                  
                  i += consonant.length + vowel.length;
                  matched = true;
                  break;
                }
              }
              
              if (matched) break;
            }
          }
        }
        
        // If still not matched, check for standalone consonants and vowels
        if (!matched) {
          // Check consonants first
          if (kannadaPhonemeMap.consonants[cluster]) {
            // If at the end of the word or followed by another consonant, use final form
            if (i + len === word.length || 
                (i + len < word.length && !isVowel(word[i + len]))) {
              result += kannadaPhonemeMap.finalConsonants[cluster] || 
                        (kannadaPhonemeMap.consonants[cluster] + '್');
            } else {
              result += kannadaPhonemeMap.consonants[cluster];
            }
            
            i += len;
            matched = true;
            break;
          }
          
          // Check vowels
          if (kannadaPhonemeMap.vowels[cluster]) {
            result += kannadaPhonemeMap.vowels[cluster];
            i += len;
            matched = true;
            break;
          }
        }
      }
    }
    
    // If no match was found, keep the character as is
    if (!matched) {
      result += word[i];
      i++;
    }
  }
  
  // Handle ending with a consonant (add halant)
  if (result.length > 0 && !result.endsWith('್') && isConsonantWithoutVowel(result)) {
    result += '್';
  }
  
  return result;
}

/**
 * Check if a character is a vowel
 * 
 * @param {string} char - The character to check
 * @returns {boolean} - True if the character is a vowel
 */
function isVowel(char) {
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  return vowels.includes(char.toLowerCase());
}

/**
 * Check if a Kannada character is a consonant without a vowel mark
 * 
 * @param {string} str - The Kannada string to check
 * @returns {boolean} - True if the last character is a consonant without a vowel
 */
function isConsonantWithoutVowel(str) {
  // Get the last character
  const lastChar = str.slice(-1);
  
  // Check if it's a consonant
  for (const consonant in kannadaPhonemeMap.consonants) {
    if (kannadaPhonemeMap.consonants[consonant] === lastChar) {
      return true;
    }
  }
  
  return false;
}

/**
 * Get text in multiple languages
 * @param {string} text - The original text
 * @returns {Object} - Object containing the text in different languages
 */
export function getMultiLanguageText(text) {
  if (!text) return { original: '', kannada: '' };
  
  try {
    return {
      original: String(text || ''),
      kannada: transliterateToKannada(text)
    };
  } catch (error) {
    console.error('Error getting multi-language text:', error);
    return { original: String(text || ''), kannada: '' };
  }
} 