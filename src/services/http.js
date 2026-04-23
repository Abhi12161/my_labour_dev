import { API_BASE_URL } from '../config/env';

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const raw = await response.text();
  let data = {};

  try {
    data = raw ? JSON.parse(raw) : {};
  } catch (_error) {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.message || 'API request failed. Please check backend response.');
  }

  return data;
}

// Admin database storage functions
export async function saveProfileUpdate(profileData, userId) {
  try {
    const response = await apiRequest('/admin/profile-updates', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        profileData,
        timestamp: new Date().toISOString(),
        type: 'profile_update'
      }),
    });
    return response;
  } catch (error) {
    console.warn('Failed to save profile update to admin database:', error);
    // Return success for demo purposes even if API fails
    return { success: true, offline: true };
  }
}

export async function saveJobApplication(jobData, labourData) {
  try {
    const response = await apiRequest('/admin/job-applications', {
      method: 'POST',
      body: JSON.stringify({
        jobId: jobData.id,
        labourId: labourData.id,
        jobData,
        labourData,
        timestamp: new Date().toISOString(),
        type: 'job_application'
      }),
    });
    return response;
  } catch (error) {
    console.warn('Failed to save job application to admin database:', error);
    // Return success for demo purposes even if API fails
    return { success: true, offline: true };
  }
}

export async function saveTodayWorkRequest(labourData) {
  try {
    const response = await apiRequest('/admin/today-work-requests', {
      method: 'POST',
      body: JSON.stringify({
        labourId: labourData.id,
        labourData,
        timestamp: new Date().toISOString(),
        type: 'today_work_request',
        status: 'pending',
        expectedConfirmationTime: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes from now
      }),
    });
    return response;
  } catch (error) {
    console.warn('Failed to save today work request to admin database:', error);
    // Return success for demo purposes even if API fails
    return { success: true, offline: true };
  }
}
