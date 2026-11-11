# StarWarsApp — QA Test Report & Verification Scripts

Submission repository for the **Junior QA Engineer Coding Assignment** evaluating [`worlderteam/StarWarsApp`](https://github.com/worlderteam/StarWarsApp) (`commit 6ffa4f5`).

## Contents

| File / Folder | Purpose |
|---|---|
| [`QA_TEST_REPORT.md`](./QA_TEST_REPORT.md) | Complete QA Test Report covering Strategy & Rationale, Test Cases, Execution Results, Defect Register (Functional, Compatibility, Usability, Performance, Security, I18n/L10n), Remedies, Usability User-Testing Plan, Regression Strategy, and Remaining Action Plan |
| [`INTERVIEW_DEMO_GUIDE.md`](./INTERVIEW_DEMO_GUIDE.md) | Presentation & live demonstration guide (Bahasa Indonesia + English QA terms) for Stage 2 interview |
| [`scripts/01-functional-logic-checks.mjs`](./scripts/01-functional-logic-checks.mjs) | Automated checks for assignment credentials, auth/registration/group logic, missing imports, and existing unit tests |
| [`scripts/02-i18n-l10n-checks.mjs`](./scripts/02-i18n-l10n-checks.mjs) | Translation parity (`en.json` vs `id.json`), missing key scanner, locale detector & hardcoded string checks |
| [`scripts/03-swapi-live-api-checks.mjs`](./scripts/03-swapi-live-api-checks.mjs) | Live integration checks against `https://swapi.info/api/` verifying character/starship fields and reproducing search/pagination defects |
| [`scripts/04-compatibility-performance-audit.mjs`](./scripts/04-compatibility-performance-audit.mjs) | Static checks for frozen screen metrics, iPad orientation plist keys, scrollability, effect leaks, base64 bloat, and un-debounced API calls |
| [`scripts/05-security-static-audit.mjs`](./scripts/05-security-static-audit.mjs) | Security & authorization checks (plaintext MMKV credentials, committed API keys, cleartext HTTP, debug signing, GPS privacy leak) |
| [`scripts/run-all-summary.mjs`](./scripts/run-all-summary.mjs) | Runs all 5 verification suites and exports aggregated metrics to `qa-summary.json` |
| [`qa-summary.json`](./qa-summary.json) | Generated machine-readable summary from the latest QA run |

---

## Prerequisites

- **Node.js** `>= 18.0.0` (verified on `v24.13.0` — uses built-in `node:test`, `node:assert`, and `fetch`, so **no extra `npm install` is required**)
- **Internet access** (for `03-swapi-live-api-checks.mjs` querying `https://swapi.info/api/`)
- Local clone of `https://github.com/worlderteam/StarWarsApp` alongside this repository at `../StarWarsApp` (or pass custom path via `STARWARS_APP_DIR`)

---

## How to Run the QA Verification Scripts

### 1. Clone the target app beside this repo (if not already present)
```bash
git clone https://github.com/worlderteam/StarWarsApp.git ../StarWarsApp
```

### 2. Run the full QA summary (recommended for demo)
```bash
npm run qa:summary
```
*(Or override the target app location:)*
```bash
# PowerShell
$env:STARWARS_APP_DIR="D:\worlderPTLD\StarWarsApp"; npm run qa:summary

# Bash / macOS / Linux
STARWARS_APP_DIR=/path/to/StarWarsApp npm run qa:summary
```

### 3. Run individual test suites
```bash
npm run qa:functional    # Functional & logic checks (17 checks)
npm run qa:i18n          # I18n & L10n checks (5 checks)
npm run qa:swapi         # Live SWAPI API integration checks (4 checks)
npm run qa:compat-perf   # Compatibility & performance static checks (7 checks)
npm run qa:security      # Security & authorization checks (8 checks)
npm run qa:test          # Run all 41 checks via node --test (exits non-zero when defects fail)
```

> **Note on Exit Codes:** Running `npm run qa:test` or individual `qa:*` scripts against the unpatched `worlderteam/StarWarsApp` (`6ffa4f5`) intentionally returns **exit code 1** because failing assertions prove active defects (`BUG-*`) documented in [`QA_TEST_REPORT.md`](./QA_TEST_REPORT.md). Use `npm run qa:summary` to run all suites end-to-end and view the summary table.

### 4. Verify the target repository's own test & lint baseline
Inside `../StarWarsApp`:
```bash
node .yarn/releases/yarn-3.6.4.cjs install --immutable
node .yarn/releases/yarn-3.6.4.cjs test --watchAll=false
node .yarn/releases/yarn-3.6.4.cjs lint
```
Expected baseline findings on `commit 6ffa4f5`:
- `yarn test --watchAll=false` exits `1` (`__tests__/App.test.tsx` imports missing `../App` instead of `../src/App`).
- `yarn lint` exits `1` with `244 problems (20 errors, 224 warnings)`, including `no-undef` on `Platform` (`LoginScreen`, `GroupHomeScreen`) and `email` (`apiServices.js`).

---

## Latest Verified Output (`npm run qa:summary`)

```text
Functional & Logic Checks            | Total: 17 | Pass:  4 | Fail (Defects): 13
I18n & L10n Checks                   | Total:  5 | Pass:  1 | Fail (Defects):  4
Live SWAPI Integration Checks        | Total:  4 | Pass:  2 | Fail (Defects):  2
Compatibility & Performance Audit    | Total:  7 | Pass:  0 | Fail (Defects):  7
Security & Authorization Audit       | Total:  8 | Pass:  0 | Fail (Defects):  8
----------------------------------------------------------
TOTAL                                | Total: 41 | Pass:  7 | Fail (Defects): 34
```
