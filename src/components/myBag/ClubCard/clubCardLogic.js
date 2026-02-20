import { convertDistance } from "../../utils/utils";

export const getShotTypeDetails = (shotTypeName, shotConfig) => {
  try {
    if (!shotConfig?.shotTypes || !Array.isArray(shotConfig.shotTypes)) return null;
    return shotConfig.shotTypes.find((st) => st && st.name === shotTypeName) || null;
  } catch (error) {
    console.error("Error getting shot type details:", error);
    return null;
  }
};

export const calculateAggregateRange = (shots, distanceMetric, displayUnit) => {
  if (!shots || shots.length === 0) {
    return null;
  }

  const distanceKey = `${distanceMetric}_distance`;
  const varianceKey = `${distanceMetric}_variance`;

  const ranges = shots.map((s) => {
    const median = convertDistance(s[distanceKey], s.unit, displayUnit);
    const variance = convertDistance(s[varianceKey], s.unit, displayUnit);
    return { min: median - variance, max: median + variance };
  });

  const lowerBound = Math.round(Math.min(...ranges.map((r) => r.min)));
  const upperBound = Math.round(Math.max(...ranges.map((r) => r.max)));

  const medianDistances = shots.map((s) =>
    convertDistance(s[distanceKey], s.unit, displayUnit)
  );
  const median = Math.round(
    medianDistances.reduce((a, b) => a + b, 0) / medianDistances.length
  );

  return { lowerBound, median, upperBound };
};
