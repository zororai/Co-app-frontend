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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import { X as CloseIcon } from '@phosphor-icons/react/dist/ssr/X';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import type { Training } from './training-table';
import { authClient } from '@/lib/auth/client';

interface TrainingDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (training: Omit<Training, 'id' | 'createdAt'>) => void;
  training?: Training | null;
}

interface TraineeData {
  name: string;
  employeeId: string;
  department: string;
  position: string;
  attended: boolean;
  feedback: string;
}

interface TrainingFormData {
  trainingType: string;
  trainerName: string;
  scheduleDate: string;
  location: string;
  materials: string[];
  safetyProtocols: string[];
  trainees: TraineeData[];
  status: Training['status'];
}

const trainingTypes = [
  'Hazard Handling',
  'Equipment Safety',
  'Fire Safety',
  'Chemical Safety',
  'Emergency Response',
  'First Aid',
  'Confined Space',
  'Working at Height',
  'Electrical Safety',
  'Personal Protective Equipment'
];

export function TrainingDialog({ 
  open, 
  onClose, 
  onSuccess, 
  training 
}: TrainingDialogProps): React.JSX.Element {
  const [formData, setFormData] = React.useState<TrainingFormData>({
    trainingType: '',
    trainerName: '',
    scheduleDate: '',
    location: '',
    materials: [''],
    safetyProtocols: [''],
    trainees: [{
      name: '',
      employeeId: '',
      department: '',
      position: '',
      attended: false,
      feedback: ''
    }],
    status: 'Scheduled',
  });

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      if (training) {
        setFormData({
          trainingType: training.trainingType,
          trainerName: training.trainerName,
          scheduleDate: training.scheduleDate,
          location: training.location,
          materials: training.materials.length > 0 ? training.materials : [''],
          safetyProtocols: training.safetyProtocols.length > 0 ? training.safetyProtocols : [''],
          trainees: training.trainees.length > 0 ? training.trainees.map(name => ({
            name: typeof name === 'string' ? name : '',
            employeeId: '',
            department: '',
            position: '',
            attended: false,
            feedback: ''
          })) : [{
            name: '',
            employeeId: '',
            department: '',
            position: '',
            attended: false,
            feedback: ''
          }],
          status: training.status,
        });
      } else {
        setFormData({
          trainingType: '',
          trainerName: '',
          scheduleDate: '',
          location: '',
          materials: [''],
          safetyProtocols: [''],
          trainees: [{
            name: '',
            employeeId: '',
            department: '',
            position: '',
            attended: false,
            feedback: ''
          }],
          status: 'Scheduled',
        });
      }
      setError(null);
      setSuccess(false);
    }
  }, [open, training]);

  const handleInputChange = (field: keyof TrainingFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: unknown } }
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    if (error) {
      setError(null);
    }
  };

  // Handle dynamic array fields
  const handleArrayFieldChange = (
    field: 'materials' | 'safetyProtocols',
    index: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
    if (error) {
      setError(null);
    }
  };

  // Handle trainee field changes
  const handleTraineeFieldChange = (
    index: number,
    field: keyof TraineeData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      trainees: prev.trainees.map((trainee, i) => 
        i === index ? { ...trainee, [field]: value } : trainee
      )
    }));
    if (error) {
      setError(null);
    }
  };

  const addArrayField = (field: 'materials' | 'safetyProtocols') => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const addTrainee = () => {
    setFormData((prev) => ({
      ...prev,
      trainees: [...prev.trainees, {
        name: '',
        employeeId: '',
        department: '',
        position: '',
        attended: false,
        feedback: ''
      }]
    }));
  };

  const removeArrayField = (field: 'materials' | 'safetyProtocols', index: number) => {
    if (formData[field].length > 1) {
      setFormData((prev) => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  const removeTrainee = (index: number) => {
    if (formData.trainees.length > 1) {
      setFormData((prev) => ({
        ...prev,
        trainees: prev.trainees.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.trainingType.trim()) {
      setError('Training type is required');
      return;
    }
    if (!formData.trainerName.trim()) {
      setError('Trainer name is required');
      return;
    }
    if (!formData.scheduleDate.trim()) {
      setError('Schedule date is required');
      return;
    }
    if (!formData.location.trim()) {
      setError('Location is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Filter out empty strings from arrays and validate trainees
      const cleanedData = {
        ...formData,
        materials: formData.materials.filter(item => item.trim() !== ''),
        safetyProtocols: formData.safetyProtocols.filter(item => item.trim() !== ''),
        trainees: formData.trainees.filter(trainee => trainee.name.trim() !== ''),
      };

      // Format the data for API
      const apiData = {
        ...cleanedData,
        scheduleDate: new Date(cleanedData.scheduleDate).toISOString(),
      };

      // Call the API
      const result = await authClient.createTraining(apiData);
      
      if (!result.success) {
        setError(result.error || 'Failed to create training');
        return;
      }
      
      setSuccess(true);
      
      // Call success callback to refresh the table
      if (onSuccess) {
        // Convert trainees back to string array for compatibility with existing table
        const compatibleData = {
          ...cleanedData,
          trainees: cleanedData.trainees.map(t => t.name)
        };
        onSuccess(compatibleData as any);
      }
      
      // Close dialog after success
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Failed to create training');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  // TextField styling
  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: '#d1d5db' },
      '&:hover fieldset': { borderColor: 'rgb(5, 5, 68)' },
      '&.Mui-focused fieldset': { borderColor: 'rgb(5, 5, 68)' },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: 'rgb(5, 5, 68)' },
  };

  const renderArrayField = (
    field: 'materials' | 'safetyProtocols',
    label: string,
    placeholder: string
  ) => (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
          {label}
        </Typography>
        <Button
          startIcon={<PlusIcon fontSize="var(--icon-fontSize-sm)" />}
          onClick={() => addArrayField(field)}
          disabled={loading}
          variant="outlined"
          size="small"
          sx={{ 
            borderColor: 'rgb(5, 5, 68)', 
            color: 'rgb(5, 5, 68)', 
            '&:hover': { 
              borderColor: 'rgb(5, 5, 68)', 
              backgroundColor: 'rgba(5, 5, 68, 0.04)' 
            } 
          }}
        >
          Add {label.slice(0, -1)}
        </Button>
      </Stack>
      
      <Stack spacing={2}>
        {formData[field].map((item, index) => (
          <Stack key={index} direction="row" spacing={2} alignItems="flex-start">
            <TextField
              value={item}
              onChange={(e) => handleArrayFieldChange(field, index, e.target.value)}
              disabled={loading}
              fullWidth
              placeholder={placeholder}
              sx={textFieldStyle}
            />
            {formData[field].length > 1 && (
              <IconButton
                onClick={() => removeArrayField(field, index)}
                disabled={loading}
                size="small"
                sx={{ 
                  mt: 0.5,
                  color: 'error.main',
                  '&:hover': { backgroundColor: 'error.light', color: 'white' }
                }}
              >
                <TrashIcon fontSize="var(--icon-fontSize-sm)" />
              </IconButton>
            )}
          </Stack>
        ))}
      </Stack>
    </Box>
  );

  const renderTraineesField = () => (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
          Trainees
        </Typography>
        <Button
          startIcon={<PlusIcon fontSize="var(--icon-fontSize-sm)" />}
          onClick={addTrainee}
          disabled={loading}
          variant="outlined"
          size="small"
          sx={{ 
            borderColor: 'rgb(5, 5, 68)', 
            color: 'rgb(5, 5, 68)', 
            '&:hover': { 
              borderColor: 'rgb(5, 5, 68)', 
              backgroundColor: 'rgba(5, 5, 68, 0.04)' 
            } 
          }}
        >
          Add Trainee
        </Button>
      </Stack>
      
      <Stack spacing={2}>
        {formData.trainees.map((trainee, index) => (
          <Box key={index} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <TextField
                  label="Name"
                  value={trainee.name}
                  onChange={(e) => handleTraineeFieldChange(index, 'name', e.target.value)}
                  disabled={loading}
                  fullWidth
                  placeholder="Enter trainee name..."
                  sx={textFieldStyle}
                />
                <TextField
                  label="Employee ID"
                  value={trainee.employeeId}
                  onChange={(e) => handleTraineeFieldChange(index, 'employeeId', e.target.value)}
                  disabled={loading}
                  fullWidth
                  placeholder="Enter employee ID..."
                  sx={textFieldStyle}
                />
                {formData.trainees.length > 1 && (
                  <IconButton
                    onClick={() => removeTrainee(index)}
                    disabled={loading}
                    size="small"
                    sx={{ 
                      color: 'rgb(239, 68, 68)', 
                      '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.04)' } 
                    }}
                  >
                    <TrashIcon fontSize="var(--icon-fontSize-sm)" />
                  </IconButton>
                )}
              </Stack>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Department"
                  value={trainee.department}
                  onChange={(e) => handleTraineeFieldChange(index, 'department', e.target.value)}
                  disabled={loading}
                  fullWidth
                  placeholder="Enter department..."
                  sx={textFieldStyle}
                />
                <TextField
                  label="Position"
                  value={trainee.position}
                  onChange={(e) => handleTraineeFieldChange(index, 'position', e.target.value)}
                  disabled={loading}
                  fullWidth
                  placeholder="Enter position..."
                  sx={textFieldStyle}
                />
              </Stack>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  );

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
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
        {training ? 'Edit Training' : 'Create Training'}
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
        maxHeight: '70vh', 
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
              Training {training ? 'updated' : 'created'} successfully!
            </Alert>
          )}

          <FormControl fullWidth sx={textFieldStyle}>
            <InputLabel>Training Type</InputLabel>
            <Select
              value={formData.trainingType}
              onChange={handleInputChange('trainingType')}
              disabled={loading}
              label="Training Type"
            >
              {trainingTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Trainer Name"
            value={formData.trainerName}
            onChange={handleInputChange('trainerName')}
            disabled={loading}
            fullWidth
            required
            placeholder="Enter trainer name..."
            sx={textFieldStyle}
          />

          <TextField
            label="Schedule Date"
            value={formData.scheduleDate}
            onChange={handleInputChange('scheduleDate')}
            disabled={loading}
            fullWidth
            required
            type="date"
            InputLabelProps={{ shrink: true }}
            sx={textFieldStyle}
          />

          <TextField
            label="Location"
            value={formData.location}
            onChange={handleInputChange('location')}
            disabled={loading}
            fullWidth
            required
            placeholder="Enter training location..."
            sx={textFieldStyle}
          />

          {renderArrayField('materials', 'Materials', 'Enter material name...')}
          
          {renderArrayField('safetyProtocols', 'Safety Protocols', 'Enter safety protocol...')}
          
          {renderTraineesField()}

          <FormControl fullWidth sx={textFieldStyle}>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              onChange={handleInputChange('status')}
              disabled={loading}
              label="Status"
            >
              <MenuItem value="Scheduled">Scheduled</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>

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
          variant="outlined"
          sx={{ 
            borderColor: 'rgb(5, 5, 68)', 
            color: 'rgb(5, 5, 68)', 
            '&:hover': { 
              borderColor: 'rgb(5, 5, 68)', 
              backgroundColor: 'rgba(5, 5, 68, 0.04)' 
            } 
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || success}
          variant="contained"
          startIcon={loading ? <CircularProgress size={16} /> : null}
          sx={{ 
            bgcolor: 'rgb(5, 5, 68)',
            '&:hover': { bgcolor: 'rgba(5, 5, 68, 0.9)' } 
          }}
        >
          {loading ? (training ? 'Updating...' : 'Creating...') : (training ? 'Update Training' : 'Create Training')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
