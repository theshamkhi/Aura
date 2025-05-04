import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import api from '../../api/axios';
import { v4 as uuidv4 } from 'uuid';

import Hero from './components/Hero';
import About from './components/About';
import Work from './components/Work';
import Skills from './components/Skills';
import Contact from './components/Contact';

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL + '/storage/';
const SESSION_ID_KEY = 'visitor_session_id';

export const Home = () => {
  const { username } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [githubStats, setGithubStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [portfolioError, setPortfolioError] = useState(null);
  const [projectsError, setProjectsError] = useState(null);
  const [skillsError, setSkillsError] = useState(null);
  const [githubError, setGithubError] = useState(null);
  const [visitorData, setVisitorData] = useState(null);


  const getSessionId = () => {
    let sessionId = localStorage.getItem(SESSION_ID_KEY);
    
    if (!sessionId) {
      // Generate a new UUID as session ID
      sessionId = uuidv4();
      localStorage.setItem(SESSION_ID_KEY, sessionId);
    }
    
    return sessionId;
  };

  // Track visitor
  const trackVisitor = async () => {
    if (!username) return;
    
    try {
      const sessionId = getSessionId();
      const response = await api.post(`/${username}/track`, { 
        session_id: sessionId 
      });
      
      setVisitorData(response.data.visitor);
      console.log('Visitor tracked:', response.data);
    } catch (error) {
      console.error('Error tracking visitor:', error);
    }
  };

  useEffect(() => {
    if (!username) return;

    const fetchData = async () => {
      setLoading(true);
      
      setPortfolioError(null);
      setProjectsError(null);
      setSkillsError(null);
      setGithubError(null);

      // Portfolio
      try {
        const res = await api.get(`/${username}/portfolio`);
        setPortfolio(res.data.portfolio);
      } catch (err) {
        setPortfolioError('Failed to load portfolio');
        console.error("Portfolio error:", err);
      }

      // Projects
      try {
        const res = await api.get(`/${username}/projects`);
        setProjects(res.data.projects);
        console.log("Projects:", res.data.projects);
      } catch (err) {
        setProjectsError('Failed to load projects');
        console.error("Projects error:", err);
      }

      // Skills
      try {
        const res = await api.get(`/${username}/skills`);
        setSkills(res.data.skills);
        console.log("Skills:", res.data.skills);
      } catch (err) {
        setSkillsError('Failed to load skills');
        console.error("Skills error:", err);
      }

      // GitHub Stats
      try {
        const res = await api.get('/github');
        setGithubStats(res.data);
      } catch (err) {
        setGithubError('Failed to load GitHub stats');
        console.error("GitHub error:", err);
      }

      setLoading(false);
      
      trackVisitor();
    };

    fetchData();
  }, [username]);

  return (
    <Box>
      <div id="Hero">
        <Hero portfolio={portfolio} loading={loading} VITE_BASE_URL={VITE_BASE_URL} />
      </div>
      <div id="About">
        <About portfolio={portfolio} githubStats={githubStats} loading={loading} error={portfolioError || githubError} />
      </div>
      <div id="Work">
        <Work projects={projects} loading={loading} error={projectsError} />
      </div>
      <div id="Skills">
        <Skills skills={skills} loading={loading} error={skillsError} />
      </div>
      <div id="Contact">
        <Contact portfolio={portfolio} githubStats={githubStats} loading={loading} error={portfolioError || githubError} VITE_BASE_URL={VITE_BASE_URL} />
      </div>
    </Box>
  );
};

export default Home;