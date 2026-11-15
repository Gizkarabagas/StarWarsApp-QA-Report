# ⚡ Quick QA Executive Summary & Interview Talking Points

> **Target App:** `worlderteam/StarWarsApp` (React Native `0.75.3`, commit `6ffa4f5`)  
> **Role:** Junior QA Engineer Interview  
> **Key Metric:** 41 Automated Verification Checks — **7 Passed (17%)**, **34 Confirmed Defects (83%)**  
> **Verdict:** 🛑 **NOT READY FOR RELEASE** (Critical Blockers & Data Confidentiality Risks)  

---

## 🎤 1. Your 60-Second Opening Pitch (Say This in the Interview!)

> *"Hello team, I’ve completed an end-to-end QA assessment on StarWarsApp across all five core pillars: Functional, Compatibility, Usability, Performance, and Security.*
> 
> *My bottom-line verdict is that **the app is currently not ready for production**. Out of 41 automated checks and manual code traces, I identified **34 confirmed defects**.*
> 
> *The two biggest showstoppers are **two simple missing `Platform` imports**: one in `LoginScreen` that **blocks 100% of user logins**, and one in `GroupHomeScreen` that **crashes the app immediately** when an invited user views their notifications.*
> 
> *Additionally, passwords are stored in **plaintext without encryption**, search on StarWarsAPI is currently non-functional, and the UI breaks when rotated to landscape. I’ve prepared a full test matrix, defect evidence, and actionable code patches in my report."*

---

## 🚨 2. The "Big 5" Showstoppers (The Most Important Bugs to Explain)

### 1. 🛑 100% Login Failure (Blocker)
- **Where:** `src/screens/LoginScreen/index.js` (Line 51)
- **What happens:** Every login attempt fails with: *"You must allow location permission on this app to login"*.
- **Why it happens:** The code checks `if (Platform.OS === 'android')`, but **`Platform` is never imported** from `'react-native'`. It throws a `ReferenceError`, gets caught by the try/catch block, and returns `false`.
- **The 30-second fix:** Just add `Platform` to the named imports from `'react-native'`.

### 2. 💥 App Crashes on Group Invitation (Critical)
- **Where:** `src/screens/GroupHomeScreen/index.js` (Line 102)
- **What happens:** When Darth Vader logs in after Luke invites him, the app force-closes instantly.
- **Why it happens:** Exactly the same bug: `sendPushNotification()` checks `Platform.OS === 'ios'` without importing `Platform`.
- **The fix:** Add `Platform` import to `GroupHomeScreen/index.js`.

### 3. 🔒 Plaintext Passwords in Local Database (Critical Security)
- **Where:** `src/utils/Storages.js` & `src/react-query/states/apiServices.js`
- **What happens:** Passwords are completely exposed in plaintext inside the local MMKV database.
- **Why it happens:** `new MMKV()` is initialized without an `encryptionKey`. Registration stores raw passwords in `LIST_USER` and `CURR_USER_LOGIN_DATA`, and login checks `user.password === params.password` directly.
- **The fix:** Use `new MMKV({ encryptionKey })` backed by iOS Keychain / Android Keystore, and hash passwords with bcrypt or PBKDF2.

### 4. 🔍 StarWarsAPI Search Doesn't Filter (Major Functional)
- **Where:** `src/screens/SwapiScreen/index.js` & Live HTTPS API
- **What happens:** Searching for *"vader"* or *"falcon"* still displays all 82 characters starting with Luke Skywalker.
- **Why it happens:** The live endpoint (`https://swapi.info/api/people/?search=vader`) **ignores `?search=`** and always returns the full static array.
- **The fix:** Fetch the dataset once with React Query, and execute client-side array filtering in JavaScript.

### 5. 🗺️ Missing Interactive Map & Gallery Upload (Missing Mandated Specs)
- **Where:** `GroupDetailScreen/index.js` & `RegisterScreen/index.js`
- **What happens:**
  - MapView is commented out with `// Paid Account API Key needed`. Users only see raw coordinate numbers.
  - Registration only has a camera button; **no image gallery picker exists** (violating Requirement #2).
- **The fix:** Install `react-native-image-picker` and re-enable `<MapView>` (or use Apple Maps / OpenStreetMap).

---

## 📋 3. 13-Requirement Quick Reference Card

| Requirement | What We Tested | Status | Quick Note for Interview |
|:---:|---|:---:|---|
| **#1** | Register Luke & Vader accounts | ⚠️ Partial | Password regex passes. But mixed-case emails break login because storage isn't lowercased. |
| **#2** | Camera or Gallery photo upload | ❌ Fail | Only camera snapshot exists. No gallery/library option in code or UI. |
| **#3** | Login with email & password | 🛑 Blocker | Missing `Platform` import blocks all logins. "Forget Password" is just a `console.log`. |
| **#4** | Profile displays SWAPI particulars | ❌ Fail | Height, mass, birth year show up, but user's full name is missing on the profile screen. |
| **#5** | Create group & invite (Rebel Alliance) | ❌ Fail | Error and placeholder text are swapped; returning from starship picker wipes invited members. |
| **#6** | In-app group invitation notification | 💥 Crash | App crashes upon opening notification due to missing `Platform` import. |
| **#7** | Join invited group | ⚠️ Partial | Join button works in English, but tab name matching breaks if initial language is Indonesian. |
| **#8** | Group profile shows members & GPS | ❌ Fail | MapView is disabled. Unjoined invitees can view members' GPS coordinates (privacy leak). |
| **#9** | Interactive Starship information | ❌ Fail | Only 9 static text rows. Pushes the member list completely off-screen on smaller devices. |
| **#10** | Adobe XD visual match | 🔒 Blocked | Hyperlink in PDF requires account sign-in/access permission from the hiring team. |
| **#11** | Auth & authorization scheme | ❌ Fail | Plaintext passwords in MMKV, cleartext HTTP `localhost:3000`, no session expiration. |
| **#12** | Portrait & Landscape (phone & tablet) | ❌ Fail | Screen dimensions are frozen at startup (`Object.freeze`); rotating to landscape breaks layouts. |
| **#13** | I18n & L10n (English & Indonesian) | ❌ Fail | Hardcoded `lng: 'en'` overrides device language; missing keys and untranslated alerts remain. |

---

## 💡 4. Top Anticipated Interview Questions & Winning Answers

### Q1: "Why did you classify the missing Platform import as a Blocker?"
> **Your Answer:**  
> *"In QA, a Blocker is a defect that halts the primary business flow with no available workaround. Because `Platform` is undefined, `requestLocationPermission()` throws an uncaught ReferenceError on line 51 of `LoginScreen`. That causes the permission check to return false, which blocks 100% of users from ever logging in. Without logging in, no user can create groups, view profiles, or interact with the app."*

### Q2: "How did you discover the SWAPI search bug?"
> **Your Answer:**  
> *"I noticed in `apiCallers.js` that the host was set to `swapi.info`. I wrote an automated integration script to execute live HTTP requests against `https://swapi.info/api/people/?search=vader`. The response proved that `swapi.info` returns an unpaginated flat array of all 82 characters regardless of the query string. In `SwapiScreen`, the developer assumed server-side filtering like the old `swapi.dev`. I recommended fetching the data once into React Query cache and filtering locally in JavaScript."*

### Q3: "What are the biggest security concerns in this mobile app?"
> **Your Answer:**  
> *"Two major items aligned with OWASP MASVS:  
> First, **Insecure Data Storage (M2):** The MMKV database is unencrypted, storing plaintext passwords in `LIST_USER` and `CURR_USER_LOGIN_DATA`.  
> Second, **Broken Authorization / Privacy Leak (M1):** In `GroupDetailScreen`, member GPS coordinates are delivered and displayed even to users who haven't accepted the group invitation yet. Coordinates should only be exposed once `member.isJoined` is confirmed."*

### Q4: "Why does the app break in Landscape mode?"
> **Your Answer:**  
> *"In `src/utils/GlobalConfig.js`, the developer used `Object.freeze` on `Dimensions.get('window')` when the module loads. Because React Native's module scope only runs once at startup, rotating the screen never updates `SCREEN_WIDTH` or `SCREEN_HEIGHT`. The camera box and TabBar stay locked to portrait width. The modern solution is to use React Native’s `useWindowDimensions()` hook."*

### Q5: "If we only have 2 hours before release, what do we fix first?"
> **Your Answer:**  
> *"I’d implement three immediate one-line patches:  
> 1. Add `Platform` import to `LoginScreen` and `GroupHomeScreen` (unblocks Login and prevents crash).  
> 2. Add `.trim().toLowerCase()` to email storage and login checks (prevents mixed-case lockout).  
> 3. Fix the swapped i18n keys on `CreateGroupScreen`.  
> That restores core app functionality in under 30 minutes while we plan security hardening for the next sprint."*
