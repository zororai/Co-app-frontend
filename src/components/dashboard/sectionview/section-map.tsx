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
import dynamic from 'next/dynamic';

// Dynamically import Leaflet to avoid SSR issues
let L: any = null;
let leafletLoaded = false;

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
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

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

  // Load Leaflet dynamically
  const loadLeaflet = async () => {
    if (leafletLoaded && L) return L;
    
    try {
      console.log('Loading Leaflet...');
      
      // Import Leaflet dynamically
      const leaflet = await import('leaflet');
      await import('leaflet/dist/leaflet.css');
      
      L = leaflet.default;
      
      // Fix for default markers in Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
      
      leafletLoaded = true;
      console.log('Leaflet loaded successfully');
      return L;
    } catch (error) {
      console.error('Error loading Leaflet:', error);
      return null;
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    console.log('Initializing Leaflet map...');
    
    const initMap = async () => {
      const leaflet = await loadLeaflet();
      if (!leaflet || !mapRef.current) return;
      
      try {
        // Create map
        const map = leaflet.map(mapRef.current).setView(defaultCenter, defaultZoom);

        // Add tile layer
        leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        mapInstanceRef.current = map;
        console.log('Map initialized successfully');
        
        // Force resize to ensure proper rendering
        setTimeout(() => {
          map.invalidateSize();
        }, 100);
        
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };
    
    initMap();

    return () => {
      if (mapInstanceRef.current) {
        console.log('Cleaning up map...');
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map with shaft data
  useEffect(() => {
    console.log('Shaft data updated:', shaftData.length, 'shafts');
    
    if (!mapInstanceRef.current || !L) {
      console.log('Map or Leaflet not ready yet');
      return;
    }
    
    if (!shaftData.length) {
      console.log('No shaft data available');
      return;
    }

    const map = mapInstanceRef.current;
    console.log('Updating map with', shaftData.length, 'shafts');
    
    // Clear existing layers
    map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker || layer instanceof L.Polygon) {
        map.removeLayer(layer);
      }
    });

    // Add section boundaries
    const boundaries = new Set();
    shaftData.forEach(shaft => {
      if (shaft.sectionBoundary && shaft.sectionBoundary.coordinates) {
        const boundaryKey = `${shaft.sectionBoundary.sectionId}-${shaft.sectionBoundary.name}`;
        
        if (!boundaries.has(boundaryKey)) {
          boundaries.add(boundaryKey);
          
          shaft.sectionBoundary.coordinates.forEach(coord => {
            if (coord.points && coord.points.length > 0) {
              const latLngs = coord.points.map(point => [point.y, point.x] as [number, number]);
              
              L.polygon(latLngs, {
                color: '#1976D2',
                fillColor: '#2196F3',
                fillOpacity: 0.2,
                weight: 2
              }).addTo(map);
            }
          });
        }
      }
    });

    // Add shaft markers
    const validShafts = shaftData.filter(shaft => 
      shaft.latitude !== 0 && shaft.longitude !== 0
    );
    
    console.log('Valid shafts with coordinates:', validShafts.length);
    console.log('Sample shaft data:', validShafts[0]);

    validShafts.forEach((shaft, index) => {
      console.log(`Adding marker ${index + 1}:`, shaft.latitude, shaft.longitude);
      
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
        
      console.log('Marker added successfully');
    });

    // Fit map to show all shafts
    if (validShafts.length > 0) {
      const group = new L.FeatureGroup(
        validShafts.map(shaft => L.marker([shaft.latitude, shaft.longitude]))
      );
      map.fitBounds(group.getBounds().pad(0.1));
    }
  }, [shaftData]);

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
                borderRadius: 1
              }} 
            />
            
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
