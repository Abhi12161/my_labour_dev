import { apiRequest } from './http';

export function signup(role, payload) {
  return apiRequest(`/${role}/signup`, {
    method: 'POST',
    body: JSON.stringify({
      name: payload.name,
      mobile: payload.phone,
      address: payload.address,
    }),
  });
}

export function login(role, payload) {
  return apiRequest(`/${role}/login`, {
    method: 'POST',
    body: JSON.stringify({
      mobile: payload.phone,
    }),
  });
}
