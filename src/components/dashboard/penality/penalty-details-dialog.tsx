'use client';

import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Stack,
  Typography,
  Box,
  Divider,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { X as CloseIcon } from '@phosphor-icons/react/dist/ssr/X';
import { authClient } from '@/lib/auth/client';

interface PenaltyDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  penaltyId: string | null;
}

interface PenaltyDetails {
  shaftNumber: string;
  section: string;
  penilatyFee: number;
  reportedBy: string;
  issue: string;
  status: string;
  remarks: string;
  createdBy: string;
  createdAt: number[];
  updatedBy: string;
  updatedAt: number[];
}

export function PenaltyDetailsDialog({ open, onClose, penaltyId }: PenaltyDetailsDialogProps): React.JSX.Element {
  const theme = useTheme();
  const [penaltyDetails, setPenaltyDetails] = React.useState<PenaltyDetails | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch penalty details when dialog opens and penaltyId is provided
  React.useEffect(() => {
    if (open && penaltyId) {
      fetchPenaltyDetails();
    }
  }, [open, penaltyId]);

  const fetchPenaltyDetails = async () => {
    if (!penaltyId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await authClient.fetchPenaltyById(penaltyId);
      if (data) {
        setPenaltyDetails(data);
      } else {
        setError('Failed to load penalty details');
      }
    } catch (error) {
      console.error('Error fetching penalty details:', error);
      setError('Failed to load penalty details');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPenaltyDetails(null);
    setError(null);
    onClose();
  };

  // Format date array to readable string
  const formatDate = (dateArray: number[]) => {
    if (!dateArray || dateArray.length < 6) return 'N/A';
    const [year, month, day, hour, minute, second] = dateArray;
    const date = new Date(year, month - 1, day, hour, minute, second);
    return date.toLocaleString();
  };

  // Get status badge styling
  const getStatusStyle = (status: string) => {
    const upperStatus = status?.toUpperCase();
    switch (upperStatus) {
      case 'APPROVED':
        return {
          bgcolor: '#C8E6C9',
          color: '#1B5E20'
        };
      case 'REJECTED':
        return {
          bgcolor: '#FFCDD2',
          color: '#B71C1C'
        };
      case 'PENDING':
      default:
        return {
          bgcolor: theme.palette.secondary.light || 'rgba(50, 56, 62, 0.12)',
          color: theme.palette.secondary.main
        };
    }
  };

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
        bgcolor: theme.palette.secondary.main,
        color: 'white',
        p: 2.5
      }}>
        Penalty Details
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{ color: 'white' }}
        >
          <CloseIcon fontSize="var(--icon-fontSize-md)" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ 
        px: 3, 
        py: 3, 
        maxHeight: '70vh', 
        overflow: 'auto',
        '&::-webkit-scrollbar': { width: '6px' },
        '&::-webkit-scrollbar-track': { backgroundColor: '#f1f1f1' },
        '&::-webkit-scrollbar-thumb': { backgroundColor: theme.palette.secondary.main, borderRadius: '3px' },
      }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {penaltyDetails && !loading && (
          <Stack spacing={3}>
            {/* Basic Information */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.secondary.main }}>
                Basic Information
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1"><strong>Shaft Number:</strong></Typography>
                  <Typography variant="body1">{penaltyDetails.shaftNumber}</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1"><strong>Section:</strong></Typography>
                  <Typography variant="body1">{penaltyDetails.section}</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1"><strong>Penalty Fee:</strong></Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    ${penaltyDetails.penilatyFee}
                  </Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1"><strong>Status:</strong></Typography>
                  <Box 
                    component="span"
                    sx={{
                      display: 'inline-block',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.875rem',
                      fontWeight: 'medium',
                      ...getStatusStyle(penaltyDetails.status)
                    }}
                  >
                    {penaltyDetails.status}
                  </Box>
                </Box>
              </Stack>
            </Box>

            {/* Issue Details */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.secondary.main }}>
                Issue Details
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body1" sx={{ mb: 1 }}><strong>Reported By:</strong></Typography>
                  <Typography variant="body2" sx={{ pl: 2 }}>{penaltyDetails.reportedBy}</Typography>
                </Box>
                <Box>
                  <Typography variant="body1" sx={{ mb: 1 }}><strong>Issue Description:</strong></Typography>
                  <Typography variant="body2" sx={{ pl: 2, whiteSpace: 'pre-wrap' }}>
                    {penaltyDetails.issue}
                  </Typography>
                </Box>
                {penaltyDetails.remarks && (
                  <Box>
                    <Typography variant="body1" sx={{ mb: 1 }}><strong>Remarks:</strong></Typography>
                    <Typography variant="body2" sx={{ pl: 2, whiteSpace: 'pre-wrap' }}>
                      {penaltyDetails.remarks}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>

          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        px: 3, 
        py: 2, 
        background: '#fafafa', 
        borderTop: '1px solid #eaeaea' 
      }}>
        <Button
          onClick={handleClose}
          variant="contained"
          sx={{ 
            bgcolor: theme.palette.secondary.main,
            color: 'white',
            '&:hover': { bgcolor: theme.palette.secondary.dark } 
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
