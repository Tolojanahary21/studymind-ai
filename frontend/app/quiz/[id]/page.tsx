"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getQuiz,
  submitQuiz,
} from "@/lib/api";

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

  const [quiz, setQuiz] =
    useState<Quiz | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [answers, setAnswers] =
    useState<Record<number, string>>({});

  const [score, setScore] =
    useState<number | null>(null);

  const [submitted, setSubmitted] =
    useState(false);

  useEffect(() => {
    async function loadQuiz() {
      try {
        const data = await getQuiz(
          Number(params.id)
        );

        console.log("QUIZ LOADED");
        console.log(data);

        setQuiz(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadQuiz();
  }, [params.id]);

  async function calculateScore() {
    if (!quiz) return;

    setSubmitting(true);

    let result = 0;

    quiz.questions.forEach((question) => {
      if (
        answers[question.id] ===
        question.answer
      ) {
        result++;
      }
    });

    console.log("Score =", result);
    console.log("Quiz ID =", quiz.quiz_id);

    setScore(result);

    try {
      const response =
        await submitQuiz(
          quiz.quiz_id,
          result,
          quiz.questions.length
        );

      console.log(
        "SUBMIT RESPONSE"
      );
      console.log(response);

      setSubmitted(true);
    } catch (error) {
      console.error(
        "SUBMIT ERROR"
      );
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="p-10">
        Loading quiz...
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="p-10">
        Quiz not found
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8">

      <h1 className="text-3xl font-bold mb-8">
        Quiz #{quiz.quiz_id}
      </h1>

      <div className="space-y-8">

        {quiz.questions.map(
          (question, index) => (
            <div
              key={question.id}
              className="border rounded-xl p-6 bg-white shadow-sm"
            >
              <div className="flex justify-between mb-3">

                <h2 className="font-semibold">
                  Question {index + 1}
                </h2>

                <span
                  className={`text-sm px-3 py-1 rounded-full ${
                    question.difficulty ===
                    "easy"
                      ? "bg-green-100 text-green-700"
                      : question.difficulty ===
                        "medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {question.difficulty}
                </span>

              </div>

              <p className="mb-4">
                {question.question}
              </p>

              <div className="space-y-2">

                {question.choices.map(
                  (choice, idx) => (
                    <label
                      key={idx}
                      className="flex items-center gap-3 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={choice}
                        checked={
                          answers[
                            question.id
                          ] === choice
                        }
                        onChange={() =>
                          setAnswers({
                            ...answers,
                            [question.id]:
                              choice,
                          })
                        }
                      />

                      <span>
                        {choice}
                      </span>
                    </label>
                  )
                )}

              </div>
            </div>
          )
        )}

      </div>

      <div className="mt-10">

        <button
          onClick={calculateScore}
          disabled={
            submitting ||
            submitted
          }
          className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition disabled:bg-gray-400"
        >
          {submitting
            ? "Envoi..."
            : submitted
            ? "Quiz envoyé"
            : "Terminer le quiz"}
        </button>

      </div>

      {score !== null && (
        <div className="mt-8 border rounded-xl p-6 bg-green-50">

          <h2 className="text-2xl font-bold">
            Score : {score} /{" "}
            {quiz.questions.length}
          </h2>

          <p className="mt-2 text-gray-600">
            Pourcentage :{" "}
            {Math.round(
              (score /
                quiz.questions.length) *
                100
            )}
            %
          </p>

        </div>
      )}

    </div>
  );
}