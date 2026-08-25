const fs = require('fs');
let code = fs.readFileSync('src/components/marketplace/ListingDetailView.tsx', 'utf8');

// 1. Remove the full bleed header
const fullBleedStart = `{/* FULL BLEED IMAGE HEADER */}`;
const fullBleedEnd = `        {/* NAV / BREADCRUMB */}`;

const fullBleedBlock = code.substring(code.indexOf(fullBleedStart), code.indexOf(fullBleedEnd));
code = code.replace(fullBleedBlock, '');

// 2. Insert image gallery into lg:col-span-8
const imageGallerySnippet = `
            {/* IMAGE GALLERY */}
            <div className="space-y-4">
              <div className="w-full relative aspect-video bg-[#F5F1E8] dark:bg-[#111511] overflow-hidden border border-[#123D2A]/10 dark:border-white/10 group">
                <img
                  src={images[activeImageIndex]?.url}
                  alt={listing.title}
                  className="w-full h-full object-contain"
                />
                {images.length > 1 && (
                  <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                      className="p-3 bg-[#123D2A] text-[#F4C430] hover:bg-[#F4C430] hover:text-[#123D2A] transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                      className="p-3 bg-[#123D2A] text-[#F4C430] hover:bg-[#F4C430] hover:text-[#123D2A] transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                )}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-4 px-3 py-1 bg-[#123D2A] text-[#F4C430] text-[10px] font-bold tracking-widest">
                    {activeImageIndex + 1} / {images.length}
                  </div>
                )}
              </div>
              {/* THUMBNAILS */}
              {images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {images.map((img, idx) => (
                    <button
                      key={img.id || idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={\`relative w-20 h-20 shrink-0 border-2 transition-colors \${activeImageIndex === idx ? 'border-[#F4C430]' : 'border-transparent hover:border-[#123D2A]/30'}\`}
                    >
                      <img src={img.url} className="w-full h-full object-cover" alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* TITLE & PRICE */}`;

code = code.replace('{/* TITLE & PRICE */}', imageGallerySnippet);

// We need to also adjust top padding since we removed the full bleed header
code = code.replace(/<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 md:mt-16">/, '<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-16">');

fs.writeFileSync('src/components/marketplace/ListingDetailView.tsx', code);
console.log('Listing gallery updated');
