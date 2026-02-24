const YARDS_TO_METERS = 0.9144;
const METERS_TO_YARDS = 1.09361;

export const convertDistance = (distance, fromUnit, toUnit) => {
  try {
    if (typeof distance !== 'number' || isNaN(distance)) return 0;
    if (fromUnit === toUnit) return distance;
    if (fromUnit === 'yards' && toUnit === 'meters') return Math.round(distance * YARDS_TO_METERS);
    if (fromUnit === 'meters' && toUnit === 'yards') return Math.round(distance * METERS_TO_YARDS);
    return Math.round(distance)
  } catch (error) {
    console.error('Error converting distance:', error);
    return 0;
  }
};