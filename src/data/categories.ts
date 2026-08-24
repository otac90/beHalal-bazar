
import { Category } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'fashion-accessories',
    slug: 'mode-accessoires',
    icon: 'Shirt',
    name: {
      de: 'Mode & Accessoires',
      bs: 'Moda i dodaci',
      en: 'Fashion & Accessories',
      tr: 'Moda ve Aksesuarlar',
      ar: 'الموضة والإكسسوارات',
      sq: 'Modë dhe Aksesorë',
      ru: 'Мода и аксессуары'
    },
    subcategories: [
      { id: 'women-clothes', slug: 'damenbekleidung', name: { de: 'Damenbekleidung', bs: 'Ženska odjeća', en: 'Women\'s Clothing', tr: 'Kadın Giyim', ar: 'ملابس نسائية', sq: 'Veshje për Femra', ru: 'Женская одежда' } },
      { id: 'men-clothes', slug: 'herrenbekleidung', name: { de: 'Herrenbekleidung', bs: 'Muška odjeća', en: 'Men\'s Clothing', tr: 'Erkek Giyim', ar: 'ملابس رجالية', sq: 'Veshje për Meshkuj', ru: 'Мужская одежда' } },
      { id: 'shoes', slug: 'schuhe', name: { de: 'Schuhe', bs: 'Cipele', en: 'Shoes', tr: 'Ayakkabı', ar: 'أحذية', sq: 'Këpucë', ru: 'Обувь' } },
      { id: 'bags-accessories', slug: 'taschen-accessoires', name: { de: 'Taschen & Accessoires', bs: 'Torbe i dodaci', en: 'Bags & Accessories', tr: 'Çanta ve Aksesuarlar', ar: 'حقائب وإكسسوارات', sq: 'Çanta dhe Aksesorë', ru: 'Сумки и аксессуары' } },
      { id: 'watches-jewelry', slug: 'uhren-schmuck', name: { de: 'Uhren & Schmuck', bs: 'Satovi i nakit', en: 'Watches & Jewelry', tr: 'Saat ve Takı', ar: 'ساعات ومجوهرات', sq: 'Orë dhe Bizhuteri', ru: 'Часы и украшения' } },
      { id: 'traditional-clothing', slug: 'traditionelle-kleidung', name: { de: 'Traditionelle Kleidung', bs: 'Tradicionalna odjeća', en: 'Traditional Clothing', tr: 'Geleneksel Giyim', ar: 'ملابس تقليدية', sq: 'Veshje Tradicionale', ru: 'Традиционная одежда' } },
    ],
  },
  {
    id: 'baby-kids',
    slug: 'baby-kind',
    icon: 'Baby',
    name: {
      de: 'Baby & Kind',
      bs: 'Bebe i djeca',
      en: 'Baby & Kids',
      tr: 'Bebek ve Çocuk',
      ar: 'أطفال ورضع',
      sq: 'Fëmijë dhe Foshnje',
      ru: 'Дети и младенцы'
    },
    subcategories: [
      { id: 'baby-clothes', slug: 'babykleidung', name: { de: 'Babykleidung', bs: 'Odjeća za bebe', en: 'Baby Clothing', tr: 'Bebek Giyim', ar: 'ملابس رضع', sq: 'Veshje për Foshnje', ru: 'Детская одежда' } },
      { id: 'kids-clothes', slug: 'kinderkleidung', name: { de: 'Kinderkleidung', bs: 'Dječja odjeća', en: 'Kids Clothing', tr: 'Çocuk Giyim', ar: 'ملابس أطفال', sq: 'Veshje për Fëmijë', ru: 'Одежда для детей' } },
      { id: 'strollers', slug: 'kinderwagen', name: { de: 'Kinderwagen', bs: 'Dječja kolica', en: 'Strollers', tr: 'Bebek Arabası', ar: 'عربات أطفال', sq: 'Karroca për Fëmijë', ru: 'Коляски' } },
      { id: 'car-seats', slug: 'autositze', name: { de: 'Autositze', bs: 'Autosjedalice', en: 'Car Seats', tr: 'Oto Koltuğu', ar: 'مقاعد سيارات', sq: 'Sedilje për Makina', ru: 'Автокресла' } },
      { id: 'baby-gear', slug: 'babybedarf', name: { de: 'Babybedarf', bs: 'Oprema za bebe', en: 'Baby Gear', tr: 'Bebek Eşyaları', ar: 'مستلزمات رضع', sq: 'Pajisje për Foshnje', ru: 'Детские принадлежности' } },
      { id: 'kids-furniture', slug: 'kindermoebel', name: { de: 'Kindermöbel', bs: 'Dječji namještaj', en: 'Kids Furniture', tr: 'Çocuk Mobilyası', ar: 'أثاث أطفال', sq: 'Mobilje për Fëmijë', ru: 'Детская мебель' } },
      { id: 'toys', slug: 'spielzeug', name: { de: 'Spielzeug', bs: 'Igračke', en: 'Toys', tr: 'Oyuncak', ar: 'ألعاب', sq: 'Lodra', ru: 'Игрушки' } },
    ],
  },
  {
    id: 'electronics',
    slug: 'elektronik',
    icon: 'Smartphone',
    name: {
      de: 'Elektronik',
      bs: 'Elektronika',
      en: 'Electronics',
      tr: 'Elektronik',
      ar: 'إلكترونيات',
      sq: 'Elektronikë',
      ru: 'Электроника'
    },
    subcategories: [
      { id: 'smartphones', slug: 'smartphones', name: { de: 'Smartphones', bs: 'Pametni telefoni', en: 'Smartphones', tr: 'Akıllı Telefonlar', ar: 'هواتف ذكية', sq: 'Telefona Inteligjentë', ru: 'Смартфоны' } },
      { id: 'tablets', slug: 'tablets', name: { de: 'Tablets', bs: 'Tableti', en: 'Tablets', tr: 'Tabletler', ar: 'أجهزة لوحية', sq: 'Tableta', ru: 'Планшеты' } },
      { id: 'laptops', slug: 'laptops-computer', name: { de: 'Laptops & Computer', bs: 'Laptopi i računari', en: 'Laptops & PCs', tr: 'Dizüstü ve Bilgisayarlar', ar: 'حواسيب محمولة', sq: 'Laptopë dhe Kompjuterë', ru: 'Ноутбуки и ПК' } },
      { id: 'tv', slug: 'fernseher', name: { de: 'Fernseher', bs: 'Televizori', en: 'TVs', tr: 'Televizyonlar', ar: 'تلفزيونات', sq: 'Televizorë', ru: 'Телевизоры' } },
      { id: 'audio', slug: 'audio-kopfhoerer', name: { de: 'Audio & Kopfhörer', bs: 'Audio i slušalice', en: 'Audio & Headphones', tr: 'Ses ve Kulaklık', ar: 'صوت وسماعات', sq: 'Audio dhe Kufje', ru: 'Аудио и наушники' } },
      { id: 'cameras', slug: 'kameras', name: { de: 'Kameras', bs: 'Kamere', en: 'Cameras', tr: 'Kameralar', ar: 'كاميرات', sq: 'Kamera', ru: 'Камеры' } },
      { id: 'elec-accessories', slug: 'zubehoer', name: { de: 'Zubehör', bs: 'Dodatna oprema', en: 'Accessories', tr: 'Aksesuarlar', ar: 'إكسسوارات', sq: 'Aksesorë', ru: 'Аксессуары' } },
    ],
  },
  {
    id: 'household',
    slug: 'haushalt',
    icon: 'Utensils',
    name: {
      de: 'Haushalt',
      bs: 'Domaćinstvo',
      en: 'Household',
      tr: 'Ev Aletleri',
      ar: 'أدوات منزلية',
      sq: 'Pajisje Shtëpiake',
      ru: 'Домашнее хозяйство'
    },
    subcategories: [
      { id: 'home-appliances', slug: 'haushaltsgeraete', name: { de: 'Haushaltsgeräte', bs: 'Kućanski aparati', en: 'Home Appliances', tr: 'Ev Aletleri', ar: 'أجهزة منزلية', sq: 'Pajisje Shtëpiake', ru: 'Бытовая техника' } },
      { id: 'kitchen', slug: 'kuechengeraete', name: { de: 'Küchengeräte', bs: 'Kuhinjski aparati', en: 'Kitchen Appliances', tr: 'Mutfak Aletleri', ar: 'أجهزة مطبخ', sq: 'Pajisje Kuzhine', ru: 'Кухонная техника' } },
      { id: 'tableware', slug: 'geschirr', name: { de: 'Geschirr & Besteck', bs: 'Posuđe i pribor', en: 'Tableware', tr: 'Sofra & Çatal Bıçak', ar: 'أدوات مائدة', sq: 'Enë dhe Takëme', ru: 'Посуда' } },
      { id: 'decoration', slug: 'dekoration', name: { de: 'Dekoration', bs: 'Dekoracija', en: 'Decoration', tr: 'Dekorasyon', ar: 'ديكور', sq: 'Dekorime', ru: 'Декор' } },
      { id: 'cleaning', slug: 'reinigung', name: { de: 'Reinigung', bs: 'Čišćenje', en: 'Cleaning', tr: 'Temizlik', ar: 'تنظيف', sq: 'Pastrim', ru: 'Уборка' } },
      { id: 'house-accessories', slug: 'haushaltszubehoer', name: { de: 'Haushaltszubehör', bs: 'Kućanski pribor', en: 'Household Accessories', tr: 'Ev Aksesuarları', ar: 'إكسسوارات منزلية', sq: 'Aksesorë Shtëpie', ru: 'Аксессуары для дома' } },
    ],
  },
  {
    id: 'furniture-living',
    slug: 'moebel-wohnen',
    icon: 'Armchair',
    name: {
      de: 'Möbel & Wohnen',
      bs: 'Namještaj i stanovanje',
      en: 'Furniture & Living',
      tr: 'Mobilya ve Yaşam',
      ar: 'أثاث ومعيشة',
      sq: 'Mobilje dhe Jetesa',
      ru: 'Мебель и дом'
    },
    subcategories: [
      { id: 'living-room', slug: 'wohnzimmer', name: { de: 'Wohnzimmer', bs: 'Dnevna soba', en: 'Living Room', tr: 'Oturma Odası', ar: 'غرفة معيشة', sq: 'Dhomë Ndenje', ru: 'Гостиная' } },
      { id: 'bedroom', slug: 'schlafzimmer', name: { de: 'Schlafzimmer', bs: 'Spavaća soba', en: 'Bedroom', tr: 'Yatak Odası', ar: 'غرفة نوم', sq: 'Dhomë Gjumi', ru: 'Спальня' } },
      { id: 'tables-chairs', slug: 'tische-stuehle', name: { de: 'Tische & Stühle', bs: 'Stolovi i stolice', en: 'Tables & Chairs', tr: 'Masa ve Sandalye', ar: 'طاولات وكراسي', sq: 'Tavolina dhe Karrige', ru: 'Столы и стулья' } },
      { id: 'closets', slug: 'schraenke-regale', name: { de: 'Schränke & Regale', bs: 'Ormari i police', en: 'Closets & Shelves', tr: 'Dolap ve Raflar', ar: 'خزائن ورفوف', sq: 'Dollapë dhe Rafte', ru: 'Шкафы и полки' } },
      { id: 'lighting', slug: 'beleuchtung', name: { de: 'Beleuchtung & Lampen', bs: 'Rasvjeta', en: 'Lighting', tr: 'Aydınlatma', ar: 'إضاءة', sq: 'Ndriçim', ru: 'Освещение' } },
      { id: 'carpets', slug: 'teppiche', name: { de: 'Teppiche & Textilien', bs: 'Tepisi i tekstil', en: 'Rugs & Textiles', tr: 'Halı ve Tekstil', ar: 'سجاد ومنسوجات', sq: 'Tapete dhe Tekstile', ru: 'Ковры и текстиль' } },
    ],
  },
  {
    id: 'sports-leisure',
    slug: 'sport-freizeit',
    icon: 'Bike',
    name: {
      de: 'Sport & Freizeit',
      bs: 'Sport i rekreacija',
      en: 'Sports & Leisure',
      tr: 'Spor ve Eğlence',
      ar: 'رياضة وترفيه',
      sq: 'Sport dhe Argëtim',
      ru: 'Спорт и отдых'
    },
    subcategories: [
      { id: 'bikes', slug: 'fahrraeder', name: { de: 'Fahrräder & Roller', bs: 'Bicikli i romobili', en: 'Bikes & Scooters', tr: 'Bisiklet ve Scooter', ar: 'دراجات وسكوتر', sq: 'Biçikleta dhe Skuterë', ru: 'Велосипеды и самокаты' } },
      { id: 'football', slug: 'fussball', name: { de: 'Fußball & Teamsport', bs: 'Fudbal i timski sport', en: 'Football & Sports', tr: 'Futbol ve Takım Sporları', ar: 'كرة قدم ورياضات', sq: 'Futboll dhe Sporte Ekipesh', ru: 'Футбол и спорт' } },
      { id: 'fitness', slug: 'fitness-training', name: { de: 'Fitness & Training', bs: 'Fitness i trening', en: 'Fitness & Gym', tr: 'Fitness ve Antrenman', ar: 'لياقة بدنية', sq: 'Fitnes dhe Stërvitje', ru: 'Фитнес и тренировки' } },
      { id: 'outdoor', slug: 'outdoor-camping', name: { de: 'Outdoor & Camping', bs: 'Outdoor i kampovanje', en: 'Outdoor & Camping', tr: 'Açık Hava ve Kamp', ar: 'تخييم وهواء طلق', sq: 'Outdoor dhe Kampim', ru: 'Кемпинг и отдых' } },
      { id: 'water-sports', slug: 'wassersport', name: { de: 'Wassersport', bs: 'Vodeni sportovi', en: 'Water Sports', tr: 'Su Sporları', ar: 'رياضات مائية', sq: 'Sporte Ujore', ru: 'Водный спорт' } },
    ],
  },
  {
    id: 'books-media',
    slug: 'buecher-medien',
    icon: 'BookOpen',
    name: {
      de: 'Bücher & Medien',
      bs: 'Knjige i mediji',
      en: 'Books & Media',
      tr: 'Kitap ve Medya',
      ar: 'كتب وإعلام',
      sq: 'Libra dhe Media',
      ru: 'Книги и медиа'
    },
    subcategories: [
      { id: 'islamic-books', slug: 'islamische-buecher', name: { de: 'Islamische Bücher & Literatur', bs: 'Islamske knjige i literatura', en: 'Islamic Books', tr: 'İslami Kitaplar', ar: 'كتب إسلامية', sq: 'Libra Islamë', ru: 'Исламские книги' } },
      { id: 'kids-books', slug: 'kinderbuecher', name: { de: 'Kinderbücher', bs: 'Dječje knjige', en: 'Kids Books', tr: 'Çocuk Kitapları', ar: 'كتب أطفال', sq: 'Libra për Fëmijë', ru: 'Детские книги' } },
      { id: 'education', slug: 'lernmaterial', name: { de: 'Lernmaterial & Fachbücher', bs: 'Edukativni materijal', en: 'Educational Books', tr: 'Eğitim Materyalleri', ar: 'مواد تعليمية', sq: 'Materiale Edukative', ru: 'Учебные материалы' } },
      { id: 'general-books', slug: 'romane-sachbuecher', name: { de: 'Romane & Sachbücher', bs: 'Romani i literatura', en: 'Novels & Non-Fiction', tr: 'Romanlar ve Kurgu Dışı', ar: 'روايات وكتب غير خيالية', sq: 'Romane dhe Jo-Fiksion', ru: 'Романы и документальная литература' } },
      { id: 'media-games', slug: 'filme-brettspiele', name: { de: 'Filme & Brettspiele', bs: 'Filmovi i društvene igre', en: 'Movies & Board Games', tr: 'Film ve Kutu Oyunları', ar: 'أفلام وألعاب لوحية', sq: 'Filma dhe Lojëra Bordi', ru: 'Фильмы и настольные игры' } },
    ],
  },
  {
    id: 'gaming',
    slug: 'gaming',
    icon: 'Gamepad2',
    name: {
      de: 'Gaming',
      bs: 'Gaming',
      en: 'Gaming',
      tr: 'Oyun',
      ar: 'ألعاب',
      sq: 'Lojëra',
      ru: 'Гейминг'
    },
    subcategories: [
      { id: 'consoles', slug: 'konsolen', name: { de: 'Konsolen (PlayStation, Xbox, Switch)', bs: 'Konzole', en: 'Consoles', tr: 'Konsollar', ar: 'أجهزة ألعاب', sq: 'Konzola', ru: 'Консоли' } },
      { id: 'games', slug: 'spiele', name: { de: 'Videospiele', bs: 'Igre', en: 'Games', tr: 'Video Oyunları', ar: 'ألعاب فيديو', sq: 'Lojëra Video', ru: 'Игры' } },
      { id: 'gaming-accessories', slug: 'gaming-zubehoer', name: { de: 'Gaming Zubehör & Controller', bs: 'Gaming oprema', en: 'Gaming Accessories', tr: 'Oyun Aksesuarları', ar: 'إكسسوارات ألعاب', sq: 'Aksesorë Lojërash', ru: 'Аксессуары для гейминга' } },
      { id: 'pc-gaming', slug: 'pc-gaming', name: { de: 'PC Gaming Hardware', bs: 'PC Gaming komponente', en: 'PC Gaming Hardware', tr: 'PC Oyun Donanımı', ar: 'عتاد ألعاب الكمبيوتر', sq: 'Hardware për PC Gaming', ru: 'Комплектующие для ПК' } },
    ],
  },
  {
    id: 'auto-accessories',
    slug: 'auto-zubehoer',
    icon: 'Car',
    name: {
      de: 'Auto & Zubehör',
      bs: 'Auto i oprema',
      en: 'Auto & Accessories',
      tr: 'Otomobil ve Aksesuarlar',
      ar: 'سيارات وإكسسوارات',
      sq: 'Auto dhe Aksesorë',
      ru: 'Авто и аксессуары'
    },
    subcategories: [
      { id: 'tires-rims', slug: 'reifen-felgen', name: { de: 'Reifen & Felgen', bs: 'Gume i felge', en: 'Tires & Rims', tr: 'Lastik ve Jantlar', ar: 'إطارات وجنوط', sq: 'Goma dhe Disqe', ru: 'Шины и диски' } },
      { id: 'spare-parts', slug: 'ersatzteile', name: { de: 'Ersatzteile', bs: 'Rezervni dijelovi', en: 'Spare Parts', tr: 'Yedek Parçalar', ar: 'قطع غيار', sq: 'Pjesë Këmbimi', ru: 'Запчасти' } },
      { id: 'car-accessories', slug: 'auto-zubehoer-teile', name: { de: 'Fahrzeugzubehör & Pflege', bs: 'Auto oprema i njega', en: 'Car Care & Accessories', tr: 'Otomobil Aksesuarları', ar: 'إكسسوارات وعناية بالسيارات', sq: 'Aksesorë për Makina', ru: 'Автоаксессуары' } },
      { id: 'roof-racks', slug: 'dachtraeger-boxen', name: { de: 'Dachträger & Boxen', bs: 'Krovni nosači i kutije', en: 'Roof Racks & Boxes', tr: 'Portbagaj ve Kutular', ar: 'حوامل وسلال سقف', sq: 'Mbajtëse për Çati', ru: 'Багажники на крышу' } },
    ],
  },
  {
    id: 'garden-tools',
    slug: 'garten-werkzeug',
    icon: 'Wrench',
    name: {
      de: 'Garten & Werkzeug',
      bs: 'Vrt i alati',
      en: 'Garden & Tools',
      tr: 'Bahçe ve Aletler',
      ar: 'حديقة وأدوات',
      sq: 'Kopsht dhe Vegla',
      ru: 'Сад и инструменты'
    },
    subcategories: [
      { id: 'power-tools', slug: 'elektrowerkzeug', name: { de: 'Elektrowerkzeug & Maschinen', bs: 'Električni alati', en: 'Power Tools', tr: 'Elektrikli Aletler', ar: 'أدوات كهربائية', sq: 'Vegla Elektrike', ru: 'Электроинструменты' } },
      { id: 'hand-tools', slug: 'handwerkzeug', name: { de: 'Handwerkzeug', bs: 'Ručni alati', en: 'Hand Tools', tr: 'El Aletleri', ar: 'أدوات يدوية', sq: 'Vegla Dore', ru: 'Ручные инструменты' } },
      { id: 'garden-tools-cat', slug: 'gartengeraete', name: { de: 'Gartengeräte', bs: 'Vrtni alati', en: 'Garden Equipment', tr: 'Bahçe Ekipmanları', ar: 'معدات حدائق', sq: 'Pajisje Kopshti', ru: 'Садовый инвентарь' } },
      { id: 'garden-furniture', slug: 'gartenmoebel', name: { de: 'Gartenmöbel & Grill', bs: 'Vrtni namještaj i roštilj', en: 'Garden Furniture & BBQ', tr: 'Bahçe Mobilyası ve Mangal', ar: 'أثاث حدائق وشواء', sq: 'Mobilje Kopshti', ru: 'Садовая мебель и гриль' } },
    ],
  },
  {
    id: 'other',
    slug: 'sonstiges',
    icon: 'Layers',
    name: {
      de: 'Sonstiges',
      bs: 'Ostalo',
      en: 'Other',
      tr: 'Diğer',
      ar: 'أخرى',
      sq: 'Të Tjera',
      ru: 'Другое'
    },
    subcategories: [
      { id: 'other-general', slug: 'verschiedenes', name: { de: 'Verschiedenes', bs: 'Razno', en: 'Miscellaneous', tr: 'Çeşitli', ar: 'متفرقات', sq: 'Të Ndryshme', ru: 'Разное' } },
      { id: 'other-crafts', slug: 'basteln-handarbeit', name: { de: 'Basteln & Handarbeit', bs: 'Rukotvorine', en: 'Crafts & Handmade', tr: 'El İşi', ar: 'أعمال يدوية', sq: 'Punime Dore', ru: 'Рукоделие' } },
    ],
  },
];
