import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const suites = [
  { id: 'functional', name: 'Functional & Logic Checks', file: 'scripts/01-functional-logic-checks.mjs' },
  { id: 'i18n', name: 'I18n & L10n Checks', file: 'scripts/02-i18n-l10n-checks.mjs' },
  { id: 'swapi', name: 'Live SWAPI Integration Checks', file: 'scripts/03-swapi-live-api-checks.mjs' },
  { id: 'compatPerf', name: 'Compatibility & Performance Audit', file: 'scripts/04-compatibility-performance-audit.mjs' },
  { id: 'security', name: 'Security & Authorization Audit', file: 'scripts/05-security-static-audit.mjs' },
];

const rootDir = path.resolve(__dirname, '..');
const summary = [];

for (const suite of suites) {
  console.log(`\n=== Running ${suite.name} (${suite.file}) ===`);
  const res = spawnSync(process.execPath, ['--test', suite.file], {
    cwd: rootDir,
    encoding: 'utf8',
    env: process.env,
  });

  const combined = `${res.stdout || ''}\n${res.stderr || ''}`;
  process.stdout.write(combined);

  const testsMatch = combined.match(/ℹ tests (\d+)/);
  const passMatch = combined.match(/ℹ pass (\d+)/);
  const failMatch = combined.match(/ℹ fail (\d+)/);

  summary.push({
    suite: suite.name,
    file: suite.file,
    exitCode: res.status,
    tests: testsMatch ? Number(testsMatch[1]) : 0,
    passed: passMatch ? Number(passMatch[1]) : 0,
    failed: failMatch ? Number(failMatch[1]) : 0,
  });
}

console.log('\n==================== QA SUITE SUMMARY ====================');
let totalTests = 0;
let totalPassed = 0;
let totalFailed = 0;

for (const row of summary) {
  totalTests += row.tests;
  totalPassed += row.passed;
  totalFailed += row.failed;
  console.log(
    `${row.suite.padEnd(36)} | Total: ${String(row.tests).padStart(2)} | Pass: ${String(row.passed).padStart(2)} | Fail (Defects): ${String(row.failed).padStart(2)}`
  );
}
console.log('----------------------------------------------------------');
console.log(
  `${'TOTAL'.padEnd(36)} | Total: ${String(totalTests).padStart(2)} | Pass: ${String(totalPassed).padStart(2)} | Fail (Defects): ${String(totalFailed).padStart(2)}`
);

const outFile = path.join(rootDir, 'qa-summary.json');
fs.writeFileSync(
  outFile,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      totals: { totalTests, totalPassed, totalFailed },
      suites: summary,
    },
    null,
    2
  )
);
console.log(`\nSaved JSON summary to ${outFile}`);
