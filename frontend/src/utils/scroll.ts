/**
 * Utilities for managing scrolling behavior
 */

/**
 * Scrolls the window to the top with optional smooth behavior
 * @param {boolean} smooth - Whether to use smooth scrolling
 */
export const scrollToTop = (smooth: boolean = false): void => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: smooth ? 'smooth' : 'auto'
  });
};

/**
 * Scrolls to a specific element by ID
 * @param {string} elementId - The ID of the element to scroll to
 * @param {boolean} smooth - Whether to use smooth scrolling
 * @param {number} offset - Offset in pixels from the top of the element
 */
export const scrollToElement = (elementId: string, smooth: boolean = true, offset: number = 0): void => {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const y = element.getBoundingClientRect().top + window.pageYOffset + offset;
  
  window.scrollTo({
    top: y,
    behavior: smooth ? 'smooth' : 'auto'
  });
};

/**
 * Higher-order component that registers a route change listener to handle scrolling
 * @param {React.Component} WrappedComponent - The component to wrap
 */
export const saveScrollPosition = (): void => {
  // Save the current scroll position
  const scrollY = window.scrollY;
  sessionStorage.setItem('scrollPosition', scrollY.toString());
};

/**
 * Restores the previously saved scroll position
 */
export const restoreScrollPosition = (): void => {
  const savedPosition = sessionStorage.getItem('scrollPosition');
  if (savedPosition) {
    window.scrollTo(0, parseInt(savedPosition, 10));
    sessionStorage.removeItem('scrollPosition');
  }
}; 