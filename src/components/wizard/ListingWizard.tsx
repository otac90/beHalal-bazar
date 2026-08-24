import React, { useState } from 'react';
import { 
  Plus, Upload, Trash2, Check, ArrowRight, ArrowLeft, 
  Sparkles, AlertTriangle, ShieldCheck, Eye, ImageIcon, 
  DollarSign, MapPin, Truck, Package 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  ListingType, ListingCondition, DeliveryType, 
  ListingImage, Listing 
} from '../../types';
import { storage } from '../../services/storage';
import { checkListingModeration } from '../../services/moderation';

export const ListingWizard: React.FC = () => {
  const { user, categories, navigate, showToast, config, t, language } = useApp();

  const [step, setStep] = useState(1);

  // Form State
  const [type, setType] = useState<ListingType>('SELL');
  const [categoryId, setCategoryId] = useState<string>('baby-kids');
  const [subcategoryId, setSubcategoryId] = useState<string>('strollers');
  const [images, setImages] = useState<ListingImage[]>([
    {
      id: 'img-new-1',
      url: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&auto=format&fit=crop&q=80',
      sortOrder: 0,
      isCover: true,
    }
  ]);
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState<ListingCondition>('VERY_GOOD');
  const [price, setPrice] = useState('');
  const [negotiable, setNegotiable] = useState(true);
  const [maxBudget, setMaxBudget] = useState('');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('BOTH');
  const [postalCode, setPostalCode] = useState(user?.postalCode || '1100');
  const [city, setCity] = useState(user?.city || 'Wien');
  const [country, setCountry] = useState(user?.country || 'Österreich');
  
  // Validation / Warning states
  const [moderationWarning, setModerationWarning] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-set stock images for quick addition
  const sampleStockImages = [
    'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800',
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800',
    'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800',
    'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800',
  ];

  const handleAddImage = (url: string) => {
    if (images.length >= config.maxPhotosPerListing) {
      showToast(`Maximal ${config.maxPhotosPerListing} Bilder erlaubt.`, 'warning');
      return;
    }
    const newImg: ListingImage = {
      id: `img-${Date.now()}-${Math.random()}`,
      url,
      sortOrder: images.length,
      isCover: images.length === 0,
    };
    setImages([...images, newImg]);
  };

  const handleFileUploadSimulation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // In browser environment, generate local Object URL or pick sample photo
      const randomStock = sampleStockImages[Math.floor(Math.random() * sampleStockImages.length)];
      handleAddImage(randomStock);
      showToast('Foto erfolgreich hinzugefügt (EXIF bereinigt).', 'success');
    }
  };

  const handleSetCover = (id: string) => {
    setImages(images.map((img) => ({ ...img, isCover: img.id === id })));
  };

  const handleDeleteImage = (id: string) => {
    const filtered = images.filter((img) => img.id !== id);
    if (filtered.length > 0 && !filtered.some((img) => img.isCover)) {
      filtered[0].isCover = true;
    }
    setImages(filtered);
  };

  const handleValidateStep4 = () => {
    if (!title.trim()) {
      showToast('Bitte gib einen aussagekräftigen Titel an.', 'warning');
      return false;
    }
    if (!description.trim()) {
      showToast('Bitte gib eine Beschreibung an.', 'warning');
      return false;
    }
    if (type === 'SELL' && !price) {
      showToast('Preisangabe ist Pflicht (oder wähle „Zu verschenken“).', 'warning');
      return false;
    }

    // Run automated moderation check
    if (user) {
      const existingListings = storage.getListings();
      const modResult = checkListingModeration(
        title,
        description,
        Number(price) || 0,
        categoryId,
        user.id,
        existingListings,
        config
      );

      if (!modResult.allowed) {
        setModerationWarning(modResult.reason || 'Regelverstoß festgestellt.');
        showToast(modResult.reason || 'Regelverstoß', 'error');
        return false;
      }
    }

    setModerationWarning(null);
    return true;
  };

  const handleNext = () => {
    if (step === 4) {
      if (!handleValidateStep4()) return;
    }
    if (step === 6) {
      if (!postalCode || !city) {
        showToast('Bitte gib Postleitzahl und Ort an.', 'warning');
        return;
      }
    }
    setStep((prev) => Math.min(7, prev + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePublish = () => {
    if (!user) {
      showToast(t.closedCommunityNotice, 'warning');
      navigate('login');
      return;
    }

    setIsSubmitting(true);

    const isFree = type === 'FREE';
    const parsedPrice = isFree ? 0 : Number(price) || 0;
    const parsedBudget = type === 'WANTED' ? Number(maxBudget) || parsedPrice : undefined;

    const newListing: Listing = {
      id: `lst-${Date.now()}`,
      userId: user.id,
      type,
      title: title.trim(),
      description: description.trim(),
      categoryId,
      subcategoryId,
      brand: brand.trim() || undefined,
      condition,
      price: parsedPrice,
      negotiable: isFree ? false : negotiable,
      isFree,
      maxBudget: parsedBudget,
      deliveryType,
      country,
      postalCode,
      city,
      status: 'ACTIVE',
      views: 1,
      favoritesCount: 0,
      images: images.length > 0 ? images : [{ id: 'img-default', url: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800', isCover: true, sortOrder: 0 }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + config.listingExpiryDays * 24 * 60 * 60 * 1000).toISOString(),
      seller: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        avatarUrl: user.avatarUrl,
        ratingAverage: user.ratingAverage,
        ratingCount: user.ratingCount,
        memberSince: 'Neu in 2026',
        emailVerified: user.emailVerified,
        city,
        postalCode,
      },
    };

    storage.saveListing(newListing);
    setIsSubmitting(false);
    showToast(t.listingCreatedSuccess, 'success');
    navigate('listing-detail', { id: newListing.id });
  };

  const selectedCategoryObj = categories.find((c) => c.id === categoryId);

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-16">
      
      {/* WIZARD HEADER & PROGRESS BAR */}
      <div className="space-y-6 text-center">
        <h1 className="text-3xl md:text-5xl font-serif text-[#171A17] dark:text-white">
          {t.createListingTitle}
        </h1>
        <div className="flex items-center justify-center gap-2 font-sans text-xs uppercase tracking-widest text-gray-500">
          <span>Schritt {step} von 7:</span>
          <span className="font-bold text-[#123D2A] dark:text-[#F4C430]">
            {
              step === 1 ? t.wizardStep1 :
              step === 2 ? t.wizardStep2 :
              step === 3 ? t.wizardStep3 :
              step === 4 ? t.wizardStep4 :
              step === 5 ? t.transferType :
              step === 6 ? t.locationFilter :
              t.wizardStep6
            }
          </span>
        </div>

        {/* PROGRESS STEPPER */}
        <div className="w-full max-w-sm mx-auto h-px bg-gray-200 dark:bg-white/10 relative">
          <div 
            className="absolute top-0 left-0 h-full bg-[#123D2A] dark:bg-white transition-all duration-500 ease-out"
            style={{ width: `${(step / 7) * 100}%` }}
          />
        </div>
      </div>

      {/* WIZARD CONTENT */}
      <div className="max-w-2xl mx-auto min-h-[400px]">
        
        {/* ==================================================== */}
        {/* STEP 1: ART DES INSERATS */}
        {/* ==================================================== */}
        {step === 1 && (
          <div className="space-y-8 animate-fade-in">
            <h2 className="font-serif text-2xl text-[#171A17] dark:text-white text-center mb-8">
              {t.step1Question}
            </h2>
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => setType('SELL')}
                className={`py-6 px-8 border-b-2 text-left transition-all flex items-center justify-between group ${
                  type === 'SELL'
                    ? 'border-[#123D2A] dark:border-white'
                    : 'border-transparent border-b-gray-200 dark:border-b-white/10 hover:border-gray-400'
                }`}
              >
                <div>
                  <h3 className={`font-serif text-xl mb-1 ${type === 'SELL' ? 'text-[#123D2A] dark:text-white' : 'text-[#171A17] dark:text-gray-300'}`}>{t.typeSell}</h3>
                  <p className="font-sans text-xs uppercase tracking-widest text-gray-500">{t.step1SellDesc}</p>
                </div>
                {type === 'SELL' && <Check className="w-5 h-5 text-[#123D2A] dark:text-white" />}
              </button>

              <button
                type="button"
                onClick={() => setType('FREE')}
                className={`py-6 px-8 border-b-2 text-left transition-all flex items-center justify-between group ${
                  type === 'FREE'
                    ? 'border-[#123D2A] dark:border-white'
                    : 'border-transparent border-b-gray-200 dark:border-b-white/10 hover:border-gray-400'
                }`}
              >
                <div>
                  <h3 className={`font-serif text-xl mb-1 ${type === 'FREE' ? 'text-[#123D2A] dark:text-white' : 'text-[#171A17] dark:text-gray-300'}`}>{t.typeFree}</h3>
                  <p className="font-sans text-xs uppercase tracking-widest text-gray-500">{t.step1FreeDesc}</p>
                </div>
                {type === 'FREE' && <Check className="w-5 h-5 text-[#123D2A] dark:text-white" />}
              </button>

              <button
                type="button"
                onClick={() => setType('WANTED')}
                className={`py-6 px-8 border-b-2 text-left transition-all flex items-center justify-between group ${
                  type === 'WANTED'
                    ? 'border-[#123D2A] dark:border-white'
                    : 'border-transparent border-b-gray-200 dark:border-b-white/10 hover:border-gray-400'
                }`}
              >
                <div>
                  <h3 className={`font-serif text-xl mb-1 ${type === 'WANTED' ? 'text-[#123D2A] dark:text-white' : 'text-[#171A17] dark:text-gray-300'}`}>{t.typeWanted}</h3>
                  <p className="font-sans text-xs uppercase tracking-widest text-gray-500">{t.step1WantedDesc}</p>
                </div>
                {type === 'WANTED' && <Check className="w-5 h-5 text-[#123D2A] dark:text-white" />}
              </button>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 2: KATEGORIE */}
        {/* ==================================================== */}
        {step === 2 && (
          <div className="space-y-8 animate-fade-in">
            <h2 className="font-serif text-2xl text-[#171A17] dark:text-white text-center mb-8">
              {t.step2SelectCat}
            </h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 max-h-96 overflow-y-auto">
              {categories.map((c) => {
                const isSelected = categoryId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setCategoryId(c.id);
                      setSubcategoryId(c.subcategories[0]?.id || '');
                    }}
                    className={`py-3 text-left font-serif text-lg transition-colors border-b ${
                      isSelected
                        ? 'text-[#123D2A] dark:text-white border-[#123D2A] dark:border-white'
                        : 'text-gray-500 hover:text-[#171A17] dark:hover:text-white border-transparent'
                    }`}
                  >
                    {c.name[language]}
                  </button>
                );
              })}
            </div>

            {selectedCategoryObj && selectedCategoryObj.subcategories.length > 0 && (
              <div className="pt-8 space-y-4 animate-fade-in">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Unterkategorie
                </label>
                <div className="flex flex-wrap gap-3">
                  {selectedCategoryObj.subcategories.map((sub) => {
                    const isSubSelected = subcategoryId === sub.id;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setSubcategoryId(sub.id)}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors border ${
                          isSubSelected
                            ? 'bg-[#123D2A] dark:bg-white text-white dark:text-[#171A17] border-[#123D2A] dark:border-white'
                            : 'bg-transparent text-gray-500 border-gray-300 dark:border-white/20 hover:border-[#171A17] dark:hover:border-white hover:text-[#171A17] dark:hover:text-white'
                        }`}
                      >
                        {sub.name[language]}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 3: BILDER HOCHLADEN */}
        {/* ==================================================== */}
        {step === 3 && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center">
              <h2 className="font-serif text-2xl text-[#171A17] dark:text-white">
                {t.wizardStep3}
              </h2>
              <p className="font-sans text-[10px] uppercase tracking-widest text-gray-500 mt-2">
                {images.length} von {config.maxPhotosPerListing} • {t.step3UploadNotice}
              </p>
            </div>

            {/* UPLOAD DROPZONE */}
            <div className="py-16 border border-dashed border-gray-300 dark:border-white/20 text-center space-y-6 hover:border-[#123D2A] dark:hover:border-white transition-colors cursor-pointer group">
              <Upload className="w-8 h-8 text-gray-300 group-hover:text-[#123D2A] dark:group-hover:text-white mx-auto transition-colors" />
              <div>
                <p className="font-serif text-xl text-[#171A17] dark:text-white">
                  {t.dragDropPhotos}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <label className="cursor-pointer px-6 py-3 bg-[#123D2A] dark:bg-white text-white dark:text-[#171A17] text-[11px] font-bold uppercase tracking-widest hover:bg-[#171A17] dark:hover:bg-gray-200 transition-colors">
                  <span>Dateien auswählen</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUploadSimulation}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => handleAddImage(sampleStockImages[Math.floor(Math.random() * sampleStockImages.length)])}
                  className="px-6 py-3 border border-gray-300 dark:border-white/20 text-[#171A17] dark:text-white text-[11px] font-bold uppercase tracking-widest hover:border-[#171A17] dark:hover:border-white transition-colors"
                >
                  Beispiel-Foto einfügen
                </button>
              </div>
            </div>

            {/* UPLOADED IMAGES GRID */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    className={`relative aspect-[3/4] group ${
                      img.isCover ? 'ring-2 ring-offset-2 ring-[#123D2A] dark:ring-white' : ''
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    
                    {img.isCover && (
                      <span className="absolute top-2 left-2 px-2 py-1 bg-white text-[#171A17] text-[9px] font-bold uppercase tracking-widest shadow-sm">
                        TITELBILD
                      </span>
                    )}

                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                      {!img.isCover && (
                        <button
                          type="button"
                          onClick={() => handleSetCover(img.id)}
                          className="px-3 py-1.5 bg-white text-[#171A17] hover:bg-gray-200 text-[9px] font-bold uppercase tracking-widest transition-colors"
                        >
                          Als Titel
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(img.id)}
                        className="px-3 py-1.5 bg-red-600 text-white hover:bg-red-700 text-[9px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Löschen
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 4: DETAILS & PREIS */}
        {/* ==================================================== */}
        {step === 4 && (
          <div className="space-y-10 animate-fade-in">
            <h2 className="font-serif text-2xl text-[#171A17] dark:text-white text-center mb-8">
              {t.wizardStep4}
            </h2>

            {moderationWarning && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-900 dark:text-red-400 font-sans text-sm flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <div>
                  <p className="font-bold">Moderationsprüfung nicht bestanden:</p>
                  <p>{moderationWarning}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {t.titleField} *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.titleHelp}
                className="w-full pb-2 font-serif text-xl bg-transparent border-b border-gray-300 dark:border-white/20 text-[#171A17] dark:text-white focus:outline-none focus:border-[#123D2A] dark:focus:border-white transition-colors placeholder:font-sans placeholder:text-sm placeholder:tracking-widest"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {t.brandField}
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="z.B. Apple, IKEA"
                  className="w-full pb-2 bg-transparent border-b border-gray-300 dark:border-white/20 text-sm font-bold text-[#171A17] dark:text-white focus:outline-none focus:border-[#123D2A] dark:focus:border-white transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Zustand *
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as ListingCondition)}
                  className="w-full pb-2 bg-transparent border-b border-gray-300 dark:border-white/20 text-sm font-bold text-[#171A17] dark:text-white focus:outline-none focus:border-[#123D2A] dark:focus:border-white appearance-none cursor-pointer"
                >
                  <option value="NEW" className="dark:bg-[#111511]">{t.conditionNew}</option>
                  <option value="LIKE_NEW" className="dark:bg-[#111511]">{t.conditionLikeNew}</option>
                  <option value="VERY_GOOD" className="dark:bg-[#111511]">{t.conditionVeryGood}</option>
                  <option value="GOOD" className="dark:bg-[#111511]">{t.conditionGood}</option>
                  <option value="USED" className="dark:bg-[#111511]">{t.conditionUsed}</option>
                  <option value="DEFECTIVE" className="dark:bg-[#111511]">{t.conditionDefective}</option>
                </select>
              </div>
            </div>

            {/* PREIS ODER BUDGET */}
            {type === 'SELL' && (
              <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-white/10">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Preis (€) *
                </label>
                <div className="flex items-center gap-8">
                  <div className="relative flex-1 max-w-[200px]">
                    <span className="absolute left-0 bottom-2 font-serif text-2xl text-[#171A17] dark:text-white">€</span>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0"
                      className="w-full pl-8 pb-1 font-serif text-3xl bg-transparent border-b border-gray-300 dark:border-white/20 text-[#171A17] dark:text-white focus:outline-none focus:border-[#123D2A] dark:focus:border-white transition-colors"
                    />
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer group mt-4">
                    <div className={`w-5 h-5 border flex items-center justify-center transition-colors ${
                      negotiable ? 'bg-[#123D2A] border-[#123D2A] dark:bg-white dark:border-white' : 'border-gray-400 group-hover:border-gray-600'
                    }`}>
                      {negotiable && <Check className="w-3.5 h-3.5 text-white dark:text-[#171A17] stroke-[3]" />}
                    </div>
                    <span className={`text-xs uppercase tracking-widest ${negotiable ? 'font-bold text-[#123D2A] dark:text-white' : 'font-medium text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white'}`}>
                      Verhandlungsbasis (VB)
                    </span>
                  </label>
                </div>
              </div>
            )}

            {type === 'WANTED' && (
              <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-white/10">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Maximales Budget (€, optional)
                </label>
                <div className="relative max-w-[200px]">
                  <span className="absolute left-0 bottom-2 font-serif text-2xl text-[#171A17] dark:text-white">€</span>
                  <input
                    type="number"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                    placeholder="0"
                    className="w-full pl-8 pb-1 font-serif text-3xl bg-transparent border-b border-gray-300 dark:border-white/20 text-[#171A17] dark:text-white focus:outline-none focus:border-[#123D2A] dark:focus:border-white transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-white/10">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {t.descriptionField} *
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.descriptionHelp}
                className="w-full py-2 bg-transparent border-b border-gray-300 dark:border-white/20 text-sm text-[#171A17] dark:text-white focus:outline-none focus:border-[#123D2A] dark:focus:border-white transition-colors resize-none leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 5: ÜBERGABE & VERSAND */}
        {/* ==================================================== */}
        {step === 5 && (
          <div className="space-y-8 animate-fade-in">
            <h2 className="font-serif text-2xl text-[#171A17] dark:text-white text-center mb-8">
              {t.transferType}
            </h2>
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => setDeliveryType('PICKUP')}
                className={`py-6 border-b-2 text-left transition-all flex items-center justify-between group ${
                  deliveryType === 'PICKUP'
                    ? 'border-[#123D2A] dark:border-white text-[#123D2A] dark:text-white'
                    : 'border-transparent border-b-gray-200 dark:border-b-white/10 text-gray-500 hover:text-[#171A17] dark:hover:text-white hover:border-gray-400'
                }`}
              >
                <div className="flex items-center gap-6">
                  <Package className="w-6 h-6" />
                  <div>
                    <h3 className="font-serif text-xl mb-1">{t.deliveryPickup}</h3>
                    <p className="font-sans text-[10px] uppercase tracking-widest opacity-80">Käufer holt den Artikel persönlich ab</p>
                  </div>
                </div>
                {deliveryType === 'PICKUP' && <Check className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('SHIPPING')}
                className={`py-6 border-b-2 text-left transition-all flex items-center justify-between group ${
                  deliveryType === 'SHIPPING'
                    ? 'border-[#123D2A] dark:border-white text-[#123D2A] dark:text-white'
                    : 'border-transparent border-b-gray-200 dark:border-b-white/10 text-gray-500 hover:text-[#171A17] dark:hover:text-white hover:border-gray-400'
                }`}
              >
                <div className="flex items-center gap-6">
                  <Truck className="w-6 h-6" />
                  <div>
                    <h3 className="font-serif text-xl mb-1">{t.deliveryShipping}</h3>
                    <p className="font-sans text-[10px] uppercase tracking-widest opacity-80">Versand per Post / Paketdienst</p>
                  </div>
                </div>
                {deliveryType === 'SHIPPING' && <Check className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('BOTH')}
                className={`py-6 border-b-2 text-left transition-all flex items-center justify-between group ${
                  deliveryType === 'BOTH'
                    ? 'border-[#123D2A] dark:border-white text-[#123D2A] dark:text-white'
                    : 'border-transparent border-b-gray-200 dark:border-b-white/10 text-gray-500 hover:text-[#171A17] dark:hover:text-white hover:border-gray-400'
                }`}
              >
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Package className="w-6 h-6" />
                    <span className="opacity-40">+</span>
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl mb-1">{t.deliveryBoth}</h3>
                    <p className="font-sans text-[10px] uppercase tracking-widest opacity-80">Sowohl Abholung als auch Versand</p>
                  </div>
                </div>
                {deliveryType === 'BOTH' && <Check className="w-5 h-5" />}
              </button>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 6: STANDORT */}
        {/* ==================================================== */}
        {step === 6 && (
          <div className="space-y-10 animate-fade-in">
            <div className="text-center">
              <h2 className="font-serif text-2xl text-[#171A17] dark:text-white">
                {t.locationFilter}
              </h2>
              <p className="font-sans text-[10px] uppercase tracking-widest text-gray-500 mt-2">
                Aus Datenschutzgründen wird öffentlich nur Postleitzahl und Stadt angezeigt.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Postleitzahl *
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="1100"
                  className="w-full pb-2 bg-transparent border-b border-gray-300 dark:border-white/20 text-lg font-bold text-[#171A17] dark:text-white focus:outline-none focus:border-[#123D2A] dark:focus:border-white transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Ort / Stadt *
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Wien"
                  className="w-full pb-2 bg-transparent border-b border-gray-300 dark:border-white/20 text-lg font-bold text-[#171A17] dark:text-white focus:outline-none focus:border-[#123D2A] dark:focus:border-white transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Land
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full pb-2 bg-transparent border-b border-gray-300 dark:border-white/20 text-lg font-bold text-[#171A17] dark:text-white focus:outline-none focus:border-[#123D2A] dark:focus:border-white appearance-none cursor-pointer"
              >
                <option value="Österreich" className="dark:bg-[#111511]">Österreich</option>
                <option value="Deutschland" className="dark:bg-[#111511]">Deutschland</option>
                <option value="Schweiz" className="dark:bg-[#111511]">Schweiz</option>
                <option value="Bosnien-Herzegowina" className="dark:bg-[#111511]">Bosna i Hercegovina</option>
              </select>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 7: VORSCHAU & VERÖFFENTLICHEN */}
        {/* ==================================================== */}
        {step === 7 && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center">
              <h2 className="font-serif text-2xl text-[#171A17] dark:text-white">
                Vorschau deines Inserats
              </h2>
              <p className="font-sans text-[10px] uppercase tracking-widest text-gray-500 mt-2">
                So wird dein Inserat für andere verifizierte Mitglieder der BE HALAL Community angezeigt.
              </p>
            </div>

            {/* PREVIEW CARD */}
            <div className="p-6 border border-gray-200 dark:border-white/10 space-y-6">
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={images.find((i) => i.isCover)?.url || images[0]?.url}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4 border-b border-gray-200 dark:border-white/10 pb-4">
                  <span className="text-[10px] font-bold text-[#123D2A] dark:text-[#F4C430] uppercase tracking-widest">
                    {type === 'FREE' ? t.typeFree : type === 'WANTED' ? t.typeWanted : t.typeSell}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {postalCode} {city}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-3xl text-[#171A17] dark:text-white mb-2">
                    {title}
                  </h3>
                  <div className="font-sans text-xl font-bold text-[#171A17] dark:text-white">
                    {type === 'FREE' ? 'Kostenlos' : `${price} € ${negotiable ? '(VB)' : ''}`}
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                  {description}
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-600 dark:text-gray-300 flex items-start gap-4">
              <ShieldCheck className="w-5 h-5 text-[#123D2A] dark:text-white shrink-0" />
              <span className="leading-relaxed">
                Mit dem Veröffentlichen bestätigst du, dass dein Artikel den redaktionellen Community-Regeln der BE HALAL Plattform entspricht.
              </span>
            </div>
          </div>
        )}

        {/* WIZARD NAVIGATION FOOTER */}
        <div className="pt-12 mt-12 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-3 text-[11px] font-bold text-gray-500 hover:text-[#171A17] dark:hover:text-white uppercase tracking-widest flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.goBack}</span>
            </button>
          ) : <div />}

          {step < 7 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-8 py-4 bg-[#123D2A] dark:bg-white text-white dark:text-[#171A17] text-[11px] font-bold uppercase tracking-widest hover:bg-[#171A17] dark:hover:bg-gray-200 flex items-center gap-2 transition-colors"
            >
              <span>Weiter</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handlePublish}
              className="px-8 py-4 bg-[#123D2A] dark:bg-[#F4C430] text-white dark:text-[#171A17] text-[11px] font-bold uppercase tracking-widest hover:bg-[#171A17] dark:hover:bg-white flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Wird veröffentlicht...' : t.publishListing}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
