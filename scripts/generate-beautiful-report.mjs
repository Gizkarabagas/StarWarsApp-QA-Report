import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outPath = path.resolve(__dirname, '..', 'QA_TEST_REPORT.html');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QA Assessment Dashboard & Test Cases — StarWarsApp</title>
  <style>
    :root {
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --border: #e2e8f0;
      --text: #0f172a;
      --text-muted: #64748b;
      --primary: #2563eb;
      --primary-light: #eff6ff;
      --danger: #dc2626;
      --danger-light: #fef2f2;
      --warning: #d97706;
      --warning-light: #fffbeb;
      --success: #16a34a;
      --success-light: #f0fdf4;
      --info: #0891b2;
      --info-light: #ecfeff;
      --radius: 10px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      font-size: 15px;
    }

    .app-header {
      background: #0f172a;
      color: white;
      padding: 20px 32px;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .app-title h1 {
      font-size: 20px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .app-title p {
      font-size: 13px;
      color: #94a3b8;
      margin-top: 2px;
    }

    .header-actions {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .btn {
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid transparent;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .btn-primary { background: var(--primary); color: white; }
    .btn-primary:hover { background: #1d4ed8; }
    .btn-outline { background: rgba(255,255,255,0.1); color: white; border-color: rgba(255,255,255,0.2); }
    .btn-outline:hover { background: rgba(255,255,255,0.2); }

    .main-container {
      max-width: 1240px;
      margin: 28px auto;
      padding: 0 24px 80px;
    }

    .tab-bar {
      display: flex;
      gap: 8px;
      background: #e2e8f0;
      padding: 6px;
      border-radius: 10px;
      margin-bottom: 28px;
      position: sticky;
      top: 80px;
      z-index: 90;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    .tab-btn {
      flex: 1;
      padding: 10px 18px;
      border: none;
      background: transparent;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-muted);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
    }
    .tab-btn.active {
      background: white;
      color: var(--primary);
      box-shadow: 0 2px 6px rgba(0,0,0,0.08);
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
    }
    .kpi-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      display: flex;
      flex-direction: column;
    }
    .kpi-card .label { font-size: 13px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
    .kpi-card .value { font-size: 28px; font-weight: 800; margin: 8px 0 4px; }
    .kpi-card .sub { font-size: 12px; color: var(--text-muted); }
    .kpi-danger .value { color: var(--danger); }
    .kpi-warning .value { color: var(--warning); }
    .kpi-success .value { color: var(--success); }
    .kpi-primary .value { color: var(--primary); }

    .verdict-banner {
      background: var(--danger-light);
      border-left: 6px solid var(--danger);
      border-radius: var(--radius);
      padding: 20px 24px;
      margin-bottom: 32px;
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }
    .verdict-icon { font-size: 32px; line-height: 1; }
    .verdict-body h3 { font-size: 18px; color: #991b1b; font-weight: 700; margin-bottom: 4px; }
    .verdict-body p { font-size: 14px; color: #7f1d1d; }

    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 28px;
      margin-bottom: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .card-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 12px;
    }

    .pitch-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-left: 5px solid #16a34a;
      border-radius: 8px;
      padding: 18px 22px;
      font-size: 15px;
      color: #14532d;
      margin: 16px 0;
      font-style: italic;
      line-height: 1.7;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      padding: 3px 8px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .badge-blocker { background: #7f1d1d; color: white; }
    .badge-critical { background: var(--danger-light); color: var(--danger); border: 1px solid #fca5a5; }
    .badge-high { background: var(--warning-light); color: var(--warning); border: 1px solid #fde68a; }
    .badge-medium { background: var(--info-light); color: var(--info); border: 1px solid #a5f3fc; }
    .badge-pass { background: var(--success-light); color: var(--success); border: 1px solid #86efac; }
    .badge-fail { background: var(--danger-light); color: var(--danger); border: 1px solid #fca5a5; }
    .badge-blocked { background: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1; }

    .table-responsive { overflow-x: auto; margin: 16px 0; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; line-height: 1.5; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid var(--border); vertical-align: top; }
    th { background: #f8fafc; color: #475569; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.03em; }
    tr:hover { background: #fafafa; }
    td strong { color: #0f172a; }

    .qa-card {
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 16px 20px;
      margin-bottom: 14px;
      background: white;
    }
    .qa-q { font-weight: 700; color: #1e293b; margin-bottom: 6px; font-size: 15px; }
    .qa-a { color: #475569; font-size: 14px; line-height: 1.6; }

    .defect-controls {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 20px;
      align-items: center;
    }
    .search-input {
      flex: 1;
      min-width: 240px;
      padding: 9px 14px;
      border: 1px solid var(--border);
      border-radius: 8px;
      font-size: 14px;
      outline: none;
    }
    .search-input:focus { border-color: var(--primary); }
    .filter-btn {
      padding: 7px 12px;
      border: 1px solid var(--border);
      background: white;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      cursor: pointer;
    }
    .filter-btn.active { background: var(--primary); color: white; border-color: var(--primary); }

    .defect-list { display: flex; flex-direction: column; gap: 16px; }
    .defect-card {
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 18px 20px;
      background: #ffffff;
      transition: all 0.2s;
    }
    .defect-card:hover { border-color: #cbd5e1; box-shadow: 0 4px 10px rgba(0,0,0,0.03); }
    .defect-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
      flex-wrap: wrap;
      gap: 8px;
    }
    .defect-id-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--text);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .defect-meta {
      font-size: 12px;
      color: var(--text-muted);
      font-family: Consolas, monospace;
      background: #f1f5f9;
      padding: 2px 8px;
      border-radius: 4px;
    }
    .defect-section { margin-top: 10px; font-size: 14px; }
    .defect-section strong { color: #334155; }
    .code-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 12px;
      font-family: Consolas, monospace;
      font-size: 13px;
      margin-top: 8px;
      overflow-x: auto;
      color: #0f172a;
    }

    @media print {
      .app-header, .tab-bar, .defect-controls, .btn { display: none !important; }
      body { background: white; font-size: 12pt; }
      .main-container { max-width: 100%; margin: 0; padding: 0; }
      .card { box-shadow: none; border: 1px solid #ccc; break-inside: avoid; }
    }
  </style>
</head>
<body>

  <header class="app-header">
    <div class="app-title">
      <h1>⭐ QA Assessment Dashboard — StarWarsApp</h1>
      <p>Target: <code>worlderteam/StarWarsApp</code> (commit <code>6ffa4f5</code>) • Evaluated by Junior QA Candidate</p>
    </div>
    <div class="header-actions">
      <button class="btn btn-outline" onclick="window.print()">🖨️ Print / Save PDF</button>
      <button class="btn btn-primary" onclick="switchTab('summary')">⚡ Quick Summary</button>
      <button class="btn btn-primary" onclick="switchTab('testcases')">📋 Full Test Cases Matrix</button>
      <button class="btn btn-primary" onclick="switchTab('defects')">🐞 Defect Explorer</button>
    </div>
  </header>

  <div class="main-container">
    <div class="tab-bar">
      <button class="tab-btn" id="tab-btn-summary" onclick="switchTab('summary')">⚡ Quick Executive Summary & Interview Talking Points</button>
      <button class="tab-btn active" id="tab-btn-testcases" onclick="switchTab('testcases')">📋 Official Test Cases Matrix (Requirements 1–13)</button>
      <button class="tab-btn" id="tab-btn-defects" onclick="switchTab('defects')">🐞 Interactive Defect Explorer (34 Bugs)</button>
    </div>

    <!-- TAB 1: QUICK SUMMARY & INTERVIEW TALKING POINTS -->
    <div id="tab-summary" class="tab-content" style="display: none;">
      <div class="kpi-grid">
        <div class="kpi-card kpi-danger">
          <span class="label">Release Verdict</span>
          <span class="value">NOT READY</span>
          <span class="sub">Production blocked by fatal errors</span>
        </div>
        <div class="kpi-card kpi-danger">
          <span class="label">Confirmed Defects</span>
          <span class="value">34 Bugs</span>
          <span class="sub">Across 41 automated checks</span>
        </div>
        <div class="kpi-card kpi-warning">
          <span class="label">Blocker / Critical</span>
          <span class="value">5 Issues</span>
          <span class="sub">Login failure, crash, plaintext passwords</span>
        </div>
        <div class="kpi-card kpi-success">
          <span class="label">Verified Pass</span>
          <span class="value">7 Checks</span>
          <span class="sub">Password regex, API online, tabs</span>
        </div>
      </div>

      <div class="verdict-banner">
        <div class="verdict-icon">🛑</div>
        <div class="verdict-body">
          <h3>Executive Release Verdict: NOT READY FOR PRODUCTION</h3>
          <p>Two fundamental coding omissions (undeclared <code>Platform</code> imports) cause <strong>100% of user logins to fail</strong> and <strong>the app to crash immediately</strong> upon viewing group notifications. In addition, user credentials are stored in <strong>unencrypted plaintext</strong>, and StarWarsAPI search is non-functional.</p>
        </div>
      </div>

      <div class="card">
        <div class="card-title">🎤 Your 60-Second Opening Pitch for the Interview (Speak this!)</div>
        <div class="pitch-box">
          "Hello team! I've conducted a comprehensive end-to-end QA assessment on StarWarsApp across all five core pillars: Functional, Compatibility, Usability, Performance, and Security.<br><br>
          My bottom-line verdict is that <strong>the application is currently NOT ready for release</strong>. Out of 41 automated checks and manual code audits, I identified <strong>34 confirmed defects</strong>.<br><br>
          The two most critical showstoppers are <strong>missing <code>Platform</code> imports</strong>: one in <code>LoginScreen</code> that <strong>blocks 100% of user logins</strong>, and one in <code>GroupHomeScreen</code> that <strong>crashes the app immediately</strong> when viewing group notifications. Furthermore, passwords are stored in <strong>plaintext</strong>, SWAPI search is ignored by the server, and the UI breaks when rotated to landscape. I've prepared full reproduction steps and one-line patch remedies in my report."
        </div>
      </div>

      <div class="card">
        <div class="card-title">🔥 The "Big 5" Showstoppers (The Top Defects to Present)</div>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th style="width: 170px;">Defect</th>
                <th style="width: 220px;">Source Location</th>
                <th>Real-World Impact</th>
                <th>Root Cause & Remedy</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span class="badge badge-blocker">Blocker</span> <strong>100% Login Failure</strong></td>
                <td><code>LoginScreen/index.js</code> (L51)</td>
                <td>Users cannot log in under any circumstances. Always errors with: <em>"You must allow location permission on this app to login"</em>.</td>
                <td>Code uses <code>Platform.OS === 'android'</code> but <strong>never imported <code>Platform</code></strong> from <code>'react-native'</code>. Throws <code>ReferenceError</code> caught by fallback.</td>
              </tr>
              <tr>
                <td><span class="badge badge-critical">Critical</span> <strong>App Crashes on Invite Notification</strong></td>
                <td><code>GroupHomeScreen/index.js</code> (L102)</td>
                <td>When Darth Vader logs in after Luke invites him, <strong>the application crashes immediately</strong> upon viewing the Home tab.</td>
                <td>Identical root cause: <code>sendPushNotification()</code> calls <code>Platform.OS === 'ios'</code> without importing <code>Platform</code>.</td>
              </tr>
              <tr>
                <td><span class="badge badge-critical">Critical</span> <strong>Plaintext Password Storage</strong></td>
                <td><code>Storages.js</code> & <code>apiServices.js</code></td>
                <td>Zero data confidentiality. Any attacker with device backup or ADB file access can read all user emails and plaintext passwords.</td>
                <td><code>new MMKV()</code> is created without an encryption key; raw passwords are saved in <code>LIST_USER</code> and compared with <code>===</code>.</td>
              </tr>
              <tr>
                <td><span class="badge badge-high">High</span> <strong>SWAPI Search Ignored</strong></td>
                <td><code>SwapiScreen/index.js</code></td>
                <td>Searching for <em>"vader"</em> or <em>"falcon"</em> still shows all 82 characters from Luke Skywalker onwards.</td>
                <td>Live HTTPS test proves <code>swapi.info</code> <strong>ignores the <code>?search=</code> query</strong>. Fix: implement client-side array filtering in JavaScript.</td>
              </tr>
              <tr>
                <td><span class="badge badge-high">High</span> <strong>Map Disabled & No Gallery Upload</strong></td>
                <td><code>GroupDetailScreen</code> & <code>RegisterScreen</code></td>
                <td>Interactive map is commented out (raw numbers only). Registration only has a camera, <strong>missing image gallery upload</strong> (Req #2).</td>
                <td><code>MapView</code> commented out (<em>Paid Account needed</em>); no <code>react-native-image-picker</code> library installed.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card-title">💡 Anticipated Interview Q&A (Practice These Answers!)</div>
        <div class="qa-card">
          <div class="qa-q">Q: "Why did you classify the missing Platform import as a Blocker?"</div>
          <div class="qa-a"><strong>A:</strong> "In QA, a Blocker halts the primary user journey with zero workarounds. Because <code>Platform</code> is undefined, <code>requestLocationPermission()</code> throws an uncaught ReferenceError in <code>LoginScreen</code>. This forces the permission check to return false, blocking 100% of users from logging in. Without login, users cannot create groups, view profiles, or interact with the app."</div>
        </div>
        <div class="qa-card">
          <div class="qa-q">Q: "How did you discover the StarWarsAPI search defect?"</div>
          <div class="qa-a"><strong>A:</strong> "I examined <code>apiCallers.js</code> and noticed the host was <code>swapi.info</code>. I wrote an automated integration script to execute a live HTTPS query for <code>https://swapi.info/api/people/?search=vader</code>. The response returned an unpaginated array of all 82 characters, proving that <code>swapi.info</code> ignores search query params. The solution is to fetch once into React Query and filter client-side in JavaScript."</div>
        </div>
      </div>
    </div>

    <!-- TAB 2: FULL TEST CASES MATRIX (OFFICIAL ASSIGNMENT REQUIREMENT) -->
    <div id="tab-testcases" class="tab-content">
      <div class="card">
        <div class="card-title">📋 Official Test Cases Matrix (Requirements 1–13 Across All 5 Pillars)</div>
        <p style="margin-bottom: 16px; color: var(--text-muted);">This is the complete structured test suite answering Section 2 of the assignment: <em>"Your test report should include: 1. Test strategy, 2. Test cases, 3. Test results, 4. Recommendations."</em></p>
        
        <h3 style="margin: 20px 0 10px; color: var(--primary);">2.1 Functional Test Cases (Requirements 1–11 & 13)</h3>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th style="width: 90px;">TC ID</th>
                <th style="width: 50px;">Req</th>
                <th style="width: 220px;">Scenario & Preconditions</th>
                <th style="width: 200px;">Test Steps & Data</th>
                <th>Expected Result</th>
                <th>Actual Result</th>
                <th style="width: 80px;">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>TC-FUNC-01</strong></td><td>#1</td>
                <td>Register User 1 (Luke) with valid credentials</td>
                <td>Name: Luke Skywalker<br>Email: <code>luke_skywalker@starwars.com</code><br>Pass: <code>m4y_th3_F0rc3_b3_w1th_u</code></td>
                <td>Account created, password validated, user saved in MMKV.</td>
                <td>Password regex passes. However, email is saved without <code>.toLowerCase()</code>, which breaks login if capitalized.</td>
                <td><span class="badge badge-fail">PARTIAL</span></td>
              </tr>
              <tr>
                <td><strong>TC-FUNC-02</strong></td><td>#1</td>
                <td>Register User 2 (Darth Vader) with valid credentials</td>
                <td>Name: Darth Vader<br>Email: <code>anakin_skywalker@starwars.com</code><br>Pass: <code>1_4m_ur_F4th3r!</code></td>
                <td>Password accepted with symbols (<code>_</code> and <code>!</code>) and digits.</td>
                <td>Regex validator correctly passes both Luke and Vader test passwords (verified via automated suite).</td>
                <td><span class="badge badge-pass">PASS</span></td>
              </tr>
              <tr>
                <td><strong>TC-FUNC-03</strong></td><td>#1</td>
                <td>Negative validation: weak password & duplicate email</td>
                <td>Enter password <code>weakpass</code>, then duplicate email <code>luke_skywalker@starwars.com</code></td>
                <td>Appropriate error toast shown; registration blocked.</td>
                <td>Error toasts correctly displayed (<em>"Passwords do not match"</em>, <em>"Email is already registered"</em>).</td>
                <td><span class="badge badge-pass">PASS</span></td>
              </tr>
              <tr>
                <td><strong>TC-FUNC-04</strong></td><td>#2</td>
                <td>Profile photo upload via <strong>Camera</strong></td>
                <td>Tap avatar -> grant camera permission -> tap Capture Photo</td>
                <td>Camera captures photo, returns to form, allows retaking if desired.</td>
                <td>Uses low-res <code>takeSnapshot</code> (quality 10); lacks a back button on camera; cannot retake once photo is set.</td>
                <td><span class="badge badge-fail">PARTIAL</span></td>
              </tr>
              <tr>
                <td><strong>TC-FUNC-05</strong></td><td>#2</td>
                <td>Profile photo upload via <strong>Image Library / Gallery</strong></td>
                <td>Tap avatar -> choose "Choose from Gallery"</td>
                <td>User can select an existing photo from phone gallery.</td>
                <td><strong>Completely missing</strong>. No gallery picker library installed or UI implemented (violating Req #2).</td>
                <td><span class="badge badge-fail">FAIL</span></td>
              </tr>
              <tr>
                <td><strong>TC-FUNC-06</strong></td><td>#3</td>
                <td>User Login with registered email & password</td>
                <td>Enter <code>luke_skywalker@starwars.com</code> and password -> tap LOGIN</td>
                <td>Location checked, user authenticated, redirected to Home tab.</td>
                <td><strong>Fatal Blocker</strong>: <code>Platform.OS</code> is called without importing <code>Platform</code>. 100% of logins fail with location error.</td>
                <td><span class="badge badge-blocker">BLOCKER</span></td>
              </tr>
              <tr>
                <td><strong>TC-FUNC-07</strong></td><td>#3</td>
                <td>"Forget Password" action</td>
                <td>Tap "Forget Password" on login screen</td>
                <td>Navigates to password reset flow or dialog.</td>
                <td>Executes <code>console.log('Forgot Password Pressed')</code> only; zero user-facing response.</td>
                <td><span class="badge badge-fail">FAIL</span></td>
              </tr>
              <tr>
                <td><strong>TC-FUNC-08</strong></td><td>#4</td>
                <td>Select SWAPI character role & view Profile particulars</td>
                <td>Pick "Darth Vader" on SWAPI picker -> view Profile tab</td>
                <td>Displays height, mass, birth year, gender, and full name.</td>
                <td>Height/mass/gender display, but user's full name is omitted on the Profile screen. Undefined style <code>$lightGray</code> used.</td>
                <td><span class="badge badge-fail">FAIL</span></td>
              </tr>
              <tr>
                <td><strong>TC-FUNC-09</strong></td><td>#5</td>
                <td>Create group "Rebel Alliance" & invite Darth Vader</td>
                <td>Enter "Rebel Alliance" -> pick Starship -> invite <code>anakin_skywalker@starwars.com</code></td>
                <td>Group saved, Luke joined as main member, Vader added as invited member.</td>
                <td>Validation & placeholder i18n keys are swapped; returning from starship picker without selecting wipes members.</td>
                <td><span class="badge badge-fail">FAIL</span></td>
              </tr>
              <tr>
                <td><strong>TC-FUNC-10</strong></td><td>#6</td>
                <td>In-app notification for invited user (Darth Vader)</td>
                <td>Log in as Darth Vader -> open Home tab</td>
                <td>Home switches to Unjoined tab; push/local notification is displayed.</td>
                <td><strong>Fatal Crash</strong>: <code>sendPushNotification()</code> calls <code>Platform.OS</code> without importing <code>Platform</code>, crashing app immediately.</td>
                <td><span class="badge badge-critical">CRASH</span></td>
              </tr>
              <tr>
                <td><strong>TC-FUNC-11</strong></td><td>#7</td>
                <td>Join invited group from "Unjoined Group" tab</td>
                <td>Open Unjoined tab -> tap "Rebel Alliance" -> tap "Join Group"</td>
                <td>Member <code>isJoined</code> flips to <code>true</code>; group moves to "Joined Group" tab.</td>
                <td>Works in English. However, tab matching fails if initial language is Indonesian because <code>activeTab</code> is hardcoded to <code>'Joined Group'</code>.</td>
                <td><span class="badge badge-fail">PARTIAL</span></td>
              </tr>
              <tr>
                <td><strong>TC-FUNC-12</strong></td><td>#8</td>
                <td>View joined members and last known GPS location</td>
                <td>Open Group Detail -> inspect member list and map</td>
                <td>Interactive map displays markers for each joined member's last known GPS coordinate.</td>
                <td><code>MapView</code> and <code>Marker</code> are commented out. Member GPS coordinates leak to unjoined invitees before joining.</td>
                <td><span class="badge badge-fail">FAIL</span></td>
              </tr>
              <tr>
                <td><strong>TC-FUNC-13</strong></td><td>#9</td>
                <td>View interactive Starship information on Group profile</td>
                <td>Open Group Detail -> inspect starship section</td>
                <td>Interactive, rich Starship specifications from SWAPI.</td>
                <td>Non-interactive static text subset of 9 fields; pushes member list off-screen on smaller devices.</td>
                <td><span class="badge badge-fail">FAIL</span></td>
              </tr>
              <tr>
                <td><strong>TC-FUNC-14</strong></td><td>#13</td>
                <td>Support for I18n & L10n (English and Indonesian)</td>
                <td>Toggle language EN/ID; inspect formatting</td>
                <td>Full bilingual translation across all screens, buttons, and alerts; locale-aware number formatting.</td>
                <td><code>i18n.js</code> hardcodes <code>lng: 'en'</code>, overriding device locale; missing key <code>register.locationPermissionRequired</code>; alerts in English.</td>
                <td><span class="badge badge-fail">FAIL</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 style="margin: 28px 0 10px; color: var(--primary);">2.2 Compatibility Test Cases (Portrait/Landscape & Devices)</h3>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th style="width: 100px;">TC ID</th>
                <th style="width: 240px;">Scenario</th>
                <th>Expected Result</th>
                <th>Actual Result</th>
                <th style="width: 80px;">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>TC-COMP-01</strong></td>
                <td>Rotate device from Portrait to Landscape on Login & Profile</td>
                <td>Form adjusts dynamically and remains scrollable.</td>
                <td>Login and Profile omit <code>ScrollView</code>; content clips on landscape viewports.</td>
                <td><span class="badge badge-fail">FAIL</span></td>
              </tr>
              <tr>
                <td><strong>TC-COMP-02</strong></td>
                <td>Rotate device to Landscape on Register (Camera) & Home (Chart)</td>
                <td>Camera box and PieChart dynamically scale to width and height.</td>
                <td><code>GlobalConfig.js</code> freezes <code>Dimensions.get('window')</code> on startup; layout fails to adapt when rotated.</td>
                <td><span class="badge badge-fail">FAIL</span></td>
              </tr>
              <tr>
                <td><strong>TC-COMP-03</strong></td>
                <td>Tablet & iPad Compatibility (iPad 10.9", Android Tablet)</td>
                <td>Full tablet orientation support and proportional layouts.</td>
                <td><code>Info.plist</code> omits <code>UISupportedInterfaceOrientations~ipad</code>; modals use fixed <code>width: 300</code>.</td>
                <td><span class="badge badge-fail">FAIL</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 style="margin: 28px 0 10px; color: var(--primary);">2.3 Security & Privacy Test Cases</h3>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th style="width: 100px;">TC ID</th>
                <th style="width: 240px;">Scenario</th>
                <th>Expected Result</th>
                <th>Actual Result</th>
                <th style="width: 80px;">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>TC-SEC-01</strong></td>
                <td>Data-at-Rest: Credential confidentiality in local storage</td>
                <td>Passwords hashed with salt; database encrypted via Keystore.</td>
                <td>Unencrypted MMKV database stores plaintext passwords in <code>LIST_USER</code> and <code>CURR_USER_LOGIN_DATA</code>.</td>
                <td><span class="badge badge-critical">CRITICAL</span></td>
              </tr>
              <tr>
                <td><strong>TC-SEC-02</strong></td>
                <td>Secrets Management: Google Maps API keys</td>
                <td>API keys injected via environment variables (.env).</td>
                <td>Hardcoded API key <code>AIzaSyDw...</code> committed in <code>AndroidManifest.xml</code> and <code>AppDelegate.mm</code>.</td>
                <td><span class="badge badge-high">HIGH</span></td>
              </tr>
              <tr>
                <td><strong>TC-SEC-03</strong></td>
                <td>Authorization: Member GPS location exposure</td>
                <td>GPS coordinates hidden until user is confirmed joined member.</td>
                <td><code>fetchGroupDetailDataRequest</code> returns GPS coordinates of all members to unjoined invitees.</td>
                <td><span class="badge badge-critical">CRITICAL</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 3: INTERACTIVE DEFECT EXPLORER -->
    <div id="tab-defects" class="tab-content" style="display: none;">
      <div class="card">
        <div class="card-title">🐞 Interactive Defect Explorer (Search & Filter)</div>
        <div class="defect-controls">
          <input type="text" id="defectSearch" class="search-input" placeholder="🔍 Search defect title, file, or keyword (e.g. Platform, Login, MMKV, SWAPI)..." oninput="filterDefects()">
          <button class="filter-btn active" onclick="setFilter('all', this)">All (34)</button>
          <button class="filter-btn" onclick="setFilter('blocker', this)">Blocker / Critical (5)</button>
          <button class="filter-btn" onclick="setFilter('functional', this)">Functional (13)</button>
          <button class="filter-btn" onclick="setFilter('security', this)">Security (8)</button>
          <button class="filter-btn" onclick="setFilter('compat', this)">Compatibility (4)</button>
          <button class="filter-btn" onclick="setFilter('perf', this)">Performance (4)</button>
        </div>

        <div class="defect-list" id="defectList">
          <div class="defect-card" data-cat="blocker functional">
            <div class="defect-header">
              <div class="defect-id-title"><span class="badge badge-blocker">Blocker</span> BUG-FUNC-09: Missing Platform import completely breaks Login</div>
              <span class="defect-meta">src/screens/LoginScreen/index.js:51</span>
            </div>
            <div class="defect-section"><strong>User Impact:</strong> 100% of login attempts fail with <em>"You must allow location permission on this app to login"</em>.</div>
            <div class="defect-section"><strong>Technical Cause:</strong> <code>Platform.OS === 'android'</code> is called without importing <code>Platform</code> from <code>react-native</code>, triggering an uncaught <code>ReferenceError</code>.</div>
            <div class="code-box">// Remedy: Add Platform to react-native imports in LoginScreen/index.js\nimport { View, Text, TextInput, TouchableOpacity, PermissionsAndroid, Platform, ... } from 'react-native';</div>
          </div>

          <div class="defect-card" data-cat="blocker functional">
            <div class="defect-header">
              <div class="defect-id-title"><span class="badge badge-critical">Critical</span> BUG-FUNC-21: Missing Platform import crashes app on Group Invitation</div>
              <span class="defect-meta">src/screens/GroupHomeScreen/index.js:102</span>
            </div>
            <div class="defect-section"><strong>User Impact:</strong> When an invited user (e.g. Darth Vader) logs in, the app abruptly crashes upon opening Home.</div>
            <div class="defect-section"><strong>Technical Cause:</strong> <code>sendPushNotification()</code> evaluates <code>Platform.OS === 'ios'</code> without importing <code>Platform</code>.</div>
            <div class="code-box">// Remedy: Add Platform import in GroupHomeScreen/index.js\nimport { View, Text, FlatList, Image, TouchableOpacity, Platform } from 'react-native';</div>
          </div>

          <div class="defect-card" data-cat="blocker security">
            <div class="defect-header">
              <div class="defect-id-title"><span class="badge badge-critical">Critical</span> BUG-SEC-01: Plaintext password storage and comparison in MMKV</div>
              <span class="defect-meta">src/utils/Storages.js:3 & apiServices.js:25</span>
            </div>
            <div class="defect-section"><strong>User Impact:</strong> Full credential theft: Passwords are saved in unencrypted plaintext in local storage.</div>
            <div class="defect-section"><strong>Technical Cause:</strong> <code>new MMKV()</code> has no encryption key; login validates via raw <code>===</code> equality.</div>
            <div class="code-box">// Remedy: Hash passwords and pass encryptionKey from Keystore to MMKV:\nexport const storage = new MMKV({ id: 'starwars-secure', encryptionKey: secureKeyFromKeychain });</div>
          </div>

          <div class="defect-card" data-cat="functional">
            <div class="defect-header">
              <div class="defect-id-title"><span class="badge badge-high">High</span> BUG-FUNC-13: SwapiScreen server-side ?search= query ignored by swapi.info</div>
              <span class="defect-meta">src/screens/SwapiScreen/index.js:26</span>
            </div>
            <div class="defect-section"><strong>User Impact:</strong> Searching for "vader" or "falcon" does not filter results; all 82 characters are displayed.</div>
            <div class="defect-section"><strong>Technical Cause:</strong> <code>https://swapi.info/api/people/?search=vader</code> ignores query strings and returns the static array.</div>
            <div class="code-box">// Remedy: Filter array client-side in JavaScript:\nconst filtered = allSwapiData.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));</div>
          </div>

          <div class="defect-card" data-cat="functional">
            <div class="defect-header">
              <div class="defect-id-title"><span class="badge badge-high">High</span> BUG-FUNC-06: Missing image library / photo gallery upload option</div>
              <span class="defect-meta">src/screens/RegisterScreen/index.js:195</span>
            </div>
            <div class="defect-section"><strong>User Impact:</strong> Users cannot choose an existing photo from their gallery (violating Requirement #2).</div>
            <div class="defect-section"><strong>Technical Cause:</strong> Only <code>react-native-vision-camera</code> is implemented; no gallery picker exists.</div>
            <div class="code-box">// Remedy: Install react-native-image-picker and provide action sheet:\nimport { launchImageLibrary } from 'react-native-image-picker';</div>
          </div>

          <div class="defect-card" data-cat="compat">
            <div class="defect-header">
              <div class="defect-id-title"><span class="badge badge-high">High</span> BUG-COMP-01: Frozen Dimensions.get('window') breaks Landscape & Tablets</div>
              <span class="defect-meta">src/utils/GlobalConfig.js:15-20</span>
            </div>
            <div class="defect-section"><strong>User Impact:</strong> Rotating device to landscape clips forms, freezes camera box, and distorts UI.</div>
            <div class="defect-section"><strong>Technical Cause:</strong> Dimensions are frozen at boot via <code>Object.freeze(Metrics)</code>.</div>
            <div class="code-box">// Remedy: Adopt React Native responsive hook in components:\nconst { width, height } = useWindowDimensions();</div>
          </div>

          <div class="defect-card" data-cat="security">
            <div class="defect-header">
              <div class="defect-id-title"><span class="badge badge-critical">Critical</span> BUG-SEC-07: Unjoined invitees can view member GPS coordinates</div>
              <span class="defect-meta">GroupDetailScreen/index.js:141-146</span>
            </div>
            <div class="defect-section"><strong>User Impact:</strong> Privacy leak: An unjoined invitee can see exact GPS locations of all group members before accepting.</div>
            <div class="defect-section"><strong>Technical Cause:</strong> <code>fetchGroupDetailDataRequest</code> returns all members' latitude/longitude regardless of viewer join status.</div>
            <div class="code-box">// Remedy: Strip lastLocation coordinates from response unless viewer has isJoined === true.</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    function switchTab(tabId) {
      document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
      document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
      
      const target = document.getElementById('tab-' + tabId);
      const btn = document.getElementById('tab-btn-' + tabId);
      if (target) target.style.display = 'block';
      if (btn) btn.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function setFilter(category, button) {
      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const cards = document.querySelectorAll('.defect-card');
      cards.forEach(card => {
        const cats = card.getAttribute('data-cat') || '';
        if (category === 'all' || cats.includes(category)) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    }

    function filterDefects() {
      const q = document.getElementById('defectSearch').value.toLowerCase();
      const cards = document.querySelectorAll('.defect-card');
      cards.forEach(card => {
        const text = card.innerText.toLowerCase();
        card.style.display = text.includes(q) ? 'block' : 'none';
      });
    }
  </script>
</body>
</html>
`;

fs.writeFileSync(outPath, htmlContent, 'utf8');
console.log('Successfully updated HTML dashboard with full Test Cases matrix at ' + outPath);
