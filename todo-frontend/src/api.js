/**
 * api.js
 * Lớp giao tiếp với backend REST API (khớp đúng với response shape
 * của server.js: GET list trả {data, pagination}, lỗi trả {error: "..."}).
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (res.status === 204) return null; // DELETE không có body

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const message = (body && body.error) || `Lỗi không xác định (mã ${res.status}).`;
    throw new Error(message);
  }

  return body;
}

export function fetchTodos(params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
  ).toString();
  return request(`/todos${query ? `?${query}` : ''}`);
}

export function createTodo(title) {
  return request('/todos', { method: 'POST', body: JSON.stringify({ title }) });
}

export function updateTodo(id, updates) {
  return request(`/todos/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
}

export function deleteTodo(id) {
  return request(`/todos/${id}`, { method: 'DELETE' });
}

export function toggleTodo(id) {
  return request(`/todos/${id}/toggle`, { method: 'PATCH' });
}
