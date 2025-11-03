'use client';

import * as React from 'react';
import { 
  Box, 
  Container, 
  Stack, 
  Typography, 
  Card, 
  CardContent,
  TextField,
  Autocomplete,
  useTheme,
  alpha,
  Divider
} from '@mui/material';
import { MagnifyingGlass as SearchIcon } from '@phosphor-icons/react';
import { User as UserIcon } from '@phosphor-icons/react';
import { ArrowsClockwise as RefreshIcon } from '@phosphor-icons/react';

// Mock data for shaft owners
const SHAFT_OWNERS = [
  { id: '1', name: 'Owner 1', shaftsCount: 5 },
  { id: '2', name: 'Owner 2', shaftsCount: 3 },
  { id: '3', name: 'Owner 3', shaftsCount: 8 },
  { id: '4', name: 'Owner 4', shaftsCount: 2 },
  { id: '5', name: 'Owner 5', shaftsCount: 6 },
];

interface ShaftOwner {
  id: string;
  name: string;
  shaftsCount: number;
}

export function ShaftTransferPage(): React.JSX.Element {
  const theme = useTheme();
  const [searchValue, setSearchValue] = React.useState('');
  const [selectedOwner, setSelectedOwner] = React.useState<ShaftOwner | null>(null);
  const [showResults, setShowResults] = React.useState(false);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
    setShowResults(true);
  };

  const handleOwnerChange = (event: React.SyntheticEvent, newValue: ShaftOwner | null) => {
    setSelectedOwner(newValue);
    setShowResults(true);
  };

  const handleRefresh = () => {
    console.log('Refreshing data...');
  };

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: 3,
        bgcolor: '#fafafa',
        minHeight: '100vh',
      }}
    >
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" fontWeight={600} gutterBottom>
              Shaft Transfer Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Search and manage shaft ownership transfers across different owners
            </Typography>
          </Box>
          
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
              border: `1px solid ${alpha('#E5E5E5', 0.8)}`,
            }}
          >
            <CardContent sx={{ p: 4 }}>
              {/* Header */}
              <Box sx={{ mb: 4 }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    mb: 1
                  }}
                >
                  Search Shaft Transfers
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: theme.palette.text.secondary 
                  }}
                >
                  Find and manage shaft ownership transfers
                </Typography>
              </Box>

              {/* Search Interface */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 3,
                  alignItems: 'center',
                  justifyContent: 'center',
                  maxWidth: 800,
                  mx: 'auto',
                  py: 3,
                }}
              >
                {/* General Search Field */}
                <Box sx={{ flex: 1, maxWidth: 300 }}>
                  <TextField
                    fullWidth
                    placeholder="Search"
                    value={searchValue}
                    onChange={handleSearchChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <SearchIcon 
                          size={20} 
                          color={theme.palette.text.secondary}
                          style={{ marginRight: 8 }}
                        />
                      ),
                      sx: {
                        borderRadius: 3,
                        bgcolor: 'background.paper',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: alpha('#E5E5E5', 0.8),
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: alpha('#635bff', 0.5),
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#635bff',
                        },
                      }
                    }}
                    sx={{
                      '& .MuiInputBase-input': {
                        py: 1.5,
                        fontSize: '0.95rem',
                      },
                    }}
                  />
                </Box>

                {/* Refresh Button */}
                <Box
                  onClick={handleRefresh}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: alpha('#635bff', 0.1),
                    color: '#635bff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      bgcolor: alpha('#635bff', 0.2),
                      transform: 'rotate(90deg)',
                    },
                  }}
                >
                  <RefreshIcon size={20} />
                </Box>

                {/* Shaft Owner Search Field */}
                <Box sx={{ flex: 1, maxWidth: 300 }}>
                  <Autocomplete
                    options={SHAFT_OWNERS}
                    getOptionLabel={(option) => option.name}
                    value={selectedOwner}
                    onChange={handleOwnerChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Shaft Owner"
                        variant="outlined"
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <UserIcon 
                              size={20} 
                              color={theme.palette.text.secondary}
                              style={{ marginRight: 8 }}
                            />
                          ),
                          sx: {
                            borderRadius: 3,
                            bgcolor: 'background.paper',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: alpha('#E5E5E5', 0.8),
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: alpha('#635bff', 0.5),
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#635bff',
                            },
                          }
                        }}
                        sx={{
                          '& .MuiInputBase-input': {
                            py: 1.5,
                            fontSize: '0.95rem',
                          },
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box
                        component="li"
                        {...props}
                        sx={{
                          py: 1.5,
                          px: 2,
                          '&:hover': {
                            bgcolor: alpha('#635bff', 0.08),
                          },
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={2} width="100%">
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              bgcolor: alpha('#635bff', 0.1),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <UserIcon size={16} color="#635bff" />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight={500}>
                              {option.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {option.shaftsCount} shafts
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    )}
                  />
                </Box>
              </Box>

              {/* Results Section */}
              {showResults && (searchValue || selectedOwner) && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 4,
                      color: theme.palette.text.secondary,
                    }}
                  >
                    <Typography variant="body1">
                      {searchValue && selectedOwner
                        ? `Searching for "${searchValue}" in ${selectedOwner.name}'s shafts`
                        : searchValue
                        ? `Searching for "${searchValue}"`
                        : selectedOwner
                        ? `Showing shafts owned by ${selectedOwner.name}`
                        : 'Enter search terms to view results'}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Search results will appear here
                    </Typography>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}