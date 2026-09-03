"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AlertTriangle, Clock } from "lucide-react";

const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const WARNING_BEFORE_MS = 60 * 1000; // 60 seconds warning

export function InactivityManager() {
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearAllTimers = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  };

  const handleLogout = async () => {
    clearAllTimers();
    setShowWarning(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login?reason=inactivity");
    router.refresh();
  };

  const resetTimers = () => {
    clearAllTimers();
    if (showWarning) setShowWarning(false);

    // Set timer for warning
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      setSecondsRemaining(60);

      countdownIntervalRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            void handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, IDLE_TIMEOUT_MS - WARNING_BEFORE_MS);

    // Backup hard logout timer
    idleTimerRef.current = setTimeout(() => {
      void handleLogout();
    }, IDLE_TIMEOUT_MS);
  };

  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart", "focus"];

    const handleUserActivity = () => {
      if (!showWarning) {
        resetTimers();
      }
    };

    events.forEach((event) => window.addEventListener(event, handleUserActivity, { passive: true }));
    resetTimers();

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleUserActivity));
      clearAllTimers();
    };
  }, [showWarning]);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm transition-opacity duration-200">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3 text-amber-600">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-amber-100">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Session Inactivity Warning</h3>
            <p className="text-xs text-slate-500">e-Vibali Chalinze Security Directive</p>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-600">
          You have been inactive for a while. For government data security, your session will automatically log out in:
        </p>

        <div className="my-5 flex items-center justify-center gap-2 rounded-xl bg-amber-50 py-3 text-amber-900 font-mono text-2xl font-bold border border-amber-200">
          <Clock className="h-6 w-6 text-amber-600 animate-pulse" />
          <span>{secondsRemaining}s</span>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Log Out Now
          </button>
          <button
            type="button"
            onClick={() => resetTimers()}
            className="rounded-lg bg-brand-government px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-brand-moss shadow-sm"
          >
            Stay Signed In
          </button>
        </div>
      </div>
    </div>
  );
}
