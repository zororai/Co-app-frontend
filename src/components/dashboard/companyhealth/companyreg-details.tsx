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

export function MinerDetailsDialog({ open, onClose, customer, onRefresh }: CustomerDetailsDialogProps): React.JSX.Element | null {
  const [status, setStatus] = React.useState<string>('');
  const [reason, setReason] = React.useState<string>('');
  const [showReasonField, setShowReasonField] = React.useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  if (!customer) return null;

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    setShowReasonField(newStatus === 'REJECTED' || newStatus === 'PUSHED_BACK');
    // If REJECTED or PUSHED_BACK, require reason before submitting
    if (newStatus === 'REJECTED' || newStatus === 'PUSHED_BACK') {
      // Only show reason field, do not submit yet
      return;
    }
    // For APPROVED, submit immediately
    await handleSubmit(newStatus);
  };

  const handleSubmit = async (submitStatus?: string): Promise<void> => {
    const actionStatus = submitStatus || status;
    if (!actionStatus) return;
    if ((actionStatus === 'REJECTED' || actionStatus === 'PUSHED_BACK') && !reason) {
      alert('Please provide a reason.');
      return;
    }
    setIsSubmitting(true);
    try {
      switch (actionStatus) {
        case 'APPROVED': {
          await authClient.setCompanyMinerForApproval(customer.id);
          break;
        }
        case 'REJECTED': {
          await authClient.setCompanyMinerForRejection(customer.id, reason);
          break;
        }
        case 'PUSHED_BACK': {
          await authClient.setCompanyMinerForPushBack(customer.id, reason);
          break;
        }
        default: {
          throw new Error(`Unsupported status: ${actionStatus}`);
        }
      }
      onClose();
      
      // If you want to call onRefresh instead of reload, comment out the above and uncomment below:
       if (onRefresh) {
         onRefresh();
       }
    } catch (error) {
      console.error(`Error updating status to ${actionStatus}:`, error);
      alert(`Failed to update status to ${actionStatus}. Please try again.`);
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
        <Typography variant="subtitle1" component="span">Company Details</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2 }}>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
            gap: 3 
          }}>
            {/* Company Information */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                Company Information
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography><strong>Company Name:</strong> {customer.companyName || 'N/A'}</Typography>
                <Typography><strong>Registration Number:</strong> {customer.registrationNumber || 'N/A'}</Typography>
                <Typography><strong>Address:</strong> {customer.address || 'N/A'}</Typography>
                <Typography><strong>Phone Number:</strong> {customer.cellNumber || 'N/A'}</Typography>
                <Typography><strong>Email:</strong> {customer.email || 'N/A'}</Typography>
                <Typography><strong>Number of Shafts:</strong> {customer.shaftnumber || 'N/A'}</Typography>
              </Box>
            </Box>
            
            {/* Owner Information */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                Owner Information
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography><strong>Owner Name:</strong> {customer.ownerName || 'N/A'}</Typography>
                <Typography><strong>Owner Surname:</strong> {customer.ownerSurname || 'N/A'}</Typography>
                <Typography><strong>Owner ID Number:</strong> {customer.ownerIdNumber || 'N/A'}</Typography>
                <Typography><strong>Owner Address:</strong> {customer.ownerAddress || 'N/A'}</Typography>
                <Typography><strong>Owner Phone:</strong> {customer.ownerCellNumber || 'N/A'}</Typography>
              </Box>
            </Box>
            
            {/* Status */}
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                Application Status
              </Typography>
              <Typography>
                <strong>Status:</strong> 
                <Box 
                  component="span" 
                  sx={{
                    display: 'inline-block',
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                    ml: 1,
                    bgcolor: customer.status === 'APPROVED' ? '#d0f5e8' : 
                             customer.status === 'REJECTED' ? '#ffebee' : 
                             customer.status === 'PUSHED_BACK' ? '#fff3e0' : '#f5f5f5',
                    color: customer.status === 'APPROVED' ? '#1b5e20' : 
                           customer.status === 'REJECTED' ? '#c62828' : 
                           customer.status === 'PUSHED_BACK' ? '#e65100' : '#666',
                    fontWeight: 500,
                    fontSize: '0.875rem'
                  }}
                >
                  {customer.status || 'PENDING'}
                </Box>
              </Typography>
            </Box>
            {/* Company Documents */}
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                Company Documents
              </Typography>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, 
                gap: 2 
              }}>
                {/* Company Logo */}
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>Company Logo</Typography>
                  {customer.companyLogo ? (
                    <Box
                      component="img"
                      src={customer.companyLogo}
                      alt="Company Logo"
                      sx={{
                        width: '100%',
                        height: '120px',
                        objectFit: 'contain',
                        borderRadius: 1,
                        border: '1px solid #e0e0e0',
                        bgcolor: '#fafafa'
                      }}
                    />
                  ) : (
                    <Box sx={{ 
                      width: '100%', 
                      height: '120px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      border: '1px dashed #ccc',
                      borderRadius: 1,
                      color: 'text.secondary'
                    }}>
                      No logo uploaded
                    </Box>
                  )}
                </Box>
                
                {/* Passport Photo */}
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>Owner Passport Photo</Typography>
                  {customer.passportPhoto ? (
                    <Box
                      component="img"
                      src={customer.passportPhoto}
                      alt="Passport Photo"
                      sx={{
                        width: '100%',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: 1,
                        border: '1px solid #e0e0e0'
                      }}
                    />
                  ) : (
                    <Box sx={{ 
                      width: '100%', 
                      height: '120px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      border: '1px dashed #ccc',
                      borderRadius: 1,
                      color: 'text.secondary'
                    }}>
                      No photo uploaded
                    </Box>
                  )}
                </Box>
              </Box>
              
              {/* Document Links */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 2 }}>Required Documents</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1 }}>
                  <Typography>
                    <strong>Certificate of Cooperation:</strong> 
                    {customer.certificateOfCooperation ? (
                      <Box component="span" sx={{ color: 'success.main', ml: 1 }}>✓ Uploaded</Box>
                    ) : (
                      <Box component="span" sx={{ color: 'error.main', ml: 1 }}>✗ Not uploaded</Box>
                    )}
                  </Typography>
                  <Typography>
                    <strong>CR14 Copy:</strong> 
                    {customer.cr14Copy ? (
                      <Box component="span" sx={{ color: 'success.main', ml: 1 }}>✓ Uploaded</Box>
                    ) : (
                      <Box component="span" sx={{ color: 'error.main', ml: 1 }}>✗ Not uploaded</Box>
                    )}
                  </Typography>
                  <Typography>
                    <strong>Mining Certificate:</strong> 
                    {customer.miningCertificate ? (
                      <Box component="span" sx={{ color: 'success.main', ml: 1 }}>✓ Uploaded</Box>
                    ) : (
                      <Box component="span" sx={{ color: 'error.main', ml: 1 }}>✗ Not uploaded</Box>
                    )}
                  </Typography>
                  <Typography>
                    <strong>Tax Clearance:</strong> 
                    {customer.taxClearance ? (
                      <Box component="span" sx={{ color: 'success.main', ml: 1 }}>✓ Uploaded</Box>
                    ) : (
                      <Box component="span" sx={{ color: 'error.main', ml: 1 }}>✗ Not uploaded</Box>
                    )}
                  </Typography>
                </Box>
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
        {/* Only show submit for REJECTED or PUSHED_BACK after reason is entered */}
        {(status === 'REJECTED' || status === 'PUSHED_BACK') && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button 
              onClick={() => handleSubmit()}
              variant="contained"
              color="primary"
              disabled={isSubmitting || !reason}
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
