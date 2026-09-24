import React, { useState } from 'react';
import { 
  Plus, Upload, Trash2, Check, ArrowRight, ArrowLeft, 
  Sparkles, AlertTriangle, ShieldCheck, Eye, ImageIcon, 
  DollarSign, MapPin, Truck, Package, BriefcaseBusiness, Ship, CarFront, Building2, Gift,
  Bike, Wrench, House, Map, Palmtree, Warehouse, KeyRound, Tag, type LucideIcon
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  ListingType, ListingCondition, DeliveryType, 
  ListingImage, Listing 
} from '../../types';
import { storage } from '../../services/storage';
import { checkListingModeration } from '../../services/moderation';
import { createListingWithImages } from '../../utils/supabase/marketplace';
import {
  AUTO_MOTOR_CATEGORIES,
  getListingDurationDays,
  getListingFee,
  LISTING_OFFER_OPTIONS,
  REAL_ESTATE_CATEGORIES,
  ListingOffer,
  RealEstateAction,
} from '../../data/listingOffers';

const detailInputClass = 'w-full border-2 border-dashed border-[#F4C430] bg-transparent px-3 py-3 text-sm font-bold text-[#171A17] focus:border-[#123D2A] focus:outline-none dark:border-[#F4C430] dark:text-white dark:focus:border-white';

interface DetailInputProps {
  label: string;
  value: string | number | boolean | null | undefined;
  onChange: (value: string) => void;
  type?: 'text' | 'number' | 'date';
  placeholder?: string;
}

const DetailInput: React.FC<DetailInputProps> = ({ label, value, onChange, type = 'text', placeholder }) => (
  <label className="space-y-2">
    <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</span>
    <input
      type={type}
      min={type === 'number' ? 0 : undefined}
      value={value ?? ''}
      onChange={(event) => {
        const nextValue = event.target.value;
        if (type === 'number' && nextValue.startsWith('-')) return;
        onChange(nextValue);
      }}
      placeholder={placeholder}
      className={detailInputClass}
    />
  </label>
);

const PRIVATE_DETAIL_FIELDS: Record<string, { key: string; label: string; type?: 'text' | 'number'; placeholder?: string }[]> = {
  'fashion-accessories': [
    { key: 'size', label: 'Größe', placeholder: 'z. B. 38, M, 42' },
    { key: 'material', label: 'Material' },
  ],
  'baby-kids': [
    { key: 'ageRange', label: 'Alter / Größe', placeholder: 'z. B. 2–3 Jahre oder 98' },
    { key: 'material', label: 'Material' },
  ],
  electronics: [
    { key: 'model', label: 'Modell / genaue Bezeichnung' },
    { key: 'storage', label: 'Speicher', placeholder: 'z. B. 256 GB' },
    { key: 'warranty', label: 'Garantie bis' },
  ],
  household: [
    { key: 'dimensions', label: 'Maße', placeholder: 'Länge × Breite × Höhe' },
    { key: 'material', label: 'Material' },
  ],
  'furniture-living': [
    { key: 'dimensions', label: 'Maße', placeholder: 'Länge × Breite × Höhe' },
    { key: 'material', label: 'Material' },
  ],
  'sports-leisure': [
    { key: 'size', label: 'Größe', placeholder: 'Rahmen, Konfektion oder Schuhgröße' },
    { key: 'material', label: 'Material' },
  ],
  'books-media': [
    { key: 'author', label: 'Autor / Herausgeber' },
    { key: 'isbn', label: 'ISBN' },
    { key: 'language', label: 'Sprache' },
  ],
  gaming: [
    { key: 'platform', label: 'Plattform', placeholder: 'PlayStation, Xbox, Switch, PC' },
    { key: 'edition', label: 'Edition / Version' },
  ],
  'auto-accessories': [
    { key: 'compatibility', label: 'Fahrzeug-Kompatibilität' },
    { key: 'partNumber', label: 'Teilenummer' },
  ],
  'garden-tools': [
    { key: 'powerSource', label: 'Antrieb', placeholder: 'Akku, Strom, Benzin, Handbetrieb' },
    { key: 'dimensions', label: 'Maße' },
  ],
  other: [
    { key: 'material', label: 'Material' },
    { key: 'dimensions', label: 'Maße' },
  ],
};

const VEHICLE_ICONS: Record<string, LucideIcon> = {
  cars: CarFront,
  'motorcycles-quads': Bike,
  'commercial-vehicles': Truck,
  'caravans-motorhomes': House,
  'spare-parts-accessories': Wrench,
};

const REAL_ESTATE_ICONS: Record<string, LucideIcon> = {
  house: House,
  apartment: Building2,
  land: Map,
  'commercial-property': Warehouse,
  'holiday-property': Palmtree,
  'other-property': Tag,
};

export const ListingWizard: React.FC = () => {
  const { user, categories, navigate, showToast, config, t, language } = useApp();

  const [step, setStep] = useState(1);

  // Form State
  const [offerType, setOfferType] = useState<ListingOffer>('PRIVATE');
  const [type, setType] = useState<ListingType>('SELL');
  const [realEstateAction, setRealEstateAction] = useState<RealEstateAction>('SELL');
  const [categoryId, setCategoryId] = useState<string>('baby-kids');
  const [subcategoryId, setSubcategoryId] = useState<string>('strollers');
  const [images, setImages] = useState<ListingImage[]>([]);
  const [pendingImageFiles, setPendingImageFiles] = useState<Record<string, File>>({});
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
  const [details, setDetails] = useState<Record<string, string | number | boolean | null>>({});
  
  // Validation / Warning states
  const [moderationWarning, setModerationWarning] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxPhotos = offerType === 'REAL_ESTATE' ? Infinity : config.maxPhotosPerListing;
  const listingFee = getListingFee(offerType, subcategoryId, realEstateAction);
  const listingDurationDays = offerType === 'PRIVATE' ? config.listingExpiryDays : getListingDurationDays(offerType);
  const showGenericBrand = !['REAL_ESTATE', 'AUTO_MOTOR', 'BOATS'].includes(offerType);
  const showCondition = offerType !== 'REAL_ESTATE' && !(offerType === 'PRIVATE' && type === 'WANTED');
  const privateDetailFields = PRIVATE_DETAIL_FIELDS[categoryId] ?? [];

  const updateDetail = (key: string, value: string | number | boolean | null) => {
    setDetails((currentDetails) => ({ ...currentDetails, [key]: value }));
  };

  const chooseOfferType = (nextOffer: ListingOffer) => {
    setOfferType(nextOffer);
    setType(nextOffer === 'PRIVATE' ? 'SELL' : 'SELL');
    if (nextOffer === 'BOATS') {
      setCategoryId('boats');
      setSubcategoryId('boats-yachts-jetskis');
    } else if (nextOffer === 'AUTO_MOTOR') {
      setCategoryId('auto-motor');
      setSubcategoryId('cars');
    } else if (nextOffer === 'REAL_ESTATE') {
      setCategoryId('real-estate');
      setSubcategoryId('house');
    } else if (nextOffer === 'PRIVATE') {
      setCategoryId('baby-kids');
      setSubcategoryId('strollers');
    }
  };

  // Pre-set stock images for quick addition
  const sampleStockImages = [
    'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800',
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800',
    'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800',
    'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800',
  ];

  const handleAddImage = (url: string) => {
    if (images.length >= maxPhotos) {
      showToast(`Maximal ${maxPhotos} Bilder erlaubt.`, 'warning');
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
    const files = (Array.from(e.target.files ?? []) as File[]).filter((file) => file.type.startsWith('image/'));
    const availableSlots = Number.isFinite(maxPhotos) ? maxPhotos - images.length : files.length;

    if (files.length === 0) {
      showToast('Bitte wähle eine Bilddatei aus.', 'warning');
      return;
    }

    if (availableSlots <= 0) {
      showToast(`Maximal ${maxPhotos} Bilder erlaubt.`, 'warning');
      return;
    }

    const selectedFiles = files.slice(0, availableSlots);
    const newImages = selectedFiles.map((file, index) => {
      const id = `upload-${Date.now()}-${index}-${Math.random()}`;
      return {
        id,
        url: URL.createObjectURL(file),
        sortOrder: images.length + index,
        isCover: images.length === 0 && index === 0,
      };
    });

    setImages((currentImages) => [...currentImages, ...newImages]);
    setPendingImageFiles((currentFiles) => ({
      ...currentFiles,
      ...Object.fromEntries(newImages.map((image, index) => [image.id, selectedFiles[index]])),
    }));
    showToast(`${selectedFiles.length} Foto${selectedFiles.length === 1 ? '' : 's'} ausgewählt.`, 'success');

    if (files.length > selectedFiles.length) {
      showToast(`Nur ${maxPhotos} Bilder sind pro Inserat erlaubt.`, 'warning');
    }

    e.target.value = '';
  };

  const handleSetCover = (id: string) => {
    setImages(images.map((img) => ({ ...img, isCover: img.id === id })));
  };

  const handleDeleteImage = (id: string) => {
    const imageToDelete = images.find((image) => image.id === id);
    if (imageToDelete && pendingImageFiles[id]) {
      URL.revokeObjectURL(imageToDelete.url);
    }
    const filtered = images.filter((img) => img.id !== id);
    if (filtered.length > 0 && !filtered.some((img) => img.isCover)) {
      filtered[0] = { ...filtered[0], isCover: true };
    }
    setImages(filtered);
    setPendingImageFiles((currentFiles) => {
      const nextFiles = { ...currentFiles };
      delete nextFiles[id];
      return nextFiles;
    });
  };

  const handleValidateStep4 = () => {
    const hasNegativeValue = [price, maxBudget, ...Object.values(details)].some((value) => {
      if (typeof value === 'number') return value < 0;
      return typeof value === 'string' && /^\s*-/.test(value);
    });
    if (hasNegativeValue) {
      showToast('Negative Werte sind nicht erlaubt.', 'warning');
      return false;
    }
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

  const handlePublish = async () => {
    if (!user) {
      showToast(t.closedCommunityNotice, 'warning');
      navigate('login');
      return;
    }

    setIsSubmitting(true);

    const isFree = type === 'FREE';
    const parsedPrice = isFree ? 0 : Number(price) || 0;
    const parsedBudget = type === 'WANTED' ? Number(maxBudget) || parsedPrice : undefined;

    const draft: Listing = {
      id: '',
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
      images,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + listingDurationDays * 24 * 60 * 60 * 1000).toISOString(),
      listingFee,
      listingDurationDays,
      details: {
        ...details,
        offerType,
        realEstateAction: offerType === 'REAL_ESTATE' ? realEstateAction : null,
      },
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

    try {
      const persisted = await createListingWithImages(
        { ...draft, status: 'ACTIVE' as const },
        images,
        Object.entries(pendingImageFiles).map(([id, file]) => ({ id, file: file as File })),
      );
      const newListing: Listing = {
        ...draft,
        id: persisted.id,
        images: persisted.images,
      };

      storage.saveListing(newListing);
      showToast(t.listingCreatedSuccess, 'success');
      navigate('listing-detail', { id: newListing.id });
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Das Inserat konnte nicht veröffentlicht werden.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategoryObj = categories.find((c) => c.id === categoryId);
  const availableCategories = categories.filter((category) => {
    if (offerType === 'BOATS') return category.id === 'boats';
    if (offerType === 'AUTO_MOTOR') return category.id === 'auto-motor';
    if (offerType === 'REAL_ESTATE') return category.id === 'real-estate';
    if (offerType === 'PRIVATE') return !['auto-motor', 'boats', 'real-estate'].includes(category.id);
    return !['auto-motor', 'boats', 'real-estate'].includes(category.id);
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-16">
      
      {/* WIZARD HEADER & PROGRESS BAR */}
      <div className="space-y-6 text-center">
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-[#171A17] dark:text-white">
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
            <h2 className="font-serif font-bold text-2xl text-[#171A17] dark:text-white text-center mb-8">
              Welche Art von Anzeige möchtest du erstellen?
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {LISTING_OFFER_OPTIONS.map((offer) => {
                const isSelected = offerType === offer.id;
                const Icon = offer.id === 'PRIVATE' ? Gift : offer.id === 'COMMERCIAL' ? BriefcaseBusiness : offer.id === 'BOATS' ? Ship : offer.id === 'AUTO_MOTOR' ? CarFront : Building2;
                return (
                  <button
                    key={offer.id}
                    type="button"
                    onClick={() => chooseOfferType(offer.id)}
                    className={`flex items-center gap-5 border px-5 py-5 text-left transition-colors ${isSelected ? 'border-[#123D2A] bg-[#123D2A] text-white dark:border-[#F4C430] dark:bg-[#F4C430] dark:text-[#171A17]' : 'border-gray-200 hover:border-[#123D2A] dark:border-white/10 dark:hover:border-[#F4C430]'}`}
                  >
                    <Icon className={`h-7 w-7 shrink-0 ${isSelected ? 'text-[#F4C430] dark:text-[#123D2A]' : 'text-[#123D2A] dark:text-[#F4C430]'}`} />
                    <span className="min-w-0 flex-1">
                      <span className="block font-serif text-xl font-bold">{offer.title}</span>
                      <span className={`mt-1 block text-xs ${isSelected ? 'text-white/75 dark:text-[#171A17]/70' : 'text-gray-500'}`}>{offer.description}</span>
                    </span>
                    <span className="shrink-0 text-right text-[10px] font-bold uppercase tracking-widest">
                      <span className="block">{offer.feeLabel}</span>
                      <span className={`mt-1 block font-normal tracking-normal ${isSelected ? 'text-white/70 dark:text-[#171A17]/70' : 'text-gray-500'}`}>{offer.durationLabel}</span>
                    </span>
                    {isSelected && <Check className="h-5 w-5 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {offerType === 'PRIVATE' && (
              <div className="border-t border-gray-200 pt-7 dark:border-white/10">
                <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Was möchtest du anbieten?</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    { id: 'SELL' as const, title: t.typeSell, description: t.step1SellDesc },
                    { id: 'FREE' as const, title: t.typeFree, description: t.step1FreeDesc },
                    { id: 'WANTED' as const, title: t.typeWanted, description: t.step1WantedDesc },
                  ].map((item) => (
                    <button key={item.id} type="button" onClick={() => setType(item.id)} className={`border px-4 py-4 text-left ${type === item.id ? 'border-[#123D2A] text-[#123D2A] dark:border-[#F4C430] dark:text-[#F4C430]' : 'border-gray-200 text-gray-500 dark:border-white/10'}`}>
                      <span className="block font-bold">{item.title}</span>
                      <span className="mt-1 block text-[10px] uppercase tracking-widest">{item.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 2: KATEGORIE */}
        {/* ==================================================== */}
        {step === 2 && (
          <div className="space-y-8 animate-fade-in">
            <h2 className="font-serif font-bold text-2xl text-[#171A17] dark:text-white text-center mb-8">
              {t.step2SelectCat}
            </h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 max-h-96 overflow-y-auto">
              {availableCategories.map((c) => {
                const isSelected = categoryId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setCategoryId(c.id);
                      setSubcategoryId(c.subcategories[0]?.id || '');
                    }}
                    className={`py-3 text-left font-serif font-bold text-lg transition-colors border-b ${
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
                {offerType === 'AUTO_MOTOR' ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {AUTO_MOTOR_CATEGORIES.map((vehicle) => {
                      const isSubSelected = subcategoryId === vehicle.id;
                      const VehicleIcon = VEHICLE_ICONS[vehicle.id] ?? CarFront;
                      return (
                        <button
                          key={vehicle.id}
                          type="button"
                          onClick={() => setSubcategoryId(vehicle.id)}
                          className={`border p-4 text-left transition-colors ${isSubSelected ? 'border-[#123D2A] bg-[#123D2A] text-white dark:border-[#F4C430] dark:bg-[#F4C430] dark:text-[#171A17]' : 'border-gray-200 text-[#171A17] hover:border-[#123D2A] dark:border-white/10 dark:text-white dark:hover:border-[#F4C430]'}`}
                        >
                          <VehicleIcon className={`mb-4 h-7 w-7 ${isSubSelected ? 'text-[#F4C430] dark:text-[#123D2A]' : 'text-[#F4C430]'}`} />
                          <span className="block font-serif text-lg font-bold">{vehicle.title}</span>
                          <span className={`mt-1 block text-xs leading-relaxed ${isSubSelected ? 'text-white/75 dark:text-[#171A17]/70' : 'text-gray-500'}`}>{vehicle.description}</span>
                          <span className={`mt-4 block border-t pt-3 text-[10px] font-bold uppercase tracking-widest ${isSubSelected ? 'border-white/20 text-[#F4C430] dark:border-[#171A17]/20 dark:text-[#123D2A]' : 'border-gray-200 text-[#123D2A] dark:border-white/10 dark:text-[#F4C430]'}`}>Inseratspreis: Ab € 0</span>
                        </button>
                      );
                    })}
                  </div>
                ) : offerType === 'REAL_ESTATE' ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {REAL_ESTATE_CATEGORIES.map((property) => {
                      const isSubSelected = subcategoryId === property.id;
                      const PropertyIcon = REAL_ESTATE_ICONS[property.id] ?? Building2;
                      return (
                        <button
                          key={property.id}
                          type="button"
                          onClick={() => setSubcategoryId(property.id)}
                          className={`border p-4 text-left transition-colors ${isSubSelected ? 'border-[#123D2A] bg-[#123D2A] text-white dark:border-[#F4C430] dark:bg-[#F4C430] dark:text-[#171A17]' : 'border-gray-200 text-[#171A17] hover:border-[#123D2A] dark:border-white/10 dark:text-white dark:hover:border-[#F4C430]'}`}
                        >
                          <PropertyIcon className={`mb-4 h-7 w-7 ${isSubSelected ? 'text-[#F4C430] dark:text-[#123D2A]' : 'text-[#F4C430]'}`} />
                          <span className="block font-serif text-lg font-bold">{property.title}</span>
                          <span className={`mt-1 block text-xs leading-relaxed ${isSubSelected ? 'text-white/75 dark:text-[#171A17]/70' : 'text-gray-500'}`}>{property.description}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {selectedCategoryObj.subcategories.map((sub) => {
                      const isSubSelected = subcategoryId === sub.id;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => setSubcategoryId(sub.id)}
                          className={`border px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${isSubSelected ? 'border-[#123D2A] bg-[#123D2A] text-white dark:border-white dark:bg-white dark:text-[#171A17]' : 'border-gray-300 bg-transparent text-gray-500 dark:border-white/20'}`}
                        >
                          {sub.name[language]}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {offerType === 'REAL_ESTATE' && (
              <div className="border-t border-gray-200 pt-8 dark:border-white/10">
                <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Art des Inserats</p>
                <div className="grid grid-cols-2 gap-3">
                  {(['SELL', 'RENT'] as const).map((action) => (
                    <button key={action} type="button" onClick={() => setRealEstateAction(action)} className={`flex items-center justify-between gap-4 border px-5 py-4 text-left ${realEstateAction === action ? 'border-[#123D2A] bg-[#123D2A] text-white dark:border-[#F4C430] dark:bg-[#F4C430] dark:text-[#171A17]' : 'border-gray-200 text-gray-500 dark:border-white/10'}`}>
                      <span>
                        <span className="block font-serif text-lg font-bold">{action === 'SELL' ? 'Verkaufen' : 'Vermieten'}</span>
                        <span className="mt-1 block text-xs">€ {getListingFee(offerType, subcategoryId, action).toFixed(2)} · 30 Tage</span>
                      </span>
                      {action === 'SELL' ? <House className={`h-7 w-7 shrink-0 ${realEstateAction === action ? 'text-[#F4C430] dark:text-[#123D2A]' : 'text-[#F4C430]'}`} /> : <KeyRound className={`h-7 w-7 shrink-0 ${realEstateAction === action ? 'text-[#F4C430] dark:text-[#123D2A]' : 'text-[#F4C430]'}`} />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {offerType === 'AUTO_MOTOR' && (
              <div className="border-t border-gray-200 pt-8 dark:border-white/10">
                <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Fahrzeugbereich</p>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  {AUTO_MOTOR_CATEGORIES.filter((item) => item.id === subcategoryId).map((item) => <p key={item.id}>{item.description}</p>)}
                  <p className="font-bold text-[#123D2A] dark:text-[#F4C430]">Inseratspreis: Ab € 0</p>
                </div>
              </div>
            )}

            {offerType === 'BOATS' && (
              <div className="border-t border-gray-200 pt-8 text-sm text-gray-600 dark:border-white/10 dark:text-gray-300">
                <p>Boote, Yachten und Jetskis werden 60 Tage für € 44,99 veröffentlicht.</p>
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
              <h2 className="font-serif font-bold text-2xl text-[#171A17] dark:text-white">
                {t.wizardStep3}
              </h2>
              <p className="font-sans text-[10px] uppercase tracking-widest text-gray-500 mt-2">
                {images.length} von {Number.isFinite(maxPhotos) ? maxPhotos : 'unbegrenzt'} • {t.step3UploadNotice}
              </p>
            </div>

            {/* UPLOAD DROPZONE */}
            <div className="py-16 border border-dashed border-gray-300 dark:border-white/20 text-center space-y-6 hover:border-[#123D2A] dark:hover:border-white transition-colors cursor-pointer group">
              <Upload className="w-8 h-8 text-gray-300 group-hover:text-[#123D2A] dark:group-hover:text-white mx-auto transition-colors" />
              <div>
                <p className="font-serif font-bold text-xl text-[#171A17] dark:text-white">
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
            <h2 className="font-serif font-bold text-2xl text-[#171A17] dark:text-white text-center mb-8">
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
                className={`${detailInputClass} font-serif text-xl placeholder:font-sans placeholder:text-sm placeholder:tracking-widest`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {showGenericBrand && <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {t.brandField}
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="z.B. Apple, IKEA"
                  className={detailInputClass}
                />
              </div>}

              {showCondition && <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Zustand *
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as ListingCondition)}
                  className={detailInputClass}
                >
                  <option value="NEW" className="dark:bg-[#111511]">{t.conditionNew}</option>
                  <option value="LIKE_NEW" className="dark:bg-[#111511]">{t.conditionLikeNew}</option>
                  <option value="VERY_GOOD" className="dark:bg-[#111511]">{t.conditionVeryGood}</option>
                  <option value="GOOD" className="dark:bg-[#111511]">{t.conditionGood}</option>
                  <option value="USED" className="dark:bg-[#111511]">{t.conditionUsed}</option>
                  <option value="DEFECTIVE" className="dark:bg-[#111511]">{t.conditionDefective}</option>
                </select>
              </div>}
            </div>

            {offerType !== 'PRIVATE' && (
              <div className="space-y-6 border-y border-gray-200 py-7 dark:border-white/10">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#123D2A] dark:text-[#F4C430]">Spezifische Angaben</p>
                  <p className="mt-2 text-sm text-gray-500">Diese Angaben helfen Interessenten, das Angebot schnell und verlässlich einzuschätzen.</p>
                </div>

                {offerType === 'COMMERCIAL' && (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <DetailInput label="Unternehmen / Anbieter *" value={details.companyName} onChange={(value) => updateDetail('companyName', value)} />
                    <DetailInput label="Ansprechperson *" value={details.contactName} onChange={(value) => updateDetail('contactName', value)} />
                    <DetailInput label="Geschäftliche E-Mail *" type="text" value={details.businessEmail} onChange={(value) => updateDetail('businessEmail', value)} />
                    <DetailInput label="UID-Nummer" value={details.vatId} onChange={(value) => updateDetail('vatId', value)} placeholder="ATU..." />
                    <DetailInput label="Website" value={details.website} onChange={(value) => updateDetail('website', value)} placeholder="https://" />
                  </div>
                )}

                {offerType === 'BOATS' && (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <DetailInput label="Hersteller *" value={details.manufacturer} onChange={(value) => updateDetail('manufacturer', value)} />
                    <DetailInput label="Modell *" value={details.model} onChange={(value) => updateDetail('model', value)} />
                    <DetailInput label="Baujahr" type="number" value={details.year} onChange={(value) => updateDetail('year', value)} />
                    <DetailInput label="Länge in Metern" type="number" value={details.lengthMeters} onChange={(value) => updateDetail('lengthMeters', value)} />
                    <DetailInput label="Motorleistung in PS" type="number" value={details.enginePower} onChange={(value) => updateDetail('enginePower', value)} />
                    <DetailInput label="Motorstunden" type="number" value={details.engineHours} onChange={(value) => updateDetail('engineHours', value)} />
                    <DetailInput label="Liegeplatz / Standort" value={details.berth} onChange={(value) => updateDetail('berth', value)} />
                    <DetailInput label="Treibstoff" value={details.fuel} onChange={(value) => updateDetail('fuel', value)} placeholder="Benzin, Diesel, Elektro" />
                  </div>
                )}

                {offerType === 'AUTO_MOTOR' && (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <DetailInput label="Marke *" value={details.make} onChange={(value) => updateDetail('make', value)} />
                    <DetailInput label="Modell *" value={details.model} onChange={(value) => updateDetail('model', value)} />
                    <DetailInput label="Erstzulassung" type="date" value={details.firstRegistration} onChange={(value) => updateDetail('firstRegistration', value)} />
                    <DetailInput label="Kilometerstand" type="number" value={details.mileage} onChange={(value) => updateDetail('mileage', value)} />
                    <DetailInput label="Leistung in PS" type="number" value={details.power} onChange={(value) => updateDetail('power', value)} />
                    <DetailInput label="Kraftstoff" value={details.fuel} onChange={(value) => updateDetail('fuel', value)} placeholder="Benzin, Diesel, Hybrid" />
                    <DetailInput label="Getriebe" value={details.transmission} onChange={(value) => updateDetail('transmission', value)} placeholder="Automatik oder Schaltung" />
                    <DetailInput label="Pickerl / HU gültig bis" type="date" value={details.inspectionValidUntil} onChange={(value) => updateDetail('inspectionValidUntil', value)} />
                  </div>
                )}

                {offerType === 'REAL_ESTATE' && (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <DetailInput label="Wohnfläche / Nutzfläche in m² *" type="number" value={details.livingAreaSqm} onChange={(value) => updateDetail('livingAreaSqm', value)} />
                    <DetailInput label="Grundstücksfläche in m²" type="number" value={details.plotAreaSqm} onChange={(value) => updateDetail('plotAreaSqm', value)} />
                    <DetailInput label="Zimmer" type="number" value={details.rooms} onChange={(value) => updateDetail('rooms', value)} />
                    <DetailInput label="Schlafzimmer" type="number" value={details.bedrooms} onChange={(value) => updateDetail('bedrooms', value)} />
                    <DetailInput label="Baujahr" type="number" value={details.yearBuilt} onChange={(value) => updateDetail('yearBuilt', value)} />
                    <DetailInput label="Etage" value={details.floor} onChange={(value) => updateDetail('floor', value)} placeholder="EG, 1. OG, Dachgeschoss" />
                    <DetailInput label="Heizung" value={details.heating} onChange={(value) => updateDetail('heating', value)} placeholder="Gas, Fernwärme, Wärmepumpe" />
                    <DetailInput label="Parkplätze / Stellplätze" type="number" value={details.parkingSpaces} onChange={(value) => updateDetail('parkingSpaces', value)} />
                    <DetailInput label={realEstateAction === 'SELL' ? 'Kaufpreis (€) *' : 'Monatlicher Mietpreis (€) *'} type="number" value={price} onChange={setPrice} />
                    <DetailInput label="Verfügbar ab" type="date" value={details.availableFrom} onChange={(value) => updateDetail('availableFrom', value)} />
                  </div>
                )}

                <div className="border-t border-gray-200 pt-5 dark:border-white/10">
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-gray-500">Anzeigenpreis</span>
                    <span className="font-bold text-[#123D2A] dark:text-[#F4C430]">€ {listingFee.toFixed(2)} · {listingDurationDays} Tage</span>
                  </div>
                  {offerType === 'REAL_ESTATE' && <p className="mt-2 text-xs text-gray-500">Immobilienanzeigen erlauben unbegrenzt viele Bilder.</p>}
                </div>
              </div>
            )}

            {offerType === 'PRIVATE' && type === 'WANTED' && (
              <div className="space-y-2 border-y border-gray-200 py-6 dark:border-white/10">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">Gewünschter Zustand</label>
                <select
                  value={String(details.preferredCondition ?? '')}
                  onChange={(event) => updateDetail('preferredCondition', event.target.value)}
                  className={detailInputClass}
                >
                  <option value="" className="dark:bg-[#111511]">Beliebig</option>
                  <option value="NEW" className="dark:bg-[#111511]">Neu</option>
                  <option value="LIKE_NEW" className="dark:bg-[#111511]">Wie neu</option>
                  <option value="USED" className="dark:bg-[#111511]">Gebraucht</option>
                </select>
              </div>
            )}

            {offerType === 'PRIVATE' && type !== 'WANTED' && privateDetailFields.length > 0 && (
              <div className="space-y-6 border-y border-gray-200 py-7 dark:border-white/10">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#123D2A] dark:text-[#F4C430]">Weitere Angaben</p>
                  <p className="mt-2 text-sm text-gray-500">Optionale Details helfen anderen Mitgliedern bei der Einschätzung.</p>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {privateDetailFields.map((field) => (
                    <DetailInput
                      key={field.key}
                      label={field.label}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={details[field.key]}
                      onChange={(value) => updateDetail(field.key, value)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* PREIS ODER BUDGET */}
            {type === 'SELL' && offerType !== 'REAL_ESTATE' && (
              <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-white/10">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Preis (€) *
                </label>
                <div className="flex items-center gap-8">
                  <div className="relative flex-1 max-w-[200px]">
                    <span className="absolute left-0 bottom-2 font-serif font-bold text-2xl text-[#171A17] dark:text-white">€</span>
                    <input
                      type="number"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value.startsWith('-') ? '' : e.target.value)}
                      placeholder="0"
                      className={`${detailInputClass} pl-8 font-serif text-3xl`}
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
                  <span className="absolute left-0 bottom-2 font-serif font-bold text-2xl text-[#171A17] dark:text-white">€</span>
                  <input
                    type="number"
                    min="0"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value.startsWith('-') ? '' : e.target.value)}
                    placeholder="0"
                    className={`${detailInputClass} pl-8 font-serif text-3xl`}
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
                className={`${detailInputClass} min-h-32 resize-none leading-relaxed`}
              />
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 5: ÜBERGABE & VERSAND */}
        {/* ==================================================== */}
        {step === 5 && (
          <div className="space-y-8 animate-fade-in">
            <h2 className="font-serif font-bold text-2xl text-[#171A17] dark:text-white text-center mb-8">
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
                    <h3 className="font-serif font-bold text-xl mb-1">{t.deliveryPickup}</h3>
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
                    <h3 className="font-serif font-bold text-xl mb-1">{t.deliveryShipping}</h3>
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
                    <h3 className="font-serif font-bold text-xl mb-1">{t.deliveryBoth}</h3>
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
              <h2 className="font-serif font-bold text-2xl text-[#171A17] dark:text-white">
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
                  className={detailInputClass}
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
                  className={detailInputClass}
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
                className={`${detailInputClass} appearance-none`}
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
              <h2 className="font-serif font-bold text-2xl text-[#171A17] dark:text-white">
                Vorschau deines Inserats
              </h2>
              <p className="font-sans text-[10px] uppercase tracking-widest text-gray-500 mt-2">
                So wird dein Inserat für andere verifizierte Mitglieder der ONLINE BAZAR Community angezeigt.
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
                  <h3 className="font-serif font-bold text-3xl text-[#171A17] dark:text-white mb-2">
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
                Mit dem Veröffentlichen bestätigst du, dass dein Artikel den redaktionellen Community-Regeln der ONLINE BAZAR Plattform entspricht.
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
