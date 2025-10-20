import React, { useState } from 'react';
import {
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { cardStyles, hoverEffects } from "../styles/commonStyles";
import DesktopHoleTable from './DesktopHoleTable';
import MobileHoleEntry from './MobileHoleEntry';


const HoleDetailsForm = ({ holes, handleHoleChange, roundType = '18_holes', isEditMode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Always show both tables. The played status is controlled in the parent RoundForm.
  const tablesData = [
    { holes: holes.slice(0, 9), startIndex: 0, title: "Front 9 - Score Card", panelId: "front9" },
    { holes: holes.slice(9, 18), startIndex: 9, title: "Back 9 - Score Card", panelId: "back9" },
  ];

  const [currentHoleIndex, setCurrentHoleIndex] = useState(0);

  const getInitialExpanded = () => {
    const panelIds = tablesData.map(table => table.panelId);
    return panelIds; // Expand all visible tables
  };

  const [expanded, setExpanded] = useState(getInitialExpanded());

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded((currentExpanded) => {
      if (isExpanded) {
        return [...currentExpanded, panel];
      } else {
        return currentExpanded.filter((p) => p !== panel);
      }
    });
  };

  React.useEffect(() => {
    setExpanded(getInitialExpanded());
  }, [roundType]);

  // For mobile view, we don't use the accordions, we just show the single entry form.
  if (isMobile) {
    return (
      <MobileHoleEntry
        holes={holes}
        currentHoleIndex={currentHoleIndex}
        setCurrentHoleIndex={setCurrentHoleIndex}
        handleHoleChange={handleHoleChange}
        isEditMode={isEditMode}
        // TODO: Pass this prop from the parent RoundForm based on course data
        distanceUnit="meters"
      />
    );
  }

  return (
    <Box sx={cardStyles.sx}>
      {tablesData.map(({ holes: tableHoles, startIndex, title, panelId }, index) => (
        <Accordion
          key={startIndex}
          elevation={3}
          disableGutters
          expanded={expanded.includes(panelId)}
          onChange={handleAccordionChange(panelId)}
          sx={{
            '&:not(:last-child)': {
              mb: 2,
            },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel${index}bh-content`}
            id={`panel${index}bh-header`}
            sx={{
              backgroundColor: 'grey.300',
              color: 'text.primary',
              minHeight: { xs: 48, sm: 48 },
              '&.Mui-expanded': { minHeight: { xs: 48, sm: 48 } },
              ...hoverEffects.button,
              '&.Mui-focused': {
                outline: 'none',
                boxShadow: 'none',
              },
            }}
          >
            <Typography sx={{ width: '33%', flexShrink: 0, fontWeight: 'bold' }}>
              {title}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0, overflowX: 'auto' }}>
            <DesktopHoleTable holes={tableHoles} startIndex={startIndex} handleHoleChange={handleHoleChange} isEditMode={isEditMode} />
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default HoleDetailsForm;
