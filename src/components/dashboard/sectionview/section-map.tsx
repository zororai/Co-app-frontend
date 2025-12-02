'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import { Print as PrintIcon } from '@mui/icons-material';
import { authClient } from '@/lib/auth/client';

interface Point {
  x: number;
  y: number;
}

interface Coordinate {
  type: string;
  points: Point[];
}

interface SectionBoundary {
  sectionId: string;
  name: string;
  type: string;
  area: string;
  country: string;
  coordinates: Coordinate[];
}

interface ShaftData {
  shaftId: string;
  shaftNumbers: string;
  sectionName: string;
  latitude: number;
  longitude: number;
  minerId: string;
  status: string;
  assignStatus: string;
  sectionBoundary: SectionBoundary;
}

interface SectionMapProps {
  sectionName: string | null;
}

const defaultCenter: [number, number] = [-26.2041, 28.0473]; // Johannesburg, South Africa
const defaultZoom = 10;

export default function SectionMap({ sectionName }: SectionMapProps) {
  const [shaftData, setShaftData] = useState<ShaftData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [initAttempts, setInitAttempts] = useState(0);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);

  const fetchSectionData = useCallback(async (section: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authClient.fetchSectionCoordinatesWithBoundaries(section);
      
      if (result.success && result.data) {
        setShaftData(result.data);
      } else {
        setError(result.error || 'Failed to fetch section data');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error fetching section data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sectionName) {
      fetchSectionData(sectionName);
    }
  }, [sectionName, fetchSectionData]);

  // Manual map initialization function
  const initializeMap = useCallback(async () => {
    if (!mapRef.current) {
      console.log('Cannot initialize: Map ref not available');
      return;
    }

    if (mapInstanceRef.current) {
      console.log('Map already exists, cleaning up first...');
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      setMapReady(false);
    }

    setInitAttempts(prev => prev + 1);
    console.log('Manual initialization attempt:', initAttempts + 1);

    try {
      console.log('Starting manual map initialization...');
      
      // Import Leaflet dynamically
      const leaflet = await import('leaflet');
      console.log('Leaflet module loaded manually');
      
      await import('leaflet/dist/leaflet.css');
      console.log('Leaflet CSS loaded manually');
      
      const L = leaflet.default;
      console.log('Leaflet default available:', !!L);
      
      leafletRef.current = L;
      
      // Fix for default markers in Next.js
      try {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
        console.log('Leaflet icons configured manually');
      } catch (iconError) {
        console.warn('Icon configuration failed:', iconError);
      }
      
      console.log('Creating map instance manually...');
      
      // Create map
      const map = L.map(mapRef.current).setView(defaultCenter, defaultZoom);
      console.log('Map created successfully manually');

      // Add tile layer
      console.log('Adding tile layer manually...');
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);
      console.log('Tile layer added manually');

      mapInstanceRef.current = map;
      console.log('Map instance stored in ref manually');
      
      setMapReady(true);
      console.log('Map ready state set to true manually');
      
      // Force resize to ensure proper rendering
      setTimeout(() => {
        console.log('Invalidating map size manually');
        map.invalidateSize();
      }, 100);
      
    } catch (error) {
      console.error('Error during manual map initialization:', error);
      setError('Failed to initialize map manually: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }, [initAttempts]);

  // Print function
  const handlePrint = useCallback(() => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const validShafts = shaftData.filter(shaft => shaft.latitude !== 0 && shaft.longitude !== 0);
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Section Map Report - ${sectionName}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #1976d2;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .section-info {
              background-color: #f5f5f5;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 20px;
            }
            .legend {
              border: 1px solid #ddd;
              padding: 15px;
              margin-bottom: 20px;
              border-radius: 5px;
            }
            .legend-item {
              display: flex;
              align-items: center;
              margin-bottom: 10px;
            }
            .legend-color {
              width: 20px;
              height: 20px;
              margin-right: 10px;
              border: 1px solid #ccc;
            }
            .shaft-list {
              margin-top: 20px;
            }
            .shaft-item {
              border: 1px solid #ddd;
              padding: 10px;
              margin-bottom: 10px;
              border-radius: 3px;
            }
            .instructions {
              background-color: #e3f2fd;
              padding: 15px;
              border-radius: 5px;
              margin-top: 20px;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 15px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Section Map Report</h1>
            <h2>${sectionName}</h2>
            <p>Generated on ${currentDate} at ${currentTime}</p>
          </div>

          <div class="section-info">
            <h3>Current Section Information</h3>
            <p><strong>Section Name:</strong> ${sectionName}</p>
            <p><strong>Total Shafts:</strong> ${shaftData.length}</p>
            <p><strong>Shafts with Valid Coordinates:</strong> ${validShafts.length}</p>
            <p><strong>Report Date:</strong> ${currentDate}</p>
            <p><strong>Report Time:</strong> ${currentTime}</p>
          </div>

          <div class="legend">
            <h3>Map Legend</h3>
            <div class="legend-item">
              <div class="legend-color" style="background-color: #ff4444; border-radius: 50%;"></div>
              <span><strong>Red Markers:</strong> Shaft Locations</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background-color: #2196F3; opacity: 0.3;"></div>
              <span><strong>Blue Areas:</strong> Section Boundaries</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background-color: #4CAF50;"></div>
              <span><strong>Green Status:</strong> Active Shafts</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background-color: #FF9800;"></div>
              <span><strong>Orange Status:</strong> Pending Shafts</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background-color: #f44336;"></div>
              <span><strong>Red Status:</strong> Inactive Shafts</span>
            </div>
          </div>

          <div class="shaft-list">
            <h3>Shaft Details (${validShafts.length} shafts with coordinates)</h3>
            ${validShafts.map(shaft => `
              <div class="shaft-item">
                <h4>Shaft ${shaft.shaftNumbers}</h4>
                <p><strong>ID:</strong> ${shaft.shaftId}</p>
                <p><strong>Status:</strong> ${shaft.status}</p>
                <p><strong>Assignment Status:</strong> ${shaft.assignStatus}</p>
                <p><strong>Coordinates:</strong> ${shaft.latitude.toFixed(6)}, ${shaft.longitude.toFixed(6)}</p>
                ${shaft.minerId ? `<p><strong>Miner ID:</strong> ${shaft.minerId}</p>` : ''}
              </div>
            `).join('')}
          </div>

          <div class="instructions">
            <h3>Instructions</h3>
            <ul>
              <li><strong>Map Navigation:</strong> Use mouse to pan and zoom the interactive map</li>
              <li><strong>Shaft Information:</strong> Click on red markers to view detailed shaft information</li>
              <li><strong>Section Boundaries:</strong> Blue shaded areas represent the section boundaries</li>
              <li><strong>Status Colors:</strong> Shaft markers may vary in color based on their operational status</li>
              <li><strong>Coordinates:</strong> All coordinates are displayed in decimal degrees format</li>
              <li><strong>Data Accuracy:</strong> This report shows shafts with valid coordinate data only</li>
              <li><strong>Updates:</strong> Select a different section to view updated information</li>
            </ul>
          </div>

          <div class="footer">
            <p>This report was generated from the Human Resource Management System</p>
            <p>Section View Module - Mining Operations Dashboard</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  }, [sectionName, shaftData]);

  // Debug effect to track data changes
  useEffect(() => {
    console.log('Shaft data changed:', {
      length: shaftData.length,
      sampleData: shaftData[0],
      hasValidCoordinates: shaftData.filter(s => s.latitude !== 0 && s.longitude !== 0).length
    });
  }, [shaftData]);

  // Initialize map
  useEffect(() => {
    console.log('Map initialization effect triggered');
    console.log('Map ref current:', !!mapRef.current);
    console.log('Map instance exists:', !!mapInstanceRef.current);
    
    if (!mapRef.current) {
      console.log('Map ref not available yet');
      return;
    }
    
    if (mapInstanceRef.current) {
      console.log('Map already initialized');
      return;
    }

    const initMap = async () => {
      try {
        console.log('Starting map initialization...');
        console.log('Loading Leaflet...');
        
        // Import Leaflet dynamically
        const leaflet = await import('leaflet');
        console.log('Leaflet module loaded');
        
        await import('leaflet/dist/leaflet.css');
        console.log('Leaflet CSS loaded');
        
        const L = leaflet.default;
        console.log('Leaflet default:', !!L);
        
        leafletRef.current = L;
        
        // Fix for default markers in Next.js
        try {
          delete (L.Icon.Default.prototype as any)._getIconUrl;
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          });
          console.log('Leaflet icons configured');
        } catch (iconError) {
          console.warn('Icon configuration failed:', iconError);
        }
        
        console.log('Creating map instance...');
        console.log('Map container element:', mapRef.current);
        
        // Create map
        const map = L.map(mapRef.current!).setView(defaultCenter, defaultZoom);
        console.log('Map created successfully');

        // Add tile layer
        console.log('Adding tile layer...');
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        console.log('Tile layer added');

        mapInstanceRef.current = map;
        console.log('Map instance stored in ref');
        
        setMapReady(true);
        console.log('Map ready state set to true');
        
        // Force resize to ensure proper rendering
        setTimeout(() => {
          console.log('Invalidating map size');
          map.invalidateSize();
        }, 100);
        
      } catch (error) {
        console.error('Error during map initialization:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        setError('Failed to initialize map: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    };
    
    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initMap();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        console.log('Cleaning up map...');
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setMapReady(false);
      }
    };
  }, []);

  // Update map with shaft data
  useEffect(() => {
    console.log('Map update effect triggered');
    console.log('Conditions check:', { 
      mapReady, 
      hasMap: !!mapInstanceRef.current, 
      hasLeaflet: !!leafletRef.current, 
      dataLength: shaftData.length,
      sectionName 
    });
    
    if (!mapReady) {
      console.log('Map not ready yet');
      return;
    }
    
    if (!mapInstanceRef.current) {
      console.log('Map instance not available');
      return;
    }
    
    if (!leafletRef.current) {
      console.log('Leaflet not available');
      return;
    }
    
    if (!shaftData.length) {
      console.log('No shaft data available');
      return;
    }

    const map = mapInstanceRef.current;
    const L = leafletRef.current;
    
    console.log('Updating map with', shaftData.length, 'shafts');
    
    // Clear existing layers (except tile layer)
    map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker || layer instanceof L.Polygon) {
        map.removeLayer(layer);
      }
    });

    // Add section boundaries
    const boundaries = new Set();
    let boundariesAdded = 0;
    
    shaftData.forEach(shaft => {
      if (shaft.sectionBoundary && shaft.sectionBoundary.coordinates) {
        const boundaryKey = `${shaft.sectionBoundary.sectionId}-${shaft.sectionBoundary.name}`;
        
        if (!boundaries.has(boundaryKey)) {
          boundaries.add(boundaryKey);
          
          shaft.sectionBoundary.coordinates.forEach(coord => {
            if (coord.points && coord.points.length > 0) {
              const latLngs = coord.points.map(point => [point.y, point.x] as [number, number]);
              console.log('Adding boundary with', latLngs.length, 'points');
              
              L.polygon(latLngs, {
                color: '#1976D2',
                fillColor: '#2196F3',
                fillOpacity: 0.2,
                weight: 2
              }).addTo(map);
              
              boundariesAdded++;
            }
          });
        }
      }
    });
    
    console.log('Added', boundariesAdded, 'section boundaries');

    // Add shaft markers
    const validShafts = shaftData.filter(shaft => 
      shaft.latitude !== 0 && shaft.longitude !== 0
    );
    
    console.log('Valid shafts with coordinates:', validShafts.length);
    if (validShafts.length > 0) {
      console.log('Sample shaft data:', validShafts[0]);
    }

    let markersAdded = 0;
    validShafts.forEach((shaft, index) => {
      console.log(`Adding marker ${index + 1}:`, shaft.latitude, shaft.longitude);
      
      try {
        const marker = L.marker([shaft.latitude, shaft.longitude])
          .addTo(map)
          .bindPopup(`
            <div style="min-width: 200px;">
              <h3>Shaft ${shaft.shaftNumbers}</h3>
              <p><strong>ID:</strong> ${shaft.shaftId}</p>
              <p><strong>Section:</strong> ${shaft.sectionName}</p>
              <p><strong>Status:</strong> ${shaft.status}</p>
              <p><strong>Assign Status:</strong> ${shaft.assignStatus}</p>
              <p><strong>Coordinates:</strong> ${shaft.latitude.toFixed(6)}, ${shaft.longitude.toFixed(6)}</p>
              ${shaft.minerId ? `<p><strong>Miner ID:</strong> ${shaft.minerId}</p>` : ''}
            </div>
          `);
          
        markersAdded++;
        console.log('Marker added successfully');
      } catch (error) {
        console.error('Error adding marker:', error);
      }
    });
    
    console.log('Added', markersAdded, 'markers to map');

    // Fit map to show all shafts
    if (validShafts.length > 0) {
      try {
        const group = new L.FeatureGroup(
          validShafts.map(shaft => L.marker([shaft.latitude, shaft.longitude]))
        );
        map.fitBounds(group.getBounds().pad(0.1));
        console.log('Map bounds fitted to show all shafts');
      } catch (error) {
        console.error('Error fitting bounds:', error);
      }
    }
  }, [shaftData, mapReady]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (!sectionName) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Section Map View
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please select a section to view its boundaries and shafts on the map.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Section Map View - {sectionName}
        </Typography>
        
        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress />
            <Typography variant="body2" sx={{ ml: 2 }}>
              Loading section data...
            </Typography>
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {!loading && !error && (
          <>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Found {shaftData.length} shaft(s) in section {sectionName}
              </Typography>
              <Tooltip title="Print Section Report">
                <IconButton 
                  onClick={handlePrint}
                  color="primary"
                  disabled={!sectionName || shaftData.length === 0}
                >
                  <PrintIcon />
                </IconButton>
              </Tooltip>
            </Box>
            
            <Box 
              ref={mapRef} 
              sx={{ 
                width: '100%', 
                height: '600px',
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                backgroundColor: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }} 
            >
              {!mapReady && (
                <Box sx={{ textAlign: 'center' }}>
                  <CircularProgress size={40} sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Initializing map...
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Map Ready: {mapReady ? 'Yes' : 'No'} | 
                    Has Map: {!!mapInstanceRef.current ? 'Yes' : 'No'} | 
                    Has Leaflet: {!!leafletRef.current ? 'Yes' : 'No'}
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={initializeMap}
                    sx={{ mt: 2 }}
                  >
                    Retry Map Initialization ({initAttempts})
                  </Button>
                </Box>
              )}
            </Box>
            
            
            {shaftData.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                No shaft data found for section "{sectionName}".
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
