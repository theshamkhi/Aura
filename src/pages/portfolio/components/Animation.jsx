import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, useMotionValue } from 'framer-motion';

// Custom animated underline component
export const AnimatedUnderline = ({ width = '40%' }) => (
  <motion.div
    initial={{ width: 0, opacity: 0 }}
    whileInView={{ width, opacity: 1 }}
    transition={{ duration: 0.8 }}
    style={{
      height: 3,
      background: 'linear-gradient(90deg, #4361ee 0%, #4CC9F0 100%)',
      marginTop: 8,
      marginBottom: 24,
      borderRadius: 2
    }}
  />
);

// Animated skill badge component
export const SkillBadge = ({ skill, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5, scale: 1.1 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 10,
        delay: index * 0.05
      }}
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(8px)',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        width: '100px',
        height: '100px',
        justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
      }}
    >
      <Box
        component="img"
        src={skill.icon}
        alt={skill.name}
        sx={{
          width: '50px',
          height: '50px',
          objectFit: 'contain'
        }}
      />
      <Typography variant="caption" fontWeight="medium" sx={{ opacity: 0.8 }}>
        {skill.name}
      </Typography>
    </motion.div>
  );
};

// Project card component with hover effects
export const ProjectCard = ({ project }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -10 }}
      transition={{ duration: 0.4 }}
      style={{
        height: '100%',
        borderRadius: 16,
        overflow: 'hidden',
        background: 'rgba(30, 30, 35, 0.6)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)'
      }}
    >
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4 }}
        >
          <Box
            component="img"
            src={project.image_url || '/images/placeholder-project.jpg'}
            alt={project.title}
            sx={{
              width: '100%',
              height: 220,
              objectFit: 'cover'
            }}
          />
        </motion.div>
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '40px 20px 15px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)'
          }}
        >
          <Typography variant="caption" sx={{
            bgcolor: project.category === 'Web Development' ? '#4361ee' :
                    project.category === 'Mobile App' ? '#F46737' : 
                    project.category === 'UI/UX' ? '#57F287' : '#00B5D8',
            px: 1.5,
            py: 0.5,
            borderRadius: 5,
            fontSize: '0.7rem',
            fontWeight: 'bold'
          }}>
            {project.category}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {project.title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2, height: 40, overflow: 'hidden' }}>
          {project.description || 'An innovative project showcasing advanced techniques and creative solutions.'}
        </Typography>
      </Box>
    </motion.div>
  );
};

// Animated stat counter component
export const AnimatedCounter = ({ value, label, color, duration = 2 }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    const incrementTime = duration * 1000 / end;
    let timer;
    
    // Handle fast counting for large numbers
    const step = end > 1000 ? Math.floor(end / 100) : 1;
    
    timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, incrementTime);
    
    return () => clearInterval(timer);
  }, [value, duration]);
  
  return (
    <Box sx={{ textAlign: 'center' }}>
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        <Typography 
          variant="h3" 
          component="div" 
          sx={{ 
            color, 
            fontWeight: 'bold',
            fontSize: { xs: '2rem', md: '3rem' }
          }}
        >
          {count.toLocaleString()}
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'white',
            mt: 1,
            fontSize: '0.9rem',
            fontWeight: '500',
            opacity: 0.8,
            textTransform: 'uppercase',
            letterSpacing: 1
          }}
        >
          {label}
        </Typography>
      </motion.div>
    </Box>
  );
};

export const SmoothMarquee = ({ portfolio, isScrolling }) => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [textWidth, setTextWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [duplicates, setDuplicates] = useState(3);
  const ownerName = portfolio?.owner?.name || 'Loading...';
  const x = useMotionValue(0);
  const absolutePositionRef = useRef(0);
  const speedRef = useRef(0);
  const lastTimeRef = useRef(null);
  const animationRef = useRef(null);
  
  const measure = useCallback(() => {
    if (!textRef.current || !containerRef.current) return;
    
    const textRect = textRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    
    setTextWidth(textRect.width);
    setContainerWidth(containerRect.width);
    
    const needed = Math.ceil((containerRect.width * 2) / textRect.width) + 1;
    setDuplicates(Math.max(needed, 3));
  }, []);
  
  useEffect(() => {
    if (!containerRef.current || !textRef.current) return;
    
    measure();

    const resizeObserver = new ResizeObserver(() => {
      measure();
    });
    
    resizeObserver.observe(containerRef.current);
    resizeObserver.observe(textRef.current);
    
    window.addEventListener('resize', measure);
    
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure]);
  
  useEffect(() => {
    const timeoutId = setTimeout(measure, 50);
    return () => clearTimeout(timeoutId);
  }, [ownerName, measure]);
  
  useEffect(() => {
    if (textWidth <= 0) return;
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    const baseSpeed = textWidth / 18; 

    speedRef.current = isScrolling ? -baseSpeed * 0.9 : baseSpeed * 0.9;
    
    lastTimeRef.current = null;
    
    const animate = (time) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;

      const deltaTime = Math.min((time - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = time;
      
      if (textWidth <= 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      
      absolutePositionRef.current += speedRef.current * deltaTime;

      if (absolutePositionRef.current > textWidth) {
        absolutePositionRef.current = absolutePositionRef.current % textWidth;
      } 
      else if (absolutePositionRef.current < 0) {
        absolutePositionRef.current = textWidth + (absolutePositionRef.current % textWidth);
      }
      
      x.set(-absolutePositionRef.current);
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [textWidth, isScrolling]);


  const TextItem = useCallback(() => (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {/* Owner name with bold styling */}
      <Typography
        variant="h1"
        sx={{
          fontSize: { xs: '6rem', md: '14rem' },
          fontWeight: 800,
          color: 'white',
          px: 4,
          whiteSpace: 'nowrap',
          fontFamily: "'Montserrat', sans-serif",
          letterSpacing: '-0.02em',
        }}
      >
        {ownerName}
      </Typography>
      {/* Separator dash with lighter weight */}
      <Typography
        variant="h1"
        sx={{
          fontSize: { xs: '6rem', md: '12rem' },
          fontWeight: 100,
          color: 'white',
          whiteSpace: 'nowrap',
          fontFamily: "'Montserrat', sans-serif",
        }}
      >
        {" — "}
      </Typography>
    </Box>
  ), [ownerName]); // Only recreate when owner name changes

  return (
    <Box 
      ref={containerRef}
      sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: { xs: '140px', sm: '180px', md: '250px' },
        overflow: 'hidden',
        opacity: 0.3,
        zIndex: 1
      }}
    >
      <Box sx={{ position: 'relative', height: '100%' }}>
        {/* Hidden element used only for measurement */}
        {/* This avoids layout shifts when measuring the visible elements */}
        <Box
          ref={textRef}
          sx={{
            display: 'flex',
            alignItems: 'center',
            visibility: 'hidden', // Hidden but still takes up space
            position: 'absolute'
          }}
        >
          <TextItem />
        </Box>
        
        {/* The actual visible marquee element */}
        <motion.div
          style={{ 
            display: 'flex', 
            position: 'absolute', 
            whiteSpace: 'nowrap',
            x,
            height: '100%',
            alignItems: 'center'
          }}
        >
          {/* Create multiple copies of the text to ensure seamless looping */}
          {Array.from({ length: duplicates }).map((_, i) => (
            <TextItem key={i} />
          ))}
        </motion.div>
      </Box>
    </Box>
  );
};