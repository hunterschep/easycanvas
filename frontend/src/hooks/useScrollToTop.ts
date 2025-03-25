import { useEffect } from 'react';
import { scrollToTop } from '@/utils/scroll';

/**
 * A custom hook that scrolls to the top of the page when a component mounts
 * or when specified dependencies change
 * 
 * @param {boolean} scrollOnMount - Whether to scroll on component mount (default: true)
 * @param {any[]} deps - Optional dependency array that will trigger scrolling when changed
 */
export const useScrollToTop = (scrollOnMount: boolean = true, deps: any[] = []) => {
  useEffect(() => {
    if (scrollOnMount || deps.length > 0) {
      scrollToTop();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollOnMount, ...deps]);
}; 