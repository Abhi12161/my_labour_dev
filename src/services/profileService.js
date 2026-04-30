import { apiRequest } from './http';

const getRolePath = (role) => `/${role}`;

export function getProfile(role, token) {
  return apiRequest(`${getRolePath(role)}/profile`, {
    method: 'GET',
    token,
  });
}

export function updateProfile(role, token, payload) {
  return apiRequest(`${getRolePath(role)}/profile`, {
    method: 'PUT',
    token,
    body: JSON.stringify({
      name: payload.name,
      mobile: payload.mobile,
      address: payload.address,
      bio: payload.bio,
      profileImage: payload.profileImage,
    }),
  });
}

export function addSkill(token, payload) {
  return apiRequest('/labour/skills', {
    method: 'POST',
    token,
    body: JSON.stringify({
      name: payload.name,
      experienceYears: Number(payload.experienceYears),
      level: payload.level,
      notes: payload.notes,
    }),
  });
}

export function updateSkill(token, skillId, payload) {
  return apiRequest(`/labour/skills/${skillId}`, {
    method: 'PUT',
    token,
    body: JSON.stringify({
      name: payload.name,
      experienceYears: Number(payload.experienceYears),
      level: payload.level,
      notes: payload.notes,
    }),
  });
}

export function deleteSkill(token, skillId) {
  return apiRequest(`/labour/skills/${skillId}`, {
    method: 'DELETE',
    token,
  });
}
