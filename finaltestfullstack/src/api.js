export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json();
}


export const api = {
  getTeachers: (params = { page: 1, limit: 20 }) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/teachers?${qs}`);
  },
  createTeacher: (data) =>
    request("/teachers", { method: "POST", body: JSON.stringify(data) }),

  getPositions: () => request("/positions"),
  createPosition: (data) =>
    request("/positions", { method: "POST", body: JSON.stringify(data) }),
  async deletePosition(id) {
    const { data } = await http.delete(`/api/teacher-positions/${id}`);
    return data;
  },

};
