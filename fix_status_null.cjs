const fs = require('fs');
let code = fs.readFileSync('src/components/marketplace/ListingDetailView.tsx', 'utf8');

code = code.replace(
  /const \[currentStatus, setCurrentStatus\] = useState\(listing\.status\);/,
  `const [currentStatus, setCurrentStatus] = useState(listing?.status);`
);

code = code.replace(
  /setListing\(found\);/,
  `setListing(found);\n        setCurrentStatus(found.status);`
);

fs.writeFileSync('src/components/marketplace/ListingDetailView.tsx', code);
console.log('Fixed');
