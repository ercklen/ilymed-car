const fs = require('fs');
const filePath = 'src/app/[locale]/(admin)/admin/vehicles/[id]/edit/EditVehicleClient.tsx';
const content = fs.readFileSync(filePath, 'utf8');

// The scan-corruption.js found o" (checkmark) pattern
// Let's look for the actual pattern: literal string 'o"' followed by space
// This is the ✅ emoji corruption: ✅ = \u2705 was corrupted to o" 
// Let's check all lines for that specific 2-char sequence 0x6f 0x22

const lines = content.split('\n');
lines.forEach((line, i) => {
  // Check each character
  for (let j = 0; j < line.length - 1; j++) {
    if (line.charCodeAt(j) === 0x6f && line.charCodeAt(j+1) === 0x22) {
      // Make sure it's not inside proper code like "type=\"radio\""  
      const context = line.slice(Math.max(0, j-15), j+20);
      if (!context.includes('type=') && !context.includes('name=') && !context.includes('value=') && !context.includes('className=')) {
        console.log(`Line ${i+1}: ${line.trim()}`);
      }
    }
  }
});
