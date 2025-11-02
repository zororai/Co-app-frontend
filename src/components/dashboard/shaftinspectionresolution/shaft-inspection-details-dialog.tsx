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
import Tooltip from '@mui/material/Tooltip';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import PrintIcon from '@mui/icons-material/Print';
import Skeleton from '@mui/material/Skeleton';
import { useTheme } from '@mui/material/styles';
import { authClient } from '@/lib/auth/client';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface ShaftInspectionDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  inspectionId: string | null;
  onRefresh?: () => void;
}

export function ShaftInspectionDetailsDialog({ open, onClose, inspectionId, onRefresh }: ShaftInspectionDetailsDialogProps): React.JSX.Element {
  const theme = useTheme();
  const [inspectionDetails, setInspectionDetails] = React.useState<any>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');

  // Helper function to convert API date array to string
  const convertDateArray = (dateArray: number[] | string): string => {
    if (typeof dateArray === 'string') {
      return new Date(dateArray).toLocaleDateString();
    }
    if (!Array.isArray(dateArray) || dateArray.length < 3) {
      return 'N/A';
    }
    const [year, month, day] = dateArray;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // Helper function to format time object to string
  const formatTime = (
    timeObj?: { hour?: number; minute?: number; second?: number; nano?: number } | string | null | number[]
  ): string => {
    if (!timeObj) return '';
    if (typeof timeObj === 'string') return timeObj;
    
    // Handle array format (extract time from date array)
    if (Array.isArray(timeObj) && timeObj.length >= 6) {
      const [, , , hour = 0, minute = 0] = timeObj;
      const hourNum = Number(hour);
      const minuteNum = Number(minute);
      const period = hourNum >= 12 ? 'PM' : 'AM';
      const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
      return `${displayHour}:${minuteNum.toString().padStart(2, '0')} ${period}`;
    }
    
    // Handle object format
    if (typeof timeObj === 'object' && timeObj !== null && !Array.isArray(timeObj)) {
      const hourNum = Number(timeObj.hour ?? 0);
      const minuteNum = Number(timeObj.minute ?? 0);
      const period = hourNum >= 12 ? 'PM' : 'AM';
      const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
      return `${displayHour}:${minuteNum.toString().padStart(2, '0')} ${period}`;
    }
    
    return '';
  };

  // Helper function to get file extension
  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  // Helper function to get file icon based on extension
  const getFileIcon = (filename: string) => {
    const extension = getFileExtension(filename);
    
    switch (extension) {
      case 'pdf':
        return <PictureAsPdfIcon sx={{ color: '#d32f2f' }} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'svg':
      case 'webp':
        return <ImageIcon sx={{ color: '#2e7d32' }} />;
      case 'doc':
      case 'docx':
      case 'txt':
      case 'rtf':
        return <DescriptionIcon sx={{ color: '#1976d2' }} />;
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'wmv':
      case 'flv':
        return <VideoFileIcon sx={{ color: '#7b1fa2' }} />;
      case 'mp3':
      case 'wav':
      case 'flac':
      case 'aac':
        return <AudioFileIcon sx={{ color: '#f57c00' }} />;
      default:
        return <AttachFileIcon sx={{ color: '#616161' }} />;
    }
  };

  // Helper function to determine if file can be viewed in browser
  const canViewInBrowser = (filename: string): boolean => {
    const extension = getFileExtension(filename);
    const viewableExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'svg', 'txt'];
    return viewableExtensions.includes(extension);
  };

  // Function to handle file viewing/downloading
  const handleAttachmentClick = (attachment: string) => {
    // Construct the file URL - adjust this based on your API structure
    const fileUrl = `/api/shaft-inspections/${inspectionId}/attachments/${encodeURIComponent(attachment)}`;
    
    if (canViewInBrowser(attachment)) {
      // Open in new tab for viewable files
      window.open(fileUrl, '_blank');
    } else {
      // Download for non-viewable files
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = attachment;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  React.useEffect(() => {
    const fetchInspectionDetails = async () => {
      if (!inspectionId) return;
      
      setLoading(true);
      setError('');
      try {
        const result = await authClient.fetchShaftInspectionById(inspectionId);
        if (result.success && result.data) {
          console.log('Fetched shaft inspection details:', result.data);
          setInspectionDetails(result.data);
        } else {
          setError(result.error || 'Failed to load inspection details');
        }
      } catch (error_) {
        console.error('Error fetching inspection details:', error_);
        setError('Failed to load inspection details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (open && inspectionId) {
      fetchInspectionDetails();
    } else {
      // Reset state when dialog closes
      setInspectionDetails(null);
      setError('');
    }
  }, [open, inspectionId]);

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    setInspectionDetails(null);
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
        Shaft Inspection Details
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
            <Typography sx={{ mt: 2, color: 'text.secondary' }}>Loading inspection details...</Typography>
          </Box>
        )}

        {error && (
          <Box sx={{ p: 3 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          </Box>
        )}

        {!loading && !error && inspectionDetails && (
          <Box id="inspection-details-content" sx={{ p: 3 }}>
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
                    <strong>Inspector Name:</strong> {inspectionDetails?.inspectorName || 'N/A'}
                  </Typography>
                  <Typography sx={{ mb: 1.5, fontSize: '0.95rem' }}>
                    <strong>Inspection Date:</strong> {convertDateArray(inspectionDetails?.inspectionDate)}
                  </Typography>
                  <Typography sx={{ mb: 1.5, fontSize: '0.95rem' }}>
                    <strong>Inspection Time:</strong> {formatTime(inspectionDetails?.inspectionTime || inspectionDetails?.inspectionDate)}
                  </Typography>
                  <Typography sx={{ mb: 1.5, fontSize: '0.95rem' }}>
                    <strong>Inspection Type:</strong> {inspectionDetails?.inspectionType || 'N/A'}
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
                          inspectionDetails?.status === 'Completed' ? '#C8E6C9' : 
                          inspectionDetails?.status === 'Pending' ? '#FFF9C4' : 
                          inspectionDetails?.status === 'In Progress' ? '#FFE0B2' : 
                          '#F5F5F5',
                        color: 
                          inspectionDetails?.status === 'Completed' ? '#1B5E20' : 
                          inspectionDetails?.status === 'Pending' ? '#F57F17' : 
                          inspectionDetails?.status === 'In Progress' ? '#E65100' : 
                          '#424242',
                        fontWeight: 'medium',
                        fontSize: '0.875rem'
                      }}
                    >
                      {inspectionDetails?.status || 'N/A'}
                    </Box>
                  </Typography>
                </Box>
              </Box>

              {/* Compliance & Pollution Status */}
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
                  Status Overview
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography component="div" sx={{ mb: 1.5, fontSize: '0.95rem' }}>
                    <strong>Compliance Status:</strong>
                    <Box 
                      component="span" 
                      sx={{
                        display: 'inline-block',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        ml: 1,
                        bgcolor: 
                          inspectionDetails?.complianceStatus === 'Compliant' ? '#C8E6C9' : 
                          inspectionDetails?.complianceStatus === 'Non Compliant' ? '#FFCDD2' : 
                          inspectionDetails?.complianceStatus === 'Partially Compliant' ? '#FFE0B2' : 
                          '#F5F5F5',
                        color: 
                          inspectionDetails?.complianceStatus === 'Compliant' ? '#1B5E20' : 
                          inspectionDetails?.complianceStatus === 'Non Compliant' ? '#B71C1C' : 
                          inspectionDetails?.complianceStatus === 'Partially Compliant' ? '#E65100' : 
                          '#424242',
                        fontWeight: 'medium',
                        fontSize: '0.875rem'
                      }}
                    >
                      {inspectionDetails?.complianceStatus || 'N/A'}
                    </Box>
                  </Typography>
                  <Typography component="div" sx={{ fontSize: '0.95rem' }}>
                    <strong>Pollution Status:</strong>
                    <Box 
                      component="span" 
                      sx={{
                        display: 'inline-block',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        ml: 1,
                        bgcolor: 
                          inspectionDetails?.pollutionStatus === 'No Pollution' ? '#C8E6C9' : 
                          inspectionDetails?.pollutionStatus === 'Minor Leak' ? '#FFE0B2' : 
                          inspectionDetails?.pollutionStatus === 'Major Spill' ? '#FFCDD2' : 
                          '#F5F5F5',
                        color: 
                          inspectionDetails?.pollutionStatus === 'No Pollution' ? '#1B5E20' : 
                          inspectionDetails?.pollutionStatus === 'Minor Leak' ? '#E65100' : 
                          inspectionDetails?.pollutionStatus === 'Major Spill' ? '#B71C1C' : 
                          '#424242',
                        fontWeight: 'medium',
                        fontSize: '0.875rem'
                      }}
                    >
                      {inspectionDetails?.pollutionStatus || 'N/A'}
                    </Box>
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Shaft Numbers */}
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
                Shaft Numbers
              </Typography>
              <Box sx={{ mt: 2 }}>
                {inspectionDetails?.shaftNumbers ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {Array.isArray(inspectionDetails.shaftNumbers) ? (
                      inspectionDetails.shaftNumbers.map((shaft: string, index: number) => (
                        <Chip 
                          key={index} 
                          label={shaft} 
                          size="small" 
                          sx={{ 
                            bgcolor: theme.palette.secondary.main, 
                            color: '#ffffff',
                            fontWeight: 500
                          }} 
                        />
                      ))
                    ) : (
                      <Chip 
                        label={inspectionDetails.shaftNumbers} 
                        size="small" 
                        sx={{ 
                          bgcolor: theme.palette.secondary.main, 
                          color: '#ffffff',
                          fontWeight: 500
                        }} 
                      />
                    )}
                  </Box>
                ) : (
                  <Typography sx={{ fontSize: '0.95rem', color: 'text.secondary' }}>
                    No shaft numbers specified
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Observations */}
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
                Observations
              </Typography>
              <Typography sx={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                {inspectionDetails?.observations || 'No observations recorded'}
              </Typography>
            </Box>

            {/* Programs and Actions */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
              gap: 3,
              mb: 3
            }}>
              {/* Hazard Control Program */}
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
                  Hazard Control Program
                </Typography>
                <Typography sx={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                  {inspectionDetails?.hazardControlProgram || 'No hazard control program specified'}
                </Typography>
              </Box>

              {/* Corrective Actions */}
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
                  Corrective Actions
                </Typography>
                <Typography sx={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                  {inspectionDetails?.correctiveActions || 'No corrective actions specified'}
                </Typography>
              </Box>
            </Box>

            {/* ESAP Materials */}
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
                ESAP Materials
              </Typography>
              <Typography sx={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                {inspectionDetails?.esapMaterials || 'No ESAP materials specified'}
              </Typography>
            </Box>

            {/* Attachments */}
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
                Attachments
              </Typography>
              <Box sx={{ mt: 2 }}>
                {inspectionDetails?.attachments?.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {inspectionDetails.attachments.map((attachment: string, index: number) => (
                      <Box 
                        key={index}
                        sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          p: 2,
                          border: '1px solid #e0e0e0',
                          borderRadius: 2,
                          bgcolor: '#fafafa',
                          '&:hover': {
                            bgcolor: '#f0f0f0',
                            borderColor: theme.palette.primary.main
                          }
                        }}
                      >
                        {/* File Icon */}
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getFileIcon(attachment)}
                        </Box>
                        
                        {/* File Name */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 500,
                              wordBreak: 'break-word'
                            }}
                          >
                            {attachment}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'text.secondary',
                              textTransform: 'uppercase'
                            }}
                          >
                            {getFileExtension(attachment)} file
                          </Typography>
                        </Box>
                        
                        {/* Action Buttons */}
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {canViewInBrowser(attachment) && (
                            <Tooltip title="View File">
                              <IconButton
                                size="small"
                                onClick={() => handleAttachmentClick(attachment)}
                                sx={{
                                  color: theme.palette.primary.main,
                                  '&:hover': {
                                    bgcolor: 'rgba(25, 118, 210, 0.08)'
                                  }
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title={canViewInBrowser(attachment) ? "Download File" : "Download File"}>
                            <IconButton
                              size="small"
                              onClick={() => handleAttachmentClick(attachment)}
                              sx={{
                                color: theme.palette.secondary.main,
                                '&:hover': {
                                  bgcolor: 'rgba(50, 56, 62, 0.08)'
                                }
                              }}
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography sx={{ fontSize: '0.95rem', color: 'text.secondary' }}>
                    No attachments available
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        )}

        {!loading && !error && !inspectionDetails && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">No inspection details available</Typography>
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
