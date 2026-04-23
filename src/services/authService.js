import { apiRequest } from './http';

export function signup(payload) {
  return apiRequest('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      password: payload.password,
    }),
  });
}

export function login(payload) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
    }),
  });
}
