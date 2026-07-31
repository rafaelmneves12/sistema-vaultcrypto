import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, BellOff, Check, CheckCheck, LineChart, Trash2, TrendingUp, Wallet } from "lucide-react";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Panel } from "@/components/dashboard/Panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/context/NotificationsContext";
import { usePreferences } from "@/context/PreferencesContext";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { NotificationKind } from "@/lib/notifications";

export const Route = createFileRoute("/notifications")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Notifications — Portfolio & Price Alerts | VaultX" },
      {
        name: "description",
        content: "Local alerts for big price moves, portfolio all-time highs and portfolio updates.",
      },
      { property: "og:title", content: "Notifications | VaultX" },
      { property: "og:description", content: "Your local portfolio and price alerts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <NotificationsPage />
    </ProtectedRoute>
  ),
});

const ICONS: Record<NotificationKind, typeof Bell> = {
  price: TrendingUp,
  portfolio: Wallet,
  system: Bell,
};

function NotificationsPage() {
  const { items, unread, ready, markRead, markAllRead, remove, clearAll } = useNotifications();
  const { formatDate } = usePreferences();

  return (
    <DashboardShell>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Alerts generated locally from your portfolio and live market data.
          </p>
        </div>
        {items.length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={markAllRead} disabled={unread === 0} className="gap-2">
              <CheckCheck className="h-4 w-4" /> Mark all as read
            </Button>
            <Button variant="ghost" size="sm" onClick={clearAll} className="gap-2">
              <Trash2 className="h-4 w-4" /> Clear
            </Button>
          </div>
        )}
      </motion.div>

      <div className="mt-6">
        {ready && items.length === 0 ? (
          <Panel>
            <div className="flex flex-col items-center py-12 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/25">
                <BellOff className="h-6 w-6" />
              </span>
              <p className="font-display mt-4 text-lg font-semibold">You're all caught up.</p>
              <p className="mt-1 text-sm text-muted-foreground">No new notifications at the moment.</p>
              <Button asChild className="mt-6 gap-2">
                <Link to="/market">
                  <LineChart className="h-4 w-4" /> Explore Market
                </Link>
              </Button>
            </div>
          </Panel>
        ) : (
          <ul className="space-y-3">
            <AnimatePresence initial={false}>
              {items.map((n) => {
                const Icon = ICONS[n.kind];
                return (
                  <motion.li
                    key={n.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 24, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.28 }}
                    className={cn(
                      "glass-panel flex items-start gap-4 rounded-2xl p-4 transition-colors",
                      !n.read && "ring-1 ring-primary/30",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1",
                        n.read
                          ? "bg-secondary/60 text-muted-foreground ring-border"
                          : "bg-primary/15 text-primary ring-primary/25",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{n.title}</p>
                        {!n.read && (
                          <Badge className="h-5 bg-primary/20 text-[10px] text-primary hover:bg-primary/20">New</Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                      <p className="mt-1.5 text-xs text-muted-foreground/80" title={formatDate(n.at)}>
                        {timeAgo(n.at)}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {!n.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Mark as read"
                          onClick={() => markRead(n.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Remove notification"
                        onClick={() => remove(n.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </DashboardShell>
  );
}
