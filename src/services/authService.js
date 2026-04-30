import { apiRequest } from './http';

export function signup(payload) {
  return apiRequest('/labour/signup', {
    method: 'POST',
    body: JSON.stringify({
      name: payload.name,
      mobile: payload.mobile,
      address: payload.address,
    }),
  });
}

export function login(payload) {
  return apiRequest('/labour/login', {
    method: 'POST',
    body: JSON.stringify({
      mobile: payload.mobile,
    }),
  });
}
