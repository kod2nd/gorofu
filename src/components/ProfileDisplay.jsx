import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Public as PublicIcon,
  Phone as PhoneIcon,
  Cake as CakeIcon,
  SportsGolf as SportsGolfIcon,
} from '@mui/icons-material';

const InfoCard = ({ icon, label, value, color = 'primary.main' }) => (
  <Card sx={{
    height: '100%',
    position: 'relative',
    overflow: 'visible',
    minHeight: { xs: 140, sm: 160 },
    display: 'flex',
    flexDirection: 'column',
  }}>
    <CardContent sx={{
      pb: 2,
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          left: 16,
          width: 48,
          height: 48,
          borderRadius: 2,
          background: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          boxShadow: 2,
          zIndex: 1,
        }}
      >
        {React.cloneElement(icon, { sx: { fontSize: 28 } })}
      </Box>
      <Box sx={{
        mt: 2,
        pt: 1,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            lineHeight: 1.2,
          }}
        >
          {label}
        </Typography>
        <Typography
          variant="h6"
          sx={{
            mt: 1,
            wordBreak: 'break-word',
            fontSize: { xs: '1rem', sm: '1.1rem' },
            flex: 1,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {value || 'Not set'}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

const ProfileDisplay = ({ userProfile }) => {
  return (
    <>
      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 4, px: 1 }}>
        Personal Information
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3, // Consistent gap
          '& > *': {
            // Responsive width calculation
            flexBasis: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)' },
          }
        }}
      >
          <InfoCard
            icon={<PersonIcon />}
            label="Display Name"
            value={userProfile.full_name}
            color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          />
          <InfoCard
            icon={<EmailIcon />}
            label="Email"
            value={userProfile.email}
            color="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
          />
          <InfoCard
            icon={<PublicIcon />}
            label="Country"
            value={userProfile.country}
            color="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
          />
          <InfoCard
            icon={<SportsGolfIcon />}
            label="Handicap"
            value={userProfile.handicap != null ? Number(userProfile.handicap).toFixed(1) : null}
            color="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
          />
          <InfoCard
            icon={<PhoneIcon />}
            label="Phone"
            value={userProfile.phone}
            color="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
          />
          <InfoCard
            icon={<CakeIcon />}
            label="Date of Birth"
            value={
              userProfile.date_of_birth
                ? new Date(userProfile.date_of_birth).toLocaleDateString()
                : null
            }
            color="linear-gradient(135deg, #30cfd0 0%, #330867 100%)"
          />
      </Box>
    </>
  );
};

export default ProfileDisplay;