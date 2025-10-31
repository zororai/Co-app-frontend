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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import InfoIcon from '@mui/icons-material/Info';
import { printElementById } from '@/lib/print';
import { useTheme } from '@mui/material/styles';

interface CompanyDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  company: any | null;
  loading?: boolean;
  error?: string | null;
}

export function CompanyDetailsDialog({ 
  open, 
  onClose, 
  company, 
  loading = false,
  error = null 
}: CompanyDetailsDialogProps): React.JSX.Element {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = React.useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handlePrint = () => {
    printElementById('company-details-printable', 'Company Miner Details');
  };

  // Determine available tabs based on data
  const hasDocuments = company?.companyLogo || company?.cr14Copy || company?.taxClearance || 
                       company?.certificateOfCooperation || company?.miningCertificate;
  const hasPassportPhoto = company?.passportPhoto;
  const hasAdditionalInfo = company?.reason;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="h6" component="span" sx={{ color: 'white', fontWeight: 600 }}>
            Company Miner Details
          </Typography>
          {company?.status && (
            <Chip
              label={company.status}
              size="small"
              sx={{
                bgcolor: company.status === 'APPROVED' ? 'rgba(76, 175, 80, 0.2)' : 
                         company.status === 'REJECTED' ? 'rgba(244, 67, 54, 0.2)' : 
                         'rgba(255, 152, 0, 0.2)',
                color: company.status === 'APPROVED' ? '#4caf50' : 
                       company.status === 'REJECTED' ? '#f44336' : 
                       '#ff9800',
                fontWeight: 600,
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            />
          )}
        </Box>
        <Box sx={{ display: 'flex' }}>
          <IconButton 
            onClick={handlePrint} 
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

      <Tabs
        value={currentTab}
        onChange={handleTabChange}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          px: 2,
          '& .MuiTab-root': {
            minHeight: 64,
            textTransform: 'none',
            fontSize: '0.95rem',
            fontWeight: 500,
            color: 'text.secondary',
            '&.Mui-selected': {
              color: theme.palette.secondary.main,
              fontWeight: 600
            }
          },
          '& .MuiTabs-indicator': {
            backgroundColor: theme.palette.secondary.main,
            height: 3
          }
        }}
      >
        <Tab icon={<BusinessIcon />} iconPosition="start" label="Company Info" />
        <Tab icon={<PersonIcon />} iconPosition="start" label="Owner Details" />
        {hasDocuments && <Tab icon={<DescriptionIcon />} iconPosition="start" label="Documents" />}
        {hasPassportPhoto && <Tab icon={<ImageIcon />} iconPosition="start" label="Passport Photo" />}
        {hasAdditionalInfo && <Tab icon={<InfoIcon />} iconPosition="start" label="Additional Info" />}
      </Tabs>

      <DialogContent sx={{ p: 0 }}>
        <Box id="company-details-printable" sx={{ p: 3 }}>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
              <CircularProgress sx={{ color: theme.palette.secondary.main }} />
            </Box>
          )}

          {error && !loading && (
            <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
          )}

          {!loading && !error && company && (
            <>
              {/* Tab 0: Company Information */}
              {currentTab === 0 && (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2.5 }}>
                  <Box
                    sx={{
                      border: `1px solid ${theme.palette.secondary.main}20`,
                      borderRadius: 2,
                      p: 2.5,
                      bgcolor: '#ffffff',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ color: theme.palette.secondary.main, fontWeight: 700, mb: 1.5, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                      Company Name
                    </Typography>
                    <Typography sx={{ fontSize: '0.95rem' }}>{company.companyName || 'N/A'}</Typography>
                  </Box>

                  <Box
                    sx={{
                      border: `1px solid ${theme.palette.secondary.main}20`,
                      borderRadius: 2,
                      p: 2.5,
                      bgcolor: '#ffffff',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ color: theme.palette.secondary.main, fontWeight: 700, mb: 1.5, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                      Address
                    </Typography>
                    <Typography sx={{ fontSize: '0.95rem' }}>{company.address || 'N/A'}</Typography>
                  </Box>

                  <Box
                    sx={{
                      border: `1px solid ${theme.palette.secondary.main}20`,
                      borderRadius: 2,
                      p: 2.5,
                      bgcolor: '#ffffff',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ color: theme.palette.secondary.main, fontWeight: 700, mb: 1.5, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                      Cell Number
                    </Typography>
                    <Typography sx={{ fontSize: '0.95rem' }}>{company.cellNumber || 'N/A'}</Typography>
                  </Box>

                  <Box
                    sx={{
                      border: `1px solid ${theme.palette.secondary.main}20`,
                      borderRadius: 2,
                      p: 2.5,
                      bgcolor: '#ffffff',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ color: theme.palette.secondary.main, fontWeight: 700, mb: 1.5, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                      Email
                    </Typography>
                    <Typography sx={{ fontSize: '0.95rem' }}>{company.email || 'N/A'}</Typography>
                  </Box>

                  <Box
                    sx={{
                      border: `1px solid ${theme.palette.secondary.main}20`,
                      borderRadius: 2,
                      p: 2.5,
                      bgcolor: '#ffffff',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ color: theme.palette.secondary.main, fontWeight: 700, mb: 1.5, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                      Status
                    </Typography>
                    <Chip
                      label={company.status || 'PENDING'}
                      size="small"
                      sx={{
                        bgcolor: company.status === 'APPROVED' ? '#C8E6C9' : 
                                 company.status === 'REJECTED' ? '#FFCDD2' : 
                                 '#FFF9C4',
                        color: company.status === 'APPROVED' ? '#1B5E20' : 
                               company.status === 'REJECTED' ? '#B71C1C' : 
                               '#F57F17',
                        fontWeight: 600
                      }}
                    />
                  </Box>
                </Box>
              )}

              {/* Tab 1: Owner Details */}
              {currentTab === 1 && (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2.5 }}>
                  <Box
                    sx={{
                      border: `1px solid ${theme.palette.secondary.main}20`,
                      borderRadius: 2,
                      p: 2.5,
                      bgcolor: '#ffffff',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ color: theme.palette.secondary.main, fontWeight: 700, mb: 1.5, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                      Owner Name
                    </Typography>
                    <Typography sx={{ fontSize: '0.95rem' }}>{company.ownerName || 'N/A'}</Typography>
                  </Box>

                  <Box
                    sx={{
                      border: `1px solid ${theme.palette.secondary.main}20`,
                      borderRadius: 2,
                      p: 2.5,
                      bgcolor: '#ffffff',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ color: theme.palette.secondary.main, fontWeight: 700, mb: 1.5, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                      Owner Surname
                    </Typography>
                    <Typography sx={{ fontSize: '0.95rem' }}>{company.ownerSurname || 'N/A'}</Typography>
                  </Box>

                  <Box
                    sx={{
                      border: `1px solid ${theme.palette.secondary.main}20`,
                      borderRadius: 2,
                      p: 2.5,
                      bgcolor: '#ffffff',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ color: theme.palette.secondary.main, fontWeight: 700, mb: 1.5, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                      Owner Address
                    </Typography>
                    <Typography sx={{ fontSize: '0.95rem' }}>{company.ownerAddress || 'N/A'}</Typography>
                  </Box>

                  <Box
                    sx={{
                      border: `1px solid ${theme.palette.secondary.main}20`,
                      borderRadius: 2,
                      p: 2.5,
                      bgcolor: '#ffffff',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ color: theme.palette.secondary.main, fontWeight: 700, mb: 1.5, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                      Owner Cell Number
                    </Typography>
                    <Typography sx={{ fontSize: '0.95rem' }}>{company.ownerCellNumber || 'N/A'}</Typography>
                  </Box>

                  <Box
                    sx={{
                      border: `1px solid ${theme.palette.secondary.main}20`,
                      borderRadius: 2,
                      p: 2.5,
                      bgcolor: '#ffffff',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ color: theme.palette.secondary.main, fontWeight: 700, mb: 1.5, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                      Owner ID Number
                    </Typography>
                    <Typography sx={{ fontSize: '0.95rem' }}>{company.ownerIdNumber || 'N/A'}</Typography>
                  </Box>
                </Box>
              )}

              {/* Tab 2: Documents (if available) */}
              {hasDocuments && currentTab === 2 && (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2.5 }}>
                  {company.companyLogo && (
                    <Box sx={{ border: `1px solid ${theme.palette.secondary.main}20`, borderRadius: 2, p: 2.5, bgcolor: '#ffffff' }}>
                      <Typography variant="subtitle2" sx={{ color: theme.palette.secondary.main, fontWeight: 700, mb: 1.5, textTransform: 'uppercase', fontSize: '0.75rem' }}>
                        Company Logo
                      </Typography>
                      <Box
                        component="img"
                        src={company.companyLogo}
                        alt="Company Logo"
                        sx={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 1, border: '1px solid #e0e0e0' }}
                      />
                    </Box>
                  )}

                  {company.cr14Copy && (
                    <Box sx={{ border: `1px solid ${theme.palette.secondary.main}20`, borderRadius: 2, p: 2.5, bgcolor: '#ffffff' }}>
                      <Typography variant="subtitle2" sx={{ color: theme.palette.secondary.main, fontWeight: 700, mb: 1.5, textTransform: 'uppercase', fontSize: '0.75rem' }}>
                        CR14 Copy
                      </Typography>
                      <Box
                        component="img"
                        src={company.cr14Copy}
                        alt="CR14 Document"
                        sx={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 1, border: '1px solid #e0e0e0', cursor: 'pointer' }}
                        onClick={() => window.open(company.cr14Copy, '_blank')}
                      />
                    </Box>
                  )}

                  {company.taxClearance && (
                    <Box sx={{ border: `1px solid ${theme.palette.secondary.main}20`, borderRadius: 2, p: 2.5, bgcolor: '#ffffff' }}>
                      <Typography variant="subtitle2" sx={{ color: theme.palette.secondary.main, fontWeight: 700, mb: 1.5, textTransform: 'uppercase', fontSize: '0.75rem' }}>
                        Tax Clearance
                      </Typography>
                      <Box
                        component="img"
                        src={company.taxClearance}
                        alt="Tax Clearance"
                        sx={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 1, border: '1px solid #e0e0e0', cursor: 'pointer' }}
                        onClick={() => window.open(company.taxClearance, '_blank')}
                      />
                    </Box>
                  )}

                  {company.certificateOfCooperation && (
                    <Box sx={{ border: `1px solid ${theme.palette.secondary.main}20`, borderRadius: 2, p: 2.5, bgcolor: '#ffffff' }}>
                      <Typography variant="subtitle2" sx={{ color: theme.palette.secondary.main, fontWeight: 700, mb: 1.5, textTransform: 'uppercase', fontSize: '0.75rem' }}>
                        Certificate of Cooperation
                      </Typography>
                      <Box
                        component="img"
                        src={company.certificateOfCooperation}
                        alt="Certificate"
                        sx={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 1, border: '1px solid #e0e0e0', cursor: 'pointer' }}
                        onClick={() => window.open(company.certificateOfCooperation, '_blank')}
                      />
                    </Box>
                  )}

                  {company.miningCertificate && (
                    <Box sx={{ border: `1px solid ${theme.palette.secondary.main}20`, borderRadius: 2, p: 2.5, bgcolor: '#ffffff' }}>
                      <Typography variant="subtitle2" sx={{ color: theme.palette.secondary.main, fontWeight: 700, mb: 1.5, textTransform: 'uppercase', fontSize: '0.75rem' }}>
                        Mining Certificate
                      </Typography>
                      <Box
                        component="img"
                        src={company.miningCertificate}
                        alt="Mining Certificate"
                        sx={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 1, border: '1px solid #e0e0e0', cursor: 'pointer' }}
                        onClick={() => window.open(company.miningCertificate, '_blank')}
                      />
                    </Box>
                  )}
                </Box>
              )}

              {/* Tab 3: Passport Photo (if available) */}
              {hasPassportPhoto && currentTab === (hasDocuments ? 3 : 2) && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                  <Box
                    component="img"
                    src={company.passportPhoto}
                    alt="Passport Photo"
                    sx={{
                      maxWidth: '100%',
                      maxHeight: 500,
                      objectFit: 'contain',
                      borderRadius: 2,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      border: `2px solid ${theme.palette.secondary.main}`
                    }}
                  />
                </Box>
              )}

              {/* Tab 4: Additional Info (if available) */}
              {hasAdditionalInfo && currentTab === (hasDocuments && hasPassportPhoto ? 4 : hasDocuments || hasPassportPhoto ? 3 : 2) && (
                <Box sx={{ border: `2px solid ${theme.palette.secondary.main}`, borderRadius: 2, p: 3, bgcolor: '#f9f9f9' }}>
                  <Typography variant="h6" sx={{ color: theme.palette.secondary.main, fontWeight: 700, mb: 2 }}>
                    Reason / Notes
                  </Typography>
                  <Typography sx={{ fontSize: '0.95rem', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                    {company.reason || 'No additional information provided.'}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, gap: 1, bgcolor: '#f9f9f9', borderTop: '1px solid #e0e0e0' }}>
        <Button 
          onClick={onClose} 
          variant="contained"
          sx={{
            bgcolor: theme.palette.secondary.main,
            color: '#fff',
            '&:hover': { bgcolor: theme.palette.secondary.dark }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
