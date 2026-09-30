import React from 'react';
import { 
  SlidersHorizontal, Bookmark, ChevronRight,
  MapPin, Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ListingType, ListingCondition, DeliveryType } from '../../types';
import { storage } from '../../services/storage';
import { AUSTRIA_DISTRICTS, AUSTRIA_STATES } from '../../data/austriaLocations';

interface FilterProps {
  selectedType: ListingType | 'ALL';
  setSelectedType: (type: ListingType | 'ALL') => void;
  minPrice: string;
  setMinPrice: (val: string) => void;
  maxPrice: string;
  setMaxPrice: (val: string) => void;
  onlyFree: boolean;
  setOnlyFree: (val: boolean) => void;
  selectedConditions: ListingCondition[];
  setSelectedConditions: (conds: ListingCondition[]) => void;
  selectedDelivery: DeliveryType | 'ALL';
  setSelectedDelivery: (d: DeliveryType | 'ALL') => void;
  cityFilter: string;
  setCityFilter: (city: string) => void;
  stateFilter: string;
  setStateFilter: (state: string) => void;
  radiusKm: number;
  setRadiusKm: (radius: number) => void;
  onReset: () => void;
  activeFiltersCount: number;
}

export const FilterSidebar: React.FC<FilterProps> = ({
  selectedType,
  setSelectedType,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  onlyFree,
  setOnlyFree,
  selectedConditions,
  setSelectedConditions,
  selectedDelivery,
  setSelectedDelivery,
  cityFilter,
  setCityFilter,
  stateFilter,
  setStateFilter,
  radiusKm,
  setRadiusKm,
  onReset,
  activeFiltersCount,
}) => {
  const { 
    user, 
    categories, 
    selectedCategory, 
    selectedSubcategory, 
    setSelectedCategory, 
    language, 
    showToast, 
    searchQuery,
    t 
  } = useApp();

  const handleSaveSearch = () => {
    if (!user) {
      showToast(t.closedCommunityNotice, 'warning');
      return;
    }
    const title = searchQuery 
      ? `Suche: ${searchQuery}` 
      : selectedCategory 
      ? `Kategorie: ${categories.find(c => c.id === selectedCategory)?.name[language]}` 
      : 'Benutzerdefinierte Suche';

    storage.saveSearch({
      userId: user.id,
      title,
      query: searchQuery,
      categoryId: selectedCategory || undefined,
      subcategoryId: selectedSubcategory || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      city: cityFilter || undefined,
      radiusKm: radiusKm || undefined,
      notificationFrequency: 'INSTANT',
    });

    showToast(t.savedSearchSuccess, 'success');
  };

  const conditionsList: { id: ListingCondition; label: string }[] = [
    { id: 'NEW', label: t.conditionNew },
    { id: 'LIKE_NEW', label: t.conditionLikeNew },
    { id: 'VERY_GOOD', label: t.conditionVeryGood },
    { id: 'GOOD', label: t.conditionGood },
    { id: 'USED', label: t.conditionUsed },
    { id: 'DEFECTIVE', label: t.conditionDefective },
  ];

  const toggleCondition = (c: ListingCondition) => {
    if (selectedConditions.includes(c)) {
      setSelectedConditions(selectedConditions.filter((item) => item !== c));
    } else {
      setSelectedConditions([...selectedConditions, c]);
    }
  };

  return (
    <aside className="w-full space-y-10">
      
      {/* HEADER & RESET */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#123D2A]/10 dark:border-white/10">
        <div className="flex min-w-0 items-center gap-3 whitespace-nowrap font-serif font-bold text-lg text-[#123D2A] dark:text-white">
          <SlidersHorizontal className="h-5 w-5 shrink-0" />
          <span>{t.filterResults}</span>
          {activeFiltersCount > 0 && (
            <span className="text-sm font-sans font-bold text-gray-500">
              ({activeFiltersCount})
            </span>
          )}
        </div>

      </div>

      {/* SAVE SEARCH ACTION */}
      <button
        onClick={handleSaveSearch}
        className="w-full py-3 border border-[#123D2A] dark:border-white text-[#123D2A] dark:text-white hover:bg-[#123D2A] hover:text-white dark:hover:bg-white dark:hover:text-[#171A17] text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
      >
        <Bookmark className="w-4 h-4" />
        <span>{t.saveSearchQuery}</span>
      </button>

      {/* INSERAT-TYP (VERKAUFEN, VERSCHENKEN, GESUCHT) */}
      <div className="space-y-4">
        <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400">
          Inserattyp
        </label>
        <div className="flex flex-col gap-2">
          {['ALL', 'SELL', 'FREE', 'WANTED'].map((type) => {
            const isSelected = selectedType === type;
            const labels = {
              'ALL': 'Alle',
              'SELL': t.typeSell,
              'FREE': t.typeFree,
              'WANTED': t.typeWanted
            };
            return (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type as ListingType | 'ALL')}
                className="flex items-center gap-3 cursor-pointer group text-left"
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                  isSelected ? 'border-[#123D2A] dark:border-white' : 'border-gray-400 group-hover:border-gray-600'
                }`}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-[#123D2A] dark:bg-white" />}
                </div>
                <span className={`text-sm ${isSelected ? 'font-bold text-[#123D2A] dark:text-white' : 'font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'}`}>
                  {labels[type as keyof typeof labels]}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* CATEGORIES ACCORDION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
            {t.categories}
          </label>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-[10px] font-bold uppercase tracking-widest text-[#123D2A] dark:text-[#F4C430] hover:underline"
            >
              Alle zeigen
            </button>
          )}
        </div>

        <div className="space-y-2">
          {categories.map((c) => {
            const isSelected = selectedCategory === c.id;
            return (
              <div key={c.id} className="space-y-2">
                <button
                  onClick={() => setSelectedCategory(isSelected ? null : c.id)}
                  className={`w-full text-left flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'text-[#123D2A] dark:text-white font-bold'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium'
                  }`}
                >
                  <span className="text-sm">{c.name[language]}</span>
                  {isSelected ? (
                    <span className="text-[#123D2A] dark:text-white">-</span>
                  ) : (
                    <span className="text-gray-400">+</span>
                  )}
                </button>

                {/* SUBCATEGORIES IF EXPANDED */}
                {isSelected && (
                  <div className="pl-4 space-y-2 border-l border-[#123D2A]/20 dark:border-white/20 mt-2 mb-4">
                    {c.subcategories.map((sub) => {
                      const isSubSelected = selectedSubcategory === sub.id;
                      return (
                         <label key={sub.id} className="flex items-center gap-3 cursor-pointer group">
                           <input
                             type="radio"
                             name={`cat-${c.id}`}
                             checked={isSubSelected}
                             onChange={() => setSelectedCategory(c.id, isSubSelected ? null : sub.id)}
                             className="hidden"
                           />
                           <span className={`text-sm ${
                             isSubSelected
                               ? 'font-bold text-[#123D2A] dark:text-[#F4C430]'
                               : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                           }`}>
                             {sub.name[language]}
                           </span>
                         </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* PRICE RANGE */}
      <div className="space-y-4 pt-4 border-t border-[#123D2A]/10 dark:border-white/10">
        <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400">
          {t.priceRange}
        </label>
        <div className="flex items-center gap-4">
          <input
            type="number"
            min="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value.startsWith('-') ? '' : e.target.value)}
            placeholder={t.fromPrice}
            className="w-full border border-[#123D2A]/20 bg-white/70 px-4 py-3 text-sm font-bold text-[#171A17] outline-none transition focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/25 dark:border-white/15 dark:bg-[#111511] dark:text-white"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            min="0"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value.startsWith('-') ? '' : e.target.value)}
            placeholder={t.toPrice}
            className="w-full border border-[#123D2A]/20 bg-white/70 px-4 py-3 text-sm font-bold text-[#171A17] outline-none transition focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/25 dark:border-white/15 dark:bg-[#111511] dark:text-white"
          />
        </div>

        <button
          type="button"
          onClick={() => setOnlyFree(!onlyFree)}
          className="flex items-center gap-3 pt-4 cursor-pointer group text-left"
        >
          <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${
            onlyFree ? 'bg-[#123D2A] border-[#123D2A] dark:bg-[#F4C430] dark:border-[#F4C430]' : 'border-gray-400 group-hover:border-gray-600'
          }`}>
            {onlyFree && <Check className="w-3 h-3 text-white dark:text-[#171A17] stroke-[3]" />}
          </div>
          <span className={`text-sm ${onlyFree ? 'font-bold text-[#123D2A] dark:text-white' : 'font-medium text-gray-600 dark:text-gray-400'}`}>
            {t.onlyFree}
          </span>
        </button>
      </div>

      {/* STANDORT / BUNDESLAND UND BEZIRK */}
      <div className="space-y-4 pt-4 border-t border-[#123D2A]/10 dark:border-white/10">
        <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400">
          {t.locationFilter}
        </label>
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <select
            value={stateFilter}
            onChange={(event) => { setStateFilter(event.target.value); setCityFilter(''); }}
            className="w-full appearance-none border border-[#123D2A]/20 bg-white/70 py-3 pl-10 pr-4 text-sm font-bold text-[#171A17] outline-none transition focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/25 dark:border-white/15 dark:bg-[#111511] dark:text-white"
          >
            <option value="" className="dark:bg-[#111511]">Bundesland auswählen</option>
            {AUSTRIA_STATES.map((state) => <option key={state} value={state} className="dark:bg-[#111511]">{state}</option>)}
          </select>
        </div>
        <select
          value={cityFilter}
          disabled={!stateFilter}
          onChange={(event) => setCityFilter(event.target.value)}
          className="w-full appearance-none border border-[#123D2A]/20 bg-white/70 px-4 py-3 text-sm font-bold text-[#171A17] outline-none transition focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/25 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:bg-[#111511] dark:text-white"
        >
          <option value="" className="dark:bg-[#111511]">Bezirk / Ort auswählen</option>
          {(AUSTRIA_DISTRICTS[stateFilter] ?? []).map((district) => <option key={district} value={district} className="dark:bg-[#111511]">{district}</option>)}
        </select>

        {cityFilter && (
          <div className="space-y-2 pt-4">
            <div className="flex justify-between text-xs text-gray-500 uppercase tracking-widest">
              <span>{t.radiusKm}</span>
              <span className="font-bold text-[#123D2A] dark:text-white">{radiusKm} km</span>
            </div>
            <input
              type="range"
              min={5}
              max={150}
              step={5}
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="w-full accent-[#123D2A] dark:accent-white"
            />
          </div>
        )}
      </div>

      {/* ZUSTAND */}
      <div className="space-y-4 pt-4 border-t border-[#123D2A]/10 dark:border-white/10">
        <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400">
          Zustand
        </label>
        <div className="flex flex-col gap-3">
          {conditionsList.map((cond) => {
            const isChecked = selectedConditions.includes(cond.id);
            return (
              <label
                key={cond.id}
                onClick={() => toggleCondition(cond.id)}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${
                  isChecked
                    ? 'bg-[#123D2A] border-[#123D2A] dark:bg-white dark:border-white'
                    : 'border-gray-400 group-hover:border-gray-600'
                }`}>
                  {isChecked && <Check className="w-3 h-3 text-white dark:text-[#171A17] stroke-[3]" />}
                </div>
                <span className={`text-sm ${isChecked ? 'font-bold text-[#123D2A] dark:text-white' : 'font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'}`}>
                  {cond.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* ÜBERGABE / VERSAND */}
      <div className="space-y-4 pt-4 border-t border-[#123D2A]/10 dark:border-white/10">
        <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400">
          {t.transferType}
        </label>
        <select
          value={selectedDelivery}
          onChange={(e) => setSelectedDelivery(e.target.value as DeliveryType | 'ALL')}
          className="w-full pb-2 bg-transparent border-b border-[#123D2A]/20 dark:border-white/20 text-sm font-bold text-[#171A17] dark:text-white focus:outline-none focus:border-[#123D2A] dark:focus:border-white appearance-none cursor-pointer"
        >
          <option value="ALL" className="dark:bg-[#111511]">Alle Übergabearten</option>
          <option value="PICKUP" className="dark:bg-[#111511]">{t.deliveryPickup}</option>
          <option value="SHIPPING" className="dark:bg-[#111511]">{t.deliveryShipping}</option>
          <option value="BOTH" className="dark:bg-[#111511]">{t.deliveryBoth}</option>
        </select>
      </div>

    </aside>
  );
};
