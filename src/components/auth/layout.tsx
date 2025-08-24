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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 2, md: 4 } }}>
      <Paper elevation={4} sx={{ width: '100%', maxWidth: 1080, borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, minHeight: { xs: 'auto', lg: 560 }, position: 'relative' }}>
          {/* Left - Dark welcome panel */}
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', p: { xs: 4, md: 6 }, bgcolor: '#0B1220', color: 'common.white' }}>
         
               <Box
                  component="img"
                  src="/assets/Logo.png"
                  alt="Logo"
                  height={150}
                  width={150}
                />
            
            
            <Box >
              <Typography variant="subtitle2" sx={{ opacity: 0.85 }}>Welcome to</Typography>
              <Typography variant="h4" sx={{ mt: 1, fontWeight: 700 }}>Co-app</Typography>
              <Typography variant="body2" sx={{ mt: 3, opacity: 0.7 }}>Powered By Commstack</Typography>
            </Box>
          </Box>

          {/* Right - White panel with logos and form */}
          <Box sx={{ display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
            {/* Logos header */}
          
          
            {/* Form area */}
            <Box sx={{ flex: '1 1 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 3, md: 4 } }}>
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