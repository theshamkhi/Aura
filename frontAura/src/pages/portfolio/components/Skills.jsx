import React from 'react';
import { Box, Typography, Container, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';
import { AnimatedUnderline, SkillBadge } from './Animation';

export const Skills = ({ loading, skills }) => {
  return (
    <Box 
      sx={{ 
        py: { xs: 8, md: 12 },
        position: 'relative'
      }}
    >
      {/* Animated gradient background */}
      <Box
        component={motion.div}
        animate={{
          background: [
            'linear-gradient(135deg, rgba(67, 97, 238, 0.08) 0%, rgba(20, 20, 30, 0) 70%)',
            'linear-gradient(225deg, rgba(76, 201, 240, 0.08) 0%, rgba(20, 20, 30, 0) 70%)',
            'linear-gradient(315deg, rgba(67, 97, 238, 0.08) 0%, rgba(20, 20, 30, 0) 70%)'
          ],
        }}
        transition={{ duration: 20, repeat: Infinity }}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0
        }}
      />
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Typography 
              variant="overline" 
              sx={{ 
                color: '#4CC9F0', 
                letterSpacing: 4,
                fontWeight: 'bold',
                fontSize: '0.9rem'
              }}
            >
              MY EXPERTISE
            </Typography>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-3 text-5xl font-bold text-white md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-400">
                What I Work With
            </h2>
          </motion.div>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <AnimatedUnderline width="80px" />
          </Box>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Typography 
              variant="body1" 
              sx={{ 
                maxWidth: 700, 
                mx: 'auto',
                color: 'rgba(255, 255, 255, 0.7)',
                mb: 8
              }}
            >
              My technical toolkit includes a wide range of technologies that enable me to build modern, scalable, and user-friendly applications.
            </Typography>
          </motion.div>
        </Box>
        
        <Box 
          sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            justifyContent: 'center', 
            gap: { xs: 2, md: 4 }
          }}
        >
          {loading ? (
            Array(8).fill().map((_, i) => (
              <Skeleton 
                key={i} 
                variant="rectangular" 
                width={100} 
                height={100} 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.1)',
                  borderRadius: 3
                }} 
              />
            ))
          ) : (
            skills.map((skill, index) => (
              <SkillBadge key={skill.id} skill={skill} index={index} />
            ))
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default Skills;