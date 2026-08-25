const fs = require('fs');

let code = fs.readFileSync('src/components/marketplace/ListingDetailView.tsx', 'utf8');

const keyboardEffect = `
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullscreen || !images || images.length <= 1) return;
      if (e.key === 'ArrowLeft') {
        setActiveImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
      } else if (e.key === 'ArrowRight') {
        setActiveImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
      } else if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, images]);
`;

code = code.replace(/useEffect\(\(\) => \{\n    if \(listingId\) \{/, `${keyboardEffect}\n\n  useEffect(() => {\n    if (listingId) {`);

fs.writeFileSync('src/components/marketplace/ListingDetailView.tsx', code);
console.log('Added keyboard support');
