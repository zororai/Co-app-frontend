'use client';

import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import LinkIcon from '@mui/icons-material/Link';

export interface ShaftActionDialogProps {
  open: boolean;
  onClose: () => void;
  onAttachExisting: (customerId: string) => void;
  onCreateNew: (customerId: string) => void;
  customerId: string | null;
}

export function ShaftActionDialog({
  open,
  onClose,
  onAttachExisting,
  onCreateNew,
  customerId,
}: ShaftActionDialogProps): React.JSX.Element {
  const handleAttachExisting = () => {
    if (customerId) {
      onAttachExisting(customerId);
    }
    onClose();
  };

  const handleCreateNew = () => {
    if (customerId) {
      onCreateNew(customerId);
    }
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'linear-gradient(135deg, rgb(5, 5, 68) 0%, rgb(5, 5, 68) 100%)',
        color: 'white',
        py: 2.5,
        px: 3,
        m: 0
      }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          Shaft Assignment Options
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ px: 3, py: 4 }}>
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          Choose how you would like to proceed with the shaft assignment:
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            variant="outlined"
            size="large"
            startIcon={<LinkIcon />}
            onClick={handleAttachExisting}
            sx={{
              py: 2,
              px: 3,
              borderColor: 'rgb(5, 5, 68)',
              color: 'rgb(5, 5, 68)',
              '&:hover': {
                borderColor: 'rgb(5, 5, 68)',
                backgroundColor: 'rgba(5, 5, 68, 0.04)',
              },
              justifyContent: 'flex-start',
              textAlign: 'left',
            }}
          >
            <Box sx={{ ml: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Attach Existing Shaft
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Link this customer to an already existing shaft
              </Typography>
            </Box>
          </Button>
          
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={handleCreateNew}
            sx={{
              py: 2,
              px: 3,
              bgcolor: 'rgb(5, 5, 68)',
              '&:hover': {
                bgcolor: 'rgba(5, 5, 68, 0.9)',
              },
              justifyContent: 'flex-start',
              textAlign: 'left',
            }}
          >
            <Box sx={{ ml: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Create New Shaft
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mt: 0.5 }}>
                Create a brand new shaft assignment for this customer
              </Typography>
            </Box>
          </Button>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'flex-end' }}>
        <Button 
          onClick={onClose}
          sx={{ 
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            }
          }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
