import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Check,
  Tag,
  Percent,
  Upload,
  Trash2,
  Edit3,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import {
  STUDIO_PRODUCT_IMAGES,
  type ProductCategory,
  type ProductItem,
} from '../data/marketplaceData';

export interface StoreOfferSettings {
  bannerHeadline: string;
  upiInstantDiscountInr: number;
  freeDeliveryMinInr: number;
  promoCode: string;
  promoDiscountPct: number;
}

interface OwnerProductEditorModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  initialProduct?: ProductItem | null;
  isResaleTarget?: boolean;
  onClose: () => void;
  onSaveProduct: (product: ProductItem, isNew: boolean, isResale: boolean) => void;
  onDeleteProduct?: (productId: string, isResale: boolean) => void;
}

const OFFER_TAG_PRESETS = [
  'Festival Super Deal · Extra ₹150 UPI Off',
  'Limited Time Offer · Lowest Price',
  'Buy 1 Get Extra 10% Off',
  'Direct Store Owner Special Offer',
  'Bank Card & UPI Instant Cashback',
  'Clearance Discount · Fast Local Delivery',
];

const DISCOUNT_PRESETS = [10, 15, 20, 25, 35, 50];

export const OwnerProductEditorModal: React.FC<OwnerProductEditorModalProps> = ({
  isOpen,
  mode,
  initialProduct,
  isResaleTarget = false,
  onClose,
  onSaveProduct,
  onDeleteProduct,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Electronics');
  const [mrp, setMrp] = useState<number>(19999);
  const [price, setPrice] = useState<number>(14999);
  const [discountPctInput, setDiscountPctInput] = useState<number>(25);
  const [exchangeBonusUpTo, setExchangeBonusUpTo] = useState<number>(3000);
  const [offerTag, setOfferTag] = useState<string>('Festival Super Deal · Extra ₹150 UPI Off');
  const [stockStatus, setStockStatus] = useState<'In Stock' | 'Limited Stock' | 'Out of Stock'>(
    'In Stock'
  );
  const [image, setImage] = useState<string>(STUDIO_PRODUCT_IMAGES[0].url);
  const [sellerName, setSellerName] = useState<string>('DharmaMart Official Store');
  const [city, setCity] = useState<string>('Hyderabad · 500081');
  const [deliveryEta, setDeliveryEta] = useState<string>('45 min local rider');
  const [condition, setCondition] = useState<'New' | 'Like New' | 'Good' | 'Refurbished'>('New');
  const [variantsText, setVariantsText] = useState<string>('Standard Edition, Pro Pack');
  const [specsText, setSpecsText] = useState<string>(
    '1 Year Store Warranty, Doorstep Quality Inspection, Eligible for UPI / Card / COD'
  );
  const [description, setDescription] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;
    if (mode === 'edit' && initialProduct) {
      setName(initialProduct.name);
      setCategory(initialProduct.category);
      setMrp(initialProduct.mrp);
      setPrice(initialProduct.price);
      const calcPct =
        initialProduct.mrp > 0
          ? Math.round(((initialProduct.mrp - initialProduct.price) / initialProduct.mrp) * 100)
          : 0;
      setDiscountPctInput(Math.max(0, calcPct));
      setExchangeBonusUpTo(initialProduct.exchangeBonusUpTo);
      setOfferTag(initialProduct.offerTag || 'Special Store Offer');
      setStockStatus(initialProduct.stockStatus || 'In Stock');
      setImage(initialProduct.image);
      setSellerName(initialProduct.sellerName);
      setCity(initialProduct.city);
      setDeliveryEta(initialProduct.deliveryEta);
      setCondition(initialProduct.condition);
      setVariantsText(initialProduct.variants.join(', '));
      setSpecsText(initialProduct.specs.join(', '));
      setDescription(initialProduct.description);
    } else {
      setName('');
      setCategory('Electronics');
      setMrp(18999);
      setPrice(14249);
      setDiscountPctInput(25);
      setExchangeBonusUpTo(3000);
      setOfferTag('Festival Super Deal · Extra ₹150 UPI Off');
      setStockStatus('In Stock');
      setImage(STUDIO_PRODUCT_IMAGES[0].url);
      setSellerName('DharmaMart Official Store');
      setCity('Hyderabad · 500081');
      setDeliveryEta('45 min local delivery');
      setCondition(isResaleTarget ? 'Like New' : 'New');
      setVariantsText('Standard, Premium');
      setSpecsText(
        '1 Year Store Warranty, Verified Original Quality, Instant UPI / Card / COD'
      );
      setDescription(
        'Direct from DharmaMart store inventory with guaranteed Offer Price savings, doorstep exchange eligibility, and fast neighbourhood delivery.'
      );
    }
  }, [isOpen, mode, initialProduct, isResaleTarget]);

  if (!isOpen) return null;

  // Two-way price, MRP, and discount % handlers
  const handleMrpChange = (newMrp: number) => {
    const validMrp = Math.max(1, newMrp);
    setMrp(validMrp);
    const pct =
      validMrp > 0 ? Math.max(0, Math.round(((validMrp - price) / validMrp) * 100)) : 0;
    setDiscountPctInput(pct);
  };

  const handleOfferPriceChange = (newOffer: number) => {
    const validOffer = Math.max(1, newOffer);
    setPrice(validOffer);
    if (mrp > 0) {
      const pct = Math.max(0, Math.round(((mrp - validOffer) / mrp) * 100));
      setDiscountPctInput(pct);
    }
  };

  const handleDiscountPctChange = (pct: number) => {
    const clampedPct = Math.min(95, Math.max(0, pct));
    setDiscountPctInput(clampedPct);
    const computedOffer = Math.max(1, Math.round(mrp * (1 - clampedPct / 100)));
    setPrice(computedOffer);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const finalOffer = Math.max(1, Number(price) || 999);
    const finalMrp = Math.max(finalOffer, Number(mrp) || finalOffer);

    const savedProduct: ProductItem = {
      id:
        mode === 'edit' && initialProduct
          ? initialProduct.id
          : `dm-owner-${Date.now()}`,
      name: name.trim(),
      category,
      price: finalOffer,
      mrp: finalMrp,
      exchangeBonusUpTo: Math.max(0, Number(exchangeBonusUpTo) || 0),
      offerTag: offerTag.trim() || 'Special Offer Price',
      stockStatus,
      image: image || STUDIO_PRODUCT_IMAGES[0].url,
      sellerName: sellerName.trim() || 'DharmaMart Official Store',
      city: city.trim() || 'Local Hub',
      deliveryEta: deliveryEta.trim() || '45 min local delivery',
      rating: initialProduct?.rating || '4.9 (Store Verified)',
      specs: specsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      variants: variantsText
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean),
      condition,
      isUsedListing: isResaleTarget || initialProduct?.isUsedListing,
      sellerDistanceKm: initialProduct?.sellerDistanceKm ?? 1.2,
      description:
        description.trim() ||
        `${name.trim()} available at Offer Price ₹${finalOffer.toLocaleString(
          'en-IN'
        )} (Original MRP ₹${finalMrp.toLocaleString('en-IN')}).`,
    };

    onSaveProduct(savedProduct, mode === 'add', Boolean(savedProduct.isUsedListing));
    onClose();
  };

  const savingsAmount = Math.max(0, mrp - price);
  const effectiveDiscountPct = mrp > 0 ? Math.max(0, Math.round(((mrp - price) / mrp) * 100)) : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-3xl rounded-xl bg-white border border-stone-200 shadow-2xl my-8 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-[#FAF9F6] px-6 py-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#146C32]">
              Store Owner Price, Discount & Catalog Control
            </span>
            <h2 className="text-lg font-semibold text-stone-900">
              {mode === 'add'
                ? 'Add New Product to DharmaMart Store'
                : `Edit Price, Discount & Offers — ${initialProduct?.name}`}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 max-h-[82vh] overflow-y-auto text-xs"
        >
          {/* PRICE, ORIGINAL MRP & DISCOUNT MAINTENANCE BOX */}
          <div className="p-5 rounded-xl bg-[#FAF9F6] border border-[#146C32]/30 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#146C32]" />
                <h3 className="text-sm font-semibold text-stone-900">
                  Owner Price, Original MRP & Discount Calculator
                </h3>
              </div>
              <span className="font-mono-tabular font-semibold text-[#146C32] bg-white px-3 py-1 rounded-md border border-stone-200">
                Customer Saves ₹{savingsAmount.toLocaleString('en-IN')} ({effectiveDiscountPct}% Off MRP)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Original Price / MRP (₹)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={mrp}
                  onChange={(e) => handleMrpChange(Number(e.target.value))}
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-mono-tabular font-semibold text-stone-800 focus:border-[#146C32] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#146C32] mb-1">
                  Offer Selling Price (₹)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={price}
                  onChange={(e) => handleOfferPriceChange(Number(e.target.value))}
                  className="w-full rounded-lg border-2 border-[#146C32] bg-white px-3 py-2 text-sm font-mono-tabular font-bold text-[#146C32] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#E86A17] mb-1">
                  Discount (% Off MRP)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={95}
                    value={discountPctInput}
                    onChange={(e) => handleDiscountPctChange(Number(e.target.value))}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 pr-7 text-sm font-mono-tabular font-semibold text-[#E86A17] focus:border-[#E86A17] focus:outline-none"
                  />
                  <Percent className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Exchange Bonus Up To (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={exchangeBonusUpTo}
                  onChange={(e) => setExchangeBonusUpTo(Number(e.target.value))}
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-mono-tabular text-stone-800 focus:border-[#146C32] focus:outline-none"
                />
              </div>
            </div>

            {/* Quick 1-Click Discount % Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-stone-500 font-medium">Quick Discount Set:</span>
              {DISCOUNT_PRESETS.map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handleDiscountPctChange(pct)}
                  className={`px-2.5 py-1 rounded-md font-mono-tabular font-semibold transition-colors ${
                    effectiveDiscountPct === pct
                      ? 'bg-[#E86A17] text-white'
                      : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {pct}% Off
                </button>
              ))}
            </div>

            {/* Special Offer Tag / Promotional Badge Editor */}
            <div className="pt-2 border-t border-stone-200/80 space-y-2">
              <label className="block font-semibold text-stone-700">
                Special Offer Tag / Promotional Deal Label
              </label>
              <input
                type="text"
                value={offerTag}
                onChange={(e) => setOfferTag(e.target.value)}
                placeholder="e.g., Festival Super Deal · Extra ₹150 UPI Off"
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-900 focus:border-[#146C32] focus:outline-none"
              />
              <div className="flex flex-wrap gap-1.5">
                {OFFER_TAG_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setOfferTag(preset)}
                    className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                      offerTag === preset
                        ? 'bg-[#146C32] text-white font-semibold'
                        : 'bg-white border border-stone-200 text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* PRODUCT DETAILS & CATEGORY */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-stone-700 mb-1">
                Product Title / Model Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Samsung Galaxy M35 5G (8GB/256GB) or Pure Brass Filter Coffee Set"
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-[#146C32] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => {
                  const newCat = e.target.value as ProductCategory;
                  setCategory(newCat);
                  if (mode === 'add') {
                    const matchingStudio = STUDIO_PRODUCT_IMAGES.find(
                      (img) => img.category === newCat
                    );
                    if (matchingStudio) setImage(matchingStudio.url);
                  }
                }}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-[#146C32] focus:outline-none"
              >
                <option value="Electronics">Electronics</option>
                <option value="Home & Kitchen">Home & Kitchen</option>
                <option value="Grocery">Grocery</option>
                <option value="Fashion">Fashion</option>
                <option value="Beauty">Beauty</option>
                <option value="Sports">Sports</option>
                <option value="Pet Care">Pet Care</option>
              </select>
            </div>
          </div>

          {/* PRODUCT IMAGE SELECTION OR UPLOAD */}
          <div className="space-y-2.5 p-4 rounded-xl bg-[#FAF9F6] border border-stone-200">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="font-semibold text-stone-700">
                Product Photo (Select Studio Asset, Upload Photo, or Paste Image URL)
              </label>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Custom Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-1">
              {STUDIO_PRODUCT_IMAGES.map((studio) => (
                <button
                  key={studio.label}
                  type="button"
                  onClick={() => setImage(studio.url)}
                  className={`relative rounded-lg overflow-hidden border-2 aspect-square ${
                    image === studio.url ? 'border-[#146C32]' : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                  title={studio.label}
                >
                  <img
                    src={studio.url}
                    alt={studio.label}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="Or paste direct image URL..."
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-mono-tabular"
            />
          </div>

          {/* STORE & INVENTORY ATTRIBUTES */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Stock Status
              </label>
              <select
                value={stockStatus}
                onChange={(e) =>
                  setStockStatus(
                    e.target.value as 'In Stock' | 'Limited Stock' | 'Out of Stock'
                  )
                }
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs"
              >
                <option value="In Stock">In Stock</option>
                <option value="Limited Stock">Limited Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Seller / Store Name
              </label>
              <input
                type="text"
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                City & PIN Hub
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Delivery Time / ETA
              </label>
              <input
                type="text"
                value={deliveryEta}
                onChange={(e) => setDeliveryEta(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Variants (Comma-Separated)
              </label>
              <input
                type="text"
                value={variantsText}
                onChange={(e) => setVariantsText(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Key Specifications (Comma-Separated)
              </label>
              <input
                type="text"
                value={specsText}
                onChange={(e) => setSpecsText(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Product Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs"
            />
          </div>

          {/* Submit & Delete Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-200">
            {mode === 'edit' && initialProduct && onDeleteProduct ? (
              <button
                type="button"
                onClick={() => {
                  onDeleteProduct(initialProduct.id, Boolean(initialProduct.isUsedListing));
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 font-semibold"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Product</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#146C32] hover:bg-[#0F5426] text-white font-semibold"
              >
                <Check className="w-4 h-4" />
                <span>
                  {mode === 'add'
                    ? `Publish Product (Offer ₹${price.toLocaleString('en-IN')} / MRP ₹${mrp.toLocaleString('en-IN')})`
                    : `Save Price & Offer (₹${price.toLocaleString('en-IN')} · ${effectiveDiscountPct}% Off)`}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

interface OwnerStoreManagementSectionProps {
  products: ProductItem[];
  resaleItems: ProductItem[];
  offerSettings: StoreOfferSettings;
  onUpdateOfferSettings: (updated: StoreOfferSettings) => void;
  onOpenAddProduct: (isResale?: boolean) => void;
  onOpenEditProduct: (product: ProductItem) => void;
  onChangeStockStatus: (
    productId: string,
    status: 'In Stock' | 'Limited Stock' | 'Out of Stock',
    isResale: boolean
  ) => void;
  onDeleteProduct: (productId: string, isResale: boolean) => void;
  onApplyBulkDiscount: (discountPct: number, category: string) => void;
  onResetCatalog: () => void;
  onOpenPlayStoreModal: () => void;
}

export const OwnerStoreManagementSection: React.FC<OwnerStoreManagementSectionProps> = ({
  products,
  resaleItems,
  offerSettings,
  onUpdateOfferSettings,
  onOpenAddProduct,
  onOpenEditProduct,
  onChangeStockStatus,
  onDeleteProduct,
  onApplyBulkDiscount,
  onResetCatalog,
  onOpenPlayStoreModal,
}) => {
  const [bulkCategory, setBulkCategory] = useState<string>('All');
  const [bulkPct, setBulkPct] = useState<number>(20);
  const [savedToast, setSavedToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setSavedToast(msg);
    setTimeout(() => setSavedToast(null), 3000);
  };

  return (
    <section className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#146C32]">
            Proprietor Store Control Center
          </span>
          <h2 className="text-2xl font-semibold text-stone-900 mt-0.5">
            Store Owner — Add Products, Maintain Prices, Discounts & Offers
          </h2>
          <p className="text-sm text-stone-600 mt-1">
            Add new products, edit Offer Price vs Original MRP, apply storewide festival discounts, and manage your Play Store app.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onOpenAddProduct(false)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#146C32] hover:bg-[#0F5426] text-white text-xs font-semibold transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Store Product</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenAddProduct(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#E86A17] hover:bg-[#cf5b10] text-white text-xs font-semibold transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Resale Item</span>
          </button>
          <button
            type="button"
            onClick={onOpenPlayStoreModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors whitespace-nowrap"
          >
            <span>Play Store Upload / Install / Uninstall</span>
          </button>
        </div>
      </div>

      {savedToast && (
        <div className="p-3.5 rounded-xl bg-[#146C32] text-white text-xs font-semibold flex items-center justify-between">
          <span>✓ {savedToast}</span>
          <button type="button" onClick={() => setSavedToast(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STOREWIDE OFFERS, COUPON & BULK DISCOUNT MANAGER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-xl border border-stone-200/80 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#146C32]" />
            <h3 className="text-base font-semibold text-stone-900">
              Storewide Offers, UPI Reward & Promo Code Settings
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Live Storefront Promotional Banner Text
              </label>
              <input
                type="text"
                value={offerSettings.bannerHeadline}
                onChange={(e) =>
                  onUpdateOfferSettings({
                    ...offerSettings,
                    bannerHeadline: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium text-stone-900 focus:border-[#146C32] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  UPI Instant Discount (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={offerSettings.upiInstantDiscountInr}
                  onChange={(e) =>
                    onUpdateOfferSettings({
                      ...offerSettings,
                      upiInstantDiscountInr: Math.max(0, Number(e.target.value) || 0),
                    })
                  }
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 font-mono-tabular font-semibold text-[#146C32]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Free Delivery Above (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={offerSettings.freeDeliveryMinInr}
                  onChange={(e) =>
                    onUpdateOfferSettings({
                      ...offerSettings,
                      freeDeliveryMinInr: Math.max(0, Number(e.target.value) || 0),
                    })
                  }
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 font-mono-tabular font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Active Promo Code
                </label>
                <input
                  type="text"
                  value={offerSettings.promoCode}
                  onChange={(e) =>
                    onUpdateOfferSettings({
                      ...offerSettings,
                      promoCode: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 font-mono-tabular font-semibold uppercase text-[#E86A17]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Promo Code Discount (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={80}
                  value={offerSettings.promoDiscountPct}
                  onChange={(e) =>
                    onUpdateOfferSettings({
                      ...offerSettings,
                      promoDiscountPct: Math.min(80, Math.max(0, Number(e.target.value) || 0)),
                    })
                  }
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 font-mono-tabular font-semibold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Category Discount Applicator */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-stone-200/80 p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-stone-900">
                1-Click Bulk Discount Applicator
              </h3>
              <button
                type="button"
                onClick={() => {
                  onResetCatalog();
                  triggerToast('Catalog & prices restored to factory defaults.');
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-stone-900"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
            </div>
            <p className="text-xs text-stone-600">
              Automatically recalculate Offer Prices from Original MRP across a category or the entire store:
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Target Category
                </label>
                <select
                  value={bulkCategory}
                  onChange={(e) => setBulkCategory(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2"
                >
                  <option value="All">All Store Products</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Home & Kitchen">Home & Kitchen</option>
                  <option value="Grocery">Grocery</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Sports">Sports</option>
                  <option value="Pet Care">Pet Care</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Discount % Off MRP
                </label>
                <select
                  value={bulkPct}
                  onChange={(e) => setBulkPct(Number(e.target.value))}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 font-mono-tabular font-semibold text-[#E86A17]"
                >
                  <option value={10}>10% Off Original MRP</option>
                  <option value={15}>15% Off Original MRP</option>
                  <option value={20}>20% Off Original MRP</option>
                  <option value={25}>25% Off Original MRP</option>
                  <option value={30}>30% Off Original MRP</option>
                  <option value={40}>40% Off Original MRP</option>
                  <option value={50}>50% Off Original MRP</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onApplyBulkDiscount(bulkPct, bulkCategory);
              triggerToast(
                `Applied ${bulkPct}% discount off Original MRP to ${bulkCategory} products.`
              );
            }}
            className="w-full py-2.5 px-4 rounded-lg bg-[#E86A17] hover:bg-[#cf5b10] text-white text-xs font-semibold transition-colors"
          >
            Apply {bulkPct}% Off MRP to {bulkCategory} Products
          </button>
        </div>
      </div>

      {/* OWNER INVENTORY & PRICE MAINTENANCE TABLE */}
      <div className="bg-white rounded-xl border border-stone-200/80 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-stone-900">
              Store Catalog — Price, Original MRP & Offer Maintenance ({products.length + resaleItems.length} Items)
            </h3>
            <p className="text-xs text-stone-500">
              Click "Edit Price & Offer" on any item to update its Offer Price, Original MRP, Discount %, or Promo Tag.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenAddProduct(false)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#146C32] text-white text-xs font-semibold hover:bg-[#0F5426]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-200 bg-[#FAF9F6] text-stone-600 font-semibold">
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-3">Stock / Availability</th>
                <th className="py-3 px-3">Original MRP</th>
                <th className="py-3 px-3">Offer Price</th>
                <th className="py-3 px-3">Discount & Savings</th>
                <th className="py-3 px-3">Active Offer Tag</th>
                <th className="py-3 px-4 text-right">Owner Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/70">
              {[...products, ...resaleItems].map((item) => {
                const saved = Math.max(0, item.mrp - item.price);
                const pct =
                  item.mrp > 0 ? Math.round(((item.mrp - item.price) / item.mrp) * 100) : 0;
                const currentStock = item.stockStatus || 'In Stock';

                return (
                  <tr key={item.id} className="hover:bg-[#FAF9F6]/60">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover bg-stone-100 shrink-0"
                        />
                        <div>
                          <div className="font-semibold text-stone-900 line-clamp-1">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-stone-500">
                            {item.category} · {item.isUsedListing ? 'Resale Listing' : 'New Retail'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={currentStock}
                        onChange={(e) =>
                          onChangeStockStatus(
                            item.id,
                            e.target.value as 'In Stock' | 'Limited Stock' | 'Out of Stock',
                            Boolean(item.isUsedListing)
                          )
                        }
                        className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                          currentStock === 'Out of Stock'
                            ? 'border-red-300 bg-red-50 text-red-700'
                            : currentStock === 'Limited Stock'
                            ? 'border-amber-300 bg-amber-50 text-amber-800'
                            : 'border-[#146C32]/30 bg-[#146C32]/10 text-[#146C32]'
                        }`}
                      >
                        <option value="In Stock">In Stock</option>
                        <option value="Limited Stock">Limited Stock</option>
                        <option value="Out of Stock">Out of Stock (Unavailable)</option>
                      </select>
                    </td>
                    <td className="py-3 px-3 font-mono-tabular text-stone-500 line-through">
                      ₹{item.mrp.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 font-mono-tabular font-bold text-[#146C32] text-sm">
                      ₹{item.price.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 font-mono-tabular">
                      <span className="font-semibold text-[#E86A17]">{pct}% Off</span>
                      <span className="text-stone-500 block">
                        Save ₹{saved.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-stone-700">
                      {item.offerTag || 'Standard Offer'}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenEditProduct(item)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#146C32]/10 hover:bg-[#146C32] text-[#146C32] hover:text-white font-semibold transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Price & Offer</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onDeleteProduct(item.id, Boolean(item.isUsedListing))
                          }
                          className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
