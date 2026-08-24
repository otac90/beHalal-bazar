const fs = require('fs');
const path = './src/i18n/translations.ts';

let content = fs.readFileSync(path, 'utf8');

// We will replace the entire file with a new file that exports TRANSLATIONS and getTranslation.
// But we need to make sure we don't lose anything.
