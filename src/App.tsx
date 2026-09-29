import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  ShoppingBag,
  ArrowRight,
  Check,
  X,
  Plus,
  Minus,
  RefreshCw,
  Wrench,
  Smartphone,
  Globe,
  Heart,
  SlidersHorizontal,
  QrCode,
  CreditCard,
  Banknote,
  Edit3,
  Star,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import {
  INDIAN_LANGUAGES,
  UI_TRANSLATIONS,
  NEW_PRODUCTS,
  RESALE_ITEMS,
  LOCAL_SERVICES,
  LOCAL_EXCHANGE_MATCHES,
  TRADE_IN_DEVICES,
  HERO_IMAGE,
  IMG_PHONE,
  type IndianLanguage,
  type ProductCategory,
  type ProductItem,
  type LocalServiceItem,
} from './data/marketplaceData';
import { DharmaAppIcon, DharmaFullBrandCrest } from './components/DharmaLogo';
import { PlayStoreStudioModal } from './components/PlayStoreStudioModal';
import {
  UpiQrScannerModal,
  PaymentHistoryAnalyticsSection,
  INITIAL_TRANSACTIONS,
  type PaymentTransactionRecord,
} from './components/UpiQrScannerModal';
import {
  OwnerProductEditorModal,
  OwnerStoreManagementSection,
  type StoreOfferSettings,
} from './components/OwnerCatalogManagerModal';
import {
  CustomerReviewsAndConditions,
  INITIAL_PRODUCT_REVIEWS,
  type ProductReviewItem,
} from './components/CustomerReviewsAndConditions';
import { usePWAInstall, useOnlineStatus } from './hooks/usePWAInstall';

type ActiveSection = 'shop' | 'resale' | 'exchange' | 'services' | 'concierge';

interface CartEntry {
  item: ProductItem;
  quantity: number;
  selectedVariant: string;
  withExchangeCredit: number;
}

interface OrderRecord {
  orderId: string;
  placedAt: string;
  totalInr: number;
  originalMrpTotal: number;
  totalSavedInr: number;
  paymentMethod: 'UPI' | 'Card' | 'COD';
  paymentDetail: string;
  customerName: string;
  address: string;
  pinCode: string;
  status: 'Confirmed — Local Rider Assigned' | 'Return Pickup Scheduled';
  itemsSummary: string[];
}

interface ServiceBookingRecord {
  bookingId: string;
  serviceTitle: string;
  slot: string;
  address: string;
  amountInr: number;
  status: string;
}

const ResilientImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
}> = ({ src, alt, className = '' }) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#F3F2EE] text-stone-600 p-6 text-center ${className}`}
      >
        <DharmaAppIcon size={56} />
        <span className="mt-2 text-xs font-medium text-stone-700 line-clamp-2">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};

export function App() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('shop');
  const [language, setLanguage] = useState<IndianLanguage>('English');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number | null>(null);
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'out-of-stock'>('all');

  // Store Owner Catalog State (Persisted in localStorage so added products & price/discount edits remain saved)
  const [productsList, setProductsList] = useState<ProductItem[]>(() => {
    try {
      const saved = localStorage.getItem('dharmamart_owner_catalog_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return NEW_PRODUCTS;
  });

  // User & Owner Resale Listings (maintaining both Offer Price and Original MRP)
  const [resaleList, setResaleList] = useState<ProductItem[]>(() => {
    try {
      const saved = localStorage.getItem('dharmamart_owner_resale_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return RESALE_ITEMS;
  });

  // Storewide Owner Offer & Discount Settings
  const [offerSettings, setOfferSettings] = useState<StoreOfferSettings>(() => {
    try {
      const saved = localStorage.getItem('dharmamart_owner_offers_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      bannerHeadline:
        'Festival Direct Offer — Up to 35% Off MRP + ₹150 Instant UPI Off + 7-Day Easy Replacement',
      upiInstantDiscountInr: 150,
      freeDeliveryMinInr: 499,
      promoCode: 'DHARMA10',
      promoDiscountPct: 10,
    };
  });

  // Owner Product Editor Modal State (Add Product / Edit Price, Discount & Offers)
  const [ownerEditorOpen, setOwnerEditorOpen] = useState(false);
  const [ownerEditorMode, setOwnerEditorMode] = useState<'add' | 'edit'>('add');
  const [ownerEditorProduct, setOwnerEditorProduct] = useState<ProductItem | null>(null);
  const [ownerEditorIsResale, setOwnerEditorIsResale] = useState(false);

  // Out of Stock — Customer "Notify Me" Subscriptions
  const [restockNotifiedIds, setRestockNotifiedIds] = useState<string[]>([]);

  // Amazon / Flipkart Style Customer Reviews State (Persisted in localStorage)
  const [productReviews, setProductReviews] = useState<
    Record<string, ProductReviewItem[]>
  >(() => {
    try {
      const saved = localStorage.getItem('dharmamart_product_reviews_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_PRODUCT_REVIEWS;
  });

  // Play Store App Install / Uninstall State
  const [appInstalledState, setAppInstalledState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('dharmamart_app_installed_v1') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('dharmamart_owner_catalog_v2', JSON.stringify(productsList));
    } catch {
      // ignore
    }
  }, [productsList]);

  useEffect(() => {
    try {
      localStorage.setItem('dharmamart_owner_resale_v2', JSON.stringify(resaleList));
    } catch {
      // ignore
    }
  }, [resaleList]);

  useEffect(() => {
    try {
      localStorage.setItem('dharmamart_owner_offers_v1', JSON.stringify(offerSettings));
    } catch {
      // ignore
    }
  }, [offerSettings]);

  useEffect(() => {
    try {
      localStorage.setItem('dharmamart_product_reviews_v1', JSON.stringify(productReviews));
    } catch {
      // ignore
    }
  }, [productReviews]);

  const handleToggleInstallState = (installed: boolean) => {
    setAppInstalledState(installed);
    try {
      localStorage.setItem('dharmamart_app_installed_v1', installed ? 'true' : 'false');
    } catch {
      // ignore
    }
  };

  const [showSellModal, setShowSellModal] = useState(false);
  const [newSellTitle, setNewSellTitle] = useState('');
  const [newSellCategory, setNewSellCategory] = useState<ProductCategory>('Electronics');
  const [newSellOfferPrice, setNewSellOfferPrice] = useState('8500');
  const [newSellOriginalPrice, setNewSellOriginalPrice] = useState('14999');
  const [newSellCity, setNewSellCity] = useState('Hyderabad · 500081');
  const [newSellCondition, setNewSellCondition] = useState<'Like New' | 'Good'>('Like New');
  const [newSellDesc, setNewSellDesc] = useState('');

  // Product Detail Modal (Contiguous Purchase Module + Customer Reviews & Conditions)
  const [activeProduct, setActiveProduct] = useState<ProductItem | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [applyExchangeInPdp, setApplyExchangeInPdp] = useState(false);

  // Compare Products (up to 2)
  const [compareList, setCompareList] = useState<ProductItem[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Wishlist
  const [wishlistIds, setWishlistIds] = useState<string[]>(['dm-prod-1']);

  // Camera QR Scanner + Partner Store UPI / Card / COD Terminal + History Chart
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [qrScannerInitialMode, setQrScannerInitialMode] = useState<'upi' | 'card' | 'cod'>('upi');
  const [transactions, setTransactions] =
    useState<PaymentTransactionRecord[]>(INITIAL_TRANSACTIONS);

  // Cart & Checkout Drawer (UPI, Card Transactions, Cash on Delivery)
  const [cart, setCart] = useState<CartEntry[]>([
    {
      item: NEW_PRODUCTS[0],
      quantity: 1,
      selectedVariant: NEW_PRODUCTS[0].variants[1],
      withExchangeCredit: 0,
    },
  ]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'COD'>('UPI');
  const [upiId, setUpiId] = useState('ramesh.kumar@okaxis');
  const [appliedPromoInput, setAppliedPromoInput] = useState('');
  const [isPromoApplied, setIsPromoApplied] = useState(false);

  // Card Checkout fields inside Bag Drawer
  const [checkoutCardNetwork, setCheckoutCardNetwork] = useState<
    'RuPay Platinum' | 'Visa Signature' | 'Mastercard World'
  >('RuPay Platinum');
  const [checkoutCardNumber, setCheckoutCardNumber] = useState('6078 4500 9218 4821');
  const [checkoutCardExpiry, setCheckoutCardExpiry] = useState('08/29');
  const [checkoutCardCvv, setCheckoutCardCvv] = useState('842');

  // COD Checkout fields inside Bag Drawer
  const [codChangeOption, setCodChangeOption] = useState<
    'Exact Cash Ready' | 'Bring Change for ₹500' | 'Pay via UPI QR/Cash to Rider'
  >('Exact Cash Ready');

  const [customerName, setCustomerName] = useState('Ramesh Kumar');
  const [customerPhone, setCustomerPhone] = useState('+91 98480 12345');
  const [customerAddress, setCustomerAddress] = useState(
    'Flat 302, Green Valley Residency, Madhapur'
  );
  const [customerPin, setCustomerPin] = useState('500081');
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  // Exchange Calculator state
  const [selectedOldDeviceIndex, setSelectedOldDeviceIndex] = useState(0);
  const [oldDeviceCondition, setOldDeviceCondition] = useState<
    'Flawless' | 'Good' | 'Screen Wear'
  >('Flawless');
  const [targetUpgradeId, setTargetUpgradeId] = useState(NEW_PRODUCTS[0].id);
  const [swapRequestedIds, setSwapRequestedIds] = useState<string[]>([]);

  // Local Services booking state
  const [activeService, setActiveService] = useState<LocalServiceItem | null>(null);
  const [serviceSlot, setServiceSlot] = useState('Today · Within 45 mins');
  const [serviceBookings, setServiceBookings] = useState<ServiceBookingRecord[]>([]);

  // Play Store Studio & Brand Modal
  const [isPlayStoreOpen, setIsPlayStoreOpen] = useState(false);
  const [showFullCrestPreview, setShowFullCrestPreview] = useState(false);

  const { isInstallable, isInstalled, install } = usePWAInstall();
  const isOnline = useOnlineStatus();

  const t = UI_TRANSLATIONS[language];

  const categories: ('All' | ProductCategory)[] = [
    'All',
    'Electronics',
    'Home & Kitchen',
    'Grocery',
    'Fashion',
    'Beauty',
    'Sports',
    'Pet Care',
  ];

  const filteredProducts = useMemo(() => {
    return productsList.filter((p) => {
      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesQuery =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.offerTag && p.offerTag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesBudget = maxPriceFilter === null || p.price <= maxPriceFilter;
      const isOut = p.stockStatus === 'Out of Stock';
      const matchesStock =
        stockFilter === 'all' ||
        (stockFilter === 'in-stock' && !isOut) ||
        (stockFilter === 'out-of-stock' && isOut);
      return matchesCat && matchesQuery && matchesBudget && matchesStock;
    });
  }, [productsList, selectedCategory, searchQuery, maxPriceFilter, stockFilter]);

  // Owner Product Add / Edit / Stock / Bulk Discount Handlers
  const openOwnerAddModal = (isResale = false) => {
    setOwnerEditorMode('add');
    setOwnerEditorProduct(null);
    setOwnerEditorIsResale(isResale);
    setOwnerEditorOpen(true);
  };

  const openOwnerEditModal = (product: ProductItem) => {
    setOwnerEditorMode('edit');
    setOwnerEditorProduct(product);
    setOwnerEditorIsResale(Boolean(product.isUsedListing));
    setOwnerEditorOpen(true);
  };

  const handleSaveOwnerProduct = (
    savedProduct: ProductItem,
    isNew: boolean,
    isResale: boolean
  ) => {
    if (isResale) {
      setResaleList((prev) =>
        isNew
          ? [savedProduct, ...prev]
          : prev.map((item) => (item.id === savedProduct.id ? savedProduct : item))
      );
    } else {
      setProductsList((prev) =>
        isNew
          ? [savedProduct, ...prev]
          : prev.map((item) => (item.id === savedProduct.id ? savedProduct : item))
      );
    }
    // Also sync activeProduct or cart if open
    if (activeProduct && activeProduct.id === savedProduct.id) {
      setActiveProduct(savedProduct);
    }
    setCart((prev) =>
      prev.map((c) => (c.item.id === savedProduct.id ? { ...c, item: savedProduct } : c))
    );
  };

  const handleDeleteOwnerProduct = (productId: string, isResale: boolean) => {
    if (isResale) {
      setResaleList((prev) => prev.filter((item) => item.id !== productId));
    } else {
      setProductsList((prev) => prev.filter((item) => item.id !== productId));
    }
    if (activeProduct?.id === productId) {
      setActiveProduct(null);
    }
  };

  const handleChangeStockStatus = (
    productId: string,
    status: 'In Stock' | 'Limited Stock' | 'Out of Stock',
    isResale: boolean
  ) => {
    const updater = (list: ProductItem[]) =>
      list.map((item) =>
        item.id === productId
          ? {
              ...item,
              stockStatus: status,
              deliveryEta:
                status === 'Out of Stock'
                  ? 'Currently Unavailable · Restocking in 24h'
                  : item.deliveryEta.includes('Unavailable')
                  ? '45 min local delivery'
                  : item.deliveryEta,
            }
          : item
      );
    if (isResale) {
      setResaleList(updater);
    } else {
      setProductsList(updater);
    }
    if (activeProduct?.id === productId) {
      setActiveProduct((prev) => (prev ? { ...prev, stockStatus: status } : null));
    }
  };

  const handleApplyBulkDiscount = (discountPct: number, category: string) => {
    setProductsList((prev) =>
      prev.map((item) => {
        if (category !== 'All' && item.category !== category) return item;
        const newOffer = Math.max(1, Math.round(item.mrp * (1 - discountPct / 100)));
        return {
          ...item,
          price: newOffer,
          offerTag: `Storewide ${discountPct}% Off Sale · Save ₹${(
            item.mrp - newOffer
          ).toLocaleString('en-IN')}`,
        };
      })
    );
  };

  const handleResetCatalog = () => {
    setProductsList(NEW_PRODUCTS);
    setResaleList(RESALE_ITEMS);
  };

  // Customer Reviews Handlers
  const handleAddProductReview = (productId: string, review: ProductReviewItem) => {
    setProductReviews((prev) => {
      const existing = prev[productId] || [];
      return {
        ...prev,
        [productId]: [review, ...existing],
      };
    });
  };

  const handleMarkReviewHelpful = (productId: string, reviewId: string) => {
    setProductReviews((prev) => {
      const existing = prev[productId] || [];
      return {
        ...prev,
        [productId]: existing.map((r) =>
          r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r
        ),
      };
    });
  };

  const toggleRestockNotify = (productId: string) => {
    setRestockNotifiedIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const openScannerModal = (mode: 'upi' | 'card' | 'cod' = 'upi') => {
    setQrScannerInitialMode(mode);
    setIsQrScannerOpen(true);
  };

  const handlePartnerPaymentRecorded = (tx: PaymentTransactionRecord) => {
    setTransactions((prev) => [tx, ...prev]);
  };

  const openProductModal = (product: ProductItem) => {
    setActiveProduct(product);
    setSelectedVariant(product.variants[0] || 'Standard');
    setApplyExchangeInPdp(false);
  };

  const addToCart = (
    product: ProductItem,
    variant = product.variants[0] || 'Standard',
    exchangeCredit = 0
  ) => {
    if (product.stockStatus === 'Out of Stock') {
      toggleRestockNotify(product.id);
      return;
    }
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (c) => c.item.id === product.id && c.selectedVariant === variant
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
          withExchangeCredit: exchangeCredit || updated[existingIndex].withExchangeCredit,
        };
        return updated;
      }
      return [
        ...prev,
        {
          item: product,
          quantity: 1,
          selectedVariant: variant,
          withExchangeCredit: exchangeCredit,
        },
      ];
    });
    setActiveProduct(null);
    setIsCartOpen(true);
  };

  const updateCartQuantity = (index: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((entry, idx) =>
          idx === index ? { ...entry, quantity: entry.quantity + delta } : entry
        )
        .filter((entry) => entry.quantity > 0)
    );
  };

  const cartOriginalMrpTotal = useMemo(() => {
    return cart.reduce((sum, entry) => sum + entry.item.mrp * entry.quantity, 0);
  }, [cart]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce(
      (sum, entry) =>
        sum +
        Math.max(0, entry.item.price - entry.withExchangeCredit) * entry.quantity,
      0
    );
  }, [cart]);

  const promoDiscountInr = useMemo(() => {
    if (!isPromoApplied || cartSubtotal <= 0) return 0;
    return Math.round((cartSubtotal * offerSettings.promoDiscountPct) / 100);
  }, [isPromoApplied, cartSubtotal, offerSettings.promoDiscountPct]);

  const upiInstantDiscount =
    paymentMethod === 'UPI' && cartSubtotal > 0
      ? offerSettings.upiInstantDiscountInr
      : 0;
  const deliveryCharge =
    cartSubtotal === 0 || cartSubtotal >= offerSettings.freeDeliveryMinInr ? 0 : 40;
  const finalPayable = Math.max(
    0,
    cartSubtotal - promoDiscountInr - upiInstantDiscount + deliveryCharge
  );
  const totalSavingsOnBag = Math.max(
    0,
    cartOriginalMrpTotal - cartSubtotal + promoDiscountInr + upiInstantDiscount
  );

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    const orderId = `DM-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowStr = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    const last4 = checkoutCardNumber.replace(/\s+/g, '').slice(-4) || '4821';

    const paymentDetail =
      paymentMethod === 'UPI'
        ? `UPI (${upiId})`
        : paymentMethod === 'Card'
        ? `${checkoutCardNetwork} •••• ${last4}`
        : `Cash on Delivery (${codChangeOption})`;

    const newOrder: OrderRecord = {
      orderId,
      placedAt: nowStr,
      totalInr: finalPayable,
      originalMrpTotal: cartOriginalMrpTotal,
      totalSavedInr: totalSavingsOnBag,
      paymentMethod,
      paymentDetail,
      customerName,
      address: customerAddress,
      pinCode: customerPin,
      status: 'Confirmed — Local Rider Assigned',
      itemsSummary: cart.map((c) => `${c.item.name} × ${c.quantity}`),
    };

    const ledgerRecord: PaymentTransactionRecord = {
      id: `tx-${Date.now()}`,
      referenceNumber:
        paymentMethod === 'UPI'
          ? `UTR-4273${Math.floor(10000000 + Math.random() * 90000000)}`
          : paymentMethod === 'Card'
          ? `AUTH-${Math.floor(100000 + Math.random() * 900000)}`
          : `COD-${orderId}`,
      merchantName: cart[0].item.sellerName,
      merchantIdentifier: paymentDetail,
      amountInr: finalPayable,
      cashbackEarned: paymentMethod === 'UPI' ? 50 : paymentMethod === 'Card' ? 40 : 15,
      channel: paymentMethod === 'UPI' ? 'UPI QR' : paymentMethod,
      instrumentLabel: paymentDetail,
      note: `Order #${orderId} (${cart.length} item${cart.length > 1 ? 's' : ''})`,
      timestamp: `Today · ${nowStr}`,
      dateLabel: 'Today',
      partnerLocation: `${customerAddress} · ${customerPin}`,
    };

    setTransactions((prev) => [ledgerRecord, ...prev]);
    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
  };

  const toggleReturnRequest = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.orderId === orderId
          ? {
              ...o,
              status:
                o.status === 'Return Pickup Scheduled'
                  ? 'Confirmed — Local Rider Assigned'
                  : 'Return Pickup Scheduled',
            }
          : o
      )
    );
  };

  const toggleCompareProduct = (product: ProductItem) => {
    setCompareList((prev) => {
      if (prev.some((p) => p.id === product.id)) {
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= 2) {
        return [prev[1], product];
      }
      return [...prev, product];
    });
  };

  const toggleWishlist = (productId: string) => {
    setWishlistIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handlePublishUsedItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSellTitle.trim()) return;
    const offerNum = Math.max(100, Number(newSellOfferPrice) || 4500);
    const origNum = Math.max(
      offerNum + 500,
      Number(newSellOriginalPrice) || Math.round(offerNum * 1.6)
    );
    const created: ProductItem = {
      id: `dm-used-${Date.now()}`,
      name: newSellTitle.trim(),
      category: newSellCategory,
      price: offerNum,
      mrp: origNum,
      exchangeBonusUpTo: Math.round(offerNum * 0.3),
      offerTag: 'Verified Resident Resale Offer',
      stockStatus: 'In Stock',
      image: IMG_PHONE,
      sellerName: `${customerName} (Verified Seller)`,
      city: newSellCity,
      deliveryEta: 'Seller Pickup or 60m Escrow Rider',
      rating: '5.0 (New Listing)',
      specs: [
        `${newSellCondition} Condition`,
        'DharmaMart UPI Escrow Protected',
        'Local Neighbourhood Inspection',
      ],
      variants: ['Single Unit'],
      condition: newSellCondition,
      isUsedListing: true,
      sellerDistanceKm: 0.8,
      description:
        newSellDesc.trim() ||
        `Verified neighbourhood resale listing in ${newSellCity}. Protected by DharmaMart UPI Escrow.`,
    };
    setResaleList((prev) => [created, ...prev]);
    setNewSellTitle('');
    setNewSellDesc('');
    setShowSellModal(false);
  };

  // Exchange Math
  const conditionMultiplier =
    oldDeviceCondition === 'Flawless'
      ? 1
      : oldDeviceCondition === 'Good'
      ? 0.8
      : 0.55;
  const estimatedTradeInValue = Math.round(
    TRADE_IN_DEVICES[selectedOldDeviceIndex].baseValue * conditionMultiplier
  );
  const targetUpgradeProduct =
    productsList.find((p) => p.id === targetUpgradeId) || productsList[0] || NEW_PRODUCTS[0];
  const netPayableAfterExchange = Math.max(
    999,
    targetUpgradeProduct.price - estimatedTradeInValue
  );

  const handleBookService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeService) return;
    const newBooking: ServiceBookingRecord = {
      bookingId: `SRV-${Math.floor(100 + Math.random() * 900)}`,
      serviceTitle: activeService.title,
      slot: serviceSlot,
      address: `${customerAddress} (${customerPin})`,
      amountInr: activeService.basePrice + activeService.visitFee,
      status: `Technician Assigned · Arriving in ${activeService.etaMinutes} mins`,
    };
    setServiceBookings((prev) => [newBooking, ...prev]);
    setActiveService(null);
  };

  const totalCartItems = cart.reduce((acc, c) => acc + c.quantity, 0);

  return (
    <div id="top" className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#141A16]">
      {/* Offline Connectivity Banner */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs font-medium px-4 py-1.5 text-center">
          Offline Mode Active — Browsing cached DharmaMart catalog & orders.
        </div>
      )}

      {/* STRICT 3-ZONE TOP BAR CONTRACT */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-[#FAF9F6]/95 backdrop-blur-sm border-b border-stone-200/80">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveSection('shop');
          }}
          className="text-xl font-bold tracking-tight text-[#146C32] whitespace-nowrap shrink-0"
        >
          DharmaMart
        </a>

        {/* Zone 2: 5 clean text navigation links */}
        <nav
          aria-label="Primary Marketplace Navigation"
          className="hidden md:flex items-center gap-7 text-sm font-semibold text-stone-600"
        >
          <button
            type="button"
            onClick={() => setActiveSection('shop')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeSection === 'shop'
                ? 'border-[#146C32] text-[#141A16]'
                : 'border-transparent hover:text-[#141A16]'
            }`}
          >
            {t.shopTab}
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('resale')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeSection === 'resale'
                ? 'border-[#146C32] text-[#141A16]'
                : 'border-transparent hover:text-[#141A16]'
            }`}
          >
            {t.resaleTab}
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('exchange')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeSection === 'exchange'
                ? 'border-[#146C32] text-[#141A16]'
                : 'border-transparent hover:text-[#141A16]'
            }`}
          >
            {t.exchangeTab}
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('services')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeSection === 'services'
                ? 'border-[#146C32] text-[#141A16]'
                : 'border-transparent hover:text-[#141A16]'
            }`}
          >
            {t.servicesTab}
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('concierge')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeSection === 'concierge'
                ? 'border-[#E86A17] text-[#E86A17]'
                : 'border-transparent hover:text-[#141A16]'
            }`}
          >
            {t.aiTab}
          </button>
        </nav>

        {/* Zone 3: 2 primary actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => openScannerModal('upi')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-900 bg-[#F3F2EE] hover:bg-stone-200/80 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <QrCode className="w-4 h-4 text-[#146C32]" />
            <span>Scan & Pay QR</span>
          </button>
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#146C32] hover:bg-[#0F5426] rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Bag ({totalCartItems})</span>
          </button>
        </div>
      </header>

      {/* Mobile Navigation Bar (Segmented Control) */}
      <div className="md:hidden flex items-center gap-1 px-4 py-2 bg-[#F3F2EE] border-b border-stone-200 overflow-x-auto">
        {(
          [
            { id: 'shop', label: t.shopTab },
            { id: 'resale', label: t.resaleTab },
            { id: 'exchange', label: t.exchangeTab },
            { id: 'services', label: t.servicesTab },
            { id: 'concierge', label: t.aiTab },
          ] as { id: ActiveSection; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSection(tab.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeSection === tab.id
                ? 'bg-white text-[#146C32] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Container (1440px baseline, generous spatial math) */}
      <main className="flex-1 max-w-[1320px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* LIVE OWNER PROMOTIONAL BANNER & STORE CONTROLS */}
        <div className="rounded-xl bg-stone-900 text-white px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-2 py-0.5 rounded bg-[#E86A17] text-white font-semibold uppercase tracking-wider text-[10px]">
              Live Store Offer
            </span>
            <span className="font-medium text-stone-100">
              {offerSettings.bannerHeadline}
            </span>
            <span className="text-stone-400">·</span>
            <span className="font-mono-tabular text-[#FF8C3B] font-semibold">
              Use Code: {offerSettings.promoCode} ({offerSettings.promoDiscountPct}% Extra Off)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => openOwnerAddModal(false)}
              className="inline-flex items-center gap-1 font-semibold text-white hover:text-[#FF8C3B] whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 text-[#FF8C3B]" />
              <span>Add Product</span>
            </button>
            <span className="text-stone-600">|</span>
            <button
              type="button"
              onClick={() => setActiveSection('concierge')}
              className="inline-flex items-center gap-1 font-semibold text-[#FF8C3B] hover:underline whitespace-nowrap"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Owner Price & Discount Desk →</span>
            </button>
          </div>
        </div>

        {/* SECTION 1: STOREFRONT HERO & MULTILINGUAL / SEARCH BAR */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white rounded-2xl border border-stone-200/80 p-6 sm:p-8 lg:p-10">
          <div className="lg:col-span-7 space-y-6">
            {/* Brand Lockup & Regional Trust Marker */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setShowFullCrestPreview((v) => !v)}
                className="shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#146C32]"
                title="Click to toggle simplified App Icon vs Full Marketing Crest"
              >
                <DharmaAppIcon size={64} />
              </button>
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                  <span className="font-semibold text-[#146C32]">{t.tagline}</span>
                  <span aria-hidden="true">·</span>
                  <span>UPI QR · Cards · Cash on Delivery</span>
                  <span aria-hidden="true">·</span>
                  <button
                    type="button"
                    onClick={() => setIsPlayStoreOpen(true)}
                    className="text-[#E86A17] font-semibold hover:underline"
                  >
                    Play Store Upload, Install & Uninstall
                  </button>
                </div>
                <h1 className="mt-1 text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-stone-900 leading-tight">
                  {t.heroHeadline}
                </h1>
              </div>
            </div>

            <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
              {t.heroSub}
            </p>

            {/* Unified Search + Quick Add Product / Owner Price Control Bar */}
            <div className="flex flex-col sm:flex-row gap-2.5 max-w-2xl">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (
                      e.target.value.toLowerCase().includes('15,000') ||
                      e.target.value.toLowerCase().includes('15000')
                    ) {
                      setMaxPriceFilter(15000);
                    } else if (!e.target.value.trim()) {
                      setMaxPriceFilter(null);
                    }
                  }}
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FAF9F6] border border-stone-300 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#146C32] focus:bg-white focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => openOwnerAddModal(false)}
                className="px-4 py-3 rounded-xl bg-[#146C32] hover:bg-[#0F5426] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 inline-flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('concierge')}
                className="px-4 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 inline-flex items-center justify-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#FF8C3B]" />
                <span>Edit Prices & Offers</span>
              </button>
            </div>

            {/* 8 Indian Languages Interactive Selector */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <Globe className="w-3.5 h-3.5 text-[#146C32]" />
                <span>Select Storefront Language:</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F3F2EE] rounded-xl w-fit">
                {INDIAN_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLanguage(lang.code)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                      language === lang.code
                        ? 'bg-white text-[#146C32] shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {lang.nativeName}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Payment & Play Store Install / Uninstall Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-stone-600">
              <button
                type="button"
                onClick={() => openScannerModal('upi')}
                className="inline-flex items-center gap-1.5 font-semibold text-[#146C32] hover:underline whitespace-nowrap"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Scan Partner Shop QR →</span>
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => openScannerModal('card')}
                className="inline-flex items-center gap-1.5 font-semibold text-stone-800 hover:underline whitespace-nowrap"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>RuPay / Card Pay →</span>
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => openScannerModal('cod')}
                className="inline-flex items-center gap-1.5 font-semibold text-[#E86A17] hover:underline whitespace-nowrap"
              >
                <Banknote className="w-3.5 h-3.5" />
                <span>Cash on Delivery →</span>
              </button>
              <span aria-hidden="true">·</span>
              {isInstalled || appInstalledState ? (
                <button
                  type="button"
                  onClick={() => setIsPlayStoreOpen(true)}
                  className="inline-flex items-center gap-1 font-semibold text-red-700 hover:underline whitespace-nowrap"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>App Installed · Manage / Uninstall</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsPlayStoreOpen(true)}
                  className="inline-flex items-center gap-1 font-semibold text-[#146C32] hover:underline whitespace-nowrap"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Play Store Install / Uninstall</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Studio Campaign Showcase or Interactive Full Brand Crest */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            {showFullCrestPreview ? (
              <div className="flex flex-col items-center space-y-3">
                <DharmaFullBrandCrest />
                <button
                  type="button"
                  onClick={() => setIsPlayStoreOpen(true)}
                  className="text-xs font-semibold text-[#146C32] hover:underline"
                >
                  Open Play Store Upload, Install & Uninstall Studio →
                </button>
              </div>
            ) : (
              <div className="relative w-full overflow-hidden rounded-xl bg-[#F3F2EE] aspect-16/10">
                <ResilientImage
                  src={HERO_IMAGE}
                  alt="DharmaMart Curated Local Marketplace Collection"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent flex flex-col justify-end p-5 text-white">
                  <div className="text-xs text-stone-200 flex items-center justify-between">
                    <span>7-Day Replacement · Open-Box Delivery · GST Invoice</span>
                    <button
                      type="button"
                      onClick={() => setShowFullCrestPreview(true)}
                      className="underline text-[#FF8C3B] font-semibold"
                    >
                      View Brand Crest
                    </button>
                  </div>
                  <p className="text-base font-semibold mt-0.5">
                    New Retail + Verified Neighbourhood Resale + Home Services
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* COMPARE BAR (Appears when user selects 1-2 products to compare) */}
        {compareList.length > 0 && (
          <section className="bg-stone-900 text-white rounded-xl px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="font-semibold text-[#FF8C3B]">
                Product Comparison ({compareList.length}/2):
              </span>
              {compareList.map((item, idx) => (
                <React.Fragment key={item.id}>
                  {idx > 0 && <span className="text-stone-400">vs</span>}
                  <span className="font-medium text-white">
                    {item.name} (Offer ₹{item.price.toLocaleString('en-IN')} / MRP ₹
                    {item.mrp.toLocaleString('en-IN')})
                  </span>
                </React.Fragment>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowCompareModal(true)}
                className="px-4 py-2 rounded-lg bg-[#146C32] hover:bg-[#0F5426] text-xs font-semibold text-white whitespace-nowrap"
              >
                Compare Offer & Specs
              </button>
              <button
                type="button"
                onClick={() => setCompareList([])}
                className="text-xs text-stone-300 hover:text-white"
              >
                Clear
              </button>
            </div>
          </section>
        )}

        {/* SECTION 2: DYNAMIC ACTIVE PILLAR VIEW */}
        {activeSection === 'shop' && (
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-4">
              <div>
                <h2 className="text-2xl font-semibold text-stone-900">
                  01. Buy Products — Direct From Local & ONDC Merchants
                </h2>
                <p className="text-sm text-stone-600 mt-1">
                  Amazon / Flipkart / Meesho / Myntra buyer protection conditions, verified customer reviews, and owner-controlled Offer Prices.
                </p>
              </div>

              {/* Owner Add Product + Stock & Budget Filter Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => openOwnerAddModal(false)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#146C32] hover:bg-[#0F5426] text-white text-xs font-semibold transition-colors whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Product</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('concierge')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors whitespace-nowrap"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#FF8C3B]" />
                  <span>Owner Price & Discount Desk</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setMaxPriceFilter((prev) => (prev === 15000 ? null : 15000))
                  }
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                    maxPriceFilter === 15000
                      ? 'bg-[#E86A17] text-white'
                      : 'bg-[#F3F2EE] text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>
                    {maxPriceFilter === 15000
                      ? 'Offer Under ₹15,000 Active'
                      : 'Filter Under ₹15,000'}
                  </span>
                </button>
              </div>
            </div>

            {/* Interactive Category + Stock Availability Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 p-1.5 bg-[#F3F2EE] rounded-xl overflow-x-auto">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                      selectedCategory === cat
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Stock Availability Filter (All / In Stock / Out of Stock) */}
              <div className="flex items-center gap-1.5 p-1.5 bg-[#F3F2EE] rounded-xl text-xs">
                {(
                  [
                    { id: 'all', label: `All (${productsList.length})` },
                    {
                      id: 'in-stock',
                      label: `In Stock (${
                        productsList.filter((p) => p.stockStatus !== 'Out of Stock').length
                      })`,
                    },
                    {
                      id: 'out-of-stock',
                      label: `Out of Stock (${
                        productsList.filter((p) => p.stockStatus === 'Out of Stock').length
                      })`,
                    },
                  ] as const
                ).map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStockFilter(st.id)}
                    className={`px-3 py-1.5 font-semibold rounded-lg transition-colors whitespace-nowrap ${
                      stockFilter === st.id
                        ? st.id === 'out-of-stock'
                          ? 'bg-red-600 text-white'
                          : 'bg-white text-[#146C32] shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3-Column Product Grid (Maintaining Offer Price, Original MRP, Out of Stock Conditions & Reviews) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {filteredProducts.map((product) => {
                const isWishlisted = wishlistIds.includes(product.id);
                const isCompared = compareList.some((c) => c.id === product.id);
                const isOutOfStock = product.stockStatus === 'Out of Stock';
                const isLimitedStock = product.stockStatus === 'Limited Stock';
                const isNotified = restockNotifiedIds.includes(product.id);
                const savingsInr = Math.max(0, product.mrp - product.price);
                const discountPct =
                  product.mrp > 0
                    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
                    : 0;
                const itemReviews = productReviews[product.id] || [];
                const reviewAvg =
                  itemReviews.length > 0
                    ? (
                        itemReviews.reduce((s, r) => s + r.rating, 0) /
                        itemReviews.length
                      ).toFixed(1)
                    : '4.8';

                return (
                  <article
                    key={product.id}
                    className={`group bg-white rounded-xl border overflow-hidden flex flex-col transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md ${
                      isOutOfStock ? 'border-red-200/90' : 'border-stone-200/80'
                    }`}
                  >
                    {/* 70% Card Height Neutral Image Backdrop */}
                    <div
                      onClick={() => openProductModal(product)}
                      className="relative aspect-4/3 w-full bg-[#F9F9F8] overflow-hidden cursor-pointer"
                    >
                      <ResilientImage
                        src={product.image}
                        alt={product.name}
                        className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-103 ${
                          isOutOfStock ? 'opacity-65 grayscale-[25%]' : ''
                        }`}
                      />

                      {/* Out of Stock / Limited Stock Banner Overlay */}
                      {isOutOfStock && (
                        <div className="absolute inset-x-0 bottom-0 bg-red-600/95 text-white px-3 py-2 text-center text-xs font-bold uppercase tracking-wider">
                          Out of Stock · Product Currently Not Available
                        </div>
                      )}
                      {!isOutOfStock && isLimitedStock && (
                        <div className="absolute left-3 bottom-3 bg-amber-600/95 text-white px-2.5 py-1 rounded text-[11px] font-semibold">
                          Hurry · Only Few Left in Stock
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product.id);
                        }}
                        aria-label="Toggle Wishlist"
                        className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-stone-700 transition-colors"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isWishlisted ? 'fill-[#E86A17] text-[#E86A17]' : ''
                          }`}
                        />
                      </button>
                    </div>

                    {/* Clean Unboxed Metadata + Title + Offer Price, Original MRP, Stock Condition & Reviews */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
                          <div className="flex items-center gap-1.5">
                            <span>{product.category}</span>
                            <span aria-hidden="true">·</span>
                            <span
                              className={
                                isOutOfStock
                                  ? 'text-red-600 font-semibold'
                                  : isLimitedStock
                                  ? 'text-amber-700 font-semibold'
                                  : 'text-[#146C32] font-semibold'
                              }
                            >
                              {isOutOfStock
                                ? 'Out of Stock (Unavailable)'
                                : isLimitedStock
                                ? 'Limited Stock'
                                : 'In Stock'}
                            </span>
                          </div>

                          {/* Clickable Amazon/Flipkart Style Customer Rating & Review Trigger */}
                          <button
                            type="button"
                            onClick={() => openProductModal(product)}
                            className="inline-flex items-center gap-1 font-semibold text-stone-800 hover:text-[#146C32]"
                            title="View Customer Reviews & Ratings"
                          >
                            <Star className="w-3.5 h-3.5 fill-[#E86A17] text-[#E86A17]" />
                            <span>
                              {reviewAvg} ({itemReviews.length || 12} Reviews)
                            </span>
                          </button>
                        </div>

                        <h3
                          onClick={() => openProductModal(product)}
                          className="text-base font-semibold text-stone-900 group-hover:text-[#146C32] cursor-pointer leading-snug"
                        >
                          {product.name}
                        </h3>

                        {product.offerTag && (
                          <p className="text-xs font-semibold text-[#E86A17]">
                            {product.offerTag}
                          </p>
                        )}

                        <p className="text-xs text-stone-500">
                          {product.sellerName} · {product.deliveryEta}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-stone-100 space-y-3">
                        {/* Explicit Offer Price & Original MRP Maintenance */}
                        <div className="space-y-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <div className="flex items-baseline gap-2">
                              <span className="text-xs text-stone-500">Offer:</span>
                              <span className="text-base font-semibold text-stone-900 font-mono-tabular">
                                ₹{product.price.toLocaleString('en-IN')}
                              </span>
                              <span className="text-xs text-stone-400 line-through font-mono-tabular">
                                MRP ₹{product.mrp.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <span className="text-xs font-semibold text-[#E86A17] font-mono-tabular">
                              {discountPct}% Off
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs text-stone-500">
                            <span className="text-[#146C32] font-medium font-mono-tabular">
                              Save ₹{savingsInr.toLocaleString('en-IN')}
                            </span>
                            {isOutOfStock ? (
                              <span className="text-red-600 font-semibold">
                                Product Not Available
                              </span>
                            ) : product.exchangeBonusUpTo > 0 ? (
                              <span className="font-mono-tabular">
                                Exchange up to ₹{product.exchangeBonusUpTo.toLocaleString('en-IN')}
                              </span>
                            ) : (
                              <span>7-Day Return · COD</span>
                            )}
                          </div>
                        </div>

                        {/* Primary Shopper + Owner Actions */}
                        <div className="flex items-center gap-2">
                          {isOutOfStock ? (
                            <button
                              type="button"
                              onClick={() => toggleRestockNotify(product.id)}
                              className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                                isNotified
                                  ? 'bg-stone-800 text-white'
                                  : 'bg-red-50 border border-red-200 text-red-700 hover:bg-red-100'
                              }`}
                            >
                              {isNotified
                                ? '✓ Restock Alert Active'
                                : 'Out of Stock · Notify Me'}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => addToCart(product)}
                              className="flex-1 py-2.5 px-3 rounded-lg bg-[#146C32] hover:bg-[#0F5426] text-white text-xs font-semibold transition-colors whitespace-nowrap"
                            >
                              Add to Bag
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openProductModal(product)}
                            className="py-2.5 px-2.5 rounded-lg bg-[#F3F2EE] hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors whitespace-nowrap"
                          >
                            Reviews & Info
                          </button>
                          <button
                            type="button"
                            onClick={() => openOwnerEditModal(product)}
                            className="py-2.5 px-2.5 rounded-lg border border-stone-200 hover:border-[#146C32] text-stone-700 hover:text-[#146C32] text-xs font-semibold transition-colors whitespace-nowrap inline-flex items-center gap-1"
                            title="Owner: Edit Price, Discount, Offer Tag & Stock Status"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Price</span>
                          </button>
                        </div>

                        {/* Secondary Quick Row: Compare + Owner 1-Click Stock Toggle */}
                        <div className="flex items-center justify-between pt-1 text-[11px] text-stone-500">
                          <button
                            type="button"
                            onClick={() => toggleCompareProduct(product)}
                            className={`font-semibold hover:underline ${
                              isCompared ? 'text-[#146C32]' : 'text-stone-500'
                            }`}
                          >
                            {isCompared ? '✓ Added to Compare' : '+ Compare Specs'}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleChangeStockStatus(
                                product.id,
                                isOutOfStock ? 'In Stock' : 'Out of Stock',
                                false
                              )
                            }
                            className="font-semibold text-stone-500 hover:text-stone-900 underline"
                          >
                            {isOutOfStock
                              ? 'Owner: Mark In Stock'
                              : 'Owner: Mark Out of Stock'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* PILLAR 2: SELL & BUY USED ITEMS (MERCARI-STYLE C2C RESALE) */}
        {activeSection === 'resale' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-4">
              <div>
                <h2 className="text-2xl font-semibold text-stone-900">
                  02. Neighbourhood C2C Resale — Verified Pre-Owned Items
                </h2>
                <p className="text-sm text-stone-600 mt-1">
                  Compare the Resale Offer Price against Original MRP. Buyer payment stays safe in DharmaMart UPI Escrow until doorstep inspection.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSellModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#E86A17] hover:bg-[#cf5b10] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>List Used Item for Sale</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {resaleList.map((item) => {
                const savedInr = Math.max(0, item.mrp - item.price);
                const savedPct =
                  item.mrp > 0 ? Math.round(((item.mrp - item.price) / item.mrp) * 100) : 0;
                const isOut = item.stockStatus === 'Out of Stock';

                return (
                  <article
                    key={item.id}
                    className="bg-white rounded-xl border border-stone-200/80 overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div
                        onClick={() => openProductModal(item)}
                        className="relative aspect-4/3 w-full bg-[#F9F9F8] overflow-hidden cursor-pointer"
                      >
                        <ResilientImage
                          src={item.image}
                          alt={item.name}
                          className={`w-full h-full object-cover ${
                            isOut ? 'opacity-65 grayscale-[25%]' : ''
                          }`}
                        />
                        {isOut && (
                          <div className="absolute inset-x-0 bottom-0 bg-red-600/95 text-white px-3 py-1.5 text-center text-xs font-bold uppercase">
                            Out of Stock · Sold / Unavailable
                          </div>
                        )}
                      </div>
                      <div className="p-5 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-stone-500">
                          <span className="font-semibold text-[#E86A17]">
                            Condition: {item.condition}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{item.sellerDistanceKm ?? 1.5} km away</span>
                          <span aria-hidden="true">·</span>
                          <span>UPI Escrow</span>
                        </div>

                        <h3
                          onClick={() => openProductModal(item)}
                          className="text-base font-semibold text-stone-900 hover:text-[#146C32] cursor-pointer leading-snug"
                        >
                          {item.name}
                        </h3>

                        <p className="text-xs text-stone-600 line-clamp-2">
                          {item.description}
                        </p>

                        <p className="text-xs text-stone-500 pt-1">
                          {item.sellerName} · {item.city}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 pt-3 border-t border-stone-100 space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-baseline justify-between">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs text-stone-500">Offer:</span>
                            <span className="text-base font-semibold text-stone-900 font-mono-tabular">
                              ₹{item.price.toLocaleString('en-IN')}
                            </span>
                            <span className="text-xs text-stone-400 line-through font-mono-tabular">
                              Orig. ₹{item.mrp.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-[#146C32] font-mono-tabular">
                            Save ₹{savedInr.toLocaleString('en-IN')} ({savedPct}%)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isOut ? (
                          <button
                            type="button"
                            disabled
                            className="flex-1 py-2.5 px-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold whitespace-nowrap"
                          >
                            Out of Stock
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => addToCart(item)}
                            className="flex-1 py-2.5 px-4 rounded-lg bg-[#146C32] hover:bg-[#0F5426] text-white text-xs font-semibold transition-colors whitespace-nowrap"
                          >
                            Buy with UPI / COD Escrow
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openProductModal(item)}
                          className="py-2.5 px-3 rounded-lg bg-[#F3F2EE] hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors whitespace-nowrap"
                        >
                          Reviews
                        </button>
                        <button
                          type="button"
                          onClick={() => openOwnerEditModal(item)}
                          className="py-2.5 px-2.5 rounded-lg border border-stone-200 text-stone-700 hover:text-[#146C32] text-xs font-semibold"
                          title="Edit Price & Offer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* PILLAR 3: EXCHANGE & UPGRADE ("EXCHANGE MY OLD PHONE" + LOCAL MATCHING) */}
        {activeSection === 'exchange' && (
          <section className="space-y-8">
            <div className="border-b border-stone-200 pb-4">
              <h2 className="text-2xl font-semibold text-stone-900">
                03. Smart Exchange & Upgrade — Instant Trade-In + Local Swaps
              </h2>
              <p className="text-sm text-stone-600 mt-1">
                Trade in your old phone, laptop, or furniture for an instant discount on top of the Offer Price, or match directly with a neighbour.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Interactive Trade-In Calculator */}
              <div className="lg:col-span-7 bg-white rounded-xl border border-stone-200/80 p-6 space-y-5">
                <h3 className="text-lg font-semibold text-stone-900">
                  Exchange My Old Device / Furniture + Upgrade
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Step 1: Select Your Current Item to Exchange
                    </label>
                    <select
                      value={selectedOldDeviceIndex}
                      onChange={(e) => setSelectedOldDeviceIndex(Number(e.target.value))}
                      className="w-full rounded-lg border border-stone-300 bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-stone-900 focus:border-[#146C32] focus:outline-none"
                    >
                      {TRADE_IN_DEVICES.map((dev, idx) => (
                        <option key={dev.label} value={idx}>
                          {dev.label} (Base value up to ₹{dev.baseValue.toLocaleString('en-IN')})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Step 2: Current Condition (Checked at Doorstep Pickup)
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {(['Flawless', 'Good', 'Screen Wear'] as const).map((cond) => (
                        <button
                          key={cond}
                          type="button"
                          onClick={() => setOldDeviceCondition(cond)}
                          className={`py-2.5 px-3 rounded-lg text-xs font-semibold border transition-colors ${
                            oldDeviceCondition === cond
                              ? 'border-[#146C32] bg-[#146C32]/10 text-[#146C32]'
                              : 'border-stone-200 bg-[#FAF9F6] text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          {cond}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Step 3: Choose Product to Upgrade To
                    </label>
                    <select
                      value={targetUpgradeId}
                      onChange={(e) => setTargetUpgradeId(e.target.value)}
                      className="w-full rounded-lg border border-stone-300 bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-stone-900 focus:border-[#146C32] focus:outline-none"
                    >
                      {productsList.map((prod) => (
                        <option key={prod.id} value={prod.id}>
                          {prod.name} — Offer ₹{prod.price.toLocaleString('en-IN')} (MRP ₹
                          {prod.mrp.toLocaleString('en-IN')})
                          {prod.stockStatus === 'Out of Stock' ? ' [Out of Stock]' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Valuation Summary Box */}
                <div className="p-5 rounded-xl bg-[#F3F2EE] space-y-2">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span>Original MRP ({targetUpgradeProduct.name}):</span>
                    <span className="font-mono-tabular line-through">
                      ₹{targetUpgradeProduct.mrp.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-stone-700">
                    <span>DharmaMart Offer Price:</span>
                    <span className="font-mono-tabular font-semibold text-stone-900">
                      ₹{targetUpgradeProduct.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#146C32]">
                    <span>Instant Doorstep Exchange Value ({oldDeviceCondition}):</span>
                    <span className="font-mono-tabular font-semibold">
                      - ₹{estimatedTradeInValue.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-stone-300/80 flex items-baseline justify-between">
                    <span className="text-sm font-semibold text-stone-900">
                      Net Upgrade Payable at Delivery:
                    </span>
                    <span className="text-xl font-semibold text-[#146C32] font-mono-tabular">
                      ₹{netPayableAfterExchange.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={targetUpgradeProduct.stockStatus === 'Out of Stock'}
                  onClick={() =>
                    addToCart(
                      targetUpgradeProduct,
                      targetUpgradeProduct.variants[0],
                      estimatedTradeInValue
                    )
                  }
                  className="w-full py-3 px-5 rounded-lg bg-[#146C32] hover:bg-[#0F5426] disabled:bg-stone-300 disabled:text-stone-600 text-white text-xs font-semibold transition-colors inline-flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>
                    {targetUpgradeProduct.stockStatus === 'Out of Stock'
                      ? 'Selected Upgrade Product is Out of Stock'
                      : `Apply ₹${estimatedTradeInValue.toLocaleString('en-IN')} Exchange Credit & Add to Bag`}
                  </span>
                </button>
              </div>

              {/* Local Neighbourhood Direct Swap Matches */}
              <div className="lg:col-span-5 space-y-4">
                <h3 className="text-lg font-semibold text-stone-900">
                  Local Buyer / Seller Direct Swap Matches Nearby
                </h3>
                <p className="text-xs text-stone-600">
                  Verified neighbours within 3 km looking for direct gadget or furniture exchanges:
                </p>

                <div className="space-y-3">
                  {LOCAL_EXCHANGE_MATCHES.map((match) => {
                    const isRequested = swapRequestedIds.includes(match.id);
                    return (
                      <div
                        key={match.id}
                        className="bg-white rounded-xl border border-stone-200/80 p-4 space-y-2.5"
                      >
                        <div className="flex items-center justify-between text-xs text-stone-500">
                          <span className="font-semibold text-stone-800">
                            {match.ownerName}
                          </span>
                          <span>
                            {match.neighborhood} · {match.distanceKm} km
                          </span>
                        </div>
                        <div className="text-xs space-y-1">
                          <p className="text-stone-900 font-medium">
                            Has: {match.offeringItem}
                          </p>
                          <p className="text-[#146C32] font-medium">
                            Wants: {match.lookingFor}
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                          <span className="text-xs font-mono-tabular text-stone-600">
                            {match.topUpInr > 0
                              ? `Includes +₹${match.topUpInr.toLocaleString('en-IN')} UPI Top-Up`
                              : 'Direct 1:1 Value Swap'}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setSwapRequestedIds((prev) =>
                                prev.includes(match.id) ? prev : [...prev, match.id]
                              )
                            }
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                              isRequested
                                ? 'bg-stone-100 text-[#146C32]'
                                : 'bg-stone-900 text-white hover:bg-stone-800'
                            }`}
                          >
                            {isRequested ? '✓ Swap Request Sent' : 'Propose Local Swap'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* PILLAR 4: LOCAL HOME & REPAIR SERVICES */}
        {activeSection === 'services' && (
          <section className="space-y-6">
            <div className="border-b border-stone-200 pb-4">
              <h2 className="text-2xl font-semibold text-stone-900">
                04. Verified Local Home & Repair Services
              </h2>
              <p className="text-sm text-stone-600 mt-1">
                Background-verified neighbourhood electricians, plumbers, AC technicians, and mobile repair experts in 30–60 minutes.
              </p>
            </div>

            {/* Active Service Bookings Banner */}
            {serviceBookings.length > 0 && (
              <div className="bg-white rounded-xl border border-[#146C32]/30 p-5 space-y-3">
                <h3 className="text-sm font-semibold text-[#146C32]">
                  Live Service Bookings ({serviceBookings.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {serviceBookings.map((b) => (
                    <div
                      key={b.bookingId}
                      className="p-3.5 rounded-lg bg-[#FAF9F6] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-semibold text-stone-900">
                        <span>
                          {b.bookingId} · {b.serviceTitle}
                        </span>
                        <span className="font-mono-tabular">₹{b.amountInr}</span>
                      </div>
                      <p className="text-stone-600">
                        {b.slot} · {b.address}
                      </p>
                      <p className="text-[#146C32] font-medium">{b.status}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {LOCAL_SERVICES.map((srv) => (
                <article
                  key={srv.id}
                  className="bg-white rounded-xl border border-stone-200/80 overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-4/3 w-full bg-[#F9F9F8] overflow-hidden">
                      <ResilientImage
                        src={srv.image}
                        alt={srv.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="flex items-center gap-2 text-xs text-stone-500">
                        <span className="font-semibold text-[#146C32]">{srv.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{srv.etaMinutes} min arrival</span>
                        <span aria-hidden="true">·</span>
                        <span>{srv.warrantyDays}-day warranty</span>
                      </div>

                      <h3 className="text-base font-semibold text-stone-900 leading-snug">
                        {srv.title}
                      </h3>

                      <ul className="space-y-1.5 text-xs text-stone-600">
                        {srv.includes.map((inc) => (
                          <li key={inc} className="flex items-start gap-2">
                            <span className="text-[#146C32] font-bold">·</span>
                            <span>{inc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-5 pt-3 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-stone-500 block">Offer Rate</span>
                      <span className="text-base font-semibold text-stone-900 font-mono-tabular">
                        ₹{srv.basePrice}
                      </span>
                      <span className="text-xs text-stone-400 line-through font-mono-tabular ml-1.5">
                        MRP ₹{Math.round(srv.basePrice * 1.4)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveService(srv)}
                      className="px-4 py-2.5 rounded-lg bg-[#146C32] hover:bg-[#0F5426] text-white text-xs font-semibold transition-colors whitespace-nowrap inline-flex items-center gap-1.5"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Book Technician</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* PILLAR 5: OWNER STORE, INVENTORY, PRICE, DISCOUNT & OFFER CONTROL DESK */}
        {activeSection === 'owner' && (
          <OwnerStoreManagementSection
            products={productsList}
            resaleItems={resaleList}
            offerSettings={offerSettings}
            onUpdateOfferSettings={setOfferSettings}
            onOpenAddProduct={(isResale = false) => openAddProductModal(isResale)}
            onOpenEditProduct={(item, isResale = false) => openEditProductModal(item, isResale)}
            onDeleteProduct={handleDeleteCatalogProduct}
            onChangeStockStatus={handleChangeStockStatus}
            onApplyBulkDiscount={handleApplyBulkDiscount}
            onResetDefaultCatalog={handleResetDefaultCatalog}
          />
        )}

        {/* SECTION 3: PARTNER STORE UPI QR, CARD TRANSACTIONS, COD & INTERACTIVE HISTORY CHART */}
        <PaymentHistoryAnalyticsSection
          transactions={transactions}
          onOpenScanner={(mode) => openScannerModal(mode)}
        />

        {/* SECTION 4: INDIA ECOSYSTEM TRUST & LIVE ORDERS / RETURNS */}
        <section className="bg-white rounded-2xl border border-stone-200/80 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-5">
            <div>
              <h2 className="text-xl font-semibold text-stone-900">
                Built for India’s Digital Ecosystem — Amazon, Flipkart, Meesho & Myntra Standards
              </h2>
              <p className="text-sm text-stone-600 mt-1">
                Complete owner control over products, Offer Price vs Original MRP, Out of Stock conditions, verified customer reviews, and Play Store install/uninstall.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => openAddProductModal(false)}
                className="px-4 py-2.5 rounded-lg bg-[#E86A17] hover:bg-[#d15b0f] text-white text-xs font-semibold transition-colors whitespace-nowrap inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Product</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPlayStoreOpen(true)}
                className="px-4 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors whitespace-nowrap"
              >
                Play Store Upload & Install/Uninstall →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
            <div className="space-y-1">
              <div className="font-mono-tabular text-xl font-semibold text-[#146C32]">
                UPI QR + Cards + COD
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Camera QR scan-and-pay at partner shops, RuPay/Visa/Mastercard swipes, and doorstep Cash on Delivery with ₹{offerSettings.upiInstantDiscountInr} UPI reward.
              </p>
            </div>
            <div className="space-y-1">
              <div className="font-mono-tabular text-xl font-semibold text-stone-900">
                Owner Price & Offer Control
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Add new products, edit Offer Price & Original MRP, apply percentage discounts, or mark items Out of Stock anytime.
              </p>
            </div>
            <div className="space-y-1">
              <div className="font-mono-tabular text-xl font-semibold text-[#E86A17]">
                Verified Customer Reviews
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Amazon/Flipkart/Meesho/Myntra buyer conditions, star ratings, verified buyer reviews, and open-box delivery inspection.
              </p>
            </div>
            <div className="space-y-1">
              <div className="font-mono-tabular text-xl font-semibold text-stone-900">
                Play Store Install Ready
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Upload your Android release package (.aab) to Google Play Console and test live app Install & Uninstall directly.
              </p>
            </div>
          </div>

          {/* Live Order Tracking & Return Management */}
          {orders.length > 0 && (
            <div className="pt-4 border-t border-stone-200 space-y-3">
              <h3 className="text-sm font-semibold text-stone-900">
                Your Recent Orders & Return / Refund Tracking ({orders.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orders.map((ord) => (
                  <div
                    key={ord.orderId}
                    className="p-4 rounded-xl bg-[#FAF9F6] border border-stone-200/80 flex flex-col justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between font-semibold text-stone-900">
                        <span className="font-mono-tabular">
                          Order #{ord.orderId} · {ord.placedAt}
                        </span>
                        <span className="font-mono-tabular text-[#146C32]">
                          Offer Paid: ₹{ord.totalInr.toLocaleString('en-IN')}{' '}
                          <span className="text-stone-400 line-through font-normal">
                            MRP ₹{ord.originalMrpTotal.toLocaleString('en-IN')}
                          </span>
                        </span>
                      </div>
                      <p className="text-stone-600">
                        {ord.itemsSummary.join(', ')} · Saved ₹
                        {ord.totalSavedInr.toLocaleString('en-IN')}
                      </p>
                      <p className="text-stone-500">
                        Payment: {ord.paymentDetail} · Delivering to: {ord.customerName},{' '}
                        {ord.address} ({ord.pinCode})
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-stone-200/60">
                      <span className="font-semibold text-[#146C32]">{ord.status}</span>
                      <button
                        type="button"
                        onClick={() => toggleReturnRequest(ord.orderId)}
                        className="text-stone-700 hover:text-stone-900 font-semibold underline"
                      >
                        {ord.status === 'Return Pickup Scheduled'
                          ? 'Cancel Return Request'
                          : 'Request Return / Instant Refund'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* CLEAN FOOTER */}
      <footer className="border-t border-stone-200 bg-white mt-12">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-3">
            <DharmaAppIcon size={32} />
            <span>
              <strong className="text-stone-800">DharmaMart</strong> · Shop Smart • Live Better · Your Trusted Online & Local Store
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={() => setActiveSection('shop')}
              className="hover:text-stone-900"
            >
              Shop
            </button>
            <button
              type="button"
              onClick={() => openAddProductModal(false)}
              className="hover:text-stone-900 font-semibold text-[#E86A17]"
            >
              + Add Product
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('owner')}
              className="hover:text-stone-900 font-semibold text-stone-800"
            >
              Owner Price & Offer Manager
            </button>
            <button
              type="button"
              onClick={() => openScannerModal('upi')}
              className="hover:text-stone-900"
            >
              Scan & Pay QR
            </button>
            <button
              type="button"
              onClick={() => setIsPlayStoreOpen(true)}
              className="font-semibold text-[#146C32] hover:underline"
            >
              Play Store Upload & Install/Uninstall
            </button>
          </div>
        </div>
      </footer>

      {/* CONTIGUOUS PRODUCT DETAIL, CONDITIONS & CUSTOMER REVIEWS MODAL (AMAZON / FLIPKART / MEESHO / MYNTRA STYLE) */}
      {activeProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-5xl rounded-2xl bg-white border border-stone-200 shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
            {/* Modal Top Bar */}
            <div className="px-5 py-3.5 bg-[#FAF9F6] border-b border-stone-200 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 text-xs text-stone-600 truncate">
                <span className="font-semibold text-stone-900">{activeProduct.category}</span>
                <span>·</span>
                <span>{activeProduct.sellerName}</span>
                <span>·</span>
                <span
                  className={`px-2 py-0.5 rounded font-semibold ${
                    activeProduct.stockStatus === 'Out of Stock'
                      ? 'bg-red-600 text-white'
                      : activeProduct.stockStatus === 'Limited Stock'
                        ? 'bg-amber-500 text-white'
                        : 'bg-[#146C32] text-white'
                  }`}
                >
                  {activeProduct.stockStatus || 'In Stock'}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const prod = activeProduct;
                    setActiveProduct(null);
                    openEditProductModal(prod, prod.condition !== 'New');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#E86A17]" />
                  <span>Owner: Edit Price / Offer / Stock</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveProduct(null)}
                  className="h-8 w-8 rounded-full bg-white border border-stone-200 hover:bg-stone-100 flex items-center justify-center text-stone-700"
                  aria-label="Close product details"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Body: Top Product Overview + Below Customer Reviews & Marketplace Conditions */}
            <div className="p-5 sm:p-7 overflow-y-auto space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-7">
                {/* Left Gallery */}
                <div className="md:col-span-5 bg-[#F9F9F8] rounded-xl border border-stone-200/80 flex flex-col items-center justify-center p-5 relative">
                  <ResilientImage
                    src={activeProduct.image}
                    alt={activeProduct.name}
                    className={`w-full h-full max-h-[360px] object-cover rounded-lg ${
                      activeProduct.stockStatus === 'Out of Stock' ? 'grayscale opacity-75' : ''
                    }`}
                  />
                  {activeProduct.stockStatus === 'Out of Stock' && (
                    <div className="mt-3 w-full py-2 px-3 rounded-lg bg-red-600 text-white text-center text-xs font-bold uppercase tracking-wider">
                      Out of Stock · Currently Unavailable
                    </div>
                  )}
                </div>

                {/* Right Contiguous Purchase Module */}
                <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                  <div className="space-y-3.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                      <span className="font-semibold text-[#146C32] bg-[#146C32]/10 px-2.5 py-0.5 rounded-md">
                        ★ {activeProduct.rating} ({getReviewSummary(activeProduct.id, activeProduct.reviews).count} Verified Ratings)
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Condition: <strong>{activeProduct.condition}</strong></span>
                      <span aria-hidden="true">·</span>
                      <span>{activeProduct.city}</span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-semibold text-stone-900 leading-snug">
                      {activeProduct.name}
                    </h2>

                    {activeProduct.offerTag && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#E86A17]/15 text-[#E86A17] text-xs font-semibold">
                        <Tag className="w-3.5 h-3.5" />
                        <span>Special Offer: {activeProduct.offerTag}</span>
                      </div>
                    )}

                    {/* Offer Price vs Original MRP Breakdown */}
                    <div className="p-4 rounded-xl bg-[#FAF9F6] border border-stone-200/80 space-y-1.5">
                      <div className="flex flex-wrap items-baseline gap-3">
                        <span className="text-xs font-semibold text-stone-500">
                          Offer Price:
                        </span>
                        <span className="text-2xl font-semibold text-stone-900 font-mono-tabular">
                          ₹
                          {(
                            activeProduct.price -
                            (applyExchangeInPdp ? activeProduct.exchangeBonusUpTo : 0)
                          ).toLocaleString('en-IN')}
                        </span>
                        <span className="text-sm text-stone-400 line-through font-mono-tabular">
                          Original MRP ₹{activeProduct.mrp.toLocaleString('en-IN')}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#146C32] text-white text-xs font-semibold font-mono-tabular">
                          {Math.max(
                            0,
                            Math.round(
                              ((activeProduct.mrp - activeProduct.price) /
                                Math.max(activeProduct.mrp, 1)) *
                                100
                            )
                          )}
                          % OFF
                        </span>
                      </div>
                      <div className="text-xs text-[#146C32] font-semibold font-mono-tabular">
                        You Save ₹
                        {(
                          activeProduct.mrp -
                          activeProduct.price +
                          (applyExchangeInPdp ? activeProduct.exchangeBonusUpTo : 0)
                        ).toLocaleString('en-IN')}{' '}
                        · Inclusive of all taxes · Extra ₹{offerSettings.upiInstantDiscountInr} off on UPI
                      </div>
                    </div>

                    {/* OUT OF STOCK CONDITION BOX (WHEN UNAVAILABLE) */}
                    {activeProduct.stockStatus === 'Out of Stock' ? (
                      <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-red-700">
                            Currently Out of Stock (Product Not Available)
                          </span>
                          <span className="text-[11px] font-semibold text-red-600 bg-white px-2.5 py-0.5 rounded border border-red-200">
                            Restock Pending
                          </span>
                        </div>
                        <p className="text-xs text-red-900/80 leading-relaxed">
                          <strong>Unavailable Condition:</strong> High neighbourhood demand in {activeProduct.city} has depleted current hub inventory. Click <strong>Notify Me</strong> below to receive an SMS/WhatsApp alert as soon as fresh stock arrives at the ₹{activeProduct.price.toLocaleString('en-IN')} Offer Price, or use the Owner button to restock immediately.
                        </p>
                        <div className="flex flex-wrap items-center gap-2.5 pt-1">
                          <button
                            type="button"
                            onClick={() => toggleNotifyStock(activeProduct.id)}
                            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                              notifyStockIds.includes(activeProduct.id)
                                ? 'bg-[#146C32] text-white'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                          >
                            {notifyStockIds.includes(activeProduct.id)
                              ? '✓ Alert Active — We Will Notify You When Back in Stock'
                              : 'Notify Me When Available'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleChangeStockStatus(
                                activeProduct.id,
                                'In Stock',
                                activeProduct.condition !== 'New'
                              );
                              setActiveProduct({
                                ...activeProduct,
                                stockStatus: 'In Stock',
                              });
                            }}
                            className="px-3.5 py-2 rounded-lg bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 text-xs font-semibold"
                          >
                            Owner: Mark Back In Stock Now
                          </button>
                        </div>
                      </div>
                    ) : (
                      activeProduct.stockStatus === 'Limited Stock' && (
                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                          <span>
                            <strong>Limited Stock Condition:</strong> Only a few units left at the ₹{activeProduct.price.toLocaleString('en-IN')} Offer Price in {activeProduct.city}.
                          </span>
                          <span className="font-semibold text-amber-800 shrink-0 ml-2">
                            {activeProduct.deliveryEta}
                          </span>
                        </div>
                      )
                    )}

                    <p className="text-xs text-stone-600 leading-relaxed">
                      {activeProduct.description}
                    </p>

                    {/* Variant Selector */}
                    <div className="space-y-1.5 pt-1">
                      <label className="block text-xs font-semibold text-stone-700">
                        Select Variant / Option:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {activeProduct.variants.map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setSelectedVariant(v)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                              selectedVariant === v
                                ? 'border-[#146C32] bg-[#146C32]/10 text-[#146C32]'
                                : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Instant Exchange Checkbox */}
                    {activeProduct.exchangeBonusUpTo > 0 &&
                      activeProduct.stockStatus !== 'Out of Stock' && (
                        <label className="flex items-center gap-2.5 p-3 rounded-lg bg-[#FAF9F6] border border-stone-200 cursor-pointer text-xs">
                          <input
                            type="checkbox"
                            checked={applyExchangeInPdp}
                            onChange={(e) => setApplyExchangeInPdp(e.target.checked)}
                            className="rounded text-[#146C32] focus:ring-[#146C32]"
                          />
                          <span className="font-medium text-stone-800">
                            Apply Instant Exchange Credit (-₹
                            {activeProduct.exchangeBonusUpTo.toLocaleString('en-IN')}) at delivery
                          </span>
                        </label>
                      )}

                    {/* Key Specifications */}
                    <ul className="space-y-1 text-xs text-stone-600 pt-1">
                      {activeProduct.specs.map((s) => (
                        <li key={s}>· {s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center gap-3">
                    {activeProduct.stockStatus === 'Out of Stock' ? (
                      <button
                        type="button"
                        onClick={() => toggleNotifyStock(activeProduct.id)}
                        className="flex-1 py-3 px-5 rounded-lg bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold transition-colors"
                      >
                        {notifyStockIds.includes(activeProduct.id)
                          ? '✓ Restock Notification Registered'
                          : 'Out of Stock — Notify Me When Available'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          addToCart(
                            activeProduct,
                            selectedVariant,
                            applyExchangeInPdp ? activeProduct.exchangeBonusUpTo : 0
                          )
                        }
                        className="flex-1 py-3 px-5 rounded-lg bg-[#146C32] hover:bg-[#0F5426] text-white text-xs font-semibold transition-colors"
                      >
                        Add to Bag — Offer ₹
                        {(
                          activeProduct.price -
                          (applyExchangeInPdp ? activeProduct.exchangeBonusUpTo : 0)
                        ).toLocaleString('en-IN')}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* BELOW PRODUCT DETAILS: AMAZON / FLIPKART / MEESHO / MYNTRA BUYING CONDITIONS & CUSTOMER REVIEWS */}
              <CustomerReviewsAndConditions
                product={activeProduct}
                reviews={getReviewsForProduct(activeProduct)}
                onAddReview={(newRev) => handleAddProductReview(activeProduct.id, newRev)}
                onHelpfulVote={(revId) => handleHelpfulReviewVote(activeProduct.id, revId)}
              />
            </div>
          </div>
        </div>
      )}

      {/* SELL USED ITEM MODAL (MAINTAINING OFFER PRICE & ORIGINAL MRP) */}
      {showSellModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg rounded-xl bg-white border border-stone-200 shadow-xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h2 className="text-lg font-semibold text-stone-900">
                Sell Your Used Item on DharmaMart
              </h2>
              <button
                type="button"
                onClick={() => setShowSellModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishUsedItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Item Name / Model
                </label>
                <input
                  type="text"
                  required
                  value={newSellTitle}
                  onChange={(e) => setNewSellTitle(e.target.value)}
                  placeholder="e.g., Redmi Note 12 Pro 5G (8/128GB) or Teak Study Table"
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-[#146C32] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Your Offer Price (₹ INR)
                  </label>
                  <input
                    type="number"
                    required
                    value={newSellOfferPrice}
                    onChange={(e) => setNewSellOfferPrice(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Original Purchase MRP (₹ INR)
                  </label>
                  <input
                    type="number"
                    required
                    value={newSellOriginalPrice}
                    onChange={(e) => setNewSellOriginalPrice(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-mono-tabular"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newSellCategory}
                    onChange={(e) =>
                      setNewSellCategory(e.target.value as ProductCategory)
                    }
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Home & Kitchen">Home & Furniture</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Sports">Sports & Bikes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Condition
                  </label>
                  <select
                    value={newSellCondition}
                    onChange={(e) =>
                      setNewSellCondition(e.target.value as 'Like New' | 'Good')
                    }
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs"
                  >
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    City & PIN
                  </label>
                  <input
                    type="text"
                    value={newSellCity}
                    onChange={(e) => setNewSellCity(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-stone-700">
                    Description ({language})
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateSellerListing}
                    className="text-xs font-semibold text-[#E86A17] hover:underline"
                  >
                    Auto-Fill Standard Seller Template
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={newSellDesc}
                  onChange={(e) => setNewSellDesc(e.target.value)}
                  placeholder="Include age, battery/condition details, and accessories..."
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs focus:border-[#146C32] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-[#146C32] hover:bg-[#0F5426] text-white text-xs font-semibold transition-colors"
              >
                Publish Listing (Offer ₹{Number(newSellOfferPrice || 0).toLocaleString('en-IN')} / MRP ₹{Number(newSellOriginalPrice || 0).toLocaleString('en-IN')})
              </button>
            </form>
          </div>
        </div>
      )}

      {/* BOOK LOCAL SERVICE MODAL */}
      {activeService && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-xl bg-white border border-stone-200 shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="text-base font-semibold text-stone-900">
                Book {activeService.category}
              </h3>
              <button
                type="button"
                onClick={() => setActiveService(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookService} className="space-y-4 text-xs">
              <p className="font-medium text-stone-800">{activeService.title}</p>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Preferred Arrival Time Slot
                </label>
                <select
                  value={serviceSlot}
                  onChange={(e) => setServiceSlot(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                >
                  <option value="Today · Within 45 mins">Today · Within 45 mins</option>
                  <option value="Today · Evening (5 PM – 7 PM)">
                    Today · Evening (5 PM – 7 PM)
                  </option>
                  <option value="Tomorrow · Morning (10 AM – 12 PM)">
                    Tomorrow · Morning (10 AM – 12 PM)
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Service Address & PIN Code
                </label>
                <input
                  type="text"
                  required
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="p-3.5 rounded-lg bg-[#F3F2EE] flex items-center justify-between">
                <span>Offer Estimate (Pay via UPI QR, Card, or Cash after job):</span>
                <span className="text-base font-semibold text-stone-900 font-mono-tabular">
                  ₹{activeService.basePrice + activeService.visitFee}
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-[#146C32] hover:bg-[#0F5426] text-white font-semibold"
              >
                Confirm Doorstep Technician
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SIDE-BY-SIDE COMPARE MODAL */}
      {showCompareModal && compareList.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-3xl rounded-xl bg-white border border-stone-200 shadow-xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="text-lg font-semibold text-stone-900">
                Side-by-Side Offer Price & Specification Comparison
              </h3>
              <button
                type="button"
                onClick={() => setShowCompareModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {compareList.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-[#FAF9F6] border border-stone-200 space-y-3"
                >
                  <div className="aspect-4/3 w-full rounded-lg overflow-hidden bg-white">
                    <ResilientImage
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="text-sm font-semibold text-stone-900">
                    {item.name}
                  </h4>
                  <div className="space-y-0.5">
                    <div className="text-base font-semibold text-[#146C32] font-mono-tabular">
                      Offer: ₹{item.price.toLocaleString('en-IN')}{' '}
                      <span className="text-xs text-stone-400 line-through font-normal">
                        MRP ₹{item.mrp.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="text-xs text-[#E86A17] font-semibold font-mono-tabular">
                      Save ₹{(item.mrp - item.price).toLocaleString('en-IN')} · Exchange up to ₹
                      {item.exchangeBonusUpTo.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <p className="text-xs text-stone-500">
                    {item.deliveryEta} · ★ {item.rating} · {item.stockStatus || 'In Stock'}
                  </p>
                  <ul className="text-xs text-stone-700 space-y-1">
                    {item.specs.map((s) => (
                      <li key={s}>· {s}</li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    disabled={item.stockStatus === 'Out of Stock'}
                    onClick={() => {
                      setShowCompareModal(false);
                      addToCart(item);
                    }}
                    className="w-full py-2.5 rounded-lg bg-[#146C32] disabled:bg-stone-300 text-white text-xs font-semibold"
                  >
                    {item.stockStatus === 'Out of Stock' ? 'Out of Stock' : 'Add to Bag'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SLIDE-OVER CART & INDIA CHECKOUT DRAWER (UPI / RUPAY CARD / CASH ON DELIVERY) */}
      {isCartOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/50"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white h-full flex flex-col justify-between shadow-2xl overflow-y-auto">
            <div className="p-6 space-y-5 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                <div>
                  <h2 className="text-lg font-semibold text-stone-900">
                    Your Shopping Bag ({totalCartItems})
                  </h2>
                  <p className="text-xs text-stone-500">
                    Offer Price Protected · Free delivery ≥ ₹{offerSettings.freeDeliveryThresholdInr} · Instant ₹{offerSettings.upiInstantDiscountInr} UPI Off
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <p className="text-sm text-stone-500">
                    Your bag is currently empty.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(false)}
                    className="px-4 py-2 rounded-lg bg-[#146C32] text-white text-xs font-semibold"
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                <>
                  {/* Itemized List with Offer Price vs Original MRP */}
                  <div className="space-y-3">
                    {cart.map((entry, idx) => (
                      <div
                        key={`${entry.item.id}-${entry.selectedVariant}`}
                        className="p-3.5 rounded-xl bg-[#FAF9F6] border border-stone-200/80 flex items-center justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-semibold text-stone-900">
                            {entry.item.name}
                          </h4>
                          <p className="text-[11px] text-stone-500">
                            Variant: {entry.selectedVariant}
                            {entry.withExchangeCredit > 0 &&
                              ` · Exchange -₹${entry.withExchangeCredit.toLocaleString('en-IN')}`}
                          </p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs font-semibold text-[#146C32] font-mono-tabular">
                              Offer ₹
                              {(
                                (entry.item.price - entry.withExchangeCredit) *
                                entry.quantity
                              ).toLocaleString('en-IN')}
                            </span>
                            <span className="text-[11px] text-stone-400 line-through font-mono-tabular">
                              MRP ₹{(entry.item.mrp * entry.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(idx, -1)}
                            className="h-7 w-7 rounded-md bg-white border border-stone-300 flex items-center justify-center text-stone-700"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-mono-tabular font-semibold w-4 text-center">
                            {entry.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(idx, 1)}
                            className="h-7 w-7 rounded-md bg-white border border-stone-300 flex items-center justify-center text-stone-700"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Store Promo Coupon Code Box */}
                  <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-stone-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-stone-800">
                        Store Promo Code ({offerSettings.activePromoCode} for {offerSettings.promoDiscountPercent}% Off)
                      </span>
                      {promoApplied && (
                        <span className="text-[#146C32] font-semibold">
                          ✓ Applied (-₹{promoCodeDiscountAmount.toLocaleString('en-IN')})
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCodeInput}
                        onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                        placeholder={`Enter ${offerSettings.activePromoCode}`}
                        className="flex-1 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-mono-tabular uppercase"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            promoCodeInput.trim().toUpperCase() ===
                            offerSettings.activePromoCode.toUpperCase()
                          ) {
                            setPromoApplied(true);
                          } else {
                            setPromoCodeInput(offerSettings.activePromoCode);
                            setPromoApplied(true);
                          }
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold"
                      >
                        {promoApplied ? 'Applied' : `Apply ${offerSettings.activePromoCode}`}
                      </button>
                    </div>
                  </div>

                  {/* India Payment Selector (UPI / Card / Cash on Delivery) */}
                  <form
                    onSubmit={handlePlaceOrder}
                    className="space-y-4 pt-3 border-t border-stone-200"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-stone-700">
                          Payment Method (UPI / Card / Cash on Delivery)
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCartOpen(false);
                            openScannerModal('upi');
                          }}
                          className="text-[11px] font-semibold text-[#146C32] hover:underline inline-flex items-center gap-1"
                        >
                          <QrCode className="w-3 h-3" />
                          <span>Scan Shop QR</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {(
                          [
                            { id: 'UPI', label: `UPI (-₹${offerSettings.upiInstantDiscountInr})` },
                            { id: 'Card', label: 'RuPay / Card' },
                            { id: 'COD', label: 'Cash (COD)' },
                          ] as const
                        ).map((pm) => (
                          <button
                            key={pm.id}
                            type="button"
                            onClick={() => setPaymentMethod(pm.id)}
                            className={`py-2 px-2.5 rounded-lg text-xs font-semibold border transition-colors ${
                              paymentMethod === pm.id
                                ? 'border-[#146C32] bg-[#146C32]/10 text-[#146C32]'
                                : 'border-stone-200 text-stone-600'
                            }`}
                          >
                            {pm.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {paymentMethod === 'UPI' && (
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          UPI ID (GPay / PhonePe / Paytm / BHIM)
                        </label>
                        <input
                          type="text"
                          required
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-mono-tabular"
                        />
                      </div>
                    )}

                    {paymentMethod === 'Card' && (
                      <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-stone-200 space-y-2.5">
                        <div className="grid grid-cols-3 gap-1.5">
                          {(
                            ['RuPay Platinum', 'Visa Signature', 'Mastercard World'] as const
                          ).map((net) => (
                            <button
                              key={net}
                              type="button"
                              onClick={() => setCheckoutCardNetwork(net)}
                              className={`py-1.5 px-2 rounded-md text-[11px] font-semibold border truncate ${
                                checkoutCardNetwork === net
                                  ? 'border-[#146C32] bg-white text-[#146C32]'
                                  : 'border-stone-200 text-stone-600'
                              }`}
                            >
                              {net}
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          required
                          value={checkoutCardNumber}
                          onChange={(e) => setCheckoutCardNumber(e.target.value)}
                          placeholder="Card Number"
                          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-mono-tabular"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            required
                            value={checkoutCardExpiry}
                            onChange={(e) => setCheckoutCardExpiry(e.target.value)}
                            placeholder="MM/YY"
                            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-mono-tabular"
                          />
                          <input
                            type="password"
                            maxLength={4}
                            required
                            value={checkoutCardCvv}
                            onChange={(e) => setCheckoutCardCvv(e.target.value)}
                            placeholder="CVV"
                            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-mono-tabular"
                          />
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'COD' && (
                      <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-stone-200 space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-stone-600">
                          <span>Pay Cash or UPI to Rider at Doorstep</span>
                          <span className="font-semibold text-[#146C32]">No Advance Fee</span>
                        </div>
                        <select
                          value={codChangeOption}
                          onChange={(e) =>
                            setCodChangeOption(
                              e.target.value as
                                | 'Exact Cash Ready'
                                | 'Bring Change for ₹500'
                                | 'Pay via UPI QR/Cash to Rider'
                            )
                          }
                          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs"
                        >
                          <option value="Exact Cash Ready">Exact Cash Ready</option>
                          <option value="Bring Change for ₹500">Bring Change for ₹500</option>
                          <option value="Pay via UPI QR/Cash to Rider">
                            Pay via UPI QR/Cash to Rider
                          </option>
                        </select>
                      </div>
                    )}

                    {/* Customer Verification Form */}
                    <div className="space-y-2.5">
                      <label className="block text-xs font-semibold text-stone-700">
                        Local Delivery & Verification Details
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="Phone (+91)"
                          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-mono-tabular"
                        />
                        <input
                          type="text"
                          required
                          value={customerPin}
                          onChange={(e) => setCustomerPin(e.target.value)}
                          placeholder="PIN Code"
                          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-mono-tabular"
                        />
                      </div>
                      <input
                        type="text"
                        required
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        placeholder="House / Flat No., Society, Area"
                        className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs"
                      />
                    </div>

                    {/* Subtotal & Offer vs Original MRP Breakdown */}
                    <div className="p-4 rounded-xl bg-[#F3F2EE] space-y-1.5 text-xs">
                      <div className="flex justify-between text-stone-500">
                        <span>Total Original MRP:</span>
                        <span className="font-mono-tabular line-through">
                          ₹{cartOriginalMrpTotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between text-stone-700">
                        <span>Offer Subtotal (after exchange):</span>
                        <span className="font-mono-tabular font-semibold">
                          ₹{cartSubtotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                      {promoCodeDiscountAmount > 0 && (
                        <div className="flex justify-between text-[#E86A17] font-semibold">
                          <span>Promo Code ({offerSettings.activePromoCode}):</span>
                          <span className="font-mono-tabular">- ₹{promoCodeDiscountAmount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {upiInstantDiscount > 0 && (
                        <div className="flex justify-between text-[#146C32]">
                          <span>UPI Instant Reward:</span>
                          <span className="font-mono-tabular">- ₹{upiInstantDiscount}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-stone-600">
                        <span>Hyperlocal Delivery:</span>
                        <span className="font-mono-tabular">
                          {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-stone-300 flex justify-between text-sm font-semibold text-stone-900">
                        <span>Final Offer Payable:</span>
                        <span className="font-mono-tabular">
                          ₹{finalPayable.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="text-[11px] font-semibold text-[#146C32] font-mono-tabular text-right">
                        Total Saved on Order: ₹{totalSavingsOnBag.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-lg bg-[#146C32] hover:bg-[#0F5426] text-white text-xs font-semibold transition-colors inline-flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>
                        Confirm Order ({paymentMethod}) — ₹
                        {finalPayable.toLocaleString('en-IN')}
                      </span>
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* OWNER ADD PRODUCT & EDIT PRICE / DISCOUNT / OFFER MODAL */}
      <OwnerProductEditorModal
        isOpen={isOwnerModalOpen}
        mode={ownerModalMode}
        initialProduct={editingProduct}
        isResaleItem={editingIsResale}
        onClose={() => setIsOwnerModalOpen(false)}
        onSaveProduct={handleSaveOwnerProduct}
      />

      {/* CAMERA-BASED UPI QR SCANNER + PARTNER STORE CARD & COD MODAL */}
      <UpiQrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        onPaymentSuccess={handlePartnerPaymentRecorded}
        initialMode={qrScannerInitialMode}
      />

      {/* PLAY STORE RELEASE, UPLOAD & INSTALL / UNINSTALL STUDIO MODAL */}
      <PlayStoreStudioModal
        isOpen={isPlayStoreOpen}
        onClose={() => setIsPlayStoreOpen(false)}
      />
    </div>
  );
}

export default App;
