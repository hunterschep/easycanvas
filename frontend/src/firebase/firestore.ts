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

export const getCoursesLastUpdated = async (userId: string) => {
  try {
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch('http://localhost:8000/api/user/courses/last-updated', {
      headers: {
        'Authorization': `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to get last updated timestamp:', response.status);
      return 0;
    }

    const data = await response.json();
    console.log('Last updated data from backend:', data);

    // Firebase Timestamp comes as { seconds: number, nanoseconds: number }
    const timestamp = data.lastUpdated?.seconds || 0;
    console.log('Extracted timestamp:', timestamp);
    
    return timestamp;
  } catch (error) {
    console.error('Error getting courses last updated:', error);
    return 0;
  }
};

export const getUserCourses = async (forceRefresh: boolean = false) => {
  try {
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) {
      throw new Error('Not authenticated');
    }

    // Get last updated timestamp from userCourses collection
    const lastUpdated = await getCoursesLastUpdated(auth.currentUser?.uid || '');
    const sixHoursInSeconds = 6 * 60 * 60;
    
    const shouldRefresh = 
      forceRefresh || 
      !lastUpdated ||
      (Date.now() / 1000 - lastUpdated > sixHoursInSeconds);

    console.log('Should refresh courses?', {
      forceRefresh,
      lastUpdated,
      timeSinceUpdate: Date.now() / 1000 - lastUpdated,
      shouldRefresh
    });

    // If we shouldn't refresh, try to get from localStorage first
    if (!shouldRefresh) {
      const cachedCoursesData = localStorage.getItem('coursesData');
      if (cachedCoursesData) {
        return JSON.parse(cachedCoursesData);
      }

      // If not in localStorage, get from backend without refreshing Canvas
      const response = await fetch('http://localhost:8000/api/user/courses?skipRefresh=true', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data)) {
          localStorage.setItem('coursesData', JSON.stringify(data));
          return data;
        }
      }
    }

    // Only reach here if we should refresh or failed to get stored data
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
    
    if (data && Array.isArray(data)) {
      localStorage.setItem('coursesData', JSON.stringify(data));
      
      // Only update Firebase timestamp if we actually refreshed from Canvas
      await updateUserSettings(auth.currentUser?.uid || '', {
        coursesLastUpdated: { seconds: Math.floor(Date.now() / 1000) }
      });
      
      return data;
    }

    throw new Error('No course data available');
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};