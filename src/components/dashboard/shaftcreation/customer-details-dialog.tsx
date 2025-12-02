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
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';
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
          bgcolor: theme.palette.secondary.main,
          color: 'white',
          py: 2.5,
          px: 3,
          m: 0
        }}
      >
        <Typography variant="h6" component="div" sx={{ color: 'white', fontWeight: 600 }}>
          Customer Details
        </Typography>
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
      </DialogTitle>
      
      <DialogContent sx={{
        px: 3,
        py: 2,
        maxHeight: '70vh',
        overflow: 'auto',
        '&::-webkit-scrollbar': { width: '6px' },
        '&::-webkit-scrollbar-track': { backgroundColor: '#f1f1f1' },
        '&::-webkit-scrollbar-thumb': { 
          backgroundColor: theme.palette.secondary.main, 
          borderRadius: '3px' 
        },
      }}>
        <Box sx={{ p: 2 }}>
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
                variant="subtitle1" 
                sx={{ 
                  color: theme.palette.secondary.main, 
                  fontWeight: 700, 
                  mb: 2,
                  fontSize: '1rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Personal Information
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography sx={{ mb: 1.5, fontSize: '0.95rem' }}>
                  <strong>Name:</strong> {customer.name}
                </Typography>
                <Typography sx={{ mb: 1.5, fontSize: '0.95rem' }}>
                  <strong>Surname:</strong> {customer.surname}
                </Typography>
                <Typography sx={{ mb: 1.5, fontSize: '0.95rem' }}>
                  <strong>ID Number:</strong> {customer.nationIdNumber}
                </Typography>
                <Typography sx={{ mb: 1.5, fontSize: '0.95rem' }}>
                  <strong>Address:</strong> {customer.address}
                </Typography>
                <Typography sx={{ mb: 1.5, fontSize: '0.95rem' }}>
                  <strong>Phone:</strong> {customer.cellNumber}
                </Typography>
                <Typography sx={{ fontSize: '0.95rem' }}>
                  <strong>Position:</strong> {customer.position}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ 
              border: `2px solid ${theme.palette.secondary.main}`, 
              borderRadius: '12px', 
              p: 2.5,
              bgcolor: '#ffffff'
            }}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: theme.palette.secondary.main, 
                  fontWeight: 700, 
                  mb: 2,
                  fontSize: '1rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Cooperative Information
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography sx={{ mb: 1.5, fontSize: '0.95rem' }}>
                  <strong>Cooperative Name:</strong> {customer.cooperativeName}
                </Typography>
                <Typography sx={{ mb: 1.5, fontSize: '0.95rem' }}>
                  <strong>Number of Shafts:</strong> {customer.numShafts}
                </Typography>
                <Typography sx={{ fontSize: '0.95rem' }}>
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
                      fontWeight: 'medium',
                      fontSize: '0.875rem'
                    }}
                  >
                    {customer.status}
                  </Box>
                </Typography>
              </Box>
            </Box>

            <Box sx={{ gridColumn: '1 / -1' }}>
              <Divider sx={{ my: 2 }} />
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: theme.palette.secondary.main, 
                  fontWeight: 700, 
                  mb: 2,
                  fontSize: '1rem',
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
                      maxHeight: '250px',
                      borderRadius: 1,
                      border: `2px solid ${theme.palette.secondary.main}`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  />
                )}
              </Box>
            </Box>

            {customer.teamMembers && customer.teamMembers.length > 0 && (
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Divider sx={{ my: 2 }} />
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    color: theme.palette.secondary.main, 
                    fontWeight: 700, 
                    mb: 2,
                    fontSize: '1rem',
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
                        p: 2.5,
                        border: `1px solid ${theme.palette.secondary.main}`,
                        borderRadius: '8px',
                        bgcolor: 'background.paper'
                      }}
                    >
                      <Typography sx={{ mb: 1, fontSize: '0.95rem' }}><strong>Name:</strong> {member.name}</Typography>
                      <Typography sx={{ mb: 1, fontSize: '0.95rem' }}><strong>Surname:</strong> {member.surname}</Typography>
                      <Typography sx={{ mb: 1, fontSize: '0.95rem' }}><strong>Address:</strong> {member.address}</Typography>
                      <Typography sx={{ fontSize: '0.95rem' }}><strong>ID Number:</strong> {member.idNumber}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {customer.reason && (
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Divider sx={{ my: 2 }} />
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    color: theme.palette.secondary.main, 
                    fontWeight: 700, 
                    mb: 2,
                    fontSize: '1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
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

      <DialogActions sx={{ 
        px: 3, 
        py: 2.5, 
        borderTop: '1px solid #e0e0e0',
        gap: 1 
      }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          sx={{
            borderColor: theme.palette.secondary.main,
            color: theme.palette.secondary.main,
            '&:hover': {
              borderColor: theme.palette.secondary.dark,
              backgroundColor: 'rgba(50, 56, 62, 0.04)'
            }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
