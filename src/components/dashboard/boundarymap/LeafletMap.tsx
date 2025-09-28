'use client';

import React, { useEffect, useRef, useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Alert, 
  CircularProgress, 
  Autocomplete, 
  TextField,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';

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

interface Country {
  name: string;
  code: string;
  lat: number;
  lng: number;
  zoom: number;
}

// Popular countries with their coordinates and appropriate zoom levels
const COUNTRIES: Country[] = [
  { name: 'United States', code: 'US', lat: 39.8283, lng: -98.5795, zoom: 4 },
  { name: 'United Kingdom', code: 'GB', lat: 55.3781, lng: -3.4360, zoom: 6 },
  { name: 'Canada', code: 'CA', lat: 56.1304, lng: -106.3468, zoom: 4 },
  { name: 'Australia', code: 'AU', lat: -25.2744, lng: 133.7751, zoom: 4 },
  { name: 'Germany', code: 'DE', lat: 51.1657, lng: 10.4515, zoom: 6 },
  { name: 'France', code: 'FR', lat: 46.2276, lng: 2.2137, zoom: 6 },
  { name: 'Italy', code: 'IT', lat: 41.8719, lng: 12.5674, zoom: 6 },
  { name: 'Spain', code: 'ES', lat: 40.4637, lng: -3.7492, zoom: 6 },
  { name: 'Japan', code: 'JP', lat: 36.2048, lng: 138.2529, zoom: 5 },
  { name: 'China', code: 'CN', lat: 35.8617, lng: 104.1954, zoom: 4 },
  { name: 'India', code: 'IN', lat: 20.5937, lng: 78.9629, zoom: 5 },
  { name: 'Brazil', code: 'BR', lat: -14.2350, lng: -51.9253, zoom: 4 },
  { name: 'Mexico', code: 'MX', lat: 23.6345, lng: -102.5528, zoom: 5 },
  { name: 'Russia', code: 'RU', lat: 61.5240, lng: 105.3188, zoom: 3 },
  { name: 'South Africa', code: 'ZA', lat: -30.5595, lng: 22.9375, zoom: 5 },
  { name: 'Egypt', code: 'EG', lat: 26.0975, lng: 30.0444, zoom: 6 },
  { name: 'Nigeria', code: 'NG', lat: 9.0820, lng: 8.6753, zoom: 6 },
  { name: 'Kenya', code: 'KE', lat: -0.0236, lng: 37.9062, zoom: 6 },
  { name: 'Argentina', code: 'AR', lat: -38.4161, lng: -63.6167, zoom: 4 },
  { name: 'Chile', code: 'CL', lat: -35.6751, lng: -71.5430, zoom: 4 },
  { name: 'Peru', code: 'PE', lat: -9.1900, lng: -75.0152, zoom: 5 },
  { name: 'Colombia', code: 'CO', lat: 4.5709, lng: -74.2973, zoom: 5 },
  { name: 'Venezuela', code: 'VE', lat: 6.4238, lng: -66.5897, zoom: 6 },
  { name: 'Thailand', code: 'TH', lat: 15.8700, lng: 100.9925, zoom: 6 },
  { name: 'Vietnam', code: 'VN', lat: 14.0583, lng: 108.2772, zoom: 6 },
  { name: 'Indonesia', code: 'ID', lat: -0.7893, lng: 113.9213, zoom: 4 },
  { name: 'Philippines', code: 'PH', lat: 12.8797, lng: 121.7740, zoom: 6 },
  { name: 'Malaysia', code: 'MY', lat: 4.2105, lng: 101.9758, zoom: 6 },
  { name: 'Singapore', code: 'SG', lat: 1.3521, lng: 103.8198, zoom: 11 },
  { name: 'South Korea', code: 'KR', lat: 35.9078, lng: 127.7669, zoom: 7 },
  { name: 'North Korea', code: 'KP', lat: 40.3399, lng: 127.5101, zoom: 7 },
  { name: 'Turkey', code: 'TR', lat: 38.9637, lng: 35.2433, zoom: 6 },
  { name: 'Saudi Arabia', code: 'SA', lat: 23.8859, lng: 45.0792, zoom: 5 },
  { name: 'Iran', code: 'IR', lat: 32.4279, lng: 53.6880, zoom: 5 },
  { name: 'Iraq', code: 'IQ', lat: 33.2232, lng: 43.6793, zoom: 6 },
  { name: 'Israel', code: 'IL', lat: 31.0461, lng: 34.8516, zoom: 8 },
  { name: 'Jordan', code: 'JO', lat: 30.5852, lng: 36.2384, zoom: 8 },
  { name: 'Lebanon', code: 'LB', lat: 33.8547, lng: 35.8623, zoom: 9 },
  { name: 'Syria', code: 'SY', lat: 34.8021, lng: 38.9968, zoom: 7 },
  { name: 'Afghanistan', code: 'AF', lat: 33.9391, lng: 67.7100, zoom: 6 },
  { name: 'Pakistan', code: 'PK', lat: 30.3753, lng: 69.3451, zoom: 5 },
  { name: 'Bangladesh', code: 'BD', lat: 23.6850, lng: 90.3563, zoom: 7 },
  { name: 'Sri Lanka', code: 'LK', lat: 7.8731, lng: 80.7718, zoom: 8 },
  { name: 'Nepal', code: 'NP', lat: 28.3949, lng: 84.1240, zoom: 7 },
  { name: 'Myanmar', code: 'MM', lat: 21.9162, lng: 95.9560, zoom: 6 },
  { name: 'Cambodia', code: 'KH', lat: 12.5657, lng: 104.9910, zoom: 7 },
  { name: 'Laos', code: 'LA', lat: 19.8563, lng: 102.4955, zoom: 7 },
  { name: 'Mongolia', code: 'MN', lat: 46.8625, lng: 103.8467, zoom: 5 },
  { name: 'Kazakhstan', code: 'KZ', lat: 48.0196, lng: 66.9237, zoom: 4 },
  { name: 'Uzbekistan', code: 'UZ', lat: 41.3775, lng: 64.5853, zoom: 6 },
  { name: 'Ukraine', code: 'UA', lat: 48.3794, lng: 31.1656, zoom: 6 },
  { name: 'Poland', code: 'PL', lat: 51.9194, lng: 19.1451, zoom: 6 },
  { name: 'Czech Republic', code: 'CZ', lat: 49.8175, lng: 15.4730, zoom: 7 },
  { name: 'Slovakia', code: 'SK', lat: 48.6690, lng: 19.6990, zoom: 7 },
  { name: 'Hungary', code: 'HU', lat: 47.1625, lng: 19.5033, zoom: 7 },
  { name: 'Romania', code: 'RO', lat: 45.9432, lng: 24.9668, zoom: 6 },
  { name: 'Bulgaria', code: 'BG', lat: 42.7339, lng: 25.4858, zoom: 7 },
  { name: 'Greece', code: 'GR', lat: 39.0742, lng: 21.8243, zoom: 6 },
  { name: 'Serbia', code: 'RS', lat: 44.0165, lng: 21.0059, zoom: 7 },
  { name: 'Croatia', code: 'HR', lat: 45.1000, lng: 15.2000, zoom: 7 },
  { name: 'Bosnia and Herzegovina', code: 'BA', lat: 43.9159, lng: 17.6791, zoom: 8 },
  { name: 'Albania', code: 'AL', lat: 41.1533, lng: 20.1683, zoom: 8 },
  { name: 'North Macedonia', code: 'MK', lat: 41.6086, lng: 21.7453, zoom: 8 },
  { name: 'Montenegro', code: 'ME', lat: 42.7087, lng: 19.3744, zoom: 8 },
  { name: 'Slovenia', code: 'SI', lat: 46.1512, lng: 14.9955, zoom: 8 },
  { name: 'Austria', code: 'AT', lat: 47.5162, lng: 14.5501, zoom: 7 },
  { name: 'Switzerland', code: 'CH', lat: 46.8182, lng: 8.2275, zoom: 8 },
  { name: 'Belgium', code: 'BE', lat: 50.5039, lng: 4.4699, zoom: 8 },
  { name: 'Netherlands', code: 'NL', lat: 52.1326, lng: 5.2913, zoom: 7 },
  { name: 'Denmark', code: 'DK', lat: 56.2639, lng: 9.5018, zoom: 7 },
  { name: 'Sweden', code: 'SE', lat: 60.1282, lng: 18.6435, zoom: 5 },
  { name: 'Norway', code: 'NO', lat: 60.4720, lng: 8.4689, zoom: 5 },
  { name: 'Finland', code: 'FI', lat: 61.9241, lng: 25.7482, zoom: 5 },
  { name: 'Iceland', code: 'IS', lat: 64.9631, lng: -19.0208, zoom: 7 },
  { name: 'Ireland', code: 'IE', lat: 53.4129, lng: -8.2439, zoom: 7 },
  { name: 'Portugal', code: 'PT', lat: 39.3999, lng: -8.2245, zoom: 7 },
  { name: 'Morocco', code: 'MA', lat: 31.7917, lng: -7.0926, zoom: 6 },
  { name: 'Algeria', code: 'DZ', lat: 28.0339, lng: 1.6596, zoom: 5 },
  { name: 'Tunisia', code: 'TN', lat: 33.8869, lng: 9.5375, zoom: 7 },
  { name: 'Libya', code: 'LY', lat: 26.3351, lng: 17.2283, zoom: 5 },
  { name: 'Sudan', code: 'SD', lat: 12.8628, lng: 30.2176, zoom: 5 },
  { name: 'Ethiopia', code: 'ET', lat: 9.1450, lng: 40.4897, zoom: 6 },
  { name: 'Somalia', code: 'SO', lat: 5.1521, lng: 46.1996, zoom: 6 },
  { name: 'Tanzania', code: 'TZ', lat: -6.3690, lng: 34.8888, zoom: 6 },
  { name: 'Uganda', code: 'UG', lat: 1.3733, lng: 32.2903, zoom: 7 },
  { name: 'Rwanda', code: 'RW', lat: -1.9403, lng: 29.8739, zoom: 9 },
  { name: 'Burundi', code: 'BI', lat: -3.3731, lng: 29.9189, zoom: 9 },
  { name: 'Democratic Republic of Congo', code: 'CD', lat: -4.0383, lng: 21.7587, zoom: 5 },
  { name: 'Central African Republic', code: 'CF', lat: 6.6111, lng: 20.9394, zoom: 6 },
  { name: 'Chad', code: 'TD', lat: 15.4542, lng: 18.7322, zoom: 5 },
  { name: 'Niger', code: 'NE', lat: 17.6078, lng: 8.0817, zoom: 5 },
  { name: 'Mali', code: 'ML', lat: 17.5707, lng: -3.9962, zoom: 5 },
  { name: 'Burkina Faso', code: 'BF', lat: 12.2383, lng: -1.5616, zoom: 7 },
  { name: 'Ghana', code: 'GH', lat: 7.9465, lng: -1.0232, zoom: 7 },
  { name: 'Ivory Coast', code: 'CI', lat: 7.5400, lng: -5.5471, zoom: 7 },
  { name: 'Senegal', code: 'SN', lat: 14.4974, lng: -14.4524, zoom: 7 },
  { name: 'Guinea', code: 'GN', lat: 9.9456, lng: -9.6966, zoom: 7 },
  { name: 'Sierra Leone', code: 'SL', lat: 8.4606, lng: -11.7799, zoom: 8 },
  { name: 'Liberia', code: 'LR', lat: 6.4281, lng: -9.4295, zoom: 8 },
  { name: 'Mauritania', code: 'MR', lat: 21.0079, lng: -10.9408, zoom: 6 },
  { name: 'Gambia', code: 'GM', lat: 13.4432, lng: -15.3101, zoom: 9 },
  { name: 'Guinea-Bissau', code: 'GW', lat: 11.8037, lng: -15.1804, zoom: 9 },
  { name: 'Cape Verde', code: 'CV', lat: 16.5388, lng: -24.0132, zoom: 8 },
  { name: 'Botswana', code: 'BW', lat: -22.3285, lng: 24.6849, zoom: 6 },
  { name: 'Namibia', code: 'NA', lat: -22.9576, lng: 18.4904, zoom: 5 },
  { name: 'Zimbabwe', code: 'ZW', lat: -19.0154, lng: 29.1549, zoom: 6 },
  { name: 'Zambia', code: 'ZM', lat: -13.1339, lng: 27.8493, zoom: 6 },
  { name: 'Malawi', code: 'MW', lat: -13.2543, lng: 34.3015, zoom: 7 },
  { name: 'Mozambique', code: 'MZ', lat: -18.6657, lng: 35.5296, zoom: 5 },
  { name: 'Madagascar', code: 'MG', lat: -18.7669, lng: 46.8691, zoom: 6 },
  { name: 'Mauritius', code: 'MU', lat: -20.3484, lng: 57.5522, zoom: 10 },
  { name: 'Seychelles', code: 'SC', lat: -4.6796, lng: 55.4920, zoom: 10 },
  { name: 'Comoros', code: 'KM', lat: -11.6455, lng: 43.3333, zoom: 10 },
  { name: 'Djibouti', code: 'DJ', lat: 11.8251, lng: 42.5903, zoom: 8 },
  { name: 'Eritrea', code: 'ER', lat: 15.1794, lng: 39.7823, zoom: 7 },
  { name: 'Lesotho', code: 'LS', lat: -29.6100, lng: 28.2336, zoom: 8 },
  { name: 'Swaziland', code: 'SZ', lat: -26.5225, lng: 31.4659, zoom: 9 }
].sort((a, b) => a.name.localeCompare(b.name));

const LeafletMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const drawnItemsRef = useRef<any>(null);
  
  const [drawnShapes, setDrawnShapes] = useState<DrawnShape[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    'Select Country',
    'Draw Boundaries',
    'Save Coordinates'
  ];

  useEffect(() => {
    let isMounted = true;

    const loadLeaflet = async () => {
      if (!mapRef.current || mapInstanceRef.current) return;
      
      try {
        // Load Leaflet script and styles dynamically
        if (typeof window !== 'undefined') {
          // Check if Leaflet is already loaded
          if (!(window as any).L) {
            // Load Leaflet CSS
            const cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            cssLink.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
            cssLink.crossOrigin = '';
            document.head.appendChild(cssLink);

            // Load Leaflet Draw CSS
            const drawCssLink = document.createElement('link');
            drawCssLink.rel = 'stylesheet';
            drawCssLink.href = 'https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css';
            document.head.appendChild(drawCssLink);

            // Load Leaflet JS
            const leafletScript = document.createElement('script');
            leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            leafletScript.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
            leafletScript.crossOrigin = '';
            
            await new Promise((resolve, reject) => {
              leafletScript.onload = resolve;
              leafletScript.onerror = reject;
              document.head.appendChild(leafletScript);
            });

            // Load Leaflet Draw JS
            const drawScript = document.createElement('script');
            drawScript.src = 'https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.js';
            
            await new Promise((resolve, reject) => {
              drawScript.onload = resolve;
              drawScript.onerror = reject;
              document.head.appendChild(drawScript);
            });
          }

          if (!isMounted) return;

          const L = (window as any).L;

          // Fix for default markers
          delete L.Icon.Default.prototype._getIconUrl;
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: '/images/marker-icon-2x.png',
            iconUrl: '/images/marker-icon.png',
            shadowUrl: '/images/marker-shadow.png',
          });

          // Initialize map
          const map = L.map(mapRef.current).setView([0, 0], 2);

          // Add tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
          }).addTo(map);

          // Initialize drawn items layer
          const drawnItems = new L.FeatureGroup();
          map.addLayer(drawnItems);

          // Initialize draw control
          const drawControl = new L.Control.Draw({
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
          map.on(L.Draw.Event.CREATED, (event: any) => {
            if (!isMounted) return;
            
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
              // Simple area calculation
              if (layer.getLatLngs && layer.getLatLngs()[0] && layer.getLatLngs()[0].length > 2) {
                area = calculatePolygonArea(layer.getLatLngs()[0]);
              }
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

            setDrawnShapes(prev => {
              const newShapes = [...prev, newShape];
              // Move to step 2 (Save Coordinates) when first shape is drawn
              if (newShapes.length === 1 && activeStep === 1) {
                setActiveStep(2);
              }
              return newShapes;
            });
          });

          map.on(L.Draw.Event.DELETED, (event: any) => {
            if (!isMounted) return;
            setDrawnShapes([]);
          });

          mapInstanceRef.current = map;
          drawnItemsRef.current = drawnItems;
          setIsMapLoading(false);
        }
      } catch (error) {
        console.error('Error loading Leaflet:', error);
        if (isMounted) {
          setMessage({ type: 'error', text: 'Failed to load map. Please refresh the page.' });
          setIsMapLoading(false);
        }
      }
    };

    loadLeaflet();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Simple polygon area calculation using shoelace formula
  const calculatePolygonArea = (coordinates: any[]) => {
    if (coordinates.length < 3) return 0;
    
    let area = 0;
    for (let i = 0; i < coordinates.length; i++) {
      const j = (i + 1) % coordinates.length;
      area += coordinates[i].lat * coordinates[j].lng;
      area -= coordinates[j].lat * coordinates[i].lng;
    }
    return Math.abs(area / 2) * 111320 * 111320; // Rough conversion to square meters
  };

  const navigateToCountry = (country: Country) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([country.lat, country.lng], country.zoom);
      setSelectedCountry(country);
      setActiveStep(1); // Move to "Draw Boundaries" step
      setMessage({ type: 'success', text: `Navigated to ${country.name}. You can now draw boundaries.` });
    }
  };

  const saveShapesToEndpoint = async () => {
    if (drawnShapes.length === 0) {
      setMessage({ type: 'error', text: 'No shapes to save!' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
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
        setMessage({ type: 'success', text: `Successfully saved ${drawnShapes.length} shape(s) for ${selectedCountry?.name || 'selected area'}!` });
        // Workflow completed - could reset or show completion state
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
    // Reset to step 1 if we had drawn shapes
    if (activeStep === 2) {
      setActiveStep(1);
    }
  };

  const resetWorkflow = () => {
    clearAllShapes();
    setSelectedCountry(null);
    setActiveStep(0);
    setMessage(null);
    // Reset map to world view
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([0, 0], 2);
    }
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
            minWidth: 320,
            maxWidth: 400,
            zIndex: 1000,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Boundary Map Workflow
          </Typography>

          {/* Workflow Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step 1: Country Search */}
          {activeStep === 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Step 1: Select a Country
              </Typography>
              <Autocomplete
                options={COUNTRIES}
                getOptionLabel={(option) => option.name}
                value={selectedCountry}
                onChange={(event, newValue) => {
                  if (newValue) {
                    navigateToCountry(newValue);
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search for a country"
                    variant="outlined"
                    size="small"
                    placeholder="Type country name..."
                  />
                )}
                sx={{ width: '100%' }}
              />
            </Box>
          )}

          {/* Step 2: Drawing Instructions */}
          {activeStep === 1 && selectedCountry && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Step 2: Draw Boundaries in {selectedCountry.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Use the drawing tools on the right side of the map to create boundaries.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Drawn Shapes: {drawnShapes.length}
              </Typography>
            </Box>
          )}

          {/* Step 3: Save Coordinates */}
          {activeStep === 2 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Step 3: Save Coordinates
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Review your {drawnShapes.length} shape(s) and save the coordinates.
              </Typography>
            </Box>
          )}

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between', mt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
              disabled={activeStep === 0}
              size="small"
            >
              Back
            </Button>
            
            <Button
              variant="contained"
              onClick={() => {
                if (activeStep < steps.length - 1) {
                  setActiveStep(activeStep + 1);
                }
              }}
              disabled={
                activeStep === steps.length - 1 || 
                (activeStep === 0 && !selectedCountry) ||
                (activeStep === 1 && drawnShapes.length === 0)
              }
              size="small"
            >
              {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', mt: 2 }}>
            {activeStep === 2 && (
              <Button
                variant="contained"
                color="primary"
                onClick={saveShapesToEndpoint}
                disabled={isLoading || drawnShapes.length === 0}
                startIcon={isLoading ? <CircularProgress size={20} /> : null}
              >
                {isLoading ? 'Saving...' : 'Save Coordinates'}
              </Button>
            )}
            
            {activeStep >= 1 && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={clearAllShapes}
                disabled={drawnShapes.length === 0}
              >
                Clear Shapes
              </Button>
            )}

            <Button
              variant="outlined"
              color="warning"
              onClick={resetWorkflow}
              size="small"
            >
              Reset Workflow
            </Button>
          </Box>

          {/* Current Selection Info */}
          {selectedCountry && (
            <Box sx={{ mt: 2, p: 1, bgcolor: 'primary.50', borderRadius: 1 }}>
              <Typography variant="caption" display="block" fontWeight="bold">
                Selected Country: {selectedCountry.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Coordinates: {selectedCountry.lat.toFixed(4)}, {selectedCountry.lng.toFixed(4)}
              </Typography>
            </Box>
          )}

          {/* Messages */}
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
              <Box sx={{ maxHeight: 150, overflowY: 'auto' }}>
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
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default LeafletMap;
