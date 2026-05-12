import { apiRequest } from './http';

function extractJobsPayload(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.jobs)) {
    return response.jobs;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.result)) {
    return response.result;
  }

  return [];
}

function normalizeJob(job, index = 0) {
  const city = job?.city || job?.location || 'Muzaffarpur';
  const location = job?.location || city;
  const title = job?.title || 'Untitled Job';
  const description = job?.description || '';
  const skill = job?.skill || job?.category || 'General';
  const time = job?.timing || job?.time || 'Today';

  return {
    id: String(job?._id || job?.id || `job-${index}`),
    title,
    location,
    posted: job?.posted || time,
    applicants: Number(job?.applicants || job?.applicationsCount || 0),
    distance: job?.distance || 'Nearby',
    description,
    skill,
    skillLevel: job?.level || job?.skillLevel || 'Skilled',
    time,
    city,
    raw: job,
  };
}

export async function fetchJobs(token) {
  const response = await apiRequest('/jobs', {
    method: 'GET',
    ...(token ? { token } : {}),
  });

  return extractJobsPayload(response).map(normalizeJob);
}

export async function createJob(payload, token) {
  const response = await apiRequest('/jobs', {
    method: 'POST',
    body: JSON.stringify(payload),
    ...(token ? { token } : {}),
  });

  const createdJob =
    response?.job ||
    response?.data ||
    response?.result ||
    response;

  return normalizeJob(createdJob);
}
