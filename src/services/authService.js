import { apiRequest } from './http';

const getRolePath = (role) => `/${role}`;

export function signup(role, payload) {
  return apiRequest(`${getRolePath(role)}/signup`, {
    method: 'POST',
    body: JSON.stringify({
      name: payload.name,
      mobile: payload.mobile,
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
