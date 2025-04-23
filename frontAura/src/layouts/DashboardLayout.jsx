import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  IconButton,
  Typography,
  Avatar,
  Divider,
  Box,
  styled,
  Badge,
  Tooltip,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Button,
  alpha,
  Fade
} from '@mui/material';

import {
  Menu as MenuIcon,
  ChevronLeft,
  Dashboard as DashboardIcon,
  Code,
  Work,
  Stars,
  Mail,
  Settings,
  Notifications,
  AccountCircle,
  Help,
  GitHub,
  LinkedIn,
  Twitter,
  Brightness4,
  Brightness7,
  Logout as LogoutIcon
} from '@mui/icons-material';

const DRAWER_WIDTH = 260;

// Styled components
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${DRAWER_WIDTH}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const AppBarStyled = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  boxShadow: 'rgba(0, 0, 0, 0.05) 0px 1px 2px 0px',
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${DRAWER_WIDTH}px)`,
    marginLeft: `${DRAWER_WIDTH}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
  backdropFilter: 'blur(8px)',
  backgroundColor: alpha(theme.palette.background.default, 0.9),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'space-between',
}));

const LogoWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 2),
  gap: theme.spacing(1),
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

const GradientAvatar = styled(Avatar)(({ theme, size = 40 }) => ({
  width: size,
  height: size,
  border: '2px solid transparent',
  backgroundClip: 'padding-box',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    background: 'linear-gradient(45deg, #3a7bd5 0%, #00d2ff 100%)',
    borderRadius: '50%',
    zIndex: -1,
  },
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 0 15px rgba(0, 210, 255, 0.3)',
  }
}));

const StyledListItemButton = styled(ListItemButton)(({ theme, selected }) => ({
  margin: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  transition: 'all 0.3s ease-in-out',
  padding: theme.spacing(1, 2),
  ...(selected && {
    backgroundColor: alpha(theme.palette.primary.main, 0.15),
    color: theme.palette.primary.main,
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
    boxShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.2)}`,
  }),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.light, 0.1),
    transform: 'translateX(4px)',
  },
}));

const GradientText = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  textFillColor: 'transparent',
  letterSpacing: '0.5px',
}));

const GradientButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 3,
  textTransform: 'none',
  background: alpha(theme.palette.primary.main, 0.05),
  borderColor: alpha(theme.palette.primary.main, 0.2),
  fontWeight: 500,
  padding: theme.spacing(1, 2),
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: alpha(theme.palette.primary.main, 0.5),
    background: alpha(theme.palette.primary.main, 0.1),
    transform: 'translateY(-2px)',
    boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.2)}`,
  }
}));

// Navigation items for the sidebar
const navItems = [
  { path: '/dashboard', name: 'Overview', icon: <DashboardIcon /> },
  { path: '/dashboard/projects', name: 'Projects', icon: <Code /> },
  { path: '/dashboard/skills', name: 'Skills', icon: <Work /> },
  { path: '/dashboard/achievements', name: 'Achievements', icon: <Stars /> },
  { path: '/dashboard/messages', name: 'Messages', icon: <Mail /> },
];

/**
 * Displays user information in the sidebar
 */
const UserProfile = ({ user, isCollapsed, navigate }) => {
  const theme = useTheme();
  
  // Collapsed version (mobile view or when sidebar is minimized)
  if (isCollapsed) {
    return (
      <Box sx={{ py: 2, display: 'flex', justifyContent: 'center' }}>
        <Tooltip title={user?.name || "User"} placement="right">
          <StyledBadge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
          >
            <GradientAvatar 
              alt={user?.name} 
              src={user?.photo} 
              size={40}
            />
          </StyledBadge>
        </Tooltip>
      </Box>
    );
  }
  
  // Expanded version with full user profile
  return (
    <Box sx={{ px: 2, py: 3 }}>
      <Fade in={true} timeout={500}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          mb: 1 
        }}>
          <StyledBadge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
          >
            <GradientAvatar 
              alt={user?.name} 
              src={user?.photo} 
              size={80}
              sx={{ mb: 1 }}
            />
          </StyledBadge>
          <Typography variant="h6" sx={{ mt: 1.5, fontWeight: 600 }}>
            {user?.name || "User Name"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {user?.job || "Job Title"}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
            <Tooltip title="Github">
              <IconButton 
                size="small" 
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': { color: '#333', transform: 'scale(1.1)' },
                  transition: 'all 0.2s ease'
                }}
              >
                <GitHub fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="LinkedIn">
              <IconButton 
                size="small" 
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': { color: '#0077B5', transform: 'scale(1.1)' },
                  transition: 'all 0.2s ease'
                }}
              >
                <LinkedIn fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Twitter">
              <IconButton 
                size="small" 
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': { color: '#1DA1F2', transform: 'scale(1.1)' },
                  transition: 'all 0.2s ease'
                }}
              >
                <Twitter fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Fade>

      <Box sx={{ mt: 2 }}>
        <GradientButton 
          variant="outlined" 
          fullWidth 
          onClick={() => navigate('/dashboard/profile')}
        >
          View Profile
        </GradientButton>
      </Box>
    </Box>
  );
};

/**
 * Displays the main navigation links in the sidebar
 */
const NavigationMenu = ({ location }) => (
  <Box sx={{ p: 2 }}>
    <Typography 
      variant="overline" 
      color="text.secondary" 
      sx={{ px: 1, fontWeight: 600, letterSpacing: '1px' }}
    >
      Main Menu
    </Typography>
    <List>
      {navItems.map((item) => {
        const isSelected = location.pathname === item.path;
        return (
          <ListItem 
            key={item.path} 
            disablePadding
            component={Link}
            to={item.path}
            sx={{ display: 'block', mb: 0.5 }}
          >
            <StyledListItemButton selected={isSelected}>
              <ListItemIcon sx={{ minWidth: 40, color: isSelected ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.name} 
                primaryTypographyProps={{ fontWeight: isSelected ? 600 : 400 }}
              />
              {item.badge && (
                <Badge badgeContent={item.badge} color="primary" sx={{ ml: 1 }} />
              )}
            </StyledListItemButton>
          </ListItem>
        );
      })}
    </List>
  </Box>
);

/**
 * Displays the dropdown menu when clicking on the user avatar in the top bar
 */
const UserMenu = ({ anchorEl, handleMenuClose, user, logout }) => (
  <Menu
    anchorEl={anchorEl}
    open={Boolean(anchorEl)}
    onClose={handleMenuClose}
    sx={{ mt: 1.5 }}
    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    PaperProps={{
      elevation: 3,
      sx: {
        minWidth: 200,
        overflow: 'visible',
        borderRadius: 2,
        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.08))',
        '&:before': {
          content: '""',
          display: 'block',
          position: 'absolute',
          top: 0,
          right: 14,
          width: 10,
          height: 10,
          bgcolor: 'background.paper',
          transform: 'translateY(-50%) rotate(45deg)',
          zIndex: 0,
        },
      },
    }}
  >
    <Box sx={{ px: 2, py: 1.5 }}>
      <Typography variant="subtitle1" fontWeight={600}>{user?.name || "User Name"}</Typography>
      <Typography variant="body2" color="text.secondary">{user?.email || "user@example.com"}</Typography>
    </Box>
    <Divider />
    <MenuItem onClick={handleMenuClose} sx={{ py: 1.5 }}>
      <ListItemIcon>
        <AccountCircle fontSize="small" />
      </ListItemIcon>
      Profile
    </MenuItem>
    <MenuItem onClick={handleMenuClose} sx={{ py: 1.5 }}>
      <ListItemIcon>
        <Settings fontSize="small" />
      </ListItemIcon>
      Account Settings
    </MenuItem>
    <Divider />
    <MenuItem onClick={logout} sx={{ py: 1.5 }}>
      <ListItemIcon>
        <LogoutIcon fontSize="small" color="error" />
      </ListItemIcon>
      <Typography color="error">Logout</Typography>
    </MenuItem>
  </Menu>
);

/**
 * This is the main component that renders the entire dashboard layout
 */
export const DashboardLayout = () => {
  // State management
  const [open, setOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  
  // Hooks
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Handle responsive behavior - close drawer on mobile by default
  useEffect(() => {
    if (isMobile) {
      setOpen(false);
      setIsCollapsed(true);
    } else {
      setIsCollapsed(false);
    }
  }, [isMobile]);

  // Close drawer when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Event handlers
  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);
  
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // To be added later
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* App Bar (Top Navigation) */}
      <AppBarStyled position="fixed" open={open} color="default">
        <Toolbar>
          {/* Menu Icon - only shows when drawer is closed */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ 
              mr: 2, 
              ...(open && { display: 'none' }),
              '&:hover': { transform: 'scale(1.1)' },
              transition: 'all 0.2s ease'
            }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Dashboard Title */}
          <GradientText 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              display: { xs: 'none', sm: 'block' } 
            }}
          >
            Aura Dashboard
          </GradientText>
          
          {/* Toolbar Icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Theme Toggle */}
            <Tooltip title="Toggle theme">
              <IconButton 
                onClick={toggleDarkMode} 
                color="inherit"
                sx={{ 
                  '&:hover': { transform: 'rotate(30deg)' },
                  transition: 'all 0.3s ease'
                }}
              >
                {darkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Tooltip>
            
            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton 
                color="inherit"
                sx={{ 
                  '&:hover': { transform: 'scale(1.1)' },
                  transition: 'all 0.2s ease'
                }}
              >
                <Badge badgeContent={4} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>
            
            {/* Help */}
            <Tooltip title="Help">
              <IconButton 
                color="inherit"
                sx={{ 
                  '&:hover': { transform: 'scale(1.1)' },
                  transition: 'all 0.2s ease'
                }}
              >
                <Help />
              </IconButton>
            </Tooltip>
            
            {/* User Avatar */}
            <Tooltip title="Account">
              <IconButton
                onClick={handleMenuOpen}
                color="inherit"
                sx={{ 
                  ml: 1,
                  '&:hover': { transform: 'scale(1.05)' },
                  transition: 'all 0.2s ease'
                }}
              >
                <StyledBadge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                >
                  <Avatar 
                    alt={user?.name || "User"} 
                    src={user?.photo}
                    sx={{ 
                      width: 38, 
                      height: 38,
                      border: '2px solid rgba(103, 126, 234, 0.5)'
                    }} 
                  />
                </StyledBadge>
              </IconButton>
            </Tooltip>
            
            {/* User Menu Dropdown */}
            <UserMenu 
              anchorEl={anchorEl}
              handleMenuClose={handleMenuClose}
              user={user}
              logout={logout}
            />
          </Box>
        </Toolbar>
      </AppBarStyled>

      {/* Sidebar Drawer */}
      <Drawer
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            boxShadow: 'rgba(0, 0, 0, 0.05) 0px 1px 2px 0px',
            border: 'none',
            borderRadius: open ? 0 : 0,
            overflow: 'hidden',
          },
        }}
        variant={isMobile ? "temporary" : "persistent"}
        anchor="left"
        open={open}
        onClose={handleDrawerClose}
      >
        {/* Drawer Header with Logo */}
        <DrawerHeader>
          <LogoWrapper>
            <Avatar 
              sx={{ 
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                width: 40,
                height: 40,
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              A
            </Avatar>
            <Typography variant="h6" fontWeight={700}>
              Aura
            </Typography>
          </LogoWrapper>
          <IconButton 
            onClick={handleDrawerClose}
            sx={{ 
              '&:hover': { transform: 'scale(1.1) rotate(180deg)' },
              transition: 'all 0.3s ease'
            }}
          >
            <ChevronLeft />
          </IconButton>
        </DrawerHeader>
        
        <Divider />
        
        {/* User Profile Section */}
        <UserProfile 
          user={user} 
          isCollapsed={isCollapsed} 
          navigate={navigate}
        />

        <Divider sx={{ mx: 2 }} />
        
        {/* Navigation Menu */}
        <NavigationMenu location={location} />
        
        {/* Logout Button */}
        <Box sx={{ mt: 'auto', p: 2 }}>
          <Divider sx={{ mb: 2 }} />
          <Button
            variant="contained"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={logout}
            fullWidth
            sx={{ 
              borderRadius: '8px',
              textTransform: 'none',
              py: 1.2,
              background: 'linear-gradient(45deg, #FF5370 30%, #ff8f9e 90%)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 5px 15px rgba(255, 83, 112, 0.4)',
              }
            }}
          >
            Logout
          </Button>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Main open={open}>
        <DrawerHeader />
          <Outlet />
      </Main>
    </Box>
  );
};