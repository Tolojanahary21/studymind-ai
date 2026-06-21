"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function SummaryPage() {

  const params = useParams();

  const [summary, setSummary] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    async function loadSummary() {

      const token =
        localStorage.getItem("token");

      const response =
        await fetch(
          `http://localhost:8000/api/documents/${params.id}/summary`,
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

      setSummary(
        data.summary
      );

      setLoading(false);
    }

    loadSummary();

  }, [params.id]);

  if (loading) {
    return (
      <div className="p-10">
        Génération du résumé...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-10">

      <h1 className="text-4xl font-bold mb-8">
        Résumé du document
      </h1>

      <div className="bg-white rounded-xl shadow p-8">

        <p className="leading-8 whitespace-pre-wrap">
          {summary}
        </p>

      </div>

    </div>
  );
}