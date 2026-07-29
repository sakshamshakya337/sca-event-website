import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export default function NetworkStatus() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 w-full bg-amber-500 text-white z-[9999] px-4 py-2 flex items-center justify-center gap-2 shadow-md transition-all">
      <WifiOff size={16} />
      <span className="text-sm font-semibold">Offline Mode</span>
      <span className="text-xs opacity-90 hidden sm:inline">— Viewing cached content.</span>
    </div>
  );
}
