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
      <section className="pt-12 pb-16 md:pt-20 md:pb-24 bg-[#F5F1E8] dark:bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-end">
            <div className="md:col-span-8 lg:col-span-9 max-w-4xl">
              <h1 className="text-[3rem] sm:text-[4rem] md:text-[5rem] lg:text-[6rem] leading-[0.95] font-serif text-[#123D2A] dark:text-white tracking-tight">
                {t.heroSearchTitle}
              </h1>
            </div>
            <div className="md:col-span-4 lg:col-span-3 pb-2 md:pb-4">
              <p className="text-base md:text-lg text-[#171A17]/80 dark:text-gray-300 font-medium">
                {t.heroSearchSubtitle}
              </p>
            </div>
          </div>

          {/* EDITORIAL CATEGORY STRIP */}
          <div className="mt-16 md:mt-24 flex overflow-x-auto gap-8 md:gap-16 pb-6 scrollbar-hide snap-x">
            
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedType('FREE');
              }}
              className="flex-shrink-0 group snap-start text-left"
            >
              <span className="block text-sm font-bold text-[#F4C430] mb-2 tracking-widest uppercase">00</span>
              <span className="block text-3xl md:text-4xl font-serif text-[#171A17] dark:text-white group-hover:opacity-60 transition-opacity">
                {t.sadaqahTag}
              </span>
            </button>

            {categories.slice(0, 8).map((c, idx) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`flex-shrink-0 group snap-start text-left ${selectedCategory === c.id ? 'opacity-100' : 'opacity-70 dark:opacity-60'} hover:opacity-100 transition-opacity`}
              >
                <span className="block text-sm font-bold text-[#123D2A]/40 dark:text-white/40 mb-2 tracking-widest uppercase">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span className="block text-3xl md:text-4xl font-serif text-[#123D2A] dark:text-white">
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-none bg-[#CBD9C6]/30 dark:bg-white/5 text-[#123D2A] dark:text-white text-sm font-bold">
                <span>Suche: {searchQuery}</span>
                <button onClick={() => setSearchQuery('')} className="hover:opacity-60">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {selectedCategory && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-none bg-[#CBD9C6]/30 dark:bg-white/5 text-[#123D2A] dark:text-white text-sm font-bold">
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
