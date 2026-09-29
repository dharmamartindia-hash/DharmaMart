import React, { useState, useMemo } from 'react';
import {
  Star,
  ThumbsUp,
  ShieldCheck,
  RefreshCw,
  Truck,
  Award,
  Check,
  Upload,
  FileText,
} from 'lucide-react';
import type { ProductItem } from '../data/marketplaceData';

export interface ProductReviewItem {
  id: string;
  productId: string;
  reviewerName: string;
  city: string;
  rating: number;
  title: string;
  comment: string;
  conditionTag: string;
  verifiedPurchase: boolean;
  purchasedVariant: string;
  dateLabel: string;
  helpfulCount: number;
  photoUrl?: string;
}

export const INITIAL_PRODUCT_REVIEWS: Record<string, ProductReviewItem[]> = {
  'dm-prod-1': [
    {
      id: 'rev-101',
      productId: 'dm-prod-1',
      reviewerName: 'Suresh Reddy',
      city: 'Hyderabad',
      rating: 5,
      title: 'Best 5G phone under ₹15,000 — Open-Box delivery verified!',
      comment:
        'Ordered with old phone exchange and UPI payment. Delivery rider arrived in 40 minutes, did Open-Box inspection in front of me, and checked my old phone in 2 minutes. AMOLED display and 67W charger are super fast.',
      conditionTag: 'Open-Box Verified · Value for Money',
      verifiedPurchase: true,
      purchasedVariant: '8GB + 256GB',
      dateLabel: '2 days ago',
      helpfulCount: 34,
    },
    {
      id: 'rev-102',
      productId: 'dm-prod-1',
      reviewerName: 'Priya Sharma',
      city: 'Bengaluru',
      rating: 5,
      title: 'Saved ₹4,500 off MRP + ₹150 UPI discount',
      comment:
        'Battery easily lasts 2 full days and camera OIS is crisp at night. Comes with GST invoice and 1-year brand warranty just like Amazon/Flipkart.',
      conditionTag: 'Genuine Product · 1-Yr Warranty',
      verifiedPurchase: true,
      purchasedVariant: '8GB + 128GB',
      dateLabel: '5 days ago',
      helpfulCount: 19,
    },
    {
      id: 'rev-103',
      productId: 'dm-prod-1',
      reviewerName: 'Manoj Kulkarni',
      city: 'Pune',
      rating: 4,
      title: 'Solid performance and clean 5G reception',
      comment:
        'Very smooth 120Hz display. Cash on Delivery option was convenient and I paid via QR to the delivery partner after checking the box.',
      conditionTag: 'Fast Local Delivery',
      verifiedPurchase: true,
      purchasedVariant: '8GB + 256GB',
      dateLabel: '1 week ago',
      helpfulCount: 11,
    },
  ],
  'dm-prod-2': [
    {
      id: 'rev-201',
      productId: 'dm-prod-2',
      reviewerName: 'Dr. Kavitha Menon',
      city: 'Bengaluru',
      rating: 5,
      title: 'Authentic Nilambur teak wood and tight cane weaving',
      comment:
        'Much better finish than big furniture portals. The carpenter rider also picked up my old plastic chairs for ₹1,800 exchange discount.',
      conditionTag: 'Premium Wood Finish · Exchange Verified',
      verifiedPurchase: true,
      purchasedVariant: 'Natural Teak Matte',
      dateLabel: '3 days ago',
      helpfulCount: 27,
    },
  ],
  'dm-prod-3': [
    {
      id: 'rev-301',
      productId: 'dm-prod-3',
      reviewerName: 'Lakshmi Narayana',
      city: 'Vijayawada',
      rating: 5,
      title: 'Pure wood-pressed groundnut oil aroma and thick forest honey',
      comment:
        'Packed in thick glass bottles with zero plastic smell. Delivered in 25 minutes from local hub at wholesale FPO offer price.',
      conditionTag: '100% Pure & Fresh · Sealed Glass Pack',
      verifiedPurchase: true,
      purchasedVariant: 'Family Pack (4.5 kg)',
      dateLabel: 'Yesterday',
      helpfulCount: 42,
    },
  ],
};

export interface MarketplaceConditionRule {
  badge: string;
  title: string;
  detail: string;
}

export function getMarketplaceConditionsForProduct(
  product: ProductItem
): MarketplaceConditionRule[] {
  const isFashion = product.category === 'Fashion' || product.category === 'Beauty';
  const isGrocery = product.category === 'Grocery' || product.category === 'Pet Care';
  const isElectronics = product.category === 'Electronics';

  return [
    {
      badge: '7-Day Replacement / Return',
      title: isGrocery
        ? 'Doorstep Freshness & Instant Replacement'
        : isFashion
        ? '7-Day Size Exchange & Easy Return (Myntra / Meesho Style)'
        : '7-Day Easy Replacement & Refund Policy (Amazon / Flipkart Style)',
      detail: isGrocery
        ? 'Inspect seal & expiry at delivery. Instant no-questions replacement or UPI refund if damaged.'
        : isFashion
        ? 'Keep original brand tag & unwashed condition for free doorstep size exchange or instant refund.'
        : 'Eligible for free 7-day doorstep replacement or refund if item has any manufacturing defect, with original box & accessories.',
    },
    {
      badge: 'Open-Box Delivery',
      title: 'Verified Open-Box Inspection at Doorstep',
      detail:
        'Delivery partner opens the package in front of you so you can verify the physical condition, model, and accessories before accepting.',
    },
    {
      badge: 'Lowest Offer Price Guarantee',
      title: 'Direct Hub Pricing + UPI / Card / Cash on Delivery',
      detail: `Offer Price ₹${product.price.toLocaleString(
        'en-IN'
      )} vs Original MRP ₹${product.mrp.toLocaleString(
        'en-IN'
      )}. Eligible for Cash on Delivery (COD), RuPay/Visa Cards, and Instant UPI QR.`,
    },
    {
      badge: isElectronics ? '1-Year Brand Warranty' : 'Quality Assured',
      title: isElectronics
        ? '1-Year Authorised Warranty + GST Tax Invoice'
        : '32-Point Quality Checked + GST Invoice',
      detail:
        'Includes official GST invoice and DharmaMart Buyer Protection from dispatch to doorstep delivery.',
    },
  ];
}

interface CustomerReviewsAndConditionsProps {
  product: ProductItem;
  reviews: ProductReviewItem[];
  onAddReview: (productId: string, review: ProductReviewItem) => void;
  onMarkHelpful: (productId: string, reviewId: string) => void;
}

const CONDITION_TAG_OPTIONS = [
  'Value for Money · Genuine Product',
  'Open-Box Delivery Verified',
  'True to Size & Specifications',
  'Fast Local Delivery · Neat Packaging',
  'Lowest Offer Price vs MRP',
];

export const CustomerReviewsAndConditions: React.FC<CustomerReviewsAndConditionsProps> = ({
  product,
  reviews,
  onAddReview,
  onMarkHelpful,
}) => {
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');
  const [showWriteForm, setShowWriteForm] = useState(false);

  // Review submission form states
  const [newRating, setNewRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewerName, setReviewerName] = useState('Anil Kumar');
  const [reviewerCity, setReviewerCity] = useState('Hyderabad');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [conditionTag, setConditionTag] = useState(CONDITION_TAG_OPTIONS[0]);
  const [purchasedVariant, setPurchasedVariant] = useState(
    product.variants[0] || 'Standard'
  );
  const [reviewPhotoUrl, setReviewPhotoUrl] = useState<string>('');
  const [submittedNotice, setSubmittedNotice] = useState(false);

  const conditions = useMemo(
    () => getMarketplaceConditionsForProduct(product),
    [product]
  );

  // Compute aggregate rating & 5-star to 1-star breakdown
  const stats = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (reviews.length === 0) {
      return {
        avg: 4.8,
        total: 0,
        counts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }
    let sum = 0;
    for (const r of reviews) {
      const clamped = Math.min(5, Math.max(1, Math.round(r.rating)));
      counts[clamped] = (counts[clamped] || 0) + 1;
      sum += clamped;
    }
    return {
      avg: Number((sum / reviews.length).toFixed(1)),
      total: reviews.length,
      counts,
    };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    if (starFilter === 'all') return reviews;
    return reviews.filter((r) => Math.round(r.rating) === starFilter);
  }, [reviews, starFilter]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setReviewPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    const created: ProductReviewItem = {
      id: `rev-${Date.now()}`,
      productId: product.id,
      reviewerName: reviewerName.trim() || 'Verified Shopper',
      city: reviewerCity.trim() || 'India',
      rating: newRating,
      title:
        reviewTitle.trim() ||
        (newRating >= 4
          ? 'Great quality and genuine Offer Price savings!'
          : 'Honest feedback on product'),
      comment: reviewComment.trim(),
      conditionTag,
      verifiedPurchase: true,
      purchasedVariant,
      dateLabel: 'Just now',
      helpfulCount: 1,
      photoUrl: reviewPhotoUrl || undefined,
    };

    onAddReview(product.id, created);
    setReviewTitle('');
    setReviewComment('');
    setReviewPhotoUrl('');
    setShowWriteForm(false);
    setSubmittedNotice(true);
    setTimeout(() => setSubmittedNotice(false), 3500);
  };

  return (
    <div className="border-t border-stone-200 bg-[#FAF9F6] p-6 sm:p-8 space-y-8">
      {/* PART 1: AMAZON / FLIPKART / MEESHO / MYNTRA MARKETPLACE BUYER CONDITIONS */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#146C32]">
              Verified Marketplace Terms & Buyer Protection
            </span>
            <h3 className="text-base font-semibold text-stone-900">
              Purchase, Delivery, Replacement & Return Conditions (Amazon · Flipkart · Meesho · Myntra Standard)
            </h3>
          </div>
          <span className="text-xs font-semibold text-stone-600 bg-white px-3 py-1 rounded-md border border-stone-200">
            100% Buyer Protected · GST Invoice Included
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {conditions.map((cond, idx) => (
            <div
              key={cond.badge}
              className="bg-white rounded-xl border border-stone-200/90 p-4 space-y-1.5"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-[#146C32]">
                {idx === 0 ? (
                  <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                ) : idx === 1 ? (
                  <Truck className="w-3.5 h-3.5 shrink-0" />
                ) : idx === 2 ? (
                  <Award className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{cond.badge}</span>
              </div>
              <h4 className="text-xs font-semibold text-stone-900 leading-snug">
                {cond.title}
              </h4>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                {cond.detail}
              </p>
            </div>
          ))}
        </div>

        {/* Return & Refund Eligibility Checklist */}
        <div className="bg-white rounded-xl border border-stone-200/80 p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600">
          <div className="flex items-center gap-2 font-semibold text-stone-900">
            <FileText className="w-4 h-4 text-[#E86A17]" />
            <span>Return & Exchange Conditions Checklist:</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-[#146C32]" /> Original Box, Tags & MRP Label Intact
            </span>
            <span className="inline-flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-[#146C32]" /> IMEI / Serial / Seal Matched at Pickup
            </span>
            <span className="inline-flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-[#146C32]" /> Instant UPI / Card / Bank Refund at Pickup
            </span>
          </div>
        </div>
      </div>

      {/* PART 2: CUSTOMER REVIEWS & STAR RATING BREAKDOWN */}
      <div className="space-y-6 pt-4 border-t border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-stone-900">
              Customer Ratings & Verified Reviews ({stats.total})
            </h3>
            <p className="text-xs text-stone-500">
              Verified buyers who purchased via UPI QR, RuPay/Card, or Cash on Delivery
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowWriteForm((v) => !v)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#146C32] hover:bg-[#0F5426] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            <Star className="w-3.5 h-3.5 fill-white" />
            <span>{showWriteForm ? 'Close Review Form' : 'Write a Customer Review'}</span>
          </button>
        </div>

        {submittedNotice && (
          <div className="p-3.5 rounded-xl bg-[#146C32] text-white text-xs font-semibold flex items-center justify-between">
            <span>
              ✓ Thank you! Your verified star rating and customer review have been published below.
            </span>
          </div>
        )}

        {/* WRITE A CUSTOMER REVIEW FORM */}
        {showWriteForm && (
          <form
            onSubmit={handleSubmitReview}
            className="bg-white rounded-xl border-2 border-[#146C32]/30 p-5 space-y-4 text-xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
              <h4 className="text-sm font-semibold text-stone-900">
                Rate & Review: {product.name}
              </h4>
              <span className="text-stone-500">
                Verified Buyer Review · Offer ₹{product.price.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Interactive 1-5 Star Selector */}
            <div className="space-y-1.5">
              <label className="block font-semibold text-stone-700">
                1. Your Overall Star Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hoverRating ?? newRating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setNewRating(star)}
                      className={`p-2 rounded-lg border transition-colors flex items-center gap-1 font-semibold ${
                        active
                          ? 'border-[#E86A17] bg-[#E86A17]/10 text-[#E86A17]'
                          : 'border-stone-200 bg-stone-50 text-stone-400'
                      }`}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          active ? 'fill-[#E86A17] text-[#E86A17]' : ''
                        }`}
                      />
                      <span>{star}★</span>
                    </button>
                  );
                })}
                <span className="ml-2 font-semibold text-stone-700">
                  {newRating === 5
                    ? 'Excellent (5/5)'
                    : newRating === 4
                    ? 'Very Good (4/5)'
                    : newRating === 3
                    ? 'Good (3/5)'
                    : newRating === 2
                    ? 'Fair (2/5)'
                    : 'Needs Improvement (1/5)'}
                </span>
              </div>
            </div>

            {/* Reviewer Details & Variant */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  City / Location
                </label>
                <input
                  type="text"
                  required
                  value={reviewerCity}
                  onChange={(e) => setReviewerCity(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Purchased Variant
                </label>
                <select
                  value={purchasedVariant}
                  onChange={(e) => setPurchasedVariant(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs"
                >
                  {product.variants.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Condition / Experience Tag */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Product Condition & Delivery Experience
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CONDITION_TAG_OPTIONS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setConditionTag(tag)}
                    className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                      conditionTag === tag
                        ? 'bg-[#146C32] text-white font-semibold'
                        : 'bg-[#FAF9F6] border border-stone-200 text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-stone-700 mb-1">
                  Review Title / Headline
                </label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="e.g., Super fast delivery and genuine product at best Offer Price!"
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Add Product Photo (Optional)
                </label>
                <label className="flex items-center justify-center gap-1.5 w-full rounded-lg border border-dashed border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-[#146C32]" />
                  <span>{reviewPhotoUrl ? 'Photo Attached ✓' : 'Upload Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Written Review (Quality, Value for Money, Open-Box Experience)
              </label>
              <textarea
                rows={3}
                required
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience with product quality, Offer Price savings, packaging, or exchange..."
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs focus:border-[#146C32] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowWriteForm(false)}
                className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-[#146C32] hover:bg-[#0F5426] text-white font-semibold"
              >
                Submit Verified Review
              </button>
            </div>
          </form>
        )}

        {/* RATING SUMMARY HISTOGRAM + REVIEWS LIST */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 4 Cols: Amazon/Flipkart Histogram */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-stone-200/90 p-5 space-y-4 h-fit">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-stone-900 font-mono-tabular flex items-center gap-1">
                  <span>{stats.avg}</span>
                  <Star className="w-6 h-6 fill-[#E86A17] text-[#E86A17]" />
                </div>
                <span className="text-[11px] text-stone-500">
                  {stats.total} Verified Ratings
                </span>
              </div>

              <div className="flex-1 space-y-1.5 text-xs">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = stats.counts[star] || 0;
                  const pct =
                    stats.total > 0 ? Math.round((count / stats.total) * 100) : star === 5 ? 80 : star === 4 ? 20 : 0;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setStarFilter((prev) => (prev === star ? 'all' : star))
                      }
                      className="w-full flex items-center gap-2 hover:opacity-80"
                    >
                      <span className="w-7 text-right font-mono-tabular font-semibold text-stone-700">
                        {star} ★
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-stone-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            star >= 4
                              ? 'bg-[#146C32]'
                              : star === 3
                              ? 'bg-[#E86A17]'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-9 text-right font-mono-tabular text-[11px] text-stone-500">
                        {pct}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sub-scores (Flipkart / Myntra style) */}
            <div className="pt-3 border-t border-stone-100 grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-[#FAF9F6]">
                <span className="text-stone-500 block text-[11px]">Value for Offer Price</span>
                <span className="font-mono-tabular font-bold text-[#146C32]">4.9 / 5</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FAF9F6]">
                <span className="text-stone-500 block text-[11px]">Product Quality</span>
                <span className="font-mono-tabular font-bold text-[#146C32]">4.8 / 5</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FAF9F6]">
                <span className="text-stone-500 block text-[11px]">Open-Box Delivery</span>
                <span className="font-mono-tabular font-bold text-[#146C32]">4.9 / 5</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FAF9F6]">
                <span className="text-stone-500 block text-[11px]">Seller Packaging</span>
                <span className="font-mono-tabular font-bold text-[#146C32]">4.8 / 5</span>
              </div>
            </div>
          </div>

          {/* Right 8 Cols: Customer Reviews Feed */}
          <div className="lg:col-span-8 space-y-3">
            {/* Star Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: 'all', label: `All Reviews (${stats.total})` },
                  { id: 5, label: '5 ★' },
                  { id: 4, label: '4 ★' },
                  { id: 3, label: '3 ★' },
                ] as const
              ).map((f) => (
                <button
                  key={String(f.id)}
                  type="button"
                  onClick={() => setStarFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    starFilter === f.id
                      ? 'bg-stone-900 text-white'
                      : 'bg-white border border-stone-200 text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {filteredReviews.length === 0 ? (
              <div className="bg-white rounded-xl border border-stone-200 p-6 text-center space-y-2">
                <p className="text-xs text-stone-500">
                  No reviews match this filter yet. Be the first to share your feedback!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStarFilter('all');
                    setShowWriteForm(true);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#146C32] text-white text-xs font-semibold"
                >
                  Write First Review
                </button>
              </div>
            ) : (
              filteredReviews.map((rev) => (
                <article
                  key={rev.id}
                  className="bg-white rounded-xl border border-stone-200/90 p-5 space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold text-white font-mono-tabular ${
                          rev.rating >= 4
                            ? 'bg-[#146C32]'
                            : rev.rating === 3
                            ? 'bg-[#E86A17]'
                            : 'bg-red-600'
                        }`}
                      >
                        {rev.rating} ★
                      </span>
                      <h4 className="text-sm font-semibold text-stone-900">
                        {rev.title}
                      </h4>
                    </div>
                    <span className="text-[11px] text-stone-400">{rev.dateLabel}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-500">
                    <span className="font-semibold text-stone-700">{rev.reviewerName}</span>
                    <span>·</span>
                    <span>{rev.city}</span>
                    {rev.verifiedPurchase && (
                      <>
                        <span>·</span>
                        <span className="text-[#146C32] font-semibold inline-flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Certified Buyer
                        </span>
                      </>
                    )}
                    <span>·</span>
                    <span>Variant: {rev.purchasedVariant}</span>
                  </div>

                  <p className="text-xs text-stone-700 leading-relaxed">{rev.comment}</p>

                  {rev.photoUrl && (
                    <div className="pt-1">
                      <img
                        src={rev.photoUrl}
                        alt="Customer review upload"
                        className="h-20 w-20 object-cover rounded-lg border border-stone-200"
                      />
                    </div>
                  )}

                  <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <span className="text-stone-500 font-medium">
                      Condition Verified: <strong className="text-stone-700">{rev.conditionTag}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => onMarkHelpful(product.id, rev.id)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FAF9F6] hover:bg-stone-200/70 text-stone-700 font-semibold transition-colors"
                    >
                      <ThumbsUp className="w-3 h-3 text-[#146C32]" />
                      <span>Helpful ({rev.helpfulCount})</span>
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
