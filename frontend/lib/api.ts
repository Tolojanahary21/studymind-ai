const API_URL = "http://localhost:8000";

export async function getCurrentUser() {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/api/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch user");
  return response.json();
}

export async function getDocuments() {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/api/documents`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch documents");
  return response.json();
}

export async function uploadDocument(file: File) {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await fetch(`${API_URL}/api/documents/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!response.ok) throw new Error("Upload failed");
  return response.json();
}

export async function generateSummary(documentId: number) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/api/documents/${documentId}/summary`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Summary generation failed");
  return response.json();
}

export async function generateQuiz(documentId: number) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/api/documents/${documentId}/quiz`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Quiz generation failed");
  return response.json();
}

export async function getQuiz(quizId: number) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/api/quizzes/${quizId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch quiz");
  return response.json();
}

export async function submitQuiz(quizId: number, score: number, totalQuestions: number) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/api/quizzes/${quizId}/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ score, total_questions: totalQuestions }),
  });
  if (!response.ok) throw new Error("Failed to submit quiz");
  return response.json();
}