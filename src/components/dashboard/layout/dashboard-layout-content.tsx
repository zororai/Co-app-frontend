'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import { useSidebar } from '@/contexts/sidebar-context';
import { MainNav } from './main-nav';

interface DashboardLayoutContentProps {
  children: React.ReactNode;
}

export function DashboardLayoutContent({ children }: DashboardLayoutContentProps): React.JSX.Element {
  const { isCollapsed } = useSidebar();
  
  return (
    <Box sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column', pl: { lg: isCollapsed ? 'var(--SideNav-width-collapsed)' : 'var(--SideNav-width)' }, transition: 'padding-left 0.3s ease' }}>
      <MainNav />
      <main>
        <Box sx={{ py: '24px', px: '32px' }}>
          {children}
        </Box>
      </main>
    </Box>
  );
}
