'use client';

import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useTheme } from '@mui/material/styles';
import { authClient } from '@/lib/auth/client';

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
  status: string;
}

interface EditTrainingDialogProps {
  open: boolean;
  onClose: () => void;
  trainingId: string | null;
  onSuccess?: () => void;
}

export function EditTrainingDialog({ open, onClose, trainingId, onSuccess }: EditTrainingDialogProps): React.JSX.Element {
  const theme = useTheme();
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
  const [fetchLoading, setFetchLoading] = React.useState(false);

  // Helper function to convert API date array to string
  const convertDateArray = (dateArray: number[]): string => {
    if (!Array.isArray(dateArray) || dateArray.length < 3) {
      return '';
    }
    const [year, month, day] = dateArray;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // Fetch training data when dialog opens
  React.useEffect(() => {
    const fetchTrainingData = async () => {
      if (!trainingId || !open) return;
      
      setFetchLoading(true);
      setError(null);
      
      try {
        const result = await authClient.fetchTrainingById(trainingId);
        if (result.success && result.data) {
          const data = result.data;
          setFormData({
            trainingType: data.trainingType || '',
            trainerName: data.trainerName || '',
            scheduleDate: convertDateArray(data.scheduleDate),
            location: data.location || '',
            materials: Array.isArray(data.materials) && data.materials.length > 0 ? data.materials : [''],
            safetyProtocols: Array.isArray(data.safetyProtocols) && data.safetyProtocols.length > 0 ? data.safetyProtocols : [''],
            trainees: Array.isArray(data.trainees) && data.trainees.length > 0 ? data.trainees : [{
              name: '',
              employeeId: '',
              department: '',
              position: '',
              attended: false,
              feedback: ''
            }],
            status: data.status || 'Scheduled',
          });
        } else {
          setError(result.error || 'Failed to load training data');
        }
      } catch (error) {
        setError('Failed to load training data');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchTrainingData();
  }, [trainingId, open]);

  // Reset form when dialog closes
  React.useEffect(() => {
    if (!open) {
      setError(null);
      setSuccess(false);
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
  }, [open]);

  const handleInputChange = (field: keyof TrainingFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: string } }
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleArrayFieldChange = (field: 'materials' | 'safetyProtocols', index: number) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? event.target.value : item)
    }));
  };

  const addArrayField = (field: 'materials' | 'safetyProtocols') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (field: 'materials' | 'safetyProtocols', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleTraineeChange = (index: number, field: keyof TraineeData) => (
    event: React.ChangeEvent<HTMLInputElement> | { target: { value: string | boolean } }
  ) => {
    setFormData(prev => ({
      ...prev,
      trainees: prev.trainees.map((trainee, i) => 
        i === index ? { ...trainee, [field]: event.target.value } : trainee
      )
    }));
  };

  const addTrainee = () => {
    setFormData(prev => ({
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

  const removeTrainee = (index: number) => {
    setFormData(prev => ({
      ...prev,
      trainees: prev.trainees.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!trainingId) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

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
      const result = await authClient.updateTraining(trainingId, apiData);
      
      if (!result.success) {
        setError(result.error || 'Failed to update training');
        return;
      }
      
      setSuccess(true);
      
      // Call success callback to refresh the table
      if (onSuccess) {
        onSuccess();
      }
      
      // Close dialog after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderArrayField = (field: 'materials' | 'safetyProtocols', label: string, placeholder: string) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        {label}
      </Typography>
      {formData[field].map((item, index) => (
        <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <TextField
            fullWidth
            size="small"
            value={item}
            onChange={handleArrayFieldChange(field, index)}
            placeholder={placeholder}
          />
          {formData[field].length > 1 && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => removeArrayField(field, index)}
              sx={{ minWidth: 'auto', px: 1 }}
            >
              ×
            </Button>
          )}
        </Box>
      ))}
      <Button
        variant="outlined"
        size="small"
        onClick={() => addArrayField(field)}
        sx={{ mt: 1 }}
      >
        Add {label.slice(0, -1)}
      </Button>
    </Box>
  );

  const renderTraineesField = () => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        Trainees
      </Typography>
      {formData.trainees.map((trainee, index) => (
        <Box key={index} sx={{ 
          border: '1px solid #e0e0e0', 
          borderRadius: 1, 
          p: 2, 
          mb: 2,
          bgcolor: '#fafafa'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle3" sx={{ fontWeight: 600 }}>
              Trainee {index + 1}
            </Typography>
            {formData.trainees.length > 1 && (
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => removeTrainee(index)}
                sx={{ minWidth: 'auto', px: 1 }}
              >
                Remove
              </Button>
            )}
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="Name"
              value={trainee.name}
              onChange={handleTraineeChange(index, 'name')}
              required
            />
            <TextField
              fullWidth
              size="small"
              label="Employee ID"
              value={trainee.employeeId}
              onChange={handleTraineeChange(index, 'employeeId')}
            />
            <TextField
              fullWidth
              size="small"
              label="Department"
              value={trainee.department}
              onChange={handleTraineeChange(index, 'department')}
            />
            <TextField
              fullWidth
              size="small"
              label="Position"
              value={trainee.position}
              onChange={handleTraineeChange(index, 'position')}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={trainee.attended}
                  onChange={(e) => handleTraineeChange(index, 'attended')({ target: { value: e.target.checked } })}
                />
              }
              label="Attended"
            />
            <TextField
              fullWidth
              size="small"
              label="Feedback"
              value={trainee.feedback}
              onChange={handleTraineeChange(index, 'feedback')}
              multiline
              rows={2}
            />
          </Box>
        </Box>
      ))}
      <Button
        variant="outlined"
        size="small"
        onClick={addTrainee}
        sx={{ mt: 1 }}
      >
        Add Trainee
      </Button>
    </Box>
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 3,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
        color: 'white',
        py: 2.5,
        px: 3,
        m: 0,
        fontWeight: 600
      }}>
        Edit Training
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: 'white' }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {fetchLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Training updated successfully!
          </Alert>
        )}

        {!fetchLoading && (
          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                label="Training Type"
                value={formData.trainingType}
                onChange={handleInputChange('trainingType')}
                required
                disabled={loading}
              />
              <TextField
                fullWidth
                label="Trainer Name"
                value={formData.trainerName}
                onChange={handleInputChange('trainerName')}
                required
                disabled={loading}
              />
              <TextField
                fullWidth
                label="Schedule Date"
                type="date"
                value={formData.scheduleDate}
                onChange={handleInputChange('scheduleDate')}
                required
                disabled={loading}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={handleInputChange('location')}
                required
                disabled={loading}
              />
            </Box>

            <FormControl fullWidth sx={{ mb: 2 }}>
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

            {renderArrayField('materials', 'Materials', 'Enter material name...')}
            {renderArrayField('safetyProtocols', 'Safety Protocols', 'Enter safety protocol...')}
            {renderTraineesField()}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ 
        px: 3, 
        py: 2, 
        background: '#fafafa', 
        borderTop: '1px solid #eaeaea' 
      }}>
        <Button 
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          sx={{ 
            borderColor: theme.palette.secondary.main,
            color: theme.palette.secondary.main,
            '&:hover': {
              borderColor: theme.palette.secondary.dark,
              bgcolor: 'rgba(50, 56, 62, 0.04)'
            }
          }}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          onClick={handleSubmit}
          disabled={loading || fetchLoading}
          variant="contained"
          sx={{ 
            bgcolor: theme.palette.secondary.main,
            '&:hover': { bgcolor: theme.palette.secondary.dark }
          }}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? 'Updating...' : 'Update Training'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
