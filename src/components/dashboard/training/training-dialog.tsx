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
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import FileIcon from '@mui/icons-material/InsertDriveFile';
import type { Training } from './training-table';
import { authClient } from '@/lib/auth/client';
import { useTheme } from '@mui/material/styles';

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
  materials: File[];
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
  const theme = useTheme();
  const [formData, setFormData] = React.useState<TrainingFormData>({
    trainingType: '',
    trainerName: '',
    scheduleDate: '',
    location: '',
    materials: [],
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
          materials: [],
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

  // Handle dynamic array fields (only for safetyProtocols)
  const handleArrayFieldChange = (
    field: 'safetyProtocols',
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

  const addArrayField = (field: 'safetyProtocols') => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (field: 'safetyProtocols', index: number) => {
    if (formData[field].length > 1) {
      setFormData((prev) => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
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

  const handleMaterialsUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData((prev) => ({
      ...prev,
      materials: [...prev.materials, ...files]
    }));
  };

  const removeMaterial = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index)
    }));
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
        safetyProtocols: formData.safetyProtocols.filter(item => item.trim() !== ''),
        trainees: formData.trainees.filter(trainee => trainee.name.trim() !== ''),
      };

      // Format the data for API (materials will stay as File objects for FormData)
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
      '&:hover fieldset': { borderColor: theme.palette.secondary.main },
      '&.Mui-focused fieldset': { borderColor: theme.palette.secondary.main },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: theme.palette.secondary.main },
  };

  const renderArrayField = (
    field: 'safetyProtocols',
    label: string,
    placeholder: string
  ) => (
    <Box sx={{ 
      border: `2px solid ${theme.palette.secondary.main}`, 
      borderRadius: 2, 
      p: 2.5, 
      bgcolor: '#fafafa' 
    }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.palette.secondary.main, mb: 0.5 }}>
            {label}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {formData[field].filter(item => item.trim()).length} item{formData[field].filter(item => item.trim()).length !== 1 ? 's' : ''} added
          </Typography>
        </Box>
        <Button
          startIcon={<PlusIcon fontSize="var(--icon-fontSize-sm)" />}
          onClick={() => addArrayField(field)}
          disabled={loading}
          variant="contained"
          size="small"
          sx={{ 
            bgcolor: theme.palette.secondary.main, 
            color: 'white', 
            '&:hover': { 
              bgcolor: theme.palette.secondary.dark
            } 
          }}
        >
          Add {label.slice(0, -1)}
        </Button>
      </Stack>
      
      <Stack spacing={1.5}>
        {formData[field].length === 0 ? (
          <Typography variant="body2" sx={{ color: 'text.secondary', py: 2, textAlign: 'center' }}>
            No {label.toLowerCase()} added yet
          </Typography>
        ) : (
          formData[field].map((item, index) => (
            <Stack 
              key={index} 
              direction="row" 
              spacing={1} 
              alignItems="center"
              sx={{ 
                p: 1.5,
                bgcolor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                '&:hover': { bgcolor: 'rgba(50, 56, 62, 0.02)' }
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: 28,
                height: 28,
                bgcolor: theme.palette.secondary.main,
                color: 'white',
                borderRadius: '50%',
                fontWeight: 600,
                fontSize: '0.875rem',
                flexShrink: 0
              }}>
                {index + 1}
              </Box>
              <TextField
                value={item}
                onChange={(e) => handleArrayFieldChange(field, index, e.target.value)}
                disabled={loading}
                fullWidth
                placeholder={placeholder}
                size="small"
                variant="standard"
                InputProps={{ disableUnderline: false }}
                sx={{ 
                  '& .MuiInput-underline:hover:before': { borderBottomColor: theme.palette.secondary.main },
                  '& .MuiInput-underline:before': { borderBottomColor: '#e0e0e0' },
                  '& .MuiInput-underline.Mui-focused:after': { borderBottomColor: theme.palette.secondary.main }
                }}
              />
              {formData[field].length > 1 && (
                <IconButton
                  onClick={() => removeArrayField(field, index)}
                  disabled={loading}
                  size="small"
                  sx={{ 
                    color: 'error.main',
                    '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.08)' }
                  }}
                >
                  <TrashIcon fontSize="var(--icon-fontSize-sm)" />
                </IconButton>
              )}
            </Stack>
          ))
        )}
      </Stack>
    </Box>
  );

  const renderMaterialsUpload = () => (
    <Box sx={{ 
      border: `2px solid ${theme.palette.secondary.main}`, 
      borderRadius: 2, 
      p: 2.5, 
      bgcolor: '#fafafa' 
    }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.palette.secondary.main, mb: 0.5 }}>
            Training Materials
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {formData.materials.length} file{formData.materials.length !== 1 ? 's' : ''} uploaded
          </Typography>
        </Box>
      </Stack>

      {/* File Upload Area */}
      <Box
        sx={{
          border: `2px dashed ${theme.palette.secondary.main}`,
          borderRadius: 1.5,
          p: 3,
          textAlign: 'center',
          bgcolor: 'white',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          mb: 2.5,
          '&:hover': { bgcolor: 'rgba(50, 56, 62, 0.02)', borderColor: theme.palette.secondary.dark }
        }}
        component="label"
      >
        <input
          type="file"
          multiple
          onChange={handleMaterialsUpload}
          disabled={loading}
          style={{ display: 'none' }}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
        />
        <CloudUploadIcon sx={{ fontSize: 40, color: theme.palette.secondary.main, mb: 1 }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.secondary.main }}>
          Upload Files
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
          Supported: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, Images
        </Typography>
      </Box>

      {/* Uploaded Files */}
      {formData.materials.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.secondary', py: 2, textAlign: 'center' }}>
          No files uploaded yet
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {formData.materials.map((file, index) => (
            <Stack
              key={index}
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{
                p: 1.5,
                bgcolor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                '&:hover': { bgcolor: 'rgba(50, 56, 62, 0.02)' }
              }}
            >
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                bgcolor: theme.palette.secondary.main,
                color: 'white',
                borderRadius: '50%',
                fontWeight: 600,
                fontSize: '0.875rem',
                flexShrink: 0
              }}>
                {index + 1}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {file.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {(file.size / 1024).toFixed(2)} KB
                </Typography>
              </Box>
              <IconButton
                onClick={() => removeMaterial(index)}
                disabled={loading}
                size="small"
                sx={{
                  color: 'error.main',
                  '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.08)' }
                }}
              >
                <TrashIcon fontSize="var(--icon-fontSize-sm)" />
              </IconButton>
            </Stack>
          ))}
        </Stack>
      )}
    </Box>
  );

  const renderTraineesField = () => (
    <Box sx={{ 
      border: `2px solid ${theme.palette.secondary.main}`, 
      borderRadius: 2, 
      p: 2.5, 
      bgcolor: '#fafafa' 
    }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.palette.secondary.main, mb: 0.5 }}>
            Trainees
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {formData.trainees.filter(t => t.name.trim()).length} trainee{formData.trainees.filter(t => t.name.trim()).length !== 1 ? 's' : ''} added
          </Typography>
        </Box>
        <Button
          startIcon={<PlusIcon fontSize="var(--icon-fontSize-sm)" />}
          onClick={addTrainee}
          disabled={loading}
          variant="contained"
          size="small"
          sx={{ 
            bgcolor: theme.palette.secondary.main, 
            color: 'white', 
            '&:hover': { 
              bgcolor: theme.palette.secondary.dark
            } 
          }}
        >
          Add Trainee
        </Button>
      </Stack>

      {formData.trainees.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.secondary', py: 3, textAlign: 'center' }}>
          No trainees added yet. Click "Add Trainee" to get started.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {formData.trainees.map((trainee, index) => (
            <Box 
              key={index} 
              sx={{ 
                p: 2,
                bgcolor: 'white',
                border: `2px solid ${trainee.name.trim() ? theme.palette.secondary.main : '#e0e0e0'}`,
                borderRadius: 1.5,
                transition: 'all 0.2s ease',
                '&:hover': { boxShadow: '0 2px 8px rgba(50, 56, 62, 0.1)' }
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    bgcolor: trainee.name.trim() ? theme.palette.secondary.main : '#e0e0e0',
                    color: 'white',
                    borderRadius: '50%',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                  }}>
                    {index + 1}
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: trainee.name.trim() ? 'inherit' : 'text.secondary' }}>
                    {trainee.name.trim() || 'Trainee ' + (index + 1)}
                  </Typography>
                </Stack>
                {formData.trainees.length > 1 && (
                  <Button
                    onClick={() => removeTrainee(index)}
                    disabled={loading}
                    size="small"
                    startIcon={<TrashIcon fontSize="var(--icon-fontSize-sm)" />}
                    sx={{ 
                      color: 'error.main',
                      '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.08)' }
                    }}
                  >
                    Remove
                  </Button>
                )}
              </Stack>
              <Stack spacing={1.5}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <TextField
                    label="Name"
                    value={trainee.name}
                    onChange={(e) => handleTraineeFieldChange(index, 'name', e.target.value)}
                    disabled={loading}
                    fullWidth
                    placeholder="Enter trainee name..."
                    size="small"
                    sx={textFieldStyle}
                  />
                  <TextField
                    label="Employee ID"
                    value={trainee.employeeId}
                    onChange={(e) => handleTraineeFieldChange(index, 'employeeId', e.target.value)}
                    disabled={loading}
                    fullWidth
                    placeholder="Enter employee ID..."
                    size="small"
                    sx={textFieldStyle}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <TextField
                    label="Department"
                    value={trainee.department}
                    onChange={(e) => handleTraineeFieldChange(index, 'department', e.target.value)}
                    disabled={loading}
                    fullWidth
                    placeholder="Enter department..."
                    size="small"
                    sx={textFieldStyle}
                  />
                  <TextField
                    label="Position"
                    value={trainee.position}
                    onChange={(e) => handleTraineeFieldChange(index, 'position', e.target.value)}
                    disabled={loading}
                    fullWidth
                    placeholder="Enter position..."
                    size="small"
                    sx={textFieldStyle}
                  />
                </Stack>
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
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
        background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
        color: 'white',
        py: 2.5,
        px: 3,
        m: 0,
        fontWeight: 600
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
        '&::-webkit-scrollbar-thumb': { backgroundColor: theme.palette.secondary.main, borderRadius: '3px' },
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

          {renderMaterialsUpload()}
          
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
            borderColor: theme.palette.secondary.main, 
            color: theme.palette.secondary.main, 
            '&:hover': { 
              borderColor: theme.palette.secondary.dark, 
              backgroundColor: 'rgba(50, 56, 62, 0.04)' 
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
            bgcolor: theme.palette.secondary.main,
            '&:hover': { bgcolor: theme.palette.secondary.dark } 
          }}
        >
          {loading ? (training ? 'Updating...' : 'Creating...') : (training ? 'Update Training' : 'Create Training')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
