'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Box,
  Typography
} from '@mui/material';
import { authClient } from '@/lib/auth/client';

interface Section {
  sectionName: string;
}

interface SectionSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSectionSelect: (sectionName: string) => void;
}

export default function SectionSelectionDialog({
  open,
  onClose,
  onSectionSelect
}: SectionSelectionDialogProps) {
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchSections();
    }
  }, [open]);

  const fetchSections = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching approved sections...');
      const result = await authClient.fetchApprovedSections();
      console.log('API Result:', result);
      
      if (result.success && result.data) {
        console.log('Sections received:', result.data);
        setSections(result.data);
      } else {
        console.error('API Error:', result.error);
        setError(result.error || 'Failed to fetch sections');
      }
    } catch (err) {
      console.error('Unexpected error fetching sections:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSectionChange = (event: any) => {
    setSelectedSection(event.target.value);
  };

  const handleConfirm = () => {
    if (selectedSection) {
      onSectionSelect(selectedSection);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedSection('');
    setError(null);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6" component="div">
          Select Section
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Choose a section to view its boundaries and shafts on the map
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={4}>
              <CircularProgress />
              <Typography variant="body2" sx={{ ml: 2 }}>
                Loading sections...
              </Typography>
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : (
            <FormControl fullWidth>
              <InputLabel id="section-select-label">Section</InputLabel>
              <Select
                labelId="section-select-label"
                value={selectedSection}
                label="Section"
                onChange={handleSectionChange}
                disabled={sections.length === 0}
              >
                {sections.map((section, index) => (
                  <MenuItem key={index} value={section.sectionName}>
                    {section.sectionName}
                  </MenuItem>
                ))}
              </Select>
              {sections.length === 0 && !loading && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  No approved sections available
                </Typography>
              )}
            </FormControl>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          disabled={!selectedSection || loading}
        >
          View Section
        </Button>
      </DialogActions>
    </Dialog>
  );
}
