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
import Chip from '@mui/material/Chip';
import { authClient } from '@/lib/auth/client';

interface CustomerDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  customer: any | null;
  onRefresh?: () => void; // Optional callback to refresh the table data
}

export function SecurityDetailsDialog({ open, onClose, customer, onRefresh }: CustomerDetailsDialogProps): React.JSX.Element  {
  const [status, setStatus] = React.useState<string>('');
  const [reason, setReason] = React.useState<string>('');
  const [showReasonField, setShowReasonField] = React.useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  
  // Don't render the dialog content if it's not open
  if (!open) {
    return <Dialog open={false} onClose={onClose} maxWidth="md" fullWidth />;
  }
  
  // If the dialog is open but there's no customer data, show a loading state
  if (!customer) {
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
        <Typography variant="subtitle1" component="span">Security Company Details</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>Loading company details...</Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
      </Dialog>
    );
  }
  
  // Now we can safely access customer properties as we've confirmed customer is not null
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
        <Typography variant="subtitle1" component="span">Security Company Details</Typography>
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
                Company Information
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography><strong>Company Name:</strong> {customer.companyName}</Typography>
                <Typography><strong>Registration Number:</strong> {customer.registrationNumber}</Typography>
                <Typography><strong>Service Type:</strong> {customer.serviceType}</Typography>
                <Typography><strong>Number of Workers:</strong> {customer.numberOfWorks}</Typography>
                <Typography><strong>Status:</strong> 
                  <Box 
                    component="span" 
                    sx={{
                      display: 'inline-block',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      ml: 1,
                      bgcolor: customer.status === 'APPROVED' ? '#C8E6C9' : 
                               customer.status === 'REJECTED' ? '#FFCDD2' : 
                               customer.status === 'PENDING' ? '#FFF9C4' : 
                               customer.status === 'PUSHED_BACK' ? '#FFE0B2' : '#C8E6C9',
                      color: customer.status === 'APPROVED' ? '#1B5E20' : 
                             customer.status === 'REJECTED' ? '#B71C1C' : 
                             customer.status === 'PENDING' ? '#F57F17' : 
                             customer.status === 'PUSHED_BACK' ? '#E65100' : '#1B5E20',
                    }}
                  >
                    {customer.status || 'PENDING'}
                  </Box>
                </Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Contact Information
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography><strong>Contact Person:</strong> {customer.contactPersonName}</Typography>
                <Typography><strong>Contact Email:</strong> {customer.contactEmail}</Typography>
                <Typography><strong>Contact Phone:</strong> {customer.contactPhone}</Typography>
                <Typography><strong>Emergency Contact:</strong> {customer.emergencyContactName}</Typography>
                <Typography><strong>Emergency Phone:</strong> {customer.emergencyContactPhone}</Typography>
              </Box>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Address Information
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography><strong>Head Office Address:</strong> {customer.headOfficeAddress}</Typography>
                <Typography><strong>Site Address:</strong> {customer.siteAddress}</Typography>
              </Box>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Contract Information
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography><strong>Start Date:</strong> {customer.startContractDate}</Typography>
                <Typography><strong>End Date:</strong> {customer.endContractDate}</Typography>
              </Box>
            </Box>
            
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="text.secondary">
                Locations
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {customer.locations && customer.locations.map((location: string, index: number) => (
                  <Chip 
                    key={index}
                    label={location}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                ))}
                {(!customer.locations || customer.locations.length === 0) && (
                  <Typography variant="body2" color="text.secondary">No locations specified</Typography>
                )}
              </Box>
            </Box>
            
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="text.secondary">
                Documents
              </Typography>
              <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <Typography><strong>Tax Clearance:</strong> {customer.validTaxClearance || 'Not uploaded'}</Typography>
                <Typography><strong>Company Logo:</strong> {customer.companyLogo || 'Not uploaded'}</Typography>
                <Typography><strong>Certificate of Cooperation:</strong> {customer.getCertificateOfCooperation || 'Not uploaded'}</Typography>
                <Typography><strong>Operating License:</strong> {customer.operatingLicense || 'Not uploaded'}</Typography>
                <Typography><strong>Proof of Insurance:</strong> {customer.proofOfInsurance || 'Not uploaded'}</Typography>
                <Typography><strong>Risk Assessment Report:</strong> {customer.siteRiskAssessmentReport || 'Not uploaded'}</Typography>
              </Box>
            </Box>

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
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
