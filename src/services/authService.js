import { apiRequest } from './http';

const getRolePath = (role) => `/${role}`;

export async function fetchCities() {
  const response = await apiRequest('/cities', {
    method: 'GET',
  });

  return Array.isArray(response?.cities) ? response.cities : [];
}

export function signup(role, payload) {
  return apiRequest(`${getRolePath(role)}/signup`, {
    method: 'POST',
    body: JSON.stringify({
      name: payload.name,
      mobile: payload.mobile,
      city: payload.city,
      address: payload.address,
      bio: payload.bio,
      profileImage: payload.profileImage,
    }),
  });
}

export function login(role, payload) {
  return apiRequest(`${getRolePath(role)}/login`, {
    method: 'POST',
    body: JSON.stringify({
      mobile: payload.mobile,
    }),
  });
}
