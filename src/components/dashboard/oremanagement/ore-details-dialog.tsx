import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import { authClient } from '@/lib/auth/client';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import { printElementById } from '@/lib/print';

interface OreDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string | null;
  onRefresh?: () => void; // Optional callback to refresh data after action
}

export function OreDetailsDialog({ open, onClose, userId, onRefresh }: OreDetailsDialogProps): React.JSX.Element {
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
      } catch (err) {
        console.error('Error fetching ore details:', err);
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
    } catch (err) {
      console.error(`Error ${actionType === 'reject' ? 'rejecting' : 'pushing back'} ore:`, err);
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
          p: 2,
          bgcolor: '#15073d'
        }}
      >
        <Typography variant="subtitle1" component="span" sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>Ore Details</Typography>
        <Box sx={{ display: 'flex' }}>
          <IconButton onClick={() => printElementById('ore-details-printable', 'Ore Details')} size="small" sx={{ mr: 1, color: '#9e9e9e' }}>
            <PrintIcon />
          </IconButton>
          <IconButton onClick={onClose} size="small" sx={{ color: '#9e9e9e' }}>
            <CloseIcon />
          </IconButton>
        </Box>
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

        {!loading && !error && oreDetails && (
          <Box id="ore-details-printable" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ border: '1px solid #000080', borderRadius: '8px', p: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#FF8F00', fontWeight: 'bold', mb: 2 }}>Ore Information</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                <DetailItem label="Ore Unique ID" value={oreDetails.oreUniqueId || 'N/A'} />
                <DetailItem label="Shaft Numbers" value={oreDetails.shaftNumbers || 'N/A'} />
                <DetailItem label="Weight" value={oreDetails.weight?.toString() || 'N/A'} />
                <DetailItem label="Number of Bags" value={oreDetails.numberOfBags?.toString() || 'N/A'} />
                <DetailItem label="Transport Status" value={oreDetails.transportStatus || 'N/A'} />
                <DetailItem label="Transport Driver" value={oreDetails.selectedTransportdriver || 'N/A'} />
                <DetailItem label="Selected Transport" value={oreDetails.selectedTransport || 'N/A'} />
                <DetailItem label="Process Status" value={oreDetails.processStatus || 'N/A'} />
                <DetailItem label="Location" value={oreDetails.location || 'N/A'} />
                <DetailItem label="Date" value={oreDetails.date ? new Date(oreDetails.date).toLocaleDateString() : 'N/A'} />
                <DetailItem label="Time" value={oreDetails.time ? new Date(oreDetails.time).toLocaleTimeString() : 'N/A'} />
              </Box>
            </Box>

            {oreDetails.transportReason && (
              <Box sx={{ border: '1px solid #000080', borderRadius: '8px', p: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#FF8F00', fontWeight: 'bold', mb: 2 }}>Transport Reason</Typography>
                <Box sx={{ whiteSpace: 'pre-wrap' }}>
                  <Typography variant="body2">{oreDetails.transportReason}</Typography>
                </Box>
              </Box>
            )}
            
            {oreDetails.tax && oreDetails.tax.length > 0 && (
              <Box sx={{ border: '1px solid #000080', borderRadius: '8px', p: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#FF8F00', fontWeight: 'bold', mb: 2 }}>Tax Information</Typography>
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
              onClick={() => handleAction()}
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
          
         
        </DialogActions>
      )}
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
