import {
  Box,
  Typography,
  Stack,
  Chip,
} from "@mui/material";
import {
  GolfCourse,
  Star,
} from "@mui/icons-material";

 const BagChipsSection = ({ safeBags, bagsContainingClubIds, onToggleBag }) => {
    if (!safeBags?.length) return null;

    return (
      <Box>
        <Typography variant="overline" color="text.secondary">
          In Bags
        </Typography>

        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1, mt: 1 }}>
          {safeBags.map((bag) => (
            <Chip
              key={bag?.id || "unknown"}
              icon={<GolfCourse />}
              label={
                <Box component="span" sx={{ display: "flex", alignItems: "center" }}>
                  {bag?.name || "Unknown Bag"}
                  {bag?.is_default && <Star sx={{ fontSize: 16, ml: 0.5, color: "inherit" }} />}
                </Box>
              }
              clickable
              color={bagsContainingClubIds.includes(bag?.id) ? "primary" : "default"}
              variant={bagsContainingClubIds.includes(bag?.id) ? "filled" : "outlined"}
              onClick={() => bag?.id && onToggleBag(bag.id)}
            />
          ))}
        </Stack>
      </Box>
    );
  };
  
  export default BagChipsSection;
  