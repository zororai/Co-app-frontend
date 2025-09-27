'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Typography, Alert, CircularProgress } from '@mui/material';

interface Coordinate {
  lat: number;
  lng: number;
}

interface DrawnShape {
  id: string;
  type: string;
  coordinates: Coordinate[];
  area?: number;
}

const BoundaryMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const drawnItemsRef = useRef<any>(null);
  
  const [drawnShapes, setDrawnShapes] = useState<DrawnShape[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const initializeMap = async () => {
      try {
        // Dynamically import Leaflet modules with proper error handling
        const leafletModule = await import('leaflet');
        const L = leafletModule.default;
        
        // Import leaflet-draw
        await import('leaflet-draw');
        
        // Import CSS files
        require('leaflet/dist/leaflet.css');
        require('leaflet-draw/dist/leaflet.draw.css');

        // Fix for default markers in Leaflet
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: '/images/marker-icon-2x.png',
          iconUrl: '/images/marker-icon.png',
          shadowUrl: '/images/marker-shadow.png',
        });

        // Initialize map
        const map = L.map(mapRef.current!).setView([0, 0], 2);

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 18,
        }).addTo(map);

        // Initialize drawn items layer
        const drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);

        // Initialize draw control
        const drawControl = new (L.Control as any).Draw({
          position: 'topright',
          draw: {
            polygon: {
              allowIntersection: false,
              drawError: {
                color: '#e1e100',
                message: '<strong>Error:</strong> Shape edges cannot cross!',
              },
              shapeOptions: {
                color: '#97009c',
                weight: 3,
                opacity: 0.8,
                fillOpacity: 0.4,
              },
            },
            rectangle: {
              shapeOptions: {
                color: '#97009c',
                weight: 3,
                opacity: 0.8,
                fillOpacity: 0.4,
              },
            },
            circle: {
              shapeOptions: {
                color: '#97009c',
                weight: 3,
                opacity: 0.8,
                fillOpacity: 0.4,
              },
            },
            marker: {},
            polyline: {
              shapeOptions: {
                color: '#97009c',
                weight: 3,
                opacity: 0.8,
              },
            },
            circlemarker: false,
          },
          edit: {
            featureGroup: drawnItems,
            remove: true,
          },
        });

        map.addControl(drawControl);

        // Event handlers for drawing
        map.on((L.Draw as any).Event.CREATED, (event: any) => {
          const layer = event.layer;
          const type = event.layerType;
          
          drawnItems.addLayer(layer);
          
          // Extract coordinates based on shape type
          let coordinates: Coordinate[] = [];
          let area: number | undefined;
          
          if (type === 'polygon' || type === 'rectangle') {
            coordinates = layer.getLatLngs()[0].map((latlng: any) => ({
              lat: latlng.lat,
              lng: latlng.lng,
            }));
            // Calculate area for polygons (rough calculation)
            area = (L as any).GeometryUtil ? (L as any).GeometryUtil.geodesicArea(layer.getLatLngs()[0]) : undefined;
          } else if (type === 'circle') {
            const center = layer.getLatLng();
            const radius = layer.getRadius();
            coordinates = [{ lat: center.lat, lng: center.lng }];
            area = Math.PI * radius * radius;
          } else if (type === 'marker') {
            const latlng = layer.getLatLng();
            coordinates = [{ lat: latlng.lat, lng: latlng.lng }];
          } else if (type === 'polyline') {
            coordinates = layer.getLatLngs().map((latlng: any) => ({
              lat: latlng.lat,
              lng: latlng.lng,
            }));
          }

          const newShape: DrawnShape = {
            id: Date.now().toString(),
            type,
            coordinates,
            area,
          };

          setDrawnShapes(prev => [...prev, newShape]);
        });

        map.on((L.Draw as any).Event.DELETED, (event: any) => {
          const layers = event.layers;
          layers.eachLayer(() => {
            // For simplicity, we'll clear all shapes when any are deleted
            // In a real app, you'd want to track layer IDs more precisely
            setDrawnShapes([]);
          });
        });

        mapInstanceRef.current = map;
        drawnItemsRef.current = drawnItems;
        setIsMapLoading(false);

      } catch (error) {
        console.error('Error initializing map:', error);
        setMessage({ type: 'error', text: 'Failed to load map. Please refresh the page.' });
        setIsMapLoading(false);
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

  const saveShapesToEndpoint = async () => {
    if (drawnShapes.length === 0) {
      setMessage({ type: 'error', text: 'No shapes to save!' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Replace this URL with your actual endpoint
      const response = await fetch('/api/boundaries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shapes: drawnShapes,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: `Successfully saved ${drawnShapes.length} shape(s)!` });
      } else {
        throw new Error('Failed to save shapes');
      }
    } catch (error) {
      console.error('Error saving shapes:', error);
      setMessage({ type: 'error', text: 'Failed to save shapes. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllShapes = () => {
    if (drawnItemsRef.current) {
      drawnItemsRef.current.clearLayers();
    }
    setDrawnShapes([]);
    setMessage(null);
  };

  return (
    <Box sx={{ height: '100%', width: '100%', position: 'relative' }}>
      {/* Loading State */}
      {isMapLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 2000,
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={40} />
            <Typography variant="body2" sx={{ mt: 2 }}>
              Loading map...
            </Typography>
          </Box>
        </Box>
      )}

      {/* Map Container */}
      <Box
        ref={mapRef}
        sx={{
          height: '100%',
          width: '100%',
          '& .leaflet-container': {
            height: '100%',
            width: '100%',
          },
        }}
      />
      
      {/* Control Panel */}
      {!isMapLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            backgroundColor: 'white',
            padding: 2,
            borderRadius: 1,
            boxShadow: 2,
            minWidth: 250,
            zIndex: 1000,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Boundary Map Controls
          </Typography>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Drawn Shapes: {drawnShapes.length}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={saveShapesToEndpoint}
              disabled={isLoading || drawnShapes.length === 0}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? 'Saving...' : 'Save Coordinates'}
            </Button>
            
            <Button
              variant="outlined"
              color="secondary"
              onClick={clearAllShapes}
              disabled={drawnShapes.length === 0}
            >
              Clear All Shapes
            </Button>
          </Box>

          {message && (
            <Alert severity={message.type} sx={{ mt: 2 }}>
              {message.text}
            </Alert>
          )}

          {/* Shape Details */}
          {drawnShapes.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Shape Details:
              </Typography>
              {drawnShapes.map((shape, index) => (
                <Box key={shape.id} sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="caption" display="block">
                    {index + 1}. {shape.type.charAt(0).toUpperCase() + shape.type.slice(1)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Points: {shape.coordinates.length}
                    {shape.area && ` | Area: ${shape.area.toFixed(2)} m²`}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default BoundaryMap;
