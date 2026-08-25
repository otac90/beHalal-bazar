
import { Category } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'fashion-accessories',
    slug: 'mode-accessoires',
    icon: 'Shirt',
    name: { de: 'Mode & Accessoires', en: 'Fashion & Accessories'
    },
    subcategories: [
      { id: 'women-clothes', slug: 'damenbekleidung', name: { de: 'Damenbekleidung', en: 'Women\'s Clothing' } },
      { id: 'men-clothes', slug: 'herrenbekleidung', name: { de: 'Herrenbekleidung', en: 'Men\'s Clothing' } },
      { id: 'shoes', slug: 'schuhe', name: { de: 'Schuhe', en: 'Shoes' } },
      { id: 'bags-accessories', slug: 'taschen-accessoires', name: { de: 'Taschen & Accessoires', en: 'Bags & Accessories' } },
      { id: 'watches-jewelry', slug: 'uhren-schmuck', name: { de: 'Uhren & Schmuck', en: 'Watches & Jewelry' } },
      { id: 'traditional-clothing', slug: 'traditionelle-kleidung', name: { de: 'Traditionelle Kleidung', en: 'Traditional Clothing' } },
    ],
  },
  {
    id: 'baby-kids',
    slug: 'baby-kind',
    icon: 'Baby',
    name: { de: 'Baby & Kind', en: 'Baby & Kids'
    },
    subcategories: [
      { id: 'baby-clothes', slug: 'babykleidung', name: { de: 'Babykleidung', en: 'Baby Clothing' } },
      { id: 'kids-clothes', slug: 'kinderkleidung', name: { de: 'Kinderkleidung', en: 'Kids Clothing' } },
      { id: 'strollers', slug: 'kinderwagen', name: { de: 'Kinderwagen', en: 'Strollers' } },
      { id: 'car-seats', slug: 'autositze', name: { de: 'Autositze', en: 'Car Seats' } },
      { id: 'baby-gear', slug: 'babybedarf', name: { de: 'Babybedarf', en: 'Baby Gear' } },
      { id: 'kids-furniture', slug: 'kindermoebel', name: { de: 'Kindermöbel', en: 'Kids Furniture' } },
      { id: 'toys', slug: 'spielzeug', name: { de: 'Spielzeug', en: 'Toys' } },
    ],
  },
  {
    id: 'electronics',
    slug: 'elektronik',
    icon: 'Smartphone',
    name: { de: 'Elektronik', en: 'Electronics'
    },
    subcategories: [
      { id: 'smartphones', slug: 'smartphones', name: { de: 'Smartphones', en: 'Smartphones' } },
      { id: 'tablets', slug: 'tablets', name: { de: 'Tablets', en: 'Tablets' } },
      { id: 'laptops', slug: 'laptops-computer', name: { de: 'Laptops & Computer', en: 'Laptops & PCs' } },
      { id: 'tv', slug: 'fernseher', name: { de: 'Fernseher', en: 'TVs' } },
      { id: 'audio', slug: 'audio-kopfhoerer', name: { de: 'Audio & Kopfhörer', en: 'Audio & Headphones' } },
      { id: 'cameras', slug: 'kameras', name: { de: 'Kameras', en: 'Cameras' } },
      { id: 'elec-accessories', slug: 'zubehoer', name: { de: 'Zubehör', en: 'Accessories' } },
    ],
  },
  {
    id: 'household',
    slug: 'haushalt',
    icon: 'Utensils',
    name: { de: 'Haushalt', en: 'Household'
    },
    subcategories: [
      { id: 'home-appliances', slug: 'haushaltsgeraete', name: { de: 'Haushaltsgeräte', en: 'Home Appliances' } },
      { id: 'kitchen', slug: 'kuechengeraete', name: { de: 'Küchengeräte', en: 'Kitchen Appliances' } },
      { id: 'tableware', slug: 'geschirr', name: { de: 'Geschirr & Besteck', en: 'Tableware' } },
      { id: 'decoration', slug: 'dekoration', name: { de: 'Dekoration', en: 'Decoration' } },
      { id: 'cleaning', slug: 'reinigung', name: { de: 'Reinigung', en: 'Cleaning' } },
      { id: 'house-accessories', slug: 'haushaltszubehoer', name: { de: 'Haushaltszubehör', en: 'Household Accessories' } },
    ],
  },
  {
    id: 'furniture-living',
    slug: 'moebel-wohnen',
    icon: 'Armchair',
    name: { de: 'Möbel & Wohnen', en: 'Furniture & Living'
    },
    subcategories: [
      { id: 'living-room', slug: 'wohnzimmer', name: { de: 'Wohnzimmer', en: 'Living Room' } },
      { id: 'bedroom', slug: 'schlafzimmer', name: { de: 'Schlafzimmer', en: 'Bedroom' } },
      { id: 'tables-chairs', slug: 'tische-stuehle', name: { de: 'Tische & Stühle', en: 'Tables & Chairs' } },
      { id: 'closets', slug: 'schraenke-regale', name: { de: 'Schränke & Regale', en: 'Closets & Shelves' } },
      { id: 'lighting', slug: 'beleuchtung', name: { de: 'Beleuchtung & Lampen', en: 'Lighting' } },
      { id: 'carpets', slug: 'teppiche', name: { de: 'Teppiche & Textilien', en: 'Rugs & Textiles' } },
    ],
  },
  {
    id: 'sports-leisure',
    slug: 'sport-freizeit',
    icon: 'Bike',
    name: { de: 'Sport & Freizeit', en: 'Sports & Leisure'
    },
    subcategories: [
      { id: 'bikes', slug: 'fahrraeder', name: { de: 'Fahrräder & Roller', en: 'Bikes & Scooters' } },
      { id: 'football', slug: 'fussball', name: { de: 'Fußball & Teamsport', en: 'Football & Sports' } },
      { id: 'fitness', slug: 'fitness-training', name: { de: 'Fitness & Training', en: 'Fitness & Gym' } },
      { id: 'outdoor', slug: 'outdoor-camping', name: { de: 'Outdoor & Camping', en: 'Outdoor & Camping' } },
      { id: 'water-sports', slug: 'wassersport', name: { de: 'Wassersport', en: 'Water Sports' } },
    ],
  },
  {
    id: 'books-media',
    slug: 'buecher-medien',
    icon: 'BookOpen',
    name: { de: 'Bücher & Medien', en: 'Books & Media'
    },
    subcategories: [
      { id: 'islamic-books', slug: 'islamische-buecher', name: { de: 'Islamische Bücher & Literatur', en: 'Islamic Books' } },
      { id: 'kids-books', slug: 'kinderbuecher', name: { de: 'Kinderbücher', en: 'Kids Books' } },
      { id: 'education', slug: 'lernmaterial', name: { de: 'Lernmaterial & Fachbücher', en: 'Educational Books' } },
      { id: 'general-books', slug: 'romane-sachbuecher', name: { de: 'Romane & Sachbücher', en: 'Novels & Non-Fiction' } },
      { id: 'media-games', slug: 'filme-brettspiele', name: { de: 'Filme & Brettspiele', en: 'Movies & Board Games' } },
    ],
  },
  {
    id: 'gaming',
    slug: 'gaming',
    icon: 'Gamepad2',
    name: { de: 'Gaming', en: 'Gaming'
    },
    subcategories: [
      { id: 'consoles', slug: 'konsolen', name: { de: 'Konsolen (PlayStation, Xbox, Switch)', en: 'Consoles' } },
      { id: 'games', slug: 'spiele', name: { de: 'Videospiele', en: 'Games' } },
      { id: 'gaming-accessories', slug: 'gaming-zubehoer', name: { de: 'Gaming Zubehör & Controller', en: 'Gaming Accessories' } },
      { id: 'pc-gaming', slug: 'pc-gaming', name: { de: 'PC Gaming Hardware', en: 'PC Gaming Hardware' } },
    ],
  },
  {
    id: 'auto-accessories',
    slug: 'auto-zubehoer',
    icon: 'Car',
    name: { de: 'Auto & Zubehör', en: 'Auto & Accessories'
    },
    subcategories: [
      { id: 'tires-rims', slug: 'reifen-felgen', name: { de: 'Reifen & Felgen', en: 'Tires & Rims' } },
      { id: 'spare-parts', slug: 'ersatzteile', name: { de: 'Ersatzteile', en: 'Spare Parts' } },
      { id: 'car-accessories', slug: 'auto-zubehoer-teile', name: { de: 'Fahrzeugzubehör & Pflege', en: 'Car Care & Accessories' } },
      { id: 'roof-racks', slug: 'dachtraeger-boxen', name: { de: 'Dachträger & Boxen', en: 'Roof Racks & Boxes' } },
    ],
  },
  {
    id: 'garden-tools',
    slug: 'garten-werkzeug',
    icon: 'Wrench',
    name: { de: 'Garten & Werkzeug', en: 'Garden & Tools'
    },
    subcategories: [
      { id: 'power-tools', slug: 'elektrowerkzeug', name: { de: 'Elektrowerkzeug & Maschinen', en: 'Power Tools' } },
      { id: 'hand-tools', slug: 'handwerkzeug', name: { de: 'Handwerkzeug', en: 'Hand Tools' } },
      { id: 'garden-tools-cat', slug: 'gartengeraete', name: { de: 'Gartengeräte', en: 'Garden Equipment' } },
      { id: 'garden-furniture', slug: 'gartenmoebel', name: { de: 'Gartenmöbel & Grill', en: 'Garden Furniture & BBQ' } },
    ],
  },
  {
    id: 'other',
    slug: 'sonstiges',
    icon: 'Layers',
    name: { de: 'Sonstiges', en: 'Other'
    },
    subcategories: [
      { id: 'other-general', slug: 'verschiedenes', name: { de: 'Verschiedenes', en: 'Miscellaneous' } },
      { id: 'other-crafts', slug: 'basteln-handarbeit', name: { de: 'Basteln & Handarbeit', en: 'Crafts & Handmade' } },
    ],
  },
];
