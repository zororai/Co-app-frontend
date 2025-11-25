'use client';

import * as React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ConstructionIcon from '@mui/icons-material/Construction';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

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
  const [isMapLoading, setIsMapLoading] = React.useState(true);
  const [mapError, setMapError] = React.useState<string | null>(null);

  // Filter assignments that have valid coordinates
  const validAssignments = React.useMemo(() => {
    const filtered = assignments.filter(assignment => 
      assignment.latitude && 
      assignment.longitude && 
      !isNaN(assignment.latitude) && 
      !isNaN(assignment.longitude) &&
      assignment.latitude !== 0 &&
      assignment.longitude !== 0
    );

    // For testing: if no valid assignments, create sample data
    if (filtered.length === 0 && assignments.length > 0) {
      console.log('MapView: No valid coordinates found, creating sample data for testing');
      return assignments.map((assignment, index) => ({
        ...assignment,
        latitude: -26.2041 + (index * 0.1), // Johannesburg area with slight offsets
        longitude: 28.0473 + (index * 0.1)
      }));
    }

    return filtered;
  }, [assignments]);

  React.useEffect(() => {
    const initializeMap = async () => {
      if (!mapRef.current) {
        console.log('MapView: Map container not ready');
        return;
      }

      try {
        console.log('MapView: Initializing map with assignments:', validAssignments);
        
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
          console.log('MapView: Creating new map instance');
          
          // Initialize map
          const map = L.map(mapRef.current, {
            zoomControl: true,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            dragging: true,
            attributionControl: true,
          });

          // Try multiple tile providers for better reliability
          const tileProviders = [
            {
              url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
              attribution: '© OpenStreetMap contributors'
            },
            {
              url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
              attribution: '© CartoDB, © OpenStreetMap contributors'
            },
            {
              url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
              attribution: '© CartoDB, © OpenStreetMap contributors'
            }
          ];

          let tileLayer: any = null;
          let providerIndex = 0;

          const tryTileProvider = () => {
            if (providerIndex >= tileProviders.length) {
              console.error('MapView: All tile providers failed');
              setMapError('Unable to load map tiles. Please check your internet connection.');
              return;
            }

            const provider = tileProviders[providerIndex];
            console.log(`MapView: Trying tile provider ${providerIndex + 1}:`, provider.url);

            tileLayer = L.tileLayer(provider.url, {
              attribution: provider.attribution,
              maxZoom: 18,
              minZoom: 1,
              crossOrigin: true,
            });

            let tilesLoaded = 0;
            let tilesErrored = 0;

            tileLayer.on('tileload', () => {
              tilesLoaded++;
              if (tilesLoaded >= 3) { // Wait for at least 3 tiles to load
                console.log('MapView: Tiles loaded successfully from provider:', provider.url);
                setIsMapLoading(false);
              }
            });

            tileLayer.on('tileerror', () => {
              tilesErrored++;
              if (tilesErrored >= 5) { // If too many tiles fail, try next provider
                console.warn('MapView: Too many tile errors, trying next provider');
                map.removeLayer(tileLayer);
                providerIndex++;
                setTimeout(tryTileProvider, 1000);
              }
            });

            tileLayer.addTo(map);
          };

          tryTileProvider();

          mapInstanceRef.current = map;

          // Set initial view
          if (validAssignments.length > 0) {
            console.log('MapView: Setting bounds for assignments:', validAssignments);
            // Calculate bounds to fit all markers
            const bounds = L.latLngBounds(
              validAssignments.map(assignment => [assignment.latitude!, assignment.longitude!])
            );
            map.fitBounds(bounds, { padding: [20, 20] });
          } else {
            console.log('MapView: No valid assignments, using default view');
            // Default view (South Africa center)
            map.setView([-29.0852, 26.1596], 6);
          }

          // Force map to invalidate size after a short delay
          setTimeout(() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.invalidateSize();
              console.log('MapView: Map size invalidated');
            }
          }, 500);
        }
      } catch (error) {
        console.error('MapView: Error initializing map:', error);
        setMapError(error instanceof Error ? error.message : 'Failed to initialize map');
        setIsMapLoading(false);
      }
    };

    // Add a small delay to ensure the container is properly rendered
    const timeoutId = setTimeout(initializeMap, 100);

    return () => {
      clearTimeout(timeoutId);
      if (mapInstanceRef.current) {
        console.log('MapView: Cleaning up map instance');
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [validAssignments.length]);

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

            // Create enhanced popup content
            const popupContent = `
              <div style="font-family: 'Inter', sans-serif; min-width: 250px; max-width: 350px;">
                <!-- Header with gradient background -->
                <div style="
                  background: linear-gradient(135deg, ${markerColor}, ${markerColor}dd);
                  color: white;
                  padding: 12px 16px;
                  margin: -9px -12px 16px -12px;
                  border-radius: 8px 8px 0 0;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                ">
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="font-size: 18px;">⚒️</span>
                      <div>
                        <div style="font-weight: bold; font-size: 16px;">
                          Shaft #${assignment.shaftNumbers || (index + 1)}
                        </div>
                        <div style="font-size: 12px; opacity: 0.9;">
                          ${assignment.sectionName || 'No Section Assigned'}
                        </div>
                      </div>
                    </div>
                    ${assignment.status ? `
                      <div style="
                        background-color: rgba(255,255,255,0.2);
                        padding: 4px 8px;
                        border-radius: 12px;
                        font-size: 10px;
                        font-weight: bold;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                      ">
                        ${assignment.status}
                      </div>
                    ` : ''}
                  </div>
                </div>
                
                <!-- Content body -->
                <div style="padding: 0 4px;">
                  <!-- Status with enhanced styling -->
                  ${assignment.status ? `
                    <div style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                      <div style="
                        width: 8px;
                        height: 8px;
                        border-radius: 50%;
                        background-color: ${markerColor};
                      "></div>
                      <span style="font-weight: 600; color: #333;">Status:</span>
                      <span style="
                        background: linear-gradient(135deg, ${assignment.status === 'APPROVED' ? '#C8E6C9' : 
                                                           assignment.status === 'REJECTED' ? '#FFCDD2' : 
                                                           assignment.status === 'PENDING' ? '#FFF9C4' : '#FFE0B2'}, 
                                                           ${assignment.status === 'APPROVED' ? '#A5D6A7' : 
                                                           assignment.status === 'REJECTED' ? '#FFAB91' : 
                                                           assignment.status === 'PENDING' ? '#FFECB3' : '#FFCC02'});
                        color: ${assignment.status === 'APPROVED' ? '#1B5E20' : 
                                 assignment.status === 'REJECTED' ? '#B71C1C' : 
                                 assignment.status === 'PENDING' ? '#F57F17' : '#E65100'};
                        padding: 4px 12px;
                        border-radius: 16px;
                        font-size: 12px;
                        font-weight: bold;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                      ">${assignment.status}</span>
                    </div>
                  ` : ''}
                  
                  <!-- Additional details if available -->
                  ${assignment.medicalFee || assignment.regFee ? `
                    <div style="margin-bottom: 12px; padding: 8px; background-color: #f8f9fa; border-radius: 6px; border-left: 3px solid ${markerColor};">
                      <div style="font-weight: 600; color: #333; margin-bottom: 4px; font-size: 13px;">💰 Fees</div>
                      ${assignment.medicalFee ? `<div style="font-size: 12px; color: #666;">Medical: <strong>${assignment.medicalFee}</strong></div>` : ''}
                      ${assignment.regFee ? `<div style="font-size: 12px; color: #666;">Registration: <strong>${assignment.regFee}</strong></div>` : ''}
                    </div>
                  ` : ''}
                  
                  ${assignment.startContractDate ? `
                    <div style="margin-bottom: 12px; padding: 8px; background-color: #f8f9fa; border-radius: 6px; border-left: 3px solid ${markerColor};">
                      <div style="font-weight: 600; color: #333; margin-bottom: 4px; font-size: 13px;">📅 Contract Period</div>
                      <div style="font-size: 12px; color: #666;">
                        ${assignment.startContractDate} - ${assignment.endContractDate || 'Ongoing'}
                      </div>
                    </div>
                  ` : ''}
                  
                  <!-- Coordinates with copy functionality -->
                  <div style="
                    margin-top: 12px; 
                    padding: 8px; 
                    background: linear-gradient(135deg, #f8f9fa, #e9ecef); 
                    border-radius: 6px;
                    border: 1px solid #dee2e6;
                  ">
                    <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                      <span style="font-size: 14px;">📍</span>
                      <strong style="font-size: 12px; color: #495057;">GPS Coordinates</strong>
                    </div>
                    <div style="font-family: 'Courier New', monospace; font-size: 11px; color: #6c757d; background-color: white; padding: 4px 8px; border-radius: 4px; border: 1px solid #e9ecef;">
                      Lat: ${assignment.latitude?.toFixed(6)}<br>
                      Lng: ${assignment.longitude?.toFixed(6)}
                    </div>
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
      {/* Debug Information - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <Box sx={{ 
          mb: 1, 
          p: 1, 
          bgcolor: 'rgba(255, 193, 7, 0.1)', 
          borderRadius: '4px',
          fontSize: '0.75rem',
          color: 'text.secondary'
        }}>
          Debug: Total assignments: {assignments.length}, Valid: {validAssignments.length}
          {validAssignments.length > 0 && (
            <div>Coordinates: {validAssignments.map(a => `(${a.latitude}, ${a.longitude})`).join(', ')}</div>
          )}
        </Box>
      )}

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
          backgroundColor: '#f5f5f5',
          position: 'relative',
          zIndex: 1,
          '& .leaflet-container': {
            height: '100% !important',
            width: '100% !important',
            borderRadius: '6px',
          },
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
      >
        {/* Loading indicator while map initializes */}
        {(isMapLoading || mapError) && (
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(245, 245, 245, 0.95)',
            zIndex: 1000,
            gap: 1
          }}>
            {mapError ? (
              <>
                <Typography variant="body2" color="error" sx={{ fontWeight: 600 }}>
                  Map Loading Error
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', maxWidth: '80%' }}>
                  {mapError}
                </Typography>
              </>
            ) : (
              <>
                <Box sx={{
                  width: 24,
                  height: 24,
                  border: `3px solid ${theme.palette.secondary.main}20`,
                  borderTop: `3px solid ${theme.palette.secondary.main}`,
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }} />
                <Typography variant="body2" color="text.secondary">
                  Loading map...
                </Typography>
              </>
            )}
          </Box>
        )}
      </Box>

      {/* Enhanced Map Legend */}
      <Box sx={{ 
        mt: 2, 
        p: 2.5, 
        bgcolor: 'background.paper',
        borderRadius: '12px',
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <Typography variant="caption" sx={{ 
          color: 'text.secondary', 
          fontWeight: 700, 
          textTransform: 'uppercase',
          fontSize: '0.7rem',
          letterSpacing: '1px',
          mb: 2,
          display: 'block'
        }}>
          🗺️ Map Legend
        </Typography>
        
        {/* Status-based marker legend */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 2 }}>
          {[
            { status: 'APPROVED', color: '#4caf50', label: 'Approved' },
            { status: 'PENDING', color: '#ff9800', label: 'Pending' },
            { status: 'REJECTED', color: '#f44336', label: 'Rejected' },
            { status: 'DEFAULT', color: theme.palette.secondary.main, label: 'No Status' }
          ].map((item) => (
            <Box key={item.status} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                bgcolor: item.color,
                border: '2px solid white',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: -3,
                  left: -3,
                  right: -3,
                  bottom: -3,
                  borderRadius: '50%',
                  border: `2px solid ${item.color}40`,
                  animation: 'pulse 2s infinite'
                }
              }} />
              <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>
        
        {/* Instructions */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          alignItems: 'center', 
          gap: 2, 
          pt: 2,
          borderTop: `1px solid ${theme.palette.divider}`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.primary', fontWeight: 600 }}>
              💡 Tips:
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
            Click markers for detailed info • Drag to pan • Scroll to zoom • Markers pulse to show activity
          </Typography>
        </Box>
        
        <style>
          {`
            @keyframes pulse {
              0% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.3; transform: scale(1.1); }
              100% { opacity: 1; transform: scale(1); }
            }
          `}
        </style>
      </Box>
    </Box>
  );
}
