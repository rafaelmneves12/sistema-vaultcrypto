import { useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Camera, Check, Pencil, X } from "lucide-react";
import { toast } from "sonner";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Panel } from "@/components/dashboard/Panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { usePreferences } from "@/context/PreferencesContext";
import { useMarketAssets } from "@/hooks/use-market";
import { readActivity, readPortfolio, valuePortfolio } from "@/lib/portfolio";
import { formatCurrency, formatPercent, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Your Profile — Account & Portfolio Stats | VaultX" },
      {
        name: "description",
        content: "Review your VaultX account details, portfolio statistics and recent local account activity.",
      },
      { property: "og:title", content: "Your Profile | VaultX" },
      { property: "og:description", content: "Account details and portfolio statistics." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  ),
});

function Stat({ label, value, tone }: { label: string; value: string; tone?: "up" | "down" }) {
  return (
    <div className="rounded-xl border border-border/60 bg-surface-elevated/50 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          "font-display mt-1 text-lg font-semibold",
          tone === "up" && "text-success",
          tone === "down" && "text-destructive",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { formatDate } = usePreferences();
  const { assets } = useMarketAssets(50);
  const fileRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  const holdings = readPortfolio();
  const summary = useMemo(() => valuePortfolio(holdings, assets), [holdings, assets]);
  const activity = readActivity();

  const best = [...summary.holdings].sort((a, b) => b.changePercent24Hr - a.changePercent24Hr)[0];
  const worst = [...summary.holdings].sort((a, b) => a.changePercent24Hr - b.changePercent24Hr)[0];

  const initials = (user?.name ?? "VX")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  function onAvatarPick(file: File | undefined) {
    if (!file) return;
    if (file.size > 1_500_000) {
      toast.error("Please choose an image smaller than 1.5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateProfile({ avatarUrl: String(reader.result) });
      toast.success("Avatar updated.");
    };
    reader.readAsDataURL(file);
  }

  function saveProfile() {
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    updateProfile({ name: name.trim(), email: email.trim() });
    setEditing(false);
    toast.success("Profile updated.");
  }

  return (
    <DashboardShell>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your account details are stored only in this browser.
        </p>
      </motion.div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="Personal Information" className="lg:col-span-2">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-24 w-24 ring-1 ring-primary/25">
                {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={`${user?.name} avatar`} />}
                <AvatarFallback className="bg-primary/15 text-xl font-semibold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                aria-label="Upload profile picture"
                onChange={(e) => onAvatarPick(e.target.files?.[0])}
              />
              <Button variant="outline" size="sm" className="gap-2" onClick={() => fileRef.current?.click()}>
                <Camera className="h-4 w-4" /> Upload Avatar
              </Button>
            </div>

            <div className="min-w-0 flex-1 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Full Name</Label>
                <Input
                  id="profile-name"
                  value={editing ? name : (user?.name ?? "")}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!editing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-email">Email Address</Label>
                <Input
                  id="profile-email"
                  type="email"
                  value={editing ? email : (user?.email ?? "")}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!editing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-since">Member Since</Label>
                <Input
                  id="profile-since"
                  value={user?.createdAt ? formatDate(user.createdAt) : "—"}
                  disabled
                  readOnly
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {editing ? (
                  <>
                    <Button onClick={saveProfile} className="gap-2">
                      <Check className="h-4 w-4" /> Save Changes
                    </Button>
                    <Button
                      variant="ghost"
                      className="gap-2"
                      onClick={() => {
                        setEditing(false);
                        setName(user?.name ?? "");
                        setEmail(user?.email ?? "");
                      }}
                    >
                      <X className="h-4 w-4" /> Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => {
                      setName(user?.name ?? "");
                      setEmail(user?.email ?? "");
                      setEditing(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" /> Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Portfolio Statistics" description="Valued at live market prices">
          <div className="grid gap-3">
            <Stat label="Total Value" value={formatCurrency(summary.totalValueUsd)} />
            <Stat
              label="Total Profit / Loss"
              value={`${formatCurrency(summary.totalPnlUsd)} (${formatPercent(summary.totalPnlPercent)})`}
              tone={summary.totalPnlUsd >= 0 ? "up" : "down"}
            />
            <Stat label="Assets Tracked" value={String(summary.holdings.length)} />
          </div>
        </Panel>

        <Panel title="Investment Summary" className="lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Invested Cost" value={formatCurrency(summary.totalCostUsd)} />
            <Stat
              label="Today's P&L"
              value={formatCurrency(summary.dayPnlUsd)}
              tone={summary.dayPnlUsd >= 0 ? "up" : "down"}
            />
            <Stat
              label="Best Performer"
              value={best ? `${best.symbol} ${formatPercent(best.changePercent24Hr)}` : "—"}
              tone={best && best.changePercent24Hr >= 0 ? "up" : "down"}
            />
            <Stat
              label="Worst Performer"
              value={worst ? `${worst.symbol} ${formatPercent(worst.changePercent24Hr)}` : "—"}
              tone={worst && worst.changePercent24Hr >= 0 ? "up" : "down"}
            />
          </div>
        </Panel>

        <Panel title="Account Activity" description="Stored locally">
          {activity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
          ) : (
            <ul className="space-y-3">
              {activity.slice(0, 8).map((item) => (
                <li key={item.id} className="border-l-2 border-primary/40 pl-3">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  {item.detail && <p className="text-xs text-muted-foreground">{item.detail}</p>}
                  <p className="text-xs text-muted-foreground/80">{timeAgo(item.at)}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </DashboardShell>
  );
}
