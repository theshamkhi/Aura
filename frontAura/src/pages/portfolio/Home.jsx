import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import api from '../../api/axios';

import Hero from './components/Hero';
import About from './components/About';
import Work from './components/Work';
import Skills from './components/Skills';
import Contact from './components/Contact';

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL + '/storage/';

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
      } catch (err) {
        setProjectsError('Failed to load projects');
        console.error("Projects error:", err);
      }

      // Skills
      try {
        const res = await api.get(`/${username}/skills`);
        setSkills(res.data.skills);
      } catch (err) {
        setSkillsError('Failed to load skills');
        console.error("Skills error:", err);
      }

      // GitHub Stats
      try {
        const res = await api.get('/github');
        setGithubStats(res.data.stats);
      } catch (err) {
        setGithubError('Failed to load GitHub stats');
        console.error("GitHub error:", err);
      }

      setLoading(false);
    };

    fetchData();
  }, [username]);

  return (
    <Box>
      <Hero portfolio={portfolio} loading={loading} VITE_BASE_URL={VITE_BASE_URL} />
      <About portfolio={portfolio} githubStats={githubStats} loading={loading} error={portfolioError || githubError} />
      <Work projects={projects} loading={loading} error={projectsError} />
      <Skills skills={skills} loading={loading} error={skillsError} />
      <Contact portfolio={portfolio} loading={loading} VITE_BASE_URL={VITE_BASE_URL} />
    </Box>
  );
};

export default Home;