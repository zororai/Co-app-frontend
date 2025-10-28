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
import Skeleton from '@mui/material/Skeleton';
import { authClient } from '@/lib/auth/client';
import PrintIcon from '@mui/icons-material/Print';
import { printElementById } from '@/lib/print';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useTheme } from '@mui/material/styles';

interface CustomerDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  customer: any | null;
  onRefresh?: () => void; // Optional callback to refresh the table data
}

export function SecurityDetailsDialog({ open, onClose, customer, onRefresh }: CustomerDetailsDialogProps): React.JSX.Element  {
  const theme = useTheme();
  const [status, setStatus] = React.useState<string>('');
  const [reason, setReason] = React.useState<string>('');
  const [showReasonField, setShowReasonField] = React.useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  
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
          p: 2,
          bgcolor: theme.palette.secondary.main
        }}
      >
        <Typography variant="subtitle1" component="span" sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>Security Company Details</Typography>
        <Box sx={{ display: 'flex' }}>
          <IconButton 
            onClick={onClose} 
            size="small" 
            sx={{ 
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Skeleton variant="rectangular" height={60} sx={{ borderRadius: '8px', mb: 3 }} />
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: '8px', mb: 3 }} />
          <Skeleton variant="rectangular" height={180} sx={{ borderRadius: '8px', mb: 3 }} />
          <Skeleton variant="rectangular" height={120} sx={{ borderRadius: '8px' }} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose}
          sx={{
            bgcolor: theme.palette.secondary.main,
            color: '#ffffff',
            '&:hover': {
              bgcolor: theme.palette.secondary.dark,
            },
          }}
        >
          Close
        </Button>
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
          p: 2.5,
          bgcolor: theme.palette.secondary.main
        }}
      >
        <Typography variant="h6" component="span" sx={{ color: 'white', fontWeight: 600 }}>Security Company Details</Typography>
        <Box sx={{ display: 'flex' }}>
          <IconButton 
            onClick={() => printElementById('security-details-printable', 'Security Company Details')} 
            size="small" 
            sx={{ 
              mr: 1, 
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            <PrintIcon />
          </IconButton>
          <IconButton 
            onClick={onClose} 
            size="small" 
            sx={{ 
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2 }} id="security-details-printable">
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
            gap: 2 
          }}>
            <Box sx={{ border: `2px solid ${theme.palette.secondary.main}`, borderRadius: '12px', p: 2.5 }}>
              <Typography variant="subtitle1" sx={{ color: theme.palette.secondary.main, fontWeight: 700, mb: 2, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Company Information
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography sx={{ mb: 1.5, fontSize: '0.95rem' }}><strong>Company Name:</strong> {customer.companyName}</Typography>
                <Typography sx={{ mb: 1.5, fontSize: '0.95rem' }}><strong>Registration Number:</strong> {customer.registrationNumber}</Typography>
                <Typography sx={{ mb: 1.5, fontSize: '0.95rem' }}><strong>Service Type:</strong> {customer.serviceType}</Typography>
                <Typography sx={{ mb: 1.5, fontSize: '0.95rem' }}><strong>Number of Workers:</strong> {customer.numberOfWorks}</Typography>
                <Typography sx={{ fontSize: '0.95rem' }}><strong>Status:</strong> 
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
            <Box sx={{ border: `2px solid ${theme.palette.secondary.main}`, borderRadius: '12px', p: 2.5 }}>
              <Typography variant="subtitle1" sx={{ color: theme.palette.secondary.main, fontWeight: 700, mb: 2, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Contact Information
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography sx={{ mb: 1.5, fontSize: '0.95rem' }}><strong>Contact Person:</strong> {customer.contactPersonName}</Typography>
                <Typography sx={{ mb: 1.5, fontSize: '0.95rem' }}><strong>Contact Email:</strong> {customer.contactEmail}</Typography>
                <Typography sx={{ mb: 1.5, fontSize: '0.95rem' }}><strong>Contact Phone:</strong> {customer.contactPhone}</Typography>
                <Typography sx={{ mb: 1.5, fontSize: '0.95rem' }}><strong>Emergency Contact:</strong> {customer.emergencyContactName}</Typography>
                <Typography sx={{ fontSize: '0.95rem' }}><strong>Emergency Phone:</strong> {customer.emergencyContactPhone}</Typography>
              </Box>
            </Box>
            
            <Box sx={{ border: `2px solid ${theme.palette.secondary.main}`, borderRadius: '12px', p: 2.5 }}>
              <Typography variant="subtitle1" sx={{ color: theme.palette.secondary.main, fontWeight: 700, mb: 2, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Address Information
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography sx={{ mb: 1.5, fontSize: '0.95rem' }}><strong>Head Office Address:</strong> {customer.headOfficeAddress}</Typography>
                <Typography sx={{ fontSize: '0.95rem' }}><strong>Site Address:</strong> {customer.siteAddress}</Typography>
              </Box>
            </Box>
            
            <Box sx={{ border: `2px solid ${theme.palette.secondary.main}`, borderRadius: '12px', p: 2.5 }}>
              <Typography variant="subtitle1" sx={{ color: theme.palette.secondary.main, fontWeight: 700, mb: 2, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Contract Information
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography sx={{ mb: 1.5, fontSize: '0.95rem' }}><strong>Start Date:</strong> {customer.startContractDate}</Typography>
                <Typography sx={{ fontSize: '0.95rem' }}><strong>End Date:</strong> {customer.endContractDate}</Typography>
              </Box>
            </Box>
            
            <Box sx={{ gridColumn: '1 / -1', border: `2px solid ${theme.palette.secondary.main}`, borderRadius: '12px', p: 2.5 }}>
              <Typography variant="subtitle1" sx={{ color: theme.palette.secondary.main, fontWeight: 700, mb: 2, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
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
            
            <Box sx={{ gridColumn: '1 / -1', border: `2px solid ${theme.palette.secondary.main}`, borderRadius: '12px', p: 2.5 }}>
              <Typography variant="subtitle1" sx={{ color: theme.palette.secondary.main, fontWeight: 700, mb: 2, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Documents
              </Typography>
              <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <Typography sx={{ fontSize: '0.95rem' }}>
                  <strong>Tax Clearance:</strong>{' '}
                  {customer.validTaxClearance ? (
                    <Box component="span" sx={{ color: 'success.main', display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                      <CheckCircleOutlineIcon fontSize="small" />
                      <span>Uploaded</span>
                    </Box>
                  ) : 'Not uploaded'}
                </Typography>
                <Typography sx={{ fontSize: '0.95rem' }}>
                  <strong>Company Logo:</strong>{' '}
                  {customer.companyLogo ? (
                    <Box component="span" sx={{ color: 'success.main', display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                      <CheckCircleOutlineIcon fontSize="small" />
                      <span>Uploaded</span>
                    </Box>
                  ) : 'Not uploaded'}
                </Typography>
                <Typography sx={{ fontSize: '0.95rem' }}>
                  <strong>Certificate of Cooperation:</strong>{' '}
                  {customer.getCertificateOfCooperation ? (
                    <Box component="span" sx={{ color: 'success.main', display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                      <CheckCircleOutlineIcon fontSize="small" />
                      <span>Uploaded</span>
                    </Box>
                  ) : 'Not uploaded'}
                </Typography>
                <Typography sx={{ fontSize: '0.95rem' }}>
                  <strong>Operating License:</strong>{' '}
                  {customer.operatingLicense ? (
                    <Box component="span" sx={{ color: 'success.main', display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                      <CheckCircleOutlineIcon fontSize="small" />
                      <span>Uploaded</span>
                    </Box>
                  ) : 'Not uploaded'}
                </Typography>
                <Typography sx={{ fontSize: '0.95rem' }}>
                  <strong>Proof of Insurance:</strong>{' '}
                  {customer.proofOfInsurance ? (
                    <Box component="span" sx={{ color: 'success.main', display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                      <CheckCircleOutlineIcon fontSize="small" />
                      <span>Uploaded</span>
                    </Box>
                  ) : 'Not uploaded'}
                </Typography>
                <Typography sx={{ fontSize: '0.95rem' }}>
                  <strong>Risk Assessment Report:</strong>{' '}
                  {customer.siteRiskAssessmentReport ? (
                    <Box component="span" sx={{ color: 'success.main', display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                      <CheckCircleOutlineIcon fontSize="small" />
                      <span>Uploaded</span>
                    </Box>
                  ) : 'Not uploaded'}
                </Typography>
              </Box>
            </Box>

            {customer.reason && (
              <Box sx={{ gridColumn: '1 / -1', border: `2px solid ${theme.palette.secondary.main}`, borderRadius: '12px', p: 2.5 }}>
                <Typography variant="subtitle1" sx={{ color: theme.palette.secondary.main, fontWeight: 700, mb: 2, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Additional Information
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography sx={{ fontSize: '0.95rem' }}><strong>Reason:</strong> {customer.reason}</Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: 'secondary.main',
            color: 'secondary.main',
            '&:hover': {
              borderColor: 'secondary.dark',
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
