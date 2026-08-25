const fs = require('fs');

let code = fs.readFileSync('src/components/marketplace/ListingDetailView.tsx', 'utf8');

// Add motion and AnimatePresence
if (!code.includes("import { motion, AnimatePresence }")) {
  code = code.replace(/import React, \{ useState, useEffect \} from 'react';/, `import React, { useState, useEffect } from 'react';\nimport { motion, AnimatePresence } from 'motion/react';`);
}

// Add X to lucide-react imports
if (!code.includes("X,")) {
  code = code.replace(/Heart, Share2,/, `Heart, Share2, X,`);
}

// Ensure ChevronLeft and ChevronRight are imported
if (!code.includes("ChevronLeft")) {
  code = code.replace(/Eye/, `Eye, ChevronLeft, ChevronRight`);
}

// Fix JSX issues (e.g. nested tags or typo in `<motion.div>` `<motion.img>`)
// Actually, earlier the error was "Cannot find name 'AnimatePresence'". This means standard JSX was fine.

fs.writeFileSync('src/components/marketplace/ListingDetailView.tsx', code);
