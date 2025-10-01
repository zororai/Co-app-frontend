export interface BoundaryPoint {
  x: number;
  y: number;
}

export interface BoundaryShapeCoordinates {
  type: string;
  coordinates: BoundaryPoint[];
}

export interface BoundaryGeometryPayload {
  id: string;
  name: string;
  geometry: {
    points: BoundaryPoint[];
    coordinates: BoundaryShapeCoordinates[];
    type: string;
  };
}

export const apiClient = {
  async saveBoundaryGeometry(
    sectionName: string,
    shapes: Array<{ type: string; coordinates: Array<{ lat: number; lng: number }> }>
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      if (!sectionName) return { success: false, error: 'Section name is required' };

      const points = shapes.flatMap((s) => s.coordinates.map((c) => ({ x: c.lng, y: c.lat })));
      const coordinates = shapes.map((s) => ({
        type: s.type,
        coordinates: s.coordinates.map((c) => ({ x: c.lng, y: c.lat })),
      }));

      const payload: BoundaryGeometryPayload = {
        id: String(Date.now()),
        name: sectionName,
        geometry: {
          points,
          coordinates,
          type: 'collection',
        },
      };

      const response = await fetch('http://localhost:1000/api/boundaries/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: '*/*',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        return { success: false, error: `Failed: ${response.status} ${text}` };
      }

      const data = await response.json().catch(() => ({}));
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
};
