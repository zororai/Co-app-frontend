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

interface CustomerDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  customer: any | null;
}

export function CustomerDetailsDialog({ open, onClose, customer }: CustomerDetailsDialogProps): React.JSX.Element | null {
  const theme = useTheme();
  
  if (!customer) return null;

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
          Registered Syndicate
        </Typography>
        <Box sx={{ display: 'flex' }}>
          <IconButton 
            onClick={() => printElementById('customer-details-printable', 'Customer Details')} 
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
        <Box id="customer-details-printable">
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
                Cooperative Information
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
                      bgcolor: customer.status === 'Approved' ? '#C8E6C9' : '#FFCDD2',
                      color: customer.status === 'Approved' ? '#1B5E20' : '#B71C1C',
                    }}
                  >
                    {customer.status}
                  </Box>
                </Typography>
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
    </Dialog>
  );
}
