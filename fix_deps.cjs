const fs = require('fs');
let code = fs.readFileSync('src/components/marketplace/ListingDetailView.tsx', 'utf8');

// find dateLogic and images
const match = code.match(/(const createdAtDate = [\s\S]*?const images = [\s\S]*?\}];)/);
if (match) {
  const block = match[1];
  code = code.replace(block, ''); // remove from current location
  // put it right before the first useEffect
  code = code.replace(/useEffect\(\(\) => \{/, `${block}\n\n  useEffect(() => {`);
}

fs.writeFileSync('src/components/marketplace/ListingDetailView.tsx', code);
