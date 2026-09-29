export type IndianLanguage =
  | 'English'
  | 'తెలుగు'
  | 'हिन्दी'
  | 'தமிழ்'
  | 'ಕನ್ನಡ'
  | 'മലയാളം'
  | 'मराठी'
  | 'বাংলা';

export const INDIAN_LANGUAGES: {
  code: IndianLanguage;
  nativeName: string;
  englishLabel: string;
  region: string;
}[] = [
  { code: 'English', nativeName: 'English', englishLabel: 'English', region: 'All India' },
  { code: 'తెలుగు', nativeName: 'తెలుగు', englishLabel: 'Telugu', region: 'AP & Telangana' },
  { code: 'हिन्दी', nativeName: 'हिन्दी', englishLabel: 'Hindi', region: 'North & Central' },
  { code: 'தமிழ்', nativeName: 'தமிழ்', englishLabel: 'Tamil', region: 'Tamil Nadu' },
  { code: 'ಕನ್ನಡ', nativeName: 'ಕನ್ನಡ', englishLabel: 'Kannada', region: 'Karnataka' },
  { code: 'മലയാളം', nativeName: 'മലയാളം', englishLabel: 'Malayalam', region: 'Kerala' },
  { code: 'मराठी', nativeName: 'मराठी', englishLabel: 'Marathi', region: 'Maharashtra' },
  { code: 'বাংলা', nativeName: 'বাংলা', englishLabel: 'Bengali', region: 'West Bengal' },
];

export const UI_TRANSLATIONS: Record<
  IndianLanguage,
  {
    tagline: string;
    heroHeadline: string;
    heroSub: string;
    shopTab: string;
    resaleTab: string;
    exchangeTab: string;
    servicesTab: string;
    aiTab: string;
    searchPlaceholder: string;
  }
> = {
  English: {
    tagline: 'Shop Smart · Live Better',
    heroHeadline: 'India’s neighbourhood marketplace for shopping, resale, exchange, and home services.',
    heroSub:
      'Built natively for Instant UPI QR Scan & Pay, RuPay/Card transactions, Cash on Delivery, ONDC local merchants, and full Store Owner Price & Offer control.',
    shopTab: 'Shop',
    resaleTab: 'Resale',
    exchangeTab: 'Exchange',
    servicesTab: 'Services',
    aiTab: 'Owner & Offers',
    searchPlaceholder: 'Search products, categories, or offers under ₹15,000...',
  },
  తెలుగు: {
    tagline: 'స్మార్ట్‌గా షాపింగ్ చేయండి · మెరుగ్గా జీవించండి',
    heroHeadline: 'కొత్త వస్తువులు, పాత వస్తువుల అమ్మకం, ఎక్స్ఛేంజ్ మరియు లోకల్ సర్వీసుల కోసం మన లోకల్ మార్కెట్‌ప్లేస్.',
    heroSub:
      'UPI QR చెల్లింపులు, కార్డ్ ట్రాన్సాక్షన్స్, క్యాష్ ఆన్ డెలివరీ మరియు ఆఫర్ ధరల నిర్వహణ.',
    shopTab: 'షాపింగ్',
    resaleTab: 'పాతవి అమ్మండి',
    exchangeTab: 'ఎక్స్ఛేంజ్',
    servicesTab: 'సర్వీసులు',
    aiTab: 'ఓనర్ & ఆఫర్లు',
    searchPlaceholder: 'ఉత్పత్తులు లేదా ₹15,000 లోపు ఆఫర్లు వెతకండి...',
  },
  हिन्दी: {
    tagline: 'स्मार्ट खरीदारी · बेहतर जीवन',
    heroHeadline: 'नई खरीदारी, सेकंड-हैंड बिक्री, एक्सचेंज और लोकल होम सर्विसेज के लिए भारत का स्मार्ट मार्केटप्लेस।',
    heroSub:
      'UPI QR स्कैन, कार्ड पेमेंट्स, कैश ऑन डिलीवरी और स्टोर ओनर प्राइस व डिस्काउंट कंट्रोल के साथ।',
    shopTab: 'खरीदारी',
    resaleTab: 'रीसेल',
    exchangeTab: 'एक्सचेंज',
    servicesTab: 'लोकल सर्विस',
    aiTab: 'ओनर और ऑफर्स',
    searchPlaceholder: 'प्रोडक्ट खोजें या ₹15,000 के नीचे बेस्ट ऑफर्स देखें...',
  },
  தமிழ்: {
    tagline: 'ஸ்மார்ட் ஷாப்பிங் · சிறப்பான வாழ்க்கை',
    heroHeadline: 'புதிய பொருட்கள், பழைய பொருட்கள் விற்பனை, எக்ஸ்சேஞ்ச் மற்றும் உள்ளூர் சேவைகளுக்கான சந்தை.',
    heroSub: 'UPI QR கட்டணங்கள், கார்டு பரிவர்த்தனைகள், கேஷ் ஆன் டெலிவரி மற்றும் சிறப்பு சலுகைகள்.',
    shopTab: 'ஷாப்பிங்',
    resaleTab: 'மறுவிற்பனை',
    exchangeTab: 'எக்ஸ்சேஞ்ச்',
    servicesTab: 'சேவைகள்',
    aiTab: 'உரிமையாளர் & சலுகை',
    searchPlaceholder: 'பொருட்களைத் தேடுங்கள் அல்லது ₹15,000-க்குள் சலுகைகள்...',
  },
  ಕನ್ನಡ: {
    tagline: 'ಸ್ಮಾರ್ಟ್ ಶಾಪಿಂಗ್ · ಉತ್ತಮ ಜೀವನ',
    heroHeadline: 'ಹೊಸ ಖರೀದಿ, ಸೆಕೆಂಡ್ ಹ್ಯಾಂಡ್ ಮಾರಾಟ, ಎಕ್ಸ್‌ಚೇಂಜ್ ಮತ್ತು ಸ್ಥಳೀಯ ಸೇವೆಗಳಿಗಾಗಿ ಭಾರತದ ಸ್ಮಾರ್ಟ್ ಮಾರುಕಟ್ಟೆ.',
    heroSub: 'UPI QR ಪಾವತಿ, ಕಾರ್ಡ್ ವಹಿವಾಟು, ಕ್ಯಾಶ್ ಆನ್ ಡೆಲಿವರಿ ಮತ್ತು ಆಫರ್ ಬೆಲೆ ನಿರ್ವಹಣೆ.',
    shopTab: 'ಖರೀದಿ',
    resaleTab: 'ಮರುಮಾರಾಟ',
    exchangeTab: 'ಎಕ್ಸ್‌ಚೇಂಜ್',
    servicesTab: 'ಸೇವೆಗಳು',
    aiTab: 'ಮಾಲೀಕರು & ಆಫರ್',
    searchPlaceholder: 'ಉತ್ಪನ್ನಗಳನ್ನು ಹುಡುಕಿ ಅಥವಾ ₹15,000 ಒಳಗಿನ ಆಫರ್...',
  },
  മലയാളം: {
    tagline: 'സ്മാർട്ട് ഷോപ്പിംഗ് · മികച്ച ജീവിതം',
    heroHeadline: 'പുതിയവ വാങ്ങാനും പഴയവ വിൽക്കാനും എക്സ്ചേഞ്ച് ചെയ്യാനും ലോക്കൽ സർവീസുകൾക്കുമുള്ള മാർക്കറ്റ്പ്ലേസ്.',
    heroSub: 'UPI QR പേയ്‌മെന്റുകൾ, കാർഡ് ഇടപാടുകൾ, ക്യാഷ് ഓൺ ഡെലിവറി, ഓഫർ വില നിയന്ത്രണം.',
    shopTab: 'ഷോപ്പിംഗ്',
    resaleTab: 'റീസെയിൽ',
    exchangeTab: 'എക്സ്ചേഞ്ച്',
    servicesTab: 'സർവീസുകൾ',
    aiTab: 'ഓണർ & ഓഫറുകൾ',
    searchPlaceholder: 'ഉൽപ്പന്നങ്ങൾ തിരയുക അല്ലെങ്കിൽ ₹15,000-ൽ താഴെയുള്ള ഓഫർ...',
  },
  मराठी: {
    tagline: 'स्मार्ट खरेदी · उत्तम जीवन',
    heroHeadline: 'नवीन खरेदी, जुन्या वस्तूंची विक्री, एक्सचेंज आणि लोकल होम सर्व्हिसेससाठी भारताचे स्मार्ट मार्केटप्लेस.',
    heroSub: 'UPI QR पेमेंट, कार्ड व्यवहार, कॅश ऑन डिलिव्हरी आणि ओनर प्राईस व डिस्काउंट कंट्रोल.',
    shopTab: 'खरेदी',
    resaleTab: 'रीसेल',
    exchangeTab: 'एक्सचेंज',
    servicesTab: 'सेवा',
    aiTab: 'ओनर आणि ऑफर्स',
    searchPlaceholder: 'उत्पादने शोधा किंवा ₹15,000 खालील ऑफर्स शोधा...',
  },
  বাংলা: {
    tagline: 'স্মার্ট শপিং · সুন্দর জীবন',
    heroHeadline: 'নতুন কেনাকাটা, পুরনো জিনিস বিক্রি, এক্সচেঞ্জ এবং লোকাল সার্ভিসের জন্য ভারতের স্মার্ট মার্কেটপ্লেস।',
    heroSub: 'UPI QR পেমেন্ট, কার্ড লেনদেন, ক্যাশ অন ডেলিভারি এবং ওনার প্রাইস ও ডিসকাউন্ট কন্ট্রোল।',
    shopTab: 'শপিং',
    resaleTab: 'রিসেল',
    exchangeTab: 'এক্সচেঞ্জ',
    servicesTab: 'সার্ভিস',
    aiTab: 'ওনার ও অফার',
    searchPlaceholder: 'পণ্য খুঁজুন বা ₹15,000-এর নিচে অফার খুঁজুন...',
  },
};

export type ProductCategory =
  | 'Electronics'
  | 'Fashion'
  | 'Grocery'
  | 'Home & Kitchen'
  | 'Beauty'
  | 'Sports'
  | 'Pet Care';

export interface ProductItem {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  mrp: number;
  exchangeBonusUpTo: number;
  offerTag?: string;
  stockStatus?: 'In Stock' | 'Limited Stock' | 'Out of Stock';
  image: string;
  sellerName: string;
  city: string;
  deliveryEta: string;
  rating: string;
  specs: string[];
  variants: string[];
  condition: 'New' | 'Like New' | 'Good' | 'Refurbished';
  isUsedListing?: boolean;
  sellerDistanceKm?: number;
  description: string;
}

export interface LocalServiceItem {
  id: string;
  title: string;
  category:
    | 'Electrician'
    | 'Plumber'
    | 'Mobile Repair'
    | 'AC Repair'
    | 'Computer Repair'
    | 'Home Cleaning';
  basePrice: number;
  visitFee: number;
  etaMinutes: number;
  warrantyDays: number;
  technicianCount: number;
  rating: string;
  image: string;
  includes: string[];
}

export interface ExchangeMatchOffer {
  id: string;
  ownerName: string;
  neighborhood: string;
  distanceKm: number;
  offeringItem: string;
  lookingFor: string;
  topUpInr: number;
  verifiedPhone: boolean;
}

export const HERO_IMAGE = '/src/assets/images/hero_dharmamart_lifestyle_1790684465575.jpg';
export const IMG_PHONE = '/src/assets/images/product_smartphone_5g_1790684481312.jpg';
export const IMG_CHAIR = '/src/assets/images/product_wooden_chair_1790684495105.jpg';
export const IMG_GROCERY = '/src/assets/images/product_organic_groceries_1790684509549.jpg';
export const IMG_SERVICE = '/src/assets/images/service_home_repair_1790684523850.jpg';
export const IMG_FASHION = '/src/assets/images/product_fashion_khadi_shirt_1790685098833.jpg';
export const IMG_BEAUTY = '/src/assets/images/product_beauty_kumkumadi_serum_1790685117401.jpg';
export const IMG_SPORTS = '/src/assets/images/product_sports_fitness_kit_1790685132874.jpg';
export const IMG_PET = '/src/assets/images/product_pet_care_essentials_1790685151063.jpg';

export const STUDIO_PRODUCT_IMAGES: { label: string; category: ProductCategory; url: string }[] = [
  { label: '5G Smartphone Studio Photo', category: 'Electronics', url: IMG_PHONE },
  { label: 'ANC Headphones & Copper Carafe', category: 'Electronics', url: HERO_IMAGE },
  { label: 'Teak & Cane Lounge Chair', category: 'Home & Kitchen', url: IMG_CHAIR },
  { label: 'Organic Farm Pantry & Oil Trio', category: 'Grocery', url: IMG_GROCERY },
  { label: 'Handloom Khadi Shirt & Kurta', category: 'Fashion', url: IMG_FASHION },
  { label: 'Kumkumadi Botanical Elixir', category: 'Beauty', url: IMG_BEAUTY },
  { label: 'Cricket Bat & Cork Fitness Kit', category: 'Sports', url: IMG_SPORTS },
  { label: 'Holistic Pet Care Essentials', category: 'Pet Care', url: IMG_PET },
];

export const NEW_PRODUCTS: ProductItem[] = [
  {
    id: 'dm-prod-1',
    name: 'BharatPulse Pro 5G (8GB / 256GB, Emerald)',
    category: 'Electronics',
    price: 14499,
    mrp: 18999,
    exchangeBonusUpTo: 6500,
    offerTag: 'Festival Super Deal · Extra ₹150 UPI Off',
    stockStatus: 'In Stock',
    image: IMG_PHONE,
    sellerName: 'Sri Venkateswara Digital (ONDC Verified)',
    city: 'Hyderabad · 500081',
    deliveryEta: '45 min local rider',
    rating: '4.8 (412)',
    specs: ['120Hz AMOLED Display', '5000mAh 67W Fast Charge', '50MP OIS Camera', 'Dual 5G + UPI NFC'],
    variants: ['8GB + 128GB', '8GB + 256GB', '12GB + 256GB'],
    condition: 'New',
    description:
      'High-efficiency 5G smartphone engineered for Indian networks with 2-day battery endurance, Sony OIS main camera, and instant phone-exchange doorstep pickup.',
  },
  {
    id: 'dm-prod-2',
    name: 'Malabar Handcrafted Teak & Cane Lounge Chair',
    category: 'Home & Kitchen',
    price: 8900,
    mrp: 12500,
    exchangeBonusUpTo: 2400,
    offerTag: 'Direct Artisan Price · Old Furniture Trade-In',
    stockStatus: 'In Stock',
    image: IMG_CHAIR,
    sellerName: 'Kovai Heritage Woodworks',
    city: 'Bengaluru · 560038',
    deliveryEta: 'Same-day mini-truck',
    rating: '4.9 (189)',
    specs: ['Seasoned Nilambur Teak', 'Natural Rattan Cane Weave', 'Ergonomic Lumbar Curve', '5-Year Frame Warranty'],
    variants: ['Natural Teak Matte', 'Warm Walnut Stain'],
    condition: 'New',
    description:
      'Sustainably harvested Indian teak lounge chair with breathable woven cane backrest. Eligible for old furniture trade-in pickup at delivery.',
  },
  {
    id: 'dm-prod-3',
    name: 'Dharma Organic Farm Pantry Trio (Cold-Pressed Oil, Raw Honey & Spices)',
    category: 'Grocery',
    price: 1180,
    mrp: 1550,
    exchangeBonusUpTo: 0,
    offerTag: 'Farmer Direct Combo · Free 25-Min Delivery',
    stockStatus: 'In Stock',
    image: IMG_GROCERY,
    sellerName: 'Godavari Rythu FPO Collective',
    city: 'Rajahmundry & Local Hubs',
    deliveryEta: '25 min kirana express',
    rating: '4.9 (640)',
    specs: ['Wood-Pressed Mustard & Groundnut Oil', 'NMR-Tested Wild Forest Honey', 'Single-Origin Guntur & Wayanad Spices', 'Zero Preservatives'],
    variants: ['Standard Combo (2.2 kg)', 'Family Pack (4.5 kg)'],
    condition: 'New',
    description:
      'Direct-from-farmer certified organic pantry bundle sourced from Andhra & Kerala farmer collectives with glass packaging.',
  },
  {
    id: 'dm-prod-4',
    name: 'Aether Studio ANC Wireless Headphones + Copper Flask Bundle',
    category: 'Electronics',
    price: 4299,
    mrp: 6499,
    exchangeBonusUpTo: 1500,
    offerTag: 'Combo Value Offer · Save ₹2,200',
    stockStatus: 'In Stock',
    image: HERO_IMAGE,
    sellerName: 'DharmaMart Direct Hub',
    city: 'Chennai · 600017',
    deliveryEta: '60 min local delivery',
    rating: '4.7 (275)',
    specs: ['42dB Hybrid Active Noise Cancellation', '55 Hours Playback', 'Pure 99.9% Ayurvedic Copper Carafe Included', 'Dual Device Pairing'],
    variants: ['Forest Matte', 'Sandstone'],
    condition: 'New',
    description:
      'Daily commuter & work-from-home essential kit pairing studio-grade ANC headphones with a handcrafted pure copper water vessel.',
  },
  {
    id: 'dm-prod-5',
    name: 'Kumkumadi & Vetiver Botanical Night Recovery Elixir (50ml)',
    category: 'Beauty',
    price: 790,
    mrp: 1100,
    exchangeBonusUpTo: 0,
    offerTag: 'Buy 2 Get Extra 10% Off',
    stockStatus: 'In Stock',
    image: IMG_BEAUTY,
    sellerName: 'VedaBotanics Clean Lab',
    city: 'Pune · 411007',
    deliveryEta: 'Next-morning delivery',
    rating: '4.8 (318)',
    specs: ['100% Ayurvedic Cold Infusion', 'Kashmiri Saffron & Vetiver Root', 'Dermatologically Tested', 'Recyclable Amber Glass'],
    variants: ['30ml Dropper', '50ml Dropper'],
    condition: 'New',
    description:
      'Small-batch botanical facial oil formulated with pure Kashmiri saffron threads, sandalwood, and cooling vetiver.',
  },
  {
    id: 'dm-prod-6',
    name: 'Handloom Organic Khadi Linen Everyday Overshirt & Kurta Set',
    category: 'Fashion',
    price: 1650,
    mrp: 2299,
    exchangeBonusUpTo: 400,
    offerTag: 'Handloom Weavers Special Offer',
    stockStatus: 'In Stock',
    image: IMG_FASHION,
    sellerName: 'Chirala Weavers Guild',
    city: 'Hyderabad · 500034',
    deliveryEta: '2 hr local dispatch',
    rating: '4.8 (204)',
    specs: ['Breathable 60-Count Khadi Linen', 'Natural Plant Indigo & Earth Dyes', 'Pre-Shrunk Tailored Fit', 'Artisan Signed Tag'],
    variants: ['S', 'M', 'L', 'XL'],
    condition: 'New',
    description:
      'Hand-spun breathable Khadi linen overshirt and cotton kurta crafted for Indian summers by master weavers in Andhra Pradesh.',
  },
  {
    id: 'dm-prod-7',
    name: 'ProGrade Kashmir Willow Cricket Bat + Cork Yoga & Strength Kit',
    category: 'Sports',
    price: 2890,
    mrp: 3999,
    exchangeBonusUpTo: 750,
    offerTag: 'Weekend Sports Saver · 28% Off',
    stockStatus: 'In Stock',
    image: IMG_SPORTS,
    sellerName: 'Deccan Athletics Co.',
    city: 'Bengaluru · 560001',
    deliveryEta: '60 min local delivery',
    rating: '4.8 (156)',
    specs: ['Seasoned Grade-A Kashmir Willow', 'Natural Anti-Slip Cork Yoga Mat', 'Pair of Neoprene Coated Dumbbells', 'Canvas Carry Bag'],
    variants: ['Full Size SH', 'Harrow Size'],
    condition: 'New',
    description:
      'Complete home fitness and turf cricket starter bundle with trade-in credit for old sports gear.',
  },
  {
    id: 'dm-prod-8',
    name: 'Paws & Prakriti Holistic Pet Care Box (Bowl, Neem Wash & Treats)',
    category: 'Pet Care',
    price: 1340,
    mrp: 1790,
    exchangeBonusUpTo: 0,
    offerTag: 'Complete 4-in-1 Pet Care Offer',
    stockStatus: 'Limited Stock',
    image: IMG_PET,
    sellerName: 'Prakriti Pet Wellness',
    city: 'Mumbai · 400050',
    deliveryEta: '40 min local delivery',
    rating: '4.9 (231)',
    specs: ['Heavy Glazed Ceramic Feeding Bowl', 'Organic Neem & Oatmeal Coat Wash', 'Braided Natural Jute Tug Toy', 'Grain-Free Pumpkin & Turmeric Biscuits'],
    variants: ['Puppy / Small Breed', 'Adult Medium / Large'],
    condition: 'New',
    description:
      'Vet-formulated natural pet care kit featuring chemical-free grooming and durable handcrafted feeding accessories.',
  },
  {
    id: 'dm-prod-9',
    name: 'BharatPulse Ultra Tab 5G (12GB / 512GB, 11.5" 2K AMOLED + Stylus)',
    category: 'Electronics',
    price: 21999,
    mrp: 31999,
    exchangeBonusUpTo: 8500,
    offerTag: 'High Demand · Next Batch Arriving Soon',
    stockStatus: 'Out of Stock',
    image: IMG_PHONE,
    sellerName: 'Sri Venkateswara Digital (ONDC Verified)',
    city: 'Hyderabad · 500081',
    deliveryEta: 'Currently Unavailable · Restocking in 24h',
    rating: '4.9 (518)',
    specs: ['11.5" 120Hz 2K AMOLED', 'Magnetic Stylus Included', '8800mAh Fast Charge Battery', '5G Cellular + Wi-Fi 6E'],
    variants: ['12GB + 256GB', '12GB + 512GB'],
    condition: 'New',
    description:
      'Flagship productivity and student tablet with bundled low-latency stylus. Currently Out of Stock at your local PIN hub due to festival demand — subscribe for instant restock notification.',
  },
];

export const RESALE_ITEMS: ProductItem[] = [
  {
    id: 'dm-used-1',
    name: 'iPhone 13 (128GB, Midnight) — 89% Battery Health, Original Box',
    category: 'Electronics',
    price: 26500,
    mrp: 52900,
    exchangeBonusUpTo: 9000,
    image: IMG_PHONE,
    sellerName: 'Karthik R. (Verified Resident)',
    city: 'Madhapur, Hyderabad',
    deliveryEta: 'Meetup or 90m Escrow Delivery',
    rating: '5.0 (14 sales)',
    specs: ['Zero Scratches on Screen', 'Bill + Original Cable Included', 'DharmaMart 32-Point Checked', '7-Day Escrow Protection'],
    variants: ['128GB Midnight'],
    condition: 'Like New',
    isUsedListing: true,
    sellerDistanceKm: 1.8,
    description:
      'Single-hand used iPhone 13 bought in India. Always used with tempered glass. Selling to upgrade via DharmaMart Exchange.',
  },
  {
    id: 'dm-used-2',
    name: 'Solid Teak Study & Work-From-Home Desk + Cane Chair Set',
    category: 'Home & Kitchen',
    price: 5400,
    mrp: 14000,
    exchangeBonusUpTo: 1500,
    image: IMG_CHAIR,
    sellerName: 'Ananya S. (Verified Resident)',
    city: 'Indiranagar, Bengaluru',
    deliveryEta: 'Seller Pickup Ready Today',
    rating: '4.9 (8 sales)',
    specs: ['4ft × 2ft Solid Teak Top', 'Includes Matching Cane Chair', 'Relocating Sale', 'Porter / Mini-Truck Assisted'],
    variants: ['Complete Set'],
    condition: 'Like New',
    isUsedListing: true,
    sellerDistanceKm: 2.4,
    description:
      'Bought 11 months ago for home office. Moving cities next week so priced for a quick neighbourhood pickup.',
  },
  {
    id: 'dm-used-3',
    name: 'Sony WH-1000XM4 Noise Cancelling Headphones + Hard Case',
    category: 'Electronics',
    price: 11200,
    mrp: 22990,
    exchangeBonusUpTo: 3500,
    image: HERO_IMAGE,
    sellerName: 'Rohit Verma (Verified Resident)',
    city: 'Kothrud, Pune',
    deliveryEta: '60m Local Courier with Escrow',
    rating: '4.8 (19 sales)',
    specs: ['Fresh Ear Cushions Installed', 'Original Carry Case & Aux Cable', 'Battery Lasts 28+ Hours', 'Test Before Accepting'],
    variants: ['Matte Black'],
    condition: 'Good',
    isUsedListing: true,
    sellerDistanceKm: 3.1,
    description:
      'Clean studio headphones in great working order. Buyer payment stays in DharmaMart UPI Escrow until you test the audio at delivery.',
  },
  {
    id: 'dm-used-4',
    name: 'Home Gym Adjustable Dumbbell Set (20kg) + Cork Mat & Cricket Kit',
    category: 'Sports',
    price: 1850,
    mrp: 4200,
    exchangeBonusUpTo: 500,
    image: IMG_SPORTS,
    sellerName: 'Vikramaditya P. (Verified Resident)',
    city: 'Gachibowli, Hyderabad',
    deliveryEta: 'Doorstep Pickup Today',
    rating: '4.9 (6 sales)',
    specs: ['Rust-Free Cast Iron Plates', 'Non-Slip Grip Locks', 'Barely Used 4 Months', 'Instant UPI Escrow'],
    variants: ['Complete Kit'],
    condition: 'Like New',
    isUsedListing: true,
    sellerDistanceKm: 1.5,
    description:
      'Switching to a society gym membership, so letting go of my home workout dumbbells and bat in top condition.',
  },
];

export const LOCAL_SERVICES: LocalServiceItem[] = [
  {
    id: 'srv-1',
    title: 'Split & Window AC Deep Foam Jet Service & Gas Check',
    category: 'AC Repair',
    basePrice: 499,
    visitFee: 0,
    etaMinutes: 45,
    warrantyDays: 30,
    technicianCount: 18,
    rating: '4.9 (1,420 bookings)',
    image: IMG_SERVICE,
    includes: [
      '2x Cooling Coil High-Pressure Foam Wash',
      'Coolant Pressure & Amp Draw Diagnostic',
      'Drain Pipe Unclogging & Rust Check',
      '30-Day Post-Service Leak & Cooling Warranty',
    ],
  },
  {
    id: 'srv-2',
    title: 'Doorstep Mobile Screen & Battery Replacement',
    category: 'Mobile Repair',
    basePrice: 699,
    visitFee: 99,
    etaMinutes: 35,
    warrantyDays: 90,
    technicianCount: 24,
    rating: '4.8 (980 bookings)',
    image: IMG_PHONE,
    includes: [
      'Repaired in Front of You at Home/Office (Zero Data Risk)',
      'OEM-Grade Display & BIS-Certified Battery Options',
      'Free Tempered Glass & Internal Dust Cleaning',
      '90-Day Replacement Warranty via DharmaMart',
    ],
  },
  {
    id: 'srv-3',
    title: 'Certified Electrician — Fan, MCB, Inverter & Wiring Fix',
    category: 'Electrician',
    basePrice: 199,
    visitFee: 49,
    etaMinutes: 30,
    warrantyDays: 30,
    technicianCount: 31,
    rating: '4.9 (2,150 bookings)',
    image: IMG_SERVICE,
    includes: [
      'Switchboard, MCB Trip & Voltage Fluctuation Fix',
      'Ceiling Fan / Exhaust / Geyser Installation',
      'Home UPS & Inverter Battery Health Check',
      'Upfront Rate Card — No Hidden Spare Markups',
    ],
  },
  {
    id: 'srv-4',
    title: 'Plumber — Tap Leak, Motor Pump, Bathroom & RO Fitting',
    category: 'Plumber',
    basePrice: 199,
    visitFee: 49,
    etaMinutes: 35,
    warrantyDays: 30,
    technicianCount: 22,
    rating: '4.8 (1,610 bookings)',
    image: IMG_SERVICE,
    includes: [
      'Concealed Flush, Mixer Tap & Pipeline Leak Repair',
      'Overhead Tank Float Valve & Motor Servicing',
      'Kitchen Sink & Bathroom Drain Hydro-Unblocking',
      '30-Day Workmanship Guarantee',
    ],
  },
  {
    id: 'srv-5',
    title: 'Laptop SSD/RAM Upgrade, Thermal Paste & OS Tune-Up',
    category: 'Computer Repair',
    basePrice: 399,
    visitFee: 0,
    etaMinutes: 50,
    warrantyDays: 60,
    technicianCount: 15,
    rating: '4.9 (740 bookings)',
    image: HERO_IMAGE,
    includes: [
      'Dual-Fan Heatsink Cleaning & Arctic Thermal Paste',
      'NVMe SSD & DDR4/DDR5 RAM Installation at Home',
      'Hinge Repair, Keyboard Replacement & BIOS Recovery',
      '60-Day Service Guarantee',
    ],
  },
  {
    id: 'srv-6',
    title: 'Eco-Safe Full Home, Kitchen & Sofa Steam Sanitization',
    category: 'Home Cleaning',
    basePrice: 1299,
    visitFee: 0,
    etaMinutes: 90,
    warrantyDays: 7,
    technicianCount: 12,
    rating: '4.9 (890 bookings)',
    image: IMG_CHAIR,
    includes: [
      'Plant-Based Non-Toxic Descaling & Degreasing',
      '5-Seater Sofa Dry Shampoo & UV Extraction',
      'Bathroom Hard-Water Stain Removal',
      '2-Person Verified Crew with Industrial Gear',
    ],
  },
];

export const LOCAL_EXCHANGE_MATCHES: ExchangeMatchOffer[] = [
  {
    id: 'ex-1',
    ownerName: 'Srinivas Rao',
    neighborhood: 'Kukatpally · 500072',
    distanceKm: 1.4,
    offeringItem: 'Redmi Note 12 Pro 5G (8/128GB, Box + Charger)',
    lookingFor: 'Upgrade to BharatPulse Pro 5G or iPhone 13',
    topUpInr: 4800,
    verifiedPhone: true,
  },
  {
    id: 'ex-2',
    ownerName: 'Megha Kulkarni',
    neighborhood: 'Baner · 411045',
    distanceKm: 2.1,
    offeringItem: 'MacBook Air M1 (8/256GB, 91% Battery)',
    lookingFor: 'Direct Swap for iPad Pro + Pencil or Cash + Phone',
    topUpInr: 0,
    verifiedPhone: true,
  },
  {
    id: 'ex-3',
    ownerName: 'Arjun Nair',
    neighborhood: 'HSR Layout · 560102',
    distanceKm: 2.9,
    offeringItem: '4-Seater Compact Dining Table (Sheesham Wood)',
    lookingFor: 'Exchange for Teak Lounge Chair + Work Desk',
    topUpInr: 1200,
    verifiedPhone: true,
  },
];

export const TRADE_IN_DEVICES = [
  { label: 'Smartphone — 4G/5G Android (1–2 yrs old)', baseValue: 5800 },
  { label: 'Smartphone — Android (3+ yrs old)', baseValue: 2900 },
  { label: 'Apple iPhone 11 / 12 / 13 Series', baseValue: 16500 },
  { label: 'Laptop — Core i5 / Ryzen 5 or higher', baseValue: 11200 },
  { label: 'Wooden Furniture — Chair / Study Desk / Cot', baseValue: 2400 },
  { label: 'Home Appliance — Split AC / Washing Machine', baseValue: 4500 },
];
