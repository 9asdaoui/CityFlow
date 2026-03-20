const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export async function getTensionScore(payload) {
  const response = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}
