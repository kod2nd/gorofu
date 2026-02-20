import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Box, Typography, Chip } from "@mui/material";
import { alpha } from "@mui/material/styles";

const StudentPicker = ({
  students = [],
  selectedStudentId,
  setSelectedStudentId,
  getAssignedCoaches,
  toProperCase,
  disabled,
}) => {
  const selectedStudent = students.find((s) => s.user_id === selectedStudentId) || null;

  return (
    <Autocomplete
      options={students}
      value={selectedStudent}
      onChange={(e, newValue) => setSelectedStudentId(newValue?.user_id || "")}
      getOptionLabel={(option) => toProperCase(option.full_name) || "Unnamed Student"}
      isOptionEqualToValue={(option, value) => option.user_id === value.user_id}
      disabled={disabled}
      clearOnEscape
      autoHighlight
      renderOption={(props, option) => {
        const coaches = getAssignedCoaches(option.user_id);

        return (
          <Box
            component="li"
            {...props}
            sx={(theme) => ({
              py: 1.25,
              px: 1.25,
              borderRadius: 2,
              display: "grid",
              gap: 0.5,
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.06),
              },
            })}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, minWidth: 0 }}>
              <Typography sx={{ minWidth: 0 }} noWrap>
                {toProperCase(option.full_name) || "Unnamed Student"}
              </Typography>
              <Typography color="text.secondary" noWrap>
                {option.email} |
              </Typography>
            </Box>

            {coaches.length > 0 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, alignItems: "center" }}>
                <Typography fontWeight={600}
                >
                  Coach:
                </Typography>
                {coaches.slice(0, 3).map((coach) => (
                  <Chip
                    key={coach.user_id}
                    size="small"
                    label={toProperCase(coach.full_name)}
                    sx={(theme) => ({
                      borderRadius: 999,
                      fontWeight: 800,
                      bgcolor: alpha(theme.palette.text.primary, 0.10),
                    })}
                  />
                ))}
                {coaches.length > 3 && (
                  <Chip
                    size="small"
                    label={`+${coaches.length - 3}`}
                    sx={(theme) => ({
                      borderRadius: 999,
                      fontWeight: 900,
                      bgcolor: alpha(theme.palette.primary.main, 0.10),
                      color: theme.palette.primary.main,
                    })}
                  />
                )}
              </Box>
            )}
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Student"
          placeholder="Search students…"
          sx={(theme) => ({
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
              backgroundColor: alpha(theme.palette.background.paper, 0.9),
            },
          })}
        />
      )}
    />
  );
};

export default StudentPicker;
