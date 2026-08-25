const fs = require('fs');
let code = fs.readFileSync('src/components/marketplace/ListingDetailView.tsx', 'utf8');

const importsAdd = `
import { ChevronLeft, ChevronRight } from 'lucide-react';
`;

code = code.replace(/import \{ motion \} from 'motion\/react';/, `import { motion, AnimatePresence } from 'motion/react';\n${importsAdd}`);

const stateAdd = `
  const [isFullscreen, setIsFullscreen] = useState(false);
`;
code = code.replace(/const \[currentStatus, setCurrentStatus\] = useState\(listing\?\.status\);/, `const [currentStatus, setCurrentStatus] = useState(listing?.status);\n${stateAdd}`);


const galleryCode = `
      {/* FULLSCREEN GALLERY */}
      <AnimatePresence>
        {isFullscreen && images && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#111511]/95 backdrop-blur-md"
          >
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-none text-white transition-colors z-50"
            >
              <X className="w-8 h-8" />
            </button>
            
            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
                }}
                className="absolute left-6 p-4 bg-white/10 hover:bg-white/20 text-[#F4C430] transition-colors z-50"
              >
                <ChevronLeft className="w-10 h-10" />
              </button>
            )}

            <motion.img
              key={activeImageIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              src={images[activeImageIndex].url}
              className="max-w-full max-h-full object-contain p-4"
              alt="Fullscreen"
            />

            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
                }}
                className="absolute right-6 p-4 bg-white/10 hover:bg-white/20 text-[#F4C430] transition-colors z-50"
              >
                <ChevronRight className="w-10 h-10" />
              </button>
            )}

            {images.length > 1 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/50 px-6 py-3">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setActiveImageIndex(idx); }}
                    className={\`w-2 h-2 transition-all \${activeImageIndex === idx ? 'w-8 bg-[#F4C430]' : 'bg-white/50 hover:bg-white'}\`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
`;

code = code.replace(/\{listing\.seller && \(/, `${galleryCode}\n      {listing.seller && (`);

// add onClick to the main image
code = code.replace(/<img\s+src=\{images\[activeImageIndex\]\.url\}\s+alt=\{listing\.title\}/, `<img\n                    onClick={() => setIsFullscreen(true)}\n                    className="cursor-pointer object-cover w-full h-full"\n                    src={images[activeImageIndex].url}\n                    alt={listing.title}`);

fs.writeFileSync('src/components/marketplace/ListingDetailView.tsx', code);
console.log('Added fullscreen gallery');
