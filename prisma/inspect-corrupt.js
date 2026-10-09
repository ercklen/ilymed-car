const fs = require('fs');
const filePath = 'src/app/[locale]/(admin)/admin/vehicles/[id]/edit/EditVehicleClient.tsx';
const content = fs.readFileSync(filePath, 'utf8');

// Check what bytes appear at position before "o"" occurrences
let idx = 0;
let count = 0;
while ((idx = content.indexOf('o"', idx)) !== -1 && count < 10) {
  const start = Math.max(0, idx - 5);
  const end = Math.min(content.length, idx + 20);
  const snippet = content.slice(start, end);
  const bytes = Buffer.from(snippet).toString('hex');
  const lineNum = content.slice(0, idx).split('\n').length;
  console.log(`Line ${lineNum}: [${snippet.replace(/\n/g,'\\n')}]`);
  console.log(`Hex: ${bytes}`);
  idx += 2;
  count++;
}
if (count === 0) console.log('No o" found with standard quotes');

// Also check for smart quotes o\u201d
idx = 0; count = 0;
while ((idx = content.indexOf('o\u201d', idx)) !== -1 && count < 10) {
  const lineNum = content.slice(0, idx).split('\n').length;
  const snip = content.slice(Math.max(0, idx-10), idx+30).replace(/\n/g,'\\n');
  console.log(`Smart-quote at line ${lineNum}: [${snip}]`);
  idx += 2;
  count++;
}
