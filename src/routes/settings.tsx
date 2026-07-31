import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Loader2, LogOut, Monitor, Moon, Save, ShieldCheck, Sun, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Panel } from "@/components/dashboard/Panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/AuthContext";
import { usePreferences, TIMEZONES, type Preferences } from "@/context/PreferencesContext";
import { CURRENCIES, type CurrencyCode } from "@/lib/format";
import { removeItem, STORAGE_KEYS } from "@/lib/storage";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Settings — Appearance, Currency & Privacy | VaultX" },
      {
        name: "description",
        content: "Choose your theme, language, display currency, time zone and notification preferences.",
      },
      { property: "og:title", content: "Settings | VaultX" },
      { property: "og:description", content: "Preferences that stay in your browser." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <SettingsPage />
    </ProtectedRoute>
  ),
});

function Row({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 py-4 last:border-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

function SettingsPage() {
  const navigate = useNavigate();
  const { preferences, save, t } = usePreferences();
  const { logout, changePassword, deleteAccount } = useAuth();
  const [draft, setDraft] = useState<Preferences>(preferences);
  const [pwd, setPwd] = useState({ current: "", next: "" });
  const [pwdBusy, setPwdBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => setDraft(preferences), [preferences]);

  function patch(next: Partial<Preferences>) {
    setDraft((current) => ({ ...current, ...next }));
  }

  function onSave() {
    save(draft);
    toast.success(t("settings.saved"));
  }

  async function onChangePassword() {
    if (pwd.current.length < 6 || pwd.next.length < 6) {
      toast.error("Passwords must be at least 6 characters.");
      return;
    }
    setPwdBusy(true);
    const result = await changePassword({ current: pwd.current, next: pwd.next });
    setPwdBusy(false);
    if (result.ok) {
      setPwd({ current: "", next: "" });
      toast.success("Password changed.");
    } else {
      toast.error(result.error);
    }
  }

  async function onDeleteAccount() {
    setDeleting(true);
    const result = await deleteAccount();
    if (!result.ok) {
      setDeleting(false);
      toast.error(result.error);
      return;
    }
    // Wipe every local trace of this user.
    Object.values(STORAGE_KEYS).forEach((key) => removeItem(key));
    removeItem("vaultx:activity");
    removeItem("vaultx:portfolio-ath");
    removeItem("vaultx:market-cache");
    toast.success("Account and local data deleted.");
    navigate({ to: "/", replace: true });
  }

  return (
    <DashboardShell>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{t("settings.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("settings.subtitle")}</p>
      </motion.div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title={t("settings.appearance")} description="Applied instantly across the app">
          <div className="flex gap-2">
            {(
              [
                { value: "dark", label: "Dark", icon: Moon },
                { value: "light", label: "Light", icon: Sun },
              ] as const
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  patch({ theme: option.value });
                  save({ ...draft, theme: option.value });
                }}
                aria-pressed={draft.theme === option.value}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors",
                  draft.theme === option.value
                    ? "border-primary/50 bg-primary/15 text-primary"
                    : "border-border text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <option.icon className="h-4 w-4" />
                {option.label}
              </button>
            ))}
          </div>
          <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Monitor className="h-3.5 w-3.5" /> Theme is saved to this browser only.
          </p>
        </Panel>

        <Panel title="Regional" description="Language, currency and time zone">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pref-language">{t("settings.language")}</Label>
              <Select value={draft.language} onValueChange={(v) => patch({ language: v as Preferences["language"] })}>
                <SelectTrigger id="pref-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="pt">Português (BR)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pref-currency">{t("settings.currency")}</Label>
              <Select value={draft.currency} onValueChange={(v) => patch({ currency: v as CurrencyCode })}>
                <SelectTrigger id="pref-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(CURRENCIES).map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.code} — {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Market data is priced in USD; other currencies use a fixed demo rate.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pref-timezone">{t("settings.timezone")}</Label>
              <Select value={draft.timezone} onValueChange={(v) => patch({ timezone: v })}>
                <SelectTrigger id="pref-timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Panel>

        <Panel title={t("settings.notifications")} description="Which local alerts VaultX creates">
          <Row title="Price alerts" description="Notify on large 24h moves in your holdings.">
            <Switch
              checked={draft.notifications.priceAlerts}
              onCheckedChange={(v) => patch({ notifications: { ...draft.notifications, priceAlerts: v } })}
              aria-label="Toggle price alerts"
            />
          </Row>
          <Row title="Portfolio alerts" description="Notify on new all-time highs and updates.">
            <Switch
              checked={draft.notifications.portfolioAlerts}
              onCheckedChange={(v) => patch({ notifications: { ...draft.notifications, portfolioAlerts: v } })}
              aria-label="Toggle portfolio alerts"
            />
          </Row>
          <Row title="Product updates" description="Occasional notes about new VaultX features.">
            <Switch
              checked={draft.notifications.productUpdates}
              onCheckedChange={(v) => patch({ notifications: { ...draft.notifications, productUpdates: v } })}
              aria-label="Toggle product updates"
            />
          </Row>
          <Row title="Email digest" description="Simulated only — no email is ever sent.">
            <Switch
              checked={draft.notifications.email}
              onCheckedChange={(v) => patch({ notifications: { ...draft.notifications, email: v } })}
              aria-label="Toggle email digest"
            />
          </Row>
        </Panel>

        <Panel title={t("settings.privacy")} description="Simulated privacy controls">
          <Row title="Hide balances" description="Blur monetary values in shared screens.">
            <Switch
              checked={draft.privacy.hideBalances}
              onCheckedChange={(v) => patch({ privacy: { ...draft.privacy, hideBalances: v } })}
              aria-label="Toggle hide balances"
            />
          </Row>
          <Row title="Usage analytics" description="Off by default — VaultX collects nothing.">
            <Switch
              checked={draft.privacy.analytics}
              onCheckedChange={(v) => patch({ privacy: { ...draft.privacy, analytics: v } })}
              aria-label="Toggle usage analytics"
            />
          </Row>
          <p className="mt-4 flex items-start gap-2 rounded-xl border border-border/60 bg-surface-elevated/50 p-3 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            Your account, portfolio and preferences never leave this browser. The only network requests VaultX makes
            are read-only market data calls to the CoinCap API.
          </p>
        </Panel>

        <Panel title={t("settings.security")} description="Simulated — nothing leaves your browser">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pwd-current">Current password</Label>
              <Input
                id="pwd-current"
                type="password"
                value={pwd.current}
                onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pwd-next">New password</Label>
              <Input
                id="pwd-next"
                type="password"
                value={pwd.next}
                onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
              />
            </div>
            <Button variant="outline" onClick={onChangePassword} disabled={pwdBusy} className="gap-2">
              {pwdBusy && <Loader2 className="h-4 w-4 animate-spin" />} Change Password
            </Button>
          </div>
        </Panel>

        <Panel title="Account" description="Session and data controls">
          <div className="flex flex-wrap gap-2">
            <Button onClick={onSave} className="gap-2">
              <Save className="h-4 w-4" /> {t("settings.save")}
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                logout();
                navigate({ to: "/", replace: true });
              }}
            >
              <LogOut className="h-4 w-4" /> {t("common.logout")}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" /> Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently removes your account, portfolio, watchlist, notifications and preferences from
                    this browser. It cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete everything"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}
