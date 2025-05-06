import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Container, 
  useMediaQuery, 
  Drawer, 
  List, 
  ListItem, 
  Divider,
  useTheme,
  Fab,
  Zoom
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import GitHubIcon from '@mui/icons-material/GitHub';
import { motion, AnimatePresence } from 'framer-motion';
import { GlobalStyles } from '@mui/material';
import api from '../api/axios';

const NavLink = ({ to, label, active, onClick, isSection }) => {
  return (
    <Button
      component={isSection ? 'button' : Link}
      to={!isSection ? to : undefined}
      onClick={onClick}
      sx={{ 
        color: '#fff',
        fontWeight: 500,
        position: 'relative',
        px: 2,
        py: 1.5,
        mx: 0.5,
        textTransform: 'none',
        fontSize: '0.95rem',
        letterSpacing: 0.5,
        overflow: 'hidden',
        '&:hover': {
          bgcolor: 'transparent',
        }
      }}
    >
      {label}
      <Box 
        component={motion.div}
        sx={{
          position: 'absolute',
          bottom: 6,
          left: '50%',
          height: 2,
          width: active ? '60%' : 0,
          bgcolor: active ? '#4CC9F0' : 'rgba(255,255,255,0.3)',
          transform: 'translateX(-50%)'
        }}
        initial={false}
        animate={{ width: active ? '60%' : 0 }}
        transition={{ duration: 0.3 }}
      />
    </Button>
  );
};

const SocialIcon = ({ icon, link }) => {
  return (
    <motion.div whileHover={{ y: -3, scale: 1.1 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
      <IconButton 
        component="a" 
        href={link} 
        target="_blank" 
        rel="noopener noreferrer"
        sx={{ 
          color: 'rgba(255,255,255,0.8)',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
          }
        }}
      >
        {icon}
      </IconButton>
    </motion.div>
  );
};

export const PortfolioLayout = () => {
  const location = useLocation();
  const { username } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [portfolioError, setPortfolioError] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:768px)');
  const isTablet = useMediaQuery('(max-width:1024px)');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('Hero');

  useEffect(() => {
    if (!username) return;
  
    const fetchData = async () => {
      setPortfolioError(null);
      try {
        const res = await api.get(`/${username}/portfolio`);
        setPortfolio(res.data.portfolio);
      } catch (err) {
        setPortfolioError('Failed to load portfolio');
        console.error("Portfolio error:", err);
      }
    };
  
    fetchData();
  }, [username]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
      
      const sections = ['Hero', 'About', 'Work', 'Contact'];
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section) {
          const rect = section.getBoundingClientRect();
          // If the section is in view or we've scrolled past it
          if (rect.top <= window.innerHeight / 2) {
            setActiveSection(sections[i]);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


const scrollToSection = (sectionId) => {
  const section = document.getElementById(sectionId);
  
  // If we're not on the home page, navigate to home first
  if (location.pathname !== `/${username}` && location.pathname !== `/${username}/`) {
    navigate(`/${username}`);
    
    setTargetSection(sectionId);
    
    if (mobileOpen) handleDrawerToggle();
    return;
  }
  
  // If we're already on the home page, just scroll
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
    setActiveSection(sectionId);
    
    if (mobileOpen) handleDrawerToggle();
  }
};


const [targetSection, setTargetSection] = useState(null);

useEffect(() => {

  if (targetSection && (location.pathname === `/${username}` || location.pathname === `/${username}/`)) {

    const timer = setTimeout(() => {
      const section = document.getElementById(targetSection);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
        setActiveSection(targetSection);
      }

      setTargetSection(null);
    }, 300);
    
    return () => clearTimeout(timer);
  }
}, [location.pathname, targetSection, username]);


  const navItems = [
    { label: 'Home', id: 'Hero', isSection: true },
    { label: 'About', id: 'About', isSection: true },
    { label: 'Work', path: `/${username}/projects`, isSection: false },
    { label: 'Contact', id: 'Contact', isSection: true },
  ];

  const socials = portfolio?.owner?.socials ? JSON.parse(portfolio.owner.socials) : {};

  const socialIcons = [
    { icon: <TwitterIcon fontSize="medium" />, link: socials.twitter },
    { icon: <LinkedInIcon fontSize="medium" />, link: socials.linkedin },
    { icon: <GitHubIcon fontSize="medium" />, link: socials.github },
    { icon: <InstagramIcon fontSize="medium" />, link: socials.instagram  }
  ];

  const drawer = (
    <Box sx={{ 
      height: '100%',
      background: 'linear-gradient(135deg, #040B14 0%, #0A1629 100%)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '240px',
        background: 'radial-gradient(circle at top right, rgba(33, 150, 243, 0.12), transparent 70%)',
        zIndex: 0,
        pointerEvents: 'none'
      }
    }}>
      <GlobalStyles styles={{
        '*::-webkit-scrollbar': {
          display: 'none',
        },
        '*': {
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        },
        html: {
          overflow: 'auto',
        },
        body: {
          overflow: 'auto',
          scrollBehavior: 'smooth',
        }
      }} />
      
      <Box sx={{ 
        position: 'relative',
        zIndex: 1,
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        p: 4,
        pb: 5,
        mt: 4,
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '40%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)'
        }
      }}>
        <Typography 
          variant="h6" 
          component={Link} 
          sx={{ 
            color: '#fff', 
            textDecoration: 'none',
            fontWeight: 700,
            letterSpacing: '.25rem',
            fontSize: '1.5rem',
            textShadow: '0 0 20px rgba(33, 150, 243, 0.3)',
            mb: 1.5
          }}
          onClick={handleDrawerToggle}
        >
          NAVIGATION
        </Typography>
        
        <Box sx={{
          width: '40px',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #2196f3, transparent)',
          mb: 1
        }} />
      </Box>
      
      <List sx={{ 
        flexGrow: 1, 
        px: 3,
        py: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.75,
        position: 'relative',
        zIndex: 1
      }}>
        {navItems.map((item) => {
          const isActive = item.isSection 
            ? activeSection === item.id && location.pathname === `/${username}`
            : location.pathname === item.path;
            
          return (
            <ListItem key={item.label} disablePadding>
              {item.isSection ? (
                <Button 
                  onClick={() => scrollToSection(item.id)}
                  fullWidth
                  sx={{
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                    fontSize: '1.5rem',
                    justifyContent: 'center',
                    py: 1.8,
                    px: 1,
                    fontWeight: isActive ? 500 : 400,
                    letterSpacing: '0.05rem',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    borderRadius: '10px',
                    backdropFilter: isActive ? 'blur(8px)' : 'none',
                    background: isActive 
                    ? 'rgba(255, 255, 255, 0.15)'
                    : 'transparent',
                    overflow: 'hidden',
                    '&:hover': { 
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                      backdropFilter: 'blur(4px)'
                    },
                    '&::before': isActive ? {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      height: '60%',
                      width: '3px',
                      borderRadius: '0 4px 4px 0',
                      background: 'rgba(255, 255, 255, 0.8)'
                    } : {}
                  }}
                >
                  {item.label}
                </Button>
              ) : (
                <Button 
                  component={Link} 
                  to={item.path}
                  fullWidth
                  onClick={handleDrawerToggle}
                  sx={{
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                    fontSize: '1.5rem',
                    justifyContent: 'center',
                    py: 1.8,
                    px: 1,
                    fontWeight: isActive ? 500 : 400,
                    letterSpacing: '0.05rem',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    borderRadius: '10px',
                    backdropFilter: isActive ? 'blur(8px)' : 'none',
                    background: isActive 
                    ? 'rgba(255, 255, 255, 0.15)'
                    : 'transparent',
                    overflow: 'hidden',
                    '&:hover': { 
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                      backdropFilter: 'blur(4px)'
                    },
                    '&::before': isActive ? {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      height: '60%',
                      width: '3px',
                      borderRadius: '0 4px 4px 0',
                      background: 'rgba(255, 255, 255, 0.8)'
                    } : {}
                  }}
                >
                  {item.label}
                </Button>
              )}
            </ListItem>
          );
        })}
      </List>
      
      <Box sx={{ 
        p: 4,
        width: '100%', 
        textAlign: 'center',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '40%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)'
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(33, 150, 243, 0.08), transparent 70%)',
          zIndex: 0,
          pointerEvents: 'none'
        }
      }}>
        <Typography variant="body1" sx={{ 
          fontWeight: 600, 
          color: 'white',
          fontSize: '0.85rem',
          letterSpacing: '0.2rem',
          opacity: 0.9,
          mb: 3,
          position: 'relative'
        }}>
          SOCIALS
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 3.5,
          position: 'relative',
          zIndex: 1,
          '& > *': {
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            filter: 'drop-shadow(0 0 0 rgba(33, 150, 243, 0))',
            opacity: 0.8,
            '&:hover': {
              transform: 'translateY(-5px) scale(1.1)',
              opacity: 1,
              filter: 'drop-shadow(0 4px 6px rgba(33, 150, 243, 0.3))'
            }
          }
        }}>
          {socialIcons.map((social, index) => (
            <SocialIcon key={index} icon={social.icon} link={social.link} />
          ))}
        </Box>
      </Box>
    </Box>
  );

  const floatingMenuButton = (
    <Zoom in={isScrolled || isTablet}>
      <Fab
        aria-label={mobileOpen ? "close menu" : "open menu"}
        onClick={handleDrawerToggle}
        sx={{
          position: 'fixed',
          right: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
          top: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
          zIndex: 1400,
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          color: mobileOpen ? '#2196f3' : '#081b33',
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 1)',
          },
          backdropFilter: 'blur(10px)',
          boxShadow: mobileOpen
            ? '0 8px 20px rgba(33, 150, 243, 0.25), 0 0 0 1px rgba(33, 150, 243, 0.1)'
            : '0 8px 16px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          width: { xs: 54, sm: 60, md: 64 },
          height: { xs: 54, sm: 60, md: 64 },
          minHeight: 'unset',
          transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: mobileOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          '&:active': {
            transform: mobileOpen ? 'rotate(180deg) scale(0.96)' : 'rotate(0deg) scale(0.96)',
          },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: mobileOpen 
              ? 'radial-gradient(circle at center, rgba(33, 150, 243, 0.12), transparent 70%)'
              : 'radial-gradient(circle at center, rgba(255, 255, 255, 0.7), transparent 70%)',
            opacity: 0.8,
            zIndex: -1
          }
        }}
      >
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={mobileOpen ? 'close' : 'menu'}
          initial={{ opacity: 0, rotate: mobileOpen ? -90 : 90 }}
          animate={{ opacity: 1, rotate: 0 }}
          exit={{ opacity: 0, rotate: mobileOpen ? 90 : -90 }}
          transition={{ 
            duration: 0.30,
            type: "spring", 
            stiffness: 600,
            damping: 30
          }}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
          }}
        >
          {mobileOpen ? 
            <CloseIcon sx={{ fontSize: { xs: 22, sm: 24 }, color: 'inherit' }} /> :
            <MenuIcon sx={{ fontSize: { xs: 22, sm: 24 }, color: 'inherit' }} />
          }
        </motion.div>
      </AnimatePresence>
      </Fab>
    </Zoom>
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh', 
      width: '100%',
      overflow: 'hidden',
      bgcolor: '#080810', 
      color: '#fff',
      background: 'linear-gradient(to bottom, #080810 0%, #0a0a14 100%)'
    }}>
      {/* Floating circular menu button that shows when scrolled or on tablet/mobile */}
      {floatingMenuButton}
      
      {/* Main navbar that disappears when scrolled or on tablet/mobile */}
      <AppBar 
        position="fixed" 
        elevation={0}
        color="transparent"
        sx={{ 
          borderBottom: 'none',
          transition: 'all 0.4s ease',
          transform: (isScrolled || isTablet) ? 'translateY(-100%)' : 'translateY(0)',
          visibility: (isScrolled || isTablet) ? 'hidden' : 'visible',
          display: { xs: 'none', md: isTablet ? 'none' : 'block' },
          zIndex: 1200,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar 
            sx={{ 
              justifyContent: 'flex-end', 
              height: 70, 
              transition: 'height 0.3s ease' 
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box>
                {navItems.map((item) => {
                  const isActive = item.isSection 
                    ? activeSection === item.id && location.pathname === `/${username}`
                    : location.pathname === item.path;
                  
                  return (
                    <NavLink 
                      key={item.label}
                      to={item.isSection ? null : item.path}
                      label={item.label}
                      active={isActive}
                      isSection={item.isSection}
                      onClick={item.isSection ? () => scrollToSection(item.id) : null}
                    />
                  );
                })}
              </Box>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      
      <Box component="nav">
        <Drawer
          variant="temporary"
          anchor="right"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: { xs: '100%', sm: '85%', md: 450 },
              maxWidth: '100vw'
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          width: '100%',
          px: 0,
          mx: 0,
          overflowX: 'hidden',
          position: 'relative'
        }}
      >
        <Outlet />
      </Box>
  
    </Box>
  );
};