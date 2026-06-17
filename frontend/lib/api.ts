const API_URL = "http://localhost:8000";

export async function getCurrentUser() {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/api/users/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }

  return response.json();
}