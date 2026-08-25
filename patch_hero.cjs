const fs = require('fs');
let code = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');

const startIdx = code.indexOf('<section className="pt-12 pb-16 md:pt-20 md:pb-24');
const endIdx = code.indexOf('</section>', startIdx) + '</section>'.length;

const newSection = `<section className="pt-12 pb-16 md:pt-20 md:pb-24 bg-[#123D2A] dark:bg-[#111511]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-end">
            <div className="md:col-span-8 lg:col-span-9 max-w-4xl">
              <div className="w-12 h-1 bg-[#F4C430] mb-6"></div>
              <h1 className="text-[3rem] sm:text-[4rem] md:text-[5rem] lg:text-[6rem] leading-[0.95] font-serif text-[#F5F1E8] tracking-tight">
                {t.heroSearchTitle}
              </h1>
            </div>
            <div className="md:col-span-4 lg:col-span-3 pb-2 md:pb-4">
              <p className="text-base md:text-lg text-[#F5F1E8]/80 font-medium">
                {t.heroSearchSubtitle}
              </p>
            </div>
          </div>

          {/* EDITORIAL CATEGORY GRID */}
          <div className="mt-16 md:mt-20 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedType('FREE');
              }}
              className={\`group flex flex-col justify-between p-4 sm:p-5 h-28 sm:h-32 text-left transition-all \${
                (!selectedCategory && selectedType === 'FREE')
                  ? 'bg-[#F4C430] text-[#123D2A] border border-[#F4C430]'
                  : 'bg-transparent border border-[#F5F1E8]/20 text-[#F5F1E8] hover:border-[#F4C430] hover:bg-white/5'
              }\`}
            >
              <span className={\`text-[10px] sm:text-xs font-bold tracking-widest uppercase \${(!selectedCategory && selectedType === 'FREE') ? 'text-[#123D2A]/70' : 'text-[#F4C430]'}\`}>00</span>
              <span className="text-xl sm:text-2xl font-serif">
                {t.sadaqahTag}
              </span>
            </button>

            {categories.slice(0, 9).map((c, idx) => {
              const isActive = selectedCategory === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={\`group flex flex-col justify-between p-4 sm:p-5 h-28 sm:h-32 text-left transition-all \${
                    isActive
                      ? 'bg-[#F4C430] text-[#123D2A] border border-[#F4C430]'
                      : 'bg-transparent border border-[#F5F1E8]/20 text-[#F5F1E8] hover:border-[#F4C430] hover:bg-white/5'
                  }\`}
                >
                  <span className={\`text-[10px] sm:text-xs font-bold tracking-widest uppercase \${isActive ? 'text-[#123D2A]/70' : 'text-[#F4C430]'}\`}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="text-xl sm:text-2xl font-serif">
                    {c.name[language]}
                  </span>
                </button>
              );
            })}

          </div>
        </div>
      </section>`;

code = code.substring(0, startIdx) + newSection + code.substring(endIdx);
fs.writeFileSync('src/pages/HomePage.tsx', code);
console.log('Hero section replaced successfully.');
