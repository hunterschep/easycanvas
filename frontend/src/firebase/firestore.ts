import { auth } from '../config/firebase.config';
import { CourseService } from '../features/courses/services/course.service';

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

    // First check localStorage
    const cachedCoursesData = localStorage.getItem('coursesData');
    
    if (!forceRefresh && cachedCoursesData) {
      // If we have local data, check if we need to refresh
      const lastUpdated = await getCoursesLastUpdated(auth.currentUser?.uid || '');
      const sixHoursInSeconds = 6 * 60 * 60;
      
      const currentUTCSeconds = Math.floor(new Date().getTime() / 1000);
      const shouldRefresh = 
        !lastUpdated ||
        (currentUTCSeconds - lastUpdated > sixHoursInSeconds);

      console.log('Time check:', {
        currentUTCTime: new Date().toUTCString(),
        lastUpdatedTime: new Date(lastUpdated * 1000).toUTCString(),
        timeDifference: currentUTCSeconds - lastUpdated,
        shouldRefresh
      });

      if (!shouldRefresh) {
        console.log('Using localStorage cached data');
        return JSON.parse(cachedCoursesData);
      }
      // If we need to refresh, set forceRefresh to true
      forceRefresh = true;
    }

    // Use CourseService instead of direct fetch
    const data = await CourseService.getCourses(forceRefresh);
    
    if (data && Array.isArray(data)) {
      localStorage.setItem('coursesData', JSON.stringify(data));
      return data;
    }

    throw new Error('No course data available');
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
}