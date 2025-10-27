'use client';

import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { authClient } from '@/lib/auth/client';

export interface UnassignedShaftsDialogProps {
  open: boolean;
  onClose: () => void;
  customerId: string | null;
  onAssignShaft?: (customerId: string, shaftId: string) => void;
}

interface UnassignedShaft {
  id: string;
  shaftNumbers: string;
  sectionName?: string;
  [key: string]: any;
}

export function UnassignedShaftsDialog({
  open,
  onClose,
  customerId,
  onAssignShaft,
}: UnassignedShaftsDialogProps): React.JSX.Element {
  const [sectionName, setSectionName] = React.useState('');
  const [sections, setSections] = React.useState<any[]>([]);
  const [sectionsLoading, setSectionsLoading] = React.useState(false);
  const [unassignedShafts, setUnassignedShafts] = React.useState<UnassignedShaft[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedShaft, setSelectedShaft] = React.useState<string | null>(null);

  // Fetch sections when dialog opens
  React.useEffect(() => {
    if (open) {
      fetchSections();
    }
  }, [open]);

  const fetchSections = async () => {
    setSectionsLoading(true);
    try {
      const response = await authClient.fetchApprovedSections();
      if (response.success && response.data) {
        setSections(response.data);
      } else {
        console.error('Failed to fetch sections:', response.error);
        setSections([]);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      setSections([]);
    } finally {
      setSectionsLoading(false);
    }
  };

  const fetchUnassignedShafts = async () => {
    if (!sectionName.trim()) {
      setError('Please select a section name');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await authClient.fetchUnassignedShaftsBySection(sectionName.trim());
      
      if (response.success && response.data) {
        setUnassignedShafts(response.data);
        if (response.data.length === 0) {
          setError(`No unassigned shafts found in section "${sectionName}"`);
        }
      } else {
        setError(response.error || 'Failed to fetch unassigned shafts');
        setUnassignedShafts([]);
      }
    } catch (error) {
      console.error('Error fetching unassigned shafts:', error);
      setError('An unexpected error occurred while fetching shafts');
      setUnassignedShafts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchUnassignedShafts();
  };

  const handleAssignShaft = (shaftId: string) => {
    if (customerId && onAssignShaft) {
      onAssignShaft(customerId, shaftId);
      onClose();
    }
  };

  const handleClose = () => {
    setSectionName('');
    setSections([]);
    setUnassignedShafts([]);
    setError(null);
    setSelectedShaft(null);
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
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          minHeight: '500px',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'linear-gradient(135deg, rgb(5, 5, 68) 0%, rgb(5, 5, 68) 100%)',
        color: 'white',
        py: 2.5,
        px: 3,
        m: 0
      }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          Attach Existing Shaft
        </Typography>
        <IconButton onClick={handleClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ px: 3, py: 3 }}>
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          Select a section to view unassigned shafts available for attachment to this customer.
        </Typography>
        
        {/* Search Section */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Section Name</InputLabel>
            <Select
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              disabled={loading || sectionsLoading}
              label="Section Name"
            >
              {sectionsLoading ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Loading sections...
                </MenuItem>
              ) : sections.length === 0 ? (
                <MenuItem disabled>No sections available</MenuItem>
              ) : (
                sections.map((section) => (
                  <MenuItem key={section.id || section.sectionName} value={section.sectionName}>
                    {section.sectionName}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={loading || !sectionName.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
            sx={{
              bgcolor: 'rgb(5, 5, 68)',
              '&:hover': { bgcolor: 'rgba(5, 5, 68, 0.9)' },
              minWidth: '120px',
            }}
          >
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Results Section */}
        {unassignedShafts.length > 0 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
              Unassigned Shafts in "{sectionName}"
            </Typography>
            <List sx={{ 
              border: '1px solid #e0e0e0', 
              borderRadius: 1, 
              maxHeight: '300px', 
              overflow: 'auto',
              bgcolor: 'background.paper'
            }}>
              {unassignedShafts.map((shaft, index) => (
                <React.Fragment key={shaft.id || index}>
                  <ListItem
                    sx={{
                      '&:hover': { bgcolor: 'rgba(5, 5, 68, 0.04)' },
                      cursor: 'pointer',
                    }}
                    onClick={() => setSelectedShaft(shaft.id)}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          Shaft Numbers: {shaft.shaftNumbers}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          Section: {shaft.sectionName || sectionName}
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<AssignmentIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAssignShaft(shaft.id);
                        }}
                        sx={{
                          bgcolor: 'rgb(5, 5, 68)',
                          '&:hover': { bgcolor: 'rgba(5, 5, 68, 0.9)' },
                        }}
                      >
                        Assign
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < unassignedShafts.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Box>
        )}

        {/* Empty State */}
        {!loading && !error && unassignedShafts.length === 0 && sectionName && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Enter a section name and click "Search" to find unassigned shafts.
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'flex-end' }}>
        <Button 
          onClick={handleClose}
          sx={{ 
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            }
          }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
