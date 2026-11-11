import test from 'node:test';
import assert from 'node:assert/strict';
import { findLineMatches, readAppFile } from './lib/app-inspector.mjs';

test('SEC-01 [BUG-SEC-01]: Passwords must not be stored or compared in plaintext in MMKV storage', () => {
  const storageSrc = readAppFile('src/utils/Storages.js');
  const apiSrc = readAppFile('src/react-query/states/apiServices.js');
  const registerSrc = readAppFile('src/screens/RegisterScreen/index.js');

  const unencryptedMMKV = /new MMKV\(\s*\)/.test(storageSrc);
  const plaintextCompare = /user\.password\s*===\s*params\.password/.test(apiSrc);
  const storesConfirmPwd = /confirmPassword:\s*params\?\.confirmPassword/.test(apiSrc);
  const storesSessionPwd = /CURR_USER_LOGIN_DATA,\s*\{\s*email:\s*data\.email,\s*password:\s*data\.password\s*\}/.test(registerSrc);

  assert.ok(
    !unencryptedMMKV && !plaintextCompare && !storesConfirmPwd && !storesSessionPwd,
    '[BUG-SEC-01] Critical: Unencrypted MMKV stores plaintext password & confirmPassword in LIST_USER and CURR_USER_LOGIN_DATA, and loginRequest checks user.password === params.password directly'
  );
});

test('SEC-02 [BUG-SEC-02]: Hardcoded Google Maps / Geo API keys must not be committed to AndroidManifest.xml or AppDelegate.mm', () => {
  const manifest = readAppFile('android/app/src/main/AndroidManifest.xml');
  const appDelegate = readAppFile('ios/StarWarsApp/AppDelegate.mm');

  const keyRegex = /AIza[0-9A-Za-z\-_]{20,}/;
  assert.equal(keyRegex.test(manifest), false, '[BUG-SEC-02] Hardcoded Google Geo API key in AndroidManifest.xml');
  assert.equal(keyRegex.test(appDelegate), false, '[BUG-SEC-02] Hardcoded Google Maps API key in AppDelegate.mm');
});

test('SEC-03 [BUG-SEC-03]: Backend API_HOST must use HTTPS (not cleartext http://localhost:3000) and iOS ATS must not set NSAllowsArbitraryLoads', () => {
  const apiCaller = readAppFile('src/react-query/utils/apiCallers.js');
  const infoPlist = readAppFile('ios/StarWarsApp/Info.plist');

  const usesCleartextHttp = /http:\/\/localhost:3000/.test(apiCaller);
  const allowsArbitraryLoads = /<key>NSAllowsArbitraryLoads<\/key>\s*<true\/>/.test(infoPlist);

  assert.ok(
    !usesCleartextHttp && !allowsArbitraryLoads,
    '[BUG-SEC-03] Cleartext HTTP API_HOST (http://localhost:3000) and iOS NSAllowsArbitraryLoads=true weaken transport security'
  );
});

test('SEC-04 [BUG-SEC-04]: Android release build must not sign with debug.keystore or disable minification/ProGuard', () => {
  const appGradle = readAppFile('android/app/build.gradle');
  const releaseUsesDebugKey = /release\s*\{[\s\S]*?signingConfig\s+signingConfigs\.debug/.test(appGradle);
  const proguardDisabled = /def\s+enableProguardInReleaseBuilds\s*=\s*false/.test(appGradle);

  assert.ok(
    !releaseUsesDebugKey && !proguardDisabled,
    '[BUG-SEC-04] android/app/build.gradle signs release builds with debug.keystore and sets enableProguardInReleaseBuilds = false'
  );
});

test('SEC-05 [BUG-SEC-05]: registerRequest must not silently bypass server errors with dummyResponse', () => {
  const apiSrc = readAppFile('src/react-query/states/apiServices.js');
  const alwaysTruthyCheck = findLineMatches(apiSrc, /response\.statusCode\s*===\s*200\s*\|\|\s*dummyResponse\.statusCode\s*===\s*200/);

  assert.equal(
    alwaysTruthyCheck.length,
    0,
    `[BUG-SEC-05] apiServices.js contains tautological status check (${alwaysTruthyCheck.map((m) => `L${m.lineNumber}`).join(', ')}), silently succeeding even when backend rejects auth/group requests`
  );
});

test('SEC-06 [BUG-SEC-06]: SWAPI query parameters must be URL-encoded to prevent parameter injection', () => {
  const apiSrc = readAppFile('src/react-query/states/apiServices.js');
  const rawInterpolation = /search=\$\{search\}/.test(apiSrc) && !/encodeURIComponent\(search\)/.test(apiSrc);
  assert.equal(
    rawInterpolation,
    false,
    '[BUG-SEC-06] fetchSwapiPeople & fetchSwapiStarship interpolate raw search string without encodeURIComponent(search)'
  );
});

test('SEC-07 [BUG-SEC-07]: Unjoined invitees must not receive or view member GPS coordinates prior to joining group', () => {
  const detailSrc = readAppFile('src/screens/GroupDetailScreen/index.js');
  const apiSrc = readAppFile('src/react-query/states/apiServices.js');

  const exposesLocationToAll = /fetchGroupDetailDataRequest/.test(apiSrc) && !/isJoined/.test(
    apiSrc.slice(apiSrc.indexOf('fetchGroupDetailDataRequest'), apiSrc.indexOf('fetchCurrentUserRequest'))
  );
  const hidesLocationsUntilJoined = /activeTab\s*!==\s*t\(['"]groupDetail\.unjoinedTab['"]\)/.test(detailSrc);

  assert.ok(
    !exposesLocationToAll && hidesLocationsUntilJoined,
    '[BUG-SEC-07] Authorization/Privacy flaw: fetchGroupDetailDataRequest and GroupDetailScreen expose all members GPS coordinates even to users who have not joined the group yet'
  );
});

test('SEC-08 [BUG-SEC-08]: AndroidManifest.xml must not declare unused ACCESS_BACKGROUND_LOCATION permission', () => {
  const manifest = readAppFile('android/app/src/main/AndroidManifest.xml');
  const hasBackgroundLoc = /ACCESS_BACKGROUND_LOCATION/.test(manifest);
  assert.equal(
    hasBackgroundLoc,
    false,
    '[BUG-SEC-08] Over-privileged permission: AndroidManifest.xml declares ACCESS_BACKGROUND_LOCATION without background location tracking implementation or justification'
  );
});
