 

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
import PrintIcon from '@mui/icons-material/Print';
import { printElementById } from '@/lib/print';

interface ProductionLoanDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string | null;
  onRefresh?: () => void; // Optional callback to refresh data after action
}

export function ProductionLoanDetailsDialog({ open, onClose, userId, onRefresh }: ProductionLoanDetailsDialogProps): React.JSX.Element {
  const [loanDetails, setLoanDetails] = React.useState<any>(null);
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

  // Fetch production loan details when dialog opens
  React.useEffect(() => {
    const fetchProductionloanDetails = async () => {
      if (!userId) return;
      
      setLoading(true);
      setError('');
      try {
        const details = await authClient.fetchProductionloanDetails(userId);
        setLoanDetails(details);
      } catch (error_) {
        console.error('Error fetching production loan details:', error_);
        setError('Failed to load production loan details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (open && userId) {
      fetchProductionloanDetails();
    } else {
      // Reset state when dialog closes
      setLoanDetails(null);
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

  // Handle action (approve/reject/pushback)
  const handleAction = async () => {
    if (!actionType || !userId) return;
    
    // For reject and pushback, we need a reason
    if ((actionType === 'reject' || actionType === 'pushback') && !reason.trim()) return;
    
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');
    
    try {
      let result;
      
      // Call the appropriate API method based on actionType
      switch (actionType) {
      case 'approve': {
        result = await authClient.approveProductionLoan(userId);
      
      break;
      }
      case 'reject': {
        result = await authClient.rejectProductionLoan(userId, reason);
      
      break;
      }
      case 'pushback': {
        result = await authClient.pushbackProductionLoan(userId, reason);
      
      break;
      }
      // No default
      }
      
      // Check if the API call was successful
      if (result && result.success) {
        // Different success messages based on action type
        let successMessage = '';
        switch (actionType) {
        case 'approve': {
          successMessage = 'Production Loan has been approved successfully. The loan is now ready for processing.';
        
        break;
        }
        case 'reject': {
          successMessage = 'Production Loan has been rejected. The applicant will be notified of this decision.';
        
        break;
        }
        case 'pushback': {
          successMessage = 'Production Loan has been pushed back for further review. The applicant will be asked to provide additional information.';
        
        break;
        }
        // No default
        }
        
        setActionSuccess(successMessage);
        setShowReasonField(false);
        
        // Update the loan details to reflect the new status
        if (loanDetails) {
          setLoanDetails({
            ...loanDetails,
            status: actionType === 'approve' ? 'APPROVED' : 
                    actionType === 'reject' ? 'REJECTED' : 'PUSHED_BACK',
            reason: reason || loanDetails.reason
          });
        }
        
        // Refresh parent component if callback provided
        if (onRefresh) {
          setTimeout(() => {
            onRefresh();
          }, 1000); // Small delay to ensure UI updates first
        }
      } else {
        throw new Error(result?.error || 'Operation failed');
      }
    } catch (error_) {
      console.error(`Error updating production loan status:`, error_);
      setActionError(`Failed to update production loan status: ${error_ instanceof Error ? error_.message : 'Please try again.'}`);
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
            bgcolor: 'secondary.main',
            color: 'white'
          }}
        >
          <Typography variant="h6" component="span" sx={{ color: 'white', fontWeight: 600 }}>
            Production Loan Details
          </Typography>
          <Box>
            <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
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
            bgcolor: 'secondary.main',
            color: 'white'
          }}
        >
          <Typography variant="h6" component="span" sx={{ color: 'white', fontWeight: 600 }}>
            Production Loan Details
          </Typography>
          <Box>
            <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', color: 'error.main', py: 4 }}>
            <Typography>{error}</Typography>
          </Box>
        </DialogContent>
      
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
            bgcolor: 'secondary.main',
            color: 'white'
          }}
        >
          <Typography variant="h6" component="span" sx={{ color: 'white', fontWeight: 600 }}>
            Production Loan Details / Make Decision
          </Typography>
          <Box>
            <IconButton onClick={() => printElementById('production-loanstatus-printable')} size="small" sx={{ color: 'white', mr: 1 }}>
              <PrintIcon />
            </IconButton>
            <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
      <DialogContent sx={{ py: 3 }}>
        <Box id="production-loanstatus-printable">
        {loanDetails && (
          <Box sx={{ p: 2 }}>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
              gap: 3 
            }}>
              {/* Section 1: Basic Information */}
              <Box sx={{ p: 2, border: '1px solid #000080', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 2 }}>
                  Loan Information
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <DetailItem label="Loan Name" value={loanDetails.loanName || 'N/A'} />
                  <DetailItem label="Payment Method" value={loanDetails.paymentMethod || 'N/A'} />
                  <DetailItem label="Amount/Grams" value={loanDetails.amountOrGrams?.toString() || 'N/A'} />
                  <DetailItem label="Date" value={loanDetails.date ? new Date(loanDetails.date).toLocaleDateString() : 'N/A'} />
                </Box>
              </Box>
              
              {/* Section 2: Status Information */}
              <Box sx={{ p: 2, border: '1px solid #000080', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 2 }}>
                  Status Information
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#666' }}>Status</Typography>
                    <Chip 
                      label={loanDetails.status || 'N/A'}
                      color={loanDetails.status === 'APPROVED' ? 'success' : 
                             loanDetails.status === 'REJECTED' ? 'error' : 
                             loanDetails.status === 'PUSHED_BACK' ? 'warning' : 'default'}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                  <DetailItem label="Reason" value={loanDetails.reason || 'N/A'} />
                </Box>
              </Box>
              
              {/* Purpose Details - Full width section */}
              {loanDetails.purpose && (
                <Box sx={{ gridColumn: '1 / -1', p: 2, border: '1px solid #000080', borderRadius: 1 }}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 2 }}>
                    Purpose Details
                  </Typography>
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: '#f5f5f5', 
                    borderRadius: 1,
                    whiteSpace: 'pre-wrap'
                  }}>
                    <Typography variant="body2">{loanDetails.purpose}</Typography>
                  </Box>
                </Box>
              )}
              
              {/* Tax Information - Full width section */}
              {loanDetails.tax && loanDetails.tax.length > 0 && (
                <Box sx={{ gridColumn: '1 / -1', p: 2, border: '1px solid #000080', borderRadius: 1 }}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 2 }}>
                    Tax Information
                  </Typography>
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: '#f5f5f5', 
                    borderRadius: 1
                  }}>
                    {loanDetails.tax.map((taxItem: any, index: number) => (
                      <Box key={index} sx={{ 
                        mb: index < loanDetails.tax.length - 1 ? 2 : 0,
                        p: 2,
                        border: '1px solid #e0e0e0',
                        borderRadius: 1,
                        bgcolor: 'white'
                      }}>
                        <Typography variant="body2" sx={{ mb: 0.5 }}><strong>Tax Type:</strong> {taxItem.taxType || 'N/A'}</Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}><strong>Amount:</strong> {taxItem.amount || 'N/A'}</Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}><strong>Location:</strong> {taxItem.location || 'N/A'}</Typography>
                        <Typography variant="body2"><strong>Description:</strong> {taxItem.description || 'N/A'}</Typography>                   
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        )}
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
            <Alert 
              severity="success" 
              sx={{ mb: 2 }}
              action={
                <Button color="inherit" size="small" onClick={onClose}>
                  Close
                </Button>
              }
            >
              {actionSuccess}
            </Alert>
          )}
        </Box>
      )}
      
      {/* Reason input field for approve/reject/pushback */}
      {showReasonField && (
        <DialogActions sx={{ p: 3, flexDirection: 'column', alignItems: 'stretch' }}>
          <TextField
            label="Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            rows={3}
            sx={{ mb: 2 }}
            required
            error={!reason.trim() && actionType !== 'approve'}
            helperText={!reason.trim() && actionType !== 'approve' ? 'Reason is required' : ''}
            disabled={actionLoading}
          />
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            
            <Button 
              onClick={handleAction} 
              variant="contained" 
              color="primary"
              disabled={actionLoading || (!reason.trim() && actionType !== 'approve')}
              startIcon={actionLoading ? <CircularProgress size={20} color="inherit" /> : null}
              sx={{ 
                minWidth: '200px',
                bgcolor: '#5f4bfa',
                '&:hover': { bgcolor: '#4d3fd6' }
              }}
            >
              {actionLoading ? 'Processing...' : 
               actionType === 'reject' ? 'Confirm Reject' : 
               actionType === 'approve' ? 'Confirm Approve' : 'Confirm Push Back'}
            </Button>
          </Box>
        </DialogActions>
      )}
      
      {/* Action buttons - only show if status is PENDING */}
      {!showReasonField && loanDetails?.status === 'PENDING' && (
        <DialogActions sx={{ p: 3, flexDirection: 'column', alignItems: 'stretch' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button
              onClick={() => {
                setActionType('approve');
                setStatus('APPROVED');
                // For approve, we'll show a default reason if none provided
                setReason('Loan approved after review');
                // Direct approval without showing reason field
                handleAction();
              }}
              variant="outlined"
              color="success"
              disabled={actionLoading}
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
              variant="outlined"
              color="warning"
              disabled={actionLoading}
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
              variant="outlined"
              color="error"
              disabled={actionLoading}
              sx={{ minWidth: '120px' }}
            >
              Reject
            </Button>
          </Box>
        </DialogActions>
      )}
      
      {/* Show a message when status is not PENDING */}
  
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
