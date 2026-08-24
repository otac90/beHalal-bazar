import React from 'react';
import { ChevronDown, Inbox, PlusCircle } from 'lucide-react';
import { Listing } from '../../types';
import { ListingCard } from './ListingCard';
import { useApp } from '../../context/AppContext';

export type SortOption = 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'popular';

interface Props {
  listings: Listing[];
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  title?: string;
  subtitle?: string;
  showCategoryHeader?: boolean;
}

export const ListingGrid: React.FC<Props> = ({
  listings,
  sortBy,
  setSortBy,
  title,
  subtitle,
  showCategoryHeader = false,
}) => {
  const { navigate, selectedCategory, selectedSubcategory, categories, language, t } = useApp();

  const activeCategory = categories.find((c) => c.id === selectedCategory);
  const activeSubcategory = activeCategory?.subcategories.find((s) => s.id === selectedSubcategory);

  return (
    <div className="w-full space-y-6 md:space-y-8">
      
      {/* HEADER & SORTING ROW */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif text-[#123D2A] dark:text-white flex items-center gap-2">
            <span>{title || (activeCategory ? activeCategory.name[language] : t.allCategories)}</span>
            {activeSubcategory && (
              <span className="text-lg text-gray-400 font-sans">
                › {activeSubcategory.name[language]}
              </span>
            )}
            <span className="text-sm px-2 py-0.5 bg-[#CBD9C6]/20 dark:bg-white/5 text-[#123D2A] dark:text-white font-sans font-bold ml-2">
              {listings.length}
            </span>
          </h2>
          {subtitle && (
            <p className="text-sm text-[#171A17]/60 dark:text-gray-400 mt-2 font-medium">
              {subtitle}
            </p>
          )}
        </div>

        {/* SORT DROPDOWN */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest hidden sm:inline">{t.sortBy}</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-10 pl-4 pr-10 bg-transparent border border-[#123D2A]/20 dark:border-white/20 text-sm font-bold text-[#171A17] dark:text-white focus:outline-none focus:border-[#123D2A] dark:focus:border-white appearance-none cursor-pointer"
            >
              <option value="newest" className="dark:bg-[#111511]">{t.sortNewest}</option>
              <option value="popular" className="dark:bg-[#111511]">{t.sortPopular}</option>
              <option value="price_asc" className="dark:bg-[#111511]">{t.sortPriceAsc}</option>
              <option value="price_desc" className="dark:bg-[#111511]">{t.sortPriceDesc}</option>
              <option value="oldest" className="dark:bg-[#111511]">{t.sortOldest}</option>
            </select>
            <ChevronDown className="w-4 h-4 text-[#171A17] dark:text-white absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* GRID */}
      {listings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        /* EMPTY STATE */
        <div className="py-24 px-4 text-center flex flex-col items-center justify-center">
          <h3 className="text-2xl font-serif text-[#123D2A] dark:text-white mb-2">
            {t.noListingsFound}
          </h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mb-8 font-medium">
            {t.noListingsSub}
          </p>
          <button
            onClick={() => navigate('create-listing')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#123D2A] dark:bg-white text-white dark:text-[#171A17] text-sm font-bold shadow-xs hover:opacity-90 transition-opacity"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.postListing}</span>
          </button>
        </div>
      )}

    </div>
  );
};
