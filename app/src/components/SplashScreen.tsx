/**
 * Splash Screen Component - AUREX Civic Issue Reporting System
 * 
 * Displays animated GIF while app is initializing/loading
 */

import React, { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // once the GIF has loaded we keep it visible for its duration
    // (approx. 3s here, adjust as necessary or compute dynamically)
    if (isLoaded) {
      const timer = setTimeout(() => setIsVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 w-screen h-screen z-50 bg-black overflow-hidden">
      {/* Full Screen GIF - Shows while app is loading */}
      <img
        src="/Gif-landing.gif"
        alt="AUREX Loading"
        className="w-full h-full object-contain"
        draggable={false}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
}
