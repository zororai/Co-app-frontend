import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { config } from '@/config';
import { UtilitiesContent } from '@/components/dashboard/utilities/utilities-content';

export const metadata: Metadata = { title: `Utilities | Dashboard | ${config.site.name}` };

export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">Utilities</Typography>
        <Typography color="text.secondary" variant="body1" sx={{ mt: 1 }}>
          Initialize and manage system data
        </Typography>
      </div>
      <UtilitiesContent />
    </Stack>
  );
}
