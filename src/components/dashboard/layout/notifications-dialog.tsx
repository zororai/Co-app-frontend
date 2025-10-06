'use client';

import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  Stack,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { authClient } from '@/lib/auth/client';

interface Notification {
  id: string;
  title: string;
  type: string | null;
  message?: string;
  createdAt?: string;
}

interface NotificationsDialogProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationsDialog({ open, onClose }: NotificationsDialogProps): React.JSX.Element {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [detailsLoading, setDetailsLoading] = React.useState(false);

  // Fetch all notifications when dialog opens
  React.useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authClient.fetchNotifications();
      if (response.success && response.data) {
        setNotifications(response.data);
      } else {
        setError(response.error || 'Failed to load notifications');
      }
    } catch (err) {
      setError('An error occurred while loading notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    setDetailsLoading(true);
    setError(null);
    try {
      const response = await authClient.fetchNotificationById(notification.id);
      if (response.success && response.data) {
        setSelectedNotification(response.data);
      } else {
        setError(response.error || 'Failed to load notification details');
      }
    } catch (err) {
      setError('An error occurred while loading notification details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedNotification(null);
  };

  const getTypeColor = (type: string | null): 'error' | 'warning' | 'info' | 'default' => {
    if (!type) return 'default';
    if (type.toLowerCase().includes('emergency') || type.toLowerCase().includes('alert')) return 'error';
    if (type.toLowerCase().includes('safety') || type.toLowerCase().includes('reminder')) return 'warning';
    return 'info';
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '400px' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {selectedNotification ? 'Notification Details' : 'Notifications'}
        <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Loading state */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Notification List */}
        {!loading && !selectedNotification && (
          <>
            {notifications.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No notifications
                </Typography>
              </Box>
            ) : (
              <List sx={{ py: 0 }}>
                {notifications.map((notification, index) => (
                  <React.Fragment key={notification.id}>
                    {index > 0 && <Divider />}
                    <ListItem disablePadding>
                      <ListItemButton onClick={() => handleNotificationClick(notification)}>
                        <ListItemText
                          primary={
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                                {notification.title}
                              </Typography>
                              {notification.type && (
                                <Chip 
                                  label={notification.type} 
                                  size="small" 
                                  color={getTypeColor(notification.type)}
                                />
                              )}
                            </Stack>
                          }
                          secondary={notification.message || 'Click to view details'}
                          secondaryTypographyProps={{
                            noWrap: true,
                            sx: { maxWidth: '100%' }
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            )}
          </>
        )}

        {/* Notification Details */}
        {selectedNotification && (
          <Box>
            {detailsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Title
                    </Typography>
                    <Typography variant="h6">
                      {selectedNotification.title}
                    </Typography>
                  </Box>

                  {selectedNotification.type && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Type
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip 
                          label={selectedNotification.type} 
                          color={getTypeColor(selectedNotification.type)}
                        />
                      </Box>
                    </Box>
                  )}

                  {selectedNotification.message && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Message
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 0.5 }}>
                        {selectedNotification.message}
                      </Typography>
                    </Box>
                  )}

                  {selectedNotification.createdAt && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Created At
                      </Typography>
                      <Typography variant="body2">
                        {new Date(selectedNotification.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                  )}

                  {/* Display any additional fields */}
                  {Object.entries(selectedNotification).map(([key, value]) => {
                    if (['id', 'title', 'type', 'message', 'createdAt'].includes(key)) return null;
                    return (
                      <Box key={key}>
                        <Typography variant="caption" color="text.secondary">
                          {key}
                        </Typography>
                        <Typography variant="body2">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </Typography>
                      </Box>
                    );
                  })}
                </Stack>

                <Box sx={{ mt: 3 }}>
                  <Button 
                    variant="contained" 
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBack}
                    sx={{
                      bgcolor: '#1e3a8a',
                      color: '#fff',
                      '&:hover': { 
                        bgcolor: '#1e40af' 
                      }
                    }}
                  >
                    Back to notifications
                  </Button>
                </Box>
              </>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
