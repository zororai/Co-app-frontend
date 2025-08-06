'use client';

import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import { X as CloseIcon } from '@phosphor-icons/react/dist/ssr/X';
import { authClient } from '@/lib/auth/client';
import type { Customer } from './section-table';

interface SectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  customer?: Customer | null;
  onRefresh?: () => void;
}

interface SectionFormData {
  sectionName: string;
  numberOfShaft: string;
  reason: string;
  status: string;
}

export function SectionDialog({ open, onClose, onSuccess, customer, onRefresh }: SectionDialogProps): React.JSX.Element {
  const [formData, setFormData] = React.useState<SectionFormData>({
    sectionName: '',
    numberOfShaft: '',
    reason: '',
    status: 'PENDING',
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleInputChange = (field: keyof SectionFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.sectionName.trim()) {
      setError('Section name is required');
      return;
    }
    if (!formData.numberOfShaft.trim()) {
      setError('Number of shaft is required');
      return;
    }
    if (!formData.reason.trim()) {
      setError('Reason is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authClient.createSection({
        sectionName: formData.sectionName.trim(),
        numberOfShaft: formData.numberOfShaft.trim(),
        status: formData.status,
        reason: formData.reason.trim(),
      });

      setSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          sectionName: '',
          numberOfShaft: '',
          reason: '',
          status: 'PENDING',
        });
        setSuccess(false);
        onClose();
        if (onSuccess) {
          onSuccess();
        }
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create section');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        sectionName: '',
        numberOfShaft: '',
        reason: '',
        status: 'PENDING',
      });
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          Create Section
          <IconButton
            onClick={handleClose}
            disabled={loading}
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <CloseIcon fontSize="var(--icon-fontSize-md)" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={3}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success">
              Section created successfully!
            </Alert>
          )}

          <TextField
            label="Section Name"
            value={formData.sectionName}
            onChange={handleInputChange('sectionName')}
            disabled={loading}
            fullWidth
            required
            placeholder="Enter section name"
          />

          <TextField
            label="No of Shaft"
            value={formData.numberOfShaft}
            onChange={handleInputChange('numberOfShaft')}
            disabled={loading}
            fullWidth
            required
            placeholder="Enter number of shaft"
          />

          <TextField
            label="Reason"
            value={formData.reason}
            onChange={handleInputChange('reason')}
            disabled={loading}
            fullWidth
            required
            multiline
            rows={3}
            placeholder="Enter reason for section creation"
          />

          <TextField
            label="Status"
            value={formData.status}
            onChange={handleInputChange('status')}
            disabled={loading}
            fullWidth
            placeholder="Status (default: PENDING)"
            helperText="Default status is PENDING"
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          color="inherit"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || success}
          variant="contained"
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? 'Submitting...' : 'Submit for Approval'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
