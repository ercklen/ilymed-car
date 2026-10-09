const fs = require('fs');
const filePath = 'src/app/actions/admin.ts';

let content = fs.readFileSync(filePath, 'utf8');

// Fix the corrupted location fallback strings
// 'Non spÃ©cifiÃ©' → 'Non spécifié'
// The Ã© sequence is the Windows-1252 misread of UTF-8 bytes for é (0xC3 0xA9)
content = content.replace(/Non sp[\xc3\xc4][\xa9\xa8]cifi[\xc3\xc4][\xa9\xa8]/g, 'Non spécifié');
content = content.replace(/Non sp\u00c3\u00a9cifi\u00c3\u00a9/g, 'Non spécifié');
// Also handle the literal garbled string as it appears in the file
content = content.replace("'Non spÃ©cifiÃ©'", "'Non spécifié'");

// Fix corrupted Arabic 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯' → 'غير محدد'
content = content.replace("'ØºÙŠØ± Ù…Ø­Ø¯Ø¯'", "'غير محدد'");

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done! Reading back to verify...');

const verify = fs.readFileSync(filePath, 'utf8');
const lines = verify.split('\n');
[131, 132].forEach(n => {
  console.log(`Line ${n}: ${lines[n-1].trim()}`);
});
