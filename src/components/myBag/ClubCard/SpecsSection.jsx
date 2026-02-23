import {
  Box,
  Button,
  Typography,
  Chip,
  Collapse,
} from "@mui/material";
import {
  Info,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";



const SpecsSection = ({ clubSpecs = [], showSpecs, onToggle }) => {
    if (!clubSpecs.length) return null;

    return (
        <Box>
            <Button
                fullWidth
                onClick={onToggle}
                endIcon={
                <ExpandMoreIcon
                    sx={{
                    transform: showSpecs ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s",
                    }}
                />
                }
                sx={{ justifyContent: "space-between", color: "text.primary", p: 0, mb: 1 }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Info color="action" />
                <Typography variant="h6">Specifications</Typography>
                </Box>
            </Button>

            <Collapse in={showSpecs}>
                <Box sx={{ mt: 1, position: "relative" }}>
                    <Box
                        sx={{
                        display: "flex",
                        flexWrap: "nowrap",
                        overflowX: "auto",
                        gap: 0.75,
                        py: 0.5,
                        px: 0.5,
                        scrollbarWidth: "thin",
                        "&::-webkit-scrollbar": { height: 4 },
                        "&::-webkit-scrollbar-thumb": { backgroundColor: "grey.400", borderRadius: 2 },
                        "& .MuiChip-root": {
                            flexShrink: 0,
                            fontSize: { xs: "0.7rem", sm: "0.8125rem" },
                            height: { xs: 26, sm: 32 },
                            "& .MuiChip-label": {
                            px: { xs: 1, sm: 1.5 },
                            py: { xs: 0.25, sm: 0.5 },
                            whiteSpace: "nowrap",
                            },
                        },
                        }}
                    >
                        {clubSpecs.map((spec) => (
                        <Chip key={spec.label} label={`${spec.label}: ${spec.value}`} size="small" variant="outlined" />
                        ))}
                    </Box>
                </Box>
            </Collapse>
        </Box>
        );
    };

    export default SpecsSection;
