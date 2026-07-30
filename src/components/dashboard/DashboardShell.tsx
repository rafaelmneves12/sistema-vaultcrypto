import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  Bell,
  BookOpen,
  Briefcase,
  LayoutDashboard,
  LineChart,
  LogOut,
  Menu,
  Search,
  Settings,
  Star,
  Vault,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const NAV = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" as const, ready: true },
  { label: "Portfolio", icon: Briefcase, to: "/portfolio" as const, ready: true },
  { label: "Market", icon: LineChart, to: "/market" as const, ready: true },
  { label: "Watchlist", icon: Star, to: "/watchlist" as const, ready: true },
  { label: "Learn", icon: BookOpen, ready: false },
  { label: "Settings", icon: Settings, ready: false },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="space-y-1">
      {NAV.map((item) => {
        const classes =
          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors";
        if (item.ready && item.to) {
          return (
            <Link
              key={item.label}
              to={item.to}
              onClick={onNavigate}
              activeProps={{ className: "bg-primary/15 text-primary ring-1 ring-primary/25" }}
              inactiveProps={{ className: "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground" }}
              className={classes}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        }
        return (
          <button
            key={item.label}
            type="button"
            disabled
            className={cn(classes, "cursor-not-allowed text-muted-foreground/60")}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{item.label}</span>
            <Badge variant="outline" className="ml-auto shrink-0 text-[10px] font-medium">
              Soon
            </Badge>
          </button>
        );
      })}
    </nav>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <Link to="/" className="flex items-center gap-2 px-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
          <Vault className="h-5 w-5" />
        </span>
        <span className="font-display text-lg font-bold tracking-tight">VaultX</span>
      </Link>
      <NavList onNavigate={onNavigate} />
      <div className="mt-auto rounded-2xl border border-border/60 bg-surface-elevated/60 p-4">
        <p className="text-xs font-semibold text-foreground">Track. Analyze. Grow.</p>
        <p className="mt-1 text-xs text-muted-foreground">
          VaultX never buys, sells or transfers assets — tracking only.
        </p>
      </div>
    </div>
  );
}

export function DashboardShell({
  children,
  notifications = 0,
}: {
  children: ReactNode;
  notifications?: number;
}) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const initials = (user?.name ?? "VX")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-sidebar-border bg-sidebar lg:block">
        <SidebarBody />
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-xl">
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-sidebar p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <SidebarBody onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>

            <div className="relative min-w-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search assets, symbols..."
                aria-label="Search assets"
                className="h-10 w-full max-w-md pl-9"
              />
            </div>

            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                    {notifications > 9 ? "9+" : notifications}
                  </span>
                )}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-accent">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="truncate">
                    <span className="block truncate text-sm font-semibold">{user?.name}</span>
                    <span className="block truncate text-xs font-normal text-muted-foreground">{user?.email}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="gap-2">
                    <LogOut className="h-4 w-4" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
