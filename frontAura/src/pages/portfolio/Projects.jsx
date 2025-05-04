import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatedUnderline } from '../portfolio/components/Animation';
import api from '../../api/axios';

export const ProjectsPage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSkill, setActiveSkill] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!username) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [projectsRes, skillsRes] = await Promise.all([
          api.get(`/${username}/projects`),
          api.get(`/${username}/skills`)
        ]);
        
        setTimeout(() => {
          setProjects(projectsRes.data.projects || []);
          setSkills(skillsRes.data.skills || []);
          setSearchResults(projectsRes.data.projects || []);
          setLoading(false);
        }, 200);
      } catch (err) {
        console.error("Data fetch error:", err);
        setError('Failed to load data. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);


  useEffect(() => {

    setIsSearching(searchTerm.trim() !== '');
    
    const timer = setTimeout(() => {
      if (searchTerm.trim() === '') {
        setSearchResults(projects);
        return;
      }

      const results = projects.filter(project => 
        (project.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (project.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (project.technologies?.some(tech => 
          (typeof tech === 'string' ? tech : tech?.name || '')
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        ) || false)
      );
      
      setSearchResults([]);
      
      setTimeout(() => {
        setSearchResults(results);
      }, 150);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm, projects]);

  const handleSkillFilter = async (skillId) => {

    setActiveSkill(skillId);
    setSearchTerm('');
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = skillId === null 
        ? `/${username}/projects` 
        : `/${username}/skills/${skillId}/projects`;
        
      const res = await api.get(endpoint);
      
      setSearchResults([]);
      
      setTimeout(() => {
        const projectData = res.data.projects || [];
        setProjects(projectData);
        setSearchResults(projectData);
        setLoading(false);
      }, 300);
    } catch (err) {
      console.error("Filter error:", err);
      setError('Unable to load projects. Please try again.');
      setLoading(false);
    }
  };

  const handleProjectClick = (projectId) => {
    navigate(`/${username}/projects/${projectId}`);
  };

  const handleClearFilters = () => {
    setActiveSkill(null);
    setSearchTerm('');
    setError(null);
    
    if (username) {
      setLoading(true);
      
      setSearchResults([]);
      
      api.get(`/${username}/projects`)
        .then(res => {
          setTimeout(() => {
            const projectData = res.data.projects || [];
            setProjects(projectData);
            setSearchResults(projectData);
            setLoading(false);
          }, 300);
        })
        .catch(err => {
          console.error("Reset error:", err);
          setError('Unable to reset filters. Please try again.');
          setLoading(false);
        });
    }
  };

  const displayedProjects = searchResults;

  return (
    <div className="min-h-screen py-24 px-6 md:px-8 lg:px-12 relative"
      style={{ 
        background: 'linear-gradient(180deg, #0a0a14 0%, #111128 100%)'
      }}
    >
      {/* Background effects */}
      <div
        className="absolute top-[10%] right-[-15%] w-[700px] h-[700px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(76, 201, 240, 0.15) 0%, rgba(67, 97, 238, 0.08) 50%, transparent 70%)',
          filter: 'blur(120px)',
          zIndex: 0
        }}
      />
      
      <div
        className="absolute bottom-[20%] left-[-10%] w-[800px] h-[800px] rounded-full opacity-80"
        style={{
          background: 'radial-gradient(circle, rgba(244, 103, 55, 0.12) 0%, rgba(255, 69, 133, 0.07) 50%, transparent 70%)',
          filter: 'blur(100px)',
          zIndex: 0
        }}
      />
      
      {/* Subtle grid overlay */}
      <div 
        className="absolute inset-0 z-[1] opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[#4CC9F0] tracking-[5px] font-bold text-sm uppercase mb-2">
              PROJECTS SHOWCASE
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="mb-4 text-5xl font-bold text-white md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-400">
              All Projects
            </h1>
          </motion.div>
          
          <div className="flex justify-center mb-5">
            <AnimatedUnderline width={100} />
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <p className="max-w-[700px] mx-auto text-white/70 text-lg mb-12 leading-relaxed">
              Browse through my complete collection of projects. Click on any project to view more details.
            </p>
          </motion.div>
        </div>
        
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-lg mx-auto mb-10"
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-4 pl-12 rounded-full bg-white/5 text-white border border-white/10 focus:border-[#4CC9F0] focus:outline-none focus:ring-2 focus:ring-[#4CC9F0]/20 transition-all"
            />
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="absolute left-4 top-4 h-6 w-6 text-white/50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-4 text-white/50 hover:text-white transition-colors"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </button>
            )}
          </div>
        </motion.div>
        
        {/* Category Filter */}
        <motion.div 
          className="flex flex-wrap justify-center gap-3 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <button
            onClick={() => handleSkillFilter(null)}
            className={`px-4 py-2 rounded-full transition-all duration-300 text-sm font-medium
              ${activeSkill === null 
                ? 'bg-gradient-to-r from-[#4361EE] to-[#4CC9F0] text-white shadow-lg shadow-blue-500/20'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
          >
            All
          </button>
          
          {skills.map((skill, index) => (
            <button
              key={skill.id || index}
              onClick={() => handleSkillFilter(skill.id)}
              className={`px-4 py-2 rounded-full transition-all duration-300 text-sm font-medium
                ${activeSkill === skill.id 
                  ? 'bg-gradient-to-r from-[#4361EE] to-[#4CC9F0] text-white shadow-lg shadow-blue-500/20'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
            >
              {skill.icon && (
                <img 
                  src={skill.icon} 
                  alt={skill.name} 
                  className="inline-block mr-2 h-4 w-4" 
                />
              )}
              {skill.name}
            </button>
          ))}
        </motion.div>
        
        {/* Error message handling */}
        {error && (
          <div className="text-center py-8 mb-8 bg-white/5 rounded-xl border border-white/10 shadow-lg">
            <p className="text-red-400 mb-4">{error}</p>
            <button 
              onClick={handleClearFilters}
              className="px-6 py-2 bg-gradient-to-r from-[#4361EE] to-[#4CC9F0] text-white rounded-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
            >
              Reset and Try Again
            </button>
          </div>
        )}
        
        {/* Projects Grid */}
        {loading ? (
          <ProjectsGridSkeleton />
        ) : displayedProjects.length === 0 && !loading ? (
          <div className="text-center py-16 bg-white/5 rounded-xl border border-white/10 shadow-lg">
            <div className="flex flex-col items-center justify-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-16 w-16 text-white/20 mb-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <p className="text-white/70 text-xl mb-6">
                {searchTerm 
                  ? `No projects found matching "${searchTerm}"` 
                  : `No projects found${activeSkill ? ` with selected skill` : ''}.`}
              </p>
              <button 
                onClick={handleClearFilters}
                className="px-6 py-3 bg-gradient-to-r from-[#4361EE] to-[#4CC9F0] text-white rounded-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
              >
                Clear Filters
              </button>
            </div>
          </div>
        ) : (
          <>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              {displayedProjects.map((project, index) => (
                <ProjectGridCard 
                  key={project.id || index} 
                  project={project} 
                  index={index}
                  onClick={() => handleProjectClick(project.id)}
                  animationDelay={(index % 6) * 0.05}
                />
              ))}
            </motion.div>
            
            {/* Status Message */}
            {(activeSkill || isSearching) && displayedProjects.length > 0 && (
              <div className="text-center mt-8">
                <p className="text-white/50 text-sm">
                  {isSearching 
                    ? `Found ${displayedProjects.length} project${displayedProjects.length !== 1 ? 's' : ''} matching "${searchTerm}"`
                    : `Showing ${displayedProjects.length} project${displayedProjects.length !== 1 ? 's' : ''} with selected skill`}
                </p>
                <button 
                  onClick={handleClearFilters}
                  className="mt-2 px-4 py-1 text-xs text-white/50 hover:text-white underline transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const ProjectGridCard = ({ project, index, onClick, animationDelay = 0 }) => {
  if (!project) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: animationDelay,
        ease: "easeOut" 
      }}
      whileHover={{ 
        y: -10,
        transition: { duration: 0.3, ease: 'easeOut' }
      }}
      className="bg-[rgba(255,255,255,0.03)] backdrop-blur-sm rounded-lg overflow-hidden shadow-lg border border-white/5 cursor-pointer group h-full flex flex-col"
      onClick={onClick}
    >
      {/* Project Image */}
      <div className="relative w-full h-48 overflow-hidden">
        {project.image_url ? (
          <>
            <img
              src={project.image_url}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
              style={{ filter: 'brightness(0.85) contrast(1.15)' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/600x400?text=Project+Image";
              }}
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#111128] to-[#1e1e3f]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-white/20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>
      
      {/* Project Info */}
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-white text-xl font-bold mb-2 group-hover:text-[#4CC9F0] transition-colors">
          {project.title || "Untitled Project"}
        </h3>
        
        <p className="text-white/60 text-sm mb-4 flex-grow">
          {project.description 
            ? (project.description.substring(0, 120) + (project.description.length > 120 ? '...' : '')) 
            : 'No description available.'}
        </p>
        
        {/* Tags/Categories */}
        <div className="flex flex-wrap gap-2 mt-auto">
          {project.technologies && project.technologies.length > 0 ? (
            project.technologies.slice(0, 3).map((technology, i) => (
              <span 
                key={i} 
                className="px-3 py-1 bg-[rgba(255,255,255,0.05)] text-white/50 text-xs rounded-full"
              >
                {typeof technology === 'string' ? technology : technology.name}
              </span>
            ))
          ) : (
            <span className="px-3 py-1 bg-[rgba(255,255,255,0.05)] text-white/50 text-xs rounded-full">
              Project
            </span>
          )}
        </div>
      </div>
      
      {/* Bottom accent border with gradient */}
      <div className="h-1 w-full bg-gradient-to-r from-[#4361EE] to-[#4CC9F0] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
    </motion.div>
  );
};

const ProjectsGridSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {Array(6).fill().map((_, i) => (
        <div 
          key={i} 
          className="bg-[rgba(255,255,255,0.03)] rounded-lg overflow-hidden shadow-lg border border-white/5 h-[320px] relative"
        >
          {/* Image skeleton */}
          <div className="h-48 w-full relative overflow-hidden">
            <div 
              className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10"
              style={{
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite'
              }}
            ></div>
          </div>
          
          {/* Content skeleton */}
          <div className="p-6">
            <div className="h-5 w-2/3 bg-white/10 rounded-md mb-4 overflow-hidden relative">
              <div 
                className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10"
                style={{
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite'
                }}
              ></div>
            </div>
            <div className="h-3 w-full bg-white/10 rounded-md mb-2 overflow-hidden relative">
              <div 
                className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10"
                style={{
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite'
                }}
              ></div>
            </div>
            <div className="h-3 w-4/5 bg-white/10 rounded-md mb-4 overflow-hidden relative">
              <div 
                className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10"
                style={{
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite'
                }}
              ></div>
            </div>
            
            {/* Tags skeleton */}
            <div className="flex gap-2 mt-4">
              <div className="h-6 w-16 bg-white/10 rounded-full overflow-hidden relative">
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10"
                  style={{
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.5s infinite'
                  }}
                ></div>
              </div>
              <div className="h-6 w-16 bg-white/10 rounded-full overflow-hidden relative">
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10"
                  style={{
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.5s infinite'
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      ))}
      
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