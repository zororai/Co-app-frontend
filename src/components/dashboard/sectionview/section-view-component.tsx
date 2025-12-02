'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
  Fab
} from '@mui/material';
import { Add as AddIcon, Map as MapIcon } from '@mui/icons-material';
import SectionSelectionDialog from './section-selection-dialog';
import SectionMap from './section-map';

export default function SectionViewComponent() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleSectionSelect = (sectionName: string) => {
    setSelectedSection(sectionName);
  };

  const handleClearSelection = () => {
    setSelectedSection(null);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Section View
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View section boundaries and shaft locations on an interactive map
        </Typography>
      </Box>

      {/* Action Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2
        }}>
          <Typography variant="h6">
            {selectedSection ? `Current Section: ${selectedSection}` : 'No section selected'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<MapIcon />}
              onClick={handleOpenDialog}
            >
              Select Section
            </Button>
            {selectedSection && (
              <Button
                variant="outlined"
                onClick={handleClearSelection}
              >
                Clear Selection
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Map Section */}
      <Box sx={{ mb: 3 }}>
        <SectionMap sectionName={selectedSection} />
      </Box>

      {/* Info Cards */}
      {selectedSection && (
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 3,
          mt: 2
        }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Map Legend
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      backgroundColor: '#FF5722',
                      border: '2px solid #D32F2F'
                    }}
                  />
                  <Typography variant="body2">Shaft Location</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 16,
                      height: 4,
                      backgroundColor: '#1976D2',
                      opacity: 0.8
                    }}
                  />
                  <Typography variant="body2">Section Boundary</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Instructions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Click on shaft markers to view detailed information
                • Use map controls to zoom and navigate
                • Section boundaries are highlighted in blue
                • Select different sections using the "Select Section" button
              </Typography>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Section
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {selectedSection}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Displaying all approved shafts and boundaries for this section
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Floating Action Button for Quick Access */}
      <Fab
        color="primary"
        aria-label="select section"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleOpenDialog}
      >
        <AddIcon />
      </Fab>

      {/* Section Selection Dialog */}
      <SectionSelectionDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSectionSelect={handleSectionSelect}
      />
    </Container>
  );
}
