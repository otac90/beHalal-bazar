const fs = require('fs');

const replaceInFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/BE HALAL/g, 'ONLINE BAZAR');
  content = content.replace(/Be Halal/g, 'Online Bazar');
  content = content.replace(/be halal/g, 'online bazar');
  fs.writeFileSync(filePath, content);
};

const files = [
  'src/components/marketplace/ReportDialog.tsx',
  'src/components/layout/MarketplaceHeader.tsx',
  'src/components/layout/Footer.tsx',
  'src/components/wizard/ListingWizard.tsx',
  'src/services/mockData.ts',
  'src/pages/AccountPage.tsx',
  'src/pages/AuthPage.tsx',
  'src/pages/AdminModerationPage.tsx',
];

files.forEach(replaceInFile);
console.log('Replaced in all files');
