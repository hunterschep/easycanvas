/**
 * Utility functions for handling course refresh logic
 */

/**
 * Check if enough time has passed since the last update to warrant a refresh
 * @param lastUpdated The last updated timestamp, or null if never updated
 * @param hoursThreshold Number of hours that must pass before refresh is needed (default: 24)
 * @returns true if a refresh is needed, false otherwise
 */
export function shouldRefreshCourses(lastUpdated: Date | null, hoursThreshold: number = 24): boolean {
  // If never updated, always refresh
  if (!lastUpdated) {
    console.log('📅 No previous update timestamp found, refresh needed');
    return true;
  }

  const now = new Date();
  const hoursElapsed = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
  
  const shouldRefresh = hoursElapsed >= hoursThreshold;
  
  console.log(`📅 Course refresh check: ${hoursElapsed.toFixed(1)}h elapsed since last update, threshold: ${hoursThreshold}h, refresh needed: ${shouldRefresh}`);
  
  return shouldRefresh;
}

/**
 * Get a human-readable string for when courses were last updated
 * @param lastUpdated The last updated timestamp, or null if never updated
 * @returns A human-readable string describing when courses were last updated
 */
export function getLastUpdatedText(lastUpdated: Date | null): string {
  if (!lastUpdated) {
    return 'Never updated';
  }

  const now = new Date();
  const hoursElapsed = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
  
  if (hoursElapsed < 1) {
    const minutesElapsed = Math.floor(hoursElapsed * 60);
    return `Updated ${minutesElapsed} minute${minutesElapsed === 1 ? '' : 's'} ago`;
  } else if (hoursElapsed < 24) {
    const hours = Math.floor(hoursElapsed);
    return `Updated ${hours} hour${hours === 1 ? '' : 's'} ago`;
  } else {
    const days = Math.floor(hoursElapsed / 24);
    return `Updated ${days} day${days === 1 ? '' : 's'} ago`;
  }
}
