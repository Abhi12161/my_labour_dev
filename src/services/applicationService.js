import { apiRequest } from './http';

function toArray(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.applications)) {
    return response.applications;
  }

  if (Array.isArray(response?.notifications)) {
    return response.notifications;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.result)) {
    return response.result;
  }

  return [];
}

function getJobFromApplication(item) {
  return item?.jobId || item?.job || item?.jobData || {};
}

function getLabourFromApplication(item) {
  return item?.labourId || item?.labour || item?.labourData || {};
}

function getCustomerFromApplication(item) {
  return item?.customerId || item?.customer || item?.customerData || {};
}

export function normalizeApplication(item, index = 0) {
  const job = getJobFromApplication(item);
  const labour = getLabourFromApplication(item);

  return {
    id: String(item?._id || item?.id || item?.applicationId || `application-${index}`),
    status: item?.status || 'pending',
    appliedAt: item?.createdAt || item?.appliedAt || item?.timestamp || new Date().toISOString(),
    customerId: item?.customerId || job?.customerId || '',
    job: {
      id: String(job?._id || job?.id || item?.jobId || `job-${index}`),
      title: job?.title || item?.jobTitle || 'Untitled Job',
      location: job?.location || job?.city || item?.location || 'Not provided',
      skill: job?.skill || job?.category || 'General',
    },
    labour: {
      id: String(labour?._id || labour?.id || item?.labourId || `labour-${index}`),
      name: labour?.name || item?.labourName || 'Labour',
      mobile: labour?.mobile || labour?.phone || item?.labourMobile || 'Not provided',
      address: labour?.address || labour?.location || item?.labourAddress || 'Not provided',
      bio: labour?.bio || labour?.title || '',
      profileImage: labour?.profileImage || '',
      skills: Array.isArray(labour?.skills) ? labour.skills : [],
      rating: labour?.rating || item?.rating || 0,
    },
  };
}

export function normalizeNotification(item, index = 0) {
  const job = getJobFromApplication(item);
  const labour = getLabourFromApplication(item);
  const customer = getCustomerFromApplication(item);
  const actor = Object.keys(customer || {}).length ? customer : labour;

  return {
    id: String(item?._id || item?.id || `notification-${index}`),
    type: item?.type || item?.status || 'notification',
    status: item?.status || 'pending',
    timestamp: item?.createdAt || item?.updatedAt || item?.timestamp || new Date().toISOString(),
    jobTitle: job?.title || item?.jobTitle || 'your job',
    jobLocation: job?.location || job?.city || item?.location || 'Not provided',
    actorName: actor?.name || item?.name || item?.labourName || item?.customerName || 'Unknown',
    actorMobile:
      actor?.mobile ||
      actor?.phone ||
      item?.mobile ||
      item?.labourMobile ||
      item?.customerMobile ||
      'Not provided',
    actorAddress:
      actor?.address ||
      actor?.location ||
      item?.address ||
      item?.labourAddress ||
      item?.customerAddress ||
      'Not provided',
    message:
      item?.message ||
      item?.title ||
      `Job update for ${job?.title || item?.jobTitle || 'your job'}`,
  };
}

export async function applyToJob(jobId, token) {
  const response = await apiRequest('/job-applications/apply', {
    method: 'POST',
    body: JSON.stringify({ jobId }),
    ...(token ? { token } : {}),
  });

  // Normalize and return the application object
  return normalizeApplication(
    response?.application || response?.data || response?.result || response
  );
}

export async function fetchLabourNotifications(token) {
  const response = await apiRequest('/job-applications/notifications', {
    method: 'GET',
    token,
  });

  return toArray(response).map(normalizeNotification);
}

export async function fetchCustomerApplications(token) {
  const response = await apiRequest('/job-applications/customer', {
    method: 'GET',
    token,
  });

  return toArray(response).map(normalizeApplication);
}

export async function hireApplication(applicationId, token) {
  const response = await apiRequest(`/job-applications/hire/${applicationId}`, {
    method: 'PUT',
    token,
  });

  return normalizeApplication(
    response?.application || response?.data || response?.result || response
  );
}
