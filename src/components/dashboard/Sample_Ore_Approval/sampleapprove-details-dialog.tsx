 

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
      <DialogTitle sx={{ 
        fontSize: '1.25rem', 
        fontWeight: 600,
        borderBottom: '1px solid #e0e0e0',
        pb: 2
      }}>
        Ore Details
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
            
            {oreDetails.transportReason && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Transport Reason</Typography>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: '#f5f5f5', 
                  borderRadius: 1,
                  whiteSpace: 'pre-wrap'
                }}>
                  <Typography variant="body2">{oreDetails.transportReason}</Typography>
                </Box>
              </Box>
            )}
            
            {oreDetails.tax && oreDetails.tax.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Tax Information</Typography>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: '#f5f5f5', 
                  borderRadius: 1
                }}>
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
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Mill Information</Typography>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: '#f5f5f5', 
                  borderRadius: 1
                }}>
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
            
            {/* Sample Information Section */}
            {oreDetails.oreSample && oreDetails.oreSample.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Sample Information</Typography>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: '#f5f5f5', 
                  borderRadius: 1
                }}>
                  {oreDetails.oreSample.map((sample: any, index: number) => (
                    <Box key={index} sx={{ mb: index < oreDetails.oreSample.length - 1 ? 2 : 0 }}>
                      <Typography variant="body2"><strong>Sample Type:</strong> {sample.sampleType || 'N/A'}</Typography>
                      <Typography variant="body2"><strong>Sample Weight:</strong> {sample.sampleWeight || 'N/A'}</Typography>
                      <Typography variant="body2"><strong>Sample Size:</strong> {sample.sampleSize || 'N/A'}</Typography>
                      <Typography variant="body2"><strong>Result:</strong> {sample.result || 'N/A'}</Typography>
                      <Typography variant="body2"><strong>Status:</strong> {sample.status || 'N/A'}</Typography>
                      <Typography variant="body2"><strong>Reason:</strong> {sample.reason?.toString() || 'N/A'}</Typography>
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
