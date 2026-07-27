import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Vault } from "lucide-react";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Dashboard — VaultX Portfolio Overview" },
      {
        name: "description",
        content: "Your private VaultX dashboard with portfolio overview, holdings and market performance.",
      },
      { property: "og:title", content: "Dashboard — VaultX Portfolio Overview" },
      { property: "og:description", content: "Your private VaultX crypto portfolio workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  ),
});

function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    // navigate away first so the route guard doesn't bounce to /login
    await navigate({ to: "/", replace: true });
    logout();
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
              <Vault className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">VaultX</span>
          </Link>
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Welcome back, {user?.name?.split(" ")[0] ?? "investor"}.
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your session is active and stored locally. Portfolio widgets arrive in the next step.
        </p>
      </main>
    </div>
  );
}
