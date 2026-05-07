import { apiRequest } from './http';

function extractJobsPayload(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.jobs)) {
    return response.jobs;
  }

  if (Array.isArray(response?.data?.jobs)) {
    return response.data.jobs;
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
  const requiredLabours = Number(job?.requiredLabours || job?.requiredLabour || job?.requiredWorkers || 1);
  const hiredCount = Number(job?.hiredCount || job?.assignedCount || job?.applicants || job?.applicationsCount || 0);
  const status = String(job?.status || (hiredCount >= requiredLabours ? 'Completed' : 'Open'));
  const normalizedStatus = status.toLowerCase();

  return {
    id: String(job?._id || job?.id || `job-${index}`),
    title,
    location,
    posted: job?.posted || time,
    applicants: hiredCount,
    distance: job?.distance || 'Nearby',
    description,
    skill,
    skillLevel: job?.level || job?.skillLevel || 'Skilled',
    time,
    city,
    requiredLabours,
    hiredCount,
    availableSlots: Math.max(requiredLabours - hiredCount, 0),
    status,
    isCompleted: normalizedStatus === 'completed' || normalizedStatus === 'closed' || hiredCount >= requiredLabours,
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
    response?.data?.job ||
    response?.data ||
    response?.result ||
    response;

  return normalizeJob(createdJob);
}
