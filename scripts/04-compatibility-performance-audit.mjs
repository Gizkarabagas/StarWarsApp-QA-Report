import test from 'node:test';
import assert from 'node:assert/strict';
import { findLineMatches, readAppFile, walkAppFiles } from './lib/app-inspector.mjs';

test('COMPAT-01 [BUG-COMP-01]: Screen metrics must adapt dynamically to orientation/tablet changes (no frozen Dimensions)', () => {
  const globalConfig = readAppFile('src/utils/GlobalConfig.js');
  const frozenMetrics = /Object\.freeze\(\{[\s\S]*Dimensions\.get\(['"]window['"]\)/.test(globalConfig);

  const srcFiles = walkAppFiles('src', ['.js', '.jsx', '.ts', '.tsx']);
  const usesDynamicHook = srcFiles.some((f) =>
    /useWindowDimensions|Dimensions\.addEventListener/.test(readAppFile(f.relativePath))
  );

  assert.ok(
    !frozenMetrics && usesDynamicHook,
    '[BUG-COMP-01] GlobalConfig.js freezes Dimensions.get("window") at startup and no screen uses useWindowDimensions() or Dimensions listener, breaking landscape and tablet layouts'
  );
});

test('COMPAT-02 [BUG-COMP-02]: iPad multitasking/tablet orientation plist keys (UISupportedInterfaceOrientations~ipad) must be configured', () => {
  const plist = readAppFile('ios/StarWarsApp/Info.plist');
  assert.match(
    plist,
    /UISupportedInterfaceOrientations~ipad/,
    '[BUG-COMP-02] ios/StarWarsApp/Info.plist defines UISupportedInterfaceOrientations for iPhone only, omitting UISupportedInterfaceOrientations~ipad'
  );
});

test('COMPAT-03 [BUG-COMP-03]: LoginScreen & ProfileScreen should wrap content in ScrollView for small screens / landscape', () => {
  const loginSrc = readAppFile('src/screens/LoginScreen/index.js');
  const profileSrc = readAppFile('src/screens/ProfileScreen/index.js');

  assert.match(
    loginSrc,
    /<ScrollView/,
    '[BUG-COMP-03] LoginScreen does not use ScrollView; content clips on landscape phones or small viewports when keyboard opens'
  );
  assert.match(
    profileSrc,
    /<ScrollView/,
    '[BUG-COMP-03] ProfileScreen does not use ScrollView; vertically centered layout overflows on landscape screens'
  );
});

test('PERF-01 [BUG-PERF-01]: App.js useEffect must specify dependency array to prevent listener churn on every render', () => {
  const appSrc = readAppFile('src/App.js');
  // Look for the useEffect block around lines 42-50 ending with }); rather than }, []);
  const badEffect = /useEffect\(\(\)\s*=>\s*\{[\s\S]*?PushNotificationIOS\.removeEventListener[\s\S]*?\}\s*\)\s*;/.test(appSrc);
  assert.equal(
    badEffect,
    false,
    '[BUG-PERF-01] src/App.js L42-50 useEffect has no dependency array [], causing iOS notification listener teardown/re-registration on every App render'
  );
});

test('PERF-02 [BUG-PERF-02]: SwapiScreen must not execute console.log with full dataset array on every render', () => {
  const swapiSrc = readAppFile('src/screens/SwapiScreen/index.js');
  const logMatches = findLineMatches(swapiSrc, /console\.log\(\s*["']listSwapiData["']/);
  assert.equal(
    logMatches.length,
    0,
    `[BUG-PERF-02] SwapiScreen logs entire listSwapiData array on every render at L${logMatches[0]?.lineNumber}, degrading JS thread & bridge serialization`
  );
});

test('PERF-03 [BUG-PERF-03]: User profile photos should not be stored & duplicated as raw base64 strings inside MMKV groups', () => {
  const registerSrc = readAppFile('src/screens/RegisterScreen/index.js');
  const apiSrc = readAppFile('src/react-query/states/apiServices.js');
  const storesBase64 = /RNFS\.readFile\(filePath,\s*['"]base64['"]\)/.test(registerSrc);
  const duplicatesPhotoInGroups = /photo:\s*member\.photo/.test(apiSrc);

  assert.ok(
    !(storesBase64 && duplicatesPhotoInGroups),
    '[BUG-PERF-03] RegisterScreen converts photos to base64 in MMKV and fetchSaveGroupRequest duplicates raw base64 blobs inside every group member record'
  );
});

test('PERF-04 [BUG-PERF-04]: SwapiScreen search input should be debounced instead of firing HTTP request per keystroke', () => {
  const swapiSrc = readAppFile('src/screens/SwapiScreen/index.js');
  const hasDebounce = /debounce|setTimeout/i.test(swapiSrc);
  assert.ok(
    hasDebounce,
    '[BUG-PERF-04] SwapiScreen triggers fetch() on every keystroke in searchQuery without debouncing, multiplying redundant network downloads (~82 records per keystroke on swapi.info)'
  );
});
