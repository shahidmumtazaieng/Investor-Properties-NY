const fs = require('fs');

// Read the file
let content = fs.readFileSync('admin-routes.ts', 'utf8');

// Split into lines
let lines = content.split('\n');

// Remove the problematic lines (1533, 1534, 1535 are the problematic ones)
// Since arrays are 0-indexed, these are lines 1532, 1533, 1534
const problemLines = [1532, 1533, 1534];
const newLines = lines.filter((line, index) => !problemLines.includes(index));

// Write back to file
fs.writeFileSync('admin-routes.ts', newLines.join('\n'));

console.log('Fixed syntax errors in admin-routes.ts');