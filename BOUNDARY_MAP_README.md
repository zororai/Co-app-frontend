# Boundary Map Feature

This document describes the boundary map feature that allows users to draw shapes on a map and save their coordinates.

## Overview

The boundary map feature consists of:
- A React component (`BoundaryMap`) that renders an interactive map using Leaflet
- Drawing tools for creating polygons, rectangles, circles, markers, and polylines
- Coordinate extraction and saving functionality
- A Next.js API endpoint for handling coordinate data

## Components

### 1. BoundaryMap Component
**Location**: `src/components/dashboard/boundarymap/BoundaryMap.tsx`

**Features**:
- Interactive map using Leaflet and OpenStreetMap tiles
- Drawing tools for various shapes (polygon, rectangle, circle, marker, polyline)
- Real-time coordinate extraction
- Shape management (add, edit, delete)
- Save coordinates to API endpoint
- Visual feedback and error handling

**Props**: None (self-contained component)

### 2. Map Page
**Location**: `src/app/dashboard/Map/page.tsx`

A Next.js page that renders the BoundaryMap component with a header and proper layout.

### 3. API Endpoint
**Location**: `src/app/api/boundaries/route.ts`

**Endpoints**:
- `POST /api/boundaries` - Save boundary coordinates
- `GET /api/boundaries` - Retrieve saved boundaries (mock implementation)

## Usage

### Drawing Shapes
1. Navigate to `/dashboard/Map`
2. Use the drawing tools in the top-right corner of the map:
   - **Polygon**: Draw custom polygons by clicking points
   - **Rectangle**: Draw rectangles by clicking and dragging
   - **Circle**: Draw circles by clicking center and dragging radius
   - **Marker**: Place point markers
   - **Polyline**: Draw lines by clicking points

### Saving Coordinates
1. Draw one or more shapes on the map
2. Click the "Save Coordinates" button in the control panel
3. The coordinates will be sent to the `/api/boundaries` endpoint
4. Success/error messages will be displayed

### Managing Shapes
- **Edit**: Use the edit tool to modify existing shapes
- **Delete**: Use the delete tool to remove shapes
- **Clear All**: Click "Clear All Shapes" to remove all shapes at once

## Data Structure

### Coordinate Format
```typescript
interface Coordinate {
  lat: number;
  lng: number;
}
```

### Shape Format
```typescript
interface DrawnShape {
  id: string;          // Unique identifier
  type: string;        // Shape type (polygon, rectangle, circle, marker, polyline)
  coordinates: Coordinate[];  // Array of coordinates
  area?: number;       // Calculated area (for polygons and circles)
}
```

### API Request Format
```typescript
interface BoundaryData {
  shapes: DrawnShape[];
  timestamp: string;
}
```

## Dependencies

The following packages are required (already installed):
- `leaflet`: ^1.9.4 - Core mapping library
- `leaflet-draw`: ^1.0.4 - Drawing tools
- `@types/leaflet`: ^1.9.20 - TypeScript definitions
- `@types/leaflet-draw`: ^1.0.13 - TypeScript definitions for drawing tools

## Configuration

### Map Settings
- **Default View**: [0, 0] with zoom level 2 (world view)
- **Tile Layer**: OpenStreetMap
- **Max Zoom**: 18
- **Drawing Colors**: Purple theme (#97009c)

### Marker Icons
The component expects marker icon files in the `/public/images/` directory:
- `marker-icon.png`
- `marker-icon-2x.png`
- `marker-shadow.png`

## Customization

### Changing Map Tiles
Replace the tile layer URL in `BoundaryMap.tsx`:
```typescript
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
  maxZoom: 18,
}).addTo(map);
```

### Styling Drawing Tools
Modify the `shapeOptions` in the draw control configuration:
```typescript
shapeOptions: {
  color: '#97009c',      // Border color
  weight: 3,             // Border width
  opacity: 0.8,          // Border opacity
  fillOpacity: 0.4,      // Fill opacity
}
```

### Database Integration
Replace the mock implementation in `/api/boundaries/route.ts` with your database logic:
```typescript
// Example with PostgreSQL + PostGIS
const result = await db.query(
  'INSERT INTO boundaries (shapes, created_at) VALUES ($1, $2)',
  [JSON.stringify(body.shapes), new Date()]
);
```

## Troubleshooting

### Common Issues

1. **Map not loading**: Check that Leaflet CSS is properly imported
2. **Drawing tools not working**: Ensure leaflet-draw CSS is imported
3. **Marker icons missing**: Verify marker icon files exist in `/public/images/`
4. **TypeScript errors**: Check that all type definitions are installed

### Browser Console Errors
- Check browser console for detailed error messages
- Verify network requests to the API endpoint
- Ensure proper CORS configuration if using external APIs

## Future Enhancements

Potential improvements:
1. **Database Integration**: Connect to PostgreSQL with PostGIS or MongoDB
2. **User Authentication**: Associate boundaries with specific users
3. **Shape Labels**: Add custom labels to drawn shapes
4. **Import/Export**: Support for KML, GeoJSON, or Shapefile formats
5. **Advanced Editing**: More sophisticated shape editing tools
6. **Measurement Tools**: Distance and area measurement utilities
7. **Layer Management**: Multiple boundary layers with visibility controls

## API Documentation

### POST /api/boundaries
Save boundary coordinates to the server.

**Request Body**:
```json
{
  "shapes": [
    {
      "id": "1234567890",
      "type": "polygon",
      "coordinates": [
        {"lat": 40.7128, "lng": -74.0060},
        {"lat": 40.7589, "lng": -73.9851},
        {"lat": 40.7505, "lng": -73.9934}
      ],
      "area": 1000000
    }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Successfully saved 1 shape(s)",
  "data": {
    "shapesCount": 1,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /api/boundaries
Retrieve saved boundary coordinates (currently returns mock data).

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "type": "polygon",
      "coordinates": [...],
      "area": 1000000,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```
