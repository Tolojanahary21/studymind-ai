"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getQuiz, submitQuiz } from "@/lib/api";
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Award, 
  AlertCircle, 
  ChevronRight,
  ChevronLeft,
  Home,
  Sparkles,
  Zap,
  Brain,
  Target
} from "lucide-react";
import confetti from "canvas-confetti";

interface Question {
  id: number;
  difficulty: string;
  question: string;
  choices: string[];
  answer: string;
}

interface Quiz {
  quiz_id: number;
  document_id: number;
  questions: Question[];
}

interface AnswerStatus {
  [key: number]: {
    selected: string;
    isCorrect: boolean;
    correctAnswer: string;
  };
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [answerStatus, setAnswerStatus] = useState<AnswerStatus>({});
  const [score, setScore] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [questionsPerPage] = useState(10);

  useEffect(() => {
    async function loadQuiz() {
      try {
        setLoading(true);
        setError(null);
        const data = await getQuiz(Number(params.id));
        
        if (!data || !data.questions || data.questions.length === 0) {
          throw new Error("Le quiz n'a pas de questions");
        }
        
        setQuiz(data);
      } catch (error: any) {
        console.error("Erreur de chargement:", error);
        setError(error.message || "Impossible de charger le quiz. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    }

    loadQuiz();
  }, [params.id]);

  const handleAnswer = (questionId: number, choice: string) => {
    if (submitted) return;
    
    setAnswers({
      ...answers,
      [questionId]: choice,
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: "bg-gradient-to-r from-emerald-400 to-emerald-500 text-white border-emerald-400",
      medium: "bg-gradient-to-r from-amber-400 to-amber-500 text-white border-amber-400",
      hard: "bg-gradient-to-r from-rose-400 to-rose-500 text-white border-rose-400",
    };
    return colors[difficulty as keyof typeof colors] || colors.medium;
  };

  const getDifficultyIcon = (difficulty: string) => {
    const icons = {
      easy: "🌟",
      medium: "⚡",
      hard: "🔥",
    };
    return icons[difficulty as keyof typeof icons] || "⚡";
  };

  const getProgress = () => {
    const answered = Object.keys(answers).length;
    return (answered / (quiz?.questions.length || 1)) * 100;
  };

  const calculateScore = async () => {
    if (!quiz) return;

    try {
      setSubmitting(true);
      setError(null);

      const allAnswered = quiz.questions.every(q => answers[q.id]);
      if (!allAnswered) {
        const unansweredCount = quiz.questions.filter(q => !answers[q.id]).length;
        throw new Error(`Veuillez répondre à toutes les questions (${unansweredCount} restante${unansweredCount > 1 ? 's' : ''})`);
      }

      let correctCount = 0;
      const status: AnswerStatus = {};

      quiz.questions.forEach((question) => {
        const isCorrect = answers[question.id] === question.answer;
        if (isCorrect) correctCount++;
        
        status[question.id] = {
          selected: answers[question.id],
          isCorrect,
          correctAnswer: question.answer,
        };
      });

      setAnswerStatus(status);
      setScore(correctCount);

      if (correctCount / quiz.questions.length > 0.7) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#818cf8', '#a78bfa', '#f472b6', '#34d399', '#fbbf24']
        });
      }

      await submitQuiz(
        quiz.quiz_id,
        correctCount,
        quiz.questions.length
      );

      setSubmitted(true);
      setShowResults(true);

    } catch (error: any) {
      console.error("Erreur:", error);
      setError(error.message || "Erreur lors de la soumission. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  const getPaginatedQuestions = () => {
    if (!quiz) return [];
    const start = currentPage * questionsPerPage;
    const end = Math.min(start + questionsPerPage, quiz.questions.length);
    return quiz.questions.slice(start, end);
  };

  const totalPages = quiz ? Math.ceil(quiz.questions.length / questionsPerPage) : 0;

  const goToDashboard = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-white mx-auto mb-4" />
          <div className="space-y-2">
            <div className="h-4 w-48 bg-white/20 rounded animate-pulse mx-auto"></div>
            <div className="h-4 w-32 bg-white/20 rounded animate-pulse mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-md w-full text-center transform hover:scale-105 transition-transform duration-300">
          <div className="h-24 w-24 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <AlertCircle className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oups !</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all transform hover:scale-105 font-semibold"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="h-24 w-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <AlertCircle className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz non trouvé</h2>
          <p className="text-gray-600 mb-6">Le quiz que vous recherchez n'existe pas.</p>
          <button
            onClick={goToDashboard}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all transform hover:scale-105 font-semibold"
          >
            Retour au dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestions = getPaginatedQuestions();
  const progress = getProgress();
  const allAnswered = quiz.questions.every(q => answers[q.id]);
  const globalStartIndex = currentPage * questionsPerPage;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header avec bouton retour */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 mb-6 transition-all duration-300 hover:shadow-3xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={goToDashboard}
                className="group bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-xl hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2 font-medium"
              >
                <Home className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                Dashboard
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                  <Brain className="h-8 w-8 text-indigo-600" />
                  Quiz #{quiz.quiz_id}
                </h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <Target className="h-4 w-4 text-indigo-500" />
                  {quiz.questions.length} questions • Répondues: {Object.keys(answers).length}/{quiz.questions.length}
                </p>
              </div>
            </div>
            {!submitted && (
              <div className="flex items-center gap-4 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2 rounded-full">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  <span className="text-sm font-medium text-indigo-700">
                    {Math.round(progress)}%
                  </span>
                </div>
                {!allAnswered && (
                  <span className="text-sm text-amber-600 flex items-center gap-1 bg-amber-100 px-3 py-1 rounded-full">
                    <AlertCircle className="h-4 w-4" />
                    {quiz.questions.filter(q => !answers[q.id]).length} restantes
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Barre de progression améliorée */}
          {!submitted && (
            <div className="mt-4 relative">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-700 ease-out shadow-lg"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-r from-transparent to-white/30 animate-pulse"></div>
                </div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-white/70">
                <span>Début</span>
                <span className="font-medium text-white">{Math.round(progress)}%</span>
                <span>Fin</span>
              </div>
            </div>
          )}

          {submitted && score !== null && (
            <div className="mt-4 p-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl shadow-lg animate-fadeIn">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white text-lg">Quiz terminé ! 🎉</h3>
                  <p className="text-white/90 text-sm">
                    Score final : <span className="font-bold text-xl">{score}/{quiz.questions.length}</span>
                  </p>
                </div>
                <Sparkles className="h-8 w-8 text-white/80 animate-pulse" />
              </div>
            </div>
          )}
        </div>

        {error && !submitted && (
          <div className="bg-red-50/95 backdrop-blur-sm border-2 border-red-300 rounded-2xl p-5 mb-6 animate-shake shadow-lg">
            <div className="flex items-center gap-3">
              <div className="bg-red-500 p-2 rounded-full">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Questions avec animation améliorée */}
        <div className="space-y-5 animate-slideUp">
          {currentQuestions.map((question, index) => {
            const globalIndex = globalStartIndex + index;
            const isAnswered = !!answers[question.id];
            const isCorrect = submitted && answerStatus[question.id]?.isCorrect;
            const showCorrect = submitted && answerStatus[question.id];

            return (
              <div
                key={question.id}
                className="group bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-7 transition-all duration-300 hover:shadow-3xl hover:scale-[1.01] border border-white/20"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-md">
                        Q{globalIndex + 1}
                      </span>
                      <span className={`text-xs font-medium px-4 py-2 rounded-full border-2 shadow-sm ${getDifficultyColor(question.difficulty)}`}>
                        {getDifficultyIcon(question.difficulty)} {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                      </span>
                      {isAnswered && !submitted && (
                        <span className="text-xs bg-gradient-to-r from-green-400 to-emerald-500 text-white px-4 py-2 rounded-full shadow-md animate-pulse">
                          ✓ Répondu
                        </span>
                      )}
                    </div>
                    <p className="text-gray-800 text-lg font-semibold leading-relaxed">{question.question}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {question.choices.map((choice, idx) => {
                    const isSelected = answers[question.id] === choice;
                    let choiceClassName = "flex items-center gap-4 border-2 rounded-2xl p-4 transition-all duration-300 cursor-pointer ";
                    
                    if (!submitted) {
                      choiceClassName += isSelected
                        ? "border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-lg transform scale-[1.02] ring-2 ring-indigo-300"
                        : "border-gray-200 hover:border-indigo-400 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 hover:shadow-lg hover:scale-[1.01]";
                    } else {
                      if (choice === question.answer) {
                        choiceClassName += "border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg ring-2 ring-green-300";
                      } else if (isSelected && choice !== question.answer) {
                        choiceClassName += "border-red-500 bg-gradient-to-r from-red-50 to-rose-50 shadow-lg ring-2 ring-red-300";
                      } else {
                        choiceClassName += "border-gray-200 opacity-60";
                      }
                    }

                    return (
                      <label
                        key={idx}
                        className={choiceClassName}
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={choice}
                          checked={isSelected}
                          onChange={() => handleAnswer(question.id, choice)}
                          disabled={submitted}
                          className="w-5 h-5 text-indigo-600 border-gray-300 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span className="flex-1 font-medium text-gray-700">{choice}</span>
                        {submitted && choice === question.answer && (
                          <CheckCircle2 className="h-6 w-6 text-green-500 animate-bounce" />
                        )}
                        {submitted && isSelected && choice !== question.answer && (
                          <XCircle className="h-6 w-6 text-red-500 animate-bounce" />
                        )}
                      </label>
                    );
                  })}
                </div>

                {submitted && showCorrect && (
                  <div className={`mt-5 p-4 rounded-2xl shadow-inner ${isCorrect ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300' : 'bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300'}`}>
                    <p className="font-medium flex items-center gap-2">
                      {isCorrect ? '✅ Bonne réponse !' : `❌ La bonne réponse était : ${question.answer}`}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Pagination améliorée */}
        {!submitted && totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8 bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-5">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="group px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2 font-medium"
            >
              <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              Précédent
            </button>
            <span className="text-gray-700 font-medium px-6 py-2 bg-gray-100 rounded-xl">
              Page {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
              className="group px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2 font-medium"
            >
              Suivant
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {/* Bouton de soumission amélioré */}
        {!submitted && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={calculateScore}
              disabled={submitting || !allAnswered}
              className="group bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-3 shadow-lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Sparkles className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                  Terminer le quiz
                  <ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Résultats détaillés améliorés */}
        {submitted && score !== null && showResults && (
          <div className="mt-8 bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 animate-slideUp border border-white/20">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full mb-4 shadow-2xl animate-pulse">
                <Award className="h-14 w-14 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-gray-800 flex items-center justify-center gap-3">
                Résultats
                <Sparkles className="h-8 w-8 text-amber-400" />
              </h2>
              <div className="flex items-center justify-center gap-8 mt-6">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl shadow-inner min-w-[120px]">
                  <p className="text-sm text-gray-500 font-medium">Score</p>
                  <p className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {score} <span className="text-2xl text-gray-400">/ {quiz.questions.length}</span>
                  </p>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl shadow-inner min-w-[120px]">
                  <p className="text-sm text-gray-500 font-medium">Pourcentage</p>
                  <p className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {Math.round((score / quiz.questions.length) * 100)}%
                  </p>
                </div>
              </div>
              <div className="mt-6 w-full bg-gray-200 rounded-full h-4 max-w-md mx-auto overflow-hidden shadow-inner">
                <div 
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-4 rounded-full transition-all duration-1000 ease-out shadow-lg"
                  style={{ width: `${(score / quiz.questions.length) * 100}%` }}
                />
              </div>
              {score / quiz.questions.length > 0.7 && (
                <div className="mt-4 p-4 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-2xl border-2 border-amber-300">
                  <p className="text-amber-800 font-bold flex items-center justify-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Excellent travail ! Continuez comme ça !
                    <Sparkles className="h-5 w-5" />
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-center mt-6">
              <button
                onClick={goToDashboard}
                className="group bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-2xl hover:shadow-2xl transition-all transform hover:scale-105 flex items-center gap-3 font-semibold text-lg"
              >
                <Home className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                Retour au Dashboard
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        @keyframes pulse-soft {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .shadow-3xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
}