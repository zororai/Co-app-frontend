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
import { Chip, Stack } from '@mui/material';
import { authClient } from '@/lib/auth/client';
import dayjs from 'dayjs';

// Define the MillDetails interface
interface MillDetails {
  millId: string;
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
}

interface MillDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  driverId: string | null;
}

export function MillDetailsDialog({ open, onClose, driverId }: MillDetailsDialogProps): React.JSX.Element {
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
        .catch((err) => {
          console.error('Error fetching mill details:', err);
          setError('An error occurred while loading mill details');
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
    if (!mill?.millId) return;
    
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    
    try {
      const result = await authClient.approveMill(mill.millId);
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
    }
  };

  // Handle reject action
  const handleRejectClick = () => {
    setIsRejectDialogOpen(true);
    setActionReason('');
  };

  const handleRejectConfirm = async () => {
    if (!mill?.millId || !actionReason.trim()) {
      setActionError('Please provide a reason for rejection');
      return;
    }
    
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    
    try {
      const result = await authClient.rejectMill(mill.millId, actionReason);
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
    }
  };

  // Handle pushback action
  const handlePushbackClick = () => {
    setIsPushbackDialogOpen(true);
    setActionReason('');
  };

  const handlePushbackConfirm = async () => {
    if (!mill?.millId || !actionReason.trim()) {
      setActionError('Please provide a reason for pushing back');
      return;
    }
    
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    
    try {
      const result = await authClient.pushbackMill(mill.millId, actionReason);
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
                <Typography variant="body2" color="text.secondary">Mill ID</Typography>
                <Typography variant="body1">{mill.millId || 'N/A'}</Typography>
              </Box>
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
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Documents
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr' }, gap: 2, mb: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Mill Picture</Typography>
                <Typography variant="body1">
                  {mill.picture ? 'Uploaded' : 'Not uploaded'}
                </Typography>
                {mill.picture && (
                  <Box sx={{ mt: 1, maxWidth: '300px' }}>
                    <img 
                      src={mill.picture} 
                      alt="Mill" 
                      style={{ maxWidth: '100%', borderRadius: '4px' }} 
                    />
                  </Box>
                )}
              </Box>
            </Box>
            
            {/* Additional space at the bottom */}
            <Box sx={{ height: 20 }} />
          </Box>
        ) : (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', my: 4 }}>
            No mill information available
          </Typography>
        )}
      </DialogContent>
      
      {/* Action buttons */}
      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'flex-start', gap: 2 }}>
        {mill && mill.status === 'PENDING' && (
          <>
            <Button 
              variant="contained" 
              color="success" 
              onClick={handleApproveClick}
              disabled={actionLoading}
            >
              Approve
            </Button>
            <Button 
              variant="contained" 
              color="error" 
              onClick={handleRejectClick}
              disabled={actionLoading}
            >
              Reject
            </Button>
            <Button 
              variant="contained" 
              color="warning" 
              onClick={handlePushbackClick}
              disabled={actionLoading}
            >
              Push Back
            </Button>
          </>
        )}
        {actionSuccess && (
          <Alert severity="success" sx={{ ml: 2 }}>
            {actionSuccess}
          </Alert>
        )}
        {actionError && (
          <Alert severity="error" sx={{ ml: 2 }}>
            {actionError}
          </Alert>
        )}
      </DialogActions>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onClose={() => setIsApproveDialogOpen(false)}>
        <DialogTitle>Approve Mill</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to approve this mill?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsApproveDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleApproveConfirm} 
            variant="contained" 
            color="success"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Approve'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onClose={() => setIsRejectDialogOpen(false)}>
        <DialogTitle>Reject Mill</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Please provide a reason for rejecting this mill:
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            id="reason"
            label="Reason"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleRejectConfirm} 
            variant="contained" 
            color="error"
            disabled={actionLoading || !actionReason.trim()}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Pushback Dialog */}
      <Dialog open={isPushbackDialogOpen} onClose={() => setIsPushbackDialogOpen(false)}>
        <DialogTitle>Push Back Mill</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Please provide a reason for pushing back this mill:
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            id="reason"
            label="Reason"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPushbackDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handlePushbackConfirm} 
            variant="contained" 
            color="warning"
            disabled={actionLoading || !actionReason.trim()}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Push Back'}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}
