import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import { EMAIL_RE, scorePassword } from "@/lib/auth";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create Account — VaultX Crypto Portfolio" },
      {
        name: "description",
        content:
          "Create your free VaultX account and start tracking your cryptocurrency portfolio performance today.",
      },
      { property: "og:title", content: "Create Account — VaultX Crypto Portfolio" },
      {
        property: "og:description",
        content: "Start tracking your cryptocurrency portfolio with VaultX in under a minute.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RegisterPage,
});

type Errors = Partial<Record<"name" | "email" | "password" | "confirm" | "terms", string>>;

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => scorePassword(password), [password]);

  function validate() {
    const next: Errors = {};
    if (!name.trim()) next.name = "Full name is required.";
    else if (name.trim().length < 2) next.name = "Enter your full name.";
    if (!email.trim()) next.email = "Email address is required.";
    else if (!EMAIL_RE.test(email.trim())) next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    else if (password.length < 8) next.password = "Use at least 8 characters.";
    if (confirm !== password) next.confirm = "Passwords do not match.";
    if (!agreed) next.terms = "You must accept the Terms of Service.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;
    setLoading(true);
    const result = await register({ name, email, password });
    setLoading(false);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    toast.success("Account created — welcome to VaultX.");
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <AuthLayout title="Create Your Account" subtitle="Start tracking your cryptocurrency portfolio today.">
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
        </AnimatePresence>

        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Ada Lovelace"
            value={name}
            aria-invalid={Boolean(errors.name)}
            onChange={(e) => {
              setName(e.target.value);
              setErrors((p) => ({ ...p, name: undefined }));
            }}
            className={errors.name ? "border-destructive focus-visible:ring-destructive/40" : ""}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>

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
              autoComplete="new-password"
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

          {password.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex gap-1.5">
                {[1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      strength.score >= i ? strength.color : "bg-border"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Password strength: <span className="font-medium text-foreground">{strength.label}</span>
              </p>
            </div>
          )}
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm Password</Label>
          <Input
            id="confirm"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirm}
            aria-invalid={Boolean(errors.confirm)}
            onChange={(e) => {
              setConfirm(e.target.value);
              setErrors((p) => ({ ...p, confirm: undefined }));
            }}
            className={errors.confirm ? "border-destructive focus-visible:ring-destructive/40" : ""}
          />
          {errors.confirm && <p className="text-xs text-destructive">{errors.confirm}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="flex cursor-pointer items-start gap-2.5 text-sm text-muted-foreground">
            <Checkbox
              className="mt-0.5"
              checked={agreed}
              onCheckedChange={(v) => {
                setAgreed(v === true);
                setErrors((p) => ({ ...p, terms: undefined }));
              }}
            />
            <span>
              I agree to the <span className="text-foreground underline underline-offset-4">Terms of Service</span>{" "}
              and <span className="text-foreground underline underline-offset-4">Privacy Policy</span>.
            </span>
          </label>
          {errors.terms && <p className="text-xs text-destructive">{errors.terms}</p>}
        </div>

        <Button type="submit" disabled={loading} className="w-full shadow-[0_0_30px_-10px_var(--primary)]">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Account
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:opacity-80">
            Sign In
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
