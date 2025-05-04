import React, { useEffect, useState, useRef } from 'react';
import { motion, useTransform, useSpring, useScroll, easeInOut } from "framer-motion";
import { useParams } from 'react-router-dom';
import { AnimatedUnderline } from './Animation'; 

const Work = ({ projects, loading }) => {
  const [duplicatedProjects, setDuplicatedProjects] = useState([]);
  const containerRef = useRef(null);
  const { username } = useParams();
  
  useEffect(() => {
    if (projects && projects.length > 0) {
      const duplicated = [...projects, ...projects, ...projects];
      setDuplicatedProjects(duplicated);
    }
  }, [projects]);

  return (
    <div 
      ref={containerRef}
      className="py-16 md:py-24 relative overflow-hidden border-t border-b border-white/10"
      style={{ 
        background: 'linear-gradient(180deg, #0a0a14 0%, #111128 100%)'
      }}
    >
      {/* Enhanced background effects */}
      <div
        className="absolute top-[5%] left-[-15%] w-[700px] h-[700px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(76, 201, 240, 0.15) 0%, rgba(67, 97, 238, 0.08) 50%, transparent 70%)',
          filter: 'blur(120px)',
          zIndex: 0
        }}
      />
      
      <div
        className="absolute bottom-0 right-[-10%] w-[800px] h-[800px] rounded-full opacity-80"
        style={{
          background: 'radial-gradient(circle, rgba(244, 103, 55, 0.12) 0%, rgba(255, 69, 133, 0.07) 50%, transparent 70%)',
          filter: 'blur(100px)',
          zIndex: 0
        }}
      />
      
      {/* Subtle grid overlay for texture */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10 md:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <p className="text-[#4CC9F0] tracking-[5px] font-bold text-sm uppercase mb-2">
              PORTFOLIO
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-4 text-5xl font-bold text-white md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-400">
              My Work
            </h2>
          </motion.div>
          
          <div className="flex justify-center mb-5">
            <AnimatedUnderline width={80} />
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <p className="max-w-[700px] mx-auto text-white/70 text-lg mb-8 leading-relaxed">
              Ready to explore the complete collection? Click below to see all projects in detail.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Projects section with scroll-based animation */}
      {loading ? (
        <ProjectsLoadingSkeleton />
      ) : (
        <div className="relative overflow-hidden w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
          {/* First row - moves right on scroll down, left on scroll up */}
          <ScrollBasedRow 
            projects={duplicatedProjects} 
            direction="right" 
            containerRef={containerRef}
          />
          
          {/* Second row - moves in opposite direction */}
          <ScrollBasedRow 
            projects={duplicatedProjects} 
            direction="left" 
            containerRef={containerRef}
            offsetProjects={Math.floor(projects?.length / 2) || 0}
          />
        </div>
      )}
      
      <div className="container mx-auto">
        <div className="text-center mt-14 mb-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <button 
              className="group px-8 py-3 rounded-full text-white font-semibold text-lg tracking-wider cursor-pointer border border-[rgba(76,201,240,0.3)] bg-[rgba(67,97,238,0.08)] hover:border-[#4CC9F0] hover:bg-[rgba(76,201,240,0.15)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden hover:shadow-[0_10px_30px_rgba(76,201,240,0.25)]"
              onClick={() => window.location.href = `/${username}/projects`}
            >
              <span className="relative z-10">More</span>
              <span className="absolute top-[-100%] left-[-100%] w-[300%] h-[300%] bg-gradient-to-r from-transparent via-[rgba(76,201,240,0.15)] to-transparent origin-center rotate-45 transition-all duration-700 group-hover:left-full"></span>
            </button>
          </motion.div>
        </div>

        {/* Added a subtle counter element */}
        <div className="flex justify-center mt-6">
          <p className="text-white/40 text-sm font-mono tracking-wider">
            <span className="text-[#4CC9F0]">{projects?.length || 0}</span> Projects Available
          </p>
        </div>
      </div>
    </div>
  );
}

const ScrollBasedRow = ({ projects, direction, containerRef, offsetProjects = 0 }) => {
  const rowRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const x = useTransform(
    scrollYProgress,
    [0, 1],
    direction === 'right' 
      ? ['-5%', '-30%']
      : ['-30%', '-5%'],
    {
      ease: easeInOut
    }
  );

  // Spring configuration for smooth motion
  const smoothX = useSpring(x, {
    stiffness: 100,
    damping: 30,
    mass: 0.5
  });

  // Offset projects for visual variety
  const projectsToShow = offsetProjects > 0 
    ? [...projects.slice(offsetProjects), ...projects.slice(0, offsetProjects)]
    : projects;

  return (
    <div ref={rowRef} className="relative mb-8">
      {/* Gradient fade effects - improved with more subtle gradients */}
      <div className="absolute left-0 top-0 bottom-0 w-[120px] md:w-[200px] pointer-events-none z-10"
           style={{ background: 'linear-gradient(to right, #0a0a14 0%, rgba(10, 10, 20, 0.9) 30%, rgba(10, 10, 20, 0) 100%)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-[120px] md:w-[200px] pointer-events-none z-10"
           style={{ background: 'linear-gradient(to left, #0a0a14 0%, rgba(10, 10, 20, 0.9) 30%, rgba(10, 10, 20, 0) 100%)' }} />
      
      {/* Animated projects row */}
      <div className="flex gap-6 py-4 px-2 md:px-4 overflow-x-visible w-full">
        <motion.div
          style={{
            display: 'flex',
            gap: '40px',
            x: smoothX,
            willChange: 'transform'
          }}
        >
          {projectsToShow.map((project, index) => (
            <ProjectCard 
              project={project} 
              key={`${project.id}-${index}-${direction}`} 
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

const ProjectsLoadingSkeleton = () => {
  return (
    <div className="flex flex-col gap-8 w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] relative px-2 md:px-4">
      {/* First row skeleton */}
      <div className="flex gap-6 overflow-x-hidden py-4">
        {Array(3).fill().map((_, i) => (
          <SkeletonCard key={`row1-${i}`} />
        ))}
      </div>
      
      {/* Second row skeleton */}
      <div className="flex gap-6 overflow-x-hidden py-4">
        {Array(3).fill().map((_, i) => (
          <SkeletonCard key={`row2-${i}`} />
        ))}
      </div>
      
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="w-[480px] h-[260px] bg-white/[0.03] overflow-hidden relative rounded-lg shadow-lg border border-white/5">
    <div 
      className="h-full w-full"
      style={{
        background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite'
      }}
    />
    
    <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2">
      <div className="h-5 w-2/3 bg-white/10 rounded-md"></div>
      <div className="h-3 w-1/3 bg-white/10 rounded-md"></div>
    </div>
  </div>
);

const ProjectCard = ({ project }) => {
  return (
    <motion.div
      whileHover={{ 
        scale: 1.03,
        y: -10,
        transition: { duration: 0.4, ease: 'easeOut' }
      }}
      className="w-[480px] h-[260px] overflow-hidden relative rounded-lg shadow-xl group"
    >
      <div className="w-full h-full overflow-hidden">
        <img
          src={project.image_url}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
          style={{ filter: 'brightness(0.85) contrast(1.15)' }}
        />
      </div>
      
    </motion.div>
  );
};

export default Work;