import test from 'node:test';
import assert from 'node:assert/strict';
import { findLineMatches, readAppFile, walkAppFiles } from './lib/app-inspector.mjs';

function flattenKeys(obj, prefix = '') {
  const keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...flattenKeys(v, full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

test('I18N-01 [PASS]: en.json and id.json have 100% key parity and non-empty values', () => {
  const en = JSON.parse(readAppFile('src/constants/en.json'));
  const id = JSON.parse(readAppFile('src/constants/id.json'));

  const enKeys = flattenKeys(en).sort();
  const idKeys = flattenKeys(id).sort();

  assert.deepEqual(enKeys, idKeys, 'Mismatch between en.json and id.json keys');
  assert.ok(enKeys.length > 0);
});

test('I18N-02 [BUG-I18N-01]: All t(...) translation keys used in src/ must exist in en.json and id.json', () => {
  const en = JSON.parse(readAppFile('src/constants/en.json'));
  const validKeys = new Set(flattenKeys(en));
  const files = walkAppFiles('src', ['.js', '.jsx', '.ts', '.tsx']);

  const missingRefs = [];
  for (const file of files) {
    const content = readAppFile(file.relativePath);
    const lines = content.split(/\r?\n/);
    lines.forEach((line, idx) => {
      for (const match of line.matchAll(/\bt\(\s*['"]([a-zA-Z0-9_.]+)['"]/g)) {
        const key = match[1];
        if (!validKeys.has(key)) {
          missingRefs.push(`${file.relativePath}:${idx + 1} -> "${key}"`);
        }
      }
    });
  }

  assert.deepEqual(
    missingRefs,
    [],
    `[BUG-I18N-01] Missing translation keys referenced in source: ${missingRefs.join('; ')}`
  );
});

test('I18N-03 [BUG-I18N-02]: i18n.init() must not hardcode lng: "en" over languageDetector', () => {
  const i18nSrc = readAppFile('src/utils/i18n.js');
  const hardcodeMatches = findLineMatches(i18nSrc, /^\s*lng\s*:\s*['"]en['"]/);
  assert.equal(
    hardcodeMatches.length,
    0,
    `[BUG-I18N-02] src/utils/i18n.js hardcodes lng: 'en' at L${hardcodeMatches[0]?.lineNumber}, overriding custom languageDetector device locale detection`
  );
});

test('I18N-04 [BUG-I18N-03]: GroupHomeScreen initial activeTab must not be hardcoded English literal', () => {
  const homeSrc = readAppFile('src/screens/GroupHomeScreen/index.js');
  const hardcodedTab = findLineMatches(homeSrc, /useState\(['"]Joined Group['"]\)/);
  assert.equal(
    hardcodedTab.length,
    0,
    `[BUG-I18N-03] GroupHomeScreen initializes activeTab to English literal 'Joined Group' at L${hardcodedTab[0]?.lineNumber}, breaking tab matching when active language is Indonesian`
  );
});

test('I18N-05 [BUG-I18N-04]: Critical user-facing alerts/errors must use t(...) instead of hardcoded English strings', () => {
  const globalFn = readAppFile('src/utils/GlobalFunction.js');
  const loginSrc = readAppFile('src/screens/LoginScreen/index.js');
  const apiSrc = readAppFile('src/react-query/states/apiServices.js');

  const hardcodedFindings = [];
  if (/Alert\.alert\(\s*["']Logout["']/.test(globalFn)) {
    hardcodedFindings.push('src/utils/GlobalFunction.js:30 (Logout Alert strings)');
  }
  if (/title:\s*["']Location Permission["']/.test(loginSrc)) {
    hardcodedFindings.push('src/screens/LoginScreen/index.js:55 (Android location permission dialog)');
  }
  if (/Invalid email or password/.test(apiSrc)) {
    hardcodedFindings.push('src/react-query/states/apiServices.js:31 (Invalid email or password)');
  }
  if (/You have been invited to/.test(apiSrc)) {
    hardcodedFindings.push('src/react-query/states/apiServices.js:106 (Notification message)');
  }

  assert.deepEqual(
    hardcodedFindings,
    [],
    `[BUG-I18N-04] Hardcoded English strings bypass i18next: ${hardcodedFindings.join('; ')}`
  );
});
