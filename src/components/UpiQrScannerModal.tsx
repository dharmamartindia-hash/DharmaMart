import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import jsQR from 'jsqr';
import {
  X,
  Camera,
  RefreshCw,
  Upload,
  Check,
  QrCode,
  ShieldCheck,
  ArrowRight,
  CreditCard,
  BarChart3,
  Banknote,
} from 'lucide-react';

export interface UpiMerchantData {
  pa: string; // Payee VPA (e.g. sri.venkateswara@okaxis)
  pn: string; // Payee Name
  am?: string; // Amount in INR
  tn?: string; // Transaction Note
  mc?: string; // Merchant category/code
  rawUri: string;
  isPartnerStore: boolean;
  partnerLocation?: string;
  cashbackInr?: number;
}

export interface PaymentTransactionRecord {
  id: string;
  referenceNumber: string; // UTR for UPI, Auth Code for Card, or COD-Token for Cash on Delivery
  merchantName: string;
  merchantIdentifier: string; // VPA, Masked Card, or COD Verification Phone/PIN
  amountInr: number;
  cashbackEarned: number;
  channel: 'UPI QR' | 'Card' | 'COD';
  instrumentLabel: string; // e.g. "GPay · UPI QR", "RuPay Platinum •••• 4821", "Cash on Delivery (COD)"
  note: string;
  timestamp: string;
  dateLabel: string;
  partnerLocation: string;
}

interface UpiQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (tx: PaymentTransactionRecord) => void;
  defaultAmount?: number;
  initialMode?: 'upi' | 'card' | 'cod';
}

export const PARTNER_STORE_PRESETS: UpiMerchantData[] = [
  {
    pa: 'venkateswara.digital@okicici',
    pn: 'Sri Venkateswara Digital & Kirana',
    am: '450',
    tn: 'In-Store Counter / Local Delivery',
    rawUri:
      'upi://pay?pa=venkateswara.digital@okicici&pn=Sri%20Venkateswara%20Digital%20%26%20Kirana&am=450&tn=In-Store%20Counter%20Purchase&cu=INR',
    isPartnerStore: true,
    partnerLocation: 'Madhapur, Hyderabad · 500081',
    cashbackInr: 25,
  },
  {
    pa: 'godavari.organic@ybl',
    pn: 'Godavari Rythu Organic Farm Store',
    am: '680',
    tn: 'Fresh Cold-Pressed Oil & Spices',
    rawUri:
      'upi://pay?pa=godavari.organic@ybl&pn=Godavari%20Rythu%20Organic%20Farm%20Store&am=680&tn=Fresh%20Cold-Pressed%20Oil%20%26%20Spices&cu=INR',
    isPartnerStore: true,
    partnerLocation: 'Jubilee Hills, Hyderabad · 500033',
    cashbackInr: 35,
  },
  {
    pa: 'kovai.woodworks@hdfcbank',
    pn: 'Kovai Heritage Woodworks & Decor',
    am: '2400',
    tn: 'Custom Cane Chair Booking',
    rawUri:
      'upi://pay?pa=kovai.woodworks@hdfcbank&pn=Kovai%20Heritage%20Woodworks%20%26%20Decor&am=2400&tn=Advance%20for%20Custom%20Cane%20Chair&cu=INR',
    isPartnerStore: true,
    partnerLocation: 'Indiranagar, Bengaluru · 560038',
    cashbackInr: 75,
  },
  {
    pa: 'deccan.quickfix@paytm',
    pn: 'Deccan Electricals & Mobile Repair Hub',
    am: '350',
    tn: 'Tempered Glass & Fast Charger',
    rawUri:
      'upi://pay?pa=deccan.quickfix@paytm&pn=Deccan%20Electricals%20%26%20Mobile%20Repair%20Hub&am=350&tn=Tempered%20Glass%20%26%20Fast%20Charger&cu=INR',
    isPartnerStore: true,
    partnerLocation: 'Kothrud, Pune · 411038',
    cashbackInr: 20,
  },
];

export const INITIAL_TRANSACTIONS: PaymentTransactionRecord[] = [
  {
    id: 'tx-101',
    referenceNumber: 'UTR-427391804211',
    merchantName: 'Sri Venkateswara Digital & Kirana',
    merchantIdentifier: 'venkateswara.digital@okicici',
    amountInr: 1450,
    cashbackEarned: 35,
    channel: 'UPI QR',
    instrumentLabel: 'GPay · UPI QR Scan',
    note: 'Smart Plug & Pantry Groceries',
    timestamp: 'Sep 24 · 06:42 PM',
    dateLabel: 'Sep 24',
    partnerLocation: 'Madhapur, Hyderabad',
  },
  {
    id: 'tx-102',
    referenceNumber: 'AUTH-984120',
    merchantName: 'Kovai Heritage Woodworks & Decor',
    merchantIdentifier: 'RuPay Platinum •••• 4821',
    amountInr: 8900,
    cashbackEarned: 150,
    channel: 'Card',
    instrumentLabel: 'RuPay Platinum •••• 4821',
    note: 'Malabar Handcrafted Teak & Cane Chair',
    timestamp: 'Sep 25 · 02:15 PM',
    dateLabel: 'Sep 25',
    partnerLocation: 'Indiranagar, Bengaluru',
  },
  {
    id: 'tx-103',
    referenceNumber: 'COD-883419',
    merchantName: 'Godavari Rythu Organic Farm Store',
    merchantIdentifier: 'COD · Verified +91 98480 12345',
    amountInr: 1180,
    cashbackEarned: 15,
    channel: 'COD',
    instrumentLabel: 'Cash on Delivery (Exact Cash)',
    note: 'Cold-Pressed Oil & Wild Forest Honey',
    timestamp: 'Sep 26 · 11:20 AM',
    dateLabel: 'Sep 26',
    partnerLocation: 'Jubilee Hills, Hyderabad',
  },
  {
    id: 'tx-104',
    referenceNumber: 'AUTH-773491',
    merchantName: 'Deccan Athletics & Sports Hub',
    merchantIdentifier: 'Visa Signature •••• 9034',
    amountInr: 2890,
    cashbackEarned: 60,
    channel: 'Card',
    instrumentLabel: 'Visa Signature •••• 9034',
    note: 'Kashmir Willow Bat & Cork Yoga Kit',
    timestamp: 'Sep 27 · 05:10 PM',
    dateLabel: 'Sep 27',
    partnerLocation: 'MG Road, Bengaluru',
  },
  {
    id: 'tx-105',
    referenceNumber: 'UTR-427399201145',
    merchantName: 'Deccan Electricals & Mobile Repair',
    merchantIdentifier: 'deccan.quickfix@paytm',
    amountInr: 699,
    cashbackEarned: 20,
    channel: 'UPI QR',
    instrumentLabel: 'BHIM · UPI QR Scan',
    note: 'Doorstep Mobile Battery Service',
    timestamp: 'Sep 28 · 04:05 PM',
    dateLabel: 'Sep 28',
    partnerLocation: 'Kothrud, Pune',
  },
];

/**
 * Parses standard Indian UPI QR strings (`upi://pay?pa=...&pn=...`) or BharatQR payloads
 */
export function parseUpiQrPayload(raw: string): UpiMerchantData {
  const trimmed = raw.trim();

  if (trimmed.toLowerCase().startsWith('upi://')) {
    try {
      const url = new URL(trimmed);
      const params = url.searchParams;
      const pa = params.get('pa') || 'merchant@upi';
      const pn = decodeURIComponent(params.get('pn') || 'DharmaMart Local Partner');
      const am = params.get('am') || undefined;
      const tn = decodeURIComponent(params.get('tn') || 'Local Partner Store Payment');
      const mc = params.get('mc') || undefined;

      const matchedPreset = PARTNER_STORE_PRESETS.find(
        (p) => p.pa.toLowerCase() === pa.toLowerCase()
      );

      return {
        pa,
        pn,
        am,
        tn,
        mc,
        rawUri: trimmed,
        isPartnerStore: true,
        partnerLocation:
          matchedPreset?.partnerLocation || 'Verified ONDC / DharmaMart Local Partner',
        cashbackInr: matchedPreset?.cashbackInr ?? 25,
      };
    } catch {
      // Fall through to generic parser
    }
  }

  if (trimmed.includes('@') && !trimmed.includes(' ')) {
    const shopPrefix = trimmed.split('@')[0].replace(/[._-]/g, ' ');
    const formattedName = shopPrefix
      .split(' ')
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ''))
      .join(' ');
    return {
      pa: trimmed,
      pn: `${formattedName} Store`,
      tn: 'DharmaMart Local Store Scan & Pay',
      rawUri: `upi://pay?pa=${encodeURIComponent(trimmed)}&pn=${encodeURIComponent(
        formattedName
      )}&cu=INR`,
      isPartnerStore: true,
      partnerLocation: 'Verified Local Merchant',
      cashbackInr: 20,
    };
  }

  return {
    pa: 'partner.store@okaxis',
    pn: trimmed.slice(0, 42) || 'DharmaMart Verified Partner Shop',
    tn: 'Scanned Shop QR Payment',
    rawUri: trimmed,
    isPartnerStore: true,
    partnerLocation: 'Neighbourhood Partner Counter',
    cashbackInr: 20,
  };
}

export const UpiQrScannerModal: React.FC<UpiQrScannerModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
  defaultAmount,
  initialMode = 'upi',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scanIntervalRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraStatus, setCameraStatus] = useState<'starting' | 'active' | 'denied' | 'stopped'>(
    'starting'
  );
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Scanned Merchant & Payment State
  const [scannedMerchant, setScannedMerchant] = useState<UpiMerchantData | null>(null);
  const [paymentTab, setPaymentTab] = useState<'upi' | 'card' | 'cod'>(initialMode);
  const [amountInput, setAmountInput] = useState<string>(
    defaultAmount ? String(defaultAmount) : '450'
  );
  const [noteInput, setNoteInput] = useState<string>('In-Store / Local Partner Order');

  // UPI instrument state
  const [selectedUpiApp, setSelectedUpiApp] = useState<'GPay' | 'PhonePe' | 'Paytm' | 'BHIM'>(
    'GPay'
  );

  // Card instrument state
  const [cardNetwork, setCardNetwork] = useState<
    'RuPay Platinum' | 'Visa Signature' | 'Mastercard World'
  >('RuPay Platinum');
  const [cardNumber, setCardNumber] = useState('6078 4500 9218 4821');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('842');
  const [cardHolder, setCardHolder] = useState('RAMESH KUMAR');

  // Cash on Delivery (COD) state
  const [codPhone, setCodPhone] = useState('+91 98480 12345');
  const [codAddress, setCodAddress] = useState(
    'Flat 302, Green Valley Residency, Madhapur · 500081'
  );
  const [codChangeNote, setCodChangeNote] = useState<
    'Exact Cash Ready' | 'Bring Change for ₹500' | 'Pay Rider via UPI/Cash at Door'
  >('Exact Cash Ready');

  // Security PIN / Bank OTP step
  const [authStep, setAuthStep] = useState(false);
  const [authPinOrOtp, setAuthPinOrOtp] = useState('');
  const [completedTx, setCompletedTx] = useState<PaymentTransactionRecord | null>(null);

  useEffect(() => {
    setPaymentTab(initialMode);
  }, [initialMode]);

  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) {
      window.clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraStatus('stopped');
  }, []);

  const handleDetectedQrString = useCallback(
    (rawText: string) => {
      stopCamera();
      const parsed = parseUpiQrPayload(rawText);
      setScannedMerchant(parsed);
      if (parsed.am) {
        setAmountInput(parsed.am);
      } else if (defaultAmount) {
        setAmountInput(String(defaultAmount));
      }
      if (parsed.tn) {
        setNoteInput(parsed.tn);
      }
      setCompletedTx(null);
      setAuthStep(false);
    },
    [defaultAmount, stopCamera]
  );

  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraStatus('starting');
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraStatus('denied');
      setCameraError(
        'Camera API is not available in this browser context. Upload a QR image or select a Partner Store QR below.'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraStatus('active');

      scanIntervalRef.current = window.setInterval(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
          return;
        }
        const width = video.videoWidth;
        const height = video.videoHeight;
        if (width === 0 || height === 0) return;

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        ctx.drawImage(video, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          handleDetectedQrString(code.data);
        }
      }, 120);
    } catch (err: unknown) {
      setCameraStatus('denied');
      const msg =
        err instanceof Error
          ? err.message
          : 'Camera permission was declined or no camera hardware was found.';
      setCameraError(
        `${msg} — You can upload a shop QR photo or select a live partner store QR below.`
      );
    }
  }, [facingMode, handleDetectedQrString, stopCamera]);

  useEffect(() => {
    if (isOpen && !scannedMerchant && !completedTx) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, scannedMerchant, completedTx, startCamera, stopCamera]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code && code.data) {
          handleDetectedQrString(code.data);
        } else {
          handleDetectedQrString(PARTNER_STORE_PRESETS[0].rawUri);
        }
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedMerchant) return;

    const numericAmount = Math.max(1, Number(amountInput) || 450);
    if (!authStep) {
      setAuthStep(true);
      return;
    }

    const last4 = cardNumber.replace(/\s+/g, '').slice(-4) || '4821';
    const channel: 'UPI QR' | 'Card' | 'COD' =
      paymentTab === 'card' ? 'Card' : paymentTab === 'cod' ? 'COD' : 'UPI QR';

    const tx: PaymentTransactionRecord = {
      id: `tx-${Date.now()}`,
      referenceNumber:
        channel === 'Card'
          ? `AUTH-${Math.floor(100000 + Math.random() * 900000)}`
          : channel === 'COD'
          ? `COD-${Math.floor(100000 + Math.random() * 900000)}`
          : `UTR-4273${Math.floor(10000000 + Math.random() * 90000000)}`,
      merchantName: scannedMerchant.pn,
      merchantIdentifier:
        channel === 'Card'
          ? `${cardNetwork} •••• ${last4}`
          : channel === 'COD'
          ? `COD · Verified ${codPhone}`
          : scannedMerchant.pa,
      amountInr: numericAmount,
      cashbackEarned:
        channel === 'COD' ? 15 : scannedMerchant.cashbackInr ?? 25,
      channel,
      instrumentLabel:
        channel === 'Card'
          ? `${cardNetwork} •••• ${last4}`
          : channel === 'COD'
          ? `Cash on Delivery (${codChangeNote})`
          : `${selectedUpiApp} · UPI QR Scan`,
      note:
        channel === 'COD'
          ? `${noteInput.trim()} · ${codAddress}`
          : noteInput.trim() || 'Local Partner Store Purchase',
      timestamp: `Today · ${new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`,
      dateLabel: 'Today',
      partnerLocation: scannedMerchant.partnerLocation || 'Verified Local Partner',
    };

    setCompletedTx(tx);
    onPaymentSuccess(tx);
  };

  const resetScanner = () => {
    setScannedMerchant(null);
    setCompletedTx(null);
    setAuthStep(false);
    setAuthPinOrOtp('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upi-qr-scanner-title"
    >
      <div className="w-full max-w-xl rounded-2xl bg-[#FAF9F6] border border-stone-200 shadow-2xl overflow-hidden my-6">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-stone-200">
          <div className="flex items-center gap-2.5">
            <QrCode className="w-5 h-5 text-[#146C32]" />
            <div>
              <h2
                id="upi-qr-scanner-title"
                className="text-base font-semibold text-stone-900"
              >
                DharmaMart Scan & Pay — UPI QR, Card & Cash on Delivery
              </h2>
              <p className="text-xs text-stone-500">
                Scan shop QR code for Instant UPI, RuPay/Visa Card, or Doorstep Cash on Delivery
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            aria-label="Close QR Scanner"
            className="p-2 text-stone-400 hover:text-stone-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          {/* STATE 1: LIVE CAMERA VIEWFINDER */}
          {!scannedMerchant && !completedTx && (
            <>
              <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-stone-950 border border-stone-800 flex flex-col items-center justify-center">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${
                    cameraStatus === 'active' ? 'opacity-100' : 'opacity-20'
                  }`}
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Viewfinder Targeting Reticle */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                  <div className="relative w-56 h-56 rounded-2xl border-2 border-[#146C32] shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                    <div className="absolute -top-0.5 -left-0.5 w-6 h-6 border-t-4 border-l-4 border-[#FF8C3B] rounded-tl-lg" />
                    <div className="absolute -top-0.5 -right-0.5 w-6 h-6 border-t-4 border-r-4 border-[#FF8C3B] rounded-tr-lg" />
                    <div className="absolute -bottom-0.5 -left-0.5 w-6 h-6 border-b-4 border-l-4 border-[#FF8C3B] rounded-bl-lg" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 border-b-4 border-r-4 border-[#FF8C3B] rounded-br-lg" />
                    {cameraStatus === 'active' && (
                      <div className="absolute inset-x-3 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-[#FF8C3B] to-transparent animate-pulse" />
                    )}
                  </div>
                  <p className="mt-4 text-xs font-medium text-white bg-black/60 px-3 py-1 rounded-md">
                    {cameraStatus === 'active'
                      ? 'Align shop UPI / BharatQR code within frame to scan automatically'
                      : cameraStatus === 'starting'
                      ? 'Starting camera lens...'
                      : 'Camera paused — use QR photo upload or Partner Store presets below'}
                  </p>
                </div>

                {/* Camera Controls Overlay */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFacingMode((prev) =>
                        prev === 'environment' ? 'user' : 'environment'
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/70 hover:bg-black text-white text-xs font-medium transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Flip Lens</span>
                  </button>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#146C32] hover:bg-[#0F5426] text-white text-xs font-semibold cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload QR Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {cameraError && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3">
                  <span>{cameraError}</span>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-900 text-white font-semibold whitespace-nowrap shrink-0"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Retry Camera
                  </button>
                </div>
              )}

              {/* Instant Partner Store QR Simulation Presets */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span className="font-semibold text-stone-800">
                    Or Select a Nearby DharmaMart Partner Shop QR (UPI / Card / COD):
                  </span>
                  <span>Instant ₹15–₹75 Rewards</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PARTNER_STORE_PRESETS.map((preset) => (
                    <button
                      key={preset.pa}
                      type="button"
                      onClick={() => handleDetectedQrString(preset.rawUri)}
                      className="text-left p-3.5 rounded-xl bg-white hover:bg-[#F3F2EE] border border-stone-200/90 transition-colors flex flex-col justify-between gap-1.5 group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-stone-900 group-hover:text-[#146C32] truncate">
                          {preset.pn}
                        </span>
                        <span className="text-xs font-mono-tabular font-semibold text-[#146C32] shrink-0">
                          ₹{preset.am}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-500 flex items-center gap-1.5 truncate">
                        <span className="font-mono-tabular">{preset.pa}</span>
                        <span aria-hidden="true">·</span>
                        <span>+₹{preset.cashbackInr} Cashback</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* STATE 2: SCANNED MERCHANT VERIFICATION + UPI, CARD, OR CASH ON DELIVERY */}
          {scannedMerchant && !completedTx && (
            <form onSubmit={handleConfirmPayment} className="space-y-5">
              <div className="p-5 rounded-xl bg-white border border-stone-200 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-[#146C32] font-semibold">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verified DharmaMart & ONDC Partner Merchant</span>
                    </div>
                    <h3 className="text-lg font-semibold text-stone-900 mt-1">
                      {scannedMerchant.pn}
                    </h3>
                    <p className="text-xs text-stone-500 font-mono-tabular">
                      Merchant ID: {scannedMerchant.pa} · {scannedMerchant.partnerLocation}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={resetScanner}
                    className="text-xs font-semibold text-stone-500 hover:text-stone-900 underline whitespace-nowrap"
                  >
                    Rescan QR
                  </button>
                </div>

                {/* 3-Way Payment Mode Switcher: Instant UPI vs Card Transaction vs Cash on Delivery */}
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F3F2EE] rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentTab('upi');
                      setAuthStep(false);
                    }}
                    className={`py-2 px-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
                      paymentTab === 'upi'
                        ? 'bg-white text-[#146C32] shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5 shrink-0" />
                    <span>Instant UPI</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentTab('card');
                      setAuthStep(false);
                    }}
                    className={`py-2 px-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
                      paymentTab === 'card'
                        ? 'bg-white text-[#146C32] shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5 shrink-0" />
                    <span>RuPay / Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentTab('cod');
                      setAuthStep(false);
                    }}
                    className={`py-2 px-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
                      paymentTab === 'cod'
                        ? 'bg-white text-[#146C32] shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Banknote className="w-3.5 h-3.5 shrink-0" />
                    <span>Cash (COD)</span>
                  </button>
                </div>

                {!authStep ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Bill Amount (₹ INR)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="100000"
                          required
                          value={amountInput}
                          onChange={(e) => setAmountInput(e.target.value)}
                          className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-lg font-semibold font-mono-tabular text-stone-900 focus:border-[#146C32] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Order / Bill Note
                        </label>
                        <input
                          type="text"
                          value={noteInput}
                          onChange={(e) => setNoteInput(e.target.value)}
                          placeholder="e.g. Counter Bill #104"
                          className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm text-stone-900 focus:border-[#146C32] focus:outline-none"
                        />
                      </div>
                    </div>

                    {paymentTab === 'upi' && (
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                          Select Installed UPI App
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {(['GPay', 'PhonePe', 'Paytm', 'BHIM'] as const).map((app) => (
                            <button
                              key={app}
                              type="button"
                              onClick={() => setSelectedUpiApp(app)}
                              className={`py-2.5 px-3 rounded-lg text-xs font-semibold border transition-colors ${
                                selectedUpiApp === app
                                  ? 'border-[#146C32] bg-[#146C32]/10 text-[#146C32]'
                                  : 'border-stone-200 bg-[#FAF9F6] text-stone-700 hover:bg-stone-100'
                              }`}
                            >
                              {app}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {paymentTab === 'card' && (
                      <div className="space-y-3 pt-1 border-t border-stone-100">
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                            Select Card Network (BharatQR Tap & Pay)
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {(
                              ['RuPay Platinum', 'Visa Signature', 'Mastercard World'] as const
                            ).map((net) => (
                              <button
                                key={net}
                                type="button"
                                onClick={() => setCardNetwork(net)}
                                className={`py-2 px-2.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap truncate ${
                                  cardNetwork === net
                                    ? 'border-[#146C32] bg-[#146C32]/10 text-[#146C32]'
                                    : 'border-stone-200 bg-[#FAF9F6] text-stone-700 hover:bg-stone-100'
                                }`}
                              >
                                {net}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                              Card Number
                            </label>
                            <input
                              type="text"
                              required
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-mono-tabular"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                              Cardholder Name
                            </label>
                            <input
                              type="text"
                              required
                              value={cardHolder}
                              onChange={(e) => setCardHolder(e.target.value)}
                              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                              Expiry (MM/YY)
                            </label>
                            <input
                              type="text"
                              required
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-mono-tabular"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                              CVV
                            </label>
                            <input
                              type="password"
                              maxLength={4}
                              required
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-mono-tabular"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentTab === 'cod' && (
                      <div className="space-y-3 pt-1 border-t border-stone-100">
                        <div className="flex items-center justify-between text-xs text-stone-600">
                          <span>Free Doorstep COD Threshold: Orders ≥ ₹499</span>
                          <span className="font-semibold text-[#146C32]">Zero Advance Needed</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                              Customer Phone (+91 OTP Verified)
                            </label>
                            <input
                              type="text"
                              required
                              value={codPhone}
                              onChange={(e) => setCodPhone(e.target.value)}
                              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-mono-tabular"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                              Cash Change Preference for Rider
                            </label>
                            <select
                              value={codChangeNote}
                              onChange={(e) =>
                                setCodChangeNote(
                                  e.target.value as
                                    | 'Exact Cash Ready'
                                    | 'Bring Change for ₹500'
                                    | 'Pay Rider via UPI/Cash at Door'
                                )
                              }
                              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs bg-white"
                            >
                              <option value="Exact Cash Ready">Exact Cash Ready</option>
                              <option value="Bring Change for ₹500">Bring Change for ₹500</option>
                              <option value="Pay Rider via UPI/Cash at Door">
                                Pay Rider via UPI/Cash at Door
                              </option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Doorstep Delivery Address & PIN Code
                          </label>
                          <input
                            type="text"
                            required
                            value={codAddress}
                            onChange={(e) => setCodAddress(e.target.value)}
                            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-4 rounded-xl bg-[#F3F2EE] space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-stone-700">
                        {paymentTab === 'upi'
                          ? `Enter 4 or 6-Digit ${selectedUpiApp} UPI PIN`
                          : paymentTab === 'card'
                          ? `Enter 6-Digit RBI 3D-Secure Bank OTP (${cardNetwork})`
                          : `Enter 4-Digit Phone Verification OTP sent to ${codPhone}`}
                      </span>
                      <span className="font-mono-tabular font-semibold text-[#146C32]">
                        ₹{(Number(amountInput) || 450).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <input
                      type="password"
                      maxLength={6}
                      autoFocus
                      required
                      value={authPinOrOtp}
                      onChange={(e) => setAuthPinOrOtp(e.target.value)}
                      placeholder="••••"
                      className="w-full text-center tracking-[0.6em] text-xl font-mono-tabular rounded-lg border border-stone-300 bg-white py-2.5 focus:border-[#146C32] focus:outline-none"
                    />
                  </div>
                )}

                <div className="p-3.5 rounded-lg bg-[#F3F2EE] flex items-center justify-between text-xs">
                  <span className="text-stone-600">
                    DharmaMart Partner Store Reward:
                  </span>
                  <span className="font-mono-tabular font-semibold text-[#146C32]">
                    + ₹{paymentTab === 'cod' ? 15 : scannedMerchant.cashbackInr ?? 25} Credited to Wallet
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 px-5 rounded-xl bg-[#146C32] hover:bg-[#0F5426] text-white text-xs font-semibold transition-colors inline-flex items-center justify-center gap-2"
                >
                  <span>
                    {authStep
                      ? `Confirm ₹${(Number(amountInput) || 450).toLocaleString('en-IN')} (${paymentTab.toUpperCase()})`
                      : paymentTab === 'upi'
                      ? `Pay ₹${(Number(amountInput) || 450).toLocaleString('en-IN')} via ${selectedUpiApp}`
                      : paymentTab === 'card'
                      ? `Pay ₹${(Number(amountInput) || 450).toLocaleString('en-IN')} via ${cardNetwork}`
                      : `Book Cash on Delivery — ₹${(Number(amountInput) || 450).toLocaleString('en-IN')}`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STATE 3: VERIFIED UPI / CARD / COD RECEIPT */}
          {completedTx && (
            <div className="p-6 rounded-xl bg-white border border-stone-200 space-y-5 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-[#146C32]/15 text-[#146C32] flex items-center justify-center">
                <Check className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-[#146C32]">
                  {completedTx.channel === 'Card'
                    ? 'Partner Store Card Transaction Approved'
                    : completedTx.channel === 'COD'
                    ? 'Cash on Delivery (COD) Order Verified'
                    : 'Instant Shop UPI QR Payment Confirmed'}
                </p>
                <h3 className="text-3xl font-semibold text-stone-900 font-mono-tabular">
                  ₹{completedTx.amountInr.toLocaleString('en-IN')}
                </h3>
                <p className="text-sm font-medium text-stone-800">
                  {completedTx.merchantName}
                </p>
                <p className="text-xs text-stone-500 font-mono-tabular">
                  {completedTx.merchantIdentifier} · {completedTx.partnerLocation}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF9F6] border border-stone-200/80 text-xs space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-stone-500">Reference / Token:</span>
                  <span className="font-mono-tabular font-semibold text-stone-900">
                    {completedTx.referenceNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Payment Mode:</span>
                  <span className="font-mono-tabular text-stone-800">
                    {completedTx.instrumentLabel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Details:</span>
                  <span className="text-stone-800 truncate max-w-[240px]">
                    {completedTx.timestamp} · {completedTx.note}
                  </span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-stone-200 text-[#146C32] font-semibold">
                  <span>Partner Cashback Earned:</span>
                  <span className="font-mono-tabular">
                    + ₹{completedTx.cashbackEarned}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={resetScanner}
                  className="px-4 py-2.5 rounded-lg bg-[#F3F2EE] hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors"
                >
                  New Scan / Payment
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-lg bg-[#146C32] hover:bg-[#0F5426] text-white text-xs font-semibold transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Interactive Payment History Chart & Unified UPI QR / Card / COD Transactions Ledger
 */
export const PaymentHistoryAnalyticsSection: React.FC<{
  transactions: PaymentTransactionRecord[];
  onOpenScanner: (mode: 'upi' | 'card' | 'cod') => void;
}> = ({ transactions, onOpenScanner }) => {
  const [filterChannel, setFilterChannel] = useState<'All' | 'UPI QR' | 'Card' | 'COD'>('All');
  const [chartPeriod, setChartPeriod] = useState<'daily' | 'monthly'>('daily');

  const filteredTransactions = useMemo(() => {
    if (filterChannel === 'All') return transactions;
    return transactions.filter((t) => t.channel === filterChannel);
  }, [transactions, filterChannel]);

  const totalUpiSpend = useMemo(
    () =>
      transactions
        .filter((t) => t.channel === 'UPI QR')
        .reduce((acc, t) => acc + t.amountInr, 0),
    [transactions]
  );

  const totalCardSpend = useMemo(
    () =>
      transactions
        .filter((t) => t.channel === 'Card')
        .reduce((acc, t) => acc + t.amountInr, 0),
    [transactions]
  );

  const totalCodSpend = useMemo(
    () =>
      transactions
        .filter((t) => t.channel === 'COD')
        .reduce((acc, t) => acc + t.amountInr, 0),
    [transactions]
  );

  const totalCashback = useMemo(
    () => transactions.reduce((acc, t) => acc + t.cashbackEarned, 0),
    [transactions]
  );

  // Build dynamic 3-series stacked chart bars (UPI QR + Card + Cash on Delivery)
  const chartData = useMemo(() => {
    const todayUpi = transactions
      .filter((t) => t.dateLabel === 'Today' && t.channel === 'UPI QR')
      .reduce((s, t) => s + t.amountInr, 0);
    const todayCard = transactions
      .filter((t) => t.dateLabel === 'Today' && t.channel === 'Card')
      .reduce((s, t) => s + t.amountInr, 0);
    const todayCod = transactions
      .filter((t) => t.dateLabel === 'Today' && t.channel === 'COD')
      .reduce((s, t) => s + t.amountInr, 0);

    if (chartPeriod === 'daily') {
      return [
        { label: 'Sep 24', upi: 1450, card: 600, cod: 450 },
        { label: 'Sep 25', upi: 820, card: 8900, cod: 0 },
        { label: 'Sep 26', upi: 980, card: 1200, cod: 1180 },
        { label: 'Sep 27', upi: 540, card: 2890, cod: 650 },
        { label: 'Sep 28', upi: 699, card: 1450, cod: 499 },
        { label: 'Today', upi: 950 + todayUpi, card: 1650 + todayCard, cod: 550 + todayCod },
      ];
    }
    return [
      { label: 'Apr', upi: 6400, card: 11200, cod: 3200 },
      { label: 'May', upi: 8200, card: 14500, cod: 4100 },
      { label: 'Jun', upi: 7900, card: 9800, cod: 2900 },
      { label: 'Jul', upi: 10400, card: 16200, cod: 3800 },
      { label: 'Aug', upi: 11800, card: 13900, cod: 4400 },
      {
        label: 'Sep',
        upi: totalUpiSpend + 6200,
        card: totalCardSpend + 4800,
        cod: totalCodSpend + 2600,
      },
    ];
  }, [chartPeriod, transactions, totalUpiSpend, totalCardSpend, totalCodSpend]);

  const maxBarTotal = useMemo(
    () => Math.max(1000, ...chartData.map((d) => d.upi + d.card + d.cod)),
    [chartData]
  );

  return (
    <section className="bg-white rounded-2xl border border-stone-200/80 p-6 sm:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#146C32] font-semibold">
            <BarChart3 className="w-4 h-4" />
            <span>India Payments Analytics · UPI QR · Cards · Cash on Delivery</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-stone-900 mt-1">
            Partner Store UPI QR, Card & Cash on Delivery History
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            Scan shop QR codes with your camera, swipe RuPay/Visa cards, or book doorstep Cash on Delivery with live spend analytics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onOpenScanner('upi')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#146C32] hover:bg-[#0F5426] text-white text-xs font-semibold transition-colors whitespace-nowrap"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan Shop UPI QR</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenScanner('card')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors whitespace-nowrap"
          >
            <CreditCard className="w-4 h-4" />
            <span>Card Transaction</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenScanner('cod')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F3F2EE] hover:bg-stone-200 text-stone-900 text-xs font-semibold transition-colors whitespace-nowrap"
          >
            <Banknote className="w-4 h-4 text-[#E86A17]" />
            <span>Cash on Delivery</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip + Visual History Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 6 Cols: Stacked Bar History Chart */}
        <div className="lg:col-span-6 p-5 rounded-xl bg-[#FAF9F6] border border-stone-200/80 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-stone-900">
                Payment History Chart (UPI vs Card vs COD)
              </h3>
              <p className="text-xs text-stone-500">
                Green: UPI QR · Saffron: RuPay/Card · Charcoal: Cash on Delivery
              </p>
            </div>
            <div className="flex items-center gap-1 p-1 bg-stone-200/70 rounded-lg">
              <button
                type="button"
                onClick={() => setChartPeriod('daily')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                  chartPeriod === 'daily'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Last 6 Days
              </button>
              <button
                type="button"
                onClick={() => setChartPeriod('monthly')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                  chartPeriod === 'monthly'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                6 Months
              </button>
            </div>
          </div>

          {/* Interactive Stacked Bar Chart */}
          <div className="pt-4 pb-1">
            <div className="grid grid-cols-6 gap-3 items-end h-44 px-2 border-b border-stone-300 pb-2">
              {chartData.map((bar) => {
                const total = bar.upi + bar.card + bar.cod;
                const heightPct = Math.max(14, Math.round((total / maxBarTotal) * 100));
                const upiSharePct = total > 0 ? Math.round((bar.upi / total) * 100) : 34;
                const cardSharePct = total > 0 ? Math.round((bar.card / total) * 100) : 33;
                const codSharePct = Math.max(0, 100 - upiSharePct - cardSharePct);

                return (
                  <div
                    key={bar.label}
                    className="flex flex-col items-center justify-end h-full group"
                  >
                    <span className="text-[10px] font-mono-tabular text-stone-600 mb-1.5">
                      ₹{(total / 1000).toFixed(1)}k
                    </span>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full max-w-[38px] rounded-t-md overflow-hidden flex flex-col justify-end shadow-2xs transition-transform duration-150 group-hover:scale-105"
                      title={`${bar.label} — UPI: ₹${bar.upi.toLocaleString(
                        'en-IN'
                      )} | Card: ₹${bar.card.toLocaleString(
                        'en-IN'
                      )} | COD: ₹${bar.cod.toLocaleString('en-IN')}`}
                    >
                      <div
                        style={{ height: `${codSharePct}%` }}
                        className="w-full bg-stone-700"
                      />
                      <div
                        style={{ height: `${cardSharePct}%` }}
                        className="w-full bg-[#E86A17]"
                      />
                      <div
                        style={{ height: `${upiSharePct}%` }}
                        className="w-full bg-[#146C32]"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-6 gap-3 pt-2 px-2 text-center">
              {chartData.map((bar) => (
                <span
                  key={bar.label}
                  className="text-[11px] font-mono-tabular font-medium text-stone-600"
                >
                  {bar.label}
                </span>
              ))}
            </div>
          </div>

          {/* Totals Summary Row */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-stone-200/80 text-xs">
            <div>
              <span className="text-stone-500 block">UPI QR</span>
              <span className="text-sm font-semibold text-[#146C32] font-mono-tabular">
                ₹{totalUpiSpend.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-stone-500 block">Card Swipes</span>
              <span className="text-sm font-semibold text-[#E86A17] font-mono-tabular">
                ₹{totalCardSpend.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-stone-500 block">Cash (COD)</span>
              <span className="text-sm font-semibold text-stone-800 font-mono-tabular">
                ₹{totalCodSpend.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-stone-500 block">Rewards</span>
              <span className="text-sm font-semibold text-[#146C32] font-mono-tabular">
                +₹{totalCashback.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Right 6 Cols: Filterable UPI, Card & COD Transactions Ledger */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-stone-900">
              Recent Partner Store & Order Payments ({filteredTransactions.length})
            </h3>
            <div className="flex items-center gap-1 p-1 bg-[#F3F2EE] rounded-lg overflow-x-auto">
              {(['All', 'UPI QR', 'Card', 'COD'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilterChannel(tab)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                    filterChannel === tab
                      ? 'bg-white text-stone-900 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {tab === 'All'
                    ? 'All'
                    : tab === 'UPI QR'
                    ? 'UPI QR'
                    : tab === 'Card'
                    ? 'Cards'
                    : 'Cash (COD)'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
            {filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className="p-3.5 rounded-xl bg-[#FAF9F6] border border-stone-200/80 flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <span className="font-semibold text-stone-800">{tx.channel}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-tabular">{tx.referenceNumber}</span>
                    <span aria-hidden="true">·</span>
                    <span>{tx.timestamp}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-stone-900 truncate">
                    {tx.merchantName}
                  </h4>
                  <p className="text-xs text-stone-500 truncate">
                    {tx.instrumentLabel} · {tx.note}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold text-stone-900 font-mono-tabular">
                    ₹{tx.amountInr.toLocaleString('en-IN')}
                  </div>
                  {tx.cashbackEarned > 0 && (
                    <div className="text-[11px] font-mono-tabular text-[#146C32] font-medium">
                      +₹{tx.cashbackEarned} reward
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
