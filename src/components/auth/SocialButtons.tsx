import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

type Provider = "google" | "github" | "microsoft";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5a4.7 4.7 0 0 1-2 3.1l3.2 2.5c1.9-1.7 3-4.3 3-7.3 0-.7-.1-1.4-.2-2H12z" />
      <path fill="#34A853" d="M6.6 14.3 5.9 15l-2.5 2A9 9 0 0 0 12 21c2.4 0 4.5-.8 6-2.2l-3.2-2.5c-.8.6-1.9.9-2.8.9-2.3 0-4.2-1.5-4.9-3.6z" />
      <path fill="#4A90E2" d="M3.4 7A9 9 0 0 0 3 12c0 1.7.4 3.3 1 4.7L7.1 14a5.4 5.4 0 0 1 0-3.4z" />
      <path fill="#FBBC05" d="M12 6.6c1.3 0 2.5.5 3.4 1.4l2.6-2.6A9 9 0 0 0 3.4 7l3.1 2.5c.7-2.1 2.6-2.9 5.5-2.9z" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="#F25022" d="M3 3h8.5v8.5H3z" />
      <path fill="#7FBA00" d="M12.5 3H21v8.5h-8.5z" />
      <path fill="#00A4EF" d="M3 12.5h8.5V21H3z" />
      <path fill="#FFB900" d="M12.5 12.5H21V21h-8.5z" />
    </svg>
  );
}

const PROVIDERS: { id: Provider; label: string; icon: () => JSX.Element }[] = [
  { id: "google", label: "Continue with Google", icon: GoogleIcon },
  { id: "github", label: "Continue with GitHub", icon: GithubIcon },
  { id: "microsoft", label: "Continue with Microsoft", icon: MicrosoftIcon },
];

export function SocialButtons() {
  const { socialSignIn } = useAuth();
  const [pending, setPending] = useState<Provider | null>(null);

  async function handle(provider: Provider, label: string) {
    setPending(provider);
    const result = await socialSignIn(provider);
    setPending(null);
    if (result.ok) toast.success(`${label} connected.`);
    else toast.info(result.error);
  }

  return (
    <div className="grid gap-2">
      {PROVIDERS.map(({ id, label, icon: Icon }) => (
        <Button
          key={id}
          type="button"
          variant="outline"
          disabled={pending !== null}
          onClick={() => handle(id, label.replace("Continue with ", ""))}
          className="w-full justify-center gap-2"
        >
          {pending === id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon />}
          {label}
        </Button>
      ))}
    </div>
  );
}
