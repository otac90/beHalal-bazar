import React, { useState, useMemo } from 'react';
import { 
  Search, SlidersHorizontal, ArrowRight, X, Gift
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { storage } from '../services/storage';
import { ListingType, ListingCondition, DeliveryType } from '../types';
import { ListingGrid, SortOption } from '../components/marketplace/ListingGrid';
import { FilterSidebar } from '../components/marketplace/FilterSidebar';

export const HomePage: React.FC = () => {
  const { 
    categories, 
    selectedCategory, 
    selectedSubcategory, 
    setSelectedCategory, 
    searchQuery, 
    setSearchQuery, 
    language, 
    t 
  } = useApp();

  // Filter States
  const [selectedType, setSelectedType] = useState<ListingType | 'ALL'>('ALL');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [onlyFree, setOnlyFree] = useState(false);
  const [selectedConditions, setSelectedConditions] = useState<ListingCondition[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryType | 'ALL'>('ALL');
  const [cityFilter, setCityFilter] = useState('');
  const [radiusKm, setRadiusKm] = useState(25);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Read all listings
  const allListings = storage.getListings();

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedType !== 'ALL') count++;
    if (minPrice) count++;
    if (maxPrice) count++;
    if (onlyFree) count++;
    if (selectedConditions.length > 0) count += selectedConditions.length;
    if (selectedDelivery !== 'ALL') count++;
    if (cityFilter) count++;
    if (selectedCategory) count++;
    return count;
  }, [selectedType, minPrice, maxPrice, onlyFree, selectedConditions, selectedDelivery, cityFilter, selectedCategory]);

  const handleResetFilters = () => {
    setSelectedType('ALL');
    setMinPrice('');
    setMaxPrice('');
    setOnlyFree(false);
    setSelectedConditions([]);
    setSelectedDelivery('ALL');
    setCityFilter('');
    setRadiusKm(25);
    setSelectedCategory(null);
    setSearchQuery('');
  };

  // Filter and Sort Listings
  const filteredListings = useMemo(() => {
    return allListings.filter((item) => {
      if (item.status !== 'ACTIVE') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = item.title.toLowerCase().includes(q);
        const inDesc = item.description.toLowerCase().includes(q);
        const inBrand = item.brand?.toLowerCase().includes(q);
        const inCity = item.city.toLowerCase().includes(q) || item.postalCode.includes(q);
        if (!inTitle && !inDesc && !inBrand && !inCity) return false;
      }
      if (selectedCategory && item.categoryId !== selectedCategory) return false;
      if (selectedSubcategory && item.subcategoryId !== selectedSubcategory) return false;
      if (selectedType !== 'ALL' && item.type !== selectedType) return false;
      if (onlyFree && !(item.type === 'FREE' || item.isFree)) return false;
      if (minPrice && item.price < Number(minPrice)) return false;
      if (maxPrice && item.price > Number(maxPrice)) return false;
      if (selectedConditions.length > 0 && !selectedConditions.includes(item.condition)) return false;
      if (selectedDelivery !== 'ALL') {
        if (selectedDelivery === 'PICKUP' && item.deliveryType === 'SHIPPING') return false;
        if (selectedDelivery === 'SHIPPING' && item.deliveryType === 'PICKUP') return false;
      }
      if (cityFilter.trim()) {
        const c = cityFilter.toLowerCase().trim();
        const matchCity = item.city.toLowerCase().includes(c) || item.postalCode.includes(c);
        if (!matchCity) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'popular') return (b.views + b.favoritesCount * 3) - (a.views + a.favoritesCount * 3);
      return 0;
    });
  }, [allListings, searchQuery, selectedCategory, selectedSubcategory, selectedType, onlyFree, minPrice, maxPrice, selectedConditions, selectedDelivery, cityFilter, sortBy]);

  return (
    <div className="pb-24">
      
      {/* ==================================================== */}
      {/* EDITORIAL HERO SECTION */}
      {/* ==================================================== */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 bg-[#F5F1E8] dark:bg-[#111511] border-y border-[#123D2A]/10 dark:border-[#F4C430]/15">
        <div className="absolute inset-x-0 top-0 h-2 bg-[#F4C430]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-[#123D2A]/20 dark:bg-[#F4C430]/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-end">
            <div className="md:col-span-8 lg:col-span-9 max-w-4xl min-w-0">
              <h1 className="max-w-[21rem] sm:max-w-full break-words font-bangers text-[2.35rem] sm:text-[4.4rem] md:text-[5.6rem] lg:text-[6.6rem] leading-[0.96] sm:leading-[0.92] text-[#123D2A] dark:text-white tracking-normal drop-shadow-[4px_4px_0_rgba(244,196,48,0.34)]">
                {t.heroSearchTitle}
              </h1>
            </div>
            <div className="md:col-span-4 lg:col-span-3 min-w-0 pb-2 md:pb-4">
              <p className="max-w-[21rem] sm:max-w-full break-words text-base md:text-lg text-[#171A17]/80 dark:text-gray-300 font-medium">
                {t.heroSearchSubtitle}
              </p>
            </div>
          </div>

          {/* EDITORIAL CATEGORY STRIP */}
          <div className="mt-16 md:mt-24 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-5 flex overflow-x-auto gap-4 md:gap-6 bg-[#123D2A] dark:bg-[#0D2C1E] border-y border-[#F4C430]/50 scrollbar-hide snap-x">
            
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedType('FREE');
              }}
              className="flex-shrink-0 group snap-start min-w-[190px] text-left border-l-4 border-[#F4C430] bg-[#F4C430] px-5 py-4 text-[#123D2A] transition-colors hover:bg-white"
            >
              <span className="block text-sm font-bold mb-2 tracking-widest uppercase">00</span>
              <span className="block font-bangers text-3xl md:text-4xl tracking-normal">
                {t.sadaqahTag}
              </span>
            </button>

            {categories.slice(0, 8).map((c, idx) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`flex-shrink-0 group snap-start min-w-[190px] text-left border-l-4 px-5 py-4 transition-colors ${
                  selectedCategory === c.id
                    ? 'border-[#F4C430] bg-[#F4C430] text-[#123D2A]'
                    : 'border-[#F4C430]/40 bg-white/5 text-white hover:border-[#F4C430] hover:bg-[#F4C430]/12'
                }`}
              >
                <span className={`block text-sm font-bold mb-2 tracking-widest uppercase ${selectedCategory === c.id ? 'text-[#123D2A]/70' : 'text-[#F4C430]'}`}>
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span className="block font-bangers text-3xl md:text-4xl tracking-normal">
                  {c.name[language]}
                </span>
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* ==================================================== */}
      {/* MAIN CONTENT AREA: FILTER + LISTINGS GRID */}
      {/* ==================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 md:mt-20">
        
        {/* ACTIVE SEARCH BANNER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12">
          <div className="flex flex-wrap items-center gap-3">
            {searchQuery && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-none bg-[#F4C430]/25 dark:bg-[#F4C430]/15 border border-[#F4C430]/60 text-[#123D2A] dark:text-white text-sm font-bold">
                <span>Suche: {searchQuery}</span>
                <button onClick={() => setSearchQuery('')} className="hover:opacity-60">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {selectedCategory && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-none bg-[#F4C430]/25 dark:bg-[#F4C430]/15 border border-[#F4C430]/60 text-[#123D2A] dark:text-white text-sm font-bold">
                <span>{categories.find(c => c.id === selectedCategory)?.name[language]}</span>
                <button onClick={() => setSelectedCategory(null)} className="hover:opacity-60">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden px-5 py-2.5 bg-[#171A17] dark:bg-white text-white dark:text-[#171A17] text-sm font-bold flex items-center justify-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filter</span>
            {activeFiltersCount > 0 && <span>({activeFiltersCount})</span>}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* LEFT: FILTER SIDEBAR */}
          <div className="hidden lg:block lg:col-span-3 sticky top-32">
            <FilterSidebar
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              onlyFree={onlyFree}
              setOnlyFree={setOnlyFree}
              selectedConditions={selectedConditions}
              setSelectedConditions={setSelectedConditions}
              selectedDelivery={selectedDelivery}
              setSelectedDelivery={setSelectedDelivery}
              cityFilter={cityFilter}
              setCityFilter={setCityFilter}
              radiusKm={radiusKm}
              setRadiusKm={setRadiusKm}
              onReset={handleResetFilters}
              activeFiltersCount={activeFiltersCount}
            />
          </div>

          {/* MOBILE DRAWER */}
          {mobileFilterOpen && (
            <div className="fixed inset-0 z-50 flex lg:hidden bg-black/60 backdrop-blur-sm">
              <div className="w-4/5 max-w-sm bg-[#F5F1E8] dark:bg-[#111511] h-full p-6 overflow-y-auto flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#123D2A]/10 dark:border-white/10">
                    <h3 className="font-serif text-2xl text-[#123D2A] dark:text-white">Filter</h3>
                    <button onClick={() => setMobileFilterOpen(false)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <FilterSidebar
                    selectedType={selectedType}
                    setSelectedType={setSelectedType}
                    minPrice={minPrice}
                    setMinPrice={setMinPrice}
                    maxPrice={maxPrice}
                    setMaxPrice={setMaxPrice}
                    onlyFree={onlyFree}
                    setOnlyFree={setOnlyFree}
                    selectedConditions={selectedConditions}
                    setSelectedConditions={setSelectedConditions}
                    selectedDelivery={selectedDelivery}
                    setSelectedDelivery={setSelectedDelivery}
                    cityFilter={cityFilter}
                    setCityFilter={setCityFilter}
                    radiusKm={radiusKm}
                    setRadiusKm={setRadiusKm}
                    onReset={handleResetFilters}
                    activeFiltersCount={activeFiltersCount}
                  />
                </div>
                <div className="pt-6 border-t border-[#123D2A]/10 dark:border-white/10 mt-8">
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="w-full py-4 bg-[#123D2A] text-white font-bold text-sm"
                  >
                    Anwenden ({filteredListings.length})
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* RIGHT: LISTINGS FEED */}
          <div className="lg:col-span-9">
            <ListingGrid
              listings={filteredListings}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
          </div>

        </div>
      </main>
    </div>
  );
};
