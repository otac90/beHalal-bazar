export type ListingOffer = 'PRIVATE' | 'COMMERCIAL' | 'BOATS' | 'AUTO_MOTOR' | 'REAL_ESTATE';
export type RealEstateAction = 'SELL' | 'RENT';

export interface ListingOfferOption {
  id: ListingOffer;
  title: string;
  description: string;
  feeLabel: string;
  durationLabel: string;
}

export const LISTING_OFFER_OPTIONS: ListingOfferOption[] = [
  {
    id: 'PRIVATE',
    title: 'Kostenlose Anzeige',
    description: 'Private Dinge verkaufen, verschenken oder suchen.',
    feeLabel: 'Kostenlos',
    durationLabel: '',
  },
  {
    id: 'COMMERCIAL',
    title: 'Gewerbliche Anzeige',
    description: 'Für Unternehmen, Händler und gewerbliche Angebote.',
    feeLabel: '€ 19,99 exkl. USt.',
    durationLabel: '60 Tage',
  },
  {
    id: 'BOATS',
    title: 'Boote & Yachten',
    description: 'Boote, Yachten und Jetskis mit technischen Daten.',
    feeLabel: '€ 44,99',
    durationLabel: '60 Tage',
  },
  {
    id: 'AUTO_MOTOR',
    title: 'Auto & Motor',
    description: 'Fahrzeuge, Motorräder, Nutzfahrzeuge und Zubehör.',
    feeLabel: 'Ab € 0',
    durationLabel: 'Nach Fahrzeugart',
  },
  {
    id: 'REAL_ESTATE',
    title: 'Immobilienanzeige',
    description: 'Haus, Wohnung, Grundstück und weitere Immobilien.',
    feeLabel: 'Ab € 24,99',
    durationLabel: '30 Tage',
  },
];

export const REAL_ESTATE_PRICES: Record<string, Record<RealEstateAction, number>> = {
  'house': { SELL: 49.99, RENT: 30.99 },
  'apartment': { SELL: 49.99, RENT: 30.99 },
  'land': { SELL: 47.99, RENT: 47.99 },
  'commercial-property': { SELL: 52.99, RENT: 34.99 },
  'holiday-property': { SELL: 40.99, RENT: 24.99 },
  'other-property': { SELL: 32.99, RENT: 32.99 },
};

export const getListingFee = (
  offer: ListingOffer,
  subcategoryId: string,
  action: RealEstateAction,
): number => {
  if (offer === 'COMMERCIAL') return 19.99;
  if (offer === 'BOATS') return 44.99;
  if (offer === 'REAL_ESTATE') return REAL_ESTATE_PRICES[subcategoryId]?.[action] ?? 0;
  return 0;
};

export const getListingDurationDays = (offer: ListingOffer): number => {
  if (offer === 'REAL_ESTATE') return 30;
  if (offer === 'COMMERCIAL' || offer === 'BOATS') return 60;
  return 30;
};

export const AUTO_MOTOR_CATEGORIES = [
  { id: 'cars', title: 'Gebrauchtwagen', description: 'Kostenlos bis zu einem Fahrzeugwert von € 22.000.' },
  { id: 'motorcycles-quads', title: 'Motorrad & Quad', description: 'Kostenlos bis zu einem Fahrzeugwert von € 8.000.' },
  { id: 'commercial-vehicles', title: 'Nutzfahrzeug & Pickup', description: 'Transporter, Lkw und Pickups.' },
  { id: 'caravans-motorhomes', title: 'Wohnwagen & Wohnmobil', description: 'Reisemobile und Wohnanhänger.' },
  { id: 'spare-parts-accessories', title: 'Ersatzteile & Zubehör', description: 'Teile, Reifen, Felgen und Fahrzeugzubehör.' },
];

export const BOAT_CATEGORIES = [
  { id: 'motorboats', title: 'Motorboote', description: 'Sportboote, Daycruiser und Kabinenboote.' },
  { id: 'sailboats', title: 'Segelboote', description: 'Segelboote, Katamarane und Jollen.' },
  { id: 'yachts', title: 'Yachten', description: 'Motoryachten und größere Fahrtenyachten.' },
  { id: 'jetskis', title: 'Jetskis', description: 'Wassermotorräder und persönliche Wasserfahrzeuge.' },
];

export const REAL_ESTATE_CATEGORIES = [
  { id: 'house', title: 'Haus', description: 'Einfamilienhaus, Reihenhaus oder Mehrfamilienhaus.' },
  { id: 'apartment', title: 'Wohnung', description: 'Eigentumswohnung, Apartment oder Penthouse.' },
  { id: 'land', title: 'Grundstück', description: 'Baugrund, Freizeitgrundstück oder landwirtschaftliche Fläche.' },
  { id: 'commercial-property', title: 'Gewerbeimmobilie', description: 'Büro, Geschäft, Lager, Gastronomie oder Praxis.' },
  { id: 'holiday-property', title: 'Ferienimmobilie', description: 'Ferienhaus, Ferienwohnung oder Chalet.' },
  { id: 'other-property', title: 'Sonstige Immobilien', description: 'Garagen, Stellplätze und besondere Objekte.' },
];
