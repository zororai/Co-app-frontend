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
import TextField from '@mui/material/TextField';
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

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
    >
      <DialogTitle sx={{ 
        fontSize: '1.25rem', 
        fontWeight: 600,
        borderBottom: '1px solid #e0e0e0',
        pb: 2
      }}>
        Tax Details
      </DialogTitle>
      <DialogContent sx={{ py: 3 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={40} />
          </Box>
        )}

        {!loading && error && (
          <Box sx={{ textAlign: 'center', color: 'error.main', py: 4 }}>
            <Typography>{error}</Typography>
          </Box>
        )}

        {!loading && !error && userDetails && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
              <DetailItem label="Name" value={userDetails.name || 'N/A'} />
              <DetailItem label="Surname" value={userDetails.surname || 'N/A'} />
              <DetailItem label="Email" value={userDetails.email || 'N/A'} />
              <DetailItem label="Phone" value={userDetails.cellNumber || 'N/A'} />
              <DetailItem label="ID Number" value={userDetails.idNumber || 'N/A'} />
              <DetailItem label="Address" value={userDetails.address || 'N/A'} />
              <DetailItem label="Position" value={userDetails.position || 'N/A'} />
              <DetailItem label="Role" value={userDetails.role || 'N/A'} />
              <DetailItem label="Status" value={userDetails.status || 'N/A'} />
            </Box>
            
            {userDetails.notes && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Notes</Typography>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: '#f5f5f5', 
                  borderRadius: 1,
                  whiteSpace: 'pre-wrap'
                }}>
                  <Typography variant="body2">{userDetails.notes}</Typography>
                </Box>
              </Box>
            )}
          </Box>
        )}
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
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            onClick={onClose} 
            variant="outlined"
            disabled={actionLoading}
          >
            Close
          </Button>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              onClick={() => showReasonFieldFor('pushback')}
              variant="contained"
              color="warning"
              disabled={actionLoading || loading || !!error || !userDetails}
              sx={{ bgcolor: '#ed6c02', '&:hover': { bgcolor: '#e65100' } }}
            >
              Push Back
            </Button>
            <Button 
              onClick={() => showReasonFieldFor('reject')}
              variant="contained"
              color="error"
              disabled={actionLoading || loading || !!error || !userDetails}
              sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}
            >
              Reject
            </Button>
            <Button 
              onClick={handleApprove}
              variant="contained"
              color="success"
              disabled={actionLoading || loading || !!error || !userDetails}
              sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}
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
