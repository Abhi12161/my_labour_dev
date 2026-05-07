import { apiRequest } from './http';

const DIRECT_HIRE_BASE_PATHS = ['/labour-request', '/labour-requests'];

async function directHireRequest(path, options) {
  let lastError;

  for (const basePath of DIRECT_HIRE_BASE_PATHS) {
    try {
      return await apiRequest(`${basePath}${path}`, options);
    } catch (error) {
      lastError = error;

      if (!String(error.message || '').toLowerCase().includes('route not found')) {
        throw error;
      }
    }
  }

  throw lastError;
}

function toArray(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.requests)) {
    return response.requests;
  }

  if (Array.isArray(response?.data?.requests)) {
    return response.data.requests;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.result)) {
    return response.result;
  }

  return [];
}

function getRequestPayload(response) {
  return response?.request || response?.data?.request || response?.data || response?.result || response;
}

export function normalizeDirectHireRequest(item, index = 0) {
  const labour = item?.labour || item?.labourId || {};
  const customer = item?.customer || item?.customerId || {};
  const workDetails = item?.workDetails || {};
  const labourNotifications = Array.isArray(item?.labourNotifications) ? item.labourNotifications : [];
  const customerNotifications = Array.isArray(item?.customerNotifications) ? item.customerNotifications : [];

  return {
    id: String(item?._id || item?.id || `direct-request-${index}`),
    status: String(item?.status || 'Available').toLowerCase(),
    statusLabel: item?.status || 'Available',
    city: item?.city || labour?.city || customer?.city || '',
    labour: {
      id: String(labour?._id || labour?.id || item?.labourId || `labour-${index}`),
      name: labour?.name || 'Labour',
      mobile: labour?.mobile || labour?.phone || 'Not provided',
      address: labour?.address || labour?.location || 'Not provided',
      city: labour?.city || item?.city || '',
      bio: labour?.bio || '',
      profileImage: labour?.profileImage || '',
      rating: labour?.rating || 0,
      skills: Array.isArray(labour?.skills) ? labour.skills : [],
    },
    customer: {
      id: String(customer?._id || customer?.id || item?.customerId || ''),
      name: customer?.name || '',
      mobile: customer?.mobile || customer?.phone || '',
      address: customer?.address || '',
      city: customer?.city || '',
    },
    workDetails: {
      location: workDetails?.location || '',
      timing: workDetails?.timing || '',
      notes: workDetails?.notes || '',
      customerName: workDetails?.customerName || customer?.name || '',
      customerMobile: workDetails?.customerMobile || customer?.mobile || customer?.phone || '',
    },
    notification: item?.notification || '',
    labourNotifications,
    customerNotifications,
    createdAt: item?.createdAt || new Date().toISOString(),
    updatedAt: item?.updatedAt || item?.createdAt || new Date().toISOString(),
  };
}

export function normalizeDirectHireNotifications(request, role = 'labour') {
  const entries =
    role === 'customer'
      ? request.customerNotifications
      : request.labourNotifications;

  if (entries?.length) {
    return entries.map((entry, index) => ({
      id: String(entry?._id || `${request.id}-${role}-${index}`),
      type: entry?.type || request.statusLabel || 'Notification',
      status: String(entry?.type || request.statusLabel || 'notification').toLowerCase(),
      statusLabel: entry?.type || request.statusLabel || 'Notification',
      message:
        typeof entry === 'string'
          ? entry
          : entry?.message || request.notification || 'Notification received',
      timestamp: entry?.createdAt || request.updatedAt || request.createdAt,
      actorName: role === 'customer' ? request.labour.name : request.customer.name,
      actorMobile: role === 'customer' ? request.labour.mobile : request.customer.mobile,
      actorAddress: role === 'customer' ? request.labour.address : request.customer.address,
      jobTitle: request.workDetails.notes || 'Direct hire request',
      jobLocation: request.workDetails.location || request.city || 'Not provided',
      source: 'direct-hire',
    }));
  }

  if (!request.notification) {
    return [];
  }

  return [
    {
      id: `${request.id}-${role}-latest`,
      type: request.statusLabel,
      status: request.status,
      statusLabel: request.statusLabel,
      message: request.notification,
      timestamp: request.updatedAt || request.createdAt,
      actorName: role === 'customer' ? request.labour.name : request.customer.name,
      actorMobile: role === 'customer' ? request.labour.mobile : request.customer.mobile,
      actorAddress: role === 'customer' ? request.labour.address : request.customer.address,
      jobTitle: request.workDetails.notes || 'Direct hire request',
      jobLocation: request.workDetails.location || request.city || 'Not provided',
      source: 'direct-hire',
    },
  ];
}

export async function fetchAvailableLabourRequests(token) {
  const response = await directHireRequest('/list', {
    method: 'GET',
    token,
  });

  return toArray(response).map(normalizeDirectHireRequest);
}

export async function fetchNearbyLabourRequests(token, city) {
  const query = `?city=${encodeURIComponent(city)}`;
  const response = await directHireRequest(`/nearby${query}`, {
    method: 'GET',
    token,
  });

  return toArray(response).map(normalizeDirectHireRequest);
}

export async function markLabourAvailable(token) {
  const response = await directHireRequest('/request', {
    method: 'POST',
    token,
  });

  return normalizeDirectHireRequest(getRequestPayload(response));
}

export async function fetchMyAvailability(token) {
  const response = await directHireRequest('/me', {
    method: 'GET',
    token,
  });

  return normalizeDirectHireRequest(getRequestPayload(response));
}

export async function directHireLabour(requestId, payload, token) {
  const response = await directHireRequest(`/hire/${requestId}`, {
    method: 'PUT',
    token,
    body: JSON.stringify({
      location: payload.location,
      timing: payload.timing,
      notes: payload.notes,
    }),
  });

  return normalizeDirectHireRequest(getRequestPayload(response));
}
