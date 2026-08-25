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
  if (content.includes('font-serif') && !content.includes('font-serif font-bold')) {
    // replace `font-serif` with `font-serif font-bold` unless `font-bold` or `font-semibold` or `font-extrabold` is already in the class string
    // This regex looks for font-serif, and we just replace it. We can blindly replace font-serif with font-serif font-bold, 
    // and then clean up duplicates like font-bold font-bold.
    content = content.replace(/font-serif(?! font-bold)/g, 'font-serif font-bold');
    
    // clean up any accidental double bold
    content = content.replace(/font-bold font-bold/g, 'font-bold');
    content = content.replace(/font-bold font-semibold/g, 'font-bold');
    content = content.replace(/font-semibold font-bold/g, 'font-bold');
    
    fs.writeFileSync(file, content);
  }
});
console.log('Done replacing font-serif with font-serif font-bold');
