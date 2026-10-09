const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(f => {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      if (!['node_modules', '.next', '.git'].includes(f)) {
        results = results.concat(walk(full));
      }
    } else if (/\.(tsx|ts)$/.test(f)) {
      results.push(full);
    }
  });
  return results;
}

// Patterns indicating corrupted text (not inside HTML attribute strings)
const PATTERNS = [
  { regex: /Y"(?!\s*[a-z=])/g,   label: 'Y" (broken camera emoji)' },
  { regex: /Tlphone/g,            label: 'Tlphone (Téléphone manquant accent)' },
  { regex: /d\u01f8posez/g,       label: 'Glissez-dǸposez (broken é)' },
  { regex: /Glissez-d[^é]/g,     label: 'Glissez-d without é' },
  { regex: /Ã©|Ã¨|Ã |Ã¢|Ã§|Ã®|Ã´|Ã»|Ã¹|Å|ÃŠ/g,  label: 'Latin-1 mojibake' },
  { regex: /Ù\w|Ø\w|Ú\w/g,       label: 'Arabic mojibake' },
];

const files = walk('src');
let totalIssues = 0;

files.forEach(f => {
  try {
    const content = fs.readFileSync(f, 'utf8');
    const fileIssues = [];
    
    PATTERNS.forEach(({ regex, label }) => {
      const found = [...content.matchAll(regex)];
      if (found.length > 0) {
        found.forEach(match => {
          const lineNum = content.slice(0, match.index).split('\n').length;
          const line = content.split('\n')[lineNum - 1].trim();
          fileIssues.push(`  Line ${lineNum}: [${label}] → ${line.slice(0, 80)}`);
        });
      }
    });
    
    if (fileIssues.length > 0) {
      totalIssues += fileIssues.length;
      console.log(`\n❌ ${f.replace(/\\/g, '/')}`);
      fileIssues.forEach(i => console.log(i));
    }
  } catch (e) {}
});

if (totalIssues === 0) {
  console.log('✅ No corrupted text found! All files are clean.');
} else {
  console.log(`\n⚠️  Total: ${totalIssues} issue(s) found.`);
}
