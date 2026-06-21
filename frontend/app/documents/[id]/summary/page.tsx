"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Loader2, 
  AlertCircle, 
  FileText, 
  Sparkles, 
  Home,
  Copy,
  Check,
  ChevronLeft,
  Download,
  Share2,
  Clock,
  BookOpen,
  Brain,
  Zap
} from "lucide-react";

interface SummaryResponse {
  summary: string;
  document_id?: number;
  title?: string;
  status?: string;
}

export default function SummaryPage() {
  const params = useParams();
  const router = useRouter();
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [documentTitle, setDocumentTitle] = useState<string>("Document");
  const [wordCount, setWordCount] = useState<number>(0);
  const [charCount, setCharCount] = useState<number>(0);

  useEffect(() => {
    async function loadSummary() {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        
        if (!token) {
          throw new Error("Vous devez être connecté pour accéder à cette page");
        }

        const response = await fetch(
          `http://localhost:8000/api/documents/${params.id}/summary`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Session expirée. Veuillez vous reconnecter.");
          }
          if (response.status === 404) {
            throw new Error("Document non trouvé.");
          }
          if (response.status === 400) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Le document n'a pas de contenu à résumer.");
          }
          throw new Error(`Erreur ${response.status}: Impossible de générer le résumé`);
        }

        const data: SummaryResponse = await response.json();
        
        if (!data.summary || data.summary === "No content available to summarize.") {
          throw new Error("Ce document n'a pas de contenu à résumer.");
        }

        setSummary(data.summary);
        setDocumentTitle(data.title || `Document #${params.id}`);
        
        // Compter les mots et caractères
        const words = data.summary.split(/\s+/).filter(word => word.length > 0);
        setWordCount(words.length);
        setCharCount(data.summary.replace(/\s/g, '').length);

      } catch (error: any) {
        console.error("Erreur:", error);
        setError(error.message || "Une erreur est survenue lors du chargement du résumé.");
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      loadSummary();
    }
  }, [params.id]);

  const goToDashboard = () => {
    router.push('/dashboard');
  };

  const goBack = () => {
    router.back();
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Erreur de copie:", err);
    }
  };

  const downloadSummary = () => {
    const element = document.createElement("a");
    const file = new Blob([summary], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `resume_${documentTitle}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const shareSummary = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Résumé - ${documentTitle}`,
          text: summary,
        });
      } catch (err) {
        console.error("Erreur de partage:", err);
      }
    } else {
      copyToClipboard();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <div className="text-center">
          <div className="relative">
            <div className="h-24 w-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="h-12 w-12 animate-spin text-white" />
            </div>
            <div className="absolute inset-0 h-24 w-24 mx-auto rounded-full border-4 border-white/20 border-t-white animate-spin"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 w-48 bg-white/20 rounded animate-pulse mx-auto"></div>
            <div className="h-3 w-32 bg-white/20 rounded animate-pulse mx-auto"></div>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Brain className="h-5 w-5 text-white/60 animate-pulse" />
              <span className="text-white/60 text-sm">Analyse en cours...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-md w-full transform hover:scale-105 transition-transform duration-300">
          <div className="h-24 w-24 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <AlertCircle className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Oups !</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all transform hover:scale-105 font-semibold"
            >
              Réessayer
            </button>
            <button
              onClick={goToDashboard}
              className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all transform hover:scale-105 font-semibold flex items-center justify-center gap-2"
            >
              <Home className="h-5 w-5" />
              Retour au dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 mb-6 transition-all duration-300 hover:shadow-3xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={goBack}
                className="group bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-2 rounded-xl hover:shadow-xl transition-all transform hover:scale-105"
                title="Retour"
              >
                <ChevronLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
              </button>
              <button
                onClick={goToDashboard}
                className="group bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-xl hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2 font-medium"
              >
                <Home className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                Dashboard
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                  <FileText className="h-8 w-8 text-indigo-600" />
                  Résumé
                </h1>
                <p className="text-gray-600 text-sm flex items-center gap-2 mt-1">
                  <BookOpen className="h-4 w-4 text-indigo-500" />
                  {documentTitle}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {summary && (
                <>
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-3 py-1 rounded-full flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-indigo-500" />
                    <span>{wordCount} mots</span>
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="group bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-2 rounded-xl hover:shadow-xl transition-all transform hover:scale-105"
                    title="Copier"
                  >
                    {copied ? (
                      <Check className="h-5 w-5 text-green-300" />
                    ) : (
                      <Copy className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    )}
                  </button>
                  <button
                    onClick={downloadSummary}
                    className="group bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-2 rounded-xl hover:shadow-xl transition-all transform hover:scale-105"
                    title="Télécharger"
                  >
                    <Download className="h-5 w-5 group-hover:-translate-y-1 transition-transform" />
                  </button>
                  <button
                    onClick={shareSummary}
                    className="group bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-2 rounded-xl hover:shadow-xl transition-all transform hover:scale-105"
                    title="Partager"
                  >
                    <Share2 className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Statistiques */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 flex items-center gap-4 transition-all hover:shadow-2xl hover:scale-105">
              <div className="bg-gradient-to-br from-indigo-400 to-purple-500 p-3 rounded-xl">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Mots</p>
                <p className="text-2xl font-bold text-gray-800">{wordCount}</p>
              </div>
            </div>
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 flex items-center gap-4 transition-all hover:shadow-2xl hover:scale-105">
              <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-3 rounded-xl">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Caractères</p>
                <p className="text-2xl font-bold text-gray-800">{charCount}</p>
              </div>
            </div>
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 flex items-center gap-4 transition-all hover:shadow-2xl hover:scale-105">
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-3 rounded-xl">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Temps de lecture</p>
                <p className="text-2xl font-bold text-gray-800">
                  {Math.max(1, Math.round(wordCount / 200))} min
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Contenu du résumé */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 transition-all duration-300 hover:shadow-3xl border border-white/20 animate-slideUp">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-xl">
              <Sparkles className="h-5 w-5 text-white animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Résumé généré par IA</h2>
            <span className="ml-auto text-xs bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 px-3 py-1 rounded-full font-medium">
              GPT-4o-mini
            </span>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg font-medium">
              {summary}
            </p>
          </div>

          {/* Badge de confirmation */}
          <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Check className="h-4 w-4 text-green-500" />
              <span>Résumé généré avec succès</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={copyToClipboard}
                className="bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 px-4 py-2 rounded-xl hover:shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 font-medium"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    Copié !
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copier
                  </>
                )}
              </button>
              <button
                onClick={downloadSummary}
                className="bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 px-4 py-2 rounded-xl hover:shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 font-medium"
              >
                <Download className="h-4 w-4" />
                Télécharger
              </button>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="mt-6 flex justify-center gap-4 flex-wrap">
          <button
            onClick={goToDashboard}
            className="group bg-white/95 backdrop-blur-sm text-gray-700 px-6 py-3 rounded-2xl hover:shadow-2xl transition-all transform hover:scale-105 flex items-center gap-3 font-medium shadow-lg"
          >
            <Home className="h-5 w-5 group-hover:rotate-12 transition-transform text-indigo-600" />
            Retour au Dashboard
          </button>
          <button
            onClick={() => router.push(`/documents/${params.id}`)}
            className="group bg-white/95 backdrop-blur-sm text-gray-700 px-6 py-3 rounded-2xl hover:shadow-2xl transition-all transform hover:scale-105 flex items-center gap-3 font-medium shadow-lg"
          >
            <FileText className="h-5 w-5 group-hover:scale-110 transition-transform text-indigo-600" />
            Voir le document original
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse-soft {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-slideUp {
          animation: slideUp 0.6s ease-out;
        }
        .shadow-3xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .prose {
          max-width: 100%;
        }
        .prose p {
          margin-top: 0;
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
}