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
  Button
} from '@mui/material';
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
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Found {shaftData.length} shaft(s) in section {sectionName}
              </Typography>
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
