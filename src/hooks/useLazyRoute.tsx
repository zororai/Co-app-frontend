'use client';

import { useMemo, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { getLazyComponent, isLazyRoute } from '@/components/lazy/LazyRouteMap';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

// Default fallback component for lazy loading
const DefaultFallback = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px',
      gap: 2
    }}
  >
    <CircularProgress size={32} />
    <Typography variant="body2" color="text.secondary">
      Loading...
    </Typography>
  </Box>
);

/**
 * Hook for managing lazy-loaded routes
 * @param route - Optional route override (uses current pathname if not provided)
 * @returns Object with lazy loading utilities
 */
export function useLazyRoute(route?: string) {
  const pathname = usePathname();
  const currentRoute = route || pathname;

  const lazyData = useMemo(() => {
    const hasLazyLoading = isLazyRoute(currentRoute);
    const LazyComponent = getLazyComponent(currentRoute);

    return {
      isLazy: hasLazyLoading,
      component: LazyComponent,
      route: currentRoute,
    };
  }, [currentRoute]);

  /**
   * Render the lazy component with Suspense boundary
   * @param props - Props to pass to the component
   * @param fallback - Custom loading component
   * @returns JSX element or null
   */
  const renderLazyComponent = (props: any = {}, fallback?: React.ComponentType) => {
    if (!lazyData.component) {
      return null;
    }

    const FallbackComponent = fallback || DefaultFallback;

    return (
      <Suspense fallback={<FallbackComponent />}>
        <lazyData.component {...props} />
      </Suspense>
    );
  };

  return {
    ...lazyData,
    renderLazyComponent,
  };
}

/**
 * Hook for lazy loading statistics and monitoring
 * @returns Object with performance metrics
 */
export function useLazyLoadingStats() {
  const pathname = usePathname();

  return useMemo(() => {
    const isCurrentRouteLazy = isLazyRoute(pathname);
    
    return {
      currentRoute: pathname,
      isCurrentRouteLazy,
      // Add performance monitoring here if needed
      loadTime: performance.now(), // Simple timestamp for monitoring
    };
  }, [pathname]);
}

/**
 * Hook for preloading lazy components
 * @param routes - Array of routes to preload
 */
export function usePreloadLazyRoutes(routes: string[]) {
  useMemo(() => {
    // Preload components in the background
    routes.forEach(route => {
      const component = getLazyComponent(route);
      if (component) {
        // Trigger the lazy loading without rendering
        import(/* webpackMode: "lazy" */ `@/app/dashboard${route.replace('/dashboard', '')}/page`).catch(() => {
          // Silently handle preload failures
        });
      }
    });
  }, [routes]);
}

export default useLazyRoute;
