"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/api";

import {
  Upload,
  FileText,
  Brain,
  MessageSquare,
  BookOpen,
  LogOut,
  User,
  Mail,
  File,
  Sparkles,
  ClipboardCheck,
  Layers,
  Send,
  Clock,
  ChevronRight,
  Home,
  Settings,
  HelpCircle,
} from "lucide-react";

interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
}

interface Document {
  id: number;
  name: string;
  type: string;
  date: string;
  size: string;
}

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 1,
      name: "Algorithmique.pdf",
      type: "PDF",
      date: "12/06/2024",
      size: "2.4 MB",
    },
    {
      id: 2,
      name: "Intelligence_Artificielle.pdf",
      type: "PDF",
      date: "11/06/2024",
      size: "3.1 MB",
    },
    {
      id: 3,
      name: "Base_de_Donnees.pdf",
      type: "PDF",
      date: "10/06/2024",
      size: "1.8 MB",
    },
  ]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    async function loadUser() {
      try {
        const data = await getCurrentUser();
        setUser(data);
      } catch (error) {
        console.error(error);
        localStorage.removeItem("token");
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [router]);

  function logout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-slate-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 p-2">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                StudyMind AI
              </h1>
              <p className="text-sm text-slate-500">
                Assistant intelligent pour vos documents
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <nav className="hidden items-center gap-4 md:flex">
              <button className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-indigo-600">
                <Home className="inline h-4 w-4" /> Accueil
              </button>
              <button className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-indigo-600">
                <Settings className="inline h-4 w-4" /> Paramètres
              </button>
              <button className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-indigo-600">
                <HelpCircle className="inline h-4 w-4" /> Aide
              </button>
            </nav>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium text-slate-900">
                  {user?.firstname} {user?.lastname}
                </p>
                <p className="flex items-center justify-end gap-1 text-sm text-slate-500">
                  <Mail className="h-3 w-3" />
                  {user?.email}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
                <User className="h-5 w-5" />
              </div>

              <button
                onClick={logout}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-red-600"
              >
                <LogOut size={18} />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* HERO */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 p-10 text-white">
          <div className="absolute right-0 top-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute bottom-0 left-20 -mb-20 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl"></div>
          
          <div className="relative">
            <div className="flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-yellow-300" />
              <h2 className="text-4xl font-bold">
                Bonjour {user?.firstname}
              </h2>
            </div>

            <p className="mt-3 max-w-2xl text-indigo-100">
              Importez vos cours, PDF et documents. StudyMind AI les transforme
              en résumés, QCM, flashcards et conversations intelligentes.
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              <button className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-medium text-indigo-700 transition hover:scale-105 hover:shadow-lg">
                <Upload size={20} />
                Importer un document
              </button>
              <button className="flex items-center gap-2 rounded-xl bg-white/20 px-6 py-3 font-medium text-white transition hover:bg-white/30">
                <FileText size={20} />
                Voir tous les documents
              </button>
            </div>

            <div className="mt-6 flex items-center gap-6 text-sm text-indigo-200">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> Dernière activité aujourd'hui
              </span>
              <span className="flex items-center gap-1">
                <File className="h-4 w-4" /> 12 documents importés
              </span>
            </div>
          </div>
        </div>

        {/* ACTIONS RAPIDES */}
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">
              Actions rapides
            </h3>
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              Tout voir <ChevronRight className="inline h-4 w-4" />
            </button>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg hover:border-indigo-300">
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 w-fit group-hover:bg-indigo-100">
                <FileText size={28} />
              </div>
              <h4 className="mt-4 text-lg font-semibold text-slate-900">
                Résumé IA
              </h4>
              <p className="mt-2 text-sm text-slate-500">
                Générer automatiquement un résumé structuré de vos documents.
              </p>
              <div className="mt-4 flex items-center text-sm font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition">
                Commencer <ChevronRight className="ml-1 h-4 w-4" />
              </div>
            </div>

            <div className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg hover:border-indigo-300">
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 w-fit group-hover:bg-emerald-100">
                <ClipboardCheck size={28} />
              </div>
              <h4 className="mt-4 text-lg font-semibold text-slate-900">
                Générer des QCM
              </h4>
              <p className="mt-2 text-sm text-slate-500">
                Créer des exercices interactifs depuis vos documents.
              </p>
              <div className="mt-4 flex items-center text-sm font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition">
                Commencer <ChevronRight className="ml-1 h-4 w-4" />
              </div>
            </div>

            <div className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg hover:border-indigo-300">
              <div className="rounded-xl bg-violet-50 p-3 text-violet-600 w-fit group-hover:bg-violet-100">
                <Layers size={28} />
              </div>
              <h4 className="mt-4 text-lg font-semibold text-slate-900">
                Flashcards
              </h4>
              <p className="mt-2 text-sm text-slate-500">
                Réviser plus efficacement avec des cartes mémoire interactives.
              </p>
              <div className="mt-4 flex items-center text-sm font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition">
                Commencer <ChevronRight className="ml-1 h-4 w-4" />
              </div>
            </div>

            <div className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg hover:border-indigo-300">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600 w-fit group-hover:bg-blue-100">
                <MessageSquare size={28} />
              </div>
              <h4 className="mt-4 text-lg font-semibold text-slate-900">
                Chat avec PDF
              </h4>
              <p className="mt-2 text-sm text-slate-500">
                Posez vos questions à l'IA et obtenez des réponses précises.
              </p>
              <div className="mt-4 flex items-center text-sm font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition">
                Commencer <ChevronRight className="ml-1 h-4 w-4" />
              </div>
            </div>
          </div>
        </section>

        {/* DOCUMENTS RÉCENTS */}
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">
              Documents récents
            </h3>
            <button className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700">
              Voir tout <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="group flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-white p-5 transition hover:border-indigo-300 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
                    <File className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 group-hover:text-indigo-600 transition">
                      {doc.name}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <span>{doc.type}</span>
                      <span>•</span>
                      <span>{doc.size}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {doc.date}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="rounded-lg px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50">
                    <Send className="inline h-4 w-4" /> Chat
                  </button>
                  <button className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                    <FileText className="inline h-4 w-4" /> Résumé
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border-2 border-dashed border-slate-300 bg-white p-10 text-center">
            <Upload className="mx-auto h-12 w-12 text-slate-400" />
            <h4 className="mt-3 font-semibold text-slate-700">
              Importer un nouveau document
            </h4>
            <p className="text-sm text-slate-500">
              Glissez-déposez vos fichiers ou cliquez pour parcourir
            </p>
            <button className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
              Choisir un fichier
            </button>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <p className="text-center text-sm text-slate-500">
            © 2024 StudyMind AI - Assistant intelligent pour vos documents
          </p>
        </div>
      </footer>
    </div>
  );
}