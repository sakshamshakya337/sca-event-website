import { useState, useEffect } from 'react';
import { Download, X, CheckCircle2, MonitorSmartphone } from 'lucide-react';

export default function CustomInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // If standalone (already installed), do nothing
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      return;
    }

    // Check localStorage
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const postponed = localStorage.getItem('pwa-install-postponed');

    if (dismissed === 'true') return;

    if (postponed) {
      const postponeDate = new Date(postponed);
      if (new Date() < postponeDate) return;
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show immediately if we have a prompt, or delay slightly
      setTimeout(() => setShowPrompt(true), 2000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If iOS and not standalone, show iOS manual install prompt
    if (isIosDevice && !window.navigator.standalone) {
       setTimeout(() => setShowPrompt(true), 2000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
      setJustInstalled(true);
      setTimeout(() => setJustInstalled(false), 5000); // Hide success after 5s
    }
    setDeferredPrompt(null);
  };

  const handleLater = () => {
    setShowPrompt(false);
    // Postpone for 3 days
    const date = new Date();
    date.setDate(date.getDate() + 3);
    localStorage.setItem('pwa-install-postponed', date.toISOString());
  };

  const handleNever = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (justInstalled) {
    return (
      <div className="fixed z-[9999] bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/90 backdrop-blur-xl border border-[#c4c6cf] shadow-2xl rounded-2xl p-5 flex flex-col items-center text-center animate-in slide-in-from-bottom-5 fade-in duration-300">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
          <CheckCircle2 className="text-green-600" size={24} />
        </div>
        <h3 className="text-lg font-bold text-[#022448]">SCA Portal Installed</h3>
        <p className="text-sm text-[#43474e] mt-1">Thank you for installing SCA Portal. Enjoy a faster and more reliable experience.</p>
      </div>
    );
  }

  if (!showPrompt) return null;

  return (
    <div className="fixed z-[9999] bottom-0 left-0 right-0 sm:bottom-6 sm:left-auto sm:right-6 sm:w-96 bg-white/80 backdrop-blur-2xl border border-[#c4c6cf] sm:rounded-2xl rounded-t-2xl shadow-2xl p-6 animate-in slide-in-from-bottom-full fade-in duration-500">
      <button onClick={handleLater} className="absolute top-4 right-4 text-[#74777f] hover:text-[#022448] transition-colors">
        <X size={20} />
      </button>

      <div className="flex items-start gap-4 mb-4">
        <img src="/pwa-192x192.png" alt="App Icon" className="w-14 h-14 rounded-xl shadow-sm border border-[#e4e9ed]" />
        <div>
          <h3 className="text-lg font-bold text-[#022448]">Install SCA Portal</h3>
          <p className="text-xs text-[#43474e] mt-0.5 leading-relaxed">Access the portal directly from your home screen for a faster, distraction-free experience.</p>
        </div>
      </div>

      {!isIOS ? (
        <div className="space-y-3 mb-6 bg-[#f0f4f8]/50 p-3 rounded-xl border border-[#e4e9ed]/50">
          <div className="flex items-center gap-2 text-sm text-[#171c1f]">
            <MonitorSmartphone size={16} className="text-primary" />
            <span className="font-semibold">Native Experience</span>
          </div>
          <div className="text-xs text-[#43474e] pl-6 space-y-1">
            <p>✓ Faster Launch</p>
            <p>✓ Works Offline</p>
            <p>✓ Secure Login</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3 mb-6 bg-[#f0f4f8]/50 p-3 rounded-xl border border-[#e4e9ed]/50 text-sm">
          <p className="font-semibold text-[#171c1f] mb-1">To install on iOS:</p>
          <ol className="list-decimal pl-5 space-y-1 text-xs text-[#43474e]">
            <li>Tap the <strong>Share</strong> button below.</li>
            <li>Select <strong>Add to Home Screen</strong>.</li>
          </ol>
        </div>
      )}

      {!isIOS && (
        <div className="flex flex-col gap-2">
          <button 
            onClick={handleInstall}
            className="w-full bg-primary text-white font-semibold py-3 rounded-xl shadow-md hover:bg-primary/90 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Download size={18} /> Install Application
          </button>
          <div className="flex justify-between mt-1">
            <button onClick={handleLater} className="text-xs font-semibold text-[#74777f] hover:text-[#022448] py-2 px-3 rounded-lg hover:bg-[#f0f4f8] transition-colors">
              Later
            </button>
            <button onClick={handleNever} className="text-xs font-semibold text-red-500 hover:text-red-700 py-2 px-3 rounded-lg hover:bg-red-50 transition-colors">
              Never Show Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
