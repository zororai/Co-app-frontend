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
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import Skeleton from '@mui/material/Skeleton';
import { useTheme } from '@mui/material/styles';
import { authClient } from '@/lib/auth/client';
import { printElementById } from '@/lib/print';

interface OreDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string | null;
  onRefresh?: () => void; // Optional callback to refresh data after action
}

export function OreDetailsDialog({ open, onClose, userId, onRefresh }: OreDetailsDialogProps): React.JSX.Element {
  const theme = useTheme();
  const [oreDetails, setOreDetails] = React.useState<any>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');
  const [actionLoading, setActionLoading] = React.useState<boolean>(false);
  const [actionError, setActionError] = React.useState<string>('');
  const [actionSuccess, setActionSuccess] = React.useState<string>('');
  const [reason, setReason] = React.useState<string>('');
  const [showReasonField, setShowReasonField] = React.useState<boolean>(false);
  const [actionType, setActionType] = React.useState<'reject' | 'pushback' | null>(null);

  // Reset states when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setActionError('');
      setActionSuccess('');
      setReason('');
      setShowReasonField(false);
      setActionType(null);
    }
  }, [open]);

  // Fetch ore details when dialog opens
  React.useEffect(() => {
    const fetchOreDetails = async () => {
      if (!userId) return;
      
      setLoading(true);
      setError('');
      try {
        const details = await authClient.fetchOreDetails(userId);
        setOreDetails(details);
      } catch (error_) {
        console.error('Error fetching ore details:', error_);
        setError('Failed to load ore details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (open && userId) {
      fetchOreDetails();
    } else {
      // Reset state when dialog closes
      setOreDetails(null);
      setError('');
    }
  }, [open, userId]);
  
  // Cancel action
  const cancelAction = () => {
    setShowReasonField(false);
    setReason('');
    setActionType(null);
    setActionError('');
  };

  // Handle action (reject/pushback)
  const handleAction = async () => {
    if (!actionType || !reason.trim() || !userId) return;
    
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');
    
    try {
      // Here you would call the appropriate API method based on actionType
      // For example: await authClient.rejectOre(userId, reason) or await authClient.pushbackOre(userId, reason)
      
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setActionSuccess(`Ore has been ${actionType === 'reject' ? 'rejected' : 'pushed back'} successfully.`);
      setShowReasonField(false);
      
      // Refresh parent component if callback provided
      if (onRefresh) {
        onRefresh();
      }
    } catch (error_) {
      console.error(`Error ${actionType === 'reject' ? 'rejecting' : 'pushing back'} ore:`, error_);
      setActionError(`Failed to ${actionType === 'reject' ? 'reject' : 'push back'} ore. Please try again.`);
    } finally {
      setActionLoading(false);
    }
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
        <Typography variant="h6" component="span" sx={{ color: 'white', fontWeight: 600 }}>Assign Ore To Vehicle</Typography>
        <Box sx={{ display: 'flex' }}>
          <IconButton onClick={() => printElementById('ore-details-printable', 'Assign Ore To Vehicle')} size="small" sx={{ 
            color: 'white',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
          }}>
            <PrintIcon />
          </IconButton>
          <IconButton onClick={onClose} size="small" sx={{ 
            color: 'white',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
          }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ py: 3 }}>
        {loading && (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5, p: 2 }}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Box key={index} sx={{ 
                border: `2px solid ${theme.palette.secondary.main}`, 
                borderRadius: '12px', 
                p: 2.5 
              }}>
                <Skeleton variant="text" width="60%" height={28} sx={{ mb: 2 }} />
                <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="90%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="80%" height={20} />
              </Box>
            ))}
          </Box>
        )}

        {!loading && error && (
          <Box sx={{ textAlign: 'center', color: 'error.main', py: 4 }}>
            <Typography>{error}</Typography>
          </Box>
        )}

        {!loading && !error && oreDetails && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }} id="ore-details-printable">
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
                Ore Information
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                <DetailItem label="Ore Unique ID" value={oreDetails.oreUniqueId || 'N/A'} />
                <DetailItem label="Shaft Numbers" value={oreDetails.shaftNumbers || 'N/A'} />
                <DetailItem label="Weight" value={oreDetails.weight?.toString() || 'N/A'} />
                <DetailItem label="Number of Bags" value={oreDetails.numberOfBags?.toString() || 'N/A'} />
                <DetailItem label="Transport Status" value={oreDetails.transportStatus || 'N/A'} />
                <DetailItem label="Transport Driver" value={oreDetails.selectedTransportdriver || 'N/A'} />
                <DetailItem label="Selected Transport" value={oreDetails.selectedTransport || 'N/A'} />
                <DetailItem label="Process Status" value={oreDetails.processStatus || 'N/A'} />
              </Box>
            </Box>

            {oreDetails.transportReason && (
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
                >Transport Reason</Typography>
                <Box sx={{ whiteSpace: 'pre-wrap' }}>
                  <Typography variant="body2">{oreDetails.transportReason}</Typography>
                </Box>
              </Box>
            )}

            {oreDetails.tax && oreDetails.tax.length > 0 && (
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
                >Tax Information</Typography>
                <Box>
                  {oreDetails.tax.map((taxItem: any, index: number) => (
                    <Box key={index} sx={{ mb: index < oreDetails.tax.length - 1 ? 2 : 0 }}>
                      <Typography variant="body2"><strong>Tax Type:</strong> {taxItem.taxType || 'N/A'}</Typography>
                      <Typography variant="body2"><strong>Tax Rate:</strong> {taxItem.taxRate?.toString() || 'N/A'}</Typography>
                      <Typography variant="body2"><strong>Location:</strong> {taxItem.location || 'N/A'}</Typography>
                      <Typography variant="body2"><strong>Description:</strong> {taxItem.description || 'N/A'}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Mill Information Section */}
            {oreDetails.mills && oreDetails.mills.length > 0 && (
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
                >Mill Information</Typography>
                <Box>
                  {oreDetails.mills.map((mill: any, index: number) => (
                    <Box key={index} sx={{ mb: index < oreDetails.mills.length - 1 ? 2 : 0 }}>
                      <Typography variant="body2"><strong>Mill Name:</strong> {mill.millName || 'N/A'}</Typography>
                      <Typography variant="body2"><strong>Mill Type:</strong> {mill.millType || 'N/A'}</Typography>
                      <Typography variant="body2"><strong>Location:</strong> {mill.location || 'N/A'}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      
      {/* Action buttons */}
      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          sx={{
            borderColor: theme.palette.secondary.main,
            color: theme.palette.secondary.main,
            '&:hover': {
              borderColor: theme.palette.secondary.dark,
              bgcolor: 'rgba(50, 56, 62, 0.04)'
            }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Helper component for displaying detail items
function DetailItem({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#666' }}>{label}</Typography>
      <Typography variant="body1">{value}</Typography>
    </Box>
  );
}
