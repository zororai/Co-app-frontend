import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import { authClient } from '@/lib/auth/client';
import dayjs from 'dayjs';
import TextField from '@mui/material/TextField';
import PrintIcon from '@mui/icons-material/Print';
import { printElementById } from '@/lib/print';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Chip from '@mui/material/Chip';
import { useTheme } from '@mui/material/styles';

interface DriverDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  driverId: string | null;
}

export function DriverDetailsDialog({ open, onClose, driverId }: DriverDetailsDialogProps): React.JSX.Element {
  const theme = useTheme();
  const [driver, setDriver] = React.useState<any>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  
  // Action states
  const [isApproveDialogOpen, setIsApproveDialogOpen] = React.useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = React.useState(false);
  const [isPushbackDialogOpen, setIsPushbackDialogOpen] = React.useState(false);
  const [actionReason, setActionReason] = React.useState('');
  const [actionLoading, setActionLoading] = React.useState(false);
  const [actionSuccess, setActionSuccess] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);

  // Fetch driver details when dialog opens and driverId changes
  React.useEffect(() => {
    if (open && driverId) {
      setLoading(true);
      setError(null);
      
      authClient.fetchDriverById(driverId)
        .then((data) => {
          if (data) {
            setDriver(data);
          } else {
            setError('Failed to load driver details');
          }
        })
        .catch((error_) => {
          console.error('Error fetching driver details:', error_);
          setError('An error occurred while loading driver details');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, driverId]);

  // Handle approve action
  const handleApproveClick = () => {
    setIsApproveDialogOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (!driverId) return;
    
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    
    try {
      const result = await authClient.approveDriver(driverId);
      if (result.success) {
        setActionSuccess('Driver approved successfully');
        // Update driver status in the UI
        if (driver) {
          setDriver({ ...driver, status: 'APPROVED' });
        }
      } else {
        setActionError(result.error || 'Failed to approve driver');
      }
    } catch (error) {
      console.error('Error approving driver:', error);
      setActionError('An unexpected error occurred');
    } finally {
      setActionLoading(false);
      setIsApproveDialogOpen(false);
    }
  };

  // Handle reject action
  const handleRejectClick = () => {
    setActionReason('');
    setIsRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!driverId) return;
    if (!actionReason.trim()) {
      setActionError('Reason is required for rejection');
      return;
    }
    
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    
    try {
      const result = await authClient.rejectDriver(driverId, actionReason);
      if (result.success) {
        setActionSuccess('Driver rejected successfully');
        // Update driver status in the UI
        if (driver) {
          setDriver({ ...driver, status: 'REJECTED', reason: actionReason });
        }
      } else {
        setActionError(result.error || 'Failed to reject driver');
      }
    } catch (error) {
      console.error('Error rejecting driver:', error);
      setActionError('An unexpected error occurred');
    } finally {
      setActionLoading(false);
      setIsRejectDialogOpen(false);
    }
  };

  // Handle pushback action
  const handlePushbackClick = () => {
    setActionReason('');
    setIsPushbackDialogOpen(true);
  };

  const handlePushbackConfirm = async () => {
    if (!driverId) return;
    if (!actionReason.trim()) {
      setActionError('Reason is required for pushback');
      return;
    }
    
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    
    try {
      const result = await authClient.pushbackDriver(driverId, actionReason);
      if (result.success) {
        setActionSuccess('Driver pushed back successfully');
        // Update driver status in the UI
        if (driver) {
          setDriver({ ...driver, status: 'PUSHED_BACK', reason: actionReason });
        }
      } else {
        setActionError(result.error || 'Failed to push back driver');
      }
    } catch (error) {
      console.error('Error pushing back driver:', error);
      setActionError('An unexpected error occurred');
    } finally {
      setActionLoading(false);
      setIsPushbackDialogOpen(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return dayjs(dateString).format('MMM D, YYYY');
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle sx={{ pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: theme.palette.secondary.main, p: 2 }}>
        <Typography variant="subtitle1" component="span" sx={{ color: '#ffffff', fontWeight: 'bold' }}>Driver Details</Typography>
        <Box sx={{ display: 'flex' }}>
        <IconButton onClick={() => printElementById('user-details-printable', 'User Details')} size="small" sx={{ mr: 1, color: '#9e9e9e' }}>
            <PrintIcon />
          </IconButton>
          <IconButton onClick={onClose} size="small" sx={{ color: '#9e9e9e' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {loading ? (
          <Box sx={{ mt: 2 }}>
            {/* Skeleton loading states */}
            <Box sx={{ mb: 3 }}>
              <Skeleton variant="rectangular" height={60} sx={{ borderRadius: '8px', mb: 3 }} />
            </Box>
            
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: '8px', mb: 3 }} />
            <Skeleton variant="rectangular" height={180} sx={{ borderRadius: '8px', mb: 3 }} />
            <Skeleton variant="rectangular" height={120} sx={{ borderRadius: '8px', mb: 3 }} />
            <Skeleton variant="rectangular" height={140} sx={{ borderRadius: '8px' }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
        ) : driver ? (
          <Box sx={{ mt: 2 }} id="driver-details-printable">
            {/* Driver Status */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `1px solid ${theme.palette.secondary.main}`, borderRadius: '8px', p: 2 }}>
              <Typography variant="h6">
                {driver.firstName} {driver.lastName}
              </Typography>
              <Chip 
                label={driver.status || 'PENDING'} 
                color={
                  driver.status === 'APPROVED' ? 'success' : 
                  driver.status === 'REJECTED' ? 'error' : 
                  driver.status === 'PUSHED_BACK' ? 'warning' : 
                  'default'
                }
                sx={{ fontWeight: 'medium' }}
              />
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            {/* Personal Information */}
            <Box sx={{ border: `1px solid ${theme.palette.secondary.main}`, borderRadius: '8px', p: 2, mb: 3 }}>
              <Typography variant="subtitle2" sx={{ color: theme.palette.secondary.main, fontWeight: 'bold', mb: 2 }}>
                Personal Information
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Full Name</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{driver.firstName} {driver.lastName}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">ID Number</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{driver.idNumber || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Date of Birth</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{formatDate(driver.dateOfBirth)}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Phone Number</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{driver.phoneNumber || 'N/A'}</Typography>
                </Box>
                <Box sx={{ gridColumn: { xs: '1', sm: 'span 2' } }}>
                  <Typography variant="body2" color="text.secondary">Email Address</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{driver.emailAddress || 'N/A'}</Typography>
                </Box>
                <Box sx={{ gridColumn: { xs: '1', sm: 'span 2' } }}>
                  <Typography variant="body2" color="text.secondary">Address</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{driver.address || 'N/A'}</Typography>
                </Box>
              </Box>
            </Box>
            
            {/* License Information */}
            <Box sx={{ border: `1px solid ${theme.palette.secondary.main}`, borderRadius: '8px', p: 2, mb: 3 }}>
              <Typography variant="subtitle2" sx={{ color: theme.palette.secondary.main, fontWeight: 'bold', mb: 2 }}>
                License Information
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">License Number</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{driver.licenseNumber || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">License Class</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{driver.licenseClass || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">License Expiry Date</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{formatDate(driver.licenseExpiryDate)}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Years of Experience</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{driver.yearsOfExperience || '0'}</Typography>
                </Box>
              </Box>
            </Box>
            
            {/* Emergency Contact */}
            <Box sx={{ border: `1px solid ${theme.palette.secondary.main}`, borderRadius: '8px', p: 2, mb: 3 }}>
              <Typography variant="subtitle2" sx={{ color: theme.palette.secondary.main, fontWeight: 'bold', mb: 2 }}>
                Emergency Contact
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Contact Name</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{driver.emergencyContactName || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Contact Phone</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{driver.emergencyContactPhone || 'N/A'}</Typography>
                </Box>
              </Box>
            </Box>
            
            {/* Documents */}
            <Box sx={{ border: `1px solid ${theme.palette.secondary.main}`, borderRadius: '8px', p: 2, mb: 3 }}>
              <Typography variant="subtitle2" sx={{ color: theme.palette.secondary.main, fontWeight: 'bold', mb: 2 }}>
                Documents
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">License Document</Typography>
                  <Typography variant="body1">
                    {driver.licenseDocument ? (
                      <Box component="span" sx={{ color: 'success.main', display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                        <CheckCircleOutlineIcon fontSize="small" />
                        <span>Uploaded</span>
                      </Box>
                    ) : 'Not uploaded'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">ID Document</Typography>
                  <Typography variant="body1">
                    {driver.idDocument ? (
                      <Box component="span" sx={{ color: 'success.main', display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                        <CheckCircleOutlineIcon fontSize="small" />
                        <span>Uploaded</span>
                      </Box>
                    ) : 'Not uploaded'}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            
            {/* Additional space at the bottom */}
            <Box sx={{ height: 20 }} />
          </Box>
        ) : (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', my: 4 }}>
            No driver information available
          </Typography>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 0, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          onClick={onClose}
          sx={{
            bgcolor: theme.palette.secondary.main,
            color: '#ffffff',
            '&:hover': {
              bgcolor: theme.palette.secondary.dark,
            },
          }}
        >
          Close
        </Button>
      </DialogActions>

      
    </Dialog>
  );
}
