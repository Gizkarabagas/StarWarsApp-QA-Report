import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {
  appFileExists,
  findLineMatches,
  getReactNativeImports,
  readAppFile,
} from './lib/app-inspector.mjs';

/**
 * Load validateEmail and validatePassword directly from StarWarsApp/src/utils/GlobalFunction.js
 * by extracting the pure regex helper expressions so tests reflect exact app code.
 */
function loadGlobalValidators() {
  const src = readAppFile('src/utils/GlobalFunction.js');
  const emailMatch = src.match(/export const validateEmail\s*=\s*(\([^)]*\)\s*=>\s*\{[\s\S]*?\n\};)/);
  const passwordMatch = src.match(/export const validatePassword\s*=\s*(\([^)]*\)\s*=>\s*\{[\s\S]*?\n\};)/);
  assert.ok(emailMatch, 'Could not locate validateEmail in GlobalFunction.js');
  assert.ok(passwordMatch, 'Could not locate validatePassword in GlobalFunction.js');

  const sandbox = {};
  vm.runInNewContext(
    `validateEmail = ${emailMatch[1]}; validatePassword = ${passwordMatch[1]};`,
    sandbox
  );
  return sandbox;
}

test('REQ-01 [PASS]: validateEmail & validatePassword accept assignment credentials (Luke & Darth Vader)', () => {
  const { validateEmail, validatePassword } = loadGlobalValidators();

  assert.equal(validateEmail('luke_skywalker@starwars.com'), true);
  assert.equal(validateEmail('anakin_skywalker@starwars.com'), true);
  assert.equal(validateEmail('invalid-email'), false);
  assert.equal(validateEmail('luke@starwars'), false);

  assert.equal(validatePassword('m4y_th3_F0rc3_b3_w1th_u'), true);
  assert.equal(validatePassword('1_4m_ur_F4th3r!'), true);
  assert.equal(validatePassword('weakpass'), false);
  assert.equal(validatePassword('NoDigits!'), false);
  assert.equal(validatePassword('Short1!'), false);
});

test('REQ-01/03 [BUG-FUNC-01]: registerRequest should normalize email lowercase/trim before saving', () => {
  const apiSrc = readAppFile('src/react-query/states/apiServices.js');
  const registerEmailLine = findLineMatches(apiSrc, /email:\s*params\?\.email\b/);
  assert.equal(
    registerEmailLine.length,
    0,
    `[BUG-FUNC-01] registerRequest stores raw unnormalized params?.email (${registerEmailLine.map((m) => `L${m.lineNumber}`).join(', ')}), causing loginRequest lowercase comparison to fail for mixed-case registrations`
  );
});

test('REQ-01/03 [BUG-FUNC-05]: LoginScreen & RegisterScreen email inputs should disable autoCapitalize', () => {
  const loginSrc = readAppFile('src/screens/LoginScreen/index.js');
  const registerSrc = readAppFile('src/screens/RegisterScreen/index.js');
  assert.match(
    loginSrc,
    /autoCapitalize\s*=\s*['"]none['"]/,
    '[BUG-FUNC-05] LoginScreen email TextInput lacks autoCapitalize="none" and keyboardType="email-address"'
  );
  assert.match(
    registerSrc,
    /autoCapitalize\s*=\s*['"]none['"]/,
    '[BUG-FUNC-05] RegisterScreen email TextInput lacks autoCapitalize="none"'
  );
});

test('REQ-02 [BUG-FUNC-06]: RegisterScreen must support both camera and image library photo upload', () => {
  const pkg = JSON.parse(readAppFile('package.json'));
  const registerSrc = readAppFile('src/screens/RegisterScreen/index.js');
  const hasGalleryLib = Boolean(
    pkg.dependencies['react-native-image-picker'] ||
    pkg.dependencies['react-native-image-crop-picker'] ||
    pkg.dependencies['expo-image-picker']
  );
  const usesGalleryInRegister = /launchImageLibrary|openPicker|ImagePicker/i.test(registerSrc);

  assert.ok(
    hasGalleryLib && usesGalleryInRegister,
    '[BUG-FUNC-06] Only react-native-vision-camera is implemented; no image library/gallery dependency or picker UI exists'
  );
});

test('REQ-03 [BUG-FUNC-09]: LoginScreen must import Platform from react-native before referencing Platform.OS', () => {
  const loginSrc = readAppFile('src/screens/LoginScreen/index.js');
  const usesPlatform = /\bPlatform\.OS\b/.test(loginSrc);
  const imports = getReactNativeImports(loginSrc);
  assert.ok(
    !usesPlatform || imports.includes('Platform'),
    '[BUG-FUNC-09] LoginScreen uses Platform.OS at L51 without importing Platform from react-native (throws ReferenceError in requestLocationPermission, blocking all logins)'
  );
});

test('REQ-03 [BUG-FUNC-12]: LoginScreen Forgot Password action must not be a console.log stub', () => {
  const loginSrc = readAppFile('src/screens/LoginScreen/index.js');
  const stubMatches = findLineMatches(loginSrc, /console\.log\(['"]Forgot Password Pressed['"]\)/);
  assert.equal(
    stubMatches.length,
    0,
    `[BUG-FUNC-12] Forgot Password button is a non-functional console.log stub at L${stubMatches[0]?.lineNumber}`
  );
});

test('REQ-04 [PASS]: ProfileScreen displays required SWAPI attributes (height, mass, birth_year, gender)', () => {
  const profileSrc = readAppFile('src/screens/ProfileScreen/index.js');
  for (const field of ['roleDetail.height', 'roleDetail.mass', 'roleDetail.birth_year', 'roleDetail.gender']) {
    assert.ok(profileSrc.includes(field), `ProfileScreen missing ${field}`);
  }
});

test('REQ-04 [BUG-FUNC-15]: fetchCurrentUserRequest must not reference undeclared email variable', () => {
  const apiSrc = readAppFile('src/react-query/states/apiServices.js');
  const badRef = findLineMatches(apiSrc, /getCurrentUser['"],\s*\{\s*email:\s*email\s*\}/);
  assert.equal(
    badRef.length,
    0,
    `[BUG-FUNC-15] fetchCurrentUserRequest references undeclared variable 'email' at L${badRef[0]?.lineNumber} (always throws ReferenceError into catch fallback)`
  );
});

test('REQ-04/09 [BUG-FUNC-10/14]: Referenced colorScheme tokens must exist in colorScheme.js', () => {
  const schemeSrc = readAppFile('assets/themes/colorScheme.js');
  const loginSrc = readAppFile('src/screens/LoginScreen/index.js');
  const profileStyles = readAppFile('src/screens/ProfileScreen/styles.js');

  const usedTokens = new Set();
  for (const src of [loginSrc, profileStyles]) {
    for (const match of src.matchAll(/colorScheme\.(\$[A-Za-z0-9_]+)/g)) {
      usedTokens.add(match[1]);
    }
  }

  const missing = [...usedTokens].filter((token) => !schemeSrc.includes(`${token}:`));
  assert.deepEqual(
    missing,
    [],
    `[BUG-FUNC-10/14] Undefined colorScheme tokens referenced: ${missing.join(', ')}`
  );
});

test('REQ-05 [PASS]: CreateGroupScreen guards against duplicate member email invitations', () => {
  const createGroupSrc = readAppFile('src/screens/CreateGroupScreen/index.js');
  assert.match(createGroupSrc, /members\.find\(user\s*=>\s*user\.email\.trim\(\)\.toLowerCase\(\)\s*===\s*invitedemail\.trim\(\)\.toLowerCase\(\)\)/);
});

test('REQ-05 [BUG-FUNC-16]: CreateGroupScreen validation toast and starship placeholder keys must not be swapped', () => {
  const createGroupSrc = readAppFile('src/screens/CreateGroupScreen/index.js');
  const en = JSON.parse(readAppFile('src/constants/en.json'));

  assert.notEqual(
    en.createGroup.selectStarship,
    'Select group starship',
    'Expected key check'
  );
  // Check actual usage in CreateGroupScreen: validation uses selectStarship, placeholder uses selectStarshipPlaceholder
  const hasSwappedValidation = /ShowToastFunction\(['"]error['"],\s*t\(['"]createGroup\.selectStarship['"]\)\)/.test(createGroupSrc);
  const hasSwappedPlaceholder = /t\(['"]createGroup\.selectStarshipPlaceholder['"]\)/.test(createGroupSrc);
  assert.ok(
    !hasSwappedValidation && !hasSwappedPlaceholder,
    `[BUG-FUNC-16] CreateGroupScreen swapped error key ('createGroup.selectStarship'="${en.createGroup.selectStarship}") and placeholder key ('createGroup.selectStarshipPlaceholder'="${en.createGroup.selectStarshipPlaceholder}")`
  );
});

test('REQ-05 [BUG-FUNC-18]: CreateGroupScreen handleRemoveMember should filter by unique email, not name', () => {
  const createGroupSrc = readAppFile('src/screens/CreateGroupScreen/index.js');
  const removesByName = /handleRemoveMember\(item\.name\)/.test(createGroupSrc);
  assert.equal(
    removesByName,
    false,
    '[BUG-FUNC-18] CreateGroupScreen removes invited members by display name (item.name) instead of unique email'
  );
});

test('REQ-06 [BUG-FUNC-21]: GroupHomeScreen must import Platform before calling sendPushNotification', () => {
  const homeSrc = readAppFile('src/screens/GroupHomeScreen/index.js');
  const usesPlatform = /\bPlatform\.OS\b/.test(homeSrc);
  const imports = getReactNativeImports(homeSrc);
  assert.ok(
    !usesPlatform || imports.includes('Platform'),
    '[BUG-FUNC-21] GroupHomeScreen uses Platform.OS at L102 without importing Platform from react-native (crashes with ReferenceError whenever unread group invitation notification triggers)'
  );
});

test('REQ-07 [PASS]: fetchGroupDataRequest separates joinedGroups vs unjoinedGroups by member.isJoined', () => {
  const apiSrc = readAppFile('src/react-query/states/apiServices.js');
  assert.match(apiSrc, /joinedGroups\s*=\s*allGroups\.filter/);
  assert.match(apiSrc, /unjoinedGroups\s*=\s*allGroups\.filter/);
  assert.match(apiSrc, /&&\s*member\.isJoined/);
  assert.match(apiSrc, /&&\s*!member\.isJoined/);
});

test('REQ-08 [BUG-FUNC-24]: GroupDetailScreen must render active MapView for member GPS locations', () => {
  const detailSrc = readAppFile('src/screens/GroupDetailScreen/index.js');
  const uncommented = detailSrc
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
  const activeMapView = /<MapView\b/.test(uncommented);
  assert.ok(
    activeMapView,
    '[BUG-FUNC-24] MapView and Marker components are commented out in GroupDetailScreen (L6, L112-L131); no map is displayed'
  );
});

test('REQ-08 [BUG-FUNC-25]: GroupDetailScreen must safely guard undefined item.lastLocation', () => {
  const detailSrc = readAppFile('src/screens/GroupDetailScreen/index.js');
  const unsafeAccess = /item\.lastLocation\.latitude/.test(detailSrc);
  assert.equal(
    unsafeAccess,
    false,
    '[BUG-FUNC-25] GroupDetailScreen accesses item.lastLocation.latitude at L78 without optional chaining (throws TypeError if member not matched in LIST_USER)'
  );
});

test('REQ-BUILD [BUG-BUILD-01]: Existing Jest unit test (__tests__/App.test.tsx) must import valid App entrypoint', () => {
  const testSrc = readAppFile('__tests__/App.test.tsx');
  const importMatch = testSrc.match(/import\s+App\s+from\s+['"]([^'"]+)['"]/);
  assert.ok(importMatch, 'Missing App import in __tests__/App.test.tsx');
  const target = importMatch[1];
  const exists = appFileExists('App.js') || appFileExists('App.tsx') || target.includes('src/App');
  assert.ok(
    exists,
    `[BUG-BUILD-01] __tests__/App.test.tsx imports '${target}', which does not exist (actual App component is at src/App.js)`
  );
});
