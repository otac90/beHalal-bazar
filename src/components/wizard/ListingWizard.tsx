import React, { useState } from 'react';
import { 
  Plus, Upload, Trash2, Check, ArrowRight, ArrowLeft, 
  Sparkles, AlertTriangle, ShieldCheck, Eye, ImageIcon, 
  DollarSign, MapPin, Truck, Package, BriefcaseBusiness, Ship, CarFront, Building2, Gift,
  Bike, Wrench, House, Map, Palmtree, Warehouse, KeyRound, Tag, Sailboat, Anchor, Waves, CreditCard, LockKeyhole, CheckCircle2,
  Shirt, Baby, Smartphone, Tablet, Laptop, Tv, Headphones, Camera, Utensils, Armchair, BookOpen, Gamepad2, Car, Layers, Sofa, BedDouble, Table2, Lamp, BookMarked, Joystick, type LucideIcon
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  ListingType, ListingCondition, DeliveryType, 
  ListingImage, Listing 
} from '../../types';
import { storage } from '../../services/storage';
import { checkListingModeration } from '../../services/moderation';
import { createListingWithImages } from '../../utils/supabase/marketplace';
import { createListingCheckout } from '../../utils/stripe';
import {
  AUTO_MOTOR_CATEGORIES,
  BOAT_CATEGORIES,
  getListingDurationDays,
  getListingFee,
  LISTING_OFFER_OPTIONS,
  REAL_ESTATE_CATEGORIES,
  ListingOffer,
  RealEstateAction,
} from '../../data/listingOffers';

const detailInputClass = 'w-full border border-[#123D2A]/20 bg-white/80 px-4 py-3 text-sm font-bold text-[#171A17] outline-none transition focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/25 dark:border-white/15 dark:bg-[#111511] dark:text-white dark:focus:border-[#F4C430]';

interface DetailInputProps {
  label: string;
  value: string | number | boolean | null | undefined;
  onChange: (value: string) => void;
  type?: 'text' | 'number' | 'date';
  placeholder?: string;
  options?: string[];
  disabled?: boolean;
}

const DetailInput: React.FC<DetailInputProps> = ({ label, value, onChange, type = 'text', placeholder, options, disabled }) => (
  <label className="space-y-2">
    <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</span>
    {options ? (
      <select disabled={disabled} value={String(value ?? '')} onChange={(event) => onChange(event.target.value)} className={`${detailInputClass} appearance-none disabled:cursor-not-allowed disabled:opacity-50`}>
        <option value="" className="dark:bg-[#111511]">{placeholder ?? 'Bitte auswählen'}</option>
        {options.map((option) => <option key={option} value={option} className="dark:bg-[#111511]">{option}</option>)}
      </select>
    ) : (
      <input
        type={type}
        disabled={disabled}
        min={type === 'number' ? 0 : undefined}
        value={value ?? ''}
        onChange={(event) => {
          const nextValue = event.target.value;
          if (type === 'number' && nextValue.startsWith('-')) return;
          onChange(nextValue);
        }}
        placeholder={placeholder}
        className={`${detailInputClass} disabled:cursor-not-allowed disabled:opacity-50`}
      />
    )}
  </label>
);

const NegotiableToggle: React.FC<{ checked: boolean; onChange: (checked: boolean) => void }> = ({ checked, onChange }) => (
  <label className="flex cursor-pointer items-center gap-3">
    <span className={`flex h-5 w-5 items-center justify-center border transition-colors ${checked ? 'border-[#123D2A] bg-[#123D2A] dark:border-white dark:bg-white' : 'border-gray-400'}`}>
      {checked && <Check className="h-3.5 w-3.5 text-white dark:text-[#171A17]" />}
    </span>
    <span className={`text-xs uppercase tracking-widest ${checked ? 'font-bold text-[#123D2A] dark:text-white' : 'text-gray-500'}`}>Verhandlungsbasis (VB)</span>
    <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="sr-only" />
  </label>
);

type DetailField = { key: string; label: string; type?: 'text' | 'number' | 'date'; placeholder?: string; options?: string[] };

const SMARTPHONE_BRANDS = [
  'Apple', 'Samsung', 'Xiaomi', 'Google', 'Huawei', 'Motorola', 'OnePlus', 'OPPO', 'vivo', 'HONOR',
  'realme', 'Nokia', 'Sony', 'ASUS', 'Nothing', 'Fairphone', 'TCL', 'ZTE', 'Lenovo', 'CAT', 'Doro', 'Wiko', 'Andere',
];
const TABLET_BRANDS = ['Apple', 'Samsung', 'Lenovo', 'Microsoft', 'Xiaomi', 'Huawei', 'Google', 'Amazon', 'HUAWEI', 'ASUS', 'Andere'];
const COMPUTER_BRANDS = ['Apple', 'Lenovo', 'HP', 'Dell', 'ASUS', 'Acer', 'Microsoft', 'MSI', 'Huawei', 'Samsung', 'Medion', 'Andere'];
const TV_BRANDS = ['Samsung', 'LG', 'Sony', 'Philips', 'Panasonic', 'TCL', 'Hisense', 'Grundig', 'Sharp', 'Metz', 'Andere'];
const APPLIANCE_BRANDS = ['Bosch', 'Siemens', 'Miele', 'AEG', 'Samsung', 'LG', 'Beko', 'Gorenje', 'Philips', 'Dyson', 'Andere'];
const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '34', '36', '38', '40', '42', '44', '46', '48', '50', 'Andere'];
const MATERIAL_OPTIONS = ['Baumwolle', 'Leder', 'Holz', 'Metall', 'Kunststoff', 'Glas', 'Wolle', 'Keramik', 'Andere'];
const TABLET_SCREEN_SIZES = ['7 Zoll', '8 Zoll', '8,3 Zoll', '9 Zoll', '10,1 Zoll', '10,9 Zoll', '11 Zoll', '12,4 Zoll', '12,9 Zoll', '13 Zoll', 'Andere'];
const TV_SCREEN_SIZES = ['24 Zoll', '32 Zoll', '40 Zoll', '43 Zoll', '48 Zoll', '50 Zoll', '55 Zoll', '58 Zoll', '65 Zoll', '70 Zoll', '75 Zoll', '77 Zoll', '83 Zoll', '85 Zoll', '98 Zoll', 'Andere'];
const PROCESSOR_MANUFACTURERS = ['Intel', 'AMD', 'Apple', 'Qualcomm', 'MediaTek', 'NVIDIA', 'Andere'];
const PROCESSORS_BY_MANUFACTURER: Record<string, string[]> = {
  Intel: ['Core Ultra 3', 'Core Ultra 5', 'Core Ultra 7', 'Core Ultra 9', 'Core i3', 'Core i5', 'Core i7', 'Core i9', 'Pentium', 'Celeron', 'Xeon'],
  AMD: ['Ryzen 3', 'Ryzen 5', 'Ryzen 7', 'Ryzen 9', 'Ryzen AI 5', 'Ryzen AI 7', 'Ryzen AI 9', 'Athlon', 'Threadripper'],
  Apple: ['M1', 'M2', 'M3', 'M4', 'M1 Pro', 'M2 Pro', 'M3 Pro', 'M4 Pro', 'M1 Max', 'M2 Max', 'M3 Max', 'M4 Max'],
  Qualcomm: ['Snapdragon X Plus', 'Snapdragon X Elite', 'Snapdragon 8cx'],
  MediaTek: ['Kompanio 520', 'Kompanio 800', 'Kompanio Ultra'],
  NVIDIA: ['GeForce RTX Laptop GPU', 'GeForce GTX Laptop GPU'],
  Andere: ['ARM / RISC-V', 'Unbekannt', 'Andere'],
};
const APPLIANCE_TYPES = ['Waschmaschine', 'Wäschetrockner', 'Geschirrspüler', 'Kühlschrank', 'Gefrierschrank', 'Herd / Backofen', 'Staubsauger', 'Klimagerät', 'Sonstiges'];
const KITCHEN_APPLIANCE_TYPES = ['Kaffeemaschine', 'Küchenmaschine', 'Mikrowelle', 'Herd / Backofen', 'Geschirrspüler', 'Kühlschrank', 'Toaster', 'Wasserkocher', 'Sonstiges'];
const APPLIANCE_BRANDS_BY_TYPE: Record<string, string[]> = {
  Waschmaschine: ['Bosch', 'Siemens', 'Miele', 'AEG', 'Beko', 'Samsung', 'LG', 'Gorenje', 'Andere'],
  'Wäschetrockner': ['Bosch', 'Siemens', 'Miele', 'AEG', 'Beko', 'Samsung', 'LG', 'Gorenje', 'Andere'],
  Geschirrspüler: ['Bosch', 'Siemens', 'Miele', 'AEG', 'Beko', 'Gorenje', 'Neff', 'Andere'],
  Kühlschrank: ['Bosch', 'Siemens', 'Miele', 'Liebherr', 'AEG', 'Samsung', 'LG', 'Beko', 'Gorenje', 'Andere'],
  Gefrierschrank: ['Bosch', 'Siemens', 'Miele', 'Liebherr', 'AEG', 'Beko', 'Gorenje', 'Andere'],
  'Herd / Backofen': ['Bosch', 'Siemens', 'Miele', 'AEG', 'Neff', 'Gorenje', 'Beko', 'Andere'],
  Staubsauger: ['Dyson', 'Miele', 'Bosch', 'Siemens', 'Philips', 'Rowenta', 'AEG', 'Vorwerk', 'Andere'],
  Klimagerät: ['Daikin', 'Mitsubishi Electric', 'Panasonic', 'Samsung', 'LG', 'Toshiba', 'Andere'],
  Kaffeemaschine: ['De’Longhi', 'Jura', 'Sage', 'Siemens', 'Miele', 'Philips', 'Krups', 'Nespresso', 'Andere'],
  Küchenmaschine: ['Kenwood', 'KitchenAid', 'Bosch', 'Moulinex', 'Smeg', 'Ninja', 'Andere'],
  Mikrowelle: ['Samsung', 'Panasonic', 'Bosch', 'Siemens', 'LG', 'Sharp', 'Andere'],
  Toaster: ['Smeg', 'Braun', 'Bosch', 'Philips', 'Russell Hobbs', 'Andere'],
  Wasserkocher: ['Philips', 'Bosch', 'Siemens', 'WMF', 'Smeg', 'Russell Hobbs', 'Andere'],
};
const AUTO_BRANDS = ['Volkswagen', 'Škoda', 'Audi', 'BMW', 'Mercedes-Benz', 'Opel', 'Ford', 'SEAT', 'Toyota', 'Renault', 'Peugeot', 'Dacia', 'Hyundai', 'Kia', 'Tesla', 'Volvo', 'Mazda', 'Nissan', 'Honda', 'Fiat', 'Citroën', 'Porsche', 'Land Rover', 'Jeep', 'Mitsubishi', 'Suzuki', 'Subaru', 'Lexus', 'BYD', 'Cupra', 'Mini', 'Jaguar', 'Alfa Romeo', 'Chevrolet', 'Andere'];
const AUTO_MODELS_BY_BRAND: Record<string, string[]> = {
  Volkswagen: ['Golf', 'Polo', 'Passat', 'Tiguan', 'T-Roc', 'Touran', 'Caddy', 'Transporter', 'ID.3', 'ID.4', 'ID.7', 'Andere'],
  'Škoda': ['Fabia', 'Scala', 'Octavia', 'Superb', 'Kamiq', 'Karoq', 'Kodiaq', 'Enyaq', 'Andere'],
  Audi: ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q2', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron', 'Andere'],
  BMW: ['1er', '2er', '3er', '4er', '5er', '7er', 'X1', 'X3', 'X5', 'X7', 'iX', 'i4', 'Andere'],
  'Mercedes-Benz': ['A-Klasse', 'B-Klasse', 'C-Klasse', 'E-Klasse', 'S-Klasse', 'GLA', 'GLC', 'GLE', 'Sprinter', 'EQA', 'EQE', 'Andere'],
  Opel: ['Corsa', 'Astra', 'Insignia', 'Mokka', 'Crossland', 'Grandland', 'Zafira', 'Vivaro', 'Andere'],
  Ford: ['Fiesta', 'Focus', 'Mondeo', 'Puma', 'Kuga', 'Explorer', 'Ranger', 'Transit', 'Mustang Mach-E', 'Andere'],
  SEAT: ['Ibiza', 'Leon', 'Arona', 'Ateca', 'Tarraco', 'Formentor', 'Andere'],
  Toyota: ['Yaris', 'Corolla', 'Camry', 'C-HR', 'RAV4', 'Hilux', 'Land Cruiser', 'Prius', 'Andere'],
  Renault: ['Clio', 'Megane', 'Captur', 'Arkana', 'Austral', 'Kadjar', 'Kangoo', 'Trafic', 'Andere'],
  Peugeot: ['208', '308', '508', '2008', '3008', '5008', 'Partner', 'Expert', 'Andere'],
  Dacia: ['Sandero', 'Logan', 'Duster', 'Jogger', 'Spring', 'Andere'],
  Hyundai: ['i10', 'i20', 'i30', 'Kona', 'Tucson', 'Santa Fe', 'Ioniq 5', 'Andere'],
  Kia: ['Picanto', 'Rio', 'Ceed', 'Stonic', 'Sportage', 'Sorento', 'EV6', 'Andere'],
  Tesla: ['Model 3', 'Model Y', 'Model S', 'Model X', 'Andere'],
  Volvo: ['EX30', 'XC40', 'XC60', 'XC90', 'V60', 'V90', 'Andere'],
  Mazda: ['Mazda2', 'Mazda3', 'CX-3', 'CX-30', 'CX-5', 'MX-5', 'Andere'],
  Nissan: ['Micra', 'Juke', 'Qashqai', 'X-Trail', 'Leaf', 'Navara', 'Andere'],
  Honda: ['Jazz', 'Civic', 'HR-V', 'CR-V', 'e:Ny1', 'Andere'],
  Fiat: ['500', 'Panda', 'Tipo', 'Punto', 'Doblo', 'Ducato', 'Andere'],
  Citroën: ['C3', 'C4', 'C5 Aircross', 'Berlingo', 'Jumper', 'Andere'],
  Porsche: ['911', '718', 'Panamera', 'Macan', 'Cayenne', 'Taycan', 'Andere'],
  'Land Rover': ['Defender', 'Discovery', 'Discovery Sport', 'Range Rover', 'Evoque', 'Andere'],
  Jeep: ['Renegade', 'Compass', 'Cherokee', 'Wrangler', 'Avenger', 'Andere'],
  Cupra: ['Born', 'Formentor', 'Leon', 'Ateca', 'Tavascan', 'Andere'],
  Mini: ['Cooper', 'Clubman', 'Countryman', 'Aceman', 'Andere'],
  Andere: ['Anderes Modell'],
};
const AUTO_FUELS = ['Benzin', 'Diesel', 'Hybrid (Benzin)', 'Plug-in-Hybrid', 'Elektro', 'Wasserstoff', 'LPG / Autogas', 'CNG / Erdgas', 'Andere'];
const MOTORCYCLE_BRANDS = ['BMW Motorrad', 'Honda', 'Yamaha', 'Kawasaki', 'Suzuki', 'KTM', 'Ducati', 'Harley-Davidson', 'Triumph', 'Aprilia', 'Husqvarna', 'Indian', 'Vespa', 'Piaggio', 'Royal Enfield', 'Andere'];
const MOTORCYCLE_MODELS_BY_BRAND: Record<string, string[]> = {
  'BMW Motorrad': ['R 1250 GS', 'R 1300 GS', 'S 1000 RR', 'F 900 R', 'F 900 XR', 'CE 04', 'Andere'],
  Honda: ['CB125R', 'CB500F', 'CB650R', 'CBR650R', 'Africa Twin', 'Forza 350', 'Andere'],
  Yamaha: ['MT-07', 'MT-09', 'YZF-R7', 'YZF-R1', 'Tracer 7', 'Tenere 700', 'Andere'],
  Kawasaki: ['Ninja 400', 'Ninja 650', 'Ninja ZX-6R', 'Z650', 'Z900', 'Versys 650', 'Andere'],
  Suzuki: ['GSX-8S', 'SV650', 'V-Strom 650', 'V-Strom 800', 'Hayabusa', 'Andere'],
  KTM: ['125 Duke', '390 Duke', '790 Duke', '1290 Super Duke', '390 Adventure', 'Andere'],
  Ducati: ['Monster', 'Panigale V2', 'Panigale V4', 'Multistrada V2', 'Scrambler', 'Andere'],
  'Harley-Davidson': ['Sportster S', 'Nightster', 'Street Bob', 'Fat Boy', 'Road Glide', 'Andere'],
  Vespa: ['Primavera', 'GTS', 'Sprint', 'Elettrica', 'Andere'],
  Andere: ['Anderes Modell'],
};
const SUBCATEGORY_BRANDS: Record<string, string[]> = {
  smartphones: SMARTPHONE_BRANDS,
  tablets: TABLET_BRANDS,
  laptops: COMPUTER_BRANDS,
  tv: TV_BRANDS,
  audio: ['Apple', 'Sony', 'Bose', 'Sennheiser', 'JBL', 'Bang & Olufsen', 'Marshall', 'Samsung', 'Sonos', 'Andere'],
  cameras: ['Canon', 'Nikon', 'Sony', 'Fujifilm', 'Panasonic', 'OM System', 'Leica', 'GoPro', 'DJI', 'Andere'],
};
const CONSOLE_MODELS_BY_BRAND: Record<string, string[]> = {
  Sony: ['PlayStation 5', 'PlayStation 5 Slim', 'PlayStation 5 Pro', 'PlayStation 4', 'PlayStation 4 Slim', 'PlayStation 4 Pro', 'PlayStation 3', 'PlayStation Vita', 'Andere'],
  Microsoft: ['Xbox Series X', 'Xbox Series S', 'Xbox One X', 'Xbox One S', 'Xbox One', 'Xbox 360', 'Andere'],
  Nintendo: ['Nintendo Switch', 'Nintendo Switch OLED', 'Nintendo Switch Lite', 'Wii U', 'Wii', 'Nintendo 3DS', 'Nintendo 2DS', 'Andere'],
  Valve: ['Steam Deck 64 GB', 'Steam Deck 256 GB', 'Steam Deck 512 GB', 'Steam Deck OLED 512 GB', 'Steam Deck OLED 1 TB', 'Andere'],
  Andere: ['Andere Konsole'],
};
const CONSOLE_STORAGE_OPTIONS = ['Keine Angabe', '32 GB', '64 GB', '128 GB', '256 GB', '512 GB', '1 TB', '2 TB', 'Andere'];

const PRIVATE_DETAIL_FIELDS: Record<string, DetailField[]> = {
  'fashion-accessories': [
    { key: 'size', label: 'Größe', options: CLOTHING_SIZES },
    { key: 'color', label: 'Farbe', placeholder: 'z. B. Schwarz, Blau' },
    { key: 'material', label: 'Material', options: MATERIAL_OPTIONS },
  ],
  'baby-kids': [
    { key: 'ageRange', label: 'Alter / Größe', placeholder: 'z. B. 2–3 Jahre oder 98' },
    { key: 'gender', label: 'Für wen?', options: ['Mädchen', 'Buben', 'Unisex'] },
    { key: 'material', label: 'Material', options: MATERIAL_OPTIONS },
  ],
  electronics: [
    { key: 'model', label: 'Modell / genaue Bezeichnung' },
    { key: 'storage', label: 'Speicher', options: ['32 GB', '64 GB', '128 GB', '256 GB', '512 GB', '1 TB', '2 TB', 'Andere'] },
    { key: 'warranty', label: 'Garantie bis', type: 'date' },
  ],
  household: [
    { key: 'dimensions', label: 'Maße', placeholder: 'Länge × Breite × Höhe' },
    { key: 'material', label: 'Material', options: MATERIAL_OPTIONS },
  ],
  'furniture-living': [
    { key: 'dimensions', label: 'Maße', placeholder: 'Länge × Breite × Höhe' },
    { key: 'material', label: 'Material', options: MATERIAL_OPTIONS },
  ],
  'sports-leisure': [
    { key: 'size', label: 'Größe', placeholder: 'Rahmen, Konfektion oder Schuhgröße' },
    { key: 'material', label: 'Material', options: MATERIAL_OPTIONS },
  ],
  'books-media': [
    { key: 'author', label: 'Autor / Herausgeber' },
    { key: 'isbn', label: 'ISBN' },
    { key: 'language', label: 'Sprache', options: ['Deutsch', 'Englisch', 'Arabisch', 'Französisch', 'Türkisch', 'Andere'] },
  ],
  gaming: [
    { key: 'platform', label: 'Plattform', options: ['PlayStation 5', 'PlayStation 4', 'Xbox Series', 'Xbox One', 'Nintendo Switch', 'PC', 'Andere'] },
    { key: 'edition', label: 'Edition / Version' },
  ],
  'auto-accessories': [
    { key: 'compatibility', label: 'Fahrzeug-Kompatibilität' },
    { key: 'partNumber', label: 'Teilenummer' },
  ],
  'garden-tools': [
    { key: 'powerSource', label: 'Antrieb', options: ['Akku', 'Elektro', 'Benzin', 'Handbetrieb', 'Andere'] },
    { key: 'dimensions', label: 'Maße' },
  ],
  other: [
    { key: 'material', label: 'Material' },
    { key: 'dimensions', label: 'Maße' },
  ],
};

const PRIVATE_SUBCATEGORY_FIELDS: Record<string, DetailField[]> = {
  smartphones: [
    { key: 'model', label: 'Modell / genaue Bezeichnung' },
    { key: 'storage', label: 'Speicher', options: ['32 GB', '64 GB', '128 GB', '256 GB', '512 GB', '1 TB', 'Andere'] },
    { key: 'color', label: 'Farbe' },
    { key: 'simType', label: 'SIM-Karte', options: ['Nano-SIM', 'eSIM', 'Nano-SIM + eSIM', 'Dual-SIM', 'Andere'] },
  ],
  tablets: [
    { key: 'model', label: 'Modell' },
    { key: 'brand', label: 'Hersteller', options: TABLET_BRANDS },
    { key: 'storage', label: 'Speicher', options: ['32 GB', '64 GB', '128 GB', '256 GB', '512 GB', '1 TB', 'Andere'] },
    { key: 'screenSize', label: 'Displaygröße (Zoll)', options: TABLET_SCREEN_SIZES },
  ],
  laptops: [
    { key: 'brand', label: 'Hersteller', options: COMPUTER_BRANDS },
    { key: 'model', label: 'Modell' },
    { key: 'processorManufacturer', label: 'Prozessor-Hersteller', options: PROCESSOR_MANUFACTURERS },
    { key: 'processor', label: 'Prozessor' },
    { key: 'ram', label: 'Arbeitsspeicher', options: ['4 GB', '8 GB', '16 GB', '32 GB', '64 GB', 'Andere'] },
    { key: 'storage', label: 'Speicher', options: ['128 GB SSD', '256 GB SSD', '512 GB SSD', '1 TB SSD', '2 TB SSD', 'Andere'] },
  ],
  tv: [
    { key: 'brand', label: 'Hersteller', options: TV_BRANDS },
    { key: 'screenSize', label: 'Bildschirmgröße (Zoll)', options: TV_SCREEN_SIZES },
    { key: 'resolution', label: 'Auflösung', options: ['HD', 'Full HD', '4K UHD', '8K', 'Andere'] },
    { key: 'smartTv', label: 'Smart-TV', options: ['Ja', 'Nein'] },
  ],
  audio: [
    { key: 'brand', label: 'Hersteller', options: ['Apple', 'Sony', 'Bose', 'Sennheiser', 'JBL', 'Bang & Olufsen', 'Marshall', 'Samsung', 'Andere'] },
    { key: 'audioType', label: 'Art', options: ['Kopfhörer', 'Lautsprecher', 'Soundbar', 'Hi-Fi-Anlage', 'Mikrofon', 'Andere'] },
    { key: 'connection', label: 'Verbindung', options: ['Bluetooth', 'Kabel', 'Bluetooth + Kabel', 'WLAN', 'Andere'] },
  ],
  cameras: [
    { key: 'brand', label: 'Hersteller', options: ['Canon', 'Nikon', 'Sony', 'Fujifilm', 'Panasonic', 'Olympus', 'Leica', 'GoPro', 'DJI', 'Andere'] },
    { key: 'cameraType', label: 'Kameratyp', options: ['DSLR', 'Systemkamera', 'Kompaktkamera', 'Actionkamera', 'Videokamera', 'Andere'] },
    { key: 'resolution', label: 'Auflösung', placeholder: 'z. B. 24 MP' },
  ],
  'women-clothes': [{ key: 'size', label: 'Größe', options: CLOTHING_SIZES }, { key: 'color', label: 'Farbe' }, { key: 'material', label: 'Material', options: MATERIAL_OPTIONS }],
  'men-clothes': [{ key: 'size', label: 'Größe', options: CLOTHING_SIZES }, { key: 'color', label: 'Farbe' }, { key: 'material', label: 'Material', options: MATERIAL_OPTIONS }],
  shoes: [{ key: 'size', label: 'Schuhgröße', options: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', 'Andere'] }, { key: 'color', label: 'Farbe' }, { key: 'material', label: 'Material', options: MATERIAL_OPTIONS }],
  'bags-accessories': [{ key: 'material', label: 'Material', options: MATERIAL_OPTIONS }, { key: 'color', label: 'Farbe' }, { key: 'dimensions', label: 'Maße' }],
  'watches-jewelry': [{ key: 'brand', label: 'Marke' }, { key: 'material', label: 'Material', options: ['Gold', 'Silber', 'Edelstahl', 'Leder', 'Kunststoff', 'Andere'] }, { key: 'color', label: 'Farbe' }],
  'traditional-clothing': [{ key: 'size', label: 'Größe', options: CLOTHING_SIZES }, { key: 'country', label: 'Herkunft / Stil' }, { key: 'material', label: 'Material', options: MATERIAL_OPTIONS }],
  strollers: [{ key: 'brand', label: 'Hersteller' }, { key: 'ageRange', label: 'Geeignet für', placeholder: 'z. B. ab Geburt bis 4 Jahre' }, { key: 'color', label: 'Farbe' }],
  'car-seats': [{ key: 'brand', label: 'Hersteller' }, { key: 'group', label: 'Gewichtsgruppe', options: ['0–13 kg', '9–18 kg', '15–36 kg', '0–36 kg', 'Andere'] }, { key: 'isofix', label: 'ISOFIX', options: ['Ja', 'Nein'] }],
  toys: [{ key: 'ageRange', label: 'Altersempfehlung', placeholder: 'z. B. ab 3 Jahren' }, { key: 'material', label: 'Material', options: MATERIAL_OPTIONS }, { key: 'brand', label: 'Hersteller' }],
  'home-appliances': [{ key: 'applianceType', label: 'Gerät', options: APPLIANCE_TYPES }, { key: 'energyClass', label: 'Energieeffizienzklasse', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'Unbekannt'] }, { key: 'dimensions', label: 'Maße' }],
  kitchen: [{ key: 'applianceType', label: 'Küchengerät', options: KITCHEN_APPLIANCE_TYPES }, { key: 'dimensions', label: 'Maße' }, { key: 'material', label: 'Material', options: MATERIAL_OPTIONS }],
  tableware: [{ key: 'material', label: 'Material', options: ['Porzellan', 'Keramik', 'Glas', 'Edelstahl', 'Holz', 'Andere'] }, { key: 'setSize', label: 'Anzahl Teile', type: 'number' }],
  decoration: [{ key: 'material', label: 'Material', options: MATERIAL_OPTIONS }, { key: 'color', label: 'Farbe' }, { key: 'dimensions', label: 'Maße' }],
  'house-accessories': [{ key: 'material', label: 'Material', options: MATERIAL_OPTIONS }, { key: 'dimensions', label: 'Maße' }],
  'living-room': [{ key: 'furnitureType', label: 'Möbelart', options: ['Sofa', 'Sessel', 'Wohnwand', 'Couchtisch', 'Regal', 'Andere'] }, { key: 'dimensions', label: 'Maße' }, { key: 'material', label: 'Material', options: MATERIAL_OPTIONS }],
  bedroom: [{ key: 'furnitureType', label: 'Möbelart', options: ['Bett', 'Kleiderschrank', 'Kommode', 'Nachttisch', 'Andere'] }, { key: 'dimensions', label: 'Maße' }, { key: 'material', label: 'Material', options: MATERIAL_OPTIONS }],
  'tables-chairs': [{ key: 'furnitureType', label: 'Möbelart', options: ['Esstisch', 'Schreibtisch', 'Stuhl', 'Bank', 'Andere'] }, { key: 'dimensions', label: 'Maße' }, { key: 'material', label: 'Material', options: MATERIAL_OPTIONS }],
  closets: [{ key: 'dimensions', label: 'Maße' }, { key: 'material', label: 'Material', options: MATERIAL_OPTIONS }, { key: 'color', label: 'Farbe' }],
  lighting: [{ key: 'lightType', label: 'Lampentyp', options: ['Deckenlampe', 'Stehlampe', 'Tischlampe', 'Wandleuchte', 'Andere'] }, { key: 'bulbType', label: 'Leuchtmittel', options: ['LED', 'Halogen', 'E27', 'E14', 'Andere'] }],
  carpets: [{ key: 'dimensions', label: 'Maße' }, { key: 'material', label: 'Material', options: MATERIAL_OPTIONS }, { key: 'color', label: 'Farbe' }],
  bikes: [{ key: 'brand', label: 'Hersteller' }, { key: 'bikeType', label: 'Fahrradtyp', options: ['Citybike', 'Mountainbike', 'Rennrad', 'Trekkingrad', 'E-Bike', 'Kinderfahrrad', 'Andere'] }, { key: 'frameSize', label: 'Rahmengröße' }],
  football: [{ key: 'sportType', label: 'Sportart', options: ['Fußball', 'Basketball', 'Volleyball', 'Handball', 'Andere'] }, { key: 'size', label: 'Größe / Ausführung' }],
  fitness: [{ key: 'equipmentType', label: 'Geräteart', options: ['Hantel', 'Laufband', 'Ergometer', 'Yoga', 'Kraftstation', 'Andere'] }, { key: 'weight', label: 'Gewicht / Belastbarkeit', type: 'number' }],
  outdoor: [{ key: 'equipmentType', label: 'Ausrüstung', options: ['Zelt', 'Schlafsack', 'Rucksack', 'Campingmöbel', 'Andere'] }, { key: 'capacity', label: 'Kapazität / Größe' }],
  'water-sports': [{ key: 'equipmentType', label: 'Ausrüstung', options: ['Surfbrett', 'SUP', 'Neoprenanzug', 'Tauchausrüstung', 'Andere'] }, { key: 'size', label: 'Größe' }],
  'islamic-books': [{ key: 'author', label: 'Autor / Herausgeber' }, { key: 'language', label: 'Sprache', options: ['Deutsch', 'Arabisch', 'Türkisch', 'Englisch', 'Andere'] }, { key: 'isbn', label: 'ISBN' }],
  'kids-books': [{ key: 'author', label: 'Autor' }, { key: 'ageRange', label: 'Altersempfehlung' }, { key: 'language', label: 'Sprache', options: ['Deutsch', 'Englisch', 'Arabisch', 'Andere'] }],
  education: [{ key: 'subject', label: 'Fach / Thema' }, { key: 'language', label: 'Sprache', options: ['Deutsch', 'Englisch', 'Arabisch', 'Andere'] }, { key: 'schoolLevel', label: 'Schulstufe / Niveau' }],
  'general-books': [{ key: 'author', label: 'Autor' }, { key: 'language', label: 'Sprache', options: ['Deutsch', 'Englisch', 'Arabisch', 'Andere'] }, { key: 'isbn', label: 'ISBN' }],
  'media-games': [{ key: 'mediaType', label: 'Art', options: ['Film', 'Serie', 'Brettspiel', 'Kartenspiel', 'Andere'] }, { key: 'ageRating', label: 'Altersfreigabe' }],
  consoles: [{ key: 'brand', label: 'Hersteller', options: ['Sony', 'Microsoft', 'Nintendo', 'Valve', 'Andere'] }, { key: 'model', label: 'Modell' }, { key: 'storage', label: 'Speicher' }],
  games: [{ key: 'platform', label: 'Plattform', options: ['PlayStation 5', 'PlayStation 4', 'Xbox Series', 'Xbox One', 'Nintendo Switch', 'PC', 'Andere'] }, { key: 'ageRating', label: 'USK / Altersfreigabe' }],
  'gaming-accessories': [{ key: 'platform', label: 'Kompatibilität', options: ['PlayStation', 'Xbox', 'Nintendo Switch', 'PC', 'Universal', 'Andere'] }, { key: 'brand', label: 'Hersteller' }],
  'pc-gaming': [{ key: 'componentType', label: 'Komponente', options: ['Grafikkarte', 'Prozessor', 'Monitor', 'Tastatur', 'Maus', 'PC', 'Andere'] }, { key: 'brand', label: 'Hersteller' }],
  'tires-rims': [{ key: 'tireWidth', label: 'Reifenbreite (mm)', options: ['125', '135', '145', '155', '165', '175', '185', '195', '205', '215', '225', '235', '245', '255', '265', '275', '285', '295', '305', '315'] }, { key: 'tireProfile', label: 'Querschnitt / Höhe (%)', options: ['30', '35', '40', '45', '50', '55', '60', '65', '70', '75', '80'] }, { key: 'rimDiameter', label: 'Felgendurchmesser (Zoll)', options: ['12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24'] }, { key: 'season', label: 'Saison', options: ['Sommer', 'Winter', 'Ganzjahr'] }, { key: 'quantity', label: 'Anzahl Reifen', type: 'number' }],
  'spare-parts': [{ key: 'compatibility', label: 'Fahrzeug-Kompatibilität' }, { key: 'partNumber', label: 'Teilenummer' }],
  'car-accessories': [{ key: 'compatibility', label: 'Fahrzeug-Kompatibilität' }, { key: 'accessoryType', label: 'Zubehörart' }],
  'roof-racks': [{ key: 'compatibility', label: 'Fahrzeug-Kompatibilität' }, { key: 'loadCapacity', label: 'Traglast in kg', type: 'number' }],
  'power-tools': [{ key: 'brand', label: 'Hersteller' }, { key: 'powerSource', label: 'Antrieb', options: ['Akku', 'Elektro', 'Benzin', 'Druckluft', 'Handbetrieb'] }],
  'hand-tools': [{ key: 'toolType', label: 'Werkzeugart' }, { key: 'material', label: 'Material', options: MATERIAL_OPTIONS }],
  'garden-tools-cat': [{ key: 'brand', label: 'Hersteller' }, { key: 'powerSource', label: 'Antrieb', options: ['Akku', 'Elektro', 'Benzin', 'Handbetrieb'] }],
  'garden-furniture': [{ key: 'material', label: 'Material', options: MATERIAL_OPTIONS }, { key: 'dimensions', label: 'Maße' }],
  'baby-clothes': [{ key: 'size', label: 'Kleidergröße', options: ['50', '56', '62', '68', '74', '80', '86', '92', '98', '104', '110', '116', 'Andere'] }, { key: 'gender', label: 'Für wen?', options: ['Mädchen', 'Buben', 'Unisex'] }, { key: 'material', label: 'Material', options: MATERIAL_OPTIONS }],
  'kids-clothes': [{ key: 'size', label: 'Kleidergröße', options: ['98', '104', '110', '116', '122', '128', '134', '140', '146', '152', '158', '164', 'Andere'] }, { key: 'gender', label: 'Für wen?', options: ['Mädchen', 'Buben', 'Unisex'] }, { key: 'material', label: 'Material', options: MATERIAL_OPTIONS }],
  'baby-gear': [{ key: 'ageRange', label: 'Alter / Größe', placeholder: 'z. B. ab Geburt oder 6–12 Monate' }, { key: 'material', label: 'Material', options: MATERIAL_OPTIONS }],
  'kids-furniture': [{ key: 'furnitureType', label: 'Möbelart', options: ['Kinderbett', 'Wickelkommode', 'Schreibtisch', 'Kinderstuhl', 'Regal', 'Andere'] }, { key: 'dimensions', label: 'Maße' }, { key: 'material', label: 'Material', options: MATERIAL_OPTIONS }],
  cleaning: [{ key: 'productType', label: 'Produktart', options: ['Staubsauger', 'Reinigungsmittel', 'Wischsystem', 'Bürsten', 'Andere'] }, { key: 'brand', label: 'Hersteller' }],
  'elec-accessories': [{ key: 'compatibility', label: 'Kompatibilität' }, { key: 'accessoryType', label: 'Zubehörart', options: ['Ladegerät', 'Kabel', 'Hülle', 'Adapter', 'Powerbank', 'Andere'] }],
  'other-general': [{ key: 'productType', label: 'Art des Artikels' }, { key: 'material', label: 'Material', options: MATERIAL_OPTIONS }, { key: 'dimensions', label: 'Maße' }],
  'other-crafts': [{ key: 'craftType', label: 'Art', options: ['Handarbeit', 'Bastelmaterial', 'Stoffe', 'Werkzeug', 'Andere'] }, { key: 'material', label: 'Material', options: MATERIAL_OPTIONS }],
};

const VEHICLE_ICONS: Record<string, LucideIcon> = {
  cars: CarFront,
  'motorcycles-quads': Bike,
  'commercial-vehicles': Truck,
  'caravans-motorhomes': House,
  'spare-parts-accessories': Wrench,
};

const BOAT_ICONS: Record<string, LucideIcon> = {
  motorboats: Ship,
  sailboats: Sailboat,
  yachts: Anchor,
  jetskis: Waves,
};

const VEHICLE_YEARS = Array.from({ length: 77 }, (_, index) => String(new Date().getFullYear() - index));
const VEHICLE_MILEAGE_RANGES = ['0–10.000 km', '10.001–50.000 km', '50.001–100.000 km', '100.001–150.000 km', 'Über 150.000 km'];
const MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

const REAL_ESTATE_ICONS: Record<string, LucideIcon> = {
  house: House,
  apartment: Building2,
  land: Map,
  'commercial-property': Warehouse,
  'holiday-property': Palmtree,
  'other-property': Tag,
};

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'fashion-accessories': Shirt,
  'baby-kids': Baby,
  electronics: Smartphone,
  household: Utensils,
  'furniture-living': Armchair,
  'sports-leisure': Bike,
  'books-media': BookOpen,
  gaming: Gamepad2,
  'auto-accessories': Car,
  'garden-tools': Wrench,
  other: Layers,
};

const SUBCATEGORY_ICONS: Record<string, LucideIcon> = {
  'women-clothes': Shirt,
  'men-clothes': Shirt,
  shoes: Tag,
  'bags-accessories': Tag,
  'watches-jewelry': Tag,
  'traditional-clothing': Shirt,
  'baby-clothes': Baby,
  'kids-clothes': Shirt,
  strollers: Baby,
  'car-seats': Baby,
  'baby-gear': Baby,
  'kids-furniture': Armchair,
  toys: Joystick,
  smartphones: Smartphone,
  tablets: Tablet,
  laptops: Laptop,
  tv: Tv,
  audio: Headphones,
  cameras: Camera,
  'elec-accessories': Tag,
  'home-appliances': Utensils,
  kitchen: Utensils,
  tableware: Utensils,
  decoration: Lamp,
  cleaning: Sparkles,
  'house-accessories': Tag,
  'living-room': Sofa,
  bedroom: BedDouble,
  'tables-chairs': Table2,
  closets: Warehouse,
  lighting: Lamp,
  carpets: Layers,
  bikes: Bike,
  football: Sparkles,
  fitness: Sparkles,
  outdoor: Palmtree,
  'water-sports': Waves,
  'islamic-books': BookMarked,
  'kids-books': BookOpen,
  education: BookOpen,
  'general-books': BookOpen,
  'media-games': Joystick,
  consoles: Gamepad2,
  games: Gamepad2,
  'gaming-accessories': Joystick,
  'pc-gaming': Gamepad2,
  'tires-rims': Car,
  'spare-parts': Wrench,
  'car-accessories': Car,
  'roof-racks': Car,
  'power-tools': Wrench,
  'hand-tools': Wrench,
  'garden-tools-cat': Palmtree,
  'garden-furniture': Armchair,
  'other-general': Layers,
  'other-crafts': Wrench,
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
  const applianceType = String(details.applianceType ?? '');
  const brandOptions = subcategoryId === 'home-appliances' || subcategoryId === 'kitchen'
    ? (APPLIANCE_BRANDS_BY_TYPE[applianceType] ?? APPLIANCE_BRANDS)
    : SUBCATEGORY_BRANDS[subcategoryId];
  const processorOptions = PROCESSORS_BY_MANUFACTURER[String(details.processorManufacturer ?? '')] ?? [];
  const vehicleBrands = subcategoryId === 'motorcycles-quads' ? MOTORCYCLE_BRANDS : AUTO_BRANDS;
  const vehicleModels = subcategoryId === 'motorcycles-quads'
    ? MOTORCYCLE_MODELS_BY_BRAND[String(details.make ?? '')] ?? []
    : AUTO_MODELS_BY_BRAND[String(details.make ?? '')] ?? [];
  const privateDetailFields = (PRIVATE_SUBCATEGORY_FIELDS[subcategoryId] ?? PRIVATE_DETAIL_FIELDS[categoryId] ?? [])
    .map((field) => subcategoryId === 'consoles' && field.key === 'brand' ? { ...field, options: ['Sony', 'Microsoft', 'Nintendo', 'Valve', 'Andere'] } : field)
    .map((field) => subcategoryId === 'consoles' && field.key === 'model' ? { ...field, options: CONSOLE_MODELS_BY_BRAND[String(details.brand ?? '')] ?? ['Zuerst Hersteller auswählen'] } : field)
    .map((field) => subcategoryId === 'consoles' && field.key === 'storage' ? { ...field, options: CONSOLE_STORAGE_OPTIONS } : field)
    .filter((field) => field.key !== 'brand' || !showGenericBrand);

  const updateDetail = (key: string, value: string | number | boolean | null) => {
    setDetails((currentDetails) => ({ ...currentDetails, [key]: value }));
  };

  const chooseOfferType = (nextOffer: ListingOffer) => {
    setOfferType(nextOffer);
    setType(nextOffer === 'PRIVATE' ? 'SELL' : 'SELL');
    if (nextOffer === 'BOATS') {
      setCategoryId('boats');
      setSubcategoryId('motorboats');
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

    const requiresPayment = listingFee > 0;
    const now = new Date();
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
      status: requiresPayment ? 'PENDING' : 'ACTIVE',
      views: 1,
      favoritesCount: 0,
      images,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: requiresPayment ? undefined : now.toISOString(),
      expiresAt: requiresPayment ? undefined : new Date(now.getTime() + listingDurationDays * 24 * 60 * 60 * 1000).toISOString(),
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
        { ...draft, status: draft.status as 'ACTIVE' | 'PENDING' },
        images,
        Object.entries(pendingImageFiles).map(([id, file]) => ({ id, file: file as File })),
      );
      const newListing: Listing = {
        ...draft,
        id: persisted.id,
        images: persisted.images,
      };

      if (requiresPayment) {
        // Keep the unpublished draft only for the return from Stripe. It must
        // not appear in the account or participate in duplicate detection.
        sessionStorage.setItem(`behalal_pending_listing_${newListing.id}`, JSON.stringify(newListing));
        const checkoutUrl = await createListingCheckout(newListing.id);
        window.location.assign(checkoutUrl);
        return;
      }

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
                    <span className="shrink-0 text-right text-[13px] font-bold uppercase tracking-widest">
                      <span className="block text-[#F4C430]">{offer.feeLabel}</span>
                      {offer.durationLabel && <span className={`mt-1 block font-normal tracking-normal ${isSelected ? 'text-white/70 dark:text-[#171A17]/70' : 'text-gray-500'}`}>{offer.durationLabel}</span>}
                    </span>
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
            <div className="grid max-h-[30rem] grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2">
              {availableCategories.map((c) => {
                const isSelected = categoryId === c.id;
                const CategoryIcon = CATEGORY_ICONS[c.id] ?? Tag;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setCategoryId(c.id);
                      setSubcategoryId(c.subcategories[0]?.id || '');
                    }}
                    className={`flex min-h-[104px] items-center gap-4 border p-4 text-left transition-colors ${
                      isSelected
                        ? 'border-[#123D2A] bg-[#123D2A] text-white dark:border-[#F4C430] dark:bg-[#F4C430] dark:text-[#171A17]'
                        : 'border-gray-200 text-[#171A17] hover:border-[#123D2A] dark:border-white/10 dark:text-white dark:hover:border-[#F4C430]'
                    }`}
                  >
                    <CategoryIcon className={`h-8 w-8 shrink-0 ${isSelected ? 'text-[#F4C430] dark:text-[#123D2A]' : 'text-[#F4C430]'}`} />
                    <span className="min-w-0">
                      <span className="block font-serif text-lg font-bold">{c.name[language]}</span>
                      <span className={`mt-1 block text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-white/70 dark:text-[#171A17]/70' : 'text-gray-500'}`}>
                        {c.subcategories.length} Unterkategorien
                      </span>
                    </span>
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
                ) : offerType === 'BOATS' ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {BOAT_CATEGORIES.map((boat) => {
                      const isSubSelected = subcategoryId === boat.id;
                      const BoatIcon = BOAT_ICONS[boat.id] ?? Ship;
                      return (
                        <button
                          key={boat.id}
                          type="button"
                          onClick={() => setSubcategoryId(boat.id)}
                          className={`border p-4 text-left transition-colors ${isSubSelected ? 'border-[#123D2A] bg-[#123D2A] text-white dark:border-[#F4C430] dark:bg-[#F4C430] dark:text-[#171A17]' : 'border-gray-200 text-[#171A17] hover:border-[#123D2A] dark:border-white/10 dark:text-white dark:hover:border-[#F4C430]'}`}
                        >
                          <BoatIcon className={`mb-4 h-7 w-7 ${isSubSelected ? 'text-[#F4C430] dark:text-[#123D2A]' : 'text-[#F4C430]'}`} />
                          <span className="block font-serif text-lg font-bold">{boat.title}</span>
                          <span className={`mt-1 block text-xs leading-relaxed ${isSubSelected ? 'text-white/75 dark:text-[#171A17]/70' : 'text-gray-500'}`}>{boat.description}</span>
                          <span className={`mt-4 block border-t pt-3 text-[10px] font-bold uppercase tracking-widest ${isSubSelected ? 'border-white/20 text-[#F4C430] dark:border-[#171A17]/20 dark:text-[#123D2A]' : 'border-gray-200 text-[#123D2A] dark:border-white/10 dark:text-[#F4C430]'}`}>Inseratspreis: € 44,99 · 60 Tage</span>
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
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {selectedCategoryObj.subcategories.map((sub) => {
                      const isSubSelected = subcategoryId === sub.id;
                      const SubcategoryIcon = SUBCATEGORY_ICONS[sub.id] ?? CATEGORY_ICONS[selectedCategoryObj.id] ?? Tag;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => setSubcategoryId(sub.id)}
                          className={`flex min-h-[82px] items-center gap-4 border p-4 text-left transition-colors ${isSubSelected ? 'border-[#123D2A] bg-[#123D2A] text-white dark:border-[#F4C430] dark:bg-[#F4C430] dark:text-[#171A17]' : 'border-gray-200 text-[#171A17] hover:border-[#123D2A] dark:border-white/10 dark:text-white dark:hover:border-[#F4C430]'}`}
                        >
                          <SubcategoryIcon className={`h-6 w-6 shrink-0 ${isSubSelected ? 'text-[#F4C430] dark:text-[#123D2A]' : 'text-[#F4C430]'}`} />
                          <span className="font-serif text-base font-bold">{sub.name[language]}</span>
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

            <section className="space-y-5 border border-[#123D2A]/15 bg-white/65 p-5 sm:p-7 dark:border-white/10 dark:bg-white/[0.03]">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#123D2A] dark:text-[#F4C430]">Grundangaben</p>
                <p className="mt-2 text-sm text-gray-500">Gib deinem Inserat einen klaren Titel und die wichtigsten Eckdaten.</p>
              </div>
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

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {showGenericBrand && <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {t.brandField}
                </label>
                {brandOptions ? (
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className={`${detailInputClass} appearance-none`}
                  >
                    <option value="" className="dark:bg-[#111511]">Bitte auswählen</option>
                    {brandOptions.map((manufacturer) => (
                      <option key={manufacturer} value={manufacturer} className="dark:bg-[#111511]">{manufacturer}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="z.B. Apple, IKEA"
                    className={detailInputClass}
                  />
                )}
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
            </section>

            {offerType !== 'PRIVATE' && (
              <section className="space-y-6 border border-[#F4C430]/70 p-5 sm:p-7">
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
                    <DetailInput label="Marke *" value={details.make} options={vehicleBrands} onChange={(value) => { updateDetail('make', value); updateDetail('model', ''); }} />
                    <DetailInput label="Modell *" value={details.model} options={vehicleModels.length > 0 ? vehicleModels : ['Zuerst Marke auswählen']} disabled={vehicleModels.length === 0} onChange={(value) => updateDetail('model', value)} />
                    <label className="space-y-2">
                      <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">Baujahr</span>
                      <select value={String(details.year ?? '')} onChange={(event) => updateDetail('year', event.target.value)} className={`${detailInputClass} appearance-none`}>
                        <option value="" className="dark:bg-[#111511]">Bitte auswählen</option>
                        {VEHICLE_YEARS.map((year) => <option key={year} value={year} className="dark:bg-[#111511]">{year}</option>)}
                      </select>
                    </label>
                    <label className="space-y-2">
                      <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">Erstzulassung Monat</span>
                      <select value={String(details.firstRegistrationMonth ?? '')} onChange={(event) => updateDetail('firstRegistrationMonth', event.target.value)} className={`${detailInputClass} appearance-none`}>
                        <option value="" className="dark:bg-[#111511]">Bitte auswählen</option>
                        {MONTHS.map((month, index) => <option key={month} value={String(index + 1).padStart(2, '0')} className="dark:bg-[#111511]">{month}</option>)}
                      </select>
                    </label>
                    <label className="space-y-2">
                      <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">Kilometerstand</span>
                      <select value={String(details.mileageRange ?? '')} onChange={(event) => updateDetail('mileageRange', event.target.value)} className={`${detailInputClass} appearance-none`}>
                        <option value="" className="dark:bg-[#111511]">Bitte auswählen</option>
                        {VEHICLE_MILEAGE_RANGES.map((range) => <option key={range} value={range} className="dark:bg-[#111511]">{range}</option>)}
                      </select>
                    </label>
                    <DetailInput label="Leistung in PS" type="number" value={details.power} onChange={(value) => updateDetail('power', value)} />
                    <DetailInput label="Kraftstoff" value={details.fuel} options={AUTO_FUELS} onChange={(value) => updateDetail('fuel', value)} />
                    <label className="space-y-2">
                      <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">Getriebe</span>
                      <select value={String(details.transmission ?? '')} onChange={(event) => updateDetail('transmission', event.target.value)} className={`${detailInputClass} appearance-none`}>
                        <option value="" className="dark:bg-[#111511]">Bitte auswählen</option>
                        <option value="AUTOMATIC" className="dark:bg-[#111511]">Automatik</option>
                        <option value="MANUAL" className="dark:bg-[#111511]">Schaltung</option>
                      </select>
                    </label>
                    <div className="space-y-3 sm:col-span-2">
                      <label className="flex cursor-pointer items-center gap-3 text-sm font-bold text-[#171A17] dark:text-white">
                        <input
                          type="checkbox"
                          checked={Boolean(details.inspectionExpired)}
                          onChange={(event) => updateDetail('inspectionExpired', event.target.checked)}
                          className="h-4 w-4 accent-[#123D2A]"
                        />
                        Pickerl / HU ist abgelaufen
                      </label>
                      {details.inspectionExpired ? (
                        <p className="text-xs font-bold uppercase tracking-widest text-red-700 dark:text-red-400">Kein gültiges Pickerl / keine gültige HU vorhanden</p>
                      ) : (
                        <DetailInput label="Pickerl / HU gültig bis" type="date" value={details.inspectionValidUntil} onChange={(value) => updateDetail('inspectionValidUntil', value)} />
                      )}
                    </div>
                  </div>
                )}

                {offerType === 'REAL_ESTATE' && (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <DetailInput label="Wohnfläche / Nutzfläche in m² *" type="number" value={details.livingAreaSqm} onChange={(value) => updateDetail('livingAreaSqm', value)} />
                    <DetailInput label="Grundstücksfläche in m²" type="number" value={details.plotAreaSqm} onChange={(value) => updateDetail('plotAreaSqm', value)} />
                    <DetailInput label="Zimmer" type="number" value={details.rooms} onChange={(value) => updateDetail('rooms', value)} />
                    <DetailInput label="Baujahr" type="number" value={details.yearBuilt} onChange={(value) => updateDetail('yearBuilt', value)} />
                    <DetailInput label="Etage" value={details.floor} onChange={(value) => updateDetail('floor', value)} placeholder="EG, 1. OG, Dachgeschoss" />
                    <DetailInput label="Heizung" value={details.heating} options={['Gas', 'Fernwärme', 'Wärmepumpe', 'Pellets', 'Öl', 'Elektro', 'Holz', 'Solar', 'Keine / unbekannt', 'Andere']} onChange={(value) => updateDetail('heating', value)} />
                    <DetailInput label="Parkplätze / Stellplätze" type="number" value={details.parkingSpaces} onChange={(value) => updateDetail('parkingSpaces', value)} />
                    <DetailInput label={realEstateAction === 'SELL' ? 'Kaufpreis (€) *' : 'Monatlicher Mietpreis (€) *'} type="number" value={price} onChange={setPrice} />
                    <DetailInput label="Verfügbar ab" type="date" value={details.availableFrom} onChange={(value) => updateDetail('availableFrom', value)} />
                    <div className="sm:col-span-2">
                      <NegotiableToggle checked={negotiable} onChange={setNegotiable} />
                    </div>
                  </div>
                )}

              </section>
            )}

            {offerType === 'PRIVATE' && type === 'WANTED' && (
              <section className="space-y-4 border border-[#F4C430]/70 p-5 sm:p-7">
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
              </section>
            )}

            {offerType === 'PRIVATE' && type !== 'WANTED' && privateDetailFields.length > 0 && (
              <section className="space-y-6 border border-[#123D2A]/15 bg-white/65 p-5 sm:p-7 dark:border-white/10 dark:bg-white/[0.03]">
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
                      options={field.key === 'processor' ? (processorOptions.length > 0 ? processorOptions : ['Zuerst Hersteller auswählen']) : field.options}
                      disabled={(field.key === 'processor' && processorOptions.length === 0) || (field.key === 'model' && subcategoryId === 'consoles' && !details.brand)}
                      value={details[field.key]}
                      onChange={(value) => {
                        updateDetail(field.key, value);
                        if (field.key === 'processorManufacturer') updateDetail('processor', '');
                        if (field.key === 'brand' && subcategoryId === 'consoles') updateDetail('model', '');
                        if (field.key === 'applianceType') setBrand('');
                      }}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* PREIS ODER BUDGET */}
            {type === 'SELL' && offerType !== 'REAL_ESTATE' && (
              <section className="space-y-4 border border-[#F4C430]/70 p-5 sm:p-7">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Preis (€) *
                </label>
                <div className="flex items-center gap-8">
                    <div className="relative flex-1 max-w-[200px]">
                    <input
                      type="number"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value.startsWith('-') ? '' : e.target.value)}
                      placeholder="0"
                      className={`${detailInputClass} font-serif text-3xl`}
                    />
                  </div>

                  <div className="mt-4">
                    <NegotiableToggle checked={negotiable} onChange={setNegotiable} />
                  </div>
                </div>
              </section>
            )}

            {type === 'WANTED' && (
              <section className="space-y-4 border border-[#F4C430]/70 p-5 sm:p-7">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Maximales Budget (€, optional)
                </label>
                <div className="relative max-w-[200px]">
                  <input
                    type="number"
                    min="0"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value.startsWith('-') ? '' : e.target.value)}
                    placeholder="0"
                    className={`${detailInputClass} font-serif text-3xl`}
                  />
                </div>
                <div className="pt-3">
                  <NegotiableToggle checked={negotiable} onChange={setNegotiable} />
                </div>
              </section>
            )}

            <section className="space-y-4 border border-[#123D2A]/15 bg-white/65 p-5 sm:p-7 dark:border-white/10 dark:bg-white/[0.03]">
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
            </section>
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
                So wird dein Inserat nach erfolgreicher Prüfung und Zahlung im ONLINE BAZAR angezeigt.
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

            {listingFee > 0 ? (
              <div className="border border-[#F4C430] bg-[#FFFDF2] p-6 dark:bg-[#1B2117]">
                <div className="flex items-start justify-between gap-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#123D2A] text-[#F4C430]">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#123D2A] dark:text-[#F4C430]">Zahlung vor Veröffentlichung</p>
                      <h3 className="mt-1 font-serif text-2xl font-bold text-[#171A17] dark:text-white">Inserat sicher bezahlen</h3>
                      <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                        Nach erfolgreicher Zahlung wird dein Inserat automatisch veröffentlicht und bleibt {listingDurationDays} Tage online.
                      </p>
                    </div>
                  </div>
                  <LockKeyhole className="h-5 w-5 shrink-0 text-[#123D2A] dark:text-[#F4C430]" />
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3 border-t border-[#F4C430]/40 pt-5 sm:grid-cols-3">
                  <div className="flex items-center gap-3 text-xs font-bold text-[#123D2A] dark:text-white"><CheckCircle2 className="h-4 w-4 text-[#123D2A] dark:text-[#F4C430]" />Sichere Stripe-Zahlung</div>
                  <div className="flex items-center gap-3 text-xs font-bold text-[#123D2A] dark:text-white"><CheckCircle2 className="h-4 w-4 text-[#123D2A] dark:text-[#F4C430]" />Visa · Mastercard</div>
                  <div className="flex items-center gap-3 text-xs font-bold text-[#123D2A] dark:text-white"><CheckCircle2 className="h-4 w-4 text-[#123D2A] dark:text-[#F4C430]" />Apple Pay · Google Pay · Klarna</div>
                </div>

                <div className="mt-6 flex items-end justify-between border-t border-[#F4C430]/40 pt-5">
                  <span className="text-sm font-bold text-gray-500">Anzeigenpreis · {listingDurationDays} Tage</span>
                  <span className="font-serif text-3xl font-bold text-[#123D2A] dark:text-[#F4C430]">€ {listingFee.toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <div className="border border-[#123D2A]/20 bg-[#EAF2E7] p-5 text-sm font-bold text-[#123D2A] dark:border-white/10 dark:bg-white/5 dark:text-white">
                Dieses Inserat ist kostenlos und wird direkt veröffentlicht.
              </div>
            )}
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
              <span>{isSubmitting ? (listingFee > 0 ? 'Zahlungsseite wird geöffnet...' : 'Wird veröffentlicht...') : listingFee > 0 ? 'Sicher bezahlen & fortfahren' : t.publishListing}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
