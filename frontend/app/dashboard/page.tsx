'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Brain,
  ListChecks,
  TrendingUp,
  LogOut,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getToken, logout } from '@/lib/auth';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface RecentDocument {
  id: number;
  filename: string;
  created_at: string;
  character_count: number;
}

interface RecentAttempt {
  id: number;
  document_name: string;
  score: number;
  total_questions: number;
  percentage: number;
  created_at: string;
}

interface ProgressPoint {
  attempt: number;
  score: number;
}

interface DashboardStats {
  documents_count: number;
  quizzes_count: number;
  attempts_count: number;
  average_score: number;
  recent_documents: RecentDocument[];
  recent_attempts: RecentAttempt[];
  progress_data: ProgressPoint[];
}

interface CurrentUser {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
}

// -----------------------------------------------------------------------------
// Config
// -----------------------------------------------------------------------------

// Adaptez NEXT_PUBLIC_API_URL dans votre .env.local (ex: http://localhost:8000)
// Garde la même URL en dur que le reste du projet (lib/api.ts). Tu peux la
// remplacer par process.env.NEXT_PUBLIC_API_URL si tu préfères centraliser.
const API_URL = 'http://localhost:8000';

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function getInitials(firstname: string, lastname: string): string {
  const first = firstname?.[0] ?? '';
  const last = lastname?.[0] ?? '';
  return (first + last).toUpperCase() || '?';
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.push('/login');
      return;
    }

    async function loadDashboard() {
      try {
        const [statsRes, meRes] = await Promise.all([
          fetch(`${API_URL}/api/dashboard/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (statsRes.status === 401 || meRes.status === 401) {
          logout();
          router.push('/login');
          return;
        }

        if (!statsRes.ok || !meRes.ok) {
          throw new Error('Impossible de charger le tableau de bord.');
        }

        const statsData: DashboardStats = await statsRes.json();
        const meData: CurrentUser = await meRes.json();

        setStats(statsData);
        setUser(meData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Une erreur est survenue.'
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  function handleLogout() {
    logout();
    router.push('/login');
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C9A227] border-t-transparent" />
          <p className="text-sm text-[#6B6B66]">Chargement de votre espace…</p>
        </div>
      </div>
    );
  }

  if (error || !stats || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6] px-4">
        <div className="max-w-sm rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="font-medium text-[#171412]">
            {error ?? 'Impossible de charger vos données.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-[#171412] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2a2521]"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const firstName = user.firstname;

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* SECTION 1 — En-tête utilisateur */}
        <header className="mb-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#171412] text-lg font-semibold text-white">
              {getInitials(user.firstname, user.lastname)}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-[#171412]">
                Bonjour {firstName} 👋
              </h1>
              <p className="text-sm text-[#6B6B66]">
                Bienvenue sur votre espace d'apprentissage
              </p>
              <p className="text-xs text-[#6B6B66]">{user.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-[#E5E2DA] bg-white px-4 py-2 text-sm font-medium text-[#171412] shadow-sm transition-colors hover:bg-[#F3F1EB]"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </header>

        {/* SECTION 2 — Cartes statistiques */}
        <section className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<FileText className="h-5 w-5" />}
            label="Documents uploadés"
            value={stats.documents_count}
            accentBg="bg-[#EAF2FF]"
            accentText="text-[#2563EB]"
          />
          <StatCard
            icon={<Brain className="h-5 w-5" />}
            label="Quiz générés"
            value={stats.quizzes_count}
            accentBg="bg-[#F3EAFF]"
            accentText="text-[#7C3AED]"
          />
          <StatCard
            icon={<ListChecks className="h-5 w-5" />}
            label="Quiz réalisés"
            value={stats.attempts_count}
            accentBg="bg-[#EAFBF1]"
            accentText="text-[#15803D]"
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="Score moyen"
            value={`${Math.round(stats.average_score)} %`}
            accentBg="bg-[#FBF3DC]"
            accentText="text-[#C9A227]"
          />
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* SECTION 3 — Activité récente */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-[#171412]">
              Activité récente
            </h2>

            {stats.recent_documents.length === 0 ? (
              <EmptyState message="Aucun document pour le moment. Importez votre premier PDF pour commencer." />
            ) : (
              <ul className="flex flex-col divide-y divide-[#F0EEE7]">
                {stats.recent_documents.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#171412]">
                        {doc.filename}
                      </p>
                      <p className="text-xs text-[#6B6B66]">
                        Ajouté le {formatDate(doc.created_at)} ·{' '}
                        {doc.character_count.toLocaleString('fr-FR')} caractères
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/documents/${doc.id}/summary`)}
                        className="rounded-lg border border-[#E5E2DA] px-3 py-1.5 text-xs font-medium text-[#171412] transition-colors hover:bg-[#F3F1EB]"
                      >
                        Résumé
                      </button>
                      <button
                        onClick={() => router.push(`/quiz/${doc.id}`)}
                        className="rounded-lg bg-[#171412] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#2a2521]"
                      >
                        Quiz
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* SECTION 4 — Historique des quiz */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-[#171412]">
              Historique des quiz
            </h2>

            {stats.recent_attempts.length === 0 ? (
              <EmptyState message="Aucune tentative enregistrée pour le moment. Lancez un quiz pour suivre votre progression." />
            ) : (
              <ul className="flex flex-col divide-y divide-[#F0EEE7]">
                {stats.recent_attempts.map((attempt) => (
                  <li
                    key={attempt.id}
                    className="flex items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#171412]">
                        {attempt.document_name}
                      </p>
                      <p className="text-xs text-[#6B6B66]">
                        {formatDate(attempt.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#171412]">
                        {attempt.score}/{attempt.total_questions}
                      </p>
                      <p className="text-xs font-medium text-[#C9A227]">
                        {Math.round(attempt.percentage)} %
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* SECTION 5 — Statistiques visuelles */}
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-[#171412]">
            Évolution des scores
          </h2>

          {stats.progress_data.length === 0 ? (
            <EmptyState message="Pas encore assez de données pour afficher une tendance." />
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={stats.progress_data}
                  margin={{ top: 10, right: 16, left: -16, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0EEE7" />
                  <XAxis
                    dataKey="attempt"
                    tick={{ fill: '#6B6B66', fontSize: 12 }}
                    axisLine={{ stroke: '#E5E2DA' }}
                    tickLine={false}
                    label={{
                      value: 'Tentatives',
                      position: 'insideBottom',
                      offset: -5,
                      fill: '#6B6B66',
                      fontSize: 12,
                    }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: '#6B6B66', fontSize: 12 }}
                    axisLine={{ stroke: '#E5E2DA' }}
                    tickLine={false}
                    label={{
                      value: 'Score %',
                      angle: -90,
                      position: 'insideLeft',
                      fill: '#6B6B66',
                      fontSize: 12,
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E2DA',
                      borderRadius: '12px',
                      fontSize: '13px',
                    }}
                    formatter={(value: number) => [`${value} %`, 'Score']}
                    labelFormatter={(label) => `Tentative #${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#C9A227"
                    strokeWidth={2.5}
                    dot={{ fill: '#C9A227', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Sous-composants
// -----------------------------------------------------------------------------

function StatCard({
  icon,
  label,
  value,
  accentBg,
  accentText,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  accentBg: string;
  accentText: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div
        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${accentBg} ${accentText}`}
      >
        {icon}
      </div>
      <p className="text-2xl font-semibold text-[#171412]">{value}</p>
      <p className="text-sm text-[#6B6B66]">{label}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-[#E5E2DA] py-10 text-center">
      <p className="text-sm text-[#6B6B66]">{message}</p>
    </div>
  );
}