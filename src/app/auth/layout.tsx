import * as React from 'react';
import { GuestGuard } from '@/components/auth/guest-guard';

export default function AuthLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <GuestGuard>
      {children}
    </GuestGuard>
  );
}