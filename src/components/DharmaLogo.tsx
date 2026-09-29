import React from 'react';

interface DharmaIconProps {
  size?: number;
  className?: string;
  maskable?: boolean;
}

/**
 * Simplified Circular DharmaMart App Icon (readable from 48px to 1024px)
 * Circular Green+Orange ring + Stylized D + speed lines + shopping cart + twin green leaves
 */
export const DharmaAppIcon: React.FC<DharmaIconProps> = ({
  size = 64,
  className = '',
  maskable = false,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={className}
      aria-label="DharmaMart App Icon"
    >
      <defs>
        <linearGradient id="dmRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0F6E2E" />
          <stop offset="52%" stopColor="#1E8E3E" />
          <stop offset="100%" stopColor="#F26B1D" />
        </linearGradient>
        <linearGradient id="dmArcGrad" x1="15%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#146C32" />
          <stop offset="48%" stopColor="#229944" />
          <stop offset="100%" stopColor="#FF7A1A" />
        </linearGradient>
        <linearGradient id="dmLeafGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#146C32" />
          <stop offset="100%" stopColor="#68C132" />
        </linearGradient>
      </defs>

      {maskable ? (
        <rect width="512" height="512" rx="112" fill="#FFFFFF" />
      ) : (
        <circle cx="256" cy="256" r="248" fill="#FFFFFF" />
      )}
      <circle
        cx="256"
        cy="256"
        r={maskable ? '216' : '236'}
        fill="none"
        stroke="url(#dmRingGrad)"
        strokeWidth="20"
      />

      <g transform={maskable ? 'translate(25.6, 25.6) scale(0.9)' : undefined}>
        {/* Stylized D Stem & Outer Curve */}
        <path
          d="M156 122 H258 C342 122 396 176 396 256 C396 336 342 390 258 390 H156 V324 H252 C298 324 328 296 328 256 C328 216 298 188 252 188 H212 V224 H156 V122 Z"
          fill="url(#dmArcGrad)"
        />

        {/* Speed Motion Lines */}
        <rect x="102" y="236" width="66" height="14" rx="7" fill="#F26B1D" />
        <rect x="86" y="258" width="82" height="14" rx="7" fill="#FF8C1A" />
        <rect x="114" y="280" width="54" height="14" rx="7" fill="#229944" />

        {/* Shopping Cart Inside D Counter */}
        <g
          fill="none"
          stroke="#146C32"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M182 216 H204 L220 292 H294 L310 234 H209" />
          <line x1="228" y1="254" x2="300" y2="254" strokeWidth="10" />
          <line x1="232" y1="273" x2="295" y2="273" strokeWidth="10" />
        </g>
        <circle cx="230" cy="316" r="13" fill="#146C32" />
        <circle cx="284" cy="316" r="13" fill="#146C32" />

        {/* Twin Botanical Leaves on Top-Right of D */}
        <path
          d="M342 142 C342 98 386 72 424 72 C424 110 396 142 342 142 Z"
          fill="url(#dmLeafGrad)"
        />
        <path
          d="M352 134 L406 86"
          stroke="#FFFFFF"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M368 158 C388 136 420 132 442 144 C422 168 394 172 368 158 Z"
          fill="url(#dmLeafGrad)"
        />
      </g>
    </svg>
  );
};

/**
 * Full Circular DharmaMart Brand Crest matching the uploaded logo identity
 */
export const DharmaFullBrandCrest: React.FC<{ className?: string }> = ({ className = '' }) => {
  const categories = [
    { label: 'Groceries', color: '#F26B1D' },
    { label: 'Electronics', color: '#155EEF' },
    { label: 'Fashion', color: '#E31B54' },
    { label: 'Home & Kitchen', color: '#146C32' },
    { label: 'Beauty', color: '#6938EF' },
    { label: 'Sports', color: '#026AA2' },
  ];

  return (
    <div
      className={`relative aspect-square w-full max-w-[360px] rounded-full p-2.5 bg-gradient-to-br from-[#146C32] via-[#229944] to-[#E86A17] shadow-md ${className}`}
    >
      <div className="h-full w-full rounded-full bg-white flex flex-col items-center justify-between px-6 py-5 text-center">
        <DharmaAppIcon size={108} />

        <div className="-mt-2">
          <div className="text-2xl font-bold tracking-tight leading-none">
            <span className="text-[#146C32]">Dharma</span>
            <span className="text-[#E86A17]">mart</span>
          </div>
          <p className="mt-1 text-[11px] font-semibold text-[#146C32]">
            Shop Smart · Live Better
          </p>
        </div>

        <div className="grid grid-cols-6 gap-1.5 w-full px-2">
          {categories.map((cat) => (
            <div key={cat.label} className="flex flex-col items-center">
              <span
                className="h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-semibold text-white"
                style={{ backgroundColor: cat.color }}
              >
                {cat.label[0]}
              </span>
              <span className="mt-0.5 text-[8px] text-stone-600 truncate w-full">
                {cat.label}
              </span>
            </div>
          ))}
        </div>

        <div className="w-full rounded-md bg-gradient-to-r from-[#0D4F22] to-[#1B6E35] px-3 py-1.5 text-[9px] font-medium text-white flex items-center justify-center gap-2">
          <span>Fast Delivery</span>
          <span aria-hidden="true">·</span>
          <span>UPI & ONDC</span>
          <span aria-hidden="true">·</span>
          <span>24/7 Support</span>
        </div>

        <p className="text-[10px] italic text-[#146C32] font-medium">
          Your Trusted Online & Local Store
        </p>
      </div>
    </div>
  );
};

/**
 * Client-side Canvas Exporter for Google Play Console Assets:
 * - 512x512 High-Res Play Store Icon PNG
 * - 512x512 Maskable Android Adaptive Icon PNG
 * - 1024x500 Google Play Store Feature Graphic PNG
 */
export function downloadPlayStoreAsset(
  type: 'icon-512' | 'maskable-512' | 'feature-1024x500'
) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  if (type === 'feature-1024x500') {
    canvas.width = 1024;
    canvas.height = 500;

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, 1024, 500);
    bg.addColorStop(0, '#0D4A22');
    bg.addColorStop(0.6, '#146C32');
    bg.addColorStop(1, '#1E2822');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1024, 500);

    // Subtle warm accent glow on right
    const glow = ctx.createRadialGradient(850, 250, 30, 850, 250, 320);
    glow.addColorStop(0, 'rgba(232, 106, 23, 0.38)');
    glow.addColorStop(1, 'rgba(232, 106, 23, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 1024, 500);

    // Draw Circular Emblem on Left
    drawDharmaEmblemOnCanvas(ctx, 210, 250, 150);

    // Draw Brand Title & Tagline on Right
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 64px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Dharma', 410, 195);
    ctx.fillStyle = '#FF8C3B';
    ctx.fillText('Mart', 665, 195);

    ctx.fillStyle = '#E2F5E8';
    ctx.font = '600 26px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Shop Smart  •  Live Better', 410, 245);

    ctx.fillStyle = '#D0DDD4';
    ctx.font = '400 21px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(
      'Buy New  ·  Sell Used  ·  Exchange Gadgets  ·  Local Services  ·  24/7 Support',
      410,
      300
    );

    ctx.fillStyle = '#FF8C3B';
    ctx.font = '600 19px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('UPI & COD Ready  ·  8 Indian Languages  ·  Hyperlocal Delivery', 410, 350);
  } else {
    canvas.width = 512;
    canvas.height = 512;
    if (type === 'maskable-512') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 512, 512);
      drawDharmaEmblemOnCanvas(ctx, 256, 256, 200);
    } else {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(256, 256, 248, 0, Math.PI * 2);
      ctx.fill();
      drawDharmaEmblemOnCanvas(ctx, 256, 256, 236);
    }
  }

  const link = document.createElement('a');
  link.download =
    type === 'feature-1024x500'
      ? 'dharmamart-playstore-feature-1024x500.png'
      : type === 'maskable-512'
      ? 'dharmamart-maskable-icon-512x512.png'
      : 'dharmamart-playstore-icon-512x512.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function drawDharmaEmblemOnCanvas(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number
) {
  const scale = radius / 236;
  ctx.save();
  ctx.translate(cx - 256 * scale, cy - 256 * scale);
  ctx.scale(scale, scale);

  // White backing circle
  ctx.beginPath();
  ctx.arc(256, 256, 236, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  // Outer Ring Gradient
  const ringGrad = ctx.createLinearGradient(20, 20, 492, 492);
  ringGrad.addColorStop(0, '#0F6E2E');
  ringGrad.addColorStop(0.55, '#229944');
  ringGrad.addColorStop(1, '#F26B1D');
  ctx.lineWidth = 20;
  ctx.strokeStyle = ringGrad;
  ctx.stroke();

  // Stylized D
  const dGrad = ctx.createLinearGradient(156, 122, 396, 390);
  dGrad.addColorStop(0, '#146C32');
  dGrad.addColorStop(0.5, '#229944');
  dGrad.addColorStop(1, '#FF7A1A');
  ctx.fillStyle = dGrad;

  ctx.beginPath();
  ctx.moveTo(156, 122);
  ctx.lineTo(258, 122);
  ctx.bezierCurveTo(342, 122, 396, 176, 396, 256);
  ctx.bezierCurveTo(396, 336, 342, 390, 258, 390);
  ctx.lineTo(156, 390);
  ctx.lineTo(156, 324);
  ctx.lineTo(252, 324);
  ctx.bezierCurveTo(298, 324, 328, 296, 328, 256);
  ctx.bezierCurveTo(328, 216, 298, 188, 252, 188);
  ctx.lineTo(212, 188);
  ctx.lineTo(212, 224);
  ctx.lineTo(156, 224);
  ctx.closePath();
  ctx.fill();

  // Speed lines
  ctx.fillStyle = '#F26B1D';
  ctx.fillRect(102, 236, 66, 14);
  ctx.fillStyle = '#FF8C1A';
  ctx.fillRect(86, 258, 82, 14);
  ctx.fillStyle = '#229944';
  ctx.fillRect(114, 280, 54, 14);

  // Shopping Cart
  ctx.strokeStyle = '#146C32';
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(182, 216);
  ctx.lineTo(204, 216);
  ctx.lineTo(220, 292);
  ctx.lineTo(294, 292);
  ctx.lineTo(310, 234);
  ctx.lineTo(209, 234);
  ctx.stroke();

  ctx.fillStyle = '#146C32';
  ctx.beginPath();
  ctx.arc(230, 316, 13, 0, Math.PI * 2);
  ctx.arc(284, 316, 13, 0, Math.PI * 2);
  ctx.fill();

  // Leaf on top right
  ctx.fillStyle = '#229944';
  ctx.beginPath();
  ctx.moveTo(342, 142);
  ctx.quadraticCurveTo(352, 82, 424, 72);
  ctx.quadraticCurveTo(410, 136, 342, 142);
  ctx.fill();

  ctx.restore();
}
