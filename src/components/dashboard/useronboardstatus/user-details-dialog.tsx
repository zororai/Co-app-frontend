'use client';

import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import TextField from '@mui/material/TextField';
import { authClient } from '@/lib/auth/client';

interface UserDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string | null;
}

export function UserDetailsDialog({ open, onClose, userId }: UserDetailsDialogProps): React.JSX.Element {
  const [userDetails, setUserDetails] = React.useState<any>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');
  const [status, setStatus] = React.useState<string>('');
  const [reason, setReason] = React.useState<string>('');
  const [showReasonField, setShowReasonField] = React.useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  React.useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId) return;
      
      setLoading(true);
      setError('');
      try {
        const details = await authClient.fetchUserById(userId);
        setUserDetails(details);
      } catch (error_) {
        console.error('Error fetching user details:', error_);
        setError('Failed to load user details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (open && userId) {
      fetchUserDetails();
    } else {
      // Reset state when dialog closes
      setUserDetails(null);
      setError('');
      setStatus('');
      setReason('');
      setShowReasonField(false);
    }
  }, [open, userId]);

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setShowReasonField(newStatus === 'REJECTED' || newStatus === 'PUSHED_BACK');
  };

  const handleSubmit = async (): Promise<void> => {
    if (!status || !userId) return;

    setIsSubmitting(true);
    try {
      switch (status) {
        case 'APPROVED': {
          const res = await authClient.approveUser(userId);
          if (!res?.success) throw new Error(res?.error || 'Failed to approve user');
          break;
        }
        case 'REJECTED': {
          if (!reason) {
            alert('Please provide a reason for rejection');
            setIsSubmitting(false);
            return;
          }
          const res = await authClient.rejectUser(userId, reason);
          if (!res?.success) throw new Error(res?.error || 'Failed to reject user');
          break;
        }
        case 'PUSHED_BACK': {
          if (!reason) {
            alert('Please provide a reason for pushing back');
            setIsSubmitting(false);
            return;
          }
          const res = await authClient.pushbackUser(userId, reason);
          if (!res?.success) throw new Error(res?.error || 'Failed to push back user');
          break;
        }
        default: {
          throw new Error(`Unsupported status: ${status}`);
        }
      }

      // Optimistically update local state
      setUserDetails((prev: any) => prev ? { ...prev, status, reason: showReasonField ? reason : prev.reason } : prev);
      // Reset selection
      setStatus('');
      setReason('');
      setShowReasonField(false);
    } catch (error_) {
      console.error(`Error updating status to ${status}:`, error_);
      alert(`Failed to update status to ${status}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 2
        }}
      >
        <Typography variant="subtitle1" component="span">User Details</Typography>
        <IconButton onClick={onClose} size="small" aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2 }}>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
              <CircularProgress />
              <Typography variant="body1" sx={{ ml: 2 }}>Loading user details...</Typography>
            </Box>
          )}

          {!loading && error && (
            <Box sx={{ textAlign: 'center', color: 'error.main', py: 4 }}>
              <Typography>{error}</Typography>
            </Box>
          )}

          {!loading && !error && userDetails && (
            <Box>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
                gap: 2 
              }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Personal Information
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography><strong>Name:</strong> {userDetails.name || 'N/A'}</Typography>
                    <Typography><strong>Surname:</strong> {userDetails.surname || 'N/A'}</Typography>
                    <Typography><strong>ID Number:</strong> {userDetails.idNumber || 'N/A'}</Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Contact Information
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography><strong>Email:</strong> {userDetails.email || 'N/A'}</Typography>
                    <Typography><strong>Phone:</strong> {userDetails.cellNumber || 'N/A'}</Typography>
                    <Typography><strong>Address:</strong> {userDetails.address || 'N/A'}</Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Role Information
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography><strong>Position:</strong> {userDetails.position || 'N/A'}</Typography>
                    <Typography><strong>Role:</strong> {userDetails.role || 'N/A'}</Typography>
                    <Typography><strong>Status:</strong>
                      <Box 
                        component="span" 
                        sx={{
                          display: 'inline-block',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          ml: 1,
                          bgcolor: userDetails.status === 'APPROVED' ? '#C8E6C9' : 
                                   userDetails.status === 'REJECTED' ? '#FFCDD2' : 
                                   userDetails.status === 'PENDING' ? '#FFF9C4' : 
                                   userDetails.status === 'PUSHED_BACK' ? '#FFE0B2' : '#C8E6C9',
                          color: userDetails.status === 'APPROVED' ? '#1B5E20' : 
                                 userDetails.status === 'REJECTED' ? '#B71C1C' : 
                                 userDetails.status === 'PENDING' ? '#F57F17' : 
                                 userDetails.status === 'PUSHED_BACK' ? '#E65100' : '#1B5E20',
                        }}
                      >
                        {userDetails.status || 'PENDING'}
                      </Box>
                    </Typography>
                  </Box>
                </Box>

                {userDetails.notes && (
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      Notes
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, whiteSpace: 'pre-wrap' }}>
                        <Typography variant="body2">{userDetails.notes}</Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, flexDirection: 'column', alignItems: 'stretch' }}>
        {showReasonField && (
          <TextField
            label="Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            rows={3}
            sx={{ mb: 2 }}
            required
            error={showReasonField && !reason}
            helperText={showReasonField && !reason ? 'Reason is required' : ''}
            disabled={isSubmitting}
          />
        )}

        {userDetails && userDetails.status !== 'REJECTED' && userDetails.status !== 'APPROVED' && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button 
              onClick={() => handleStatusChange('APPROVED')}
              variant={status === 'APPROVED' ? 'contained' : 'outlined'}
              color="success"
              disabled={isSubmitting}
              sx={{ minWidth: '120px' }}
            >
              Approve
            </Button>
            <Button 
              onClick={() => handleStatusChange('PUSHED_BACK')}
              variant={status === 'PUSHED_BACK' ? 'contained' : 'outlined'}
              color="warning"
              disabled={isSubmitting}
              sx={{ minWidth: '120px' }}
            >
              Push Back
            </Button>
            <Button 
              onClick={() => handleStatusChange('REJECTED')}
              variant={status === 'REJECTED' ? 'contained' : 'outlined'}
              color="error"
              disabled={isSubmitting}
              sx={{ minWidth: '120px' }}
            >
              Reject
            </Button>
          </Box>
        )}

        {status && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button 
              onClick={handleSubmit}
              variant="contained"
              color="primary"
              disabled={isSubmitting || (showReasonField && !reason)}
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
              sx={{ 
                minWidth: '200px',
                bgcolor: '#5f4bfa',
                '&:hover': { bgcolor: '#4d3fd6' }
              }}
            >
              {isSubmitting ? 'Submitting...' : `Submit ${status.toLowerCase()} status`}
            </Button>
          </Box>
        )}
      </DialogActions>
    </Dialog>
  );
}

//
