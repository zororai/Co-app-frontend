'use client';

import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import { printElementById } from '@/lib/print';
import { useTheme } from '@mui/material/styles';

interface CompanyDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  company: any | null;
}

export function CompanyDetailsDialog({ open, onClose, company }: CompanyDetailsDialogProps): React.JSX.Element | null {
  const theme = useTheme();
  
  if (!company) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2.5,
          bgcolor: theme.palette.secondary.main,
          color: 'white'
        }}
      >
        <Typography variant="h6" component="span" sx={{ color: 'white', fontWeight: 600 }}>
          Company Details
        </Typography>
        <Box sx={{ display: 'flex' }}>
          <IconButton 
            onClick={() => printElementById('company-details-printable', 'Company Details')} 
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
      <DialogContent sx={{ p: 3 }}>
        <Box id="company-details-printable">
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
            gap: 2.5 
          }}>
            <Box sx={{ 
              border: `2px solid ${theme.palette.secondary.main}`, 
              borderRadius: '12px', 
              p: 2.5,
              bgcolor: '#ffffff'
            }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: theme.palette.secondary.main, 
                  fontWeight: 700, 
                  mb: 2,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Company Information
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography><strong>Company Name:</strong> {company.companyName}</Typography>
                <Typography><strong>Address:</strong> {company.address}</Typography>
                <Typography><strong>Phone:</strong> {company.cellNumber}</Typography>
                <Typography><strong>Email:</strong> {company.email}</Typography>
                <Typography><strong>Registration Number:</strong> {company.registrationNumber}</Typography>
                <Typography><strong>Number of Shafts:</strong> {company.shaftnumber || 0}</Typography>
              </Box>
            </Box>
            
            <Box sx={{ 
              border: `2px solid ${theme.palette.secondary.main}`, 
              borderRadius: '12px', 
              p: 2.5,
              bgcolor: '#ffffff'
            }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: theme.palette.secondary.main, 
                  fontWeight: 700, 
                  mb: 2,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Owner Information
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography><strong>Owner Name:</strong> {company.ownerName}</Typography>
                <Typography><strong>Owner Surname:</strong> {company.ownerSurname}</Typography>
                <Typography><strong>Owner ID Number:</strong> {company.ownerIdNumber}</Typography>
                <Typography><strong>Owner Address:</strong> {company.ownerAddress}</Typography>
                <Typography><strong>Owner Phone:</strong> {company.ownerCellNumber}</Typography>
              </Box>
            </Box>

            <Box sx={{ 
              gridColumn: '1 / -1', 
              border: `2px solid ${theme.palette.secondary.main}`, 
              borderRadius: '12px', 
              p: 2.5,
              bgcolor: '#ffffff'
            }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: theme.palette.secondary.main, 
                  fontWeight: 700, 
                  mb: 2,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Status & Documents
              </Typography>
              <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <Box>
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
                        bgcolor: company.status === 'Approved' ? '#C8E6C9' : company.status === 'Rejected' ? '#FFCDD2' : '#FFF3E0',
                        color: company.status === 'Approved' ? '#1B5E20' : company.status === 'Rejected' ? '#B71C1C' : '#E65100',
                      }}
                    >
                      {company.status}
                    </Box>
                  </Typography>
                </Box>
                <Box>
                  <Typography><strong>Certificate of Cooperation:</strong> {company.certificateOfCooperation ? 'Available' : 'Not Available'}</Typography>
                  <Typography><strong>CR14 Copy:</strong> {company.cr14Copy ? 'Available' : 'Not Available'}</Typography>
                  <Typography><strong>Mining Certificate:</strong> {company.miningCertificate ? 'Available' : 'Not Available'}</Typography>
                  <Typography><strong>Tax Clearance:</strong> {company.taxClearance ? 'Available' : 'Not Available'}</Typography>
                </Box>
              </Box>
            </Box>

            {company.companyLogo && (
              <Box sx={{ 
                gridColumn: '1 / -1', 
                border: `2px solid ${theme.palette.secondary.main}`, 
                borderRadius: '12px', 
                p: 2.5,
                bgcolor: '#ffffff'
              }}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    color: theme.palette.secondary.main, 
                    fontWeight: 700, 
                    mb: 2,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  Company Logo
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  <Box
                    component="img"
                    src={company.companyLogo}
                    alt="Company Logo"
                    sx={{
                      maxWidth: '100%',
                      height: 'auto',
                      maxHeight: '200px',
                      borderRadius: 1,
                      border: '1px solid #e0e0e0'
                    }}
                  />
                </Box>
              </Box>
            )}

            {company.passportPhoto && (
              <Box sx={{ 
                gridColumn: '1 / -1', 
                border: `2px solid ${theme.palette.secondary.main}`, 
                borderRadius: '12px', 
                p: 2.5,
                bgcolor: '#ffffff'
              }}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    color: theme.palette.secondary.main, 
                    fontWeight: 700, 
                    mb: 2,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  Owner Passport Photo
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  <Box
                    component="img"
                    src={company.passportPhoto}
                    alt="Owner Passport Photo"
                    sx={{
                      maxWidth: '100%',
                      height: 'auto',
                      maxHeight: '200px',
                      borderRadius: 1,
                      border: '1px solid #e0e0e0'
                    }}
                  />
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
