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
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { authClient } from '@/lib/auth/client';
import dayjs from 'dayjs';
import TextField from '@mui/material/TextField';
import { Chip, Stack, Dialog as MuiDialog, DialogTitle as MuiDialogTitle, DialogContent as MuiDialogContent, DialogActions as MuiDialogActions } from '@mui/material';
import { useState } from 'react';

interface MillDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  driverId: string | null;
}

export function MillDetailsDialog({ open, onClose, driverId }: MillDetailsDialogProps): React.JSX.Element {
  const [mill, setMill] = React.useState<any>(null);
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

 

  // Handle reject action




  // Handle pushback action




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
      
    

      
    </Dialog>
  );
}
