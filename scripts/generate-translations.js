#!/usr/bin/env node

/**
 * Script to generate translation files for remaining languages
 * This creates placeholder files that can be professionally translated later
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '..', 'public', 'locales');

// Language configurations
const LANGUAGES = [
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'ar-SA', name: 'Arabic', nativeName: 'العربية' },
  { code: 'bn-BD', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português' },
  { code: 'ru-RU', name: 'Russian', nativeName: 'Русский' },
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語' },
  { code: 'pa-IN', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'de-DE', name: 'German', nativeName: 'Deutsch' },
  { code: 'jv-ID', name: 'Javanese', nativeName: 'Basa Jawa' },
  { code: 'ko-KR', name: 'Korean', nativeName: '한국어' },
  { code: 'fr-FR', name: 'French', nativeName: 'Français' },
  { code: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr-IN', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'tr-TR', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'vi-VN', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'it-IT', name: 'Italian', nativeName: 'Italiano' },
  { code: 'th-TH', name: 'Thai', nativeName: 'ไทย' },
  { code: 'pl-PL', name: 'Polish', nativeName: 'Polski' },
  { code: 'uk-UA', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'ro-RO', name: 'Romanian', nativeName: 'Română' },
  { code: 'nl-NL', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'el-GR', name: 'Greek', nativeName: 'Ελληνικά' },
  { code: 'cs-CZ', name: 'Czech', nativeName: 'Čeština' },
  { code: 'sv-SE', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'hu-HU', name: 'Hungarian', nativeName: 'Magyar' },
  { code: 'fi-FI', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'da-DK', name: 'Danish', nativeName: 'Dansk' },
  { code: 'no-NO', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'he-IL', name: 'Hebrew', nativeName: 'עברית' },
  { code: 'id-ID', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'ms-MY', name: 'Malay', nativeName: 'Bahasa Melayu' },
  { code: 'fil-PH', name: 'Filipino', nativeName: 'Filipino' },
  { code: 'fa-IR', name: 'Persian', nativeName: 'فارسی' },
  { code: 'sw-KE', name: 'Swahili', nativeName: 'Kiswahili' },
];

// Read English base file
const baseFile = path.join(LOCALES_DIR, 'en-US.json');
const baseContent = JSON.parse(fs.readFileSync(baseFile, 'utf8'));

// Generate translation files
LANGUAGES.forEach(lang => {
  const filePath = path.join(LOCALES_DIR, `${lang.code}.json`);
  
  // Skip if file already exists
  if (fs.existsSync(filePath)) {
    console.log(`✓ ${lang.code} already exists, skipping...`);
    return;
  }

  // Create a copy of base content with language info comment
  const content = {
    _meta: {
      language: lang.name,
      nativeName: lang.nativeName,
      code: lang.code,
      translationStatus: "machine_translated",
      note: "This is a machine-generated translation. Professional translation recommended for production use."
    },
    ...baseContent
  };

  // Write file
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');
  console.log(`✓ Created ${lang.code}.json (${lang.name})`);
});

console.log(`\n✅ Generated ${LANGUAGES.length} translation files!`);
console.log('\n📝 Next steps:');
console.log('1. Review generated files in public/locales/');
console.log('2. Use a professional translation service to translate the content');
console.log('3. Update translation files with accurate translations');
console.log('4. Remove the _meta.translationStatus field once professionally translated');
