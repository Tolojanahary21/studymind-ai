"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

export default function GenerateQuizPage() {

  const params = useParams();

  const router =
    useRouter();

  useEffect(() => {

    async function generateQuiz() {

      const token =
        localStorage.getItem(
          "token"
        );

      const response =
        await fetch(
          `http://localhost:8000/api/documents/${params.id}/quiz`,
          {
            method: "POST",
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      router.push(
        `/quiz/${data.quiz_id}`
      );
    }

    generateQuiz();

  }, [params.id, router]);

  return (
    <div className="p-10">
      Génération du quiz...
    </div>
  );
}