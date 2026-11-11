import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Resolve the root path of the StarWarsApp repository under test.
 */
export function getAppRoot() {
  const envPath = process.env.STARWARS_APP_DIR;
  if (envPath) {
    return path.resolve(envPath);
  }
  return path.resolve(__dirname, '..', '..', '..', 'StarWarsApp');
}

/**
 * Read a UTF-8 file relative to the StarWarsApp root.
 */
export function readAppFile(relativePath) {
  const fullPath = path.join(getAppRoot(), relativePath);
  return fs.readFileSync(fullPath, 'utf8');
}

/**
 * Check whether a file exists relative to the StarWarsApp root.
 */
export function appFileExists(relativePath) {
  return fs.existsSync(path.join(getAppRoot(), relativePath));
}

/**
 * Recursively collect files matching extensions under a relative directory.
 */
export function walkAppFiles(relativeDir, extensions = ['.js', '.jsx', '.ts', '.tsx']) {
  const startDir = path.join(getAppRoot(), relativeDir);
  const results = [];

  if (!fs.existsSync(startDir)) {
    return results;
  }

  function visit(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'Pods') {
          continue;
        }
        visit(fullPath);
      } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
        results.push({
          fullPath,
          relativePath: path.relative(getAppRoot(), fullPath).replace(/\\/g, '/'),
        });
      }
    }
  }

  visit(startDir);
  return results;
}

/**
 * Return 1-based line numbers matching a regex or string in file content.
 */
export function findLineMatches(content, matcher) {
  const lines = content.split(/\r?\n/);
  const matches = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const hit = typeof matcher === 'string' ? line.includes(matcher) : matcher.test(line);
    if (hit) {
      matches.push({ lineNumber: i + 1, line: line.trim() });
    }
  }
  return matches;
}

/**
 * Extract named imports from react-native in a JS/TS file.
 */
export function getReactNativeImports(content) {
  const importRegex = /import\s*\{([^}]+)\}\s*from\s*['"]react-native['"]/m;
  const match = content.match(importRegex);
  if (!match) return [];
  return match[1]
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}
