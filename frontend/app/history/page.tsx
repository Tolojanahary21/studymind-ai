"use client";

import { useEffect, useState } from "react";
import { getHistory } from "@/lib/api";

interface QuizAttemptHistory {
  id: number;
  quiz_id: number;
  score: number;
  total_questions: number;
}

export default function HistoryPage() {

  const [history, setHistory] =
    useState<QuizAttemptHistory[]>([]);

  useEffect(() => {

    async function load() {

      const data =
        await getHistory();

      setHistory(data);
    }

    load();

  }, []);

  return (
    <div className="max-w-5xl mx-auto p-10">

      <h1 className="text-4xl font-bold mb-8">
        Historique des Quiz
      </h1>

      <div className="space-y-4">

        {history.map(
          (attempt: QuizAttemptHistory) => (

            <div
              key={attempt.id}
              className="border p-5 rounded-xl"
            >

              <h2>
                Quiz #{attempt.quiz_id}
              </h2>

              <p>
                Score :
                {" "}
                {attempt.score}
                /
                {attempt.total_questions}
              </p>

            </div>
          )
        )}

      </div>

    </div>
  );
}