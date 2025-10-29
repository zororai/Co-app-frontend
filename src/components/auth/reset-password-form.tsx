'use client';

import * as React from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { useTheme } from '@mui/material/styles';

import { authClient } from '@/lib/auth/client';

const schema = zod.object({ email: zod.string().min(1, { message: 'Email is required' }).email() });

type Values = zod.infer<typeof schema>;

const defaultValues = { email: '' } satisfies Values;

export function ResetPasswordForm(): React.JSX.Element {
  const theme = useTheme();
  const [isPending, setIsPending] = React.useState<boolean>(false);

  const {
    control,
    formState: { errors },
    handleSubmit,
    setError,
  } = useForm<Values>({
    defaultValues,
    mode: 'onBlur',
    resolver: async (data) => {
      try {
        schema.parse(data);
        return { values: data, errors: {} };
      } catch (error) {
        if (error instanceof zod.ZodError) {
          const fieldErrors = error.flatten().fieldErrors;
          return { values: {}, errors: fieldErrors };
        }
        return { values: {}, errors: {} };
      }
    },
  });



  return (
    <Stack spacing={4}>
      <Typography variant="h5">Reset password</Typography>
      <form >
        <Stack spacing={2}>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormControl error={Boolean(errors.email)}>
                <InputLabel>Email address</InputLabel>
                <OutlinedInput {...field} label="Email address" type="email" />
                {errors.email ? <FormHelperText>{errors.email.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
          <Button 
            disabled={isPending} 
            type="submit" 
            variant="contained"
            sx={{
              bgcolor: theme.palette.secondary.main,
              color: '#fff',
              '&:hover': {
                bgcolor: theme.palette.secondary.dark
              },
              '&.Mui-disabled': {
                bgcolor: 'rgba(0, 0, 0, 0.12)',
                color: 'rgba(0, 0, 0, 0.26)'
              }
            }}
          >
            {isPending ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              'Send recovery link'
            )}
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}
