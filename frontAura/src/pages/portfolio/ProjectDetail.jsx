import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatedUnderline } from './components/Animation';
import api from '../../api/axios';
import { v4 as uuidv4 } from 'uuid';

export const ProjectDetail = () => {
  const { username, id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [projectStats, setProjectStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Session ID management
  const SESSION_ID_KEY = 'visitor_session_id';
  const getSessionId = () => {
    let sessionId = localStorage.getItem(SESSION_ID_KEY);
    
    if (!sessionId) {
      // Generate a new UUID as session ID
      sessionId = uuidv4();
      localStorage.setItem(SESSION_ID_KEY, sessionId);
    }
    
    return sessionId;
  };

  // Track project view
  const trackProjectView = async (projectId) => {
    try {
      const sessionId = getSessionId();
      
      await api.post(`/projects/${projectId}/views`, {
        session_id: sessionId
      });
      
      console.log('View tracked successfully');
    } catch (err) {
      console.error('Error tracking view:', err);
    }
  };

  // Fetch project stats
  const fetchProjectStats = async (projectId) => {
    setStatsLoading(true);
    try {
      const response = await api.get(`/projects/${projectId}/stats`);
      setProjectStats(response.data.stats);
    } catch (err) {
      console.error("Stats fetch error:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (!username || !id) return;

    const fetchProjectDetails = async () => {
      setError(null);
      setLoading(true);

      try {
        const response = await api.get(`/${username}/projects/${id}`);
        setProject(response.data.project);
        setLoading(false);
        
        trackProjectView(id);
        
        fetchProjectStats(id);
      } catch (err) {
        console.error("Project fetch error:", err);
        setError('Failed to load project details. Please try again.');
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [username, id]);

  const handleBackToProjects = () => {
    navigate(`/${username}/projects`);
  };

  const handleVisitLiveSite = (url) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleViewSourceCode = (url) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  const getTopCountries = () => {
    if (!projectStats || !projectStats.country_distribution) return [];
    return projectStats.country_distribution.slice(0, 5);
  };

  return (
    <div className="min-h-screen py-12 md:py-24 px-4 sm:px-6 md:px-8 relative"
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

      <div className="container mx-auto max-w-6xl px-4 md:px-6 lg:px-8 relative z-10">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <button 
            onClick={handleBackToProjects}
            className="flex items-center text-white/70 hover:text-white transition-colors"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 19l-7-7m0 0l7-7m-7 7h18" 
              />
            </svg>
            Back to Projects
          </button>
        </motion.div>

        {/* Error message */}
        {error && (
          <div className="bg-white/5 rounded-xl p-8 border border-white/10 shadow-lg text-center mb-8 mx-auto max-w-2xl">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-16 w-16 text-red-400/70 mx-auto mb-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
            <p className="text-red-400 mb-4">{error}</p>
            <button 
              onClick={handleBackToProjects}
              className="px-6 py-2 bg-gradient-to-r from-[#4361EE] to-[#4CC9F0] text-white rounded-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
            >
              Return to Projects
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && !error && (
          <ProjectDetailsSkeleton />
        )}

        {/* Project content */}
        {!loading && !error && project && (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg overflow-hidden">
            {/* Project header image */}
            <div className="relative w-full h-64 md:h-96 overflow-hidden">
              {project.image_url ? (
                <>
                  <motion.img
                    initial={{ scale: 1.1, opacity: 0.8 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    src={project.image_url}
                    alt={project.title}
                    className="w-full h-full object-cover"
                    style={{ filter: 'brightness(0.85) contrast(1.15)' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/1200x600?text=Project+Image";
                    }}
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#111128] to-[#1e1e3f]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-20 w-20 text-white/20"
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
              
              {/* Project title overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  
                  <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
                    {project.title}
                  </h1>
                  
                  {project.date && (
                    <div className="flex items-center text-white/50 text-sm">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-4 w-4 mr-2" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                        />
                      </svg>
                      {project.date}
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
            
            {/* Project details content */}
            <div className="p-6 md:p-8 lg:p-10">
              <div className="flex flex-col lg:flex-row lg:gap-10">
                {/* Left column - Project description */}
                <div className="lg:w-2/3">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <h2 className="text-2xl font-bold text-white mb-4">Project Overview</h2>
                    <div className="mb-2">
                      <AnimatedUnderline width={80} />
                    </div>
                    
                    <div className="prose prose-invert prose-lg max-w-none">
                      <p className="text-white/70 leading-relaxed whitespace-pre-line mb-8">
                        {project.description || "No description available for this project."}
                      </p>
                    </div>
                    
                    {/* Project technologies */}
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="mb-10">
                        <h3 className="text-xl font-bold text-white mb-4">Technologies Used</h3>
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.map((tech, index) => (
                            <span
                              key={index}
                              className="px-4 py-2 bg-white/5 text-white/70 rounded-full text-sm font-medium"
                            >
                              {typeof tech === 'string' ? tech : tech.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Project Stats Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="mt-10"
                    >
                      <h2 className="text-2xl font-bold text-white mb-4">Project Analytics</h2>
                      <div className="mb-2">
                        <AnimatedUnderline width={80} />
                      </div>
                      
                      {statsLoading ? (
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="h-32 bg-white/5 rounded-xl border border-white/10 p-6 relative overflow-hidden">
                            <div className="h-5 w-24 bg-white/10 rounded-md overflow-hidden relative mb-4">
                              <div 
                                className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10"
                                style={{
                                  backgroundSize: '200% 100%',
                                  animation: 'shimmer 1.5s infinite'
                                }}
                              ></div>
                            </div>
                            <div className="h-8 w-16 bg-white/10 rounded-md overflow-hidden relative">
                              <div 
                                className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10"
                                style={{
                                  backgroundSize: '200% 100%',
                                  animation: 'shimmer 1.5s infinite'
                                }}
                              ></div>
                            </div>
                          </div>
                          <div className="h-32 bg-white/5 rounded-xl border border-white/10 p-6">
                            <div className="h-5 w-40 bg-white/10 rounded-md overflow-hidden relative mb-4">
                              <div 
                                className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10"
                                style={{
                                  backgroundSize: '200% 100%',
                                  animation: 'shimmer 1.5s infinite'
                                }}
                              ></div>
                            </div>
                            <div className="space-y-2">
                              {[1, 2, 3].map((i) => (
                                <div key={i} className="flex justify-between">
                                  <div className="h-4 w-16 bg-white/10 rounded-md overflow-hidden relative">
                                    <div 
                                      className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10"
                                      style={{
                                        backgroundSize: '200% 100%',
                                        animation: 'shimmer 1.5s infinite'
                                      }}
                                    ></div>
                                  </div>
                                  <div className="h-4 w-10 bg-white/10 rounded-md overflow-hidden relative">
                                    <div 
                                      className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10"
                                      style={{
                                        backgroundSize: '200% 100%',
                                        animation: 'shimmer 1.5s infinite'
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : projectStats ? (
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Total Views Card */}
                          <div className="bg-white/5 rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-colors">
                            <h3 className="text-lg font-semibold text-white/70 mb-1">Total Views</h3>
                            <div className="flex items-end gap-2">
                              <p className="text-3xl font-bold text-white">{projectStats.total_views}</p>
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-6 w-6 text-[#4CC9F0] mb-1" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                                />
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                                />
                              </svg>
                            </div>
                          </div>
                          
                          {/* Geographic Distribution */}
                          <div className="bg-white/5 rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-colors">
                            <h3 className="text-lg font-semibold text-white/70 mb-3">Top Visitor Countries</h3>
                            {projectStats.country_distribution && projectStats.country_distribution.length > 0 ? (
                              <div className="space-y-2">
                                {getTopCountries().map((country, index) => (
                                  <div key={index} className="flex justify-between items-center">
                                    <span className="text-white/60">{country.country || 'Unknown'}</span>
                                    <div className="flex items-center">
                                      <span className="text-white font-medium mr-2">{country.count}</span>
                                      <div className="w-16 bg-white/10 rounded-full h-1.5">
                                        <div 
                                          className="h-full rounded-full bg-gradient-to-r from-[#4361EE] to-[#4CC9F0]"
                                          style={{ 
                                            width: `${Math.min(100, (country.count / projectStats.country_distribution[0].count) * 100)}%` 
                                          }}
                                        ></div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-white/50 text-sm">No geographic data available yet</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-white/50 mt-4">Analytics data could not be loaded</p>
                      )}
                    </motion.div>
                  </motion.div>
                </div>
                
                {/* Right column - Project details & links */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="lg:w-1/3 mt-8 lg:mt-0"
                >
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-6">Project Links</h3>
                    
                    <div className="flex flex-col gap-4">
                      {/* Live site button */}
                      {project.live_site_url && (
                        <button
                          onClick={() => handleVisitLiveSite(project.live_site_url)}
                          className="w-full py-3 bg-gradient-to-r from-[#4361EE] to-[#4CC9F0] text-white rounded-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all flex items-center justify-center"
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-5 w-5 mr-2" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" 
                            />
                          </svg>
                          Visit Live Site
                        </button>
                      )}
                      
                      {/* Source code button */}
                      {project.source_code_url && (
                        <button
                          onClick={() => handleViewSourceCode(project.source_code_url)}
                          className="w-full py-3 bg-white/10 text-white rounded-lg hover:bg-white/15 transition-all flex items-center justify-center"
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-5 w-5 mr-2" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" 
                            />
                          </svg>
                          View Source Code
                        </button>
                      )}
                      
                      {/* Back to projects button */}
                      <button
                        onClick={handleBackToProjects}
                        className="w-full py-3 border border-white/10 text-white/70 rounded-lg hover:bg-white/5 transition-all flex items-center justify-center"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5 mr-2" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M11 17l-5-5m0 0l5-5m-5 5h12" 
                          />
                        </svg>
                        Back to Projects
                      </button>
                    </div>
                    
                    {/* Project details */}
                    <div className="mt-8 pt-8 border-t border-white/10">
                      <h3 className="text-xl font-bold text-white mb-4">Project Details</h3>
                      
                      <ul className="space-y-4">
                        {/* Category */}
                        {project.category && (
                          <li className="flex justify-between">
                            <span className="text-white/50">Category:</span>
                            <span className="text-white font-medium">{project.category}</span>
                          </li>
                        )}
                        
                        {/* Date */}
                        {project.date && (
                          <li className="flex justify-between">
                            <span className="text-white/50">Completed:</span>
                            <span className="text-white font-medium">{project.date}</span>
                          </li>
                        )}
                        
                        {/* View count */}
                        <li className="flex justify-between">
                          <span className="text-white/50">Views:</span>
                          <span className="text-white font-medium">
                            {projectStats ? projectStats.total_views : (
                              project.view_count !== undefined ? project.view_count : '...'
                            )}
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <style>{`
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

const ProjectDetailsSkeleton = () => {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg overflow-hidden">
      {/* Image skeleton */}
      <div className="w-full h-64 md:h-96 bg-gradient-to-br from-[#111128] to-[#1e1e3f] relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10"
          style={{
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }}
        />
        
        {/* Title skeleton */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="w-24 h-6 bg-white/10 rounded-full mb-4"></div>
          <div className="w-3/4 h-10 bg-white/10 rounded-lg mb-2"></div>
          <div className="w-36 h-4 bg-white/10 rounded-lg"></div>
        </div>
      </div>
      
      {/* Content skeleton */}
      <div className="p-6 md:p-8 lg:p-10">
        <div className="flex flex-col lg:flex-row lg:gap-10">
          {/* Left column */}
          <div className="lg:w-2/3">
            <div className="w-48 h-8 bg-white/10 rounded-lg mb-4"></div>
            <div className="w-20 h-1 bg-white/20 rounded mb-6"></div>
            
            {/* Description skeleton */}
            <div className="space-y-3 mb-8">
              <div className="w-full h-4 bg-white/10 rounded"></div>
              <div className="w-full h-4 bg-white/10 rounded"></div>
              <div className="w-3/4 h-4 bg-white/10 rounded"></div>
              <div className="w-5/6 h-4 bg-white/10 rounded"></div>
              <div className="w-2/3 h-4 bg-white/10 rounded"></div>
            </div>
            
            {/* Technologies skeleton */}
            <div className="mb-10">
              <div className="w-40 h-6 bg-white/10 rounded-lg mb-4"></div>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="w-20 h-8 bg-white/5 rounded-full"></div>
                ))}
              </div>
            </div>
            
            {/* Analytics skeleton */}
            <div className="mt-12">
              <div className="w-48 h-8 bg-white/10 rounded-lg mb-4"></div>
              <div className="w-20 h-1 bg-white/20 rounded mb-6"></div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mt-6">
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4CC9F0]"></div>
                  <span className="ml-4 text-white/50">Loading content...</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column */}
          <div className="lg:w-1/3 mt-8 lg:mt-0">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="w-32 h-6 bg-white/10 rounded-lg mb-6"></div>
              
              <div className="flex flex-col gap-4">
                <div className="w-full h-10 bg-gradient-to-r from-[#4361EE]/30 to-[#4CC9F0]/30 rounded-lg"></div>
                <div className="w-full h-10 bg-white/10 rounded-lg"></div>
                <div className="w-full h-10 bg-white/5 border border-white/10 rounded-lg"></div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-white/10">
                <div className="w-36 h-6 bg-white/10 rounded-lg mb-4"></div>
                
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="flex justify-between">
                      <div className="w-24 h-4 bg-white/10 rounded"></div>
                      <div className="w-32 h-4 bg-white/10 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;