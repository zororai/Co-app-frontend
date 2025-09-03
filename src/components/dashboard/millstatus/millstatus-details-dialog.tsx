import * as React from 'react';
import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import { Chip, Stack, Link } from '@mui/material';
import { authClient } from '@/lib/auth/client';
import dayjs from 'dayjs';

// Define the MillDetails interface
interface MillDetails {
  id: string;
  millName: string;
  millType?: string;
  millLocation?: string;
  owner?: string;
  idNumber?: string;
  address?: string;
  status?: string;
  statusHealth?: string;
  reason?: string;
  picture?: string;
  certificateOfCooperation?: string;
  operatingLicense?: string;
  proofOfInsurance?: string;
  taxClearance?: string;
  companyLogo?: string;
}

interface MillDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  driverId: string | null;
  onActionComplete?: () => void; // Callback to refresh the table
}

export function MillDetailsDialog({ open, onClose, driverId, onActionComplete }: MillDetailsDialogProps): React.JSX.Element {
  // Add state to track if buttons should be shown
  const [showActionButtons, setShowActionButtons] = useState<boolean>(true);
  const [mill, setMill] = useState<MillDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Action states
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionReason, setActionReason] = useState<string>('');
  
  // Dialog states
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState<boolean>(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState<boolean>(false);
  const [isPushbackDialogOpen, setIsPushbackDialogOpen] = useState<boolean>(false);

  // Fetch driver details when dialog opens and driverId changes
  useEffect(() => {
    if (open && driverId) {
      setLoading(true);
      setError(null);
      
      authClient.fetchMillById(driverId)
        .then((data) => {
          if (data) {
            setMill(data);
          } else {
            setError('Failed to load mill details');
          }
        })
        .catch((error_) => {
          console.error('Error fetching mill details:', error_);
          setError('An error occurred while loading mill details');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, driverId]);

  // Handle approve action
  const handleApproveClick = () => {
    setActionError(null);
    setActionSuccess(null);
    setShowActionButtons(false);
    setIsApproveDialogOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (!mill?.id) return;
    
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    
    try {
      const result = await authClient.approveMill(mill.id);
      if (result.success) {
        setActionSuccess('Mill has been approved successfully');
        // Update the mill status in the local state
        setMill({ ...mill, status: 'APPROVED' });
      } else {
        setActionError(result.error || 'Failed to approve mill');
      }
    } catch (error) {
      console.error('Error approving mill:', error);
      setActionError('An unexpected error occurred');
    } finally {
      setActionLoading(false);
      setIsApproveDialogOpen(false);
      // Call the refresh callback if provided
      if (onActionComplete) {
        onActionComplete();
      }
    }
  };

  // Handle reject action
  const handleRejectClick = () => {
    setActionError(null);
    setActionSuccess(null);
    setShowActionButtons(false);
    setIsRejectDialogOpen(true);
    setActionReason('');
  };

  const handleRejectConfirm = async () => {
    if (!mill?.id || !actionReason.trim()) {
      setActionError('Please provide a reason for rejection');
      return;
    }
    
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    
    try {
      const result = await authClient.rejectMill(mill.id, actionReason);
      if (result.success) {
        setActionSuccess('Mill has been rejected successfully');
        // Update the mill status in the local state
        setMill({ ...mill, status: 'REJECTED', reason: actionReason });
      } else {
        setActionError(result.error || 'Failed to reject mill');
      }
    } catch (error) {
      console.error('Error rejecting mill:', error);
      setActionError('An unexpected error occurred');
    } finally {
      setActionLoading(false);
      setIsRejectDialogOpen(false);
      // Call the refresh callback if provided
      if (onActionComplete) {
        onActionComplete();
      }
    }
  };

  // Handle pushback action
  const handlePushbackClick = () => {
    setActionError(null);
    setActionSuccess(null);
    setShowActionButtons(false);
    setIsPushbackDialogOpen(true);
    setActionReason('');
  };

  const handlePushbackConfirm = async () => {
    if (!mill?.id || !actionReason.trim()) {
      setActionError('Please provide a reason for pushing back');
      return;
    }
    
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    
    try {
      const result = await authClient.pushbackMill(mill.id, actionReason);
      if (result.success) {
        setActionSuccess('Mill has been pushed back successfully');
        // Update the mill status in the local state
        setMill({ ...mill, status: 'PUSHED_BACK', reason: actionReason });
      } else {
        setActionError(result.error || 'Failed to push back mill');
      }
    } catch (error) {
      console.error('Error pushing back mill:', error);
      setActionError('An unexpected error occurred');
    } finally {
      setActionLoading(false);
      setIsPushbackDialogOpen(false);
      // Call the refresh callback if provided
      if (onActionComplete) {
        onActionComplete();
      }
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
      <DialogTitle sx={{ pb: 1 }}>
        Mill Details
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
        ) : mill ? (
          <Box sx={{ mt: 2 }}>
            {/* Mill Status */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                {mill.millName}
              </Typography>
              <Chip 
                label={mill.status || 'PENDING'} 
                color={
                  mill.status === 'APPROVED' ? 'success' : 
                  mill.status === 'REJECTED' ? 'error' : 
                  mill.status === 'PUSHED_BACK' ? 'warning' : 
                  'default'
                }
                sx={{ fontWeight: 'medium' }}
              />
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            {/* Mill Information */}
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Mill Information
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Mill Name</Typography>
                <Typography variant="body1">{mill.millName || 'N/A'}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Mill Type</Typography>
                <Typography variant="body1">{mill.millType || 'N/A'}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Mill Location</Typography>
                <Typography variant="body1">{mill.millLocation || 'N/A'}</Typography>
              </Box>
            </Box>
            
            {/* Owner Information */}
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Owner Information
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Owner Name</Typography>
                <Typography variant="body1">{mill.owner || 'N/A'}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">ID Number</Typography>
                <Typography variant="body1">{mill.idNumber || 'N/A'}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Address</Typography>
                <Typography variant="body1">{mill.address || 'N/A'}</Typography>
              </Box>
            </Box>
            
            {/* Status Information */}
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Status Information
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <Typography variant="body1">{mill.status || 'N/A'}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Status Health</Typography>
                <Typography variant="body1">{mill.statusHealth || 'N/A'}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Reason</Typography>
                <Typography variant="body1">{mill.reason || 'N/A'}</Typography>
              </Box>
            </Box>
            
            {/* Documents */}
            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
              Documents
            </Typography>
        
            
            {/* Additional space at the bottom */}
            <Box sx={{ height: 20 }} />
          </Box>
        ) : (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', my: 4 }}>
            No mill information available
          </Typography>
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
      
      {/* Action buttons */}
      <DialogActions sx={{ p: 3, flexDirection: 'column', alignItems: 'stretch' }}>
        {mill && mill.status === 'PENDING' && showActionButtons && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button 
              onClick={handleApproveClick}
              variant="outlined"
              color="success"
              disabled={actionLoading}
              sx={{ minWidth: '120px' }}
            >
              Approve
            </Button>
            <Button 
              onClick={handlePushbackClick}
              variant="outlined"
              color="warning"
              disabled={actionLoading}
              sx={{ minWidth: '120px' }}
            >
              Push Back
            </Button>
            <Button 
              onClick={handleRejectClick}
              variant="outlined"
              color="error"
              disabled={actionLoading}
              sx={{ minWidth: '120px' }}
            >
              Reject
            </Button>
          </Box>
        )}
  
      </DialogActions>

      {/* Reason input field for reject/pushback */}
      {(isRejectDialogOpen || isPushbackDialogOpen) && (
        <DialogActions sx={{ p: 3, flexDirection: 'column', alignItems: 'stretch' }}>
          <TextField
            label="Reason"
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            rows={3}
            sx={{ mb: 2 }}
            required
            error={!actionReason.trim()}
            helperText={actionReason.trim() ? '' : `Please provide a reason for ${isRejectDialogOpen ? 'rejection' : 'pushing back'}`}
            disabled={actionLoading}
            autoFocus
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button 
              onClick={() => {
                setIsRejectDialogOpen(false);
                setIsPushbackDialogOpen(false);
                setActionReason('');
              }}
              variant="outlined"
              disabled={actionLoading}
              sx={{ minWidth: '120px' }}
            >
              Cancel
            </Button>
            <Button 
              onClick={isRejectDialogOpen ? handleRejectConfirm : handlePushbackConfirm}
              variant="contained"
              color="primary"
              disabled={actionLoading || !actionReason.trim()}
              startIcon={actionLoading ? <CircularProgress size={20} color="inherit" /> : null}
              sx={{ 
                minWidth: '200px',
                bgcolor: '#5f4bfa',
                '&:hover': { bgcolor: '#4d3fd6' }
              }}
            >
              {actionLoading ? 'Submitting...' : isRejectDialogOpen ? 'Confirm Reject' : 'Confirm Push Back'}
            </Button>
          </Box>
        </DialogActions>
      )}
      
      {/* Approve Dialog */}
      {isApproveDialogOpen && (
        <DialogActions sx={{ p: 3, flexDirection: 'column', alignItems: 'stretch' }}>
          <Typography variant="body1" sx={{ mb: 2, textAlign: 'center' }}>
            Are you sure you want to approve this mill?
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button 
              onClick={() => setIsApproveDialogOpen(false)}
              variant="outlined"
              disabled={actionLoading}
              sx={{ minWidth: '120px' }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleApproveConfirm}
              variant="contained"
              color="primary"
              disabled={actionLoading}
              startIcon={actionLoading ? <CircularProgress size={20} color="inherit" /> : null}
              sx={{ 
                minWidth: '200px',
                bgcolor: '#5f4bfa',
                '&:hover': { bgcolor: '#4d3fd6' }
              }}
            >
              {actionLoading ? 'Submitting...' : 'Confirm Approve'}
            </Button>
          </Box>
        </DialogActions>
      )}
    </Dialog>
  );
}
