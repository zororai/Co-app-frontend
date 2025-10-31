"use client";

import * as React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { GuiltyAdmissionForm } from '@/components/dashboard/guilty/guilty-admission-form';

export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
        <Typography variant="h4">Admission of Guilt</Typography>
        <Typography variant="body2" color="text.secondary">
          In terms of Section 392 of the Mines and Minerals Act Chapter 21:05 and the Explosive 5 Act Chapter 10:07 (as amended)
        </Typography>
      </Stack>

      <GuiltyAdmissionForm />
    </Stack>
  );
}
