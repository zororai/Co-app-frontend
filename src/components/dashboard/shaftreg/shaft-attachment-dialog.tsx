'use client';

import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { authClient } from '@/lib/auth/client';

export interface ShaftAttachmentDialogProps {
  open: boolean;
  onClose: () => void;
  customerId?: string;
}

interface ShaftAssignmentData {
  sectionName: string;
  shaftNumbers: string;
  medicalFee: string;
  regFee: string;
  startContractDate: string;
  endContractDate: string;
}

export function ShaftAttachmentDialog({
  open,
  onClose,
  customerId,
}: ShaftAttachmentDialogProps): React.JSX.Element {
  const [formData, setFormData] = React.useState<ShaftAssignmentData>({
    sectionName: '',
    shaftNumbers: '',
    medicalFee: '',
    regFee: '',
    startContractDate: '',
    endContractDate: '',
  });
  
  const [startDate, setStartDate] = React.useState<Dayjs | null>(null);
  const [endDate, setEndDate] = React.useState<Dayjs | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleInputChange = (field: keyof ShaftAssignmentData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleStartDateChange = (newValue: Dayjs | null) => {
    setStartDate(newValue);
    setFormData(prev => ({
      ...prev,
      startContractDate: newValue ? newValue.format('YYYY-MM-DD') : '',
    }));
  };

  const handleEndDateChange = (newValue: Dayjs | null) => {
    setEndDate(newValue);
    setFormData(prev => ({
      ...prev,
      endContractDate: newValue ? newValue.format('YYYY-MM-DD') : '',
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.sectionName || !formData.shaftNumbers || !formData.medicalFee || 
          !formData.regFee || !formData.startContractDate || !formData.endContractDate) {
        throw new Error('Please fill in all required fields');
      }

      console.log('Submitting shaft assignment data:', formData);
      const result = await authClient.createShaftAssignment(formData);
      
      console.log('Shaft assignment result:', result);
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      sectionName: '',
      shaftNumbers: '',
      medicalFee: '',
      regFee: '',
      startContractDate: '',
      endContractDate: '',
    });
    setStartDate(null);
    setEndDate(null);
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" component="div">
            Shaft Attachment
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Shaft assignment created successfully!
              </Alert>
            )}

            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr' }}>
              <TextField
                fullWidth
                label="Section Name"
                value={formData.sectionName}
                onChange={handleInputChange('sectionName')}
                required
                disabled={loading}
              />

              <TextField
                fullWidth
                label="Shaft Numbers"
                placeholder="Please enter number"
                value={formData.shaftNumbers}
                onChange={handleInputChange('shaftNumbers')}
                required
                disabled={loading}
              />

              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 1fr' }}>
                <TextField
                  fullWidth
                  label="Medical Fee"
                  placeholder="Please enter Medical Fee"
                  value={formData.medicalFee}
                  onChange={handleInputChange('medicalFee')}
                  required
                  disabled={loading}
                />

                <TextField
                  fullWidth
                  label="Reg Fee"
                  placeholder="Please enter Registration Fee"
                  value={formData.regFee}
                  onChange={handleInputChange('regFee')}
                  required
                  disabled={loading}
                />
              </Box>

              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 1fr' }}>
                <DatePicker
                  label="Start Contract Date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  disabled={loading}
                  slotProps={{
                    textField: {
                      required: true,
                      fullWidth: true,
                    },
                  }}
                />

                <DatePicker
                  label="End Contract Date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  disabled={loading}
                  minDate={startDate || undefined}
                  slotProps={{
                    textField: {
                      required: true,
                      fullWidth: true,
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleClose} 
            disabled={loading}
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            sx={{
              bgcolor: '#6366f1',
              '&:hover': {
                bgcolor: '#5048e5',
              },
              px: 4,
            }}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
