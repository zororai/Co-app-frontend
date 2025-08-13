'use client';

import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import { authClient } from '@/lib/auth/client';

interface CustomerDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  customer: any | null;
  onRefresh?: () => void; // Optional callback to refresh the table data
}

export function SecurityDetailsDialog({ open, onClose, customer, onRefresh }: CustomerDetailsDialogProps): React.JSX.Element | null {
  const [status, setStatus] = React.useState<string>('');
  const [reason, setReason] = React.useState<string>('');
  const [showReasonField, setShowReasonField] = React.useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  if (!customer) return null;

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setShowReasonField(newStatus === 'REJECTED' || newStatus === 'PUSHED_BACK');
  };

  const handleSubmit = async (): Promise<void> => {
    if (!status) return;
 if(status === 'REJECTED' || status === 'APPROVED' ) {
    
    }
    setIsSubmitting(true);
    try {
      switch (status) {
        case 'APPROVED':
          await authClient.setMinerForApproval(customer.id);
          break;
        case 'REJECTED':
          if (!reason) {
            alert('Please provide a reason for rejection');
            setIsSubmitting(false);
            return;
          }
          await authClient.setMinerForRejection(customer.id, reason);
          break;
        case 'PUSHED_BACK':
          if (!reason) {
            alert('Please provide a reason for pushing back');
            setIsSubmitting(false);
            return;
          }
          await authClient.setMinerForPushBack(customer.id, reason);
          break;
        default:
          throw new Error(`Unsupported status: ${status}`);
      }

      // Close the dialog after successful update
      onClose();

      // Refresh the table data if onRefresh callback is provided
      if (onRefresh) {
        onRefresh();
      }

      // Force a full page reload
      window.location.reload();
    } catch (error) {
      console.error(`Error updating status to ${status}:`, error);
      alert(`Failed to update status to ${status}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 2
        }}
      >
        <Typography variant="subtitle1" component="span">Miner Details</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2 }}>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
            gap: 2 
          }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Personal Information
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography><strong>Name:</strong> {customer.name}</Typography>
                <Typography><strong>Surname:</strong> {customer.surname}</Typography>
                <Typography><strong>ID Number:</strong> {customer.nationIdNumber}</Typography>
                <Typography><strong>Address:</strong> {customer.address}</Typography>
                <Typography><strong>Phone:</strong> {customer.cellNumber}</Typography>
                <Typography><strong>Position:</strong> {customer.position}</Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Miner Information
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography><strong>Cooperative Name:</strong> {customer.cooperativeName}</Typography>
                <Typography><strong>Number of Shafts:</strong> {customer.numShafts}</Typography>
                <Typography>
                  <strong>Status:</strong> 
                  <Box 
                    component="span" 
                    sx={{
                      display: 'inline-block',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      ml: 1,
                      bgcolor: customer.status === 'APPROVED' ? 'success.light' : 'error.light',
                      color: customer.status === 'APPROVED' ? 'success.main' : 'error.main',
                    }}
                  >
                    {customer.status}
                  </Box>
                </Typography>
              </Box>
            </Box>
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="text.secondary">
                ID Picture
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                {customer.idPicture && (
                  <Box
                    component="img"
                    src={customer.idPicture}
                    alt="ID Picture"
                    sx={{
                      maxWidth: '100%',
                      height: 'auto',
                      maxHeight: '200px',
                      borderRadius: 1,
                      border: '1px solid #e0e0e0'
                    }}
                  />
                )}
              </Box>
            </Box>

            {customer.teamMembers && customer.teamMembers.length > 0 && (
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Team Members
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {customer.teamMembers.map((member: any, index: number) => (
                    <Box 
                      key={index} 
                      sx={{ 
                        mb: 2,
                        p: 2,
                        border: '1px solid #e0e0e0',
                        borderRadius: 1,
                        bgcolor: 'background.paper'
                      }}
                    >
                      <Typography><strong>Name:</strong> {member.name}</Typography>
                      <Typography><strong>Surname:</strong> {member.surname}</Typography>
                      <Typography><strong>Address:</strong> {member.address}</Typography>
                      <Typography><strong>ID Number:</strong> {member.idNumber}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {customer.reason && (
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Additional Information
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography><strong>Reason:</strong> {customer.reason}</Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, flexDirection: 'column', alignItems: 'stretch' }}>
        {showReasonField && (
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
            error={showReasonField && !reason}
            helperText={showReasonField && !reason ? 'Reason is required' : ''}
          />
        )}
        {((!customer.status || (customer.status !== 'REJECTED' && customer.status !== 'APPROVED')) &&
          (status !== 'REJECTED' && status !== 'APPROVED')) && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button 
              onClick={() => handleStatusChange('APPROVED')}
              variant={status === 'APPROVED' ? 'contained' : 'outlined'}
              color="success"
              disabled={isSubmitting}
              sx={{ minWidth: '120px' }}
            >
              Approve
            </Button>
            <Button 
              onClick={() => handleStatusChange('PUSHED_BACK')}
              variant={status === 'PUSHED_BACK' ? 'contained' : 'outlined'}
              color="warning"
              disabled={isSubmitting}
              sx={{ minWidth: '120px' }}
            >
              Push Back
            </Button>
            <Button 
              onClick={() => handleStatusChange('REJECTED')}
              variant={status === 'REJECTED' ? 'contained' : 'outlined'}
              color="error"
              disabled={isSubmitting}
              sx={{ minWidth: '120px' }}
            >
              Reject
            </Button>
          </Box>
        )}
        {status && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button 
              onClick={handleSubmit}
              variant="contained"
              color="primary"
              disabled={isSubmitting || (showReasonField && !reason)}
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
              sx={{ 
                minWidth: '200px',
                bgcolor: '#5f4bfa',
                '&:hover': { bgcolor: '#4d3fd6' }
              }}
            >
              {isSubmitting ? 'Submitting...' : `Submit ${status.toLowerCase()} status`}
            </Button>
          </Box>
        )}
      </DialogActions>
    </Dialog>
  );
}
