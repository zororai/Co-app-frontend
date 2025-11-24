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
  Divider
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
    if (!mapRef.current || mapInstanceRef.current) return;

    const initMap = async () => {
      try {
        console.log('Loading Leaflet...');
        
        // Import Leaflet dynamically
        const leaflet = await import('leaflet');
        await import('leaflet/dist/leaflet.css');
        
        const L = leaflet.default;
        leafletRef.current = L;
        
        // Fix for default markers in Next.js
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
        
        console.log('Initializing map...');
        
        // Create map
        const map = L.map(mapRef.current!).setView(defaultCenter, defaultZoom);

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        mapInstanceRef.current = map;
        setMapReady(true);
        console.log('Map initialized successfully');
        
        // Force resize to ensure proper rendering
        setTimeout(() => {
          map.invalidateSize();
        }, 100);
        
      } catch (error) {
        console.error('Error initializing map:', error);
        setError('Failed to initialize map');
      }
    };
    
    initMap();

    return () => {
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
                justifyContent: 'center'
              }} 
            >
              {!mapInstanceRef.current && (
                <Typography variant="body2" color="text.secondary">
                  Loading map...
                </Typography>
              )}
            </Box>
            
            {/* Fallback: Show shaft data in table format */}
            {shaftData.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Shaft Details
                </Typography>
                <Box sx={{ display: 'grid', gap: 2 }}>
                  {shaftData.filter(shaft => shaft.latitude !== 0 && shaft.longitude !== 0).map((shaft, index) => (
                    <Paper key={index} sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Shaft {shaft.shaftNumbers}
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 1 }}>
                        <Typography variant="body2">
                          <strong>ID:</strong> {shaft.shaftId}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Status:</strong> {shaft.status}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Assign Status:</strong> {shaft.assignStatus}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Coordinates:</strong> {shaft.latitude.toFixed(6)}, {shaft.longitude.toFixed(6)}
                        </Typography>
                        {shaft.minerId && (
                          <Typography variant="body2">
                            <strong>Miner ID:</strong> {shaft.minerId}
                          </Typography>
                        )}
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </Box>
            )}
            
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
