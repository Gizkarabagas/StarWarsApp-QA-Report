# QA Test Report — StarWarsApp

**Assignment:** Job Interview Coding Assignment (Junior QA Engineer)  
**Application Under Test (AUT):** `worlderteam/StarWarsApp` (React Native `0.75.3`, commit `6ffa4f5ef95096e410a97d6abed00fcaba69ae53`)  
**Prepared By:** Junior QA Engineer Candidate  
**Date:** November 11, 2026  

---

## Executive Summary & Scope Transparency

An end-to-end quality evaluation was performed on `worlderteam/StarWarsApp` across all five required QA pillars (**Functional**, **Compatibility**, **Usability**, **Performance**, and **Security**) plus **I18n/L10n** and the existing build/test toolchain.

### Verification Method & Environment Transparency
To preserve full honesty and reproducibility:
- **Directly Executed & Verified in This Environment (Windows 11, Node.js `v24.13.0`, Java `17.0.17`):**
  1. Cloned `https://github.com/worlderteam/StarWarsApp` (`commit 6ffa4f5`) and installed dependencies cleanly via the repository's Yarn `3.6.4` (`node .yarn/releases/yarn-3.6.4.cjs install --immutable`).
  2. Executed the repository's own test runner (`yarn test --watchAll=false`) and linter (`yarn lint`).
  3. Executed **41 automated Node.js QA verification checks** (`npm run qa:summary` in this repository) covering functional/logic rules, `en.json`/`id.json` translation parity & key usage, **live HTTPS API calls** to `https://swapi.info/api/`, compatibility/performance anti-patterns, and security static checks.
  4. Performed full line-by-line code inspection of all 33 JS files under `src/`, `__tests__/App.test.tsx`, `android/` native configs, and `ios/` native configs.
- **Environment-Blocked / Clarification Required:**
  1. **Android Emulator / Physical Device Run:** No Android SDK/emulator (`ANDROID_HOME` unset) and no ADB device attached (`adb devices` empty) in the current workstation environment.
  2. **iOS Simulator / Device Build:** Requires macOS + Xcode + CocoaPods.
  3. **Adobe XD Visual Comparison (Req #10):** The assignment PDF references *"this Adobe XD file"*, but no hyperlink URL or `.xd` file was attached/embedded in the extracted PDF text.

### Overall Health Snapshot
| Evaluation Stream | Total Checks | Passed | Failed / Defects Found | Key Verdict |
|---|---:|---:|---:|---|
| Repository Existing Unit Test (`yarn test`) | 1 | 0 | 1 | Existing `App.test.tsx` fails due to broken `../App` import path |
| Repository Linter (`yarn lint`) | 1 | 0 | 20 errors, 224 warnings | Fatal `no-undef` (`Platform`, `email`) & `no-dupe-keys` errors |
| `01` Functional & Logic QA Checks | 17 | 4 | 13 | Critical login/notification crashes (`Platform` missing) & missing gallery picker |
| `02` I18n & L10n QA Checks | 5 | 1 | 4 | `lng: 'en'` overrides detector; missing key; hardcoded strings |
| `03` Live SWAPI Integration Checks | 4 | 2 | 2 | `swapi.info` reachable, but ignores `?search=` and lacks `data.next` |
| `04` Compatibility & Performance Audit | 7 | 0 | 7 | Frozen screen dimensions, missing `ScrollView`s, effect leak, base64 bloat |
| `05` Security & Authorization Audit | 8 | 0 | 8 | Plaintext passwords in unencrypted MMKV, committed API keys, cleartext HTTP |
| **Automated QA Suite Total (`qa:summary`)** | **41** | **7** | **34** | **Not Ready for Release** — Multiple Blocker/Critical issues discovered |

---

## 1. Test Strategy and Rationale

### 1.1 Objectives
1. Validate whether `StarWarsApp` fulfills all **13 functional and non-functional requirements** from the assignment specification (including the Luke Skywalker & Darth Vader user flows and Rebel Alliance / Empire group workflows).
2. Assess cross-platform readiness (**Android & iOS** phones and tablets in **portrait & landscape**).
3. Evaluate UX/usability, runtime resource/battery efficiency, and mobile application security posture (aligned with OWASP MASVS principles).
4. Provide actionable defect evidence, root-cause diagnostics, concrete code remedies, and an action plan for remaining device-based manual testing.

### 1.2 Risk-Based Prioritization Rationale
Because a Junior QA engagement within a 1-week window cannot exhaustively test every UI permutation blindly, testing is prioritized by **user-blocking impact and risk severity**:
1. **Priority 0 (Critical Blockers & Security):** Authentication/registration/login flows, credential storage, authorization boundaries (GPS privacy), and fatal runtime exceptions (`ReferenceError`/`TypeError`).
2. **Priority 1 (Core Community Workflows & External Integrations):** SWAPI character/starship selection, camera/gallery profile upload, group creation, member invitation, local notifications, and group joining.
3. **Priority 2 (Platform Compatibility, Responsiveness & Localization):** Portrait/landscape rotation, tablet viewports, Android/iOS native permissions & configs, `en`/`id` i18n/l10n.
4. **Priority 3 (Usability & Performance Optimization):** Visual hierarchy, error recovery, battery/GPS usage, memory footprint (base64 image handling), and network throttling/debouncing.

### 1.3 Test Scope & Techniques
- **Static & Dependency Verification:** Installing dependencies and running `yarn test`, `yarn lint`, and custom AST/regex/code inspections across JS, Kotlin, Gradle, AndroidManifest, Info.plist, and Objective-C++ (`AppDelegate.mm`).
- **Functional & API Contract Verification:** Validating regex validators directly from `src/utils/GlobalFunction.js`, tracing state/storage flows in `src/react-query/states/apiServices.js`, and executing live HTTP requests against `https://swapi.info/api/`.
- **Manual E2E Test Case Design:** Comprehensive test matrix covering Luke Skywalker (`luke_skywalker@starwars.com`) and Darth Vader (`anakin_skywalker@starwars.com`) multi-user interaction flows ready for live device/emulator execution.

### 1.4 Clarifications & Blockers to Raise with Stakeholders
Per assignment instructions (*"please do not hesitate to communicate with us to clarify the task requirements"*):
1. **Adobe XD Design File URL:** Request the actual Adobe XD share link / exported screens to verify Requirement #10 pixel-for-pixel.
2. **Backend Service (`http://localhost:3000`):** `src/react-query/utils/apiCallers.js` points to `http://localhost:3000`, yet `apiServices.js` falls back to `dummyResponse` + local `MMKV` storage. Clarify whether a companion mock/backend repository exists, or whether offline local-only storage is the intended mode (note that multi-device invitation between Luke and Darth Vader requires either a shared backend or single-device account switching).
3. **Map API Key Policy:** `MapView` in `GroupDetailScreen/index.js` is commented out with `// Paid Account API Key needed`. Clarify if an alternative free map provider (e.g., OpenStreetMap / MapLibre) or test Google Maps billing key should be used.

---

## 2. Test Cases

Status legend: **PASS** (verified working), **FAIL** (verified defective), **PARTIAL** (partially working with defects), **BLOCKED** (requires physical/emulator runtime or missing Adobe XD asset; static pre-check documented).

### 2.1 Functional Test Cases (Requirements 1–11 & 13)

| TC ID | Req # | Test Scenario & Preconditions | Test Data / Steps | Expected Result | Actual Result | Status | Defect Ref |
|---|---|---|---|---|---|---|---|
| **TC-FUNC-01** | Req 1 | Register User 1 (Luke) with valid credentials & camera photo | Email: `luke_skywalker@starwars.com`, Name: `Luke Skywalker`, Pass: `m4y_th3_F0rc3_b3_w1th_u`, Role: SWAPI `Luke Skywalker` | Validation passes; account saved; user prompted to create group or go home | Email/password regex passes; however `registerRequest` ignores backend errors and does not lowercase/trim email (`params?.email`) | **PARTIAL / FAIL** | `BUG-FUNC-01`, `BUG-FUNC-03` |
| **TC-FUNC-02** | Req 1 | Register User 2 (Darth Vader) with valid credentials | Email: `anakin_skywalker@starwars.com`, Name: `Darth Vader`, Pass: `1_4m_ur_F4th3r!` | Validation passes for special chars (`_` and `!`) and digits; account saved | `validateEmail` & `validatePassword` return `true` (verified via `qa:functional`) | **PASS** (Validator) | — |
| **TC-FUNC-03** | Req 1 | Register with mixed-case email (mobile keyboard auto-cap) then log in | Register `Luke_skywalker@starwars.com`, then login with `luke_skywalker@starwars.com` | Email normalized consistently; login succeeds | Registration stores mixed-case email; `loginRequest` checks exact `=== params.email.trim().toLowerCase()`, causing login rejection | **FAIL** | `BUG-FUNC-01`, `BUG-FUNC-05` |
| **TC-FUNC-04** | Req 1 | Registration negative validation (empty fields, weak password, mismatched confirm password, duplicate email) | Submit empty form; submit weak password `weakpass`; mismatch password; register duplicate email | Appropriate localized error toast shown; submission blocked | Validation checks execute properly in `RegisterScreen.handleSave` before modal opens | **PASS** (Code Logic) | — |
| **TC-FUNC-05** | Req 2 | Upload profile photo via **Camera** during registration | Tap avatar placeholder -> grant camera permission -> tap Capture Photo | Camera captures sharp photo, returns to form, allows retaking if desired | Uses low-res `takeSnapshot({quality:10, scale:0.5})`, lacks back button on camera view, and cannot tap photo to retake once set | **PARTIAL / FAIL** | `BUG-FUNC-07`, `BUG-FUNC-08` |
| **TC-FUNC-06** | Req 2 | Upload profile photo via **Image Library / Gallery** during registration | Tap avatar placeholder -> choose "Choose from Library" -> pick image | User can select an existing image from phone gallery | No gallery picker UI, no image picker package in `package.json`, no gallery permissions in `AndroidManifest.xml` / `Info.plist` | **FAIL** | `BUG-FUNC-06` |
| **TC-FUNC-07** | Req 3 | Login with registered credentials (`Luke` / `Darth Vader`) | Enter email & password -> tap LOGIN | Location permission checked cleanly; user authenticated and navigated to Home tabs (replacing login stack) | `LoginScreen/index.js:51` calls `Platform.OS` without importing `Platform` -> throws `ReferenceError` caught in `try/catch` -> **always fails** with `login.locationError`; stack uses `navigate` instead of `replace` | **FAIL (Blocker)** | `BUG-FUNC-09`, `BUG-FUNC-11` |
| **TC-FUNC-08** | Req 3 | Tap "Forget Password" on Login screen | Tap `Forget Password` link | Navigates to password reset flow or informs user | Executes `console.log('Forgot Password Pressed')` only; zero UI feedback | **FAIL** | `BUG-FUNC-12` |
| **TC-FUNC-09** | Req 4 | Select StarWars role & view Profile particulars (`height`, `mass`, `birth_year`, `gender`) | Open SWAPI picker -> search `"vader"` -> select Darth Vader -> complete registration -> open `You` tab | Search filters to Darth Vader; `ProfileScreen` shows photo + particulars | Live SWAPI test proves `https://swapi.info/api/people/?search=vader` returns all 82 people unfiltered; `fetchCurrentUserRequest` crashes on undefined `email` before catch fallback; `ProfileScreen` omits user full name and uses undefined `$lightGray` | **FAIL** | `BUG-FUNC-13`, `BUG-FUNC-14`, `BUG-FUNC-15` |
| **TC-FUNC-10** | Req 5 | Luke creates group **"Rebel Alliance"**, selects starship, and invites Darth Vader | Open Create Group -> enter name/desc -> pick starship -> invite `anakin_skywalker@starwars.com` -> tap Save | Group saved with Luke joined & Vader invited; no member loss when returning from SWAPI picker | Starship error & placeholder keys swapped (`selectStarship` vs `selectStarshipPlaceholder`); returning from SWAPI without selecting wipes invited `members`; tapping inside modal closes modal; delete member uses `name` not `email` | **FAIL** | `BUG-FUNC-16`, `BUG-FUNC-17`, `BUG-FUNC-18`, `BUG-FUNC-19`, `BUG-FUNC-20` |
| **TC-FUNC-11** | Req 5 | Duplicate invite validation in Create Group | Invite same email twice (differing case) | Error toast `"User already invited"` shown | `handleInvite` checks `.trim().toLowerCase()` and blocks duplicate | **PASS** (Code Logic) | — |
| **TC-FUNC-12** | Req 6 | In-app / local notification when Darth Vader logs in after invitation | Login as Vader -> open `Home` tab (`GroupHomeScreen`) | Tab switches to Unjoined Group; notification triggered for `"Rebel Alliance"` invitation | `GroupHomeScreen/index.js:102` uses `Platform.OS` **without importing `Platform`** -> crashes `ReferenceError` inside `sendPushNotification`; iOS reuses fixed `id: 'notification_id'` | **FAIL (Critical)** | `BUG-FUNC-21`, `BUG-FUNC-22` |
| **TC-FUNC-13** | Req 7 | Invited user (Darth Vader) joins `"Rebel Alliance"` from Unjoined tab | Open Unjoined tab -> tap group -> tap `Join Group` | Member `isJoined` flips to `true`; group moves to Joined tab | Separates `joinedGroups` / `unjoinedGroups`, but `handleJoinGroup` uses case-sensitive `member.email === currUserLogIn.email` and fails if initial language is Indonesian (`activeTab = 'Joined Group'`) | **PARTIAL / FAIL** | `BUG-FUNC-23`, `BUG-I18N-03` |
| **TC-FUNC-14** | Req 8 | View joined group members & last known GPS locations | Open `GroupDetailScreen` -> inspect member list & tap member | Displays joined members, map (`MapView`), and GPS markers/coords | `<MapView>` and `<Marker>` are commented out (`Paid Account API Key needed`); `item.lastLocation.latitude` crashes if user missing from `LIST_USER`; unjoined members also shown | **FAIL** | `BUG-FUNC-24`, `BUG-FUNC-25` |
| **TC-FUNC-15** | Req 9 | View interactive & informative starship details on Group profile | Open `GroupDetailScreen` -> inspect starship info & interact | Interactive, rich SWAPI starship profile (class, hyperdrive, MGLT, films/pilots, scrollable) | Static text-only subset of 9 fields from creation snapshot (no live SWAPI fetch, no interactivity, non-scrollable header pushes `FlatList` off-screen, missing `t` dep in `useMemo`) | **FAIL** | `BUG-FUNC-26` |
| **TC-FUNC-16** | Req 10 | Visual fidelity vs Adobe XD design | Compare all 8 screens against Adobe XD spec | UI matches colors, spacing, typography, dark/light theme | Blocked due to missing Adobe XD link in PDF; code shows conflicting light/dark themes (`DarkTheme` + `$blackBg` vs `$whiteCream`/`$white`) | **BLOCKED** | `CLAR-01` |
| **TC-FUNC-17** | Req 13 | I18n & L10n (English & Indonesian) | Switch device language to `id`; toggle `EN/ID` across screens; inspect numbers/dates | Auto-detects device locale; all labels/alerts/errors translated; locale-aware numbers | `i18n.js:33` hardcodes `lng: 'en'`; missing key `register.locationPermissionRequired`; hardcoded English logout/location/API alerts; no `Intl` number formatting | **FAIL** | `BUG-I18N-01`–`05` |
| **TC-FUNC-18** | Build/CI | Run project unit tests (`yarn test`) & linter (`yarn lint`) | Run `yarn test --watchAll=false` & `yarn lint` | Unit tests pass; zero fatal lint errors | `App.test.tsx` fails (`../App` invalid); ESLint reports 20 errors & 224 warnings | **FAIL** | `BUG-BUILD-01` |

### 2.2 Compatibility Test Cases (Android & iOS Phones/Tablets, Portrait & Landscape)

| TC ID | Target | Test Scenario | Expected Result | Actual / Verified Result | Status | Defect Ref |
|---|---|---|---|---|---|---|
| **TC-COMP-01** | Portrait -> Landscape | Rotate phone from Portrait to Landscape on Register (Camera), Home (PieChart), Login, Profile, GroupDetail | Camera preview, PieChart, TabBar, and forms dynamically resize and remain scrollable | `GlobalConfig.js` freezes `Dimensions.get('window')` via `Object.freeze`; `LoginScreen` & `ProfileScreen` lack `ScrollView`; camera `height = SCREEN_WIDTH` pushes capture button off-screen | **FAIL** | `BUG-COMP-01`, `BUG-COMP-03` |
| **TC-COMP-02** | Tablets (iPad & Android Tablet) | Run app on tablet viewports (e.g., iPad 10.9", Android 10" tablet) in portrait & landscape | Proportional layouts; iPad supports all split-screen/tablet orientations | `Info.plist` omits `UISupportedInterfaceOrientations~ipad`; modals use hardcoded `width: 300`; PieChart & TabBar scale off frozen phone/initial window metrics | **FAIL** | `BUG-COMP-01`, `BUG-COMP-02` |
| **TC-COMP-03** | Android OS Compatibility (`minSdk 23`, `targetSdk 34`) | Install & run on Android 13/14 (API 33–34) and Android 8–12 | Runtime permissions (`CAMERA`, `ACCESS_FINE_LOCATION`, `POST_NOTIFICATIONS`) work cleanly | `MainActivity.kt` has buggy self-relaunch loop in `handleNotificationIntent`; `AndroidManifest.xml` declares `ACCESS_BACKGROUND_LOCATION` without justification; `gradle` uses old `firebase-analytics:17.3.0` | **FAIL** (Static) / **BLOCKED** (Device) | `BUG-COMP-04`, `BUG-SEC-08` |
| **TC-COMP-04** | iOS OS Compatibility & Safe Area / Notch | Run on iPhone with Dynamic Island / Notch & iPadOS | Safe areas respected; push notifications & location work | `LoginScreen` & `ProfileScreen` language button uses `position: 'absolute', top: 10, right: 10` inside `SafeAreaView` (risks clipping near notch/status bar on iOS) | **FAIL** (Static) / **BLOCKED** (Mac) | `BUG-COMP-03`, `UX-09` |

### 2.3 Usability Test Cases

| TC ID | Focus Area | Evaluation Criteria | Observed Result | Status | Defect Ref |
|---|---|---|---|---|---|
| **TC-UX-01** | Photo Upload Affordance | Clear ability to pick Camera/Gallery & retake/edit photo | No gallery option; after taking photo, avatar isn't clickable to retake; camera view has no Cancel/Back button | **FAIL** | `UX-01`, `BUG-FUNC-06/07` |
| **TC-UX-02** | Form Ergonomics & Keyboard | Proper keyboard types (`email-address`), no auto-cap on email, `ScrollView` wrapping `KeyboardAvoidingView` | Missing `keyboardType`/`autoCapitalize="none"`; `RegisterScreen` nests `KeyboardAvoidingView` inside `ScrollView` (inverted); Android `behavior` is `null` | **FAIL** | `UX-02`, `BUG-FUNC-05` |
| **TC-UX-03** | Visual Consistency & Contrast | Cohesive theme, readable text contrast on buttons/cards | `Navigator` sets `DarkTheme`, `GlobalStyle` has `$blackBg`, screens mix light `$whiteCream`/`$white`; `$gray` (`#a6a6a6`) text on `$white` fails WCAG AA contrast; `HomeHeader` has unused `title` style | **FAIL** | `UX-03`, `UX-04` |
| **TC-UX-04** | Feedback, Loading & Error Recovery | Loading indicators on async actions, clear error messages, cancel options | `RegisterScreen` & `CreateGroupScreen` show no loading spinner on save; `CreateGroupScreen` invite modal closes if tapping empty space inside modal and has no Cancel button; `GroupDetailScreen` has no visible Back button | **FAIL** | `UX-05`, `UX-06`, `UX-07` |
| **TC-UX-05** | Navigation & Empty States | Logical back-stack behavior, clear language switcher placement | Back button after login returns to `LoginScreen`; language toggle hidden from Home/CreateGroup/Register; Logout has no i18n; tab names `'Home'`, `'Create Group'`, `'You'` aren't localized | **FAIL** | `UX-08`, `UX-10`, `BUG-FUNC-11` |

### 2.4 Performance & Battery Test Cases

| TC ID | Resource Focus | Evaluation Criteria | Observed Result | Status | Defect Ref |
|---|---|---|---|---|---|
| **TC-PERF-01** | Render / Event Listeners | Hooks clean up properly without re-attaching per render | `App.js:42-50` `useEffect` lacks `[]` dependency array -> re-registers/removes iOS notification listener on every render | **FAIL** | `BUG-PERF-01` |
| **TC-PERF-02** | Network & Search Efficiency | Debounced search, proper pagination, no duplicate requests | `SwapiScreen` fires HTTP request on **every keystroke** without debounce; `swapi.info` returns full ~82-item list every time | **FAIL** | `BUG-PERF-04`, `BUG-FUNC-13` |
| **TC-PERF-03** | Memory & Storage Footprint | Binary images stored as file paths/URIs, not duplicated base64 in JSON | `RegisterScreen` stores base64 in `LIST_USER`; `fetchSaveGroupRequest` copies full base64 strings into every `GROUPS.members[]` entry, bloating MMKV & FlatList bridge payloads | **FAIL** | `BUG-PERF-03` |
| **TC-PERF-04** | CPU / JS Thread & Logging | No heavy `console.log` in render, memoized `FlatList` items | `SwapiScreen:56` calls `console.log("listSwapiData", listSwapiData)` on every render; `GroupHomeScreen` recomputes `PieChart` data & `Labels` component inside `renderGroupItem` without memoization | **FAIL** | `BUG-PERF-02`, `BUG-PERF-05` |
| **TC-PERF-05** | Battery / GPS Usage | Balanced GPS accuracy/timeout & cached fallback | Both `LoginScreen` and `RegisterScreen` request `enableHighAccuracy: true` (high-power GPS chip wake) with 20s timeout and `maximumAge: 1000` (1 second!), blocking login if GPS fails indoors | **FAIL** | `BUG-PERF-06` |

### 2.5 Security & Authorization Test Cases

| TC ID | Security Domain | Evaluation Criteria | Observed Result | Status | Defect Ref |
|---|---|---|---|---|---|
| **TC-SEC-01** | Data-at-Rest & Credential Storage | Passwords hashed/salted; sensitive tokens in Keychain/Keystore or encrypted MMKV | `new MMKV()` has no `encryptionKey`; `LIST_USER` stores plaintext `password` & `confirmPassword`; `CURR_USER_LOGIN_DATA` stores plaintext `password`; `loginRequest` checks `===` plaintext | **FAIL (Critical)** | `BUG-SEC-01` |
| **TC-SEC-02** | Secrets Management | No API keys or Firebase secrets hardcoded in repository | Google Maps/Geo API key `AIzaSyDwBmG2L0YadPd3JE-Wku5Bdd-vwk97mdA` committed in `AndroidManifest.xml:55` & `AppDelegate.mm:15`; `google-services.json` committed to git | **FAIL (High)** | `BUG-SEC-02` |
| **TC-SEC-03** | Transport Layer Security | HTTPS enforced; no cleartext HTTP or ATS bypass | `apiCallers.js:3` uses `http://localhost:3000`; `Info.plist:27-33` sets `NSAllowsArbitraryLoads: true` | **FAIL (High)** | `BUG-SEC-03` |
| **TC-SEC-04** | Binary / Build Hardening | Release build signed with production keystore; ProGuard/R8 enabled | `android/app/build.gradle:103-104` signs `release` with `signingConfigs.debug` and `enableProguardInReleaseBuilds = false` | **FAIL (High)** | `BUG-SEC-04` |
| **TC-SEC-05** | Authentication & Authorization Logic | Server errors enforced; unjoined invitees cannot view member GPS data | `apiServices.js` tautology `response.statusCode === 200 \|\| dummyResponse.statusCode === 200` ignores server rejections; `GroupDetailScreen` & `fetchGroupDetailDataRequest` expose all members' GPS coordinates to **unjoined** invitees | **FAIL (Critical)** | `BUG-SEC-05`, `BUG-SEC-07` |
| **TC-SEC-06** | Input Sanitization & Permissions | URL params encoded; least-privilege OS permissions | `apiServices.js:147,167` interpolates unencoded `search`; `AndroidManifest.xml:8` declares unused `ACCESS_BACKGROUND_LOCATION` | **FAIL (Medium)** | `BUG-SEC-06`, `BUG-SEC-08` |

---

## 3. Test Results & Defect Register

### 3.1 Observed Execution Evidence
1. **Repository Jest Output (`yarn test --watchAll=false`):**
   - `FAIL __tests__/App.test.tsx`: `Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: object` at `__tests__/App.test.tsx:16:12` (`Test Suites: 1 failed, 1 total`, `EXIT=1`).
2. **Repository ESLint Output (`yarn lint`):**
   - `244 problems (20 errors, 224 warnings)`, `EXIT=1`.
   - Critical runtime-breaking ESLint errors:
     - `src/screens/LoginScreen/index.js:51:11` — `'Platform' is not defined (no-undef)`
     - `src/screens/GroupHomeScreen/index.js:102:9` — `'Platform' is not defined (no-undef)`
     - `src/react-query/states/apiServices.js:298:69` — `'email' is not defined (no-undef)`
     - `src/react-query/states/apiServices.js:62:13` — `Duplicate key 'userRole' (no-dupe-keys)`
     - 16 `react-hooks/exhaustive-deps` errors causing stale closures (`CreateGroupScreen`, `GroupHomeScreen`, `GroupDetailScreen`, `CustomToastHOC`, etc.).
3. **Automated QA Verification Suite (`npm run qa:summary`):**
   - **Total:** `41` checks | **Pass:** `7` | **Fail (Confirmed Defects):** `34`.

### 3.2 Consolidated Defect Register

#### A. Critical & Blocker Defects
1. **`BUG-FUNC-09` [Blocker] Missing `Platform` import breaks ALL logins**  
   - **Location:** `src/screens/LoginScreen/index.js:2, 51`  
   - **Root Cause:** `Platform` is not imported from `'react-native'`. Calling `Platform.OS === 'android'` throws `ReferenceError`, caught by `catch (err)` on line 65, forcing `requestLocationPermission()` to return `false` and displaying `"You must allow location permission on this app to login"` on every attempt.
2. **`BUG-FUNC-21` [Critical] Missing `Platform` import crashes app on Group Invitation Notification**  
   - **Location:** `src/screens/GroupHomeScreen/index.js:2, 102`  
   - **Root Cause:** When an invited user (e.g., Darth Vader) opens `GroupHomeScreen` with unread notifications, `sendPushNotification()` references `Platform.OS` without importing `Platform`, crashing with an uncaught `ReferenceError`.
3. **`BUG-SEC-01` [Critical] Plaintext Password Storage & Authentication Bypass Risks**  
   - **Location:** `src/utils/Storages.js:3`, `src/react-query/states/apiServices.js:24-25, 43-44`, `src/screens/RegisterScreen/index.js:93`  
   - **Root Cause:** `new MMKV()` is initialized without an `encryptionKey`. Plaintext `password` and `confirmPassword` are persisted in `LIST_USER` and `CURR_USER_LOGIN_DATA`, and verified via raw equality (`user.password === params.password`).
4. **`BUG-SEC-05` & `BUG-SEC-07` [Critical] Broken Auth Bypass & Unjoined Member GPS Privacy Leak**  
   - **Location:** `src/react-query/states/apiServices.js:67, 133, 217, 263, 300, 336`, `src/screens/GroupDetailScreen/index.js:141-146`  
   - **Root Cause:** Every API handler checks `if (response.statusCode === 200 || dummyResponse.statusCode === 200)`, which is always `true`, silently masking server-side errors. Additionally, `fetchGroupDetailDataRequest` enriches all members' `latitude`/`longitude` and `GroupDetailScreen` displays them even to users in the **Unjoined Group** tab who have not accepted the invite.
5. **`BUG-FUNC-06` [High / Missing Requirement] No Image Library Photo Upload Option**  
   - **Location:** `src/screens/RegisterScreen/index.js:195-211, 267-275`, `package.json`  
   - **Root Cause:** Requirement #2 mandates *"camera or image library"*, but only `react-native-vision-camera` is implemented (`takeSnapshot`). No gallery/image-picker dependency or permission exists.
6. **`BUG-FUNC-24` [High / Missing Requirement] Interactive Map Commented Out in Group Profile**  
   - **Location:** `src/screens/GroupDetailScreen/index.js:6, 111-131`  
   - **Root Cause:** `<MapView>` and `<Marker>` are commented out (`// Paid Account API Key needed`), leaving only plain text coordinates and a non-actionable pin icon when tapping a member.

#### B. Major Functional, API & Build Defects
- **`BUG-FUNC-01` & `BUG-FUNC-05`:** `registerRequest` (`apiServices.js:40`) saves raw `params?.email` without `.trim().toLowerCase()`, and email inputs lack `autoCapitalize="none"` / `keyboardType="email-address"`, breaking `loginRequest` (`apiServices.js:24`) and `updateUserLocation` when any uppercase character is typed.
- **`BUG-FUNC-13`:** `SwapiScreen` (`SwapiScreen/index.js:26, 43`) assumes `swapi.dev` paginated `{ results, next }` & server-side `?search=`. Live verification against configured `https://swapi.info/api/` confirms it returns an unpaginated flat array (`data.next === undefined`) and **ignores `?search=vader`**, returning all 82 characters starting with Luke Skywalker.
- **`BUG-FUNC-15`:** `fetchCurrentUserRequest` (`apiServices.js:298`) passes `{ email: email }` where `email` is undefined (`ReferenceError`), and line 291 dereferences `currentUser.firstName` without checking if `currentUser` exists.
- **`BUG-FUNC-16`:** `CreateGroupScreen/index.js:95` & `151` swap `createGroup.selectStarship` (`"Select group starship"`) and `createGroup.selectStarshipPlaceholder` (`"You must select a starship."`).
- **`BUG-FUNC-17`:** `CreateGroupScreen/index.js:44-47` resets `members` to `[currUserData]` whenever returning from `SwapiScreen` without picking a starship, wiping already-invited members; form state also is not reset after saving.
- **`BUG-FUNC-18`:** `CreateGroupScreen/index.js:101-103` removes members by `item.name` instead of unique `item.email`.
- **`BUG-FUNC-25`:** `GroupDetailScreen/index.js:78` accesses `item.lastLocation.latitude` without optional chaining (`TypeError` crash if a member lacks a `LIST_USER` match).
- **`BUG-FUNC-26`:** `GroupDetailScreen` does not fetch live starship data from SWAPI, displays only 9 non-interactive fields, lacks `t` in `starshipDetails` `useMemo` (`line 41`), and renders a static `View` above `FlatList` that squeezes member list visibility.
- **`BUG-FUNC-04`, `BUG-FUNC-07`, `BUG-FUNC-08`, `BUG-FUNC-10`, `BUG-FUNC-11`, `BUG-FUNC-12`, `BUG-FUNC-14`, `BUG-FUNC-19`, `BUG-FUNC-20`, `BUG-FUNC-22`, `BUG-FUNC-23`:** Registration sets `CURR_USER_LOGIN_DATA` before location check fails; captured photo cannot be retaken; `takeSnapshot` quality is `10` & `RNFS.readFile('file://...')` risks path error; undefined tokens `colorScheme.$primaryBlueColor` and `colorScheme.$lightGray`; `navigation.navigate` allows back to Login; Forgot Password is a `console.log` stub; invite modal closes when tapping inside modal; `fetchSaveGroupRequest` uses case-sensitive email match and omits creator's `user.groups`; iOS notification ID `'notification_id'` overwrites concurrent invites; `handleJoinGroup` doesn't mark invitation notification or update `user.groups`.
- **`BUG-BUILD-01`:** `__tests__/App.test.tsx:7` imports `../App` instead of `../src/App`.

#### C. Compatibility & Responsiveness Defects
- **`BUG-COMP-01`:** `src/utils/GlobalConfig.js:15-20` freezes `Dimensions.get('window')` inside `Object.freeze(Metrics)`. Used across `CustomToastHOC.js`, `RegisterScreen/styles.js` (square camera box `height: SCREEN_WIDTH`), `GroupHomeScreen/index.js` (`PieChart` size), `GroupHomeScreen/styles.js`, and `Navigator.js` (`tabBarStyle.height`). Rotation to landscape or running on tablets breaks layout proportions.
- **`BUG-COMP-02`:** `ios/StarWarsApp/Info.plist` lacks `UISupportedInterfaceOrientations~ipad` for iPad multitasking/tablet orientations.
- **`BUG-COMP-03`:** `LoginScreen` and `ProfileScreen` omit `ScrollView`, causing content clipping in landscape mode or on compact devices.
- **`BUG-COMP-04`:** `MainActivity.kt:38-45` re-launches `MainActivity` with the same extras inside `onCreate` (`handleNotificationIntent`) without overriding `onNewIntent` or forwarding payload to JS. `styles.xml` uses `Theme.AppCompat.DayNight.NoActionBar`, risking native UI mismatch in OS dark mode.

#### D. Usability & UX Findings (`UX-01` – `UX-10`)
- **`UX-01`–`UX-02`:** No photo retake affordance, no camera Cancel/Back button, inverted `ScrollView`/`KeyboardAvoidingView` on `RegisterScreen`, missing `autoCapitalize="none"` / `keyboardType="email-address"`.
- **`UX-03`–`UX-04`:** Inconsistent theme (`DarkTheme` + `GlobalStyle.$blackBg` vs `#FFFFFF` splash vs `$whiteCream`/`$white` screens); low contrast (`#a6a6a6` gray text on white = ~2.3:1, below WCAG AA 4.5:1).
- **`UX-05`–`UX-07`:** Missing loading spinners on Register/Save Group; invite modal closes when tapping inside modal card and has no Cancel button; `GroupDetailScreen` lacks a Back button in header (trap on iOS where there is no hardware back button!).
- **`UX-08`–`UX-10`:** Language toggle missing on 5 of 7 screens and positioned absolutely (`top: 10, right: 10`) risking notch overlap; bottom tab labels `'Home'`, `'Create Group'`, `'You'` (`RootKey.js`) are hardcoded English; no interactive in-app Notification Center/bell badge to revisit dismissed invitations.

#### E. Performance & Battery Bottlenecks (`BUG-PERF-01` – `BUG-PERF-07`)
- **`BUG-PERF-01`:** `src/App.js:42-50` `useEffect` missing `[]` dependency array -> attaches/detaches iOS push notification listener on every render.
- **`BUG-PERF-02`:** `SwapiScreen/index.js:56` executes `console.log("listSwapiData", listSwapiData)` every render.
- **`BUG-PERF-03`:** Storing base64 images in MMKV (`RegisterScreen`) and duplicating those base64 blobs inside `GROUPS.members[]` (`fetchSaveGroupRequest`) causes memory bloat, slow JSON parsing in `Storages.js`, and heavy image decoding in `FlatList`s.
- **`BUG-PERF-04`:** `SwapiScreen` lacks search debouncing and downloads the full unfiltered SWAPI array on every keystroke (`swapi.info`).
- **`BUG-PERF-05`:** `GroupHomeScreen` creates inline `Labels` component and recomputes `PieChart` colors (`getRandomColor()`) on every render/scroll of `FlatList` items (causing slice colors to flicker dynamically).
- **`BUG-PERF-06`:** High-drain GPS calls (`enableHighAccuracy: true`, `maximumAge: 1000`, `timeout: 20000`) block Login and Register even when cached/coarse location suffices.
- **`BUG-PERF-07`:** `Navigator.js:4` lazy-loads `Navigator` inside `<Suspense>` without a fallback UI (`<Suspense fallback={...}>`).

#### F. Security & Privacy Flaws (`BUG-SEC-01` – `BUG-SEC-09`)
- **`BUG-SEC-01`:** Unencrypted `MMKV` + plaintext password & `confirmPassword` persistence + plaintext login compare.
- **`BUG-SEC-02`:** Hardcoded Google Maps/Geo API key (`AIzaSyDwBmG2L0YadPd3JE-Wku5Bdd-vwk97mdA`) committed in `AndroidManifest.xml:55` & `AppDelegate.mm:15`, plus `google-services.json` tracked in git.
- **`BUG-SEC-03`:** Cleartext HTTP `http://localhost:3000` (`apiCallers.js:3`) and iOS `NSAllowsArbitraryLoads: true` (`Info.plist:29-30`).
- **`BUG-SEC-04`:** Android release build signed with `debug.keystore` and `enableProguardInReleaseBuilds = false` (`android/app/build.gradle:100-106`).
- **`BUG-SEC-05`:** Tautological status check (`|| dummyResponse.statusCode === 200`) silently accepts rejected API calls.
- **`BUG-SEC-06`:** Raw `search` query interpolation in SWAPI URLs without `encodeURIComponent()`.
- **`BUG-SEC-07`:** Unjoined invitees receive and view all members' last known GPS coordinates (`GroupDetailScreen` + `fetchGroupDetailDataRequest`).
- **`BUG-SEC-08`:** Unused `ACCESS_BACKGROUND_LOCATION` declared in `AndroidManifest.xml:8`.
- **`BUG-SEC-09`:** Predictable `group-${Date.now()}` IDs and lack of session expiration / token-based authorization (`CURR_USER_LOGIN_DATA` never expires).

#### G. I18n & L10n Defects (`BUG-I18N-01` – `BUG-I18N-05`)
- **`BUG-I18N-01`:** `RegisterScreen/index.js:119, 126` references `t('register.locationPermissionRequired')`, which is missing from both `en.json` and `id.json`.
- **`BUG-I18N-02`:** `src/utils/i18n.js:33` hardcodes `lng: 'en'`, disabling the custom `languageDetector`. Also `languageDetector.detect` splits only on `_`, failing on BCP-47 hyphenated locales (`en-US`, `id-ID`).
- **`BUG-I18N-03`:** `GroupHomeScreen/index.js:24` initializes `activeTab` to `'Joined Group'` (breaks when UI starts in Indonesian) and `useMemo` (line 51) omits `t`.
- **`BUG-I18N-04`:** Hardcoded English strings in `GlobalFunction.js:30-36` (Logout alert), `LoginScreen/index.js:55-59` (Android Location dialog), `apiServices.js` (`'Invalid email or password'`, `'You have been invited to ...'`, `'No users found in the system'`), `GroupDetailScreen/index.js:106` (`'N/A'`), and `RootKey.js` tab names.
- **`BUG-I18N-05`:** L10n gap: `intl` is in `package.json`, yet numeric values (`cost_in_credits`, `length`, `cargo_capacity`, `height`, `mass`) and timestamps have no locale-aware formatting (`Intl.NumberFormat`).

---

## 4. Recommendations & Remedies

| Priority | Defect Group | Concrete Remedy / Patch |
|---|---|---|
| **P0 (Immediate)** | `BUG-FUNC-09`, `BUG-FUNC-21`, `BUG-FUNC-15`, `BUG-BUILD-01` | Import `Platform` in `LoginScreen/index.js` and `GroupHomeScreen/index.js`; pass `email` properly in `fetchCurrentUserRequest` (and guard `if (!currentUser)` before reading `.firstName`); remove duplicate `userRole` key in `apiServices.js:62`; update `__tests__/App.test.tsx` to import `../src/App` with mocked native modules (`mmkv`, `vision-camera`, `push-notification`). |
| **P0 (Security)** | `BUG-SEC-01`–`08` | 1) Hash passwords server-side (bcrypt/Argon2); on local mock fallback hash with PBKDF2/SHA-256 + salt and store JWT/session token in `react-native-keychain` instead of raw passwords; pass `encryptionKey` (from Keychain) to `new MMKV({ id, encryptionKey })`.<br>2) Rotate exposed Google Maps API key, restrict by package/bundle ID, and inject via `.env` (`react-native-config` / Gradle `local.properties` + Xcode `.xcconfig`).<br>3) Enforce HTTPS and remove `NSAllowsArbitraryLoads: true` in `Info.plist`.<br>4) Configure release keystore via CI secrets and set `enableProguardInReleaseBuilds = true`.<br>5) Remove `ACCESS_BACKGROUND_LOCATION`; filter GPS coordinates out of `fetchGroupDetailDataRequest` until the requesting user has `isJoined === true`. |
| **P1 (Functional)** | `BUG-FUNC-01`, `06`, `13`, `16`, `17`, `18`, `24`, `25` | 1) Normalize `email.trim().toLowerCase()` at registration, login, invite, and join boundaries; add `autoCapitalize="none"` and `keyboardType="email-address"`.<br>2) Add `react-native-image-picker` (`launchImageLibrary`) alongside `takePhoto()` in an action sheet; add `NSPhotoLibraryUsageDescription` & `READ_MEDIA_IMAGES`; wrap avatar preview in `TouchableOpacity` for retake.<br>3) Fix `SwapiScreen` for `swapi.info` by fetching & caching the full list once via React Query (`staleTime: 1000 * 60 * 60`) and performing debounced client-side filtering (or switch back to a paginated endpoint); encode query params with `encodeURIComponent`.<br>4) Swap `createGroup.selectStarship` & `selectStarshipPlaceholder`; preserve `members` across SWAPI navigation; remove members by `email`.<br>5) Re-enable `<MapView>` (or fallback to `react-native-maps` Apple Maps on iOS / OpenStreetMap tile layer if avoiding Google billing) and guard `item.lastLocation?.latitude`. |
| **P1 (I18n & Compat)** | `BUG-I18N-01`–`05`, `BUG-COMP-01`–`04` | Remove `lng: 'en'` in `i18n.js`; split locale on `/[-_]/`; add missing `register.locationPermissionRequired` & localize all alerts/tabs; store stable tab IDs (`'joined'` / `'unjoined'`) instead of translated strings; replace frozen `Metrics` with `useWindowDimensions()`; wrap `LoginScreen`/`ProfileScreen`/`GroupDetailScreen` in `ScrollView`; add `UISupportedInterfaceOrientations~ipad` to `Info.plist`; format starship metrics with `Intl.NumberFormat`. |
| **P2 (Perf & UX)** | `BUG-PERF-01`–`07`, `UX-01`–`10` | Add `[]` to `App.js` `useEffect`; remove `console.log("listSwapiData")` & `useEffect` dependency warnings; store compressed image files via `RNFS.DocumentDirectoryPath` URIs rather than duplicating base64 blobs in MMKV; add Back button to `GroupDetailScreen` & camera screen; fix WCAG text contrast (`#a6a6a6` -> `#4b5563` on white); add loading indicators on Register/CreateGroup; implement Forgot Password UI flow & In-App Notification bell modal. |

---

## 5. (Optional) Usability Testing Plan with Internal & External Test Users

### 5.1 Participant Selection & Justification
- **Cohort A — Internal Cross-Functional Users (4–5 participants):**
  - *Composition:* 1 Mobile Developer (uninvolved in `StarWarsApp`), 1 Product/UI Designer, 1–2 Non-technical Operations/HR staff.
  - *Justification:* Fast feedback loop prior to external release; verifies domain terminology, checks alignment with product intent/Adobe XD, and exposes insider blind spots via non-technical staff.
- **Cohort B — External Target Users (6–8 participants):**
  - *Composition:* Casual social/community app users aged 18–45, balanced across Android & iOS (including at least 2 tablet users and 2 Bahasa Indonesia native speakers), varying Star Wars familiarity (3–4 fans, 3–4 non-fans).
  - *Justification:* Non-fans ensure StarWarsAPI labels (`birth_year` like `19BBY`, `MGLT`, `cargo_capacity`) remain understandable without domain jargon, while fans test natural search behaviors (e.g., searching `"Vader"`, `"Millennium Falcon"`). Multi-OS/tablet mix surfaces real-world keyboard, camera/gallery, and landscape ergonomics.

### 5.2 Test Setup & Protocol (Moderated Think-Aloud, 30 min/session)
1. **Tasks (Unassisted):**
   - *Task 1:* Register a new account, upload a photo from gallery or camera, and pick a Star Wars character role.
   - *Task 2:* Switch language to Bahasa Indonesia, log out, and log back in.
   - *Task 3:* Create a group, choose a starship, and invite a second test account.
   - *Task 4:* Log in as the second account, respond to the invitation notification, join the group, and inspect a member's GPS location and starship specifications.
2. **Quantitative & Qualitative Metrics:**
   - **Task Completion Rate** (target >= 90% unassisted).
   - **Time-on-Task** & **Misclick / Error Recovery Rate** (e.g., accidentally closing the invite modal).
   - **System Usability Scale (SUS)** post-test survey (target >= 75).
3. **Bias Mitigation:** Use identical neutral task cards (do not reveal UI labels like *"Unjoined Group"*), rotate task starting language, and capture screen recordings + audio on test devices with pre-seeded synthetic accounts (no personal data).

---

## 6. (Optional) Regression Testing Strategy for New Features

As new features (e.g., real backend auth, chat, live GPS tracking, or starship comparison) are introduced, regression should follow a **3-tier Risk-Based Test Pyramid**:

1. **Tier 1 — Automated Pre-Merge CI Gate (Runs on every PR, < 5 min):**
   - Static checks: `eslint` (zero errors), TypeScript check (`tsc --noEmit`).
   - Unit & Contract tests (Jest + React Native Testing Library): validators, storage adapters, i18n key parity (`en.json` vs `id.json`), SWAPI schema/search contract tests, and security static gates (no hardcoded `AIza...` keys, no plaintext password fields).
2. **Tier 2 — Automated Core E2E Smoke Suite (Runs nightly / pre-release via Maestro or Detox):**
   - Happy-path flow across 2 users: Register -> Camera/Gallery mock -> SWAPI Pick -> Create Group & Invite -> Notification -> Join Group -> Group Detail Starship & Map assertion -> Logout -> Login.
   - Tested on 1 Android emulator + 1 iOS simulator (portrait & landscape rotation hook).
3. **Tier 3 — Exploratory & Device-Matrix Regression (Before Production Release):**
   - Impact-based manual checklist covering areas touched by the PR plus high-risk core flows (Auth, Permissions, Maps/GPS, Localization).
   - **Device Matrix:** Small Android phone (API 26–30), Modern Android phone (API 33–34), Android Tablet, Standard iPhone (Notch/Dynamic Island), and iPad (split-screen/landscape).
   - **Hotfix Policy:** Any P0/P1 production defect patched must include a new regression test in Tier 1 or Tier 2 before closing the ticket.

---

## 7. Action Plan for Remaining Device & Visual Tasks

Because Android SDK/Emulator, macOS/Xcode, and the Adobe XD design link were unavailable in this environment, the remaining manual tests should be completed within the 1-week assignment window using the schedule below:

| Day | Activity | Prerequisites / Owner | Exit Deliverable |
|---|---|---|---|
| **Day 1** | Request Adobe XD link, backend status (`/login`, `/register`), and Map API key policy from hiring team; fix `LoginScreen` & `GroupHomeScreen` missing `Platform` imports on a local QA test branch if unblocked build testing is authorized | Hiring team clarification | Clarification log + annotated XD checklist |
| **Day 2** | Set up Android Studio SDK (API 29 phone, API 34 phone, 10" tablet AVD) + run `yarn android`; execute TC-FUNC-01..15 & TC-COMP-01..03 on Android with Logcat & Android Studio Profiler (CPU/Memory/Battery Historian) | Windows/Linux + Android Studio | Annotated screenshots, Logcat crash traces, Profiler metrics |
| **Day 3** | Build on macOS + Xcode (`cd ios && pod install && yarn ios`) across iPhone SE, iPhone 15 Pro, and iPad Air simulators; verify Safe Area, `PushNotificationIOS`, camera/gallery, and Xcode Instruments energy/memory | macOS + Xcode | iOS simulator screenshots & Instruments trace |
| **Day 4** | Conduct Adobe XD pixel-by-pixel & UX contrast audit across Portrait/Landscape and `en`/`id` locales | Adobe XD link | Visual diff table (actual vs XD) |
| **Day 5** | Consolidate dynamic device findings into `QA_TEST_REPORT.md`, rehearse 10-minute Live Demo & Q&A for technical/non-technical audience | Candidate | Final submission repo & demo readiness |
