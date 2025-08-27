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
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import { authClient } from '@/lib/auth/client';
import dayjs from 'dayjs';
import PrintIcon from '@mui/icons-material/Print';
import { printElementById } from '@/lib/print';

interface ShaftLoanDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  minerId: string | null;
}

export function DriverDetailsDialog({ open, onClose, minerId }: ShaftLoanDetailsDialogProps): React.JSX.Element {
  const [assignment, setAssignment] = React.useState<any>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<string>('');
  const [reason, setReason] = React.useState<string>('');
  const [showReasonField, setShowReasonField] = React.useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  // Fetch shaft assignment details by miner when dialog opens
  React.useEffect(() => {
    if (open && minerId) {
      setLoading(true);
      setError(null);
      authClient.fetchShaftAssignmentsByMiner(minerId)
        .then((data) => {
          if (data) {
            const item = Array.isArray(data) ? (data[0] ?? null) : data;
            if (item) {
              setAssignment(item);
            } else {
              setError('No shaft assignment found for this miner');
            }
          } else {
            setError('Failed to load shaft assignment details');
          }
        })
        .catch((err) => {
          console.error('Error fetching shaft assignment details:', err);
          setError('An error occurred while loading details');
        })
        .finally(() => setLoading(false));
    }
  }, [open, minerId]);

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setShowReasonField(newStatus === 'REJECTED' || newStatus === 'PUSHED_BACK');
  };

  const refreshAssignment = async () => {
    if (!minerId) return;
    try {
      const data = await authClient.fetchShaftAssignmentsByMiner(minerId);
      const item = Array.isArray(data) ? (data[0] ?? null) : data;
      setAssignment(item);
    } catch (e) {
      // no-op
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!status || !assignment?.id) return;
    setIsSubmitting(true);
    try {
      switch (status) {
        case 'APPROVED':
          await authClient.approveShaftLoan(assignment.id);
          break;
        case 'REJECTED':
          if (!reason) {
            alert('Please provide a reason for rejection');
            setIsSubmitting(false);
            return;
          }
          await authClient.rejectShaftLoan(assignment.id, reason);
          break;
        case 'PUSHED_BACK':
          if (!reason) {
            alert('Please provide a reason for pushing back');
            setIsSubmitting(false);
            return;
          }
          await authClient.pushBackShaftLoan(assignment.id, reason);
          break;
        default:
          throw new Error(`Unsupported status: ${status}`);
      }
      await refreshAssignment();
      onClose();
    } catch (err) {
      alert(`Failed to update status to ${status}. Please try again.`);
    } finally {
      setIsSubmitting(false);
      setStatus('');
      setReason('');
      setShowReasonField(false);
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
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          bgcolor: '#15073d'
        }}
      >
        <Typography variant="subtitle1" component="span" sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>Shaft Assignment Details</Typography>
        <Box sx={{ display: 'flex' }}>
          <IconButton onClick={() => printElementById('shaftloan-details-printable', 'Shaft Assignment Details')} size="small" sx={{ mr: 1, color: '#9e9e9e' }}>
            <PrintIcon />
          </IconButton>
          <IconButton aria-label="close" onClick={onClose} size="small" sx={{ color: '#9e9e9e' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
        ) : assignment ? (
          <Box sx={{ mt: 2 }} id="shaftloan-details-printable">
            {/* Basic Info */}
            <Box sx={{ mb: 2, border: '1px solid #000080', borderRadius: '8px', p: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#FF8F00', fontWeight: 'bold', mb: 1 }}>Basic Information</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{assignment.sectionName || 'Section'}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Status: {assignment.status || 'N/A'}</Typography>
              </Box>
            </Box>

            {/* Assignment Fields */}
            <Box sx={{ mb: 2, border: '1px solid #000080', borderRadius: '8px', p: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#FF8F00', fontWeight: 'bold', mb: 2 }}>Assignment Information</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Section Name</Typography>
                  <Typography variant="body1">{assignment.sectionName || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Shaft Numbers</Typography>
                  <Typography variant="body1">{assignment.shaftNumbers || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Medical Fee</Typography>
                  <Typography variant="body1">{assignment.medicalFee ?? 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Registration Fee</Typography>
                  <Typography variant="body1">{assignment.regFee ?? 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Operation Status</Typography>
                  <Typography variant="body1">{assignment.operationStatus ? 'Operational' : 'Not Operational'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Typography variant="body1">{assignment.status || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Start Contract Date</Typography>
                  <Typography variant="body1">{formatDate(assignment.startContractDate)}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">End Contract Date</Typography>
                  <Typography variant="body1">{formatDate(assignment.endContractDate)}</Typography>
                </Box>
              </Box>
            </Box>

            {/* Loans */}
            <Box sx={{ mb: 2, border: '1px solid #000080', borderRadius: '8px', p: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#FF8F00', fontWeight: 'bold', mb: 2 }}>Loans</Typography>
              {Array.isArray(assignment.loans) && assignment.loans.length > 0 ? (
                <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  {assignment.loans.map((loan: any) => (
                    <Box key={loan.id} sx={{ p: 2, borderBottom: '1px solid #eee' }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>{loan.loanName || 'Loan'}</Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Payment Method</Typography>
                          <Typography variant="body1">{loan.paymentMethod || 'N/A'}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Amount/Grams</Typography>
                          <Typography variant="body1">{loan.amountOrGrams ?? 'N/A'}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Purpose</Typography>
                          <Typography variant="body1">{loan.purpose || 'N/A'}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Payment Status</Typography>
                          <Typography variant="body1">{loan.paymentStatus || 'N/A'}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Status</Typography>
                          <Typography variant="body1">{loan.status || 'N/A'}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Reason</Typography>
                          <Typography variant="body1">{loan.reason || 'N/A'}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">No loans available</Typography>
              )}
            </Box>

            {/* Additional space at the bottom */}
            <Box sx={{ height: 20 }} />
          </Box>
        ) : (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', my: 4 }}>
            No shaft assignment information available
          </Typography>
        )}
      </DialogContent>
      
     

      
    </Dialog>
  );
}
