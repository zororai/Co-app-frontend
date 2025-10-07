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
  Autocomplete,
} from '@mui/material';
import { X as CloseIcon } from '@phosphor-icons/react/dist/ssr/X';
import { authClient } from '@/lib/auth/client';
import type { Customer } from './selectsection-table';

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
  
  // State for sections dropdown
  const [sections, setSections] = React.useState<any[]>([]);
  const [sectionsLoading, setSectionsLoading] = React.useState(false);
  const [selectedSection, setSelectedSection] = React.useState<any | null>(null);

  // Fetch sections data when dialog opens
  React.useEffect(() => {
    if (open) {
      fetchSections();
    }
  }, [open]);

  const fetchSections = async () => {
    setSectionsLoading(true);
    try {
      console.log('Fetching sections data...');
      const sectionsData = await authClient.fetchSection();
      console.log('Sections data received:', sectionsData);
      
      // If no data from API, use test data for debugging

    } catch (error) {
      console.error('Error fetching sections:', error);
      // Use test data if API fails
      console.log('API failed, using test data');
      
    } finally {
      setSectionsLoading(false);
    }
  };

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
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Failed to create section');
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
      setSelectedSection(null);
      setSections([]);
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
            onChange={e => {
              setFormData(prev => ({
                ...prev,
                sectionName: e.target.value
              }));
              if (error) {
                setError(null);
              }
            }}
            disabled={loading}
            fullWidth
            required
            placeholder="Enter section name..."
            helperText="Type the section name."
          />

          <TextField
            label="Number of Shafts"
            value={formData.numberOfShaft}
            onChange={e => {
              setFormData(prev => ({
                ...prev,
                numberOfShaft: e.target.value
              }));
              if (error) {
                setError(null);
              }
            }}
            disabled={loading}
            fullWidth
            required
            placeholder="Enter number of shafts..."
            helperText="Enter the number of shafts for this section."
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
