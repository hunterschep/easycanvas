import { auth } from './config';

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

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get settings');
    }

    return response.json();
  } catch (error) {
    console.error('Error getting user settings:', error);
    throw error;
  }
};