'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import UpdateIcon from '@mui/icons-material/Update';
import SendIcon from '@mui/icons-material/Send';

import { Notifications } from '@/components/dashboard/settings/notifications';
import { UpdatePasswordForm } from '@/components/dashboard/settings/update-password-form';

export function SettingsLayout(): React.JSX.Element {
  const [selected, setSelected] = React.useState<'shaftFee' | 'password' | 'notifications'>('shaftFee');
  const [regFee, setRegFee] = React.useState<string>('');
  const [medicalFee, setMedicalFee] = React.useState<string>('');

  const handleDelete = () => {
    setRegFee('');
    setMedicalFee('');
    // TODO: integrate delete API if needed
    // console.log('Delete clicked');
  };

  const handleUpdate = () => {
    // TODO: integrate update API
    // console.log('Update with', { regFee, medicalFee });
  };

  const handleSubmit = () => {
    // TODO: integrate submit API
    // console.log('Submit with', { regFee, medicalFee });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
      {/* Left: Sidebar */}
      <Paper
        sx={{
          width: { xs: '100%', md: 280 },
          flexShrink: 0,
          p: 0,
          bgcolor: '#d9d9d9',
          overflow: 'hidden',
        }}
      >
        {/* Header bar matching add-user-dialog.tsx */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, rgb(5, 5, 68) 0%, rgb(5, 5, 68) 100%)',
            color: 'white',
            px: 2,
            py: 1.25,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: '0.02em' }}>
            Menu
          </Typography>
        </Box>
        <Divider />
        <Box sx={{ p: 2 }}>
          <List dense>
            <ListItemButton selected={selected === 'shaftFee'} onClick={() => setSelected('shaftFee')}>
              <ListItemText primary="Shaft assignment fee" />
            </ListItemButton>
            <ListItemButton selected={selected === 'password'} onClick={() => setSelected('password')}>
              <ListItemText primary="Password" />
            </ListItemButton>
            <ListItemButton selected={selected === 'notifications'} onClick={() => setSelected('notifications')}>
              <ListItemText primary="Notifications" />
            </ListItemButton>
          </List>
        </Box>
      </Paper>

      {/* Middle: Content */}
      <Paper sx={{ flexGrow: 1, p: 2, bgcolor: '#d9d9d9' }}>
        {selected === 'shaftFee' && (
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ textAlign: 'center', fontWeight: 600 }}>
              Shaft assignment fee
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="regFee"
                type="number"
                value={regFee}
                onChange={(e) => setRegFee(e.target.value)}
              />
              <TextField
                fullWidth
                label="medicalFee"
                type="number"
                value={medicalFee}
                onChange={(e) => setMedicalFee(e.target.value)}
              />
            </Stack>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button variant="outlined" color="error" startIcon={<DeleteOutlineIcon />} onClick={handleDelete}>
                Delete
              </Button>
              <Button variant="outlined" startIcon={<UpdateIcon />} onClick={handleUpdate}>
                Update
              </Button>
              <Button variant="contained" startIcon={<SendIcon />} onClick={handleSubmit}>
                Submit
              </Button>
            </Stack>
          </Stack>
        )}

        {selected === 'password' && (
          <Stack spacing={3}>
            <Typography variant="subtitle2" sx={{ textAlign: 'center', fontWeight: 600 }}>
              Password
            </Typography>
            <UpdatePasswordForm />
          </Stack>
        )}

        {selected === 'notifications' && (
          <Stack spacing={3}>
            <Typography variant="subtitle2" sx={{ textAlign: 'center', fontWeight: 600 }}>
              Notifications
            </Typography>
            <Notifications />
          </Stack>
        )}
      </Paper>
    </Box>
  );
}
