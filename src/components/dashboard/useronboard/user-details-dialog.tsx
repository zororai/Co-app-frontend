'use client';

import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import { authClient } from '@/lib/auth/client';

interface UserDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string | null;
  onRefresh?: () => void; // Optional callback to refresh data after action
}

export function UserDetailsDialog({ open, onClose, userId, onRefresh }: UserDetailsDialogProps): React.JSX.Element {
  const [userDetails, setUserDetails] = React.useState<any>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');
  const [actionLoading, setActionLoading] = React.useState<boolean>(false);
  const [actionError, setActionError] = React.useState<string>('');
  const [actionSuccess, setActionSuccess] = React.useState<string>('');
  const [reason, setReason] = React.useState<string>('');
  const [showReasonField, setShowReasonField] = React.useState<boolean>(false);
  const [actionType, setActionType] = React.useState<'reject' | 'pushback' | null>(null);

  // Reset action states when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setActionError('');
      setActionSuccess('');
      setReason('');
      setShowReasonField(false);
      setActionType(null);
    }
  }, [open]);

  React.useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId) return;
      
      setLoading(true);
      setError('');
      try {
        const details = await authClient.fetchUserById(userId);
        setUserDetails(details);
      } catch (err) {
        console.error('Error fetching user details:', err);
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
    }
  }, [open, userId]);
  
  // Handle approve action
  const handleApprove = async () => {
    if (!userId) return;
    
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');
    
    try {
      const result = await authClient.approveUser(userId);
      if (result.success) {
        setActionSuccess('User approved successfully');
        // Refresh user details
        const updatedDetails = await authClient.fetchUserById(userId);
        setUserDetails(updatedDetails);
        // Call parent refresh if provided
        if (onRefresh) onRefresh();
      } else {
        setActionError(result.error || 'Failed to approve user');
      }
    } catch (err) {
      console.error('Error approving user:', err);
      setActionError('An unexpected error occurred');
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle reject action
  const handleReject = async () => {
    if (!userId || !reason.trim()) {
      setActionError('Please provide a reason for rejection');
      return;
    }
    
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');
    
    try {
      const result = await authClient.rejectUser(userId, reason);
      if (result.success) {
        setActionSuccess('User rejected successfully');
        setShowReasonField(false);
        setReason('');
        setActionType(null);
        // Refresh user details
        const updatedDetails = await authClient.fetchUserById(userId);
        setUserDetails(updatedDetails);
        // Call parent refresh if provided
        if (onRefresh) onRefresh();
      } else {
        setActionError(result.error || 'Failed to reject user');
      }
    } catch (err) {
      console.error('Error rejecting user:', err);
      setActionError('An unexpected error occurred');
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle push back action
  const handlePushBack = async () => {
    if (!userId || !reason.trim()) {
      setActionError('Please provide a reason for pushing back');
      return;
    }
    
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');
    
    try {
      const result = await authClient.pushbackUser(userId, reason);
      if (result.success) {
        setActionSuccess('User pushed back successfully');
        setShowReasonField(false);
        setReason('');
        setActionType(null);
        // Refresh user details
        const updatedDetails = await authClient.fetchUserById(userId);
        setUserDetails(updatedDetails);
        // Call parent refresh if provided
        if (onRefresh) onRefresh();
      } else {
        setActionError(result.error || 'Failed to push back user');
      }
    } catch (err) {
      console.error('Error pushing back user:', err);
      setActionError('An unexpected error occurred');
    } finally {
      setActionLoading(false);
    }
  };
  
  // Show reason field for reject or push back
  const showReasonFieldFor = (type: 'reject' | 'pushback') => {
    setShowReasonField(true);
    setActionType(type);
    setActionError('');
    setActionSuccess('');
  };
  
  // Cancel action
  const cancelAction = () => {
    setShowReasonField(false);
    setReason('');
    setActionType(null);
    setActionError('');
  };

  // Don't render the dialog content if it's not open
  if (!open) {
    return <Dialog open={false} onClose={onClose} maxWidth="md" fullWidth />;
  }
  
  // If the dialog is open but there's no user data, show a loading state
  if (!userDetails && loading) {
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
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>Loading user details...</Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
      </Dialog>
    );
  }

  // Show error state
  if (!userDetails && error) {
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
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2, textAlign: 'center', color: 'error.main' }}>
          <Typography>{error}</Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
      </Dialog>
    );
  }

  // Now we can safely access user details
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
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2 }}>
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
                <Typography><strong>Name:</strong> {userDetails?.name || 'N/A'}</Typography>
                <Typography><strong>Surname:</strong> {userDetails?.surname || 'N/A'}</Typography>
                <Typography><strong>ID Number:</strong> {userDetails?.idNumber || 'N/A'}</Typography>
                <Typography><strong>Status:</strong> 
                  <Box 
                    component="span" 
                    sx={{
                      display: 'inline-block',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      ml: 1,
                      bgcolor: userDetails?.status === 'APPROVED' ? '#C8E6C9' : 
                               userDetails?.status === 'REJECTED' ? '#FFCDD2' : 
                               userDetails?.status === 'PENDING' ? '#FFF9C4' : 
                               userDetails?.status === 'PUSHED_BACK' ? '#FFE0B2' : '#C8E6C9',
                      color: userDetails?.status === 'APPROVED' ? '#1B5E20' : 
                             userDetails?.status === 'REJECTED' ? '#B71C1C' : 
                             userDetails?.status === 'PENDING' ? '#F57F17' : 
                             userDetails?.status === 'PUSHED_BACK' ? '#E65100' : '#1B5E20',
                    }}
                  >
                    {userDetails?.status || 'PENDING'}
                  </Box>
                </Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Contact Information
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography><strong>Email:</strong> {userDetails?.email || 'N/A'}</Typography>
                <Typography><strong>Phone:</strong> {userDetails?.cellNumber || 'N/A'}</Typography>
                <Typography><strong>Address:</strong> {userDetails?.address || 'N/A'}</Typography>
              </Box>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Professional Information
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography><strong>Position:</strong> {userDetails?.position || 'N/A'}</Typography>
                <Typography><strong>Role:</strong> {userDetails?.role || 'N/A'}</Typography>
              </Box>
            </Box>
            
            {userDetails?.reason && (
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Additional Information
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography><strong>Reason:</strong> {userDetails.reason}</Typography>
                </Box>
              </Box>
            )}
            
            {userDetails?.notes && (
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Notes
                </Typography>
                <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography>{userDetails.notes}</Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      
      {/* Action feedback messages */}
      {(actionError || actionSuccess) && (
        <Box sx={{ px: 3, pb: 2 }}>
          {actionError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {actionError}
            </Alert>
          )}
          {actionSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {actionSuccess}
            </Alert>
          )}
        </Box>
      )}
      
      {/* Reason input field for reject/pushback */}
      {showReasonField && (
        <Box sx={{ px: 3, pb: 2 }}>
          <TextField
            label="Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            fullWidth
            multiline
            rows={3}
            required
            error={actionType !== null && reason.trim() === ''}
            helperText={actionType !== null && reason.trim() === '' ? `Please provide a reason for ${actionType === 'reject' ? 'rejection' : 'pushing back'}` : ''}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button 
              onClick={cancelAction}
              variant="outlined"
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={actionType === 'reject' ? handleReject : handlePushBack}
              variant="contained"
              color="primary"
              disabled={actionLoading || reason.trim() === ''}
              sx={{ bgcolor: actionType === 'reject' ? '#d32f2f' : '#ed6c02', '&:hover': { bgcolor: actionType === 'reject' ? '#b71c1c' : '#e65100' } }}
            >
              {actionLoading ? 'Processing...' : actionType === 'reject' ? 'Confirm Reject' : 'Confirm Push Back'}
            </Button>
          </Box>
        </Box>
      )}
      
      {/* Action buttons */}
      {!showReasonField && (
        <DialogActions>
          <Button onClick={onClose}>
            Close
          </Button>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              onClick={() => showReasonFieldFor('pushback')}
              variant="contained"
              color="warning"
              disabled={actionLoading || loading || !!error || !userDetails}
            >
              Push Back
            </Button>
            <Button 
              onClick={() => showReasonFieldFor('reject')}
              variant="contained"
              color="error"
              disabled={actionLoading || loading || !!error || !userDetails}
            >
              Reject
            </Button>
            <Button 
              onClick={handleApprove}
              variant="contained"
              color="success"
              disabled={actionLoading || loading || !!error || !userDetails}
            >
              {actionLoading ? 'Processing...' : 'Approve'}
            </Button>
          </Box>
        </DialogActions>
      )}
    </Dialog>
  );
}

// Helper component for displaying detail items
function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#666' }}>{label}</Typography>
      <Typography variant="body1">{value}</Typography>
    </Box>
  );
}
