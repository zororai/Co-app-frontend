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
import { useTheme } from '@mui/material/styles';
import { X as CloseIcon } from '@phosphor-icons/react/dist/ssr/X';
import { authClient } from '@/lib/auth/client';
import type { Customer } from './penality-table';

interface SectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  customer?: Customer | null;
  onRefresh?: () => void;
}

interface PenaltyFormData {
  shaftNumber: string;
  section: string;
  penaltyFee: string;
  reportedBy: string;
  issue: string;
  remarks: string;
}

export function SectionDialog({ open, onClose, onSuccess, customer, onRefresh }: SectionDialogProps): React.JSX.Element {
  const theme = useTheme();
  const [formData, setFormData] = React.useState<PenaltyFormData>({
    shaftNumber: '',
    section: '',
    penaltyFee: '',
    reportedBy: '',
    issue: '',
    remarks: '',
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  
  // State for shaft assignments dropdown
  const [shaftAssignments, setShaftAssignments] = React.useState<any[]>([]);
  const [shaftAssignmentsLoading, setShaftAssignmentsLoading] = React.useState(false);
  const [selectedShaft, setSelectedShaft] = React.useState<any | null>(null);

  // Fetch shaft assignments data when dialog opens
  React.useEffect(() => {
    if (open) {
      fetchShaftAssignments();
    }
  }, [open]);

  const fetchShaftAssignments = async () => {
    setShaftAssignmentsLoading(true);
    try {
      console.log('Fetching shaft assignments data...');
      const shaftData = await authClient.fetchApprovedShaftAssignments();
      console.log('Shaft assignments data received:', shaftData);
      setShaftAssignments(Array.isArray(shaftData) ? shaftData : []);
    } catch (error) {
      console.error('Error fetching shaft assignments:', error);
      setShaftAssignments([]);
    } finally {
      setShaftAssignmentsLoading(false);
    }
  };

  const handleInputChange = (field: keyof PenaltyFormData) => (
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

  // Handle shaft selection and auto-fill section
  const handleShaftChange = (event: any, newValue: any) => {
    setSelectedShaft(newValue);
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        shaftNumber: newValue.shaftNumbers || '',
        section: newValue.sectionName || ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        shaftNumber: '',
        section: ''
      }));
    }
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.shaftNumber.trim()) {
      setError('Shaft number is required');
      return;
    }
    if (!formData.penaltyFee.trim()) {
      setError('Penalty fee is required');
      return;
    }
    if (!formData.reportedBy.trim()) {
      setError('Reported by is required');
      return;
    }
    if (!formData.issue.trim()) {
      setError('Issue is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create penalty record
      await authClient.createPenalty({
        shaftNumber: formData.shaftNumber.trim(),
        section: formData.section.trim(),
        penilatyFee: parseFloat(formData.penaltyFee.trim()) || 0,
        reportedBy: formData.reportedBy.trim(),
        issue: formData.issue.trim(),
        remarks: formData.remarks.trim(),
      });

      // Suspend the shaft assignment if a shaft is selected
      if (selectedShaft && selectedShaft.id) {
        await authClient.suspendShaftAssignmentForSHE(
          selectedShaft.id,
          formData.issue.trim()
        );
      }

      setSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          shaftNumber: '',
          section: '',
          penaltyFee: '',
          reportedBy: '',
          issue: '',
          remarks: '',
        });
        setSelectedShaft(null);
        setSuccess(false);
        onClose();
        if (onSuccess) {
          onSuccess();
        }
      }, 1500);
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Failed to create penalty');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        shaftNumber: '',
        section: '',
        penaltyFee: '',
        reportedBy: '',
        issue: '',
        remarks: '',
      });
      setSelectedShaft(null);
      setShaftAssignments([]);
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  // TextField styling with rgb(5, 5, 68) theme
  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: '#d1d5db' },
      '&:hover fieldset': { borderColor: 'rgb(5, 5, 68)' },
      '&.Mui-focused fieldset': { borderColor: 'rgb(5, 5, 68)' },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: 'rgb(5, 5, 68)' },
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
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'linear-gradient(135deg,rgb(5, 5, 68) 0%,rgb(5, 5, 68) 100%)',
        color: 'white',
        py: 2.5,
        px: 3,
        m: 0
      }}>
        Issue A Penality
        <IconButton
          onClick={handleClose}
          disabled={loading}
          size="small"
          sx={{ color: 'white' }}
        >
          <CloseIcon fontSize="var(--icon-fontSize-md)" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ 
        px: 3, 
        py: 2, 
        maxHeight: '60vh', 
        overflow: 'auto',
        '&::-webkit-scrollbar': { width: '6px' },
        '&::-webkit-scrollbar-track': { backgroundColor: '#f1f1f1' },
        '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgb(5, 5, 68)', borderRadius: '3px' },
      }}>
        <Stack spacing={3}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success">
              Penalty issued successfully!
            </Alert>
          )}

          <Autocomplete
            options={shaftAssignments}
            getOptionLabel={(option) => `${option.shaftNumbers} - ${option.sectionName || 'No Section'}`}
            value={selectedShaft}
            onChange={handleShaftChange}
            loading={shaftAssignmentsLoading}
            disabled={loading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Shaft Number"
                required
                placeholder="Search and select shaft number..."
                helperText="Select a shaft number to auto-fill section"
                sx={textFieldStyle}
              />
            )}
            renderOption={(props, option) => {
              const { key, ...otherProps } = props;
              return (
                <li key={key} {...otherProps}>
                  <div>
                    <div><strong>Shaft:</strong> {option.shaftNumbers}</div>
                    <div><small>Section: {option.sectionName || 'N/A'}</small></div>
                  </div>
                </li>
              );
            }}
            isOptionEqualToValue={(option, value) => option.shaftNumbers === value?.shaftNumbers}
          />

          <TextField
            label="Section"
            value={formData.section}
            onChange={handleInputChange('section')}
            disabled={loading}
            fullWidth
            placeholder="Section (auto-filled from shaft selection)"
            helperText="This field is auto-filled when you select a shaft"
            sx={textFieldStyle}
            InputProps={{
              readOnly: true,
            }}
          />

          <TextField
            label="Penalty Fee"
            value={formData.penaltyFee}
            onChange={handleInputChange('penaltyFee')}
            disabled={loading}
            fullWidth
            required
            type="number"
            placeholder="Enter penalty fee amount..."
            helperText="Enter the penalty fee amount"
            sx={textFieldStyle}
          />

          <TextField
            label="Reported By"
            value={formData.reportedBy}
            onChange={handleInputChange('reportedBy')}
            disabled={loading}
            fullWidth
            required
            placeholder="Enter reporter name..."
            helperText="Who reported this penalty"
            sx={textFieldStyle}
          />

          <TextField
            label="Issue"
            value={formData.issue}
            onChange={handleInputChange('issue')}
            disabled={loading}
            fullWidth
            required
            multiline
            rows={3}
            placeholder="Describe the issue..."
            helperText="Describe the issue that led to this penalty"
            sx={textFieldStyle}
          />

          <TextField
            label="Remarks"
            value={formData.remarks}
            onChange={handleInputChange('remarks')}
            disabled={loading}
            fullWidth
            multiline
            rows={2}
            placeholder="Additional remarks (optional)..."
            helperText="Any additional remarks or notes"
            sx={textFieldStyle}
          />
        </Stack>
      </DialogContent>

      {/* Fixed Bottom Action Bar */}
      <DialogActions sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        px: 3, 
        py: 2, 
        background: '#fafafa', 
        borderTop: '1px solid #eaeaea' 
      }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          variant="contained"
          sx={{ 
            borderColor: theme.palette.secondary.main,
            bgcolor: theme.palette.secondary.main,
            color: 'white',
            '&:hover': { 
              borderColor: theme.palette.secondary.dark,
              bgcolor: theme.palette.secondary.dark
            } 
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || success}
          variant="contained"
          startIcon={loading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : null}
          sx={{ 
            bgcolor: theme.palette.secondary.main,
            '&:hover': { bgcolor: theme.palette.secondary.dark } 
          }}
        >
          {loading ? 'Issuing Penalty...' : 'Issue Penalty'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
