import React from 'react';
import { Box, Typography, Paper, Tooltip, useTheme, alpha } from '@mui/material';
import { 
  GolfCourse, 
  Whatshot, 
  Timeline, 
  BarChart,
  AutoGraph,
  Psychology
} from '@mui/icons-material';
import StreakBox from './StreakBox';

const StatCard = ({ label, value, tooltip, icon: Icon, color = 'primary', glow = false }) => {
  const theme = useTheme();
  
  const colorMap = {
    // primary: theme.palette.primary.main,
    // secondary: theme.palette.secondary.main,
    // success: theme.palette.success.main,
    // warning: theme.palette.warning.main,
    // info: theme.palette.info.main,
    // error: theme.palette.error.main,
    primary: '#0077C8',     // Garmin's electric blue
    secondary: '#00A862',   // Bright sports green
    success: '#34C759',     // Apple-style success green
    warning: '#FF9500',     // Garmin orange
    info: '#5AC8FA',        // Light info blue
    error: '#FF3B30',       // Alert red
    performance: '#5856D6', // Performance purple
    endurance: '#FF2D55',   // Endurance pink/red
    
  };

  const mainColor = colorMap[color] || colorMap.primary;

  return (
    <Tooltip title={tooltip || ''} arrow placement="top">
      <Paper 
        elevation={0}
        sx={{ 
          p: 2.5, 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'space-between',
          // Dark glass morphism (Apple Watch style)
          background: `linear-gradient(145deg, 
            ${alpha(mainColor, 0.7)} 0%, 
            ${alpha('#121212', 0.8)} 100%
          )`,
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          border: `1px solid ${alpha(mainColor, 0.15)}`,
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            borderColor: alpha(mainColor, 0.4),
            boxShadow: glow 
              ? `0 10px 40px ${alpha(mainColor, 0.3)}` 
              : '0 20px 40px rgba(0, 0, 0, 0.3)',
          },
          '&::before': glow ? {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${mainColor}, transparent)`,
            animation: 'pulse 3s infinite',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 0.5 },
              '50%': { opacity: 1 }
            }
          } : {}
        }}
      >
        {/* Decorative corner accent */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 40,
            height: 40,
            borderTopRightRadius: 3,
            borderBottomLeftRadius: 40,
            backgroundColor: alpha(mainColor, 0.1),
            zIndex: 0,
          }}
        />

        {/* Header with icon */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, position: 'relative', zIndex: 1 }}>
          {Icon && (
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: '#ffffffb2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 1.5,
                flexShrink: 0, // Prevent the circle from shrinking and distorting
                border: `1px solid ${alpha(mainColor, 0.2)}`,
              }}
            >
              <Icon sx={{ fontSize: 18, color: mainColor }} />
            </Box>
          )}
          <Typography 
            sx={{ 
              fontSize: '0.7rem',
              letterSpacing: '1px',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: alpha(theme.palette.common.white, 0.7),
            }}
          >
            {label}
          </Typography>
        </Box>

        {/* Value display */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {typeof value === 'string' || typeof value === 'number' ? (
            <Typography 
              variant="h4"
              sx={{ 
                fontWeight: 700,
                fontSize: '2rem',
                color: theme.palette.common.white,
                textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                lineHeight: 1,
                mb: 0.5,
              }}
            >
              {value ?? '–'}
            </Typography>
          ) : (
            <Box sx={{ mt: 1 }}>
              {value}
            </Box>
          )}

          {/* Subtle accent line */}
          <Box
            sx={{
              width: 24,
              height: 2,
              backgroundColor: alpha(mainColor, 0.5),
              borderRadius: 1,
              mt: 1.5,
            }}
          />
        </Box>
      </Paper>
    </Tooltip>
  );
};

const AllTimeStats = ({ cumulativeStats, szirStreak, szParStreak }) => {
  const theme = useTheme();

  return (
    <Box>
      {/* Section header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography
          variant="h6"
          sx={{

            fontWeight: 600,
            letterSpacing: '0.5px',
          }}
        >
          All Time Stats
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { 
          xs: 'repeat(2, 1fr)', 
          sm: 'repeat(3, 1fr)',
          md: 'repeat(5, 1fr)' 
        }, 
        gap: 2,
        position: 'relative',
        zIndex: 1 
      }}>
        <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 1' } }}>
          <StatCard 
            label="SZIR Streak"
            value={<StreakBox streak={szirStreak} type="szir" />}
            tooltip="Consecutive holes with Scoring Zone In Regulation"
            icon={Whatshot}
            color="warning"
            glow={szirStreak > 5}
          />
        </Box>
        
        <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 1' } }}>
          <StatCard 
            label="SZ Par Streak"
            value={<StreakBox streak={szParStreak} type="szpar" />}
            tooltip="Consecutive SZIR holes with Par or better"
            icon={Whatshot}
            color="success"
            glow={szParStreak > 3}
          />
        </Box>
        
        <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 1' } }}>
          <StatCard
            label="Total Rounds"
            value={cumulativeStats?.total_rounds_played}
            tooltip="All rounds played"
            icon={BarChart}
            color="info"
          />
        </Box>
        
        <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 1' } }}>
          <StatCard
            label="Eligible Rounds"
            value={cumulativeStats?.eligible_rounds_count}
            tooltip="Rounds counted for statistics"
            icon={BarChart}
            color="secondary"
          />
        </Box>
        
        <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 1', md: 'span 1' } }}>
          <StatCard
            label="Holes Played"
            value={cumulativeStats?.total_holes_played}
            tooltip="Total holes completed"
            icon={GolfCourse}
            color="primary"
          />
        </Box>
      </Box>

    </Box>
  );
};

export default AllTimeStats;