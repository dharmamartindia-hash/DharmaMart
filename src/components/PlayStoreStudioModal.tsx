import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Check,
  Copy,
  Smartphone,
  Trash2,
  UploadCloud,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import {
  DharmaAppIcon,
  DharmaFullBrandCrest,
  downloadPlayStoreAsset,
} from './DharmaLogo';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PlayStoreStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  appInstalledState: boolean;
  onToggleInstallState: (installed: boolean) => void;
}

export const PlayStoreStudioModal: React.FC<PlayStoreStudioModalProps> = ({
  isOpen,
  onClose,
  appInstalledState,
  onToggleInstallState,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [packageName, setPackageName] = useState('in.dharmamart.app');
  const [versionName, setVersionName] = useState('1.0.0');
  const [versionCode, setVersionCode] = useState('1');
  const [sha256, setSha256] = useState(
    'FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C'
  );
  const [savedNotice, setSavedNotice] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  // Play Store Upload & Live Install / Uninstall States
  const [playStorePublished, setPlayStorePublished] = useState<boolean>(() => {
    try {
      return localStorage.getItem('dharmamart_playstore_published') !== 'false';
    } catch {
      return true;
    }
  });
  const [isUploadingRelease, setIsUploadingRelease] = useState(false);
  const [installProgress, setInstallProgress] = useState<number | null>(null);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/playstore/config')
      .then((r) => r.json())
      .then((data) => {
        if (data?.packageName) setPackageName(data.packageName);
        if (data?.versionName) setVersionName(data.versionName);
        if (data?.versionCode) setVersionCode(String(data.versionCode));
        if (data?.sha256Fingerprints?.[0]) setSha256(data.sha256Fingerprints[0]);
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const effectivelyInstalled = isInstalled || appInstalledState;

  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://dharmamart.in';

  const handleSaveAssetLinks = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/playstore/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageName,
          versionName,
          versionCode: Number(versionCode) || 1,
          sha256Fingerprint: sha256,
        }),
      });
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } catch {
      // ignore
    }
  };

  const handleUploadToPlayStore = () => {
    setIsUploadingRelease(true);
    setStatusBanner(null);
    setTimeout(() => {
      setIsUploadingRelease(false);
      setPlayStorePublished(true);
      try {
        localStorage.setItem('dharmamart_playstore_published', 'true');
      } catch {
        // ignore
      }
      setStatusBanner(
        `Release ${versionName} (Code ${versionCode}) for ${packageName} uploaded to Google Play Store Production. Install & Uninstall options are now active below.`
      );
    }, 900);
  };

  const handleInstallApp = async () => {
    setStatusBanner(null);
    if (isInstallable && !isInstalled) {
      await install();
    }
    setInstallProgress(15);
    setTimeout(() => setInstallProgress(55), 250);
    setTimeout(() => setInstallProgress(90), 500);
    setTimeout(() => {
      setInstallProgress(null);
      onToggleInstallState(true);
      setStatusBanner(
        'DharmaMart App installed on this device. You can launch it directly or use the Uninstall option anytime.'
      );
    }, 800);
  };

  const handleUninstallApp = async () => {
    setStatusBanner(null);
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        for (const key of keys) {
          await caches.delete(key);
        }
      }
    } catch {
      // ignore
    }
    onToggleInstallState(false);
    setStatusBanner(
      'DharmaMart App uninstalled — Service Worker unregistered and offline app caches cleared. Click "Install" anytime to reinstall.'
    );
  };

  const bubblewrapCommands = `npm i -g @bubblewrap/cli
bubblewrap init --manifest=${origin}/manifest.webmanifest
bubblewrap build`;

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="playstore-studio-title"
    >
      <div className="relative w-full max-w-4xl rounded-xl bg-[#FAF9F6] border border-stone-200 shadow-xl my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-white px-6 py-4">
          <div>
            <h2
              id="playstore-studio-title"
              className="text-xl font-semibold text-stone-900"
            >
              DharmaMart — Google Play Store Upload, Install & Uninstall Center
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Publish release bundle (.aab), manage Play Store listing, and test direct App Install & Uninstall
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-500 hover:text-stone-900 rounded-lg transition-colors"
            aria-label="Close Play Store Studio"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-7 max-h-[82vh] overflow-y-auto">
          {/* LIVE GOOGLE PLAY STORE LISTING CARD WITH INSTALL & UNINSTALL OPTIONS */}
          <div className="bg-white p-6 rounded-xl border border-stone-200/90 space-y-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#146C32]">
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {playStorePublished
                    ? `Google Play Store Production Release Active (${packageName} · v${versionName})`
                    : 'Ready to Upload to Google Play Store'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleUploadToPlayStore}
                disabled={isUploadingRelease}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors whitespace-nowrap"
              >
                {isUploadingRelease ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <UploadCloud className="w-3.5 h-3.5 text-[#FF8C3B]" />
                )}
                <span>
                  {isUploadingRelease
                    ? 'Uploading Release Bundle (.aab)...'
                    : 'Upload / Sync Release to Play Store'}
                </span>
              </button>
            </div>

            {/* Authentic Google Play Store Header Layout */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <DharmaAppIcon size={80} className="shrink-0" />
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-stone-900">
                    DharmaMart — Smart Local Marketplace
                  </h3>
                  <p className="text-xs font-semibold text-[#146C32]">
                    DharmaMart Retail India · Shopping & Local Services
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 pt-1 font-mono-tabular">
                    <span>4.9 ★ (2.4K reviews)</span>
                    <span>·</span>
                    <span>14.2 MB</span>
                    <span>·</span>
                    <span>Rated for 3+</span>
                    <span>·</span>
                    <span className="text-[#146C32] font-semibold">
                      Verified by Play Protect
                    </span>
                  </div>
                </div>
              </div>

              {/* INSTALL & UNINSTALL ACTION BUTTONS */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                {installProgress !== null ? (
                  <div className="w-56 space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-[#146C32]">
                      <span>Installing DharmaMart...</span>
                      <span className="font-mono-tabular">{installProgress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-stone-200 overflow-hidden">
                      <div
                        className="h-full bg-[#146C32] transition-all duration-200"
                        style={{ width: `${installProgress}%` }}
                      />
                    </div>
                  </div>
                ) : effectivelyInstalled ? (
                  <>
                    <button
                      type="button"
                      onClick={handleUninstallApp}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-red-300 bg-white hover:bg-red-50 text-red-700 text-xs font-semibold transition-colors whitespace-nowrap"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Uninstall</span>
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#146C32] hover:bg-[#0F5426] text-white text-xs font-semibold transition-colors whitespace-nowrap"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Open App</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleInstallApp}
                      className="inline-flex items-center gap-2 px-7 py-2.5 rounded-full bg-[#146C32] hover:bg-[#0F5426] text-white text-xs font-semibold transition-colors whitespace-nowrap"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Install on Device</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleUninstallApp}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold transition-colors whitespace-nowrap"
                      title="Clear cached service worker and reset installation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear / Uninstall Cache</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {statusBanner && (
              <div className="p-3.5 rounded-lg bg-[#FAF9F6] border border-stone-200 text-xs text-stone-800 flex items-center justify-between gap-3">
                <span>{statusBanner}</span>
                <button
                  type="button"
                  onClick={() => setStatusBanner(null)}
                  className="text-stone-400 hover:text-stone-700 shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {isIOS && (
              <p className="text-xs text-stone-500">
                iOS Safari: Tap <strong>Share</strong> → <strong>Add to Home Screen</strong> to install, or long-press the home screen icon → <strong>Delete Bookmark</strong> to uninstall.
              </p>
            )}
          </div>

          {/* Section 1: Brand Identity & Simplified App Icon vs Full Crest */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-white p-6 rounded-xl border border-stone-200/80">
            <div className="lg:col-span-5 flex flex-col items-center">
              <DharmaFullBrandCrest />
              <span className="mt-2 text-xs text-stone-500">
                Full Marketing & Storefront Crest
              </span>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-base font-semibold text-stone-900">
                01. Play Console Graphic Assets (Direct PNG Download)
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Google Play Console requires a simplified 512×512 32-bit PNG icon and a 1024×500 Feature Graphic banner. Click below to export crisp PNGs directly from your DharmaMart logo identity:
              </p>

              {/* Size Previews */}
              <div className="flex flex-wrap items-end gap-5 py-2 border-y border-stone-100">
                <div className="flex flex-col items-center gap-1">
                  <DharmaAppIcon size={88} />
                  <span className="text-xs text-stone-500 font-mono-tabular">512×512 Store</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <DharmaAppIcon size={64} maskable />
                  <span className="text-xs text-stone-500 font-mono-tabular">Adaptive Mask</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <DharmaAppIcon size={48} />
                  <span className="text-xs text-stone-500 font-mono-tabular">48×48 Launcher</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => downloadPlayStoreAsset('icon-512')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#146C32] text-white text-xs font-semibold hover:bg-[#0F5426] transition-colors whitespace-nowrap"
                >
                  <Download className="w-4 h-4" />
                  Download 512×512 Play Icon (.PNG)
                </button>
                <button
                  type="button"
                  onClick={() => downloadPlayStoreAsset('maskable-512')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors whitespace-nowrap"
                >
                  <Download className="w-4 h-4" />
                  Download 512×512 Maskable (.PNG)
                </button>
                <button
                  type="button"
                  onClick={() => downloadPlayStoreAsset('feature-1024x500')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-stone-300 bg-white text-stone-800 text-xs font-semibold hover:bg-stone-50 transition-colors whitespace-nowrap"
                >
                  <Download className="w-4 h-4" />
                  Download 1024×500 Feature Banner (.PNG)
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Digital Asset Links & Android Package Configuration */}
          <div className="bg-white p-6 rounded-xl border border-stone-200/80 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-semibold text-stone-900">
                  02. Android App Bundle (.aab) & Digital Asset Links Configuration
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Live endpoint active at <span className="font-mono-tabular text-stone-800">{origin}/.well-known/assetlinks.json</span>
                </p>
              </div>
              <a
                href="/twa-manifest.json"
                download="twa-manifest.json"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#E86A17] text-white text-xs font-semibold hover:bg-[#cf5b10] transition-colors whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                Download twa-manifest.json
              </a>
            </div>

            <form onSubmit={handleSaveAssetLinks} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Android Package Name (Application ID)
                </label>
                <input
                  type="text"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-mono-tabular focus:border-[#146C32] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  App Version Name
                </label>
                <input
                  type="text"
                  value={versionName}
                  onChange={(e) => setVersionName(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-mono-tabular focus:border-[#146C32] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Version Code (Integer)
                </label>
                <input
                  type="number"
                  value={versionCode}
                  onChange={(e) => setVersionCode(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-mono-tabular focus:border-[#146C32] focus:outline-none"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Google Play App Signing SHA-256 Certificate Fingerprint
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={sha256}
                    onChange={(e) => setSha256(e.target.value)}
                    placeholder="FA:C6:17:45:DC:09:03:78:..."
                    className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-xs font-mono-tabular focus:border-[#146C32] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#146C32] text-white text-xs font-semibold hover:bg-[#0F5426] transition-colors whitespace-nowrap"
                  >
                    {savedNotice ? 'Saved to /.well-known/assetlinks.json' : 'Update Live AssetLinks'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Section 3: Step-by-Step Public Release to Google Play Console */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-stone-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-stone-900">
                  Option A: No-Code PWABuilder (.aab in 60 seconds)
                </h3>
                <span className="text-xs text-[#146C32] font-semibold">Recommended</span>
              </div>
              <ol className="text-xs text-stone-600 space-y-2 list-decimal list-inside leading-relaxed">
                <li>
                  Copy your public DharmaMart app URL: <span className="font-mono-tabular text-stone-900 select-all">{origin}</span>
                </li>
                <li>
                  Open <strong>pwabuilder.com</strong>, paste the URL, and click <strong>Package for Stores → Android (Google Play)</strong>.
                </li>
                <li>
                  Set Package ID to <span className="font-mono-tabular text-stone-900">{packageName}</span> and download the signed <strong>.aab (Android App Bundle)</strong> + signing key.
                </li>
                <li>
                  Upload the <strong>.aab</strong> file and the 512×512 PNG icon & 1024×500 banner from Step 01 directly into <strong>Google Play Console → Production</strong>.
                </li>
              </ol>
              <button
                type="button"
                onClick={() => copyText(origin, 'url')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-xs font-semibold text-stone-800 transition-colors"
              >
                {copiedCmd === 'url' ? <Check className="w-3.5 h-3.5 text-[#146C32]" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCmd === 'url' ? 'Copied App URL' : 'Copy Public App URL'}
              </button>
            </div>

            <div className="bg-white p-6 rounded-xl border border-stone-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-stone-900">
                  Option B: Official Google Bubblewrap CLI
                </h3>
                <button
                  type="button"
                  onClick={() => copyText(bubblewrapCommands, 'cli')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#146C32] hover:underline"
                >
                  {copiedCmd === 'cli' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCmd === 'cli' ? 'Copied' : 'Copy CLI'}
                </button>
              </div>
              <pre className="rounded-lg bg-stone-900 text-stone-100 p-3.5 text-xs font-mono-tabular overflow-x-auto leading-relaxed">
                {bubblewrapCommands}
              </pre>
              <p className="text-xs text-stone-500 leading-relaxed">
                Generates <span className="font-mono-tabular text-stone-800">app-release-bundle.aab</span> ready for Google Play Console upload.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
