import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  TextField, Button, Paper, Typography, Box, InputAdornment,
  IconButton, CircularProgress, Divider, Checkbox,
  FormControlLabel, useTheme,
  alpha, Avatar
} from '@mui/material';
import { 
  Visibility, VisibilityOff, LoginOutlined, 
  Google, GitHub, Twitter, ArrowForward, LockOutlined
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

// Enhanced styled components with animation properties
const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: 'white',
  textTransform: 'none',
  padding: '14px 28px',
  fontSize: '1rem',
  fontWeight: 600,
  borderRadius: '12px',
  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  boxShadow: `0 10px 15px -3px ${alpha(theme.palette.primary.main, 0.15)}, 0 4px 6px -2px ${alpha(theme.palette.primary.main, 0.05)}`,
  '&:hover': {
    boxShadow: `0 20px 25px -5px ${alpha(theme.palette.primary.main, 0.2)}, 0 10px 10px -5px ${alpha(theme.palette.primary.main, 0.1)}`,
    transform: 'translateY(-2px) scale(1.01)',
    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
  },
  '&:active': {
    transform: 'translateY(0) scale(0.98)',
  }
}));

const SocialButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  borderRadius: '12px',
  padding: '12px',
  flex: 1,
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.mode === 'light' ? '#f8fafc' : alpha(theme.palette.background.paper, 0.8),
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  fontWeight: 500,
  '&:hover': {
    backgroundColor: theme.palette.mode === 'light' ? '#f1f5f9' : alpha(theme.palette.action.hover, 0.8),
    transform: 'translateY(-3px)',
    boxShadow: theme.palette.mode === 'light' 
      ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      : `0 10px 15px -3px ${alpha(theme.palette.common.black, 0.2)}, 0 4px 6px -2px ${alpha(theme.palette.common.black, 0.1)}`,
  },
  '&:active': {
    transform: 'translateY(-1px)',
  }
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
  margin: '28px 0',
  '&::before, &::after': {
    borderColor: alpha(theme.palette.divider, 0.8),
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    transition: 'all 0.2s ease',
    backgroundColor: theme.palette.mode === 'light' ? alpha(theme.palette.common.white, 0.8) : alpha(theme.palette.background.paper, 0.8),
    '&:hover': {
      boxShadow: `0 4px 8px -2px ${alpha(theme.palette.primary.main, 0.1)}`,
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
      borderWidth: '1.5px',
    },
    '&.Mui-focused': {
      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderWidth: '2px',
    },
    '& .MuiInputBase-input': {
      padding: '16px 14px',
    }
  },
  '& .MuiFormLabel-root': {
    fontSize: '0.95rem',
    transform: 'translate(14px, 16px) scale(1)',
    '&.MuiInputLabel-shrink': {
      transform: 'translate(14px, -6px) scale(0.75)',
    }
  }
}));

const BrandAvatar = styled(Avatar)(({ theme }) => ({
  width: 56,
  height: 56,
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  boxShadow: `0 8px 16px -4px ${alpha(theme.palette.primary.main, 0.25)}`,
  marginBottom: theme.spacing(2),
}));

// Animated container for login form elements
const MotionBox = motion.create(Box);

// Background illustrations for the left panel (SVG paths)
const BackgroundPattern = () => (
  <svg
    className="absolute inset-0 w-full h-full opacity-10"
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
  >
    <defs>
      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fff" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#fff" stopOpacity="0.1" />
      </linearGradient>
    </defs>
    <path
      fill="url(#gradient)"
      d="M0,0 C30,20 70,20 100,0 L100,100 L0,100 Z"
    />
    <circle cx="20" cy="50" r="20" fill="white" fillOpacity="0.05" />
    <circle cx="70" cy="20" r="10" fill="white" fillOpacity="0.05" />
    <circle cx="80" cy="70" r="15" fill="white" fillOpacity="0.05" />
  </svg>
);

// Enhanced feature cards for the left panel
const FeatureCard = ({ icon, title, description }) => {
  const theme = useTheme();
  
  return (
    <Box 
      sx={{
        bgcolor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        p: 3,
        mb: 2,
        border: '1px solid rgba(255, 255, 255, 0.2)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: `0 20px 25px -5px ${alpha(theme.palette.common.black, 0.1)}, 0 10px 10px -5px ${alpha(theme.palette.common.black, 0.04)}`,
          bgcolor: 'rgba(255, 255, 255, 0.15)',
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box 
          sx={{ 
            mr: 2, 
            bgcolor: 'rgba(255, 255, 255, 0.2)', 
            borderRadius: '12px',
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" fontWeight="bold">
          {title}
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ opacity: 0.9 }}>
        {description}
      </Typography>
    </Box>
  );
};

export const Login = () => {
  const theme = useTheme();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 260, 
        damping: 20 
      } 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const result = await login(credentials);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Left Panel - Enhanced Brand Information */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 p-12 flex-col justify-between text-white relative overflow-hidden">
        <BackgroundPattern />
        
        <div className="relative z-10">
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 'bold', 
              mb: 1,
              background: 'linear-gradient(90deg, #fff, #e0e7ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 5px 10px rgba(0,0,0,0.1)'
            }}
          >
            Aura
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              opacity: 0.9, 
              mb: 8,
              fontWeight: 300,
              letterSpacing: '0.5px'
            }}
          >
            The next generation platform for your digital experience
          </Typography>
        </div>
        
        <div className="relative z-10 flex flex-col space-y-6">
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 'bold',
              textShadow: '0 2px 10px rgba(0,0,0,0.15)'
            }}
          >
            Transform your workflow
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              opacity: 0.9, 
              maxWidth: '90%',
              lineHeight: 1.6,
              fontWeight: 300,
              mb: 4
            }}
          >
            Join thousands of users who are already experiencing the power of Aura's innovative features and seamless integration.
          </Typography>
          
          <div className="mt-4 flex flex-col gap-4">
            <FeatureCard 
              icon={<LockOutlined />}
              title="Enterprise Security"
              description="Industry-leading security protocols to keep your data safe and private."
            />
            
            <FeatureCard 
              icon={<LoginOutlined />}
              title="Seamless Integration"
              description="Connect with all your favorite tools and services with just one click."
            />
          </div>
        </div>
        
        <Typography 
          variant="caption" 
          sx={{ 
            opacity: 0.7, 
            mt: 8,
            position: 'relative',
            zIndex: 10
          }}
        >
          © {new Date().getFullYear()} Aura. All rights reserved.
        </Typography>
      </div>
      
      {/* Right Panel - Enhanced Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-white">
        <Paper 
          elevation={0} 
          sx={{
            width: '100%',
            maxWidth: '480px',
            p: { xs: 4, sm: 6 },
            borderRadius: '24px',
            background: theme.palette.mode === 'light' 
              ? 'rgba(255, 255, 255, 0.9)' 
              : alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(20px)',
            boxShadow: theme.palette.mode === 'light'
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.02)'
              : `0 25px 50px -12px ${alpha(theme.palette.common.black, 0.3)}, 0 0 0 1px ${alpha(theme.palette.common.white, 0.05)}`,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Decorative elements */}
          <Box 
            sx={{ 
              position: 'absolute', 
              width: '300px', 
              height: '300px', 
              borderRadius: '50%', 
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.2)}, ${alpha(theme.palette.secondary.light, 0.1)})`,
              top: '-150px',
              right: '-150px',
              zIndex: 0,
              opacity: 0.7
            }} 
          />
          
          <Box 
            sx={{ 
              position: 'absolute', 
              width: '200px', 
              height: '200px', 
              borderRadius: '50%', 
              background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.light, 0.2)}, ${alpha(theme.palette.primary.light, 0.1)})`,
              bottom: '-100px',
              left: '-100px',
              zIndex: 0,
              opacity: 0.5
            }} 
          />
          
          <MotionBox
            className="relative z-10"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <MotionBox 
              className="text-center mb-8"
              variants={itemVariants}
            >
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <BrandAvatar>
                  <LockOutlined />
                </BrandAvatar>
              </Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  color: theme.palette.primary.main,
                  mb: 1
                }}
              >
                Welcome Back
              </Typography>
              <Typography 
                variant="body2" 
                color="textSecondary" 
                sx={{ 
                  mt: 1,
                  opacity: 0.8,
                  maxWidth: '80%',
                  mx: 'auto'
                }}
              >
                Please sign in to continue to your dashboard
              </Typography>
            </MotionBox>
            
            {/* Social Login Buttons */}
            <MotionBox 
              className="flex flex-col sm:flex-row gap-3 mb-6"
              variants={itemVariants}
            >
              <SocialButton startIcon={<Google />}>
                Google
              </SocialButton>
              <SocialButton startIcon={<GitHub />}>
                GitHub
              </SocialButton>
              <SocialButton startIcon={<Twitter />}>
                Twitter
              </SocialButton>
            </MotionBox>
            
            <MotionBox variants={itemVariants}>
              <StyledDivider>
                <Typography 
                  variant="body2" 
                  color="textSecondary"
                  sx={{ px: 2, fontWeight: 500 }}
                >
                  or continue with email
                </Typography>
              </StyledDivider>
            </MotionBox>
            
            {/* Login Form */}
            <Box component="form" onSubmit={handleSubmit} className="space-y-5 mt-6">
              <MotionBox variants={itemVariants}>
                <StyledTextField
                  fullWidth
                  variant="outlined"
                  label="Email Address"
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  required
                  placeholder="your@email.com"
                  InputProps={{
                    sx: { py: 0.5 }
                  }}
                />
              </MotionBox>
              
              <MotionBox variants={itemVariants}>
                <StyledTextField
                  fullWidth
                  variant="outlined"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  required
                  placeholder="••••••••"
                  InputProps={{
                    sx: { py: 0.5 },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                          size="medium"
                          sx={{ 
                            color: theme.palette.mode === 'light' ? 'text.secondary' : 'text.primary',
                            '&:hover': {
                              background: alpha(theme.palette.primary.main, 0.1)
                            }
                          }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </MotionBox>
              
              {error && (
                <MotionBox variants={itemVariants}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'error.main', 
                      bgcolor: alpha(theme.palette.error.main, 0.1), 
                      py: 1.5, 
                      px: 3, 
                      borderRadius: 2,
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`
                    }}
                  >
                    {error}
                  </Typography>
                </MotionBox>
              )}
              
              <MotionBox 
                className="flex items-center justify-between my-4"
                variants={itemVariants}
              >
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      color="primary"
                      size="small"
                      sx={{
                        '&.Mui-checked': {
                          color: theme.palette.primary.main,
                        },
                      }}
                    />
                  }
                  label={<Typography variant="body2">Remember me</Typography>}
                />
                <Typography 
                  variant="body2" 
                  color="primary" 
                  sx={{ 
                    cursor: 'pointer', 
                    fontWeight: 'medium',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: theme.palette.primary.dark,
                      textDecoration: 'underline'
                    } 
                  }}
                >
                  Forgot password?
                </Typography>
              </MotionBox>
              
              <MotionBox variants={itemVariants}>
                <GradientButton
                  fullWidth
                  type="submit"
                  disabled={isLoading}
                  endIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <ArrowForward />}
                  disableElevation
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </GradientButton>
              </MotionBox>

              <MotionBox 
                variants={itemVariants}
                sx={{ mt: 4 }}
              >
                <Typography 
                  variant="body2" 
                  align="center" 
                  sx={{ color: 'text.secondary' }}
                >
                  Don't have an account?{' '}
                  <Typography 
                    component={Link}
                    to="/register"
                    variant="body2" 
                    color="primary" 
                    sx={{ 
                      fontWeight: 'bold', 
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        color: theme.palette.primary.dark,
                        textDecoration: 'underline'
                      } 
                    }}
                  >
                    Sign up now
                  </Typography>
                </Typography>
              </MotionBox>
            </Box>
            
            {/* Mobile Footer */}
            <Typography 
              variant="caption" 
              align="center" 
              color="textSecondary" 
              className="md:hidden block mt-8"
              sx={{
                opacity: 0.7,
                position: 'relative',
                zIndex: 10
              }}
            >
              © {new Date().getFullYear()} Aura. All rights reserved.
            </Typography>
          </MotionBox>
        </Paper>
      </div>
    </div>
  );
};