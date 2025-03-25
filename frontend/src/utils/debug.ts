/**
 * Utility functions for debugging React Query caching and state
 */

export const logCache = (message: string, data: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`📦 ${message}`);
    console.log(data);
    console.groupEnd();
  }
};

export const logError = (message: string, error: any) => {
  console.group(`❌ ${message}`);
  console.error(error);
  console.groupEnd();
};

export const logInfo = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`ℹ️ ${message}`);
    if (data) console.log(data);
    console.groupEnd();
  }
}; 