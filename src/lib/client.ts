export interface SectionPoint {
  x: number;
  y: number;
}

export interface SectionCoordinatesEntry {
  type: string;
  points: SectionPoint[];
}

export interface SectionMappingPayload {
  name: string;
  type: string; // e.g., 'collection'
  area: string; // formatted string: "PolygonPoints: N | Area: X m²"
  country: string;
  countryCoordinates: string; // e.g., "lat,lng"
  coordinates: SectionCoordinatesEntry[];
}

export const apiClient = {
  async saveBoundaryGeometry(
    sectionName: string,
    shapes: Array<{ type: string; coordinates: Array<{ lat: number; lng: number }> }>,
    areaString: string,
    countryName: string,
    countryCoordinates: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      if (!sectionName) return { success: false, error: 'Section name is required' };

      const coordinates: SectionCoordinatesEntry[] = shapes.map((s) => ({
        type: s.type,
        points: s.coordinates.map((c) => ({ x: c.lng, y: c.lat })),
      }));

      const payload: SectionMappingPayload = {
        name: sectionName,
        type: 'collection',
        area: areaString,
        country: countryName,
        countryCoordinates,
        coordinates,
      };

      const token = typeof window !== 'undefined' ? localStorage.getItem('custom-auth-token') : null;

      const response = await fetch('http://localhost:1000/api/sectionmapping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: '*/*',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
        credentials: 'include',
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
