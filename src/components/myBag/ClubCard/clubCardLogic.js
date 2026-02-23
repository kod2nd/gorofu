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

export const groupShotsByCategoryId = (shots = [], shotConfig) => {
  return (shots || []).reduce((acc, shot) => {
    try {
      if (!shot?.shot_type) return acc;

      const shotTypeDetail = getShotTypeDetails(shot.shot_type, shotConfig);
      const categoryIds = Array.isArray(shotTypeDetail?.category_ids)
        ? shotTypeDetail.category_ids
        : [];

      categoryIds.forEach((categoryId) => {
        if (!categoryId) return;
        if (!acc[categoryId]) acc[categoryId] = [];
        acc[categoryId].push(shot);
      });

      return acc;
    } catch (error) {
      console.error("Error processing shot:", error);
      return acc;
    }
  }, {});
};

export const sortShots = ({
  shots = [],
  shotConfig,
  displayUnit,
  shotSortOrder,
  shotSortDirection,
}) => {
  if (!shots.length) return [];

  const directionMultiplier = shotSortDirection === "asc" ? 1 : -1;

  const getPrimaryCategory = (shot) => {
    const shotDetails = getShotTypeDetails(shot.shot_type, shotConfig);
    if (!shotDetails?.category_ids?.length) return "ZZZ";

    const category = shotConfig.categories?.find(
      (c) => c.id === shotDetails.category_ids[0]
    );

    return category?.name || "ZZZ";
  };

  const shotsToSort = [...shots];

  shotsToSort.sort((a, b) => {
    const distanceA = convertDistance(a.total_distance, a.unit, displayUnit);
    const distanceB = convertDistance(b.total_distance, b.unit, displayUnit);

    switch (shotSortOrder) {
      case "distance":
        return (distanceA - distanceB) * directionMultiplier;

      case "category":
        return (
          getPrimaryCategory(a).localeCompare(getPrimaryCategory(b)) *
          directionMultiplier
        );

      case "category_distance":
        const catDistCompare =
          getPrimaryCategory(a).localeCompare(getPrimaryCategory(b));
        if (catDistCompare !== 0) return catDistCompare;
        return distanceB - distanceA;

      case "distance_category":
        if (distanceA !== distanceB) return distanceB - distanceA;
        return getPrimaryCategory(a).localeCompare(getPrimaryCategory(b));

      default:
        return 0;
    }
  });

  return shotsToSort;
};

export const computeOverallChartRange = (shots = [], displayUnit) => {
  if (!shots.length) {
    return { overallChartMin: 0, overallChartMax: 300 };
  }

  const allDistances = shots
    .flatMap((shot) => {
      const carryMedian = convertDistance(shot.carry_distance, shot.unit, displayUnit);
      const carryVar = convertDistance(shot.carry_variance, shot.unit, displayUnit);

      const totalMedian = convertDistance(shot.total_distance, shot.unit, displayUnit);
      const totalVar = convertDistance(shot.total_variance, shot.unit, displayUnit);

      return [
        carryMedian - carryVar,
        carryMedian + carryVar,
        totalMedian - totalVar,
        totalMedian + totalVar,
      ];
    })
    .filter((d) => Number.isFinite(d));

  if (!allDistances.length) {
    return { overallChartMin: 0, overallChartMax: 300 };
  }

  const minDistance = Math.min(...allDistances);
  const maxDistance = Math.max(...allDistances);
  const range = maxDistance - minDistance;
  const padding = Math.max(10, range * 0.1); // 10% padding, at least 10 units

  return {
    overallChartMin: Math.max(0, minDistance - padding),
    overallChartMax: maxDistance + padding,
  };
};

export const buildClubSpecs = (club = {}) => {
  const specs = [
    { label: "Make", value: club.make },
    { label: "Model", value: club.model },
    { label: "Loft", value: club.loft },
    { label: "Bounce", value: club.bounce },
    {
      label: "Shaft",
      value: `${club.shaft_make || ""} ${club.shaft_model || ""}`.trim(),
    },
    { label: "Flex", value: club.shaft_flex },
    {
      label: "Grip",
      value: `${club.grip_make || ""} ${club.grip_model || ""}`.trim(),
    },
  ];

  return specs.filter((s) => s.value);
};

export const getBagIdsContainingClub = (bags = [], clubId) => {
  if (!Array.isArray(bags) || !clubId) return [];

  return bags
    .filter((bag) => Array.isArray(bag?.clubIds) && bag.clubIds.includes(clubId))
    .map((bag) => bag.id);
};
