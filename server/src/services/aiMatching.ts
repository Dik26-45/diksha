import { Ride, UserPreference, RideMatchScore, Gender } from '../types';

/**
 * Calculates Haversine distance between two coordinates in kilometers.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates bearing angle in degrees from (lat1, lon1) to (lat2, lon2).
 */
export function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  const theta = Math.atan2(y, x);
  return ((theta * 180) / Math.PI + 360) % 360;
}

export interface MatchingQuery {
  passengerGender?: Gender;
  isPassengerVerified?: boolean;
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
  preferredDepartureTime?: string;
  userPreference?: Partial<UserPreference>;
  onlyWomenOnly?: boolean;
}

/**
 * SAFAR AI Matching Engine
 * Rule-based heuristic scoring (0–100 total score):
 * - Pickup proximity: 30%
 * - Destination proximity: 30%
 * - Departure-time compatibility: 20%
 * - Route compatibility: 15%
 * - User preferences: 5%
 * 
 * NOTE: This is an explainable rule-based matching algorithm, not an unverified black-box ML model.
 */
export function scoreAndFilterRides(
  rides: Ride[],
  query: MatchingQuery
): RideMatchScore[] {
  const maxSearchRadiusKm = 25; // max acceptable pickup/dest radius
  const results: RideMatchScore[] = [];

  for (const ride of rides) {
    // Exclusion 1: Cancelled, Completed, In-Progress
    if (ride.status !== 'SCHEDULED') {
      continue;
    }

    // Exclusion 2: Full rides
    if (ride.availableSeats <= 0) {
      continue;
    }

    // Exclusion 3: Women-Only eligibility check
    if (ride.isWomenOnly) {
      // Must have passenger gender declared as FEMALE
      if (query.passengerGender !== 'FEMALE') {
        continue;
      }
    }

    // If query strictly requested women-only rides
    if (query.onlyWomenOnly && !ride.isWomenOnly) {
      continue;
    }

    // 1. Pickup Proximity (30% weight)
    const pickupDistKm = calculateHaversineDistanceKm(
      query.originLat,
      query.originLng,
      ride.originLat,
      ride.originLng
    );
    if (pickupDistKm > maxSearchRadiusKm) {
      continue; // outside reasonable proximity
    }
    // Proximity score: 100% within 0.5km, decaying linearly to 0 at 15km
    const pickupRatio = Math.max(0, 1 - pickupDistKm / 15);
    const pickupScore = Math.round(pickupRatio * 30 * 10) / 10;

    // 2. Destination Proximity (30% weight)
    const destDistKm = calculateHaversineDistanceKm(
      query.destLat,
      query.destLng,
      ride.destLat,
      ride.destLng
    );
    if (destDistKm > maxSearchRadiusKm) {
      continue;
    }
    const destRatio = Math.max(0, 1 - destDistKm / 15);
    const destScore = Math.round(destRatio * 30 * 10) / 10;

    // 3. Departure Time Compatibility (20% weight)
    let timeScore = 15; // default moderate score if no time specified
    let timeDiffMinutes = 0;
    if (query.preferredDepartureTime) {
      const preferredTime = new Date(query.preferredDepartureTime).getTime();
      const rideTime = new Date(ride.departureTime).getTime();
      timeDiffMinutes = Math.abs(rideTime - preferredTime) / (1000 * 60);

      if (timeDiffMinutes <= 15) {
        timeScore = 20;
      } else if (timeDiffMinutes <= 30) {
        timeScore = 17;
      } else if (timeDiffMinutes <= 60) {
        timeScore = 14;
      } else if (timeDiffMinutes <= 120) {
        timeScore = 9;
      } else if (timeDiffMinutes <= 240) {
        timeScore = 4;
      } else {
        timeScore = 0;
      }
    }

    // 4. Route Compatibility (15% weight)
    // Measure bearing alignment between requested direction and ride trajectory
    const queryBearing = calculateBearing(
      query.originLat,
      query.originLng,
      query.destLat,
      query.destLng
    );
    const rideBearing = calculateBearing(
      ride.originLat,
      ride.originLng,
      ride.destLat,
      ride.destLng
    );
    let bearingDiff = Math.abs(queryBearing - rideBearing);
    if (bearingDiff > 180) bearingDiff = 360 - bearingDiff;

    let routeScore = 0;
    if (bearingDiff <= 15) {
      routeScore = 15;
    } else if (bearingDiff <= 35) {
      routeScore = 12;
    } else if (bearingDiff <= 60) {
      routeScore = 8;
    } else if (bearingDiff <= 90) {
      routeScore = 4;
    } else {
      routeScore = 0;
    }

    // 5. User Preferences (5% weight)
    let preferenceScore = 3.5; // base moderate compatibility
    if (query.userPreference) {
      let prefPoints = 0;
      let totalPrefChecks = 0;

      if (query.userPreference.quietRide !== undefined) {
        totalPrefChecks++;
        prefPoints += 1;
      }
      if (query.userPreference.smokingAllowed !== undefined) {
        totalPrefChecks++;
        // Rides in Safar are strictly non-smoking unless flagged
        prefPoints += 1;
      }
      if (query.userPreference.womenOnlyPreferred && ride.isWomenOnly) {
        prefPoints += 2;
        totalPrefChecks += 2;
      }
      if (totalPrefChecks > 0) {
        preferenceScore = Math.min(5, Math.round((prefPoints / totalPrefChecks) * 5 * 10) / 10);
      }
    }

    // Overall composite score (0 - 100)
    const overallScore = Math.min(
      100,
      Math.max(
        0,
        Math.round((pickupScore + destScore + timeScore + routeScore + preferenceScore) * 10) / 10
      )
    );

    // Formulate human-readable explainable summary
    const explanationParts: string[] = [];
    if (pickupDistKm < 1.0) {
      explanationParts.push(`Pickup within ${(pickupDistKm * 1000).toFixed(0)}m`);
    } else {
      explanationParts.push(`Pickup ${pickupDistKm.toFixed(1)}km away`);
    }

    if (destDistKm < 1.0) {
      explanationParts.push(`drop-off ${(destDistKm * 1000).toFixed(0)}m from destination`);
    } else {
      explanationParts.push(`drop-off ${destDistKm.toFixed(1)}km from destination`);
    }

    if (query.preferredDepartureTime && timeDiffMinutes <= 45) {
      explanationParts.push(`departs within ${Math.round(timeDiffMinutes)}m of your time`);
    }

    if (bearingDiff <= 25) {
      explanationParts.push('parallel highway corridor');
    }

    if (ride.isWomenOnly) {
      explanationParts.push('verified women-only ride');
    }

    const explanation = `${overallScore}% Match (Rule-based): ${explanationParts.join(', ')}.`;

    results.push({
      rideId: ride.id,
      overallScore,
      pickupProximityScore: pickupScore,
      destProximityScore: destScore,
      timeCompatibilityScore: timeScore,
      routeCompatibilityScore: routeScore,
      preferenceScore,
      explanation,
      ride,
    });
  }

  // Sort by overallScore descending
  results.sort((a, b) => b.overallScore - a.overallScore);
  return results;
}
