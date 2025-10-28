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
import Skeleton from '@mui/material/Skeleton';
import { authClient } from '@/lib/auth/client';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import { printElementById } from '@/lib/print';
import { useTheme } from '@mui/material/styles';

interface UserDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string | null;
  onRefresh?: () => void; // Optional callback to refresh data after action
}

export function UserDetailsDialog({ open, onClose, userId, onRefresh }: UserDetailsDialogProps): React.JSX.Element {
  const theme = useTheme();
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
        const details = await authClient.fetchTaxDetails(userId);
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
        const updatedDetails = await authClient.fetchTaxDetails(userId);
        setUserDetails(updatedDetails);
        // Call parent refresh if provided
        if (onRefresh) onRefresh();
      } else {
        setActionError(result.error || 'Failed to approve user');
      }
    } catch (error_) {
      console.error('Error approving user:', error_);
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
    } catch (error_) {
      console.error('Error rejecting user:', error_);
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
    } catch (error_) {
      console.error('Error pushing back user:', error_);
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
      <DialogTitle 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 2.5,
          bgcolor: theme.palette.secondary.main,
          color: 'white'
        }}
      >
        <Typography variant="h6" component="span" sx={{ color: 'white', fontWeight: 600 }}>
          Tax Details
        </Typography>
        <Box sx={{ display: 'flex' }}>
          <IconButton 
            onClick={() => printElementById('taxonboarding-details-printable')} 
            size="small" 
            sx={{ 
              mr: 1, 
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            <PrintIcon />
          </IconButton>
          <IconButton 
            onClick={onClose} 
            size="small" 
            sx={{ 
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Box id="taxonboarding-details-printable">
        {loading && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
              gap: 2.5 
            }}>
              <Box sx={{ 
                border: `2px solid ${theme.palette.secondary.main}`, 
                borderRadius: '12px', 
                p: 2.5,
                bgcolor: '#ffffff'
              }}>
                <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
                <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1.5 }} />
                <Skeleton variant="text" width="90%" height={24} sx={{ mb: 1.5 }} />
                <Skeleton variant="text" width="85%" height={24} sx={{ mb: 1.5 }} />
                <Skeleton variant="rectangular" width="30%" height={28} />
              </Box>
            </Box>
          </Box>
        )}

        {!loading && error && (
          <Box sx={{ textAlign: 'center', color: 'error.main', py: 4 }}>
            <Typography>{error}</Typography>
          </Box>
        )}

        {!loading && !error && userDetails && (
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
            gap: 2.5 
          }}>
            <Box sx={{ 
              gridColumn: { xs: '1', md: 'span 2' },
              border: `2px solid ${theme.palette.secondary.main}`, 
              borderRadius: '12px', 
              p: 2.5,
              bgcolor: '#ffffff'
            }}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: theme.palette.secondary.main, 
                  fontWeight: 700, 
                  mb: 2,
                  fontSize: '1rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Tax Information
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 2 }}>
                <Box>
                  <Typography sx={{ mb: 0.5, fontSize: '0.95rem' }}><strong>Tax Type:</strong></Typography>
                  <Typography sx={{ fontSize: '0.95rem', color: 'text.secondary' }}>{userDetails.taxType || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ mb: 0.5, fontSize: '0.95rem' }}><strong>Tax Rate:</strong></Typography>
                  <Typography sx={{ fontSize: '0.95rem', color: 'text.secondary' }}>
                    {userDetails.taxRate ? `${userDetails.taxRate}%` : 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ mb: 0.5, fontSize: '0.95rem' }}><strong>Location:</strong></Typography>
                  <Typography sx={{ fontSize: '0.95rem', color: 'text.secondary' }}>{userDetails.location || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ mb: 0.5, fontSize: '0.95rem' }}><strong>Status:</strong></Typography>
                  <Box 
                    component="span" 
                    sx={{
                      display: 'inline-block',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: userDetails.status === 'APPROVED' ? '#C8E6C9' : 
                               userDetails.status === 'REJECTED' ? '#FFCDD2' : 
                               userDetails.status === 'PENDING' ? '#FFF9C4' : 
                               userDetails.status === 'PUSHED_BACK' ? '#FFE0B2' : '#C8E6C9',
                      color: userDetails.status === 'APPROVED' ? '#1B5E20' : 
                             userDetails.status === 'REJECTED' ? '#B71C1C' : 
                             userDetails.status === 'PENDING' ? '#F57F17' : 
                             userDetails.status === 'PUSHED_BACK' ? '#E65100' : '#1B5E20',
                      fontWeight: 'medium',
                      fontSize: '0.875rem'
                    }}
                  >
                    {userDetails.status || 'PENDING'}
                  </Box>
                </Box>
                <Box sx={{ gridColumn: { xs: '1', sm: 'span 2' } }}>
                  <Typography sx={{ mb: 0.5, fontSize: '0.95rem' }}><strong>Description:</strong></Typography>
                  <Typography sx={{ fontSize: '0.95rem', color: 'text.secondary' }}>{userDetails.description || 'N/A'}</Typography>
                </Box>
                {userDetails.reason && (
                  <Box sx={{ gridColumn: { xs: '1', sm: 'span 2' } }}>
                    <Typography sx={{ mb: 0.5, fontSize: '0.95rem' }}><strong>Reason:</strong></Typography>
                    <Typography sx={{ fontSize: '0.95rem', color: 'text.secondary' }}>{userDetails.reason}</Typography>
                  </Box>
                )}
              </Box>
            </Box>
            {userDetails.notes && (
              <Box sx={{ 
                gridColumn: { xs: '1', md: 'span 2' },
                border: `2px solid ${theme.palette.secondary.main}`, 
                borderRadius: '12px', 
                p: 2.5,
                bgcolor: '#ffffff'
              }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    color: theme.palette.secondary.main, 
                    fontWeight: 700, 
                    mb: 2,
                    fontSize: '1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  Notes
                </Typography>
                <Box sx={{ 
                  mt: 2,
                  p: 2, 
                  bgcolor: '#f5f5f5', 
                  borderRadius: 1,
                  whiteSpace: 'pre-wrap'
                }}>
                  <Typography sx={{ fontSize: '0.95rem' }}>{userDetails.notes}</Typography>
                </Box>
              </Box>
            )}
          </Box>
        )}
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
              sx={{
                borderColor: theme.palette.secondary.main,
                color: theme.palette.secondary.main,
                '&:hover': {
                  borderColor: theme.palette.secondary.dark,
                  bgcolor: 'rgba(50, 56, 62, 0.04)'
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={actionType === 'reject' ? handleReject : handlePushBack}
              variant="contained"
              disabled={actionLoading || reason.trim() === ''}
              sx={{ 
                bgcolor: theme.palette.secondary.main, 
                '&:hover': { bgcolor: theme.palette.secondary.dark }
              }}
            >
              {actionLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : actionType === 'reject' ? 'Confirm Reject' : 'Confirm Push Back'}
            </Button>
          </Box>
        </Box>
      )}
      
      {/* Action buttons */}
      
    </Dialog>
  );
}
