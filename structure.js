const fs = require('fs');
const path = require('path');

const output = [];
const indentChar = '    ';

function walk(dir, prefix = '') {
  const items = fs.readdirSync(dir).filter(item => item !== 'node_modules');
  items.sort(); // Optional: sort alphabetically

  items.forEach((item, index) => {
    const fullPath = path.join(dir, item);
    const isLast = index === items.length - 1;
    const stats = fs.statSync(fullPath);

    const connector = isLast ? '\\---' : '+---';
    output.push(`${prefix}${connector}${item}`);

    if (stats.isDirectory()) {
      walk(fullPath, prefix + (isLast ? indentChar : '|   '));
    }
  });
}

// Start from the current directory
output.push('Folder PATH listing');
output.push(`Volume serial number is 0804-0E02`);
output.push('C:.');
walk(process.cwd());

// Save to file
fs.writeFileSync('structure.txt', output.join('\n'), 'utf8');
console.log('📁 Project structure saved to structure.txt (excluding node_modules)');
