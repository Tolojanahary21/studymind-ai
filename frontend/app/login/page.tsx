"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Fraunces, Inter } from "next/font/google";

// Swap these for your project's existing font setup if you already
// load fonts globally in app/layout.tsx — no need to duplicate here.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-display",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

// Move the hardcoded URL into an env var so dev/staging/prod can differ
// without touching code. Add NEXT_PUBLIC_API_URL to your .env.local.
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const GOLD = "#C9A227";
const INK = "#10161F";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Identifiants incorrects.");
      }

      localStorage.setItem("token", data.access_token);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue. Réessayez."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={`${fraunces.variable} ${inter.variable} font-[family-name:var(--font-body)]`}>
      <div className="flex min-h-screen">
        {/* Brand panel — visible from lg breakpoint up */}
        <div
          className="relative hidden w-[42%] flex-col justify-between p-12 lg:flex"
          style={{ backgroundColor: INK }}
        >
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: GOLD }} />

          <div>
            <div className="mb-6 h-[3px] w-10" style={{ backgroundColor: GOLD }} />
            <p className="font-[family-name:var(--font-display)] text-4xl font-medium leading-tight text-[#F7F4EC]">
              Bon retour
              <br />
              parmi nous.
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#9A9489]">
              Connectez-vous pour retrouver votre espace, vos données et vos
              équipes là où vous les avez laissés.
            </p>
          </div>

          <p className="text-xs text-[#6E695F]">© {new Date().getFullYear()}</p>
        </div>

        {/* Form panel */}
        <div className="flex flex-1 items-center justify-center bg-white px-6 py-12 sm:px-10">
          <div className="w-full max-w-sm">
            <div className="mb-8 h-[3px] w-10 lg:hidden" style={{ backgroundColor: GOLD }} />

            <h1 className="font-[family-name:var(--font-display)] text-3xl font-medium text-[#171412]">
              Connexion
            </h1>
            <p className="mt-2 text-sm text-[#6B6B66]">
              Entrez vos identifiants pour accéder à votre compte.
            </p>

            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="mt-6 border-l-2 border-[#B3261E] bg-[#FBEAEA] px-4 py-3 text-sm text-[#7A1F1A]"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-[#171412]"
                >
                  Adresse e-mail
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={isLoading}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-md border border-[#DEDAD0] px-3.5 py-2.5 text-[#171412] outline-none transition focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/30 disabled:bg-[#F7F5F1] disabled:text-[#A39E92]"
                  placeholder="vous@exemple.com"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-[#171412]"
                  >
                    Mot de passe
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-[#6B6B66] underline-offset-2 hover:text-[#171412] hover:underline"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    disabled={isLoading}
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className="w-full rounded-md border border-[#DEDAD0] px-3.5 py-2.5 pr-11 text-[#171412] outline-none transition focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/30 disabled:bg-[#F7F5F1] disabled:text-[#A39E92]"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={
                      showPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9489] hover:text-[#171412]"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-70"
                style={{ backgroundColor: INK }}
              >
                {isLoading && (
                  <span className="h-4 w-4 motion-safe:animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}
                {isLoading ? "Connexion en cours…" : "Se connecter"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#6B6B66]">
              Pas encore de compte ?{" "}
              <Link
                href="/register"
                className="font-medium text-[#171412] underline-offset-2 hover:underline"
              >
                S&apos;inscrire
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}