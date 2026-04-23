import { API_BASE_URL } from '../config/env';

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const raw = await response.text();
  let data = {};

  try {
    data = raw ? JSON.parse(raw) : {};
  } catch (_error) {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.message || 'API request failed. Please check backend response.');
  }

  return data;
}
