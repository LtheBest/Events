/**
 * Utilitaires pour le matching géographique conducteurs/passagers
 */

/**
 * Extrait la ville d'une adresse
 */
export function extractCity(address: string): string | null {
  if (!address) return null;
  
  // Cherche un code postal français (5 chiffres)
  const postalCodeMatch = address.match(/\b(\d{5})\b/);
  
  if (postalCodeMatch) {
    // Extrait le texte après le code postal (généralement la ville)
    const parts = address.split(postalCodeMatch[0]);
    if (parts[1]) {
      const city = parts[1]
        .trim()
        .split(',')[0]
        .split('-')[0]
        .toLowerCase();
      return city;
    }
  }
  
  // Fallback : prend les derniers mots de l'adresse
  const parts = address.split(',');
  if (parts.length > 0) {
    const lastPart = parts[parts.length - 1].trim().toLowerCase();
    // Enlève les codes postaux
    return lastPart.replace(/\b\d{5}\b/g, '').trim();
  }
  
  return null;
}

/**
 * Extrait la zone/département d'une adresse (2 premiers chiffres du code postal)
 */
export function extractZone(address: string): string | null {
  if (!address) return null;
  
  const postalCodeMatch = address.match(/\b(\d{5})\b/);
  
  if (postalCodeMatch) {
    const postalCode = postalCodeMatch[1];
    // Retourne le département (2 premiers chiffres)
    return postalCode.substring(0, 2);
  }
  
  return null;
}

/**
 * Vérifie si deux adresses sont dans la même zone
 */
export function isSameZone(address1: string, address2: string): boolean {
  const zone1 = extractZone(address1);
  const zone2 = extractZone(address2);
  
  if (!zone1 || !zone2) return false;
  
  return zone1 === zone2;
}

/**
 * Vérifie si deux adresses sont dans la même ville
 */
export function isSameCity(address1: string, address2: string): boolean {
  const city1 = extractCity(address1);
  const city2 = extractCity(address2);
  
  if (!city1 || !city2) return false;
  
  return city1 === city2;
}

/**
 * Calcule la distance approximative entre deux codes postaux (en km)
 * Note : Ceci est une approximation basée sur les départements
 */
export function estimateDistance(postalCode1: string, postalCode2: string): number {
  if (postalCode1 === postalCode2) return 0;
  
  const dept1 = postalCode1.substring(0, 2);
  const dept2 = postalCode2.substring(0, 2);
  
  if (dept1 === dept2) {
    // Même département : environ 30km
    return 30;
  }
  
  // Départements différents : environ 100km
  return 100;
}

/**
 * Trouve les conducteurs disponibles pour un passager
 */
export interface MatchResult {
  rideId: string;
  driverId: string;
  driverName: string;
  distance: 'same_city' | 'same_zone' | 'other';
  availableSeats: number;
}

export function matchPassengerWithDrivers(
  passengerAddress: string,
  availableRides: any[]
): MatchResult[] {
  const passengerCity = extractCity(passengerAddress);
  const passengerZone = extractZone(passengerAddress);
  
  const matches: MatchResult[] = [];
  
  for (const ride of availableRides) {
    if (ride.available_seats <= 0) continue;
    
    const rideCity = extractCity(ride.departure_address);
    const rideZone = extractZone(ride.departure_address);
    
    let distance: 'same_city' | 'same_zone' | 'other' = 'other';
    
    if (passengerCity && rideCity && passengerCity === rideCity) {
      distance = 'same_city';
    } else if (passengerZone && rideZone && passengerZone === rideZone) {
      distance = 'same_zone';
    }
    
    matches.push({
      rideId: ride.id,
      driverId: ride.participant_id,
      driverName: `${ride.first_name} ${ride.last_name}`,
      distance,
      availableSeats: ride.available_seats
    });
  }
  
  // Trier par pertinence : même ville d'abord, puis même zone
  matches.sort((a, b) => {
    if (a.distance === b.distance) return 0;
    if (a.distance === 'same_city') return -1;
    if (b.distance === 'same_city') return 1;
    if (a.distance === 'same_zone') return -1;
    return 1;
  });
  
  return matches;
}
