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
import Skeleton from '@mui/material/Skeleton';
import { authClient } from '@/lib/auth/client';
import dayjs from 'dayjs';
import TextField from '@mui/material/TextField';
import { Chip, Stack, Dialog as MuiDialog, DialogTitle as MuiDialogTitle, DialogContent as MuiDialogContent, DialogActions as MuiDialogActions } from '@mui/material';
import { useState } from 'react';
import PrintIcon from '@mui/icons-material/Print';
import { printElementById } from '@/lib/print';
import { useTheme } from '@mui/material/styles';

interface MillDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  driverId: string | null;
}

export function MillDetailsDialog({ open, onClose, driverId }: MillDetailsDialogProps): React.JSX.Element {
  const theme = useTheme();
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
      <DialogTitle sx={{ pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: theme.palette.secondary.main, p: 2 }}>
        <Typography variant="subtitle1" component="span" sx={{ color: 'white', fontWeight: 'bold' }}>Mill Details</Typography>
        <Box sx={{ display: 'flex' }}>
          <IconButton 
            onClick={() => printElementById('mill-details-printable', 'Mill Details')} 
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
      
      <DialogContent>
        {loading ? (
          <Box sx={{ mt: 2 }}>
            {/* Header skeleton */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Skeleton variant="text" width="40%" height={32} />
              <Skeleton variant="rounded" width={100} height={24} />
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            {/* Mill Information skeleton */}
            <Box sx={{ border: `2px solid ${theme.palette.secondary.main}`, borderRadius: '12px', p: 2, mb: 3 }}>
              <Skeleton variant="text" width="30%" height={24} sx={{ mb: 2 }} />
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                {[...Array(4)].map((_, index) => (
                  <Box key={index}>
                    <Skeleton variant="text" width="60%" height={20} />
                    <Skeleton variant="text" width="80%" height={24} />
                  </Box>
                ))}
              </Box>
            </Box>
            
            {/* Owner Information skeleton */}
            <Box sx={{ border: `2px solid ${theme.palette.secondary.main}`, borderRadius: '12px', p: 2, mb: 3 }}>
              <Skeleton variant="text" width="30%" height={24} sx={{ mb: 2 }} />
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                {[...Array(3)].map((_, index) => (
                  <Box key={index}>
                    <Skeleton variant="text" width="60%" height={20} />
                    <Skeleton variant="text" width="80%" height={24} />
                  </Box>
                ))}
              </Box>
            </Box>
            
            {/* Status Information skeleton */}
            <Box sx={{ border: `2px solid ${theme.palette.secondary.main}`, borderRadius: '12px', p: 2, mb: 3 }}>
              <Skeleton variant="text" width="30%" height={24} sx={{ mb: 2 }} />
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                {[...Array(3)].map((_, index) => (
                  <Box key={index}>
                    <Skeleton variant="text" width="60%" height={20} />
                    <Skeleton variant="text" width="80%" height={24} />
                  </Box>
                ))}
              </Box>
            </Box>
            
            {/* Documents skeleton */}
            <Box sx={{ border: `2px solid ${theme.palette.secondary.main}`, borderRadius: '12px', p: 2, mb: 3 }}>
              <Skeleton variant="text" width="30%" height={24} sx={{ mb: 2 }} />
              <Skeleton variant="text" width="60%" height={20} />
              <Skeleton variant="text" width="80%" height={24} />
              <Skeleton variant="rectangular" width={300} height={200} sx={{ mt: 1, borderRadius: '4px' }} />
            </Box>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
        ) : mill ? (
          <Box sx={{ mt: 2 }} id="mill-details-printable">
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
            <Box sx={{ border: `2px solid ${theme.palette.secondary.main}`, borderRadius: '12px', p: 2, mb: 3 }}>
              <Typography variant="subtitle2" sx={{ color: theme.palette.secondary.main, fontWeight: 'bold', mb: 2, textTransform: 'uppercase' }}>
                Mill Information
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>Mill ID</Typography>
                  <Typography variant="body1" sx={{ fontSize: '0.95rem' }}>{mill.millId || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>Mill Name</Typography>
                  <Typography variant="body1" sx={{ fontSize: '0.95rem' }}>{mill.millName || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>Mill Type</Typography>
                  <Typography variant="body1" sx={{ fontSize: '0.95rem' }}>{mill.millType || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>Mill Location</Typography>
                  <Typography variant="body1" sx={{ fontSize: '0.95rem' }}>{mill.millLocation || 'N/A'}</Typography>
                </Box>
              </Box>
            </Box>
            
            {/* Owner Information */}
            <Box sx={{ border: `2px solid ${theme.palette.secondary.main}`, borderRadius: '12px', p: 2, mb: 3 }}>
              <Typography variant="subtitle2" sx={{ color: theme.palette.secondary.main, fontWeight: 'bold', mb: 2, textTransform: 'uppercase' }}>
                Owner Information
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>Owner Name</Typography>
                  <Typography variant="body1" sx={{ fontSize: '0.95rem' }}>{mill.owner || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>ID Number</Typography>
                  <Typography variant="body1" sx={{ fontSize: '0.95rem' }}>{mill.idNumber || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>Address</Typography>
                  <Typography variant="body1" sx={{ fontSize: '0.95rem' }}>{mill.address || 'N/A'}</Typography>
                </Box>
              </Box>
            </Box>
            
            {/* Status Information */}
            <Box sx={{ border: `2px solid ${theme.palette.secondary.main}`, borderRadius: '12px', p: 2, mb: 3 }}>
              <Typography variant="subtitle2" sx={{ color: theme.palette.secondary.main, fontWeight: 'bold', mb: 2, textTransform: 'uppercase' }}>
                Status Information
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>Status</Typography>
                  <Typography variant="body1" sx={{ fontSize: '0.95rem' }}>{mill.status || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>Status Health</Typography>
                  <Typography variant="body1" sx={{ fontSize: '0.95rem' }}>{mill.statusHealth || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>Reason</Typography>
                  <Typography variant="body1" sx={{ fontSize: '0.95rem' }}>{mill.reason || 'N/A'}</Typography>
                </Box>
              </Box>
            </Box>
            
            {/* Documents */}
            <Box sx={{ border: `2px solid ${theme.palette.secondary.main}`, borderRadius: '12px', p: 2, mb: 3 }}>
              <Typography variant="subtitle2" sx={{ color: theme.palette.secondary.main, fontWeight: 'bold', mb: 2, textTransform: 'uppercase' }}>
                Documents
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr' }, gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>Mill Picture</Typography>
                  <Typography variant="body1" sx={{ fontSize: '0.95rem' }}>
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
