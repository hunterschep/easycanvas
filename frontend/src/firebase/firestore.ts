import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { app } from './config';
import CryptoJS from 'crypto-js';

const db = getFirestore(app);
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'your-fallback-key';

export const saveUserSettings = async (userId: string, canvasUrl: string, apiToken: string) => {
  try {
    // Encrypt the API token
    const encryptedToken = CryptoJS.AES.encrypt(apiToken, ENCRYPTION_KEY).toString();

    // Save to Firestore
    await setDoc(doc(db, 'users', userId), {
      canvasUrl,
      apiToken: encryptedToken,
      updatedAt: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error('Error saving user settings:', error);
    throw error;
  }
};

export const getUserSettings = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    const data = userDoc.data();

    if (data?.apiToken) {
      // Decrypt the API token
      const decryptedToken = CryptoJS.AES.decrypt(data.apiToken, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
      return {
        ...data,
        apiToken: decryptedToken
      };
    }

    return data;
  } catch (error) {
    console.error('Error getting user settings:', error);
    throw error;
  }
};