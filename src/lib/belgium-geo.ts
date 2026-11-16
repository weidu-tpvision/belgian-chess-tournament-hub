import { RegionType } from '@/db/schema';

export interface BelgianLocation {
  city: string;
  cityFr?: string;
  cityNl?: string;
  postalCode: string;
  province: string;
  region: RegionType;
  lat: number;
  lng: number;
}

export const BELGIAN_LOCATIONS: Record<string, BelgianLocation> = {
  '1000': { city: 'Brussels', cityFr: 'Bruxelles', cityNl: 'Brussel', postalCode: '1000', province: 'Brussels-Capital', region: 'Brussels', lat: 50.8466, lng: 4.3528 },
  '1040': { city: 'Etterbeek', cityFr: 'Etterbeek', cityNl: 'Etterbeek', postalCode: '1040', province: 'Brussels-Capital', region: 'Brussels', lat: 50.8361, lng: 4.3862 },
  '1050': { city: 'Ixelles', cityFr: 'Ixelles', cityNl: 'Elsene', postalCode: '1050', province: 'Brussels-Capital', region: 'Brussels', lat: 50.8225, lng: 4.3797 },
  '1150': { city: 'Woluwe-Saint-Pierre', cityFr: 'Woluwe-Saint-Pierre', cityNl: 'Sint-Pieters-Woluwe', postalCode: '1150', province: 'Brussels-Capital', region: 'Brussels', lat: 50.8304, lng: 4.4394 },
  '1160': { city: 'Auderghem', cityFr: 'Auderghem', cityNl: 'Oudergem', postalCode: '1160', province: 'Brussels-Capital', region: 'Brussels', lat: 50.8168, lng: 4.4268 },
  '1200': { city: 'Woluwe-Saint-Lambert', cityFr: 'Woluwe-Saint-Lambert', cityNl: 'Sint-Lambrechts-Woluwe', postalCode: '1200', province: 'Brussels-Capital', region: 'Brussels', lat: 50.8488, lng: 4.4277 },
  '1300': { city: 'Wavre', cityFr: 'Wavre', cityNl: 'Waver', postalCode: '1300', province: 'Walloon Brabant', region: 'Wallonia', lat: 50.7172, lng: 4.6114 },
  '1348': { city: 'Louvain-la-Neuve', cityFr: 'Louvain-la-Neuve', postalCode: '1348', province: 'Walloon Brabant', region: 'Wallonia', lat: 50.6681, lng: 4.6118 },
  '1400': { city: 'Nivelles', cityFr: 'Nivelles', cityNl: 'Nijvel', postalCode: '1400', province: 'Walloon Brabant', region: 'Wallonia', lat: 50.5975, lng: 4.3285 },
  '1420': { city: 'Braine-l’Alleud', cityFr: 'Braine-l’Alleud', postalCode: '1420', province: 'Walloon Brabant', region: 'Wallonia', lat: 50.6836, lng: 4.3717 },
  '1500': { city: 'Halle', cityFr: 'Hal', cityNl: 'Halle', postalCode: '1500', province: 'Flemish Brabant', region: 'Flanders', lat: 50.7339, lng: 4.2345 },
  '1800': { city: 'Vilvoorde', cityFr: 'Vilvorde', cityNl: 'Vilvoorde', postalCode: '1800', province: 'Flemish Brabant', region: 'Flanders', lat: 50.9281, lng: 4.4294 },
  '2000': { city: 'Antwerp', cityFr: 'Anvers', cityNl: 'Antwerpen', postalCode: '2000', province: 'Antwerp', region: 'Flanders', lat: 51.2194, lng: 4.4025 },
  '2140': { city: 'Borgerhout (Antwerp)', cityNl: 'Borgerhout', postalCode: '2140', province: 'Antwerp', region: 'Flanders', lat: 51.2141, lng: 4.4442 },
  '2600': { city: 'Berchem (Antwerp)', cityNl: 'Berchem', postalCode: '2600', province: 'Antwerp', region: 'Flanders', lat: 51.1922, lng: 4.4328 },
  '2800': { city: 'Mechelen', cityFr: 'Malines', cityNl: 'Mechelen', postalCode: '2800', province: 'Antwerp', region: 'Flanders', lat: 51.0259, lng: 4.4775 },
  '2930': { city: 'Brasschaat', cityNl: 'Brasschaat', postalCode: '2930', province: 'Antwerp', region: 'Flanders', lat: 51.2925, lng: 4.4918 },
  '2440': { city: 'Geel', cityNl: 'Geel', postalCode: '2440', province: 'Antwerp', region: 'Flanders', lat: 51.1627, lng: 4.9908 },
  '2300': { city: 'Turnhout', cityNl: 'Turnhout', postalCode: '2300', province: 'Antwerp', region: 'Flanders', lat: 51.3227, lng: 4.9447 },
  '3000': { city: 'Leuven', cityFr: 'Louvain', cityNl: 'Leuven', postalCode: '3000', province: 'Flemish Brabant', region: 'Flanders', lat: 50.8798, lng: 4.7005 },
  '3300': { city: 'Tienen', cityFr: 'Tirlemont', cityNl: 'Tienen', postalCode: '3300', province: 'Flemish Brabant', region: 'Flanders', lat: 50.8074, lng: 4.9381 },
  '3500': { city: 'Hasselt', cityNl: 'Hasselt', postalCode: '3500', province: 'Limburg', region: 'Flanders', lat: 50.9307, lng: 5.3325 },
  '3600': { city: 'Genk', cityNl: 'Genk', postalCode: '3600', province: 'Limburg', region: 'Flanders', lat: 50.9655, lng: 5.5008 },
  '3920': { city: 'Lommel', cityNl: 'Lommel', postalCode: '3920', province: 'Limburg', region: 'Flanders', lat: 51.2305, lng: 5.3135 },
  '4000': { city: 'Liège', cityFr: 'Liège', cityNl: 'Luik', postalCode: '4000', province: 'Liège', region: 'Wallonia', lat: 50.6326, lng: 5.5797 },
  '4100': { city: 'Seraing', cityFr: 'Seraing', postalCode: '4100', province: 'Liège', region: 'Wallonia', lat: 50.5836, lng: 5.5011 },
  '4700': { city: 'Eupen', cityFr: 'Eupen', postalCode: '4700', province: 'Liège (East Belgium)', region: 'Wallonia', lat: 50.6279, lng: 6.0365 },
  '4800': { city: 'Verviers', cityFr: 'Verviers', postalCode: '4800', province: 'Liège', region: 'Wallonia', lat: 50.5891, lng: 5.8624 },
  '5000': { city: 'Namur', cityFr: 'Namur', cityNl: 'Namen', postalCode: '5000', province: 'Namur', region: 'Wallonia', lat: 50.4674, lng: 4.8720 },
  '5100': { city: 'Jambes (Namur)', cityFr: 'Jambes', postalCode: '5100', province: 'Namur', region: 'Wallonia', lat: 50.4567, lng: 4.8706 },
  '6000': { city: 'Charleroi', cityFr: 'Charleroi', postalCode: '6000', province: 'Hainaut', region: 'Wallonia', lat: 50.4108, lng: 4.4446 },
  '6700': { city: 'Arlon', cityFr: 'Arlon', cityNl: 'Aarlen', postalCode: '6700', province: 'Luxembourg', region: 'Wallonia', lat: 49.6833, lng: 5.8167 },
  '6800': { city: 'Libramont', cityFr: 'Libramont-Chevigny', postalCode: '6800', province: 'Luxembourg', region: 'Wallonia', lat: 49.9195, lng: 5.3764 },
  '7000': { city: 'Mons', cityFr: 'Mons', cityNl: 'Bergen', postalCode: '7000', province: 'Hainaut', region: 'Wallonia', lat: 50.4542, lng: 3.9567 },
  '7500': { city: 'Tournai', cityFr: 'Tournai', cityNl: 'Doornik', postalCode: '7500', province: 'Hainaut', region: 'Wallonia', lat: 50.6056, lng: 3.3880 },
  '8000': { city: 'Bruges', cityFr: 'Bruges', cityNl: 'Brugge', postalCode: '8000', province: 'West Flanders', region: 'Flanders', lat: 51.2093, lng: 3.2247 },
  '8370': { city: 'Blankenberge', cityNl: 'Blankenberge', postalCode: '8370', province: 'West Flanders', region: 'Flanders', lat: 51.3131, lng: 3.1322 },
  '8400': { city: 'Ostend', cityFr: 'Ostende', cityNl: 'Oostende', postalCode: '8400', province: 'West Flanders', region: 'Flanders', lat: 51.2154, lng: 2.9286 },
  '8500': { city: 'Kortrijk', cityFr: 'Courtrai', cityNl: 'Kortrijk', postalCode: '8500', province: 'West Flanders', region: 'Flanders', lat: 50.8279, lng: 3.2649 },
  '8800': { city: 'Roeselare', cityFr: 'Roulers', cityNl: 'Roeselare', postalCode: '8800', province: 'West Flanders', region: 'Flanders', lat: 50.9447, lng: 3.1246 },
  '9000': { city: 'Ghent', cityFr: 'Gand', cityNl: 'Gent', postalCode: '9000', province: 'East Flanders', region: 'Flanders', lat: 51.0543, lng: 3.7174 },
  '9100': { city: 'Sint-Niklaas', cityFr: 'Saint-Nicolas', cityNl: 'Sint-Niklaas', postalCode: '9100', province: 'East Flanders', region: 'Flanders', lat: 51.1646, lng: 4.1394 },
  '9300': { city: 'Aalst', cityFr: 'Alost', cityNl: 'Aalst', postalCode: '9300', province: 'East Flanders', region: 'Flanders', lat: 50.9378, lng: 4.0409 }
};

export function resolveBelgianLocation(query: string): BelgianLocation {
  const cleaned = (query || '').trim();
  if (BELGIAN_LOCATIONS[cleaned]) {
    return BELGIAN_LOCATIONS[cleaned];
  }
  const lower = cleaned.toLowerCase();
  for (const loc of Object.values(BELGIAN_LOCATIONS)) {
    if (
      loc.city.toLowerCase().includes(lower) ||
      (loc.cityFr && loc.cityFr.toLowerCase().includes(lower)) ||
      (loc.cityNl && loc.cityNl.toLowerCase().includes(lower)) ||
      lower.includes(loc.city.toLowerCase())
    ) {
      return loc;
    }
  }
  return BELGIAN_LOCATIONS['1000'];
}

export function calculateHaversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  // Multiply straight-line distance by 1.24 road winding factor in Belgium
  return Math.round(R * c * 1.24);
}

export function estimateDriveMinutes(roadDistanceKm: number): number {
  if (roadDistanceKm <= 8) return Math.max(10, Math.round(roadDistanceKm * 2.5));
  if (roadDistanceKm <= 30) return Math.round(10 + roadDistanceKm * 1.15);
  return Math.round(14 + roadDistanceKm * 0.85);
}
