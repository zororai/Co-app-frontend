'use client';

import { useApiFetchInterceptor } from '@/hooks/use-api-fetch-interceptor';

/**
 * Component to initialize API fetch interceptor
 * This requests notification permissions for 403 error handling
 */
export function ApiFetchInterceptorInit(): null {
  useApiFetchInterceptor();
  return null;
}
