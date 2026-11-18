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
  '1020': { city: 'Laeken (Brussels)', cityFr: 'Laeken', cityNl: 'Laken', postalCode: '1020', province: 'Brussels-Capital', region: 'Brussels', lat: 50.8833, lng: 4.3483 },
  '1030': { city: 'Schaerbeek', cityFr: 'Schaerbeek', cityNl: 'Schaarbeek', postalCode: '1030', province: 'Brussels-Capital', region: 'Brussels', lat: 50.8676, lng: 4.3737 },
  '1040': { city: 'Etterbeek', cityFr: 'Etterbeek', cityNl: 'Etterbeek', postalCode: '1040', province: 'Brussels-Capital', region: 'Brussels', lat: 50.8361, lng: 4.3862 },
  '1050': { city: 'Ixelles', cityFr: 'Ixelles', cityNl: 'Elsene', postalCode: '1050', province: 'Brussels-Capital', region: 'Brussels', lat: 50.8225, lng: 4.3797 },
  '1060': { city: 'Saint-Gilles', cityFr: 'Saint-Gilles', cityNl: 'Sint-Gillis', postalCode: '1060', province: 'Brussels-Capital', region: 'Brussels', lat: 50.8267, lng: 4.3456 },
  '1070': { city: 'Anderlecht', cityFr: 'Anderlecht', cityNl: 'Anderlecht', postalCode: '1070', province: 'Brussels-Capital', region: 'Brussels', lat: 50.8364, lng: 4.3081 },
  '1080': { city: 'Molenbeek-Saint-Jean', cityFr: 'Molenbeek-Saint-Jean', cityNl: 'Sint-Jans-Molenbeek', postalCode: '1080', province: 'Brussels-Capital', region: 'Brussels', lat: 50.8546, lng: 4.3228 },
  '1090': { city: 'Jette', cityFr: 'Jette', cityNl: 'Jette', postalCode: '1090', province: 'Brussels-Capital', region: 'Brussels', lat: 50.8794, lng: 4.3261 },
  '1140': { city: 'Evere', cityFr: 'Evere', cityNl: 'Evere', postalCode: '1140', province: 'Brussels-Capital', region: 'Brussels', lat: 50.8722, lng: 4.4033 },
  '1150': { city: 'Woluwe-Saint-Pierre', cityFr: 'Woluwe-Saint-Pierre', cityNl: 'Sint-Pieters-Woluwe', postalCode: '1150', province: 'Brussels-Capital', region: 'Brussels', lat: 50.8304, lng: 4.4394 },
  '1160': { city: 'Auderghem', cityFr: 'Auderghem', cityNl: 'Oudergem', postalCode: '1160', province: 'Brussels-Capital', region: 'Brussels', lat: 50.8168, lng: 4.4268 },
  '1170': { city: 'Watermael-Boitsfort', cityFr: 'Watermael-Boitsfort', cityNl: 'Watermaal-Bosvoorde', postalCode: '1170', province: 'Brussels-Capital', region: 'Brussels', lat: 50.7997, lng: 4.4161 },
  '1180': { city: 'Uccle', cityFr: 'Uccle', cityNl: 'Ukkel', postalCode: '1180', province: 'Brussels-Capital', region: 'Brussels', lat: 50.8024, lng: 4.3372 },
  '1190': { city: 'Forest', cityFr: 'Forest', cityNl: 'Vorst', postalCode: '1190', province: 'Brussels-Capital', region: 'Brussels', lat: 50.8116, lng: 4.3182 },
  '1200': { city: 'Woluwe-Saint-Lambert', cityFr: 'Woluwe-Saint-Lambert', cityNl: 'Sint-Lambrechts-Woluwe', postalCode: '1200', province: 'Brussels-Capital', region: 'Brussels', lat: 50.8488, lng: 4.4277 },
  '1300': { city: 'Wavre', cityFr: 'Wavre', cityNl: 'Waver', postalCode: '1300', province: 'Walloon Brabant', region: 'Wallonia', lat: 50.7172, lng: 4.6114 },
  '1310': { city: 'La Hulpe', cityFr: 'La Hulpe', cityNl: 'Terhulpen', postalCode: '1310', province: 'Walloon Brabant', region: 'Wallonia', lat: 50.7311, lng: 4.4878 },
  '1348': { city: 'Louvain-la-Neuve', cityFr: 'Louvain-la-Neuve', postalCode: '1348', province: 'Walloon Brabant', region: 'Wallonia', lat: 50.6681, lng: 4.6118 },
  '1400': { city: 'Nivelles', cityFr: 'Nivelles', cityNl: 'Nijvel', postalCode: '1400', province: 'Walloon Brabant', region: 'Wallonia', lat: 50.5975, lng: 4.3285 },
  '1410': { city: 'Waterloo', cityFr: 'Waterloo', cityNl: 'Waterloo', postalCode: '1410', province: 'Walloon Brabant', region: 'Wallonia', lat: 50.7147, lng: 4.3991 },
  '1420': { city: 'Braine-l’Alleud', cityFr: 'Braine-l’Alleud', postalCode: '1420', province: 'Walloon Brabant', region: 'Wallonia', lat: 50.6836, lng: 4.3717 },
  '1500': { city: 'Halle', cityFr: 'Hal', cityNl: 'Halle', postalCode: '1500', province: 'Flemish Brabant', region: 'Flanders', lat: 50.7339, lng: 4.2345 },
  '1650': { city: 'Beersel (Dworp)', cityFr: 'Beersel', cityNl: 'Beersel', postalCode: '1650', province: 'Flemish Brabant', region: 'Flanders', lat: 50.7662, lng: 4.3008 },
  '1700': { city: 'Dilbeek', cityNl: 'Dilbeek', postalCode: '1700', province: 'Flemish Brabant', region: 'Flanders', lat: 50.8479, lng: 4.2597 },
  '1800': { city: 'Vilvoorde', cityFr: 'Vilvorde', cityNl: 'Vilvoorde', postalCode: '1800', province: 'Flemish Brabant', region: 'Flanders', lat: 50.9281, lng: 4.4294 },
  '1930': { city: 'Zaventem', cityNl: 'Zaventem', postalCode: '1930', province: 'Flemish Brabant', region: 'Flanders', lat: 50.8837, lng: 4.4713 },
  '2000': { city: 'Antwerp', cityFr: 'Anvers', cityNl: 'Antwerpen', postalCode: '2000', province: 'Antwerp', region: 'Flanders', lat: 51.2194, lng: 4.4025 },
  '2140': { city: 'Borgerhout (Antwerp)', cityNl: 'Borgerhout', postalCode: '2140', province: 'Antwerp', region: 'Flanders', lat: 51.2141, lng: 4.4442 },
  '2500': { city: 'Lier', cityNl: 'Lier', postalCode: '2500', province: 'Antwerp', region: 'Flanders', lat: 51.1312, lng: 4.5704 },
  '2600': { city: 'Berchem (Antwerp)', cityNl: 'Berchem', postalCode: '2600', province: 'Antwerp', region: 'Flanders', lat: 51.1922, lng: 4.4328 },
  '2800': { city: 'Mechelen', cityFr: 'Malines', cityNl: 'Mechelen', postalCode: '2800', province: 'Antwerp', region: 'Flanders', lat: 51.0259, lng: 4.4775 },
  '2930': { city: 'Brasschaat', cityNl: 'Brasschaat', postalCode: '2930', province: 'Antwerp', region: 'Flanders', lat: 51.2925, lng: 4.4918 },
  '2440': { city: 'Geel', cityNl: 'Geel', postalCode: '2440', province: 'Antwerp', region: 'Flanders', lat: 51.1627, lng: 4.9908 },
  '2300': { city: 'Turnhout', cityNl: 'Turnhout', postalCode: '2300', province: 'Antwerp', region: 'Flanders', lat: 51.3227, lng: 4.9447 },
  '3000': { city: 'Leuven', cityFr: 'Louvain', cityNl: 'Leuven', postalCode: '3000', province: 'Flemish Brabant', region: 'Flanders', lat: 50.8798, lng: 4.7005 },
  '3001': { city: 'Heverlee (Leuven)', cityNl: 'Heverlee', postalCode: '3001', province: 'Flemish Brabant', region: 'Flanders', lat: 50.8643, lng: 4.6939 },
  '3200': { city: 'Aarschot', cityNl: 'Aarschot', postalCode: '3200', province: 'Flemish Brabant', region: 'Flanders', lat: 50.9841, lng: 4.8369 },
  '3300': { city: 'Tienen', cityFr: 'Tirlemont', cityNl: 'Tienen', postalCode: '3300', province: 'Flemish Brabant', region: 'Flanders', lat: 50.8074, lng: 4.9381 },
  '3500': { city: 'Hasselt', cityNl: 'Hasselt', postalCode: '3500', province: 'Limburg', region: 'Flanders', lat: 50.9307, lng: 5.3325 },
  '3600': { city: 'Genk', cityNl: 'Genk', postalCode: '3600', province: 'Limburg', region: 'Flanders', lat: 50.9655, lng: 5.5008 },
  '3800': { city: 'Sint-Truiden', cityFr: 'Saint-Trond', cityNl: 'Sint-Truiden', postalCode: '3800', province: 'Limburg', region: 'Flanders', lat: 50.8167, lng: 5.1833 },
  '3920': { city: 'Lommel', cityNl: 'Lommel', postalCode: '3920', province: 'Limburg', region: 'Flanders', lat: 51.2305, lng: 5.3135 },
  '4000': { city: 'Liège', cityFr: 'Liège', cityNl: 'Luik', postalCode: '4000', province: 'Liège', region: 'Wallonia', lat: 50.6326, lng: 5.5797 },
  '4100': { city: 'Seraing', cityFr: 'Seraing', postalCode: '4100', province: 'Liège', region: 'Wallonia', lat: 50.5836, lng: 5.5011 },
  '4160': { city: 'Anthisnes', cityFr: 'Anthisnes', postalCode: '4160', province: 'Liège', region: 'Wallonia', lat: 50.4806, lng: 5.5244 },
  '4500': { city: 'Huy', cityFr: 'Huy', cityNl: 'Hoei', postalCode: '4500', province: 'Liège', region: 'Wallonia', lat: 50.5189, lng: 5.2328 },
  '4700': { city: 'Eupen', cityFr: 'Eupen', postalCode: '4700', province: 'Liège (East Belgium)', region: 'Wallonia', lat: 50.6279, lng: 6.0365 },
  '4720': { city: 'Kelmis', cityFr: 'La Calamine', postalCode: '4720', province: 'Liège (East Belgium)', region: 'Wallonia', lat: 50.7176, lng: 6.0128 },
  '4800': { city: 'Verviers', cityFr: 'Verviers', postalCode: '4800', province: 'Liège', region: 'Wallonia', lat: 50.5891, lng: 5.8624 },
  '5000': { city: 'Namur', cityFr: 'Namur', cityNl: 'Namen', postalCode: '5000', province: 'Namur', region: 'Wallonia', lat: 50.4674, lng: 4.8720 },
  '5060': { city: 'Sambreville', cityFr: 'Sambreville', postalCode: '5060', province: 'Namur', region: 'Wallonia', lat: 50.4401, lng: 4.6025 },
  '5100': { city: 'Jambes (Namur)', cityFr: 'Jambes', postalCode: '5100', province: 'Namur', region: 'Wallonia', lat: 50.4567, lng: 4.8706 },
  '5500': { city: 'Dinant', cityFr: 'Dinant', postalCode: '5500', province: 'Namur', region: 'Wallonia', lat: 50.2611, lng: 4.9122 },
  '6000': { city: 'Charleroi', cityFr: 'Charleroi', postalCode: '6000', province: 'Hainaut', region: 'Wallonia', lat: 50.4108, lng: 4.4446 },
  '6150': { city: 'Anderlues', cityFr: 'Anderlues', postalCode: '6150', province: 'Hainaut', region: 'Wallonia', lat: 50.4057, lng: 4.2698 },
  '6700': { city: 'Arlon', cityFr: 'Arlon', cityNl: 'Aarlen', postalCode: '6700', province: 'Luxembourg', region: 'Wallonia', lat: 49.6833, lng: 5.8167 },
  '6800': { city: 'Libramont', cityFr: 'Libramont-Chevigny', postalCode: '6800', province: 'Luxembourg', region: 'Wallonia', lat: 49.9195, lng: 5.3764 },
  '6900': { city: 'Marche-en-Famenne', cityFr: 'Marche-en-Famenne', postalCode: '6900', province: 'Luxembourg', region: 'Wallonia', lat: 50.2268, lng: 5.3442 },
  '7000': { city: 'Mons', cityFr: 'Mons', cityNl: 'Bergen', postalCode: '7000', province: 'Hainaut', region: 'Wallonia', lat: 50.4542, lng: 3.9567 },
  '7100': { city: 'La Louvière', cityFr: 'La Louvière', postalCode: '7100', province: 'Hainaut', region: 'Wallonia', lat: 50.4796, lng: 4.1879 },
  '7160': { city: 'Chapelle-lez-Herlaimont', cityFr: 'Chapelle-lez-Herlaimont', postalCode: '7160', province: 'Hainaut', region: 'Wallonia', lat: 50.4706, lng: 4.2818 },
  '7330': { city: 'Saint-Ghislain', cityFr: 'Saint-Ghislain', postalCode: '7330', province: 'Hainaut', region: 'Wallonia', lat: 50.4481, lng: 3.8189 },
  '7331': { city: 'Baudour (Saint-Ghislain)', cityFr: 'Baudour', postalCode: '7331', province: 'Hainaut', region: 'Wallonia', lat: 50.4851, lng: 3.8342 },
  '7500': { city: 'Tournai', cityFr: 'Tournai', cityNl: 'Doornik', postalCode: '7500', province: 'Hainaut', region: 'Wallonia', lat: 50.6056, lng: 3.3880 },
  '7700': { city: 'Mouscron', cityFr: 'Mouscron', cityNl: 'Moeskroen', postalCode: '7700', province: 'Hainaut', region: 'Wallonia', lat: 50.7446, lng: 3.2064 },
  '7900': { city: 'Leuze-en-Hainaut', cityFr: 'Leuze-en-Hainaut', postalCode: '7900', province: 'Hainaut', region: 'Wallonia', lat: 50.6006, lng: 3.6219 },
  '8000': { city: 'Bruges', cityFr: 'Bruges', cityNl: 'Brugge', postalCode: '8000', province: 'West Flanders', region: 'Flanders', lat: 51.2093, lng: 3.2247 },
  '8300': { city: 'Knokke-Heist', cityNl: 'Knokke-Heist', postalCode: '8300', province: 'West Flanders', region: 'Flanders', lat: 51.3413, lng: 3.2856 },
  '8370': { city: 'Blankenberge', cityNl: 'Blankenberge', postalCode: '8370', province: 'West Flanders', region: 'Flanders', lat: 51.3131, lng: 3.1322 },
  '8400': { city: 'Ostend', cityFr: 'Ostende', cityNl: 'Oostende', postalCode: '8400', province: 'West Flanders', region: 'Flanders', lat: 51.2154, lng: 2.9286 },
  '8500': { city: 'Kortrijk', cityFr: 'Courtrai', cityNl: 'Kortrijk', postalCode: '8500', province: 'West Flanders', region: 'Flanders', lat: 50.8279, lng: 3.2649 },
  '8800': { city: 'Roeselare', cityFr: 'Roulers', cityNl: 'Roeselare', postalCode: '8800', province: 'West Flanders', region: 'Flanders', lat: 50.9447, lng: 3.1246 },
  '8900': { city: 'Ypres', cityFr: 'Ypres', cityNl: 'Ieper', postalCode: '8900', province: 'West Flanders', region: 'Flanders', lat: 50.8511, lng: 2.8857 },
  '9000': { city: 'Ghent', cityFr: 'Gand', cityNl: 'Gent', postalCode: '9000', province: 'East Flanders', region: 'Flanders', lat: 51.0543, lng: 3.7174 },
  '9100': { city: 'Sint-Niklaas', cityFr: 'Saint-Nicolas', cityNl: 'Sint-Niklaas', postalCode: '9100', province: 'East Flanders', region: 'Flanders', lat: 51.1646, lng: 4.1394 },
  '9200': { city: 'Dendermonde', cityFr: 'Termonde', cityNl: 'Dendermonde', postalCode: '9200', province: 'East Flanders', region: 'Flanders', lat: 51.0255, lng: 4.1011 },
  '9300': { city: 'Aalst', cityFr: 'Alost', cityNl: 'Aalst', postalCode: '9300', province: 'East Flanders', region: 'Flanders', lat: 50.9378, lng: 4.0409 },
  '9400': { city: 'Ninove', cityNl: 'Ninove', postalCode: '9400', province: 'East Flanders', region: 'Flanders', lat: 50.8384, lng: 4.0226 },
  '9600': { city: 'Ronse', cityFr: 'Renaix', cityNl: 'Ronse', postalCode: '9600', province: 'East Flanders', region: 'Flanders', lat: 50.7458, lng: 3.6006 },
  '9620': { city: 'Zottegem', cityNl: 'Zottegem', postalCode: '9620', province: 'East Flanders', region: 'Flanders', lat: 50.8696, lng: 3.8105 },
  '9700': { city: 'Oudenaarde', cityFr: 'Audenarde', cityNl: 'Oudenaarde', postalCode: '9700', province: 'East Flanders', region: 'Flanders', lat: 50.8444, lng: 3.6085 },
  '9880': { city: 'Aalter', cityNl: 'Aalter', postalCode: '9880', province: 'East Flanders', region: 'Flanders', lat: 51.0839, lng: 3.4472 },
  '9940': { city: 'Ertvelde (Evergem)', cityNl: 'Ertvelde', postalCode: '9940', province: 'East Flanders', region: 'Flanders', lat: 51.1794, lng: 3.7447 }
};

function resolveByBelgianPostalZone(codeNum: number, postalCode: string, cityHint?: string): BelgianLocation {
  const cleanHint = cityHint && !/^\d+$/.test(cityHint.trim()) ? cityHint.trim() : '';
  if (codeNum >= 1000 && codeNum <= 1299) {
    return { city: cleanHint || `Brussels (${postalCode})`, postalCode, province: 'Brussels-Capital', region: 'Brussels', lat: 50.8466, lng: 4.3528 };
  }
  if (codeNum >= 1300 && codeNum <= 1499) {
    return { city: cleanHint || `Walloon Brabant (${postalCode})`, postalCode, province: 'Walloon Brabant', region: 'Wallonia', lat: 50.695, lng: 4.52 };
  }
  if ((codeNum >= 1500 && codeNum <= 1999) || (codeNum >= 3000 && codeNum <= 3499)) {
    const isEast = codeNum >= 3000;
    return {
      city: cleanHint || `Flemish Brabant (${postalCode})`,
      postalCode,
      province: 'Flemish Brabant',
      region: 'Flanders',
      lat: isEast ? 50.88 : 50.84,
      lng: isEast ? 4.72 : 4.35,
    };
  }
  if (codeNum >= 2000 && codeNum <= 2999) {
    return { city: cleanHint || `Antwerp Province (${postalCode})`, postalCode, province: 'Antwerp', region: 'Flanders', lat: 51.18, lng: 4.55 };
  }
  if (codeNum >= 3500 && codeNum <= 3999) {
    return { city: cleanHint || `Limburg (${postalCode})`, postalCode, province: 'Limburg', region: 'Flanders', lat: 50.98, lng: 5.38 };
  }
  if (codeNum >= 4000 && codeNum <= 4999) {
    return { city: cleanHint || `Liège Province (${postalCode})`, postalCode, province: 'Liège', region: 'Wallonia', lat: 50.62, lng: 5.65 };
  }
  if (codeNum >= 5000 && codeNum <= 5999) {
    return { city: cleanHint || `Namur Province (${postalCode})`, postalCode, province: 'Namur', region: 'Wallonia', lat: 50.42, lng: 4.87 };
  }
  if ((codeNum >= 6000 && codeNum <= 6599) || (codeNum >= 7000 && codeNum <= 7999)) {
    return { city: cleanHint || `Hainaut (${postalCode})`, postalCode, province: 'Hainaut', region: 'Wallonia', lat: 50.45, lng: 4.15 };
  }
  if (codeNum >= 6600 && codeNum <= 6999) {
    return { city: cleanHint || `Luxembourg Province (${postalCode})`, postalCode, province: 'Luxembourg', region: 'Wallonia', lat: 49.95, lng: 5.45 };
  }
  if (codeNum >= 8000 && codeNum <= 8999) {
    return { city: cleanHint || `West Flanders (${postalCode})`, postalCode, province: 'West Flanders', region: 'Flanders', lat: 51.05, lng: 3.15 };
  }
  return { city: cleanHint || `East Flanders (${postalCode})`, postalCode, province: 'East Flanders', region: 'Flanders', lat: 51.02, lng: 3.82 };
}

export function resolveBelgianLocation(query: string, cityHint?: string): BelgianLocation {
  const cleaned = (query || '').trim();
  if (BELGIAN_LOCATIONS[cleaned]) {
    const exact = BELGIAN_LOCATIONS[cleaned];
    if (cityHint && cityHint.trim() && !/^\d+$/.test(cityHint.trim())) {
      const hintLower = cityHint.trim().toLowerCase();
      // Only override city display name if user explicitly provided a different non-default city name for an unlisted sub-municipality
      if (
        hintLower !== exact.city.toLowerCase() &&
        hintLower !== (exact.cityFr || '').toLowerCase() &&
        hintLower !== (exact.cityNl || '').toLowerCase()
      ) {
        return exact;
      }
    }
    return exact;
  }

  // Extract 4-digit Belgian postal code if embedded in string (e.g., "1310 La Hulpe")
  const postalMatch = cleaned.match(/\b([1-9]\d{3})\b/);
  if (postalMatch) {
    const code = postalMatch[1];
    const remainingText = cleaned.replace(code, '').replace(/[,()-]/g, '').trim();
    if (BELGIAN_LOCATIONS[code]) {
      return BELGIAN_LOCATIONS[code];
    }
    return resolveByBelgianPostalZone(Number(code), code, remainingText || cityHint);
  }

  const lower = cleaned.toLowerCase();
  if (lower.length >= 2) {
    for (const loc of Object.values(BELGIAN_LOCATIONS)) {
      const cityLower = loc.city.toLowerCase();
      const frLower = (loc.cityFr || '').toLowerCase();
      const nlLower = (loc.cityNl || '').toLowerCase();
      if (
        cityLower.includes(lower) ||
        (frLower && frLower.includes(lower)) ||
        (nlLower && nlLower.includes(lower)) ||
        lower.includes(cityLower) ||
        (frLower && lower.includes(frLower)) ||
        (nlLower && lower.includes(nlLower))
      ) {
        return loc;
      }
    }
  }
  return BELGIAN_LOCATIONS['1000'];
}

export function getBelgianAgeCategory(birthYear: number, referenceYear = 2026): {
  age: number;
  ageCategory: 'U8' | 'U10' | 'U12' | 'U14' | 'U16' | 'U18' | 'U20' | 'Open';
} {
  const age = Math.max(4, referenceYear - birthYear);
  if (age <= 8) return { age, ageCategory: 'U8' };
  if (age <= 10) return { age, ageCategory: 'U10' };
  if (age <= 12) return { age, ageCategory: 'U12' };
  if (age <= 14) return { age, ageCategory: 'U14' };
  if (age <= 16) return { age, ageCategory: 'U16' };
  if (age <= 18) return { age, ageCategory: 'U18' };
  if (age <= 20) return { age, ageCategory: 'U20' };
  return { age, ageCategory: 'Open' };
}

export function isSectionMatchingPlayer(
  sectionLabel: string,
  ageCategory: string,
  playerMaxElo: number
): boolean {
  const upper = sectionLabel.toUpperCase();
  if (upper.includes(ageCategory.toUpperCase())) {
    return true;
  }
  // Check rating cap sections such as "Open <1600", "Open B (<1700)", "Open C (<1500)"
  const capMatch = sectionLabel.match(/<\s*(\d{3,4})/);
  if (capMatch) {
    const cap = Number(capMatch[1]);
    if (playerMaxElo > 0 && playerMaxElo < cap && playerMaxElo >= cap - 400) {
      return true;
    }
  }
  // Check rating range sections such as "1500-1900"
  const rangeMatch = sectionLabel.match(/(\d{3,4})\s*[–-]\s*(\d{3,4})/);
  if (rangeMatch) {
    const minElo = Number(rangeMatch[1]);
    const maxElo = Number(rangeMatch[2]);
    if (playerMaxElo >= minElo && playerMaxElo <= maxElo) {
      return true;
    }
  }
  return false;
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
