/**
 * API Fetch Interceptor
 * 
 * Wraps the native fetch API to intercept HTTP 403 (Forbidden) responses.
 * When a 403 is detected:
 * 1. Shows a browser push notification (if permissions granted)
 * 2. Clears authentication token
 * 3. Redirects to the sign-in page
 */

import { paths } from '@/paths';

interface FetchInterceptorOptions extends RequestInit {
  skipInterceptor?: boolean; // Allow bypassing the interceptor if needed
}

/**
 * Request notification permission on app load
 * Call this function in your app initialization
 */
export function requestNotificationPermission(): void {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then((permission) => {
      console.log('Notification permission:', permission);
    });
  }
}

/**
 * Initialize the global fetch interceptor
 * This overrides the native fetch to intercept 403 responses
 */
export function initializeFetchInterceptor(): void {
  if (typeof window === 'undefined') return; // Only run in browser

  // Store the original fetch
  const originalFetch = window.fetch;

  // Override global fetch
  window.fetch = async function(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    try {
      // Call original fetch
      const response = await originalFetch(input, init);

      // Intercept 401 Unauthorized and 403 Forbidden responses
      if (response.status === 401 || response.status === 403) {
        console.warn(`${response.status} ${response.status === 401 ? 'Unauthorized' : 'Forbidden'} detected, triggering session expiry handler`);
        handle403Error();
      }

      return response;
    } catch (error) {
      // Network errors or other fetch errors
      console.error('Fetch error:', error);
      throw error;
    }
  };

  console.log('Fetch interceptor initialized - 403 errors will trigger notification and redirect');
}

/**
 * Show a browser push notification
 */
function showNotification(title: string, body: string): void {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: '/logo.svg', // Update with your app's icon path
      badge: '/logo.svg',
      tag: '403-forbidden',
      requireInteraction: true, // Keeps notification visible until user interacts
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } else {
    // Fallback to console if notifications are not available
    console.warn(`${title}: ${body}`);
  }
}

/**
 * Handle 401 Unauthorized and 403 Forbidden responses
 */
function handle403Error(): void {
  // Show push notification
  showNotification(
    'Session Expired',
    'Your session has expired or you lack sufficient permissions. Please sign in again.'
  );

  // Clear authentication token
  localStorage.removeItem('custom-auth-token');

  // Small delay to ensure notification shows before redirect
  setTimeout(() => {
    // Redirect to sign-in page
    window.location.href = paths.auth.signIn;
  }, 500);
}

/**
 * Intercepted fetch function
 * 
 * Usage:
 * ```typescript
 * import { apiFetch } from '@/utils/apiFetch';
 * 
 * const response = await apiFetch('/api/users', {
 *   method: 'GET',
 *   headers: {
 *     'Authorization': `Bearer ${token}`
 *   }
 * });
 * ```
 */
export async function apiFetch(
  input: RequestInfo | URL,
  init?: FetchInterceptorOptions
): Promise<Response> {
  try {
    // Make the fetch request
    const response = await fetch(input, init);

    // Check if we should skip the interceptor
    if (init?.skipInterceptor) {
      return response;
    }

    // Intercept 401 Unauthorized and 403 Forbidden responses
    if (response.status === 401 || response.status === 403) {
      handle403Error();
      
      // Return the response anyway (useful for logging or error handling)
      // Note: The redirect will happen shortly after this
      return response;
    }

    return response;
  } catch (error) {
    // Network errors or other fetch errors
    console.error('Fetch error:', error);
    throw error;
  }
}

/**
 * Helper function to make authenticated API requests
 * Automatically adds the Bearer token from localStorage
 * 
 * Usage:
 * ```typescript
 * import { authenticatedFetch } from '@/utils/apiFetch';
 * 
 * const response = await authenticatedFetch('/api/users');
 * const data = await response.json();
 * ```
 */
export async function authenticatedFetch(
  input: RequestInfo | URL,
  init?: FetchInterceptorOptions
): Promise<Response> {
  const token = localStorage.getItem('custom-auth-token');

  const headers = new Headers(init?.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return apiFetch(input, {
    ...init,
    headers,
  });
}

/**
 * Default export for convenience
 */
export default apiFetch;
