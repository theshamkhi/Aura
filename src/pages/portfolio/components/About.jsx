import React, { useState, useEffect } from 'react';
import { GitBranch, Code, Users, Star } from 'lucide-react';
import { AnimatedUnderline, AnimatedCounter } from './Animation';

const About = ({ portfolio, githubStats, loading, error }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <h2 className="text-2xl font-bold text-red-400 mb-2">Something went wrong</h2>
        <p className="text-gray-300">{error}</p>
      </div>
    );
  }

  const fadeIn = isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8";
  
  return (
    <div className="py-16 md:py-24 relative overflow-hidden border-t border-b border-white/10">
      {/* Decorative elements */}
      <div className="absolute top-20 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-0 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>
      
      {/* Section header */}
      <div className="relative text-center mb-16">
        <div className={`transition-all duration-700 ${fadeIn}`}>
          <p className="text-blue-400 font-bold tracking-widest text-sm mb-2">
            ABOUT ME
          </p>
        </div>
        
        <h2 className="mb-3 text-5xl font-bold text-white md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-400">
            Who I Am
        </h2>
        
        <div className="flex justify-center mb-2">
          <AnimatedUnderline width="80px" />
        </div>
      </div>
      
      {/* Bio card */}
      <div 
        className={`relative max-w-4xl mx-auto mb-16 transition-all duration-1000 delay-300 ${fadeIn}`}
      >
        {/* Glass card effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-2xl backdrop-blur-md border border-white/5"></div>
        
        {/* Content container */}
        <div className="relative z-10 p-8 md:p-10">
          {loading ? (
            <>
              <div className="h-4 bg-white/10 rounded w-full mb-3 animate-pulse"></div>
              <div className="h-4 bg-white/10 rounded w-full mb-3 animate-pulse"></div>
              <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse"></div>
            </>
          ) : (
            <div className="relative">
              {/* Quote marks */}
              <div className="absolute -top-6 -left-2 text-6xl text-indigo-500/20 font-serif">"</div>
              <div className="absolute -bottom-8 -right-2 text-6xl text-indigo-500/20 font-serif">"</div>
              
              {/* Bio text */}
              <p className="text-lg text-center leading-relaxed text-white/90 px-4">
                {portfolio?.owner.bio || "NO BIO"}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* GitHub stats */}
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto transition-all duration-1000 delay-500 ${fadeIn}`}>
        {loading ? (
          Array(4).fill().map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="h-12 bg-white/10 rounded w-20 mb-2 animate-pulse"></div>
              <div className="h-4 bg-white/10 rounded w-16 animate-pulse"></div>
            </div>
          ))
        ) : (
          <>
            <StatCard 
              icon={<Code className="text-blue-400" />}
              value={githubStats?.stats?.commits || '0'} 
              label="Commits" 
              color="#4DA8FF" 
            />
            <StatCard 
              icon={<GitBranch className="text-orange-400" />}
              value={githubStats?.stats?.repositories || '0'} 
              label="Repositories" 
              color="#F46737" 
            />
            <StatCard 
              icon={<Users className="text-green-400" />}
              value={githubStats?.stats?.contributions || '0'} 
              label="Contributions" 
              color="#57F287" 
            />
            <StatCard 
              icon={<Star className="text-cyan-400" />}
              value={githubStats?.stats?.stars || '0'} 
              label="Stars" 
              color="#00B5D8" 
            />
          </>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, value, label, color }) => {
  return (
    <div className="flex flex-col items-center bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
      <div className="flex justify-center mb-2">
        {icon}
      </div>
      <div className="flex justify-center">
        <AnimatedCounter 
          value={value} 
          label={label} 
          color={color} 
        />
      </div>
    </div>
  );
};

export default About;