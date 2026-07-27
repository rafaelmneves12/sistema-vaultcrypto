import { useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/context/AuthContext";

/**
 * Client-side guard for private pages (dashboard, portfolio, market,
 * watchlist, learn, settings, profile, notifications).
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, ready } = useAuth();
  const navigate = useNavigate();
  const wasAuthenticated = useRef(false);

  useEffect(() => {
    if (!ready) return;
    if (isAuthenticated) {
      wasAuthenticated.current = true;
      return;
    }
    // signed out from within the app -> landing page; never signed in -> login
    navigate({ to: wasAuthenticated.current ? "/" : "/login", replace: true });
  }, [ready, isAuthenticated, navigate]);

  if (!ready || !isAuthenticated) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
