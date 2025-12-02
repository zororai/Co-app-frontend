'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { useTheme } from '@mui/material/styles';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { generateSampleOreData } from '@/utils/generateSampleOreData';
import { authClient } from '@/lib/auth/client';

export function UtilitiesContent(): React.JSX.Element {
  const theme = useTheme();
  const [loadingSections, setLoadingSections] = React.useState(false);
  const [loadingSyndicates, setLoadingSyndicates] = React.useState(false);
  const [loadingOre, setLoadingOre] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error'>('success');

  const handleInitializeSections = async () => {
    setLoadingSections(true);
    try {
      const token = localStorage.getItem('custom-auth-token');
      
      // Create 15 sections with names Section A to Section O
      const sectionNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];
      const promises = sectionNames.map(async (name) => {
        const sectionData = {
          sectionName: `Section ${name}`,
          numberOfShaft: "0",
          status: 'PENDING',
          reason: 'Initial section creation'
        };

        const response = await fetch('/api/sections/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(sectionData)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to create Section ${name}: ${errorText}`);
        }

        return response.json();
      });

      await Promise.all(promises);

      setSnackbarMessage('Successfully initialized 15 sections (Section A to Section O)');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error: any) {
      console.error('Error initializing sections:', error);
      setSnackbarMessage(`Failed to initialize sections: ${error.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoadingSections(false);
    }
  };

  const handleInitializeSyndicates = async () => {
    setLoadingSyndicates(true);
    try {
      const token = localStorage.getItem('custom-auth-token');
      
      // Create 10 syndicates with sample data
      const syndicateNames = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa'];
      const promises = syndicateNames.map(async (name, index) => {
        const syndicateData = {
          name: name,
          surname: 'Syndicate',
          nationIdNumber: `SYN${String(index + 1).padStart(6, '0')}`,
          address: `${index + 1} Mining District, Gold Fields`,
          cellNumber: `+263${String(700000000 + index).slice(-9)}`,
          shaftnumber: 0,
          email: `${name.toLowerCase()}.syndicate@mining.co.zw`,
          status: 'PENDING',
          reason: 'Initial syndicate creation',
          registrationNumber: `REG-${name.toUpperCase()}-${new Date().getFullYear()}`,
          registrationDate: new Date().toISOString().split('T')[0],
          cooperativename: `${name} Mining Cooperative`,
          position: 'Syndicate Leader',
          idPicture: '',
          teamMembers: [
            {
              name: 'John',
              surname: 'Doe',
              idNumber: `ID${String(index + 1).padStart(6, '0')}`,
              address: `${index + 1} Mining District`
            }
          ],
          createdby: 'admin',
          updatedby: 'admin',
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
          deleted: false,
          deletedAt: null
        };

        const response = await fetch('/api/miners/createminers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(syndicateData)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to create ${name} Syndicate: ${errorText}`);
        }

        return response.json();
      });

      await Promise.all(promises);

      setSnackbarMessage('Successfully initialized 10 syndicates');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error: any) {
      console.error('Error initializing syndicates:', error);
      setSnackbarMessage(`Failed to initialize syndicates: ${error.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoadingSyndicates(false);
    }
  };

  const handleGenerateSampleOreData = async () => {
    setLoadingOre(true);
    try {
      // Generate 120 sample ore records
      const sampleData = generateSampleOreData();
      
      // Send each record to the backend using authClient
      const promises = sampleData.map(async (record) => {
        // Format record to match createOre requirements
        const orePayload = {
          shaftNumbers: record.shaftNumbers,
          weight: record.weight,
          numberOfBags: record.numberOfBags,
          transportStatus: record.transportStatus,
          processStatus: record.processStatus,
          location: record.location,
          tax: record.tax
        };

        const response = await authClient.createOre(orePayload);
        
        if (!response.success) {
          throw new Error(response.error || 'Failed to create ore record');
        }

        return response.data;
      });

      await Promise.all(promises);

      setSnackbarMessage('Successfully generated and saved 120 ore records');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error: any) {
      console.error('Error generating ore data:', error);
      setSnackbarMessage(`Failed to generate ore data: ${error.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoadingOre(false);
    }
  };

  return (
    <Box>
      <Stack spacing={3}>
        {/* Initialize Sections Card */}
        <Card>
          <CardHeader
            title="Initialize Sections"
            subheader="Create 15 initial sections (Section A through Section O)"
            sx={{
              '& .MuiCardHeader-title': {
                color: theme.palette.secondary.main,
                fontWeight: 600
              }
            }}
          />
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                This action will create 15 sections with default settings. Each section will be initialized with:
              </Typography>
              <Box component="ul" sx={{ pl: 3, my: 1 }}>
                <Typography component="li" variant="body2" color="text.secondary">
                  Name: Section A through Section O
                </Typography>
                <Typography component="li" variant="body2" color="text.secondary">
                  Initial shaft count: 0
                </Typography>
                <Typography component="li" variant="body2" color="text.secondary">
                  Status: PENDING
                </Typography>
                <Typography component="li" variant="body2" color="text.secondary">
                  Active state: true
                </Typography>
              </Box>
              <Box>
                <Button
                  variant="contained"
                  startIcon={loadingSections ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <PlayArrowIcon />}
                  onClick={handleInitializeSections}
                  disabled={loadingSections}
                  sx={{
                    bgcolor: theme.palette.secondary.main,
                    color: '#fff',
                    '&:hover': { bgcolor: theme.palette.secondary.dark },
                    '&:disabled': {
                      bgcolor: 'rgba(0, 0, 0, 0.12)',
                      color: 'rgba(0, 0, 0, 0.26)'
                    }
                  }}
                >
                  {loadingSections ? 'Initializing...' : 'Initialize 15 Sections'}
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Initialize Syndicates Card */}
        <Card>
          <CardHeader
            title="Initialize Syndicates"
            subheader="Create 10 initial syndicates with sample data"
            sx={{
              '& .MuiCardHeader-title': {
                color: theme.palette.secondary.main,
                fontWeight: 600
              }
            }}
          />
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                This action will create 10 syndicates with default settings. Each syndicate will be initialized with:
              </Typography>
              <Box component="ul" sx={{ pl: 3, my: 1 }}>
                <Typography component="li" variant="body2" color="text.secondary">
                  Name: Alpha through Kappa
                </Typography>
                <Typography component="li" variant="body2" color="text.secondary">
                  Cooperative name with mining district address
                </Typography>
                <Typography component="li" variant="body2" color="text.secondary">
                  Status: PENDING
                </Typography>
                <Typography component="li" variant="body2" color="text.secondary">
                  Default team member included
                </Typography>
              </Box>
              <Box>
                <Button
                  variant="contained"
                  startIcon={loadingSyndicates ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <PlayArrowIcon />}
                  onClick={handleInitializeSyndicates}
                  disabled={loadingSyndicates}
                  sx={{
                    bgcolor: theme.palette.secondary.main,
                    color: '#fff',
                    '&:hover': { bgcolor: theme.palette.secondary.dark },
                    '&:disabled': {
                      bgcolor: 'rgba(0, 0, 0, 0.12)',
                      color: 'rgba(0, 0, 0, 0.26)'
                    }
                  }}
                >
                  {loadingSyndicates ? 'Initializing...' : 'Initialize 10 Syndicates'}
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Generate Sample Ore Data Card */}
        <Card>
          <CardHeader
            title="Generate Sample Ore Data"
            subheader="Create 120 sample ore records (10 per month, Jan-Dec 2025)"
            sx={{
              '& .MuiCardHeader-title': {
                color: theme.palette.secondary.main,
                fontWeight: 600
              }
            }}
          />
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                This action will generate 120 ore records with realistic data:
              </Typography>
              <Box component="ul" sx={{ pl: 3, my: 1 }}>
                <Typography component="li" variant="body2" color="text.secondary">
                  10 records per month from January to December 2025
                </Typography>
                <Typography component="li" variant="body2" color="text.secondary">
                  Weights ranging from 35,000 - 45,000 kg (±5,000 from base 40,000)
                </Typography>
                <Typography component="li" variant="body2" color="text.secondary">
                  Realistic date and time distribution
                </Typography>
                <Typography component="li" variant="body2" color="text.secondary">
                  Default transport status: Pending
                </Typography>
              </Box>
              <Box>
                <Button
                  variant="contained"
                  startIcon={loadingOre ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <PlayArrowIcon />}
                  onClick={handleGenerateSampleOreData}
                  disabled={loadingOre}
                  sx={{
                    bgcolor: theme.palette.secondary.main,
                    color: '#fff',
                    '&:hover': { bgcolor: theme.palette.secondary.dark },
                    '&:disabled': {
                      bgcolor: 'rgba(0, 0, 0, 0.12)',
                      color: 'rgba(0, 0, 0, 0.26)'
                    }
                  }}
                >
                  {loadingOre ? 'Generating & Saving...' : 'Generate 120 Sample Ore Records'}
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
