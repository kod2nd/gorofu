import React from "react";
import { Paper, Typography, Box } from "@mui/material";
import {
  LineChart,
  Line,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ShowChart } from "@mui/icons-material";

const ChartCard = ({ title, subtitle, children, icon }) => (
  <Paper
    elevation={2}
    sx={{
      p: 3,
      flexBasis: { xs: "100%", lg: "calc(50% - 12px)" },
      borderRadius: 3,
      border: "1px solid",
      borderColor: "divider",
      transition: "all 0.3s ease",
      "&:hover": {
        boxShadow: 4,
        borderColor: "primary.light",
      },
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
      {icon && (
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
          }}
        >
          {icon}
        </Box>
      )}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 0.5 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
    {children}
  </Paper>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;

  return (
    <Paper
      elevation={3}
      sx={{
        p: 1.5,
        background: "rgba(255, 255, 255, 0.98)",
        backdropFilter: "blur(10px)",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: "bold", mb: 0.5 }}>
        {label}
      </Typography>
      {payload.map((entry, index) => (
        <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: entry.color,
            }}
          />
          <Typography variant="caption" color="text.secondary">
            {entry.name}:
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            {typeof entry.value === "number"
              ? entry.value.toFixed(2)
              : entry.value}
          </Typography>
        </Box>
      ))}
    </Paper>
  );
};

const CustomLegend = ({ payload, colors }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        gap: 3,
        mt: 2,
        flexWrap: "wrap",
      }}
    >
      {payload.map((entry, index) => (
        <Box
          key={`item-${index}`}
          sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
        >
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: 1,
              backgroundColor: colors ? colors[entry.value] : entry.color,
            }}
          />
          <Typography variant="caption" sx={{ fontWeight: 500 }}>
            {entry.value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

const PerformanceLineChart = ({
  title,
  data,
  scoreDataKey,
  puttsDataKey,
  scoreColor,
  puttsColor,
}) => (
  <ChartCard
    title={title}
    subtitle="Average score and putts over time"
    icon={<ShowChart />}
  >
    <ResponsiveContainer width="100%" height={280}>
      <LineChart
        data={data}
        margin={{ top: 10, right: 10, left: -20, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: "12px" }} />
        <YAxis
          stroke="#6b7280"
          style={{ fontSize: "12px" }}
          allowDecimals={false}
          interval={0}
          domain={["dataMin - 1", "dataMax"]}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
        <Line
          type="monotone"
          dataKey={scoreDataKey}
          stroke={scoreColor}
          strokeWidth={3}
          dot={{ fill: scoreColor, r: 4 }}
          activeDot={{ r: 6 }}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey={puttsDataKey}
          stroke={puttsColor}
          strokeWidth={3}
          dot={{ fill: puttsColor, r: 4 }}
          activeDot={{ r: 6 }}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  </ChartCard>
);

export default PerformanceLineChart;
