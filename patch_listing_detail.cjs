const fs = require('fs');

let code = fs.readFileSync('src/components/marketplace/ListingDetailView.tsx', 'utf8');

// Insert status updater logic
const handlerReplacement = `
  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Link zum Inserat in die Zwischenablage kopiert!', 'info');
  };

  const handleStatusChange = (newStatus: 'ACTIVE' | 'RESERVED' | 'SOLD') => {
    // Optimistic UI update by modifying the listing in storage (simulated here)
    listing.status = newStatus;
    // To make it react to state, we might need local state for listing or we just force reload.
    // Assuming storage updates it, we can just use a local state for the status to re-render.
  };
`;
// Let's add local state for status to ListingDetailView
// Find: const [activeImageIndex, setActiveImageIndex] = useState(0);
// Insert: const [currentStatus, setCurrentStatus] = useState(listing.status);

code = code.replace(
  /const \[activeImageIndex, setActiveImageIndex\] = useState\(0\);/,
  `const [activeImageIndex, setActiveImageIndex] = useState(0);\n  const [currentStatus, setCurrentStatus] = useState(listing.status);\n\n  const handleStatusChange = (newStatus: 'ACTIVE' | 'RESERVED' | 'SOLD') => {\n    setCurrentStatus(newStatus);\n    listing.status = newStatus;\n    // Typically we'd update this in the backend/storage here.\n    showToast('Status aktualisiert auf ' + newStatus, 'success');\n  };`
);

// We need to calculate days active, created at, updated at.
const dateLogic = `
  const createdAtDate = new Date(listing.createdAt);
  const updatedAtDate = new Date(listing.updatedAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - createdAtDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
`;

code = code.replace(
  /const images = listing.images.length > 0/,
  `${dateLogic}\n  const images = listing.images.length > 0`
);

// We replace `listing.status` with `currentStatus` in the JSX where needed.
code = code.replace(/listing\.status === 'RESERVED'/g, `currentStatus === 'RESERVED'`);
code = code.replace(/listing\.status === 'SOLD'/g, `currentStatus === 'SOLD'`);

// 2. Remove TITLE & PRICE from left column.
const titlePriceBlockRegex = /\{\/\* TITLE & PRICE \*\/\}([\s\S]*?)\{\/\* DESCRIPTION \*\/\}/;
const match = code.match(titlePriceBlockRegex);
const titlePriceBlock = match ? match[1] : '';
code = code.replace(titlePriceBlockRegex, `{/* DESCRIPTION */}`);

// We will recreate the Title & Price block to fit the right column.
const rightColumnTitlePrice = `
              {/* TITLE & PRICE TILE (Moved to right column) */}
              <div className="bg-[#F5F1E8] dark:bg-[#111511] p-6 border border-[#123D2A]/10 dark:border-white/10">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-[#123D2A] text-[#F4C430] uppercase tracking-widest">
                    {isWanted ? t.typeWanted : isFree ? t.typeFree : t.typeSell}
                  </span>
                  {currentStatus === 'RESERVED' && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-600 text-white uppercase tracking-widest">Reserviert</span>
                  )}
                  {currentStatus === 'SOLD' && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-[#171A17] text-white uppercase tracking-widest">Verkauft</span>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#123D2A] dark:text-white leading-[1.1] mb-4">
                  {listing.title}
                </h1>
                <div className="flex items-baseline gap-3">
                  {isFree ? (
                    <span className="text-3xl font-extrabold text-[#123D2A] dark:text-[#F4C430]">
                      {t.freePrice}
                    </span>
                  ) : isWanted ? (
                    <span className="text-3xl font-bold text-[#123D2A] dark:text-[#F4C430]">
                      {listing.maxBudget ? \`bis \${formatPrice(listing.maxBudget)}\` : 'VB'}
                    </span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold text-[#123D2A] dark:text-[#F4C430]">
                        {formatPrice(listing.price)}
                      </span>
                      {listing.negotiable && (
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">VB</span>
                      )}
                    </>
                  )}
                </div>
              </div>
`;

// Insert the Title & Price Tile between Action Button and Seller Info in the right column
const rightColumnRegex = /(\{\/\* PRIMARY ACTION BUTTON \*\/\}\s*<div>[\s\S]*?<\/div>\s*)(?=\{\/\* SELLER & SAFETY \*\/\})/;
code = code.replace(rightColumnRegex, `$1${rightColumnTitlePrice}`);


// 3. Add Owner Controls if isOwner (mark as reserved, sold, active)
const ownerControls = `
              {/* OWNER CONTROLS */}
              {isOwner && (
                <div className="bg-white dark:bg-[#161E18] p-5 border border-[#123D2A]/10 dark:border-white/10">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Inserat-Status verwalten</h4>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleStatusChange('ACTIVE')}
                      className={\`py-2.5 px-4 text-xs font-bold uppercase tracking-widest transition-colors \${currentStatus === 'ACTIVE' ? 'bg-[#123D2A] text-white' : 'bg-gray-100 dark:bg-white/5 text-[#123D2A] dark:text-white hover:bg-gray-200'}\`}
                    >
                      Aktiv
                    </button>
                    <button
                      onClick={() => handleStatusChange('RESERVED')}
                      className={\`py-2.5 px-4 text-xs font-bold uppercase tracking-widest transition-colors \${currentStatus === 'RESERVED' ? 'bg-amber-600 text-white' : 'bg-gray-100 dark:bg-white/5 text-[#123D2A] dark:text-white hover:bg-gray-200'}\`}
                    >
                      Als Reserviert markieren
                    </button>
                    <button
                      onClick={() => handleStatusChange('SOLD')}
                      className={\`py-2.5 px-4 text-xs font-bold uppercase tracking-widest transition-colors \${currentStatus === 'SOLD' ? 'bg-[#171A17] text-white' : 'bg-gray-100 dark:bg-white/5 text-[#123D2A] dark:text-white hover:bg-gray-200'}\`}
                    >
                      Als Verkauft markieren
                    </button>
                  </div>
                </div>
              )}
`;

// Insert owner controls right above Primary Action Button
const primaryActionBtnRegex = /\{\/\* PRIMARY ACTION BUTTON \*\/\}/;
code = code.replace(primaryActionBtnRegex, `${ownerControls}\n              {/* PRIMARY ACTION BUTTON */}`);

// 4. Add Dates into the Specifications Grid
const dateSpecs = `
              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Erstellt am</span>
                <span className="text-lg font-serif font-bold text-[#123D2A] dark:text-white">{formatDate(createdAtDate)}</span>
                <span className="block text-xs text-gray-500 mt-0.5">Vor {diffDays} {diffDays === 1 ? 'Tag' : 'Tagen'}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Zuletzt geändert</span>
                <span className="text-lg font-serif font-bold text-[#123D2A] dark:text-white">{formatDate(updatedAtDate)}</span>
              </div>
`;

const specsGridEndRegex = /(<div className="grid grid-cols-2 md:grid-cols-3 gap-8 py-8 border-y border-\[#123D2A\]\/10 dark:border-white\/10">[\s\S]*?)(<\/div>\s*\{\/\* COMMUNITY DISCLAIMER \(Plain text\) \*\/\})/;
code = code.replace(specsGridEndRegex, `$1${dateSpecs}$2`);


fs.writeFileSync('src/components/marketplace/ListingDetailView.tsx', code);
console.log('Listing Detail View patched successfully.');
