import { auth } from '../config/firebase.config';

export const saveUserSettings = async (userId: string, canvasUrl: string, apiToken: string) => {
  try {
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) {
      throw new Error('Not authenticated');
    }

    // Add https:// if not present
    const formattedUrl = canvasUrl.startsWith('http') ? canvasUrl : `https://${canvasUrl}`;

    const response = await fetch('http://localhost:8000/api/user/settings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        canvasUrl: formattedUrl,
        apiToken,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to save settings');
    }

    return true;
  } catch (error) {
    console.error('Error saving user settings:', error);
    throw error;
  }
};

export const getUserSettings = async (userId: string) => {
  try {
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch('http://localhost:8000/api/user/settings', {
      headers: {
        'Authorization': `Bearer ${idToken}`,
      },
    });

    if (response.status === 404) {
      throw new Error('NEW_USER');
    }

    if (!response.ok) {
      throw new Error('Failed to get settings');
    }

    return response.json();
  } catch (error) {
    console.error('Error getting user settings:', error);
    throw error;
  }
};

export const updateUserSettings = async (userId: string, updates: any) => {
  try {
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch('http://localhost:8000/api/user/settings', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update settings');
    }

    return true;
  } catch (error) {
    console.error('Error updating user settings:', error);
    throw error;
  }
};

export const deleteUserAccount = async (userId: string) => {
  try {
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch('http://localhost:8000/api/user/settings', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete account');
    }

    return true;
  } catch (error) {
    console.error('Error deleting user account:', error);
    throw error;
  }
};

export const getUserCourses = async (forceRefresh: boolean = false) => {
  try {
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) {
      throw new Error('Not authenticated');
    }

    // Check cache and timing conditions
    const lastFetchedTime = localStorage.getItem('coursesLastFetched');
    const cachedCoursesData = localStorage.getItem('coursesData');
    const sixHoursInMs = 6 * 60 * 60 * 1000;
    
    const shouldRefresh = 
      forceRefresh || 
      !cachedCoursesData || 
      !lastFetchedTime ||
      (Date.now() - parseInt(lastFetchedTime, 10) > sixHoursInMs);

    // Always fetch if no cached data
    if (shouldRefresh) {
      const response = await fetch('http://localhost:8000/api/user/courses', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'X-Content-Type-Options': 'nosniff',
          'Referrer-Policy': 'strict-origin-when-cross-origin'
        },
        credentials: 'same-origin'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const data = await response.json();
      
      // Only update cache if we got valid data
      if (data && Array.isArray(data)) {
        localStorage.setItem('coursesData', JSON.stringify(data));
        localStorage.setItem('coursesLastFetched', Date.now().toString());
        return data;
      }
    }

    // Return cached data if available
    if (cachedCoursesData) {
      return JSON.parse(cachedCoursesData);
    }

    throw new Error('No course data available');
  } catch (error) {
    console.error('Error fetching courses:', error);
    
    // Last resort: try to use cached data even if fetch failed
    const cachedCoursesData = localStorage.getItem('coursesData');
    if (cachedCoursesData) {
      return JSON.parse(cachedCoursesData);
    }
    
    throw error;
  }
};