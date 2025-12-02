'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { authClient } from '@/lib/auth/client';

interface IncidentResolutionDialogProps {
  open: boolean;
  onClose: () => void;
  incidentId: string | null;
  onResolutionComplete?: () => void;
}

export function IncidentResolutionDialog({
  open,
  onClose,
  incidentId,
  onResolutionComplete,
}: IncidentResolutionDialogProps): React.JSX.Element {
  const theme = useTheme();
  const [resolution, setResolution] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  const handleClose = () => {
    if (!loading) {
      setResolution('');
      setError('');
      setSuccess(false);
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!incidentId || !resolution.trim()) {
      setError('Please provide a resolution description');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await authClient.resolveIncident(incidentId, resolution.trim());
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          handleClose();
          if (onResolutionComplete) {
            onResolutionComplete();
          }
        }, 1500);
      } else {
        setError(result.error || 'Failed to resolve incident');
      }
    } catch (error) {
      console.error('Error resolving incident:', error);
      setError('An unexpected error occurred while resolving the incident');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: theme.palette.secondary.main,
        color: 'white',
        py: 2.5,
        px: 3,
        m: 0
      }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          Resolve Incident
        </Typography>
      </DialogTitle>

      {/* Fixed Stepper Section */}
      <Box sx={{ 
        position: 'sticky',
        top: 0,
        backgroundColor: '#fafafa',
        borderBottom: '1px solid #e0e0e0',
        px: 3,
        py: 2,
        zIndex: 1
      }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Provide resolution details for this incident
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Incident ID: <strong>{incidentId}</strong>
        </Typography>
      </Box>

      <DialogContent sx={{ 
        pt: 0, 
        pb: 0,
        maxHeight: '60vh',
        overflow: 'auto'
      }}>
        {success ? (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              Incident resolved successfully!
            </Alert>
            <CircularProgress size={24} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Closing dialog...
            </Typography>
          </Box>
        ) : (
          <Box sx={{ p: 3 }}>
            <TextField
              fullWidth
              multiline
              rows={6}
              label="Resolution Description"
              placeholder="Describe how this incident was resolved..."
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              disabled={loading}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                },
              }}
            />

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Typography variant="caption" color="text.secondary">
              This action will mark the incident as resolved and cannot be undone.
            </Typography>
          </Box>
        )}
      </DialogContent>

      {/* Fixed Button Section */}
      {!success && (
        <Box sx={{ 
          position: 'sticky',
          bottom: 0,
          backgroundColor: '#fafafa',
          borderTop: '1px solid #e0e0e0',
          px: 3,
          py: 2,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2,
          zIndex: 1
        }}>
          <Button
            onClick={handleClose}
            disabled={loading}
            sx={{
              color: '#666',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !resolution.trim()}
            variant="contained"
            sx={{
              backgroundColor: theme.palette.secondary.main,
              color: 'white',
              '&:hover': {
                backgroundColor: theme.palette.secondary.dark,
              },
              '&:disabled': {
                backgroundColor: '#ccc',
              },
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1, color: 'white' }} />
                Resolving...
              </>
            ) : (
              'Resolve Incident'
            )}
          </Button>
        </Box>
      )}
    </Dialog>
  );
}
