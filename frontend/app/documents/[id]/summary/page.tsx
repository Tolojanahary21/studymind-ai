'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  Zap,
  RotateCcw,
  Eye,
  EyeOff,
  Type,
  Lightbulb,
} from 'lucide-react';
import { getToken, logout as logoutHelper } from '@/lib/auth';

interface SummaryResponse {
  summary: string;
  document_id?: number;
  title?: string;
  status?: string;
}

export default function SummaryPage() {
  const params = useParams();
  const router = useRouter();

  // States
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [documentTitle, setDocumentTitle] = useState<string>('Document');
  const [wordCount, setWordCount] = useState<number>(0);
  const [charCount, setCharCount] = useState<number>(0);
  const [readingTime, setReadingTime] = useState<number>(0);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [readMode, setReadMode] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Load summary on mount
  useEffect(() => {
    async function loadSummary() {
      try {
        setLoading(true);
        setError(null);

        const token = getToken();

        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch(
          `http://localhost:8000/api/documents/${params.id}/summary`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.status === 401) {
          logoutHelper();
          router.push('/login');
          return;
        }

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Document non trouvé.');
          }
          if (response.status === 400) {
            const errorData = await response.json();
            throw new Error(
              errorData.detail || "Le document n'a pas de contenu à résumer."
            );
          }
          throw new Error(
            `Erreur ${response.status}: Impossible de générer le résumé`
          );
        }

        const data: SummaryResponse = await response.json();

        if (!data.summary || data.summary === 'No content available to summarize.') {
          throw new Error("Ce document n'a pas de contenu à résumer.");
        }

        setSummary(data.summary);
        setDocumentTitle(data.title || `Document #${params.id}`);

        // Calculate statistics
        const words = data.summary.split(/\s+/).filter((word) => word.length > 0);
        const wordCount = words.length;
        const charCount = data.summary.replace(/\s/g, '').length;
        const readingTime = Math.max(1, Math.round(wordCount / 200));

        setWordCount(wordCount);
        setCharCount(charCount);
        setReadingTime(readingTime);
      } catch (error: any) {
        console.error('Erreur:', error);
        setError(error.message || 'Une erreur est survenue lors du chargement du résumé.');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      loadSummary();
    }
  }, [params.id, router]);

  // Handle regenerate summary
  const handleRegenerate = async () => {
    try {
      setRegenerating(true);
      setError(null);

      const token = getToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(
        `http://localhost:8000/api/documents/${params.id}/summary`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la régénération du résumé');
      }

      const data: SummaryResponse = await response.json();
      setSummary(data.summary);

      const words = data.summary.split(/\s+/).filter((word) => word.length > 0);
      setWordCount(words.length);
      setCharCount(data.summary.replace(/\s/g, '').length);
      setReadingTime(Math.max(1, Math.round(words.length / 200)));

      showToastMessage('Résumé régénéré avec succès!');
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la régénération');
    } finally {
      setRegenerating(false);
    }
  };

  // Toast notification
  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      showToastMessage('Résumé copié!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur de copie:', err);
      setError('Impossible de copier le texte');
    }
  };

  // Download summary
  const downloadSummary = () => {
    const element = document.createElement('a');
    const file = new Blob([summary], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `resume_${documentTitle.replace(/\s/g, '_')}_${new Date()
      .toISOString()
      .split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToastMessage('Résumé téléchargé!');
  };

  // Share summary
  const shareSummary = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Résumé - ${documentTitle}`,
          text: summary,
        });
        showToastMessage('Résumé partagé!');
      } catch (err) {
        console.error('Erreur de partage:', err);
      }
    } else {
      copyToClipboard();
    }
  };

  // Navigate functions
  const goToDashboard = () => {
    router.push('/dashboard');
  };

  const goToQuiz = () => {
    router.push(`/documents/${params.id}/quiz`);
  };

  const goBack = () => {
    router.back();
  };

  // Font size class
  const fontSizeClasses = {
    small: 'text-base',
    medium: 'text-lg',
    large: 'text-xl',
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAF9F6] to-[#F3F1EB] py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header skeleton */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-10 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
                <div>
                  <div className="h-8 w-40 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Stats skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm p-4 animate-pulse">
                <div className="h-12 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>

          {/* Content skeleton */}
          <div className="bg-white rounded-3xl shadow-sm p-8">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FAF9F6] to-[#F3F1EB] p-4">
        <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full">
          <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Erreur</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-[#171412] text-white px-6 py-3 rounded-xl hover:bg-[#2a2521] transition-all font-semibold"
            >
              Réessayer
            </button>
            <button
              onClick={goToDashboard}
              className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all font-semibold flex items-center justify-center gap-2"
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
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F6] to-[#F3F1EB] py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-[#E5E2DA]">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={goBack}
                className="group bg-[#171412] text-white p-2 rounded-lg hover:shadow-md transition-all"
                title="Retour"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={goToDashboard}
                className="group bg-[#171412] text-white px-4 py-2 rounded-lg hover:shadow-md transition-all flex items-center gap-2 font-medium text-sm"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </button>
              <div>
                <h1 className="text-2xl font-bold text-[#171412] flex items-center gap-2">
                  <FileText className="h-6 w-6 text-[#C9A227]" />
                  Résumé
                </h1>
                <p className="text-gray-600 text-sm flex items-center gap-2 mt-1">
                  <BookOpen className="h-4 w-4 text-[#C9A227]" />
                  {documentTitle}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="hidden sm:flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setFontSize('small')}
                  className={`p-1 rounded ${
                    fontSize === 'small'
                      ? 'bg-[#171412] text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  title="Petite taille"
                >
                  <Type className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setFontSize('medium')}
                  className={`p-1 rounded ${
                    fontSize === 'medium'
                      ? 'bg-[#171412] text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  title="Taille normale"
                >
                  <Type className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setFontSize('large')}
                  className={`p-1 rounded ${
                    fontSize === 'large'
                      ? 'bg-[#171412] text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  title="Grande taille"
                >
                  <Type className="h-6 w-6" />
                </button>
              </div>

              <button
                onClick={() => setReadMode(!readMode)}
                className={`p-2 rounded-lg transition-all ${
                  readMode
                    ? 'bg-[#C9A227] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={readMode ? 'Quitter mode lecture' : 'Mode lecture'}
              >
                {readMode ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>

              {summary && (
                <>
                  <button
                    onClick={copyToClipboard}
                    className="group bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-all"
                    title="Copier"
                  >
                    {copied ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={downloadSummary}
                    className="group bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-all"
                    title="Télécharger"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                  <button
                    onClick={shareSummary}
                    className="group bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-all"
                    title="Partager"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Statistics */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-[#E5E2DA]">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Mots</p>
                  <p className="text-xl font-bold text-[#171412]">{wordCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-[#E5E2DA]">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Sparkles className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Caractères</p>
                  <p className="text-xl font-bold text-[#171412]">{charCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-[#E5E2DA]">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Lecture</p>
                  <p className="text-xl font-bold text-[#171412]">{readingTime} min</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-[#E5E2DA]">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <Brain className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Compression</p>
                  <p className="text-xl font-bold text-[#171412]">
                    {Math.round(((wordCount * 5) / charCount) * 100)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Content */}
        <div
          className={`bg-white rounded-3xl shadow-sm p-8 border border-[#E5E2DA] transition-all ${
            readMode ? 'fixed inset-0 z-40 rounded-none max-w-none max-h-screen overflow-y-auto' : ''
          }`}
        >
          {readMode && (
            <button
              onClick={() => setReadMode(false)}
              className="fixed top-6 right-6 bg-[#171412] text-white p-3 rounded-lg hover:shadow-lg transition-all z-50"
              title="Quitter le mode lecture"
            >
              <EyeOff className="h-5 w-5" />
            </button>
          )}

          <div
            className={`flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 ${
              readMode ? 'hidden' : ''
            }`}
          >
            <div className="bg-[#C9A227] p-2 rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-[#171412]">Résumé généré par IA</h2>
            <span className="ml-auto text-xs bg-[#FBF3DC] text-[#C9A227] px-3 py-1 rounded-full font-medium">
              Ollama Llama3
            </span>
          </div>

          <div className={`${fontSizeClasses[fontSize]} text-[#171412] leading-relaxed whitespace-pre-wrap`}>
            {summary}
          </div>

          {/* Actions footer */}
          <div className={`mt-8 pt-6 border-t border-gray-200 flex items-center justify-between flex-wrap gap-4 ${
            readMode ? 'hidden' : ''
          }`}>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Check className="h-4 w-4 text-green-600" />
              <span>Résumé généré avec succès</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={copyToClipboard}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2 font-medium text-sm"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    Copié!
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
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2 font-medium text-sm"
              >
                <Download className="h-4 w-4" />
                Télécharger
              </button>
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2 font-medium text-sm disabled:opacity-50"
              >
                {regenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Régénération...
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-4 w-4" />
                    Régénérer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className={`mt-6 flex justify-center gap-3 flex-wrap ${
          readMode ? 'hidden' : ''
        }`}>
          <button
            onClick={goToQuiz}
            className="group bg-[#171412] text-white px-6 py-3 rounded-lg hover:shadow-md transition-all flex items-center gap-2 font-medium"
          >
            <Brain className="h-5 w-5" />
            Générer un Quiz
          </button>
          <button
            onClick={goToDashboard}
            className="group bg-white border border-[#E5E2DA] text-[#171412] px-6 py-3 rounded-lg hover:shadow-md transition-all flex items-center gap-2 font-medium"
          >
            <Home className="h-5 w-5" />
            Retour au Dashboard
          </button>
        </div>
      </div>

      {/* Toast notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-up">
          <Check className="h-5 w-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}