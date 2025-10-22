/**
 * Hook to initialize API fetch interceptor
 * 
 * This hook should be called once in your app's root layout
 * to request notification permissions for 403 error handling
 * and override the global fetch function
 */

'use client';

import { useEffect } from 'react';
import { requestNotificationPermission, initializeFetchInterceptor } from '@/utils/apiFetch';

export function useApiFetchInterceptor(): void {
  useEffect(() => {
    // Initialize the global fetch interceptor
    initializeFetchInterceptor();
    
    // Request notification permission when app loads
    requestNotificationPermission();
  }, []);
}
