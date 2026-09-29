import express from 'express';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '2mb' }));

// Initialize server-side Gemini client with required User-Agent header
function getGenAIClient() {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Store configurable Digital Asset Links SHA-256 fingerprint for Google Play Console TWA verification
let playStoreConfig = {
  packageName: 'in.dharmamart.app',
  sha256Fingerprints: [
    'FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C',
  ],
  versionName: '1.0.0',
  versionCode: 1,
};

// Pure Node.js PNG generator (creates valid RGBA PNGs of exact dimensions 180x180, 192x192, 512x512 for PWA/TWA validation)
function createDharmaMartPng(size: number, maskable = false): Buffer {
  const width = size;
  const height = size;
  const rawData = Buffer.alloc(height * (1 + width * 4));

  const cx = width / 2;
  const cy = height / 2;
  const maxR = (width / 2) * (maskable ? 0.82 : 0.95);
  const innerR = maxR * 0.88;

  for (let y = 0; y < height; y++) {
    const rowStart = y * (1 + width * 4);
    rawData[rowStart] = 0; // filter type 0
    for (let x = 0; x < width; x++) {
      const px = rowStart + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const nx = (x - cx) / maxR;
      const ny = (y - cy) / maxR;

      if (!maskable && dist > maxR) {
        // Transparent outside circle for standard icon
        rawData[px] = 250;
        rawData[px + 1] = 249;
        rawData[px + 2] = 246;
        rawData[px + 3] = 0;
        continue;
      }

      if (dist > maxR) {
        // Maskable safe-zone background (Forest Green to Saffron tint)
        rawData[px] = 20;
        rawData[px + 1] = 108;
        rawData[px + 2] = 50;
        rawData[px + 3] = 255;
        continue;
      }

      if (dist > innerR) {
        // Circular gradient ring (Green on left/top to Saffron Orange on right/bottom)
        const t = Math.min(1, Math.max(0, (nx + ny + 1.4) / 2.8));
        rawData[px] = Math.round(20 * (1 - t) + 232 * t);
        rawData[px + 1] = Math.round(108 * (1 - t) + 106 * t);
        rawData[px + 2] = Math.round(50 * (1 - t) + 23 * t);
        rawData[px + 3] = 255;
        continue;
      }

      // Stylized 'D' emblem inside white circle
      const inDStem = nx >= -0.42 && nx <= -0.18 && ny >= -0.52 && ny <= 0.52;
      const dOuterDist = Math.sqrt((nx + 0.05) ** 2 + ny ** 2);
      const inDArc = nx >= -0.18 && dOuterDist <= 0.52 && dOuterDist >= 0.28;
      const inLeaf = nx >= 0.22 && nx <= 0.58 && ny >= -0.68 && ny <= -0.3 && Math.abs(nx + ny + 0.05) < 0.22;

      if (inDStem || inDArc || inLeaf) {
        const t = Math.min(1, Math.max(0, (nx + 0.5) / 1.1));
        rawData[px] = Math.round(20 * (1 - t) + 232 * t);
        rawData[px + 1] = Math.round(108 * (1 - t) + 106 * t);
        rawData[px + 2] = Math.round(50 * (1 - t) + 23 * t);
        rawData[px + 3] = 255;
      } else {
        rawData[px] = 255;
        rawData[px + 1] = 255;
        rawData[px + 2] = 255;
        rawData[px + 3] = 255;
      }
    }
  }

  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
  }

  function crc32(buf: Buffer): number {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type: string, data: Buffer): Buffer {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idatData = zlib.deflateSync(rawData);
  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', idatData),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

const iconCache = new Map<string, Buffer>();
function getCachedIcon(key: string, size: number, maskable: boolean): Buffer {
  if (!iconCache.has(key)) {
    iconCache.set(key, createDharmaMartPng(size, maskable));
  }
  return iconCache.get(key)!;
}

// Serve compliant PNG icons for PWA, iOS Safari, and Google Play TWA packaging
app.get('/pwa-192x192.png', (_req, res) => {
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(getCachedIcon('192', 192, false));
});

app.get('/pwa-512x512.png', (_req, res) => {
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(getCachedIcon('512', 512, false));
});

app.get('/pwa-maskable-512x512.png', (_req, res) => {
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(getCachedIcon('maskable512', 512, true));
});

app.get('/apple-touch-icon.png', (_req, res) => {
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(getCachedIcon('apple180', 180, true));
});

// Google Play Store Trusted Web Activity (TWA) Digital Asset Links endpoint
app.get('/.well-known/assetlinks.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json([
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: playStoreConfig.packageName,
        sha256_cert_fingerprints: playStoreConfig.sha256Fingerprints,
      },
    },
  ]);
});

// Update Play Store TWA configuration from the Release Studio UI
app.post('/api/playstore/config', (req, res) => {
  const { packageName, sha256Fingerprint, versionName, versionCode } = req.body || {};
  if (packageName && typeof packageName === 'string') {
    playStoreConfig.packageName = packageName.trim();
  }
  if (sha256Fingerprint && typeof sha256Fingerprint === 'string') {
    const cleaned = sha256Fingerprint.trim().toUpperCase();
    if (!playStoreConfig.sha256Fingerprints.includes(cleaned)) {
      playStoreConfig.sha256Fingerprints = [cleaned, ...playStoreConfig.sha256Fingerprints];
    }
  }
  if (versionName) playStoreConfig.versionName = String(versionName);
  if (versionCode) playStoreConfig.versionCode = Number(versionCode) || 1;
  res.json({ ok: true, config: playStoreConfig });
});

app.get('/api/playstore/config', (_req, res) => {
  res.json(playStoreConfig);
});

// Serve Bubblewrap / PWABuilder TWA manifest file for direct Play Store .aab packaging
app.get('/twa-manifest.json', (req, res) => {
  const host = req.headers.host || 'dharmamart.in';
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const origin = process.env.APP_URL || `${protocol}://${host}`;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="twa-manifest.json"');
  res.json({
    packageId: playStoreConfig.packageName,
    host: origin.replace(/^https?:\/\//, '').replace(/\/$/, ''),
    name: 'DharmaMart',
    launcherName: 'DharmaMart',
    display: 'standalone',
    themeColor: '#146C32',
    navigationColor: '#FAF9F6',
    navigationColorDark: '#141A16',
    navigationDividerColor: '#E5E4DF',
    backgroundColor: '#FAF9F6',
    enableNotifications: true,
    startUrl: '/',
    iconUrl: `${origin.replace(/\/$/, '')}/pwa-512x512.png`,
    maskableIconUrl: `${origin.replace(/\/$/, '')}/pwa-maskable-512x512.png`,
    appVersionName: playStoreConfig.versionName,
    appVersionCode: playStoreConfig.versionCode,
    shortcuts: [
      {
        name: 'Shop Products',
        shortName: 'Shop',
        url: '/?tab=shop',
      },
      {
        name: 'Sell Used Item',
        shortName: 'Sell',
        url: '/?tab=resale',
      },
      {
        name: 'Book Local Service',
        shortName: 'Services',
        url: '/?tab=services',
      },
      {
        name: 'Ask Dharma AI',
        shortName: 'Dharma AI',
        url: '/?tab=ai',
      },
    ],
    generatorApp: 'bubblewrap-cli',
    webManifestUrl: `${origin.replace(/\/$/, '')}/manifest.webmanifest`,
    fallbackType: 'customtabs',
    enableSiteSettingsShortcut: true,
    isChromeOSOnly: false,
    orientation: 'portrait',
  });
});

// Dharma AI Server-Side Endpoint using @google/genai (gemini-3.8-flash)
app.post('/api/dharma-ai', async (req, res) => {
  try {
    const { prompt, language = 'English', mode = 'assistant', catalogContext = '' } = req.body || {};
    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Please provide a prompt for Dharma AI.' });
      return;
    }

    const ai = getGenAIClient();
    const systemInstruction = `You are Dharma AI, the built-in smart assistant for DharmaMart (Tagline: "Shop Smart • Live Better") — India's local marketplace combining New Shopping, Used Item Resale (C2C), Device Exchange/Upgrade, Local Home Services (Electrician, Plumber, AC/Mobile Repair), UPI/ONDC checkout, and hyperlocal delivery.

Current User Selected Language: ${language}.
Current Mode: ${mode}.

Guidelines:
- Respond naturally in ${language} (if the user selected an Indian language like Telugu, Hindi, Tamil, Kannada, Malayalam, Marathi, or Bengali, write warmly in that script alongside clear ₹ INR figures and product names).
- Keep responses concise, structured, and actionable (around 90–160 words).
- Always quote prices in Indian Rupees (₹) with Indian numbering format (e.g., ₹14,499).
- When asked to find or compare products, reference specific items from the DharmaMart catalog context below and highlight Exchange Bonus, Local Delivery time, and UPI discount where relevant.
- When in "seller" mode, generate a ready-to-post used-item listing title, recommended Indian resale price range in ₹, quick inspection checklist, and buyer trust tip.

DharmaMart Catalog & Services Context:
${catalogContext}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const text = response.text || 'Unable to generate response at the moment.';
    res.json({ reply: text, language, mode });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to reach Dharma AI service.';
    res.status(500).json({ error: message });
  }
});

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DharmaMart server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
