# Caching Strategy

## Overview
EasyCanvas uses **React Query** as the single source of truth for all data caching. This provides a clean, efficient, and predictable caching layer with zero redundancy.

## What We Cache

### Data Caching (React Query Only)
- **User settings**: `['userSettings', userId]` - 5 min fresh, 24h cached
- **Courses**: `['courses', userId]` - 5 min fresh, 24h cached  
- **Individual course**: `['course', userId, courseId]` - 5 min fresh, 24h cached
- **Assignments**: `['assignment', userId, courseId, assignmentId]` - 5 min fresh, 24h cached
- **Chat messages**: In-memory only (not persisted)

### UI State (localStorage Only)
- **Sidebar collapsed state**: Per-user preference via `useSidebarState` hook

## Cache Keys Pattern
All data cache keys include the user ID for complete user isolation:
```typescript
['userSettings', userId]
['courses', userId]  
['course', userId, courseId]
['assignment', userId, courseId, assignmentId]
```

## Global Query Configuration
```typescript
{
  retry: 1,                    // Only retry once to avoid hanging
  staleTime: 1000 * 60 * 5,   // 5 minutes - data is fresh
  gcTime: 1000 * 60 * 60 * 24, // 24 hours - keep in cache
  refetchOnWindowFocus: false, // No refetch on focus
  refetchOnMount: false,       // No refetch if data exists
}
```

## Cache Invalidation
- **User logout**: All caches cleared automatically
- **User switch**: Previous user's cache cleared, new user gets fresh cache
- **Manual refresh**: Force refresh bypasses all caches

## Optimizations Applied
- ✅ **Single source of truth**: React Query only for data
- ✅ **User-specific persistence**: Automatic localStorage with user ID
- ✅ **Smart prefetching**: Assignments cached when course loads
- ✅ **Efficient hooks**: No redundant cache invalidation
- ✅ **Global defaults**: Consistent cache behavior across app
- ✅ **Custom UI hooks**: `useSidebarState` for UI preferences

## Benefits
- 🚀 **Performance**: 24h cache with smart background updates
- 🧹 **Clean code**: No manual localStorage management for data
- 🔒 **User isolation**: Complete cache separation between users
- 📱 **Offline support**: Automatic persistence and restoration
- 🛠️ **Maintainable**: Single caching pattern throughout app 