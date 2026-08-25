const fs = require('fs');

let code = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');

// The user wants category icons in the hero section.
// Also we need to import dynamically or just use an icon map.
// The categories from the context contain an `icon` string, which matches lucide icons. We can create an Icon component.
const iconMapStr = `
const renderIcon = (iconName: string, className: string) => {
  // A simple mapping since we can't do dynamic imports easily in React without Suspense
  // We'll just map a few common ones based on standard categories.
  // Or we can import them from lucide-react at the top.
};
`;
// Let's just use an icon if it's easy. Actually, we can just replace the 01, 02 number with the icon if we use a mapping. But wait, `c.icon` stores the Lucide icon name (like 'Car', 'Sofa').
// Let's import a bunch of icons.
const importsRegex = /import \{\s*([\s\S]*?)\s*\} from 'lucide-react';/;
code = code.replace(importsRegex, `import {\n  Search, SlidersHorizontal, ArrowRight, X, Gift,\n  Car, Smartphone, Sofa, Shirt, Baby, Grid, Briefcase, Book, Heart, Package, Home\n} from 'lucide-react';`);

const renderIconCode = `
const CategoryIcon = ({ iconName, className }: { iconName: string, className: string }) => {
  switch (iconName) {
    case 'Car': return <Car className={className} />;
    case 'Smartphone': return <Smartphone className={className} />;
    case 'Sofa': return <Sofa className={className} />;
    case 'Shirt': return <Shirt className={className} />;
    case 'Baby': return <Baby className={className} />;
    case 'Briefcase': return <Briefcase className={className} />;
    case 'Book': return <Book className={className} />;
    case 'Home': return <Home className={className} />;
    default: return <Grid className={className} />;
  }
};
`;

code = code.replace(/export const HomePage: React\.FC = \(\) => \{/, `${renderIconCode}\nexport const HomePage: React.FC = () => {`);

// Now replace the 01, 02 with icons
const categoryMapRegex = /<span className=\{`text-\[10px\] sm:text-xs font-bold tracking-widest uppercase \$\{isActive \? 'text-\[#123D2A\]\/70' : 'text-\[#F4C430\]'\}`\}>\s*\{String\(idx \+ 1\)\.padStart\(2, '0'\)\}\s*<\/span>/;
code = code.replace(categoryMapRegex, `
                  <div className="flex justify-between items-start w-full">
                    <span className={\`text-[10px] sm:text-xs font-bold tracking-widest uppercase \${isActive ? 'text-[#123D2A]/70' : 'text-[#F4C430]'}\`}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <CategoryIcon iconName={c.icon} className={\`w-5 h-5 \${isActive ? 'text-[#123D2A]' : 'text-[#F5F1E8]/50 group-hover:text-[#F4C430]'}\`} />
                  </div>
`);

// Also for Sadaqah tag
const freeCategoryRegex = /<span className=\{`text-\[10px\] sm:text-xs font-bold tracking-widest uppercase \$\{\(!selectedCategory && selectedType === 'FREE'\) \? 'text-\[#123D2A\]\/70' : 'text-\[#F4C430\]'\}`\}>00<\/span>/;
code = code.replace(freeCategoryRegex, `
              <div className="flex justify-between items-start w-full">
                <span className={\`text-[10px] sm:text-xs font-bold tracking-widest uppercase \${(!selectedCategory && selectedType === 'FREE') ? 'text-[#123D2A]/70' : 'text-[#F4C430]'}\`}>00</span>
                <Gift className={\`w-5 h-5 \${(!selectedCategory && selectedType === 'FREE') ? 'text-[#123D2A]' : 'text-[#F5F1E8]/50 group-hover:text-[#F4C430]'}\`} />
              </div>
`);

fs.writeFileSync('src/pages/HomePage.tsx', code);
console.log('HomePage updated with icons');
