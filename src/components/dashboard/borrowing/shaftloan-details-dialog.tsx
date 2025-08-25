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
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { authClient } from '@/lib/auth/client';
import dayjs from 'dayjs';

interface ShaftLoanDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  minerId: string | null;
}

export function DriverDetailsDialog({ open, onClose, minerId }: ShaftLoanDetailsDialogProps): React.JSX.Element {
  const [assignment, setAssignment] = React.useState<any>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch shaft assignment details by miner when dialog opens
  React.useEffect(() => {
    if (open && minerId) {
      setLoading(true);
      setError(null);
      authClient.fetchShaftAssignmentsByMiner(minerId)
        .then((data) => {
          if (data) {
            setAssignment(data);
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
        Shaft Assignment Details
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
        ) : assignment ? (
          <Box sx={{ mt: 2 }}>
            {/* Basic Info */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">{assignment.sectionName || 'Section'}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Status: {assignment.status || 'N/A'}</Typography>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            {/* Assignment Fields */}
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Assignment Information
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
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

            {/* Loans */}
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Loans
            </Typography>
            {Array.isArray(assignment.loans) && assignment.loans.length > 0 ? (
              <Box sx={{ border: '1px solid #eee', borderRadius: 1 }}>
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
            
            {/* Additional space at the bottom */}
            <Box sx={{ height: 20 }} />
          </Box>
        ) : (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', my: 4 }}>
            No shaft assignment information available
          </Typography>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 0, display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onClose} color="primary">Close</Button>
      </DialogActions>

      
    </Dialog>
  );
}
