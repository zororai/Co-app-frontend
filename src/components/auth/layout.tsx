import * as React from 'react';
import RouterLink from 'next/link';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';

import { paths } from '@/paths';
import { DynamicLogo } from '@/components/core/logo';

export interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 1, md: 4 } }}>
      <Paper elevation={4} sx={{ width: '100%', maxWidth: { xs: '100%', md: 1080 }, borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, minHeight: { xs: 'auto', lg: 420 }, position: 'relative' }}>
          {/* Left - Dark welcome panel */}
          <Box sx={{ display: { xs: 'none', lg: 'flex' }, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', p: { xs: 3, md: 4 }, bgcolor: '#0B1220', color: 'common.white' }}>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ opacity: 0.85, fontSize: '0.75rem' }}>Welcome to</Typography>
              <Typography variant="h6" sx={{ mt: 0.5, fontWeight: 700, fontSize: '1.25rem' }}>Co-app</Typography>
              <Typography variant="caption" sx={{ mt: 1.5, opacity: 0.7, display: 'block', fontSize: '0.75rem' }}>Powered By Commstack</Typography>
            </Box>
               
               <Box
                  component="img"
                  src="/assets/Logo.png"
                  alt="Logo"
                  height={120}
                  width={120}
                />
          </Box>

          {/* Right - White panel with logos and form */}
          <Box sx={{ display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', justifyContent: 'center', alignItems: 'center', minHeight: { xs: 'auto', lg: 'auto' } }}>
            
            {/* Mobile logo and welcome text */}
            <Box sx={{ display: { xs: 'flex', lg: 'none' }, flexDirection: 'column', alignItems: 'center', textAlign: 'center', mb: 2, p: 3, bgcolor: '#0B1220', color: 'common.white', width: '100%' }}>
              <Box
                component="img"
                src="/assets/Logo.png"
                alt="Logo"
                height={100}
                width={100}
              />
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" sx={{ opacity: 0.85, fontSize: '0.75rem' }}>Welcome to</Typography>
                <Typography variant="h6" sx={{ mt: 0.25, fontWeight: 700, fontSize: '1.1rem' }}>Co-app</Typography>
              </Box>
            </Box>
            
            {/* Form area */}
            <Box sx={{ flex: '1 1 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 2, md: 4 }, width: '100%' }}>
              <Box sx={{ width: '100%', maxWidth: 420 }}>
                {children}
              </Box>
            </Box>
          </Box>

          {/* Middle divider (decorative) */}
          <Box sx={{ display: { xs: 'none', lg: 'block' }, position: 'absolute', left: '50%', top: 24, bottom: 24, width: '2px', bgcolor: 'divider', boxShadow: 'inset 0 0 1px rgba(0,0,0,0.12)' }} />
        </Box>
      </Paper>
      <Typography variant="caption" sx={{ position: 'fixed', right: 16, bottom: 12, color: 'text.secondary' }}>1.0.6</Typography>
    </Box>
  );
}