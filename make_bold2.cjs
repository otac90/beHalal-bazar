const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace all font-serif with font-serif font-bold
  content = content.replace(/font-serif/g, 'font-serif font-bold');
  
  // Fix double bolds that might have been created
  content = content.replace(/font-bold font-bold/g, 'font-bold');
  content = content.replace(/font-bold font-semibold/g, 'font-bold');
  content = content.replace(/font-semibold font-bold/g, 'font-bold');
  
  fs.writeFileSync(file, content);
});
console.log('Done replacing font-serif with font-serif font-bold');
