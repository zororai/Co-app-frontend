'use client';

import * as React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ConstructionIcon from '@mui/icons-material/Construction';

interface ShaftAssignment {
  id?: string;
  shaftNumbers?: string;
  sectionName?: string;
  latitude?: number;
  longitude?: number;
  status?: string;
  [key: string]: any;
}

interface MapViewProps {
  assignments: ShaftAssignment[];
  height?: number | string;
}

export function MapView({ assignments, height = 400 }: MapViewProps): React.JSX.Element {
  const theme = useTheme();
  const mapRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<any>(null);
  const markersRef = React.useRef<any[]>([]);

  // Filter assignments that have valid coordinates
  const validAssignments = React.useMemo(() => {
    return assignments.filter(assignment => 
      assignment.latitude && 
      assignment.longitude && 
      !isNaN(assignment.latitude) && 
      !isNaN(assignment.longitude) &&
      assignment.latitude !== 0 &&
      assignment.longitude !== 0
    );
  }, [assignments]);

  React.useEffect(() => {
    const initializeMap = async () => {
      try {
        // Dynamically import Leaflet to avoid SSR issues
        const L = (await import('leaflet')).default;
        
        // Fix for default markers in Leaflet with webpack
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        if (mapRef.current && !mapInstanceRef.current) {
          // Initialize map
          const map = L.map(mapRef.current, {
            zoomControl: true,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            dragging: true,
          });

          // Add OpenStreetMap tiles
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
          }).addTo(map);

          mapInstanceRef.current = map;

          // Set initial view
          if (validAssignments.length > 0) {
            // Calculate bounds to fit all markers
            const bounds = L.latLngBounds(
              validAssignments.map(assignment => [assignment.latitude!, assignment.longitude!])
            );
            map.fitBounds(bounds, { padding: [20, 20] });
          } else {
            // Default view (South Africa center)
            map.setView([-29.0852, 26.1596], 6);
          }
        }
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initializeMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  React.useEffect(() => {
    const updateMarkers = async () => {
      if (!mapInstanceRef.current) return;
      
      try {
        const L = (await import('leaflet')).default;

        // Clear existing markers
        markersRef.current.forEach(marker => {
          mapInstanceRef.current.removeLayer(marker);
        });
        markersRef.current = [];

        // Add markers for valid assignments
        validAssignments.forEach((assignment, index) => {
          if (assignment.latitude && assignment.longitude) {
            // Determine marker color based on status
            const getMarkerColor = (status: string) => {
              switch (status) {
                case 'APPROVED': return '#4caf50';
                case 'REJECTED': return '#f44336';
                case 'PENDING': return '#ff9800';
                default: return theme.palette.secondary.main;
              }
            };

            const markerColor = getMarkerColor(assignment.status || '');
            const pulseColor = markerColor + '40'; // Add transparency for pulse effect

            // Create enhanced custom icon with status-based colors and animations
            const customIcon = L.divIcon({
              html: `
                <div class="marker-container" style="position: relative;">
                  <!-- Pulse animation ring -->
                  <div style="
                    position: absolute;
                    top: -8px;
                    left: -8px;
                    width: 48px;
                    height: 48px;
                    background-color: ${pulseColor};
                    border-radius: 50%;
                    animation: pulse 2s infinite;
                  "></div>
                  
                  <!-- Main marker -->
                  <div style="
                    background: linear-gradient(135deg, ${markerColor}, ${markerColor}dd);
                    color: white;
                    border-radius: 50%;
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 13px;
                    border: 3px solid white;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
                    position: relative;
                    z-index: 10;
                    transition: all 0.3s ease;
                  " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                    ${assignment.shaftNumbers || (index + 1)}
                  </div>
                  
                  <!-- Status indicator dot -->
                  <div style="
                    position: absolute;
                    top: -2px;
                    right: -2px;
                    width: 12px;
                    height: 12px;
                    background-color: ${markerColor};
                    border: 2px solid white;
                    border-radius: 50%;
                    z-index: 15;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                  "></div>
                </div>
                
                <style>
                  @keyframes pulse {
                    0% {
                      transform: scale(0.8);
                      opacity: 1;
                    }
                    50% {
                      transform: scale(1.2);
                      opacity: 0.3;
                    }
                    100% {
                      transform: scale(0.8);
                      opacity: 1;
                    }
                  }
                </style>
              `,
              className: 'enhanced-shaft-marker',
              iconSize: [36, 36],
              iconAnchor: [18, 18],
            });

            const marker = L.marker([assignment.latitude, assignment.longitude], {
              icon: customIcon
            }).addTo(mapInstanceRef.current);

            // Create popup content
            const popupContent = `
              <div style="font-family: 'Inter', sans-serif; min-width: 200px;">
                <div style="
                  background-color: ${theme.palette.secondary.main};
                  color: white;
                  padding: 8px 12px;
                  margin: -9px -12px 12px -12px;
                  font-weight: bold;
                  font-size: 14px;
                ">
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span>⚒️</span>
                    Shaft #${assignment.shaftNumbers || 'N/A'}
                  </div>
                </div>
                <div style="padding: 0 4px;">
                  <div style="margin-bottom: 8px;">
                    <strong style="color: ${theme.palette.secondary.main};">Section:</strong><br>
                    <span>${assignment.sectionName || 'No Section'}</span>
                  </div>
                  ${assignment.status ? `
                    <div style="margin-bottom: 8px;">
                      <strong style="color: ${theme.palette.secondary.main};">Status:</strong><br>
                      <span style="
                        background-color: ${assignment.status === 'APPROVED' ? '#C8E6C9' : 
                                           assignment.status === 'REJECTED' ? '#FFCDD2' : 
                                           assignment.status === 'PENDING' ? '#FFF9C4' : '#FFE0B2'};
                        color: ${assignment.status === 'APPROVED' ? '#1B5E20' : 
                                 assignment.status === 'REJECTED' ? '#B71C1C' : 
                                 assignment.status === 'PENDING' ? '#F57F17' : '#E65100'};
                        padding: 2px 8px;
                        border-radius: 12px;
                        font-size: 12px;
                        font-weight: bold;
                      ">${assignment.status}</span>
                    </div>
                  ` : ''}
                  <div style="font-size: 12px; color: #666; margin-top: 8px;">
                    <strong>Coordinates:</strong><br>
                    ${assignment.latitude?.toFixed(6)}, ${assignment.longitude?.toFixed(6)}
                  </div>
                </div>
              </div>
            `;

            marker.bindPopup(popupContent, {
              maxWidth: 300,
              className: 'custom-popup'
            });

            markersRef.current.push(marker);
          }
        });

        // Adjust map view to fit all markers
        if (validAssignments.length > 0 && markersRef.current.length > 0) {
          const group = L.featureGroup(markersRef.current);
          mapInstanceRef.current.fitBounds(group.getBounds(), { 
            padding: [20, 20],
            maxZoom: 15 
          });
        }
      } catch (error) {
        console.error('Error updating markers:', error);
      }
    };

    updateMarkers();
  }, [validAssignments, theme.palette.secondary.main]);

  if (validAssignments.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: height,
        gap: 2,
        bgcolor: 'background.default',
        borderRadius: '8px',
        border: `1px solid ${theme.palette.divider}`,
        p: 3
      }}>
        <LocationOnIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.3 }} />
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
          No Location Data Available
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Shaft assignments don't have valid latitude and longitude coordinates to display on the map.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Map Info Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2,
        p: 2,
        bgcolor: `${theme.palette.secondary.main}08`,
        borderRadius: '8px',
        border: `1px solid ${theme.palette.secondary.main}20`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationOnIcon sx={{ color: theme.palette.secondary.main }} />
          <Typography variant="h6" sx={{ color: theme.palette.secondary.main, fontWeight: 600 }}>
            Shaft Locations Map
          </Typography>
        </Box>
        <Chip 
          icon={<ConstructionIcon />}
          label={`${validAssignments.length} Location${validAssignments.length !== 1 ? 's' : ''}`}
          sx={{ 
            bgcolor: theme.palette.secondary.main,
            color: 'white',
            fontWeight: 600
          }}
        />
      </Box>

      {/* Map Container */}
      <Box
        ref={mapRef}
        sx={{
          height: height,
          width: '100%',
          borderRadius: '8px',
          border: `2px solid ${theme.palette.secondary.main}`,
          overflow: 'hidden',
          '& .leaflet-control-zoom a': {
            backgroundColor: theme.palette.secondary.main,
            color: 'white',
            '&:hover': {
              backgroundColor: theme.palette.secondary.dark,
            }
          },
          '& .leaflet-popup-content-wrapper': {
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
          '& .leaflet-popup-tip': {
            backgroundColor: 'white',
          }
        }}
      />

      {/* Map Legend */}
      <Box sx={{ 
        mt: 2, 
        p: 2, 
        bgcolor: 'background.paper',
        borderRadius: '8px',
        border: `1px solid ${theme.palette.divider}`
      }}>
        <Typography variant="caption" sx={{ 
          color: 'text.secondary', 
          fontWeight: 600, 
          textTransform: 'uppercase',
          fontSize: '0.7rem',
          letterSpacing: '0.5px'
        }}>
          Map Legend
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              bgcolor: theme.palette.secondary.main,
              border: '2px solid white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
            }} />
            <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
              Shaft Assignment Location
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
            • Click markers for details • Zoom and pan to explore
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
