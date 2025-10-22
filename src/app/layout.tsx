/* eslint-disable unicorn/consistent-function-scoping */

import * as React from 'react';
import type { Viewport } from 'next';

import '@/styles/global.css';

import { UserProvider } from '@/contexts/user-context';
import { LocalizationProvider } from '@/components/core/localization-provider';
import { ThemeProvider } from '@/components/core/theme-provider/theme-provider';
import { ApiFetchInterceptorInit } from '@/components/core/api-fetch-interceptor-init';

export const viewport = { width: 'device-width', initialScale: 1 } satisfies Viewport;

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <div suppressHydrationWarning>
          <LocalizationProvider>
            <UserProvider>
              <ThemeProvider>
                <ApiFetchInterceptorInit />
                {children}
              </ThemeProvider>
            </UserProvider>
          </LocalizationProvider>
        </div>
      </body>
    </html>
  );
}
