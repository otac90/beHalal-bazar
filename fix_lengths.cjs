const fs = require('fs');

let code = fs.readFileSync('src/components/marketplace/ListingDetailView.tsx', 'utf8');

code = code.replace(/\(listing\?\.images\?\.length \|\| 0\)/g, 'images.length');

// Re-apply correct logic in useEffect where `images` isn't accessible if we put it above or if it's fine
// Oh, `images` IS accessible in `useEffect` if `useEffect` is below `const images = ...`. 
// But wait, hooks must be called at top level.
// Let's move the `useEffect` down below the `const images = ...` declaration.

fs.writeFileSync('src/components/marketplace/ListingDetailView.tsx', code);
