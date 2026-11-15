import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mdPath = path.resolve(__dirname, '..', 'QA_TEST_REPORT.md');
const htmlPath = path.resolve(__dirname, '..', 'QA_TEST_REPORT.html');
const content = fs.readFileSync(mdPath, 'utf8');

// Escaping
let html = content
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

// Code blocks
html = html.replace(/```([a-z0-9_-]*)\r?\n([\s\S]*?)```/g, (m, lang, code) => `<pre><code class="${lang}">${code}</code></pre>`);

// Inline code
html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

// Headings
html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

// Bold & Italic
html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

// Horizontal rule
html = html.replace(/^---$/gim, '<hr/>');

// Table parsing
const lines = html.split(/\r?\n/);
let inTable = false;
const tableHtml = [];
const finalLines = [];

for (const line of lines) {
  const trimmed = line.trim();
  if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
    if (!inTable) {
      inTable = true;
      tableHtml.push('<table>');
    }
    const cells = trimmed.slice(1, -1).split('|').map((c) => c.trim());
    if (cells.every((c) => /^:?-+:?$/.test(c))) {
      continue;
    }
    const tag = tableHtml.length === 1 ? 'th' : 'td';
    tableHtml.push('<tr>' + cells.map((c) => `<${tag}>${c}</${tag}>`).join('') + '</tr>');
  } else {
    if (inTable) {
      tableHtml.push('</table>');
      finalLines.push(tableHtml.join('\n'));
      tableHtml.length = 0;
      inTable = false;
    }
    finalLines.push(line);
  }
}
if (inTable) {
  tableHtml.push('</table>');
  finalLines.push(tableHtml.join('\n'));
}

const styledHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>QA Test Report — StarWarsApp</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; line-height: 1.6; color: #24292e; max-width: 980px; margin: 40px auto; padding: 0 24px; background: #fafbfc; }
  .container { background: #ffffff; padding: 48px; border: 1px solid #e1e4e8; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
  h1 { border-bottom: 2px solid #eaecef; padding-bottom: 12px; color: #0366d6; }
  h2 { border-bottom: 1px solid #eaecef; padding-bottom: 8px; margin-top: 32px; color: #1b1f23; }
  h3 { margin-top: 24px; color: #24292e; }
  table { border-collapse: collapse; width: 100%; margin: 20px 0; font-size: 13px; }
  th, td { border: 1px solid #dfe2e5; padding: 10px 12px; text-align: left; vertical-align: top; }
  th { background-color: #f6f8fa; font-weight: 600; }
  tr:nth-child(even) { background-color: #fafbfc; }
  code { background-color: rgba(27,31,35,0.06); padding: 2px 6px; border-radius: 4px; font-family: Consolas, monospace; font-size: 85%; }
  pre { background-color: #f6f8fa; padding: 16px; border-radius: 6px; overflow-x: auto; font-size: 13px; line-height: 1.45; border: 1px solid #e1e4e8; }
  pre code { background: none; padding: 0; }
  hr { height: 1px; background-color: #e1e4e8; border: none; margin: 32px 0; }
  @media print { body { background: white; margin: 0; padding: 0; } .container { border: none; padding: 0; box-shadow: none; } }
</style>
</head>
<body>
<div class="container">
${finalLines.join('\n')}
</div>
</body>
</html>`;

fs.writeFileSync(htmlPath, styledHtml);
console.log('HTML report created successfully at ' + htmlPath);
