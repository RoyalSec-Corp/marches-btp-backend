/**
 * Service de géocodage pour convertir les adresses en coordonnées GPS
 * Utilise l'API gouvernementale française (api-adresse.data.gouv.fr) - gratuite et sans clé API
 */

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  city: string;
  postcode: string;
  context: string; // Département, région
  score: number; // Score de confiance (0-1)
}

export interface AddressInput {
  adresse?: string;
  ville?: string;
  codePostal?: string;
  pays?: string;
}

interface GeocodingFeature {
  geometry: {
    coordinates: [number, number];
  };
  properties: {
    label?: string;
    city?: string;
    name?: string;
    postcode?: string;
    context?: string;
    score?: number;
  };
}

interface GeocodingApiResponse {
  features: GeocodingFeature[];
}

class GeocodingService {
  private readonly API_URL = 'https://api-adresse.data.gouv.fr';

  /**
   * Géocoder une adresse complète
   */
  async geocodeAddress(input: AddressInput): Promise<GeocodingResult | null> {
    try {
      // Construire la requête d'adresse
      const queryParts: string[] = [];
      if (input.adresse) {
        queryParts.push(input.adresse);
      }
      if (input.codePostal) {
        queryParts.push(input.codePostal);
      }
      if (input.ville) {
        queryParts.push(input.ville);
      }

      if (queryParts.length === 0) {
        console.warn('Geocoding: Aucune adresse fournie');
        return null;
      }

      const query = queryParts.join(' ');
      const url = `${this.API_URL}/search/?q=${encodeURIComponent(query)}&limit=1`;

      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`Geocoding API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data: GeocodingApiResponse = await response.json();

      if (!data.features || data.features.length === 0) {
        console.warn(`Geocoding: Aucun résultat pour "${query}"`);
        return null;
      }

      const feature = data.features[0];
      const [longitude, latitude] = feature.geometry.coordinates;
      const props = feature.properties;

      return {
        latitude,
        longitude,
        formattedAddress: props.label || query,
        city: props.city || input.ville || '',
        postcode: props.postcode || input.codePostal || '',
        context: props.context || '',
        score: props.score || 0,
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  /**
   * Géocoder par code postal et ville uniquement
   */
  async geocodeByPostalCode(codePostal: string, ville?: string): Promise<GeocodingResult | null> {
    try {
      let url = `${this.API_URL}/search/?q=${encodeURIComponent(codePostal)}`;
      if (ville) {
        url += `+${encodeURIComponent(ville)}`;
      }
      url += '&type=municipality&limit=1';

      const response = await fetch(url);
      
      if (!response.ok) {
        return null;
      }

      const data: GeocodingApiResponse = await response.json();

      if (!data.features || data.features.length === 0) {
        return null;
      }

      const feature = data.features[0];
      const [longitude, latitude] = feature.geometry.coordinates;
      const props = feature.properties;

      return {
        latitude,
        longitude,
        formattedAddress: props.label || '',
        city: props.city || props.name || '',
        postcode: props.postcode || codePostal,
        context: props.context || '',
        score: props.score || 0,
      };
    } catch (error) {
      console.error('Geocoding by postal code error:', error);
      return null;
    }
  }

  /**
   * Géocodage inverse : coordonnées → adresse
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<GeocodingResult | null> {
    try {
      const url = `${this.API_URL}/reverse/?lon=${longitude}&lat=${latitude}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        return null;
      }

      const data: GeocodingApiResponse = await response.json();

      if (!data.features || data.features.length === 0) {
        return null;
      }

      const feature = data.features[0];
      const props = feature.properties;

      return {
        latitude,
        longitude,
        formattedAddress: props.label || '',
        city: props.city || '',
        postcode: props.postcode || '',
        context: props.context || '',
        score: props.score || 0,
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }

  /**
   * Calculer la distance entre deux points (en km)
   * Formule de Haversine
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Autocomplétion d'adresse
   */
  async autocomplete(query: string, limit: number = 5): Promise<GeocodingResult[]> {
    try {
      if (!query || query.length < 3) {
        return [];
      }

      const url = `${this.API_URL}/search/?q=${encodeURIComponent(query)}&limit=${limit}&autocomplete=1`;

      const response = await fetch(url);
      
      if (!response.ok) {
        return [];
      }

      const data: GeocodingApiResponse = await response.json();

      if (!data.features) {
        return [];
      }

      return data.features.map((feature: GeocodingFeature) => {
        const [longitude, latitude] = feature.geometry.coordinates;
        const props = feature.properties;

        return {
          latitude,
          longitude,
          formattedAddress: props.label || '',
          city: props.city || '',
          postcode: props.postcode || '',
          context: props.context || '',
          score: props.score || 0,
        };
      });
    } catch (error) {
      console.error('Autocomplete error:', error);
      return [];
    }
  }
}

export const geocodingService = new GeocodingService();
export default geocodingService;
