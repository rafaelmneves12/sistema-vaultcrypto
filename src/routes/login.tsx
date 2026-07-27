import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { SocialButtons } from "@/components/auth/SocialButtons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import { EMAIL_RE } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — VaultX Crypto Portfolio" },
      {
        name: "description",
        content:
          "Sign in to VaultX to continue tracking live crypto prices and managing your portfolio performance.",
      },
      { property: "og:title", content: "Sign In — VaultX Crypto Portfolio" },
      {
        property: "og:description",
        content: "Access your VaultX workspace to track and analyze your crypto holdings.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, requestPasswordReset } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [success, setSuccess] = useState(false);

  function validate() {
    const next: { email?: string; password?: string } = {};
    if (!email.trim()) next.email = "Email address is required.";
    else if (!EMAIL_RE.test(email.trim())) next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;
    setLoading(true);
    const result = await login({ email, password, remember });
    setLoading(false);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    setSuccess(true);
    toast.success("Welcome back to VaultX.");
    navigate({ to: "/dashboard", replace: true });
  }

  async function onForgotPassword() {
    if (!EMAIL_RE.test(email.trim())) {
      setErrors((p) => ({ ...p, email: "Enter your email first so we can send a reset link." }));
      return;
    }
    setResetting(true);
    const result = await requestPasswordReset(email);
    setResetting(false);
    if (result.ok) toast.success(`Reset link sent to ${email.trim()} (simulated).`);
    else toast.error(result.error);
  }

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to continue managing your crypto portfolio.">
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <AnimatePresence initial={false}>
          {formError && (
            <motion.div
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -6, height: 0 }}
              className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
              role="alert"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-400"
            >
              <CheckCircle2 className="h-4 w-4" /> Signed in — redirecting to your dashboard…
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            aria-invalid={Boolean(errors.email)}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((p) => ({ ...p, email: undefined }));
            }}
            className={errors.email ? "border-destructive focus-visible:ring-destructive/40" : ""}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              aria-invalid={Boolean(errors.password)}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((p) => ({ ...p, password: undefined }));
              }}
              className={`pr-10 ${errors.password ? "border-destructive focus-visible:ring-destructive/40" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 grid w-10 place-items-center text-muted-foreground transition-colors hover:text-foreground"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>

        <div className="flex items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <Checkbox checked={remember} onCheckedChange={(v) => setRemember(v === true)} />
            Remember Me
          </label>
          <button
            type="button"
            onClick={onForgotPassword}
            disabled={resetting}
            className="text-sm font-medium text-primary transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {resetting ? "Sending…" : "Forgot Password?"}
          </button>
        </div>

        <Button type="submit" disabled={loading} className="w-full shadow-[0_0_30px_-10px_var(--primary)]">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign In
        </Button>

        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs uppercase tracking-wide text-muted-foreground">or continue with</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <SocialButtons />

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-primary hover:opacity-80">
            Create an Account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
