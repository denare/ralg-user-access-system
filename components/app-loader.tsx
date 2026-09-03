"use client";

import { useEffect, useState } from "react";

export function AppLoader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fast initial fade out once mounted
    const timer = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-md transition-opacity duration-300">
      <div className="relative flex items-center justify-center">
        {/* Animated glowing orbit ring */}
        <div className="absolute h-24 w-24 rounded-full border-2 border-transparent border-t-brand-gold border-r-brand-government animate-spin duration-700 shadow-[0_0_15px_rgba(30,180,233,0.5)]" />
        <div className="absolute h-28 w-28 rounded-full border border-white/20 animate-ping opacity-25" />

        {/* Center Chalinze Council Logo */}
        <div className="relative grid h-16 w-16 place-items-center rounded-2xl bg-white p-2 shadow-2xl">
          <img
            src="/branding/HalmashauriYaChalinze.png"
            alt="Chalinze Logo"
            className="h-12 w-12 object-contain"
          />
        </div>
      </div>
      <div className="mt-6 text-center">
        <p className="font-serif text-sm font-bold tracking-widest text-white uppercase drop-shadow-sm">
          e-Vibali Chalinze
        </p>
        <p className="mt-1 text-[10px] font-semibold text-white/80 uppercase tracking-widest">
          Halmashauri ya Wilaya ya Chalinze
        </p>
      </div>
    </div>
  );
}
