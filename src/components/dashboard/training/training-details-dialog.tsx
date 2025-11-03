'use client';

import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import PrintIcon from '@mui/icons-material/Print';
import Skeleton from '@mui/material/Skeleton';
import { useTheme } from '@mui/material/styles';
import { authClient } from '@/lib/auth/client';

interface TrainingDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  trainingId: string | null;
  onRefresh?: () => void;
}

export function TrainingDetailsDialog({ open, onClose, trainingId, onRefresh }: TrainingDetailsDialogProps): React.JSX.Element {
  const theme = useTheme();
  const [trainingDetails, setTrainingDetails] = React.useState<any>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');

  // Helper function to convert API date array to string
  const convertDateArray = (dateArray: number[]): string => {
    if (!Array.isArray(dateArray) || dateArray.length < 3) {
      return 'N/A';
    }
    const [year, month, day] = dateArray;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  React.useEffect(() => {
    const fetchTrainingDetails = async () => {
      if (!trainingId) return;
      
      setLoading(true);
      setError('');
      try {
        const result = await authClient.fetchTrainingById(trainingId);
        if (result.success && result.data) {
          console.log('Fetched training details:', result.data);
          setTrainingDetails(result.data);
        } else {
          setError(result.error || 'Failed to load training details');
        }
      } catch (error_) {
        console.error('Error fetching training details:', error_);
        setError('Failed to load training details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (open && trainingId) {
      fetchTrainingDetails();
    } else {
      // Reset state when dialog closes
      setTrainingDetails(null);
      setError('');
    }
  }, [open, trainingId]);

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    setTrainingDetails(null);
    setError('');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
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
        Training Details
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            onClick={handlePrint}
            size="small"
            sx={{ color: 'white' }}
          >
            <PrintIcon fontSize="small" />
          </IconButton>
          <IconButton
            onClick={handleClose}
            size="small"
            sx={{ color: 'white' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {loading && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress size={40} sx={{ color: theme.palette.secondary.main }} />
            <Typography sx={{ mt: 2, color: 'text.secondary' }}>Loading training details...</Typography>
          </Box>
        )}

        {error && (
          <Box sx={{ p: 3 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          </Box>
        )}

        {!loading && !error && trainingDetails && (
          <Box id="training-details-content" sx={{ p: 3 }}>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
              gap: 3,
              mb: 3
            }}>
              {/* Basic Information */}
              <Box sx={{ 
                border: `2px solid ${theme.palette.secondary.main}`, 
                borderRadius: '12px', 
                p: 2.5,
                bgcolor: '#ffffff'
              }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    color: theme.palette.secondary.main, 
                    fontWeight: 700, 
                    mb: 2,
                    fontSize: '1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  Basic Information
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography sx={{ mb: 1.5, fontSize: '0.95rem' }}>
                    <strong>Training Type:</strong> {trainingDetails?.trainingType || 'N/A'}
                  </Typography>
                  <Typography sx={{ mb: 1.5, fontSize: '0.95rem' }}>
                    <strong>Trainer Name:</strong> {trainingDetails?.trainerName || 'N/A'}
                  </Typography>
                  <Typography sx={{ mb: 1.5, fontSize: '0.95rem' }}>
                    <strong>Schedule Date:</strong> {convertDateArray(trainingDetails?.scheduleDate)}
                  </Typography>
                  <Typography sx={{ mb: 1.5, fontSize: '0.95rem' }}>
                    <strong>Location:</strong> {trainingDetails?.location || 'N/A'}
                  </Typography>
                  <Typography sx={{ fontSize: '0.95rem' }}>
                    <strong>Status:</strong> 
                    <Box 
                      component="span" 
                      sx={{
                        display: 'inline-block',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        ml: 1,
                        bgcolor: 
                          trainingDetails?.status === 'Scheduled' ? '#FFF9C4' : 
                          trainingDetails?.status === 'Cancelled' ? '#FFCDD2' : 
                          trainingDetails?.status === 'In Progress' ? '#FFE0B2' : 
                          '#C8E6C9',
                        color: 
                          trainingDetails?.status === 'Scheduled' ? '#F57F17' : 
                          trainingDetails?.status === 'Cancelled' ? '#B71C1C' : 
                          trainingDetails?.status === 'In Progress' ? '#E65100' : 
                          '#1B5E20',
                        fontWeight: 'medium',
                        fontSize: '0.875rem'
                      }}
                    >
                      {trainingDetails?.status || 'Scheduled'}
                    </Box>
                  </Typography>
                </Box>
              </Box>

              {/* Materials */}
              <Box sx={{ 
                border: `2px solid ${theme.palette.secondary.main}`, 
                borderRadius: '12px', 
                p: 2.5,
                bgcolor: '#ffffff'
              }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    color: theme.palette.secondary.main, 
                    fontWeight: 700, 
                    mb: 2,
                    fontSize: '1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  Materials
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {trainingDetails?.materials?.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {trainingDetails.materials.map((material: string, index: number) => (
                        <Chip 
                          key={index} 
                          label={material} 
                          size="small" 
                          sx={{ 
                            bgcolor: theme.palette.secondary.main, 
                            color: '#ffffff',
                            fontWeight: 500
                          }} 
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography sx={{ fontSize: '0.95rem', color: 'text.secondary' }}>
                      No materials specified
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Safety Protocols */}
            <Box sx={{ 
              border: `2px solid ${theme.palette.secondary.main}`, 
              borderRadius: '12px', 
              p: 2.5, 
              mb: 3, 
              bgcolor: '#ffffff' 
            }}>
              <Typography variant="subtitle1" sx={{ 
                color: theme.palette.secondary.main, 
                fontWeight: 700, 
                mb: 2,
                fontSize: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Safety Protocols
              </Typography>
              <Box sx={{ mt: 2 }}>
                {trainingDetails?.safetyProtocols?.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {trainingDetails.safetyProtocols.map((protocol: string, index: number) => (
                      <Chip 
                        key={index} 
                        label={protocol} 
                        size="small" 
                        variant="outlined"
                        sx={{ 
                          borderColor: theme.palette.secondary.main,
                          color: theme.palette.secondary.main,
                          fontWeight: 500
                        }} 
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography sx={{ fontSize: '0.95rem', color: 'text.secondary' }}>
                    No safety protocols specified
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Trainees */}
            <Box sx={{ 
              border: `2px solid ${theme.palette.secondary.main}`, 
              borderRadius: '12px', 
              p: 2.5, 
              bgcolor: '#ffffff' 
            }}>
              <Typography variant="subtitle1" sx={{ 
                color: theme.palette.secondary.main, 
                fontWeight: 700, 
                mb: 2,
                fontSize: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Trainees ({trainingDetails?.trainees?.length || 0})
              </Typography>
              <Box sx={{ mt: 2 }}>
                {trainingDetails?.trainees?.length > 0 ? (
                  <Box sx={{ display: 'grid', gap: 2 }}>
                    {trainingDetails.trainees.map((trainee: any, index: number) => (
                      <Box 
                        key={index}
                        sx={{ 
                          border: '1px solid #e0e0e0',
                          borderRadius: 2,
                          p: 2,
                          bgcolor: '#fafafa'
                        }}
                      >
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                          <Typography sx={{ fontSize: '0.9rem' }}>
                            <strong>Name:</strong> {trainee.name || 'N/A'}
                          </Typography>
                          <Typography sx={{ fontSize: '0.9rem' }}>
                            <strong>Employee ID:</strong> {trainee.employeeId || 'N/A'}
                          </Typography>
                          <Typography sx={{ fontSize: '0.9rem' }}>
                            <strong>Department:</strong> {trainee.department || 'N/A'}
                          </Typography>
                          <Typography sx={{ fontSize: '0.9rem' }}>
                            <strong>Position:</strong> {trainee.position || 'N/A'}
                          </Typography>
                          <Typography component="div" sx={{ fontSize: '0.9rem' }}>
                            <strong>Attended:</strong> 
                            <Chip 
                              label={trainee.attended ? 'Yes' : 'No'}
                              size="small"
                              color={trainee.attended ? 'success' : 'default'}
                              sx={{ ml: 1, fontSize: '0.75rem' }}
                            />
                          </Typography>
                          {trainee.feedback && (
                            <Typography sx={{ fontSize: '0.9rem', gridColumn: '1 / -1' }}>
                              <strong>Feedback:</strong> {trainee.feedback}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography sx={{ fontSize: '0.95rem', color: 'text.secondary' }}>
                    No trainees registered
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        )}

        {!loading && !error && !trainingDetails && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">No training details available</Typography>
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
          onClick={handleClose}
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
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
