const fs = require('fs');

let code = fs.readFileSync('src/components/marketplace/ListingDetailView.tsx', 'utf8');

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

code = code.replace(
  /\{\/\* SELLER & SAFETY \(We will restyle them to be flat, but they use their own components\. For now, leave them as is, they will just sit below the button\) \*\/\}/,
  rightColumnTitlePrice + '\n              {/* SELLER & SAFETY */}'
);

fs.writeFileSync('src/components/marketplace/ListingDetailView.tsx', code);
console.log('Fixed');
