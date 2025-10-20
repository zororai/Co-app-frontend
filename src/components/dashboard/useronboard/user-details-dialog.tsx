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
import PrintIcon from '@mui/icons-material/Print';
import Skeleton from '@mui/material/Skeleton';
import { useTheme } from '@mui/material/styles';
import { authClient } from '@/lib/auth/client';
import { printElementById } from '@/lib/print';

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
        const result = await authClient.fetchUserById(userId);
        if (result.success && result.data) {
          console.log('Fetched user details:', result.data);
          setUserDetails(result.data);
        } else {
          setError(result.error || 'Failed to load user details');
        }
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
        const updatedResult = await authClient.fetchUserById(userId);
        if (updatedResult.success && updatedResult.data) {
          setUserDetails(updatedResult.data);
        }
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
        const updatedResult = await authClient.fetchUserById(userId);
        if (updatedResult.success && updatedResult.data) {
          setUserDetails(updatedResult.data);
        }
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
        const updatedResult = await authClient.fetchUserById(userId);
        if (updatedResult.success && updatedResult.data) {
          setUserDetails(updatedResult.data);
        }
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
            p: 2.5,
            bgcolor: theme.palette.secondary.main,
            color: 'white'
          }}
        >
          <Typography variant="h6" component="span" sx={{ color: 'white', fontWeight: 600 }}>User Details</Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 3 }}>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
              gap: 2.5 
            }}>
              {/* Personal Information Skeleton */}
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

              {/* Contact Information Skeleton */}
              <Box sx={{ 
                border: `2px solid ${theme.palette.secondary.main}`, 
                borderRadius: '12px', 
                p: 2.5,
                bgcolor: '#ffffff'
              }}>
                <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
                <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1.5 }} />
                <Skeleton variant="text" width="95%" height={24} sx={{ mb: 1.5 }} />
                <Skeleton variant="text" width="80%" height={24} />
              </Box>

              {/* Professional Information Skeleton */}
              <Box sx={{ 
                gridColumn: '1 / -1', 
                border: `2px solid ${theme.palette.secondary.main}`, 
                borderRadius: '12px', 
                p: 2.5,
                bgcolor: '#ffffff'
              }}>
                <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
                <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1.5 }} />
                <Skeleton variant="text" width="90%" height={24} sx={{ mb: 1.5 }} />
                <Skeleton variant="text" width="85%" height={24} sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Skeleton variant="rounded" width={100} height={28} />
                  <Skeleton variant="rounded" width={120} height={28} />
                  <Skeleton variant="rounded" width={90} height={28} />
                </Box>
              </Box>

              {/* Audit Information Skeleton */}
              <Box sx={{ 
                gridColumn: '1 / -1', 
                border: `2px solid ${theme.palette.secondary.main}`, 
                borderRadius: '12px', 
                p: 2.5,
                bgcolor: '#ffffff'
              }}>
                <Skeleton variant="text" width="50%" height={32} sx={{ mb: 2 }} />
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <Skeleton variant="text" width="90%" height={20} />
                  <Skeleton variant="text" width="85%" height={20} />
                  <Skeleton variant="text" width="88%" height={20} />
                  <Skeleton variant="text" width="92%" height={20} />
                </Box>
              </Box>
            </Box>
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
            p: 2.5,
            bgcolor: theme.palette.secondary.main,
            color: 'white'
          }}
        >
          <Typography variant="h6" component="span" sx={{ color: 'white', fontWeight: 600 }}>User Details</Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
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
          p: 2.5,
          bgcolor: theme.palette.secondary.main,
          color: 'white'
        }}
      >
        <Typography variant="h6" component="span" sx={{ color: 'white', fontWeight: 600 }}>User Details</Typography>
        <Box sx={{ display: 'flex' }}>
          <IconButton 
            onClick={() => printElementById('user-details-printable', 'User Details')} 
            size="small" 
            sx={{ 
              mr: 1, 
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <PrintIcon />
          </IconButton>
          <IconButton 
            onClick={onClose} 
            size="small" 
            sx={{ 
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ p: 3 }} id="user-details-printable">
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
                Personal Information
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography sx={{ mb: 1.5, fontSize: '0.95rem' }}><strong>Name:</strong> {userDetails?.name || 'N/A'}</Typography>
                <Typography sx={{ mb: 1.5, fontSize: '0.95rem' }}><strong>Surname:</strong> {userDetails?.surname || 'N/A'}</Typography>
                <Typography sx={{ mb: 1.5, fontSize: '0.95rem' }}><strong>ID Number:</strong> {userDetails?.idNumber || 'N/A'}</Typography>
                <Typography sx={{ fontSize: '0.95rem' }}><strong>Status:</strong> 
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
            <Box sx={{ 
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
                Contact Information
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography sx={{ mb: 1.5, fontSize: '0.95rem' }}><strong>Email:</strong> {userDetails?.email || 'N/A'}</Typography>
                <Typography sx={{ mb: 1.5, fontSize: '0.95rem' }}><strong>Phone:</strong> {userDetails?.cellNumber || 'N/A'}</Typography>
                <Typography sx={{ fontSize: '0.95rem' }}><strong>Address:</strong> {userDetails?.address || 'N/A'}</Typography>
              </Box>
            </Box>
            
            <Box sx={{ gridColumn: '1 / -1', border: `2px solid ${theme.palette.secondary.main}`, borderRadius: '12px', p: 2.5, mt: 2, bgcolor: '#ffffff' }}>
              <Typography variant="subtitle1" sx={{ 
                color: theme.palette.secondary.main, 
                fontWeight: 700, 
                mb: 2,
                fontSize: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Professional Information
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography sx={{ mb: 1.5, fontSize: '0.95rem' }}><strong>Position:</strong> {userDetails?.position || 'N/A'}</Typography>
                <Typography sx={{ mb: 1.5, fontSize: '0.95rem' }}><strong>Role:</strong> {userDetails?.role || 'N/A'}</Typography>
                <Typography sx={{ mb: 1.5, fontSize: '0.95rem' }}><strong>Location:</strong> {userDetails?.location || 'N/A'}</Typography>
                {userDetails?.permissions?.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: theme.palette.secondary.main }}>Permissions:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {userDetails.permissions.map((perm: { permission: string }, index: number) => (
                        <Chip 
                          key={index} 
                          label={perm.permission} 
                          size="small" 
                          sx={{ 
                            bgcolor: theme.palette.secondary.main, 
                            color: '#ffffff',
                            fontWeight: 500
                          }} 
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
            
            {userDetails?.reason && (
              <Box sx={{ gridColumn: '1 / -1', border: `2px solid ${theme.palette.secondary.main}`, borderRadius: '12px', p: 2.5, mt: 2, bgcolor: '#ffffff' }}>
                <Typography variant="subtitle1" sx={{ 
                  color: theme.palette.secondary.main, 
                  fontWeight: 700, 
                  mb: 2,
                  fontSize: '1rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Additional Information
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography sx={{ fontSize: '0.95rem' }}><strong>Reason:</strong> {userDetails.reason}</Typography>
                </Box>
              </Box>
            )}
            
            {userDetails?.notes && (
              <Box sx={{ gridColumn: '1 / -1', border: `2px solid ${theme.palette.secondary.main}`, borderRadius: '12px', p: 2.5, mt: 2, bgcolor: '#ffffff' }}>
                <Typography variant="subtitle1" sx={{ 
                  color: theme.palette.secondary.main, 
                  fontWeight: 700, 
                  mb: 2,
                  fontSize: '1rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Notes
                </Typography>
                <Box sx={{ mt: 2, p: 2, bgcolor: '#ffffff', border: `1px solid ${theme.palette.secondary.main}`, borderRadius: 1 }}>
                  <Typography sx={{ fontSize: '0.95rem' }}>{userDetails.notes}</Typography>
                </Box>
              </Box>
            )}
            
            {/* Personal Information */}
            <Box sx={{ gridColumn: '1 / -1', border: `2px solid ${theme.palette.secondary.main}`, borderRadius: '12px', p: 2.5, bgcolor: '#ffffff' }}>
              <Typography variant="subtitle1" sx={{ 
                color: theme.palette.secondary.main, 
                fontWeight: 700, 
                mb: 2,
                fontSize: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Audit Information
              </Typography>
              <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <Typography sx={{ fontSize: '0.9rem' }}>
                  <strong>Created By:</strong> {userDetails?.createdBy || 'N/A'}
                </Typography>
                <Typography sx={{ fontSize: '0.9rem' }}>
                  <strong>Created At:</strong> {userDetails?.createdAt ? new Date(userDetails.createdAt).toLocaleDateString() : 'N/A'}
                </Typography>
                <Typography sx={{ fontSize: '0.9rem' }}>
                  <strong>Updated By:</strong> {userDetails?.updatedBy || 'N/A'}
                </Typography>
                <Typography sx={{ fontSize: '0.9rem' }}>
                  <strong>Updated At:</strong> {userDetails?.updatedAt ? new Date(userDetails.updatedAt).toLocaleDateString() : 'N/A'}
                </Typography>
              </Box>
            </Box>

            {/* Debug: Theme Colors */}
            <Box sx={{ gridColumn: '1 / -1', border: `2px solid ${theme.palette.secondary.main}`, borderRadius: '12px', p: 2.5, mt: 2, bgcolor: '#ffffff' }}>
              <Typography variant="subtitle1" sx={{ 
                color: theme.palette.secondary.main, 
                fontWeight: 700, 
                mb: 2,
                fontSize: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                🐛 Debug: Theme Colors
              </Typography>
              <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <Box>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 'bold', mb: 1, color: theme.palette.secondary.main }}>Primary:</Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.5 }}>
                    <Box sx={{ width: 30, height: 30, bgcolor: theme.palette.primary.light, border: `1px solid ${theme.palette.secondary.main}`, borderRadius: 1 }} />
                    <Typography sx={{ fontSize: '0.8rem', color: theme.palette.secondary.main }}>Light: {theme.palette.primary.light}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.5 }}>
                    <Box sx={{ width: 30, height: 30, bgcolor: theme.palette.primary.main, border: `1px solid ${theme.palette.secondary.main}`, borderRadius: 1 }} />
                    <Typography sx={{ fontSize: '0.8rem', color: theme.palette.secondary.main }}>Main: {theme.palette.primary.main}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Box sx={{ width: 30, height: 30, bgcolor: theme.palette.primary.dark, border: `1px solid ${theme.palette.secondary.main}`, borderRadius: 1 }} />
                    <Typography sx={{ fontSize: '0.8rem', color: theme.palette.secondary.main }}>Dark: {theme.palette.primary.dark}</Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 'bold', mb: 1, color: theme.palette.secondary.main }}>Secondary:</Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.5 }}>
                    <Box sx={{ width: 30, height: 30, bgcolor: theme.palette.secondary.light, border: `1px solid ${theme.palette.secondary.main}`, borderRadius: 1 }} />
                    <Typography sx={{ fontSize: '0.8rem', color: theme.palette.secondary.main }}>Light: {theme.palette.secondary.light}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.5 }}>
                    <Box sx={{ width: 30, height: 30, bgcolor: theme.palette.secondary.main, border: `1px solid ${theme.palette.secondary.main}`, borderRadius: 1 }} />
                    <Typography sx={{ fontSize: '0.8rem', color: theme.palette.secondary.main }}>Main: {theme.palette.secondary.main}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Box sx={{ width: 30, height: 30, bgcolor: theme.palette.secondary.dark, border: `1px solid ${theme.palette.secondary.main}`, borderRadius: 1 }} />
                    <Typography sx={{ fontSize: '0.8rem', color: theme.palette.secondary.main }}>Dark: {theme.palette.secondary.dark}</Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 'bold', mb: 1, color: theme.palette.secondary.main }}>Error:</Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Box sx={{ width: 30, height: 30, bgcolor: theme.palette.error.main, border: `1px solid ${theme.palette.secondary.main}`, borderRadius: 1 }} />
                    <Typography sx={{ fontSize: '0.8rem', color: theme.palette.secondary.main }}>Main: {theme.palette.error.main}</Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 'bold', mb: 1, color: theme.palette.secondary.main }}>Success:</Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Box sx={{ width: 30, height: 30, bgcolor: theme.palette.success.main, border: `1px solid ${theme.palette.secondary.main}`, borderRadius: 1 }} />
                    <Typography sx={{ fontSize: '0.8rem', color: theme.palette.secondary.main }}>Main: {theme.palette.success.main}</Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 'bold', mb: 1, color: theme.palette.secondary.main }}>Warning:</Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Box sx={{ width: 30, height: 30, bgcolor: theme.palette.warning.main, border: `1px solid ${theme.palette.secondary.main}`, borderRadius: 1 }} />
                    <Typography sx={{ fontSize: '0.8rem', color: theme.palette.secondary.main }}>Main: {theme.palette.warning.main}</Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 'bold', mb: 1, color: theme.palette.secondary.main }}>Info:</Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Box sx={{ width: 30, height: 30, bgcolor: theme.palette.info.main, border: `1px solid ${theme.palette.secondary.main}`, borderRadius: 1 }} />
                    <Typography sx={{ fontSize: '0.8rem', color: theme.palette.secondary.main }}>Main: {theme.palette.info.main}</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
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
   
    </Dialog>
  );
}

// Helper component for displaying detail items
function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#FFFFF' }}>{label}</Typography>
      <Typography variant="body1" sx={{ mt: 0.5 }}>{value}</Typography>
    </Box>
  );
}
