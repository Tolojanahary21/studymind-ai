"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/api";
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

const GOLD = "#C9A227";
const INK = "#10161F";

interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // No token at all — don't even bother calling the API.
    if (!localStorage.getItem("token")) {
      router.replace("/login");
      return;
    }

    async function loadUser() {
      try {
        const data = await getCurrentUser();
        setUser(data);
      } catch (error) {
        console.error(error);
        // getCurrentUser failing almost always means the token is
        // missing/expired/invalid — clear it and send the user back
        // to log in rather than leaving them on a half-broken page.
        localStorage.removeItem("token");
        router.replace("/login");
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  const initials = user
    ? `${user.firstname[0] ?? ""}${user.lastname[0] ?? ""}`.toUpperCase()
    : "";

  return (
    <div
      className={`${fraunces.variable} ${inter.variable} min-h-screen bg-[#FAF9F6] font-[family-name:var(--font-body)]`}
    >
      <header className="sticky top-0 z-10 border-b border-[#E7E3D9] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: GOLD }} />

          {isLoading ? (
            <div className="h-9 w-32 animate-pulse rounded-full bg-[#EFEBE2]" />
          ) : (
            user && (
              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium text-[#171412]">
                    {user.firstname} {user.lastname}
                  </p>
                  <p className="text-xs text-[#9A9489]">{user.email}</p>
                </div>

                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: INK }}
                  aria-hidden="true"
                >
                  {initials}
                </div>

                <button
                  onClick={handleLogout}
                  className="ml-2 rounded-md border border-[#DEDAD0] px-3 py-1.5 text-sm font-medium text-[#171412] transition hover:border-[#171412]"
                >
                  Déconnexion
                </button>
              </div>
            )
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-9 w-64 animate-pulse rounded bg-[#EFEBE2]" />
            <div className="h-4 w-80 animate-pulse rounded bg-[#EFEBE2]" />
          </div>
        ) : (
          user && (
            <>
              <h1 className="font-[family-name:var(--font-display)] text-3xl font-medium text-[#171412]">
                Bonjour {user.firstname} 👋
              </h1>
              <p className="mt-2 text-sm text-[#6B6B66]">
                Voici un aperçu de votre espace.
              </p>

              {/*
                Placeholder cards — replace with real data once you have
                endpoints for it. Kept here so the page doesn't read as
                empty, and to show the grid/card pattern to reuse.
              */}
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Projets actifs", value: "—" },
                  { label: "Tâches en attente", value: "—" },
                  { label: "Notifications", value: "—" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-[#E7E3D9] bg-white p-5"
                  >
                    <p className="text-xs font-medium uppercase tracking-wide text-[#9A9489]">
                      {stat.label}
                    </p>
                    <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-medium text-[#171412]">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )
        )}
      </main>
    </div>
  );
}