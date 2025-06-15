import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';

/**
 * Custom hook to manage sidebar collapsed state with user-specific persistence
 */
export const useSidebarState = () => {
  const { currentUser } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Load sidebar state when user changes
  useEffect(() => {
    if (currentUser?.uid) {
      const saved = localStorage.getItem(`easycanvas-sidebar-collapsed-${currentUser.uid}`);
      if (saved) {
        setIsSidebarCollapsed(JSON.parse(saved));
      }
    } else {
      // Reset to default when no user
      setIsSidebarCollapsed(false);
    }
  }, [currentUser?.uid]);

  // Save sidebar state when it changes
  useEffect(() => {
    if (currentUser?.uid) {
      localStorage.setItem(
        `easycanvas-sidebar-collapsed-${currentUser.uid}`, 
        JSON.stringify(isSidebarCollapsed)
      );
    }
  }, [isSidebarCollapsed, currentUser?.uid]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  return {
    isSidebarCollapsed,
    toggleSidebar,
    setIsSidebarCollapsed
  };
}; 