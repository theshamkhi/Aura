import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Container, Grid, Skeleton, useMediaQuery, IconButton, Tooltip } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import EmailIcon from '@mui/icons-material/Email';
import InstagramIcon from '@mui/icons-material/Instagram';
import { motion, AnimatePresence } from 'framer-motion';
import { SmoothMarquee } from './Animation.jsx';

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL + '/storage/';

const Hero = ({ portfolio, loading }) => {
  const isMobile = useMediaQuery('(max-width:768px)');
  const isTablet = useMediaQuery('(max-width:1024px)');
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollDirection, setScrollDirection] = useState('none');
  const [lastScrollPosition, setLastScrollPosition] = useState(0);
  const [hoveredSocial, setHoveredSocial] = useState(null);
  

  const FloatingShapes = () => (
    <>
      <motion.div
        animate={{
          y: [0, -15, 0],
          rotate: [0, 5, 0]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: 'absolute',
          top: '15%',
          right: '10%',
          width: '150px',
          height: '150px',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(99, 102, 241, 0.1) 100%)',
          borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
          filter: 'blur(20px)',
          zIndex: 1
        }}
      />
      <motion.div
        animate={{
          y: [0, 20, 0],
          rotate: [0, -5, 0]
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        style={{
          position: 'absolute',
          bottom: '25%',
          left: '15%',
          width: '100px',
          height: '100px',
          background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
          borderRadius: '50% 50% 50% 70% / 50% 50% 70% 60%',
          filter: 'blur(20px)',
          zIndex: 1
        }}
      />
    </>
  );


  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      
      // Determine if we're scrolling and in which direction
      if (scrollPosition > 50) {
        setIsScrolling(true);
        
        // Detect scroll direction
        if (scrollPosition > lastScrollPosition) {
          setScrollDirection('down');
        } else if (scrollPosition < lastScrollPosition) {
          setScrollDirection('up');
        }
      } else {
        setIsScrolling(false);
        setScrollDirection('none');
      }
      
      setLastScrollPosition(scrollPosition);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollPosition]);

  const heroBackground = loading ? 
    'linear-gradient(rgba(17, 25, 40, 0.95), rgba(17, 25, 40, 0.95))' : 
    `linear-gradient(rgba(17, 25, 40, 0.5), rgba(17, 25, 40, 0.6)), url(${VITE_BASE_URL + portfolio?.image})`;


  const socials = portfolio?.owner?.socials ? JSON.parse(portfolio.owner.socials) : {};

  const socialLinks = [
    { icon: <InstagramIcon />, label: 'Instagram', link: socials.instagram || '#' },
    { icon: <TwitterIcon />, label: 'Twitter', link: socials.twitter || '#' },
    { icon: <GitHubIcon />, label: 'GitHub', link: socials.github || '#' },
    { icon: <LinkedInIcon />, label: 'LinkedIn', link: socials.linkedin || '#' },
    { icon: <EmailIcon />, label: 'Email', link: socials.email ? `mailto:${socials.email}` : 'mailto:theshamkhi1@gmail.com' },
  ];


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const ScrollIndicator = () => (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 1.2,
        duration: 0.6,
        ease: "easeOut"
      }}
      style={{
        position: 'absolute',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10
      }}
    >
    </motion.div>
  );

  const VerticalSocialLinks = () => (
    <Box
      sx={{
        position: 'absolute',
        left: { xs: 'auto', md: '2rem' },
        right: 'auto',
        top: '25%',
        transform: 'translateY(-50%) translateZ(0)',
        zIndex: 9999,
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          height: '5rem',
          width: '1px',
          bgcolor: 'rgba(255, 255, 255, 0.3)',
          mb: 3
        }}
      />
      
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}
      >
        {socialLinks.map((item, index) => (
          <Box key={index} sx={{ position: 'relative' }}>
            <motion.div
              whileHover={{ scale: 1.15, y: -3 }}
              whileTap={{ scale: 0.95 }}
              onMouseEnter={() => setHoveredSocial(index)}
              onMouseLeave={() => setHoveredSocial(null)}
            >
              <IconButton
                component="a"
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.label}
                sx={{
                  color: hoveredSocial === index ? '#111827' : '#fff',
                  background: hoveredSocial === index ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  width: '2.5rem',
                  height: '2.5rem',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#111827',
                    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)'
                  }
                }}
              >
                {item.icon}
              </IconButton>
            </motion.div>

            {hoveredSocial === index && (
              <Box
                sx={{
                  position: 'absolute',
                  left: '100%',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  ml: 1.5,
                  whiteSpace: 'nowrap',
                  fontSize: '0.875rem',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  px: 2,
                  py: 0.5,
                  borderRadius: '1.5rem',
                  backdropFilter: 'blur(8px)',
                }}
              >
                {item.label}
              </Box>
            )}
          </Box>
        ))}
      </Box>
      
      <Box
        sx={{
          height: '5rem',
          width: '1px',
          bgcolor: 'rgba(255, 255, 255, 0.3)',
          mt: 3
        }}
      />
    </Box>
  );

  return (
    <Box
      sx={{ 
        minHeight: '100vh',
        backgroundImage: heroBackground,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        color: '#ffffff',
        pt: { xs: 8, md: 0 },
        pb: { xs: 16, md: 10 }
      }}
    >
      {!loading && <FloatingShapes />}
      
      {/* Vertical Social Links */}
      {!loading && <VerticalSocialLinks />}

      <Box 
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 50%)',
          zIndex: 1
        }}
      />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
        <AnimatePresence>
          {!loading && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <Grid container spacing={5} alignItems="center">
                <Grid item xs={12} md={7} lg={6}>
                  <Box sx={{ 
                    position: 'relative',
                    mt: { xs: 5, md: 0 },
                    ml: { xs: 0, md: 20 }
                  }}>
                    <motion.div variants={itemVariants}>
                      <Typography
                        variant="h1"
                        component="h1"
                        sx={{
                          fontSize: { xs: '3rem', sm: '4rem', md: '5rem' },
                          fontWeight: 800,
                          mb: 3,
                          background: 'linear-gradient(90deg, #FFFFFF 0%, #A5A5A5 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          letterSpacing: '-1px',
                          fontFamily: "'Montserrat', sans-serif",
                          textShadow: '0 10px 30px rgba(0, 0, 0, 0.15)'
                        }}
                      >
                        {portfolio?.owner?.job || 'Loading...'}
                      </Typography>
                    </motion.div>
                    
                    <motion.div variants={itemVariants}>
                      <Box
                        component={motion.div}
                        whileHover={{ 
                          scale: 1.05,
                          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)'
                        }}
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          background: 'rgba(255, 255, 255, 0.08)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: '30px',
                          px: 2.5,
                          py: 1,
                          mb: 3,
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: '#4ADE80',
                            mr: 1.5,
                            boxShadow: '0 0 10px rgba(74, 222, 128, 0.5)'
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            letterSpacing: '0.5px'
                          }}
                        >
                          Available for freelance work — Based in {portfolio?.owner?.country}
                        </Typography>
                      </Box>
                    </motion.div>
                    
                    <motion.div
                      variants={itemVariants}
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: { xs: 'stretch', md: 'center' },
                        justifyContent: { xs: 'center', md: 'flex-start' },
                        width: { xs: '100%', sm: 'auto' },
                        mb: { xs: 4, md: 5 }
                      }}
                    >
                      <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        component="a"
                        href={VITE_BASE_URL + portfolio?.owner?.cv}
                        download
                        sx={{
                          borderRadius: 40,
                          px: { xs: 4, sm: 5, md: 7 },
                          py: 1.2,
                          mb: { xs: 2, sm: 3, md: 0 },
                          mr: { md: 3 },
                          textTransform: 'none',
                          fontSize: { xs: '0.95rem', sm: '1.05rem' },
                          fontWeight: 600,
                          boxShadow: '0 10px 25px rgba(37, 99, 235, 0.35)',
                          background: 'linear-gradient(90deg, #3B82F6 0%, #2563EB 100%)',
                          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                          width: { xs: '100%', md: 'auto' },
                          '&:hover': {
                            background: 'linear-gradient(90deg, #2563EB 0%, #1D4ED8 100%)',
                            transform: 'translateY(-3px)',
                            boxShadow: '0 15px 30px rgba(37, 99, 235, 0.45)',
                          }
                        }}
                      >
                        Download CV
                      </Button>

                      <Button
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        sx={{
                          borderRadius: 40,
                          px: { xs: 4, sm: 5, md: 7 },
                          py: 1,
                          textTransform: 'none',
                          fontSize: { xs: '0.95rem', sm: '1.05rem' },
                          fontWeight: 600,
                          borderColor: 'rgba(255, 255, 255, 0.15)',
                          borderWidth: 2,
                          color: '#fff',
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.4s ease',
                          zIndex: 1,
                          width: { xs: '100%', md: 'auto' },
                          '&:hover': {
                            borderColor: '#fff',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            transform: 'translateY(-3px)',
                          }
                        }}
                      >
                        {portfolio?.stats?.visitors?.total || 0} Visitors
                      </Button>
                    </motion.div>

                  </Box>
                </Grid>
              </Grid>
            </motion.div>
          )}

          {loading && (
            <Box sx={{ my: 4 }}>
              <Skeleton variant="text" width="200px" height={35} sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 2 }} />
              <Skeleton variant="text" width="450px" height={70} sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 1 }} />
              <Skeleton variant="text" width="350px" height={50} sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 3 }} />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Skeleton variant="rectangular" width="180px" height={50} sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '40px' }} />
                <Skeleton variant="rectangular" width="180px" height={50} sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '40px' }} />
              </Box>
            </Box>
          )}
        </AnimatePresence>
      </Container>

      {/* Marquee implementation with scroll direction awareness */}
      {!loading && <SmoothMarquee portfolio={portfolio} isScrolling={scrollDirection === 'down'} />}

      {/* Scroll down indicator */}
      {!loading && <ScrollIndicator />}

      {/* Background effects */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '60%',
          height: '60%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0) 70%)',
          filter: 'blur(90px)',
          zIndex: 0
        }}
      />
    </Box>
  );
};

export default Hero;