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
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';

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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <Card>
              <CardHeader subheader="Configure fees" title="Shaft assignment fee" />
              <Divider />
              <CardContent>
                <Stack spacing={3} sx={{ maxWidth: 'sm' }}>
                  <FormControl fullWidth>
                    <InputLabel>regFee</InputLabel>
                    <OutlinedInput
                      label="regFee"
                      name="regFee"
                      type="number"
                      value={regFee}
                      onChange={(e) => setRegFee(e.target.value)}
                      inputProps={{ min: 0 }}
                    />
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>medicalFee</InputLabel>
                    <OutlinedInput
                      label="medicalFee"
                      name="medicalFee"
                      type="number"
                      value={medicalFee}
                      onChange={(e) => setMedicalFee(e.target.value)}
                      inputProps={{ min: 0 }}
                    />
                  </FormControl>
                </Stack>
              </CardContent>
              <Divider />
              <CardActions sx={{ justifyContent: 'flex-end', gap: 1 }}>
                <Button
                  type="button"
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={handleDelete}
                >
                  Delete
                </Button>
                <Button type="button" variant="outlined" startIcon={<UpdateIcon />} onClick={handleUpdate}>
                  Update
                </Button>
                <Button type="submit" variant="contained" startIcon={<SendIcon />}>
                  Submit
                </Button>
              </CardActions>
            </Card>
          </form>
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
