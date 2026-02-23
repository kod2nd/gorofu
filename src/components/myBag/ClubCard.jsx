import React, { useState, useMemo } from "react";
import {
  Stack,
  Divider,
  Accordion,
  AccordionDetails,
  useTheme,
} from "@mui/material";
import {
  segmentedSx,
} from "../../styles/commonStyles";

import { alpha } from "@mui/material/styles";
import { 
  calculateAggregateRange,
  groupShotsByCategoryId,
  sortShots,
  computeOverallChartRange,
  buildClubSpecs,
  getBagIdsContainingClub,
} from "./ClubCard/clubCardLogic";
import ClubCardSummary from "./ClubCard/ClubCardSummary";
import DistanceRangesSection from "./ClubCard/DistanceRangesSection";
import BagChipsSection from "./ClubCard/BagChipsSection";
import SpecsSection from "./ClubCard/SpecsSection";
import ShotsSection from "./ClubCard/ShotsSection";

const ClubCard = ({
  club,
  shotConfig,
  displayUnit,
  bags,
  onEdit,
  onDeleteRequest,
  onConfigureShots,
  onManageShotTypes,
  onBagAssignmentChange,
}) => {
  const [distanceView, setDistanceView] = useState("total");
  const [expanded, setExpanded] = useState(false);
  const [showSpecs, setShowSpecs] = useState(true);
  const [showRanges, setShowRanges] = useState(true);
  const [shotSortOrder, setShotSortOrder] = useState("distance");
  const [shotSortDirection, setShotSortDirection] = useState("desc"); // 'asc' or 'desc'
  const theme = useTheme();

  // Safe defaults for all props
  const safeClub = club || {};
  const safeShotConfig = shotConfig || { categories: [], shotTypes: [] };
  const safeBags = Array.isArray(bags) ? bags : [];
  const safeShots = Array.isArray(safeClub.shots) ? safeClub.shots : [];

  // Calculate the overall min/max across ALL shots for this club to create a consistent scale
  const { overallChartMin, overallChartMax } = useMemo(
    () => computeOverallChartRange(safeShots, displayUnit),
    [safeShots, displayUnit]
  );

  const unitLabel = displayUnit === "meters" ? "m" : "yd";

  const sortedShots = useMemo(
    () =>
      sortShots({
        shots: safeShots,
        shotConfig: safeShotConfig,
        displayUnit,
        shotSortOrder,
        shotSortDirection,
      }),
    [safeShots, safeShotConfig, displayUnit, shotSortOrder, shotSortDirection]
  );

  // Safe shots by category grouping
  const shotsByCategoryId = useMemo(
    () => groupShotsByCategoryId(safeShots, safeShotConfig),
    [safeShots, safeShotConfig]
  );

  // Safe club specs
  const clubSpecs = useMemo(() => buildClubSpecs(safeClub), [safeClub]);


  // Safe bag filtering
  const bagsContainingClubIds = useMemo(
    () => getBagIdsContainingClub(safeBags, safeClub.id),
    [safeBags, safeClub.id]
  );

  const handleBagToggle = (bagId) => {
    try {
      const newBagIds = [...bagsContainingClubIds];
      const currentIndex = newBagIds.indexOf(bagId);

      if (currentIndex === -1) {
        newBagIds.push(bagId);
      } else {
        newBagIds.splice(currentIndex, 1);
      }

      if (onBagAssignmentChange) {
        onBagAssignmentChange(safeClub.id, newBagIds);
      }
    } catch (error) {
      console.error("Error handling bag toggle:", error);
    }
  };

  const handleEditClub = (event) => {
    event.stopPropagation();
    if (onEdit && safeClub) {
      onEdit(safeClub);
    }
  };

  const handleDeleteClub = (event) => {
    event.stopPropagation();
    if (onDeleteRequest && safeClub) {
      onDeleteRequest(safeClub, "club");
    }
  };

  const handleAccordionChange = (event, isExpanded) => {
    setExpanded(isExpanded);
  };

  // Safe categories
  const safeCategories = Array.isArray(safeShotConfig.categories)
    ? safeShotConfig.categories
    : [];

  const longGameCategoryId = useMemo(() => {
    const longGameCategory = safeCategories.find(
      (c) => c.name.toLowerCase() === "long game"
    );
    return longGameCategory?.id;
  }, [safeCategories]);

  const longGameShots = longGameCategoryId
    ? shotsByCategoryId[longGameCategoryId]
    : [];

  const summaryCarryRange = useMemo(
    () => calculateAggregateRange(longGameShots, "carry", displayUnit),
    [longGameShots, displayUnit]
  );
  const summaryTotalRange = useMemo(
    () => calculateAggregateRange(longGameShots, "total", displayUnit),
    [longGameShots, displayUnit]
  );

  const hasSummaryData = summaryCarryRange || summaryTotalRange;
  const isPutter = safeClub.type === "Putter";

  return (
    <Accordion
      expanded={expanded}
      onChange={handleAccordionChange}
      elevation={0}
      sx={(theme) => ({
        borderRadius: 4,
        border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
        overflow: "hidden",
        background: `linear-gradient(180deg,
          ${alpha(theme.palette.primary.main, 0.5)} 0%,
          ${alpha(theme.palette.background.default, 1)} 0.5%)`,
        transition:
          "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: `0 10px 30px ${alpha(theme.palette.common.black, 0.10)}`,
          borderColor: alpha(theme.palette.primary.main, 0.22),
        },
        "&::before": { display: "none" },
      })}
    >
      <ClubCardSummary
        safeClub={safeClub}
        isPutter={isPutter}
        hasSummaryData={hasSummaryData}
        summaryCarryRange={summaryCarryRange}
        summaryTotalRange={summaryTotalRange}
        unitLabel={unitLabel}
        onEdit={handleEditClub}
        onDelete={handleDeleteClub}
      />

      <AccordionDetails sx={{ p: { xs: 2, md: 3 } }}>
        <Stack spacing={3} sx={{ mb: 2 }}>
          <BagChipsSection
            safeBags={safeBags}
            bagsContainingClubIds={bagsContainingClubIds}
            onToggleBag={handleBagToggle}
          />

          <SpecsSection clubSpecs={clubSpecs} showSpecs={showSpecs} onToggle={() => setShowSpecs((v) => !v)} />

          <DistanceRangesSection
            showRanges={showRanges}
            onToggleRanges={() => setShowRanges((v) => !v)}
            distanceView={distanceView}
            setDistanceView={setDistanceView}
            theme={theme}
            segmentedSx={segmentedSx}
            safeCategories={safeCategories}
            shotsByCategoryId={shotsByCategoryId}
            safeShotConfig={safeShotConfig}
            displayUnit={displayUnit}
            overallChartMin={overallChartMin}
            overallChartMax={overallChartMax}
          />
        </Stack>

        <Divider sx={{ my: 2 }} />

        <ShotsSection
          shotsCount={safeShots.length}
          sortedShots={sortedShots}
          shotConfig={shotConfig}
          displayUnit={displayUnit}
          club={club}
          onManageShotTypes={onManageShotTypes}
          onAddShot={() => onConfigureShots(club, true)}
          onEditShot={(s) => onConfigureShots(club, false, s)}
          onDeleteShot={(id) => onDeleteRequest(id, "shot")}
          shotSortOrder={shotSortOrder}
          setShotSortOrder={setShotSortOrder}
          shotSortDirection={shotSortDirection}
          setShotSortDirection={setShotSortDirection}
        />
      </AccordionDetails>
    </Accordion>
  );
};

export default ClubCard;
