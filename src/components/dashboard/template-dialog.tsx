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
import Chip from '@mui/material/Chip';
import { authClient } from '@/lib/auth/client';

interface TemplateDialogProps {
  open: boolean;
  onClose: () => void;
  itemId: string | null;
  onRefresh?: () => void; // Optional callback to refresh data after action
}

export function TemplateDialog({ open, onClose, itemId, onRefresh }: TemplateDialogProps): React.JSX.Element {
  const [details, setDetails] = React.useState<any>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');
  const [actionLoading, setActionLoading] = React.useState<boolean>(false);
  const [actionError, setActionError] = React.useState<string>('');
  const [actionSuccess, setActionSuccess] = React.useState<string>('');
  const [reason, setReason] = React.useState<string>('');
  const [status, setStatus] = React.useState<string>('');
  const [showReasonField, setShowReasonField] = React.useState<boolean>(false);
  const [actionType, setActionType] = React.useState<'reject' | 'pushback' | 'approve' | null>(null);

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

  // Fetch details when dialog opens
  React.useEffect(() => {
    const fetchDetails = async () => {
      if (!itemId) return;
      
      setLoading(true);
      setError('');
      try {
        // Replace with your actual fetch method
        const fetchedDetails = await authClient.fetchDetails(itemId);
        setDetails(fetchedDetails);
      } catch (error_) {
        console.error('Error fetching details:', error_);
        setError('Failed to load details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (open && itemId) {
      fetchDetails();
    } else {
      // Reset state when dialog closes
      setDetails(null);
      setError('');
    }
  }, [open, itemId]);
  
  // Cancel action
  const cancelAction = () => {
    setShowReasonField(false);
    setReason('');
    setActionType(null);
    setActionError('');
  };

  // Handle action (approve/reject/pushback)
  const handleAction = async () => {
    if (!actionType || !reason.trim() || !itemId || !status) return;
    
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');
    
    try {
      let result;
      
      // Call the appropriate API method based on actionType
      switch (actionType) {
      case 'approve': {
        result = await authClient.approveItem(itemId);
      
      break;
      }
      case 'reject': {
        result = await authClient.rejectItem(itemId, reason);
      
      break;
      }
      case 'pushback': {
        result = await authClient.pushbackItem(itemId, reason);
      
      break;
      }
      // No default
      }
      
      // Check if the API call was successful
      if (result && result.success) {
        // Different success messages based on action type
        let actionMessage = '';
        switch (actionType) {
        case 'approve': {
          actionMessage = 'approved';
        
        break;
        }
        case 'reject': {
          actionMessage = 'rejected';
        
        break;
        }
        case 'pushback': {
          actionMessage = 'pushed back';
        
        break;
        }
        // No default
        }
        
        setActionSuccess(`Item has been ${actionMessage} successfully.`);
        setShowReasonField(false);
        
        // Refresh parent component if callback provided
        if (onRefresh) {
          onRefresh();
        }
      } else {
        throw new Error(result?.error || 'Operation failed');
      }
    } catch (error_) {
      console.error(`Error updating status:`, error_);
      setActionError(`Failed to update status: ${error_ instanceof Error ? error_.message : 'Please try again.'}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Don't render the dialog content if it's not open
  if (!open) {
    return <Dialog open={false} onClose={onClose} maxWidth="md" fullWidth />;
  }
  
  // If the dialog is open but there's no data, show a loading state
  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            p: 2,
            fontSize: '1.25rem', 
            fontWeight: 600,
            borderBottom: '1px solid #e0e0e0'
          }}
        >
          <Typography variant="subtitle1" component="span">Item Details</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress size={40} />
            <Typography variant="body1" sx={{ ml: 2 }}>Loading details...</Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            p: 2,
            fontSize: '1.25rem', 
            fontWeight: 600,
            borderBottom: '1px solid #e0e0e0'
          }}
        >
          <Typography variant="subtitle1" component="span">Item Details</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', color: 'error.main', py: 4 }}>
            <Typography>{error}</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

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
          fontSize: '1.25rem', 
          fontWeight: 600,
          borderBottom: '1px solid #e0e0e0'
        }}
      >
        <Typography variant="subtitle1" component="span">Item Details / Make Decision</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ py: 3 }}>
        {details && (
          <Box sx={{ p: 2 }}>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
              gap: 3 
            }}>
              {/* Section 1 */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 2 }}>
                  Basic Information
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <DetailItem label="Name" value={details.name || 'N/A'} />
                  <DetailItem label="Type" value={details.type || 'N/A'} />
                  <DetailItem label="Status" value={details.status || 'N/A'} />
                  <DetailItem label="Date" value={details.date ? new Date(details.date).toLocaleDateString() : 'N/A'} />
                </Box>
              </Box>
              
              {/* Section 2 */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 2 }}>
                  Additional Information
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <DetailItem label="Category" value={details.category || 'N/A'} />
                  <DetailItem label="Amount" value={details.amount?.toString() || 'N/A'} />
                  <DetailItem label="Reference" value={details.reference || 'N/A'} />
                </Box>
              </Box>
              
              {/* Full width section */}
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 2 }}>
                  Description
                </Typography>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: '#f5f5f5', 
                  borderRadius: 1,
                  whiteSpace: 'pre-wrap'
                }}>
                  <Typography variant="body2">{details.description || 'No description available'}</Typography>
                </Box>
              </Box>
              
              {/* Tags/Categories section */}
              {details.tags && details.tags.length > 0 && (
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 2 }}>
                    Tags
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {details.tags.map((tag: string, index: number) => (
                      <Chip 
                        key={index}
                        label={tag}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              )}
              
              {/* Reason section if available */}
              {details.reason && (
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 2 }}>
                    Previous Decision Reason
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">{details.reason}</Typography>
                  </Box>
                </Box>
              )}
            </Box>
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
      
      {/* Reason input field for approve/reject/pushback */}
      {showReasonField && (
        <Box sx={{ px: 3, pb: 2 }}>
          <TextField
            label={actionType === 'approve' ? 'Approval Comment' : 'Reason'}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            fullWidth
            multiline
            rows={3}
            required
            error={actionType !== null && reason.trim() === ''}
            helperText={actionType !== null && reason.trim() === '' ? 
              `Please provide a ${actionType === 'approve' ? 'comment for approval' : 
                actionType === 'reject' ? 'reason for rejection' : 'reason for pushing back'}` : ''}
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
              onClick={handleAction}
              variant="contained"
              color="primary"
              disabled={actionLoading || reason.trim() === ''}
              sx={{ 
                bgcolor: actionType === 'reject' ? '#d32f2f' : 
                        actionType === 'approve' ? '#2e7d32' : '#ed6c02', 
                '&:hover': { 
                  bgcolor: actionType === 'reject' ? '#b71c1c' : 
                           actionType === 'approve' ? '#1b5e20' : '#e65100' 
                } 
              }}
            >
              {actionLoading ? 'Processing...' : 
               actionType === 'reject' ? 'Confirm Reject' : 
               actionType === 'approve' ? 'Confirm Approve' : 'Confirm Push Back'}
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
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              onClick={() => {
                setActionType('approve');
                setStatus('APPROVED');
                setShowReasonField(true);
              }}
              variant="contained"
              color="success"
              disabled={actionLoading || (details?.status === 'APPROVED')}
              sx={{ minWidth: '120px' }}
            >
              Approve
            </Button>
            <Button
              onClick={() => {
                setActionType('pushback');
                setStatus('PUSHED_BACK');
                setShowReasonField(true);
              }}
              variant="contained"
              color="warning"
              disabled={actionLoading || (details?.status === 'PUSHED_BACK')}
              sx={{ minWidth: '120px' }}
            >
              Push Back
            </Button>
            <Button
              onClick={() => {
                setActionType('reject');
                setStatus('REJECTED');
                setShowReasonField(true);
              }}
              variant="contained"
              color="error"
              disabled={actionLoading || (details?.status === 'REJECTED')}
              sx={{ minWidth: '120px' }}
            >
              Reject
            </Button>
          </Box>
        </DialogActions>
      )}
    </Dialog>
  );
}

// Helper component for displaying detail items
function DetailItem({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#666' }}>{label}</Typography>
      <Typography variant="body1">{value}</Typography>
    </Box>
  );
}
