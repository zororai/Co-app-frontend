'use client';

import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';

interface CustomerDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  customer: any | null;
}

export function CustomerDetailsDialog({ open, onClose, customer }: CustomerDetailsDialogProps): React.JSX.Element | null {
  if (!customer) return null;

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
        <Typography variant="h6">Customer Details</Typography>
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
                      bgcolor: customer.status === 'Approved' ? 'success.light' : 'error.light',
                      color: customer.status === 'Approved' ? 'success.main' : 'error.main',
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
    </Dialog>
  );
}
