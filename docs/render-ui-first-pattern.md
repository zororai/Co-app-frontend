# Render UI First, Then Fetch Data Pattern

## Overview

This pattern improves user experience by rendering the UI skeleton immediately, then fetching data with a small delay. This prevents the "white screen" effect and makes the application feel more responsive.

## Key Benefits

- ✅ **Faster perceived loading** - Users see the UI structure immediately
- ✅ **Better UX** - No blank screens during initial load
- ✅ **Improved Core Web Vitals** - Better First Contentful Paint (FCP) scores
- ✅ **Progressive loading** - Content appears incrementally
- ✅ **Error resilience** - UI remains functional even if data fetch fails

## Implementation Steps

### 1. Add Loading State Management

```typescript
// Add loading states to your component
const [isInitialLoading, setIsInitialLoading] = React.useState(true);
const [data, setData] = React.useState<DataType[]>([]);
```

### 2. Modify Data Fetching Function

```typescript
// Update your fetch function to handle loading states
const fetchData = React.useCallback(async () => {
  try {
    const response = await apiClient.fetchData();
    setData(response);
  } catch (error) {
    console.error('API call failed:', error);
    // Handle error appropriately
  } finally {
    setIsInitialLoading(false); // Always set loading to false
  }
}, []);
```

### 3. Implement Delayed Fetch with useEffect

```typescript
// Render UI first, then fetch data with a small delay
React.useEffect(() => {
  const timer = setTimeout(() => {
    fetchData();
  }, 100); // 100ms delay allows UI to render first
  
  return () => clearTimeout(timer); // Cleanup timer on unmount
}, [fetchData]);
```

### 4. Create Loading Components

```typescript
// Create reusable loading components for different sections
interface LoadingStateProps {
  message?: string;
  minHeight?: number;
}

function LoadingState({ message = "Loading...", minHeight = 200 }: LoadingStateProps) {
  return (
    <Stack alignItems="center" justifyContent="center" sx={{ minHeight }}>
      <CircularProgress />
      <Typography variant="body2" sx={{ mt: 2 }}>
        {message}
      </Typography>
    </Stack>
  );
}
```

### 5. Split Components with Loading States

```typescript
// Create smaller components that handle their own loading states
interface TabComponentProps {
  data: DataType[];
  isLoading?: boolean;
  onRefresh: () => void;
}

function DataTab({ data, isLoading, onRefresh }: TabComponentProps) {
  if (isLoading) {
    return <LoadingState message="Loading data..." />;
  }
  
  return (
    <LazyWrapper>
      <DataTable data={data} onRefresh={onRefresh} />
    </LazyWrapper>
  );
}
```

## Complete Example Implementation

### Before (Blocking Pattern)
```typescript
export default function Page() {
  const [data, setData] = useState([]);
  
  // This blocks UI rendering until data is fetched
  useEffect(() => {
    fetchData().then(setData);
  }, []);
  
  return (
    <div>
      {data.length > 0 ? <DataTable data={data} /> : <div>Loading...</div>}
    </div>
  );
}
```

### After (Render UI First Pattern)
```typescript
export default function Page() {
  const [data, setData] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  const fetchData = useCallback(async () => {
    try {
      const response = await apiClient.fetchData();
      setData(response);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);
  
  // Render UI first, then fetch data
  useEffect(() => {
    const timer = setTimeout(() => fetchData(), 100);
    return () => clearTimeout(timer);
  }, [fetchData]);
  
  return (
    <Stack spacing={3}>
      {/* UI renders immediately */}
      <Typography variant="h4">Page Title</Typography>
      <Tabs value={activeTab} onChange={handleTabChange}>
        <Tab label="Tab 1" />
        <Tab label="Tab 2" />
      </Tabs>
      
      {/* Content with loading states */}
      <DataTab data={data} isLoading={isInitialLoading} />
    </Stack>
  );
}
```

## Required Imports

```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { Stack, Typography, CircularProgress, Tabs, Tab } from '@mui/material';
```

## Best Practices

### 1. Timer Cleanup
Always clean up timers to prevent memory leaks:
```typescript
useEffect(() => {
  const timer = setTimeout(() => fetchData(), 100);
  return () => clearTimeout(timer); // Essential cleanup
}, [fetchData]);
```

### 2. Error Handling
Handle errors gracefully without breaking the UI:
```typescript
const fetchData = useCallback(async () => {
  try {
    const response = await apiClient.fetchData();
    setData(response);
  } catch (error) {
    console.error('API call failed:', error);
    // Show error state but keep UI functional
    setError(error.message);
  } finally {
    setIsInitialLoading(false); // Always stop loading
  }
}, []);
```

### 3. Loading State Granularity
Use specific loading states for different sections:
```typescript
const [isDataLoading, setIsDataLoading] = useState(true);
const [isMetadataLoading, setIsMetadataLoading] = useState(true);
const [isChartsLoading, setIsChartsLoading] = useState(true);
```

### 4. Progressive Enhancement
Show increasingly detailed content as data loads:
```typescript
function ProgressiveContent({ data, isLoading }) {
  if (isLoading) {
    return <SkeletonLoader />;
  }
  
  if (data.length === 0) {
    return <EmptyState />;
  }
  
  return <FullDataView data={data} />;
}
```

## Common Patterns for Different Page Types

### Dashboard Pages
```typescript
// Dashboard with multiple data sources
useEffect(() => {
  const timer = setTimeout(() => {
    Promise.allSettled([
      fetchMetrics(),
      fetchCharts(),
      fetchRecentActivity()
    ]);
  }, 100);
  return () => clearTimeout(timer);
}, []);
```

### Table Pages
```typescript
// Table with filters and pagination
useEffect(() => {
  const timer = setTimeout(() => {
    fetchTableData(filters, pagination);
  }, 100);
  return () => clearTimeout(timer);
}, [filters, pagination]);
```

### Form Pages
```typescript
// Form with initial data
useEffect(() => {
  const timer = setTimeout(() => {
    if (editMode && itemId) {
      fetchItemData(itemId);
    }
  }, 100);
  return () => clearTimeout(timer);
}, [editMode, itemId]);
```

## Performance Considerations

### Optimal Delay Times
- **100ms**: Good for most data fetching
- **50ms**: For very fast APIs
- **200ms**: For complex UI with many components
- **0ms**: Use `setTimeout(() => {}, 0)` for immediate but non-blocking execution

### Memory Management
```typescript
// Use cleanup functions to prevent memory leaks
useEffect(() => {
  let isMounted = true;
  
  const timer = setTimeout(async () => {
    const data = await fetchData();
    if (isMounted) {
      setData(data);
    }
  }, 100);
  
  return () => {
    isMounted = false;
    clearTimeout(timer);
  };
}, []);
```

## Testing Considerations

### Unit Tests
```typescript
// Test that UI renders before data loads
test('renders UI immediately before data fetch', () => {
  render(<Page />);
  expect(screen.getByText('Page Title')).toBeInTheDocument();
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});
```

### Integration Tests
```typescript
// Test the complete loading flow
test('loads data after initial render', async () => {
  render(<Page />);
  
  // UI should be visible immediately
  expect(screen.getByText('Page Title')).toBeInTheDocument();
  
  // Data should load after delay
  await waitFor(() => {
    expect(screen.getByText('Data Content')).toBeInTheDocument();
  });
});
```

## Troubleshooting

### Common Issues

1. **Timer not cleaning up**: Always return cleanup function from useEffect
2. **Loading state not resetting**: Ensure `finally` block sets loading to false
3. **Multiple API calls**: Use proper dependency arrays in useEffect
4. **Memory leaks**: Check for component unmounting during async operations

### Debug Tips
```typescript
// Add logging to track the loading flow
useEffect(() => {
  console.log('Component mounted, setting up delayed fetch');
  const timer = setTimeout(() => {
    console.log('Starting data fetch');
    fetchData();
  }, 100);
  
  return () => {
    console.log('Cleaning up timer');
    clearTimeout(timer);
  };
}, [fetchData]);
```

## Migration Checklist

- [ ] Add loading state management
- [ ] Update data fetching functions with try/catch/finally
- [ ] Implement delayed fetch with useEffect
- [ ] Create loading components for each section
- [ ] Split large components into smaller ones
- [ ] Add proper error handling
- [ ] Test loading states and error scenarios
- [ ] Verify timer cleanup
- [ ] Update unit tests
- [ ] Performance test with network throttling

## Implementation Examples

### Driver Onboarding Page (Latest Implementation)
```typescript
// Complete implementation with all patterns applied
export default function DriverOnboardingPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  const fetchDrivers = useCallback(async () => {
    try {
      const data = await authClient.fetchDrivers();
      const normalizedData = data.map((driver: any) => ({
        ...driver,
        status: driver.status === "Approved" ? "APPROVED"
              : driver.status === "Rejected" ? "REJECTED"
              : driver.status === "Pending" ? "PENDING"
              : driver.status === "Pushed Back" ? "PUSHED_BACK"
              : driver.status
      }));
      setDrivers(normalizedData);
    } catch (error) {
      console.error('API call failed:', error);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);
  
  // Render UI first, then fetch data
  useEffect(() => {
    const timer = setTimeout(() => fetchDrivers(), 100);
    return () => clearTimeout(timer);
  }, [fetchDrivers]);
  
  return (
    <Stack spacing={3}>
      <Typography variant="h4">Driver Onboarding</Typography>
      <Tabs value={activeTab} onChange={handleTabChange}>
        <Tab label="Pending" value="PENDING" />
        <Tab label="Approved" value="APPROVED" />
      </Tabs>
      
      {activeTab === 'PENDING' && (
        <DriverTab 
          drivers={pendingDrivers} 
          isLoading={isInitialLoading}
          onRefresh={refreshData}
        />
      )}
    </Stack>
  );
}
```

### Vehicle Onboarding Page (Latest Implementation)
```typescript
// Enhanced pattern with fallback API strategy
export default function VehicleOnboardingPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  const fetchVehicles = useCallback(async () => {
    try {
      const data = await authClient.fetchVehicles();
      const normalizedData = data.map((vehicle: any) => ({
        ...vehicle,
        status: vehicle.status === "Approved" ? "APPROVED"
              : vehicle.status === "Rejected" ? "REJECTED"
              : vehicle.status === "Pending" ? "PENDING"
              : vehicle.status === "Pushed Back" ? "PUSHED_BACK"
              : vehicle.status
      }));
      setVehicles(normalizedData);
    } catch (error) {
      console.error('Primary API failed:', error);
      // Fallback strategy for missing APIs
      try {
        const fallbackData = await authClient.fetchPendingCustomers();
        setVehicles(fallbackData as unknown as Vehicle[]);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    } finally {
      setIsInitialLoading(false);
    }
  }, []);
  
  useEffect(() => {
    const timer = setTimeout(() => fetchVehicles(), 100);
    return () => clearTimeout(timer);
  }, [fetchVehicles]);
  
  return (
    <Stack spacing={3}>
      <Typography variant="h4">Vehicle Registration</Typography>
      <Tabs value={activeTab} onChange={handleTabChange}>
        <Tab label="Pending" value="PENDING" />
        <Tab label="Approved" value="APPROVED" />
      </Tabs>
      
      {activeTab === 'PENDING' && (
        <VehicleTab 
          vehicles={pendingVehicles} 
          isLoading={isInitialLoading}
          onRefresh={refreshData}
        />
      )}
    </Stack>
  );
}
```

### User Onboarding Page (Previous Implementation)
```typescript
// Similar pattern applied to user management
export default function UserOnboardingPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  const fetchUsers = useCallback(async () => {
    try {
      const data = await authClient.fetchPendingCustomers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);
  
  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(), 100);
    return () => clearTimeout(timer);
  }, [fetchUsers]);
  
  // Similar UI structure...
}
```

## Pages Successfully Migrated

✅ **User Onboarding Page** (`/dashboard/useronboard`)
- Added loading states to all tab components
- Implemented delayed fetch with 100ms delay
- Added button loading states for "Add User"

✅ **Driver Onboarding Page** (`/dashboard/driveronboarding`)  
- Complete implementation with data fetching
- Loading states for all driver status tabs
- Enhanced "Add New Driver" button with loading
- Fixed duplicate API calls issue (removed redundant useEffect)

✅ **Vehicle Onboarding Page** (`/dashboard/vehicleonboarding`)
- Refactored from blocking to delayed fetch pattern
- Added fallback API strategy for missing vehicle endpoints
{{ ... }}

## Migration Status Tracking

| Page | Status | Date Completed | Notes |
|------|--------|---------------|-------|
| User Onboarding | ✅ Complete | 2025-01-24 | Full pattern implementation |
| Driver Onboarding | ✅ Complete | 2025-01-24 | Added missing fetch logic |
| Vehicle Onboarding | ✅ Complete | 2025-01-24 | Refactored blocking pattern + fallback API |
| Customer Management | 🟡 Pending | - | Next target for migration |
| Reports Dashboard | 🟡 Pending | - | Complex data sources |
| Settings Pages | 🟡 Pending | - | Form-based, lower priority |

## Related Patterns

- **Skeleton Loading**: Show content placeholders while loading
- **Progressive Enhancement**: Load basic content first, enhance with details
- **Lazy Loading**: Load components only when needed
- **Error Boundaries**: Gracefully handle component errors
- **Suspense**: React's built-in loading state management

## Component-Level Optimizations

### Mobile Navigation (Latest Fix)
```typescript
// Applied render-ui-first pattern to mobile navigation permissions
export function MobileNav({ open, onClose }: MobileNavProps) {
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [filteredNavItems, setFilteredNavItems] = useState<NavItemConfig[]>([]);
  
  const fetchPermissions = useCallback(async () => {
    try {
      const { data: userData } = await authClient.getUser();
      // ... permission fetching logic
    } finally {
      setPermissionsLoading(false);
    }
  }, []);
  
  // Render UI first, then fetch permissions with delay
  useEffect(() => {
    const timer = setTimeout(() => fetchPermissions(), 100);
    return () => clearTimeout(timer);
  }, [fetchPermissions]);
  
  // UI renders immediately with loading state
  return (
    <Drawer open={open} onClose={onClose}>
      {/* UI structure renders first */}
      {(permissionsLoading || loading) && <LinearProgress />}
      <nav>{renderNavItems({ items: filteredNavItems })}</nav>
    </Drawer>
  );
}
```

## Next Steps

1. **Apply to Customer Management Pages**: Similar tab-based structure
2. **Implement for Dashboard Pages**: Multiple data sources, use Promise.allSettled
3. **Add to Form Pages**: Conditional fetching based on edit mode
4. **Performance Monitoring**: Track Core Web Vitals improvements
5. **User Testing**: Validate improved perceived performance

---

*This pattern should be applied consistently across all pages that fetch data to ensure a uniform, responsive user experience. Track migration progress and measure performance improvements.*
