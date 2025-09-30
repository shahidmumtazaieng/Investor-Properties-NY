const fs = require('fs');

// Read the file
let content = fs.readFileSync('admin-routes.ts', 'utf8');

// Split into lines
let lines = content.split('\n');

// Remove the problematic line (1532 is the problematic one)
// Since arrays are 0-indexed, this is line 1531
const problemLine = 1531;
const newLines = lines.filter((line, index) => index !== problemLine);

// Write back to file
fs.writeFileSync('admin-routes.ts', newLines.join('\n'));

console.log('Fixed remaining syntax error in admin-routes.ts');