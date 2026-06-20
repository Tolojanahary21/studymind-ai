"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getQuiz,
  submitQuiz,
} from "@/lib/api";

import {
  ArrowLeft,
  Home,
  LogOut,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Brain,
  FileText,
  BarChart3,
  Award,
  TrendingUp,
  Target,
} from "lucide-react";

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

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadQuiz() {
      try {
        const data = await getQuiz(Number(params.id));
        console.log("QUIZ LOADED");
        console.log(data);
        setQuiz(data);
      } catch (error) {
        console.error(error);
        setError("Impossible de charger le quiz. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    }

    loadQuiz();
  }, [params.id]);

  const handleSelectAnswer = (questionId: number, choice: string) => {
    if (submitted || showResults) return;
    setAnswers({
      ...answers,
      [questionId]: choice,
    });
  };

  const handleNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleGoHome = () => {
    router.push("/dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  async function calculateScore() {
    if (!quiz) return;

    // Vérifier que toutes les questions ont été répondues
    const totalQuestions = quiz.questions.length;
    const answeredQuestions = Object.keys(answers).length;

    if (answeredQuestions < totalQuestions) {
      setError(`Veuillez répondre à toutes les questions (${answeredQuestions}/${totalQuestions})`);
      return;
    }

    setSubmitting(true);
    setError(null);

    let result = 0;

    quiz.questions.forEach((question) => {
      if (answers[question.id] === question.answer) {
        result++;
      }
    });

    console.log("Score =", result);
    console.log("Quiz ID =", quiz.quiz_id);

    setScore(result);

    try {
      const response = await submitQuiz(
        quiz.quiz_id,
        result,
        quiz.questions.length
      );

      console.log("SUBMIT RESPONSE");
      console.log(response);

      setSubmitted(true);
      setShowResults(true);
    } catch (error) {
      console.error("SUBMIT ERROR");
      console.error(error);
      setError("Erreur lors de la soumission du quiz");
    } finally {
      setSubmitting(false);
    }
  }

  const handleRetry = () => {
    setAnswers({});
    setScore(null);
    setSubmitted(false);
    setShowResults(false);
    setCurrentQuestionIndex(0);
    setError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-violet-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-slate-600">Chargement du quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-violet-50">
        <div className="max-w-md rounded-2xl bg-white p-8 shadow-xl text-center">
          <AlertCircle className="mx-auto h-16 w-16 text-red-500" />
          <h3 className="mt-4 text-xl font-bold text-slate-900">Quiz non trouvé</h3>
          <p className="mt-2 text-slate-600">
            {error || "Le quiz que vous recherchez n'existe pas ou a été supprimé."}
          </p>
          <button
            onClick={handleGoHome}
            className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700 transition"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  const totalQuestions = quiz.questions.length;
  const answeredQuestions = Object.keys(answers).length;
  const progress = ((answeredQuestions) / totalQuestions) * 100;
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  // AFFICHAGE DES RÉSULTATS
  if (showResults && score !== null) {
    const percentage = Math.round((score / totalQuestions) * 100);
    const isPassed = percentage >= 60;

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* En-tête */}
          <div className="mb-8 flex items-center justify-between">
            <button
              onClick={handleGoHome}
              className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition"
            >
              <ArrowLeft className="h-5 w-5" />
              Retour
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-white hover:text-red-600 transition"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </div>

          {/* Carte des résultats */}
          <div className="rounded-3xl bg-white p-8 shadow-xl">
            <div className="text-center">
              <div className="mb-6 inline-flex rounded-full bg-indigo-100 p-4">
                <BarChart3 className="h-12 w-12 text-indigo-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Quiz terminé !</h2>
              <p className="mt-2 text-slate-600">
                Document #{quiz.document_id}
              </p>
            </div>

            {/* Score */}
            <div className="mt-8 flex flex-col items-center justify-center">
              <div className="relative">
                <svg className="h-40 w-40 transform -rotate-90">
                  <circle
                    className="text-slate-200"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="72"
                    cx="80"
                    cy="80"
                  />
                  <circle
                    className={`${isPassed ? "text-emerald-500" : "text-red-500"}`}
                    strokeWidth="8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="72"
                    cx="80"
                    cy="80"
                    strokeDasharray="452.389"
                    strokeDashoffset={452.389 - (452.389 * percentage) / 100}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-4xl font-bold text-slate-900">{percentage}%</span>
                    <p className="text-sm text-slate-500">{score}/{totalQuestions}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-col items-center gap-2">
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                    isPassed
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {isPassed ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Félicitations ! Quiz réussi
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4" />
                      Quiz non réussi, réessayez !
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Statistiques */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="rounded-xl bg-emerald-50 p-4 text-center">
                <CheckCircle className="mx-auto h-6 w-6 text-emerald-600" />
                <p className="mt-2 text-2xl font-bold text-emerald-700">{score}</p>
                <p className="text-sm text-emerald-600">Correctes</p>
              </div>
              <div className="rounded-xl bg-red-50 p-4 text-center">
                <XCircle className="mx-auto h-6 w-6 text-red-600" />
                <p className="mt-2 text-2xl font-bold text-red-700">{totalQuestions - score}</p>
                <p className="text-sm text-red-600">Incorrectes</p>
              </div>
              <div className="rounded-xl bg-blue-50 p-4 text-center">
                <Target className="mx-auto h-6 w-6 text-blue-600" />
                <p className="mt-2 text-2xl font-bold text-blue-700">{totalQuestions}</p>
                <p className="text-sm text-blue-600">Total</p>
              </div>
            </div>

            {/* Résumé des réponses */}
            <div className="mt-8">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">Résumé des réponses</h3>
              <div className="max-h-96 overflow-y-auto space-y-3">
                {quiz.questions.map((question, index) => {
                  const isCorrect = answers[question.id] === question.answer;
                  const hasAnswered = answers[question.id] !== undefined;
                  
                  return (
                    <div
                      key={question.id}
                      className={`flex items-center justify-between rounded-xl border p-4 ${
                        isCorrect
                          ? "border-emerald-200 bg-emerald-50"
                          : hasAnswered
                          ? "border-red-200 bg-red-50"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <span className="flex h-8 w-8 min-w-[2rem] items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                          {index + 1}
                        </span>
                        <span className="text-sm text-slate-700 line-clamp-2 flex-1">
                          {question.question}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600">
                          {question.difficulty}
                        </span>
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-emerald-500" />
                        ) : hasAnswered ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleRetry}
                className="flex-1 rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700 transition"
              >
                Recommencer le quiz
              </button>
              <button
                onClick={handleGoHome}
                className="flex-1 rounded-xl border border-slate-300 px-6 py-3 font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                <Home className="inline h-4 w-4 mr-2" />
                Tableau de bord
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // AFFICHAGE DU QUIZ
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* En-tête */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={handleGoHome}
            className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition"
          >
            <ArrowLeft className="h-5 w-5" />
            Retour
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">
              <Clock className="inline h-4 w-4 mr-1" />
              {currentQuestionIndex + 1}/{totalQuestions}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-white hover:text-red-600 transition"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Progression</span>
            <span>{answeredQuestions}/{totalQuestions} répondues</span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700 flex items-center gap-2 border border-red-200">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Carte du quiz */}
        <div className="rounded-3xl bg-white p-8 shadow-xl">
          {/* Info document */}
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-indigo-50 px-4 py-2 text-sm text-indigo-700">
            <FileText className="h-4 w-4" />
            Document #{quiz.document_id} • Quiz #{quiz.quiz_id}
          </div>

          {/* Question */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">
                  Question {currentQuestionIndex + 1}
                </span>
                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    currentQuestion.difficulty === "easy"
                      ? "bg-green-100 text-green-700"
                      : currentQuestion.difficulty === "medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {currentQuestion.difficulty}
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-slate-400">
                <Brain className="h-4 w-4" />
                <span>{answeredQuestions}/{totalQuestions}</span>
              </div>
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-900">
              {currentQuestion.question}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.choices.map((choice, idx) => {
              const isSelected = answers[currentQuestion.id] === choice;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(currentQuestion.id, choice)}
                  disabled={submitted || showResults}
                  className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50 shadow-md"
                      : "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                        isSelected
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-slate-700">{choice}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between gap-4">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 rounded-xl border border-slate-300 px-6 py-3 text-slate-700 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">
                {answeredQuestions}/{totalQuestions} répondues
              </span>
            </div>

            {isLastQuestion ? (
              <button
                onClick={calculateScore}
                disabled={submitting || submitted || answeredQuestions < totalQuestions}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-3 font-medium text-white hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                    Envoi...
                  </>
                ) : submitted ? (
                  <>
                    <CheckCircle className="inline h-4 w-4 mr-2" />
                    Quiz envoyé
                  </>
                ) : (
                  <>
                    <CheckCircle className="inline h-4 w-4 mr-2" />
                    Terminer le quiz
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                disabled={!answers[currentQuestion.id]}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 font-medium text-white hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Mini résumé des réponses */}
        <div className="mt-6">
          <p className="text-sm text-slate-600 mb-2">Questions :</p>
          <div className="flex flex-wrap gap-2">
            {quiz.questions.map((question, index) => {
              const isAnswered = answers[question.id] !== undefined;
              const isCurrent = index === currentQuestionIndex;
              const isCorrect = answers[question.id] === question.answer;
              
              let bgColor = "bg-slate-100 text-slate-500";
              if (isCurrent) bgColor = "ring-2 ring-indigo-600 ring-offset-2 bg-indigo-600 text-white";
              else if (isAnswered && isCorrect) bgColor = "bg-emerald-100 text-emerald-700";
              else if (isAnswered) bgColor = "bg-red-100 text-red-700";
              
              return (
                <button
                  key={question.id}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition ${bgColor}`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}