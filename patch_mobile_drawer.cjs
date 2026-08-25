const fs = require('fs');
let code = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');

const target = `          {/* MOBILE DRAWER */}
          {mobileFilterOpen && (
            <div className="fixed inset-0 z-50 flex lg:hidden bg-black/60 backdrop-blur-sm">
              <div className="w-4/5 max-w-sm bg-[#F5F1E8] dark:bg-[#111511] h-full p-6 overflow-y-auto flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#123D2A]/10 dark:border-white/10">
                    <h3 className="font-serif text-2xl text-[#123D2A] dark:text-white">Filter</h3>
                    <button onClick={() => setMobileFilterOpen(false)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                      <X className="w-6 h-6" />
                    </button>
                  </div>`;

const replacement = `          {/* MOBILE DRAWER */}
          {mobileFilterOpen && (
            <div className="fixed inset-0 z-50 flex lg:hidden bg-[#F5F1E8] dark:bg-[#111511]">
              <div className="w-full h-full p-6 overflow-y-auto flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#123D2A]/10 dark:border-white/10">
                    <h3 className="font-serif text-2xl text-[#123D2A] dark:text-white">Filter</h3>
                    <button onClick={() => setMobileFilterOpen(false)} className="p-2 -mr-2 text-gray-500 hover:text-[#123D2A] dark:hover:text-[#F4C430] transition-colors">
                      <X className="w-6 h-6" />
                    </button>
                  </div>`;

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/HomePage.tsx', code);
console.log('Mobile drawer updated');
