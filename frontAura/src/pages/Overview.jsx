import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  Person,
  Work,
  Description,
  Email,
  Public,
  Assessment,
  Visibility,
  Code,
  EmojiEvents,
  CloudUpload,
  Mail,
  People,
  CheckCircleOutline,
  ErrorOutline,
  Close,
  Delete,
  AccountCircle,
  Link,
  Title,
  Image as ImageIcon,
  Article
} from '@mui/icons-material';
import { 
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  Snackbar,
  TextField,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Paper,
  Alert,
  InputAdornment,
  Chip,
  Stack,
  LinearProgress,
  Skeleton,
  Tabs,
  Tab,
  useTheme,
  IconButton,
  Divider
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Helmet } from 'react-helmet';
import { LoadingButton } from '@mui/lab';
import { SocialLinksField } from '../components/SocialLinksField';

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL +'/storage/';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const Overview = () => {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOwnerOpen, setEditOwnerOpen] = useState(false);
  const [editPortfolioOpen, setEditPortfolioOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [activeTab, setActiveTab] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const theme = useTheme();
  
  // Owner form
  const { control: ownerControl, handleSubmit: handleOwnerSubmit, reset: resetOwner, formState: { errors: ownerErrors }, setValue: setOwnerValue, watch: watchOwner } = useForm();
  const photoFile = watchOwner('photoFile');
  const cvFile = watchOwner('cvFile');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [cvFileName, setCvFileName] = useState(null);
  
  // Portfolio form
  const { control: portfolioControl, handleSubmit: handlePortfolioSubmit, reset: resetPortfolio, formState: { errors: portfolioErrors }, setValue: setPortfolioValue, watch: watchPortfolio } = useForm();
  const portfolioImageFile = watchPortfolio('imageFile');
  const [portfolioImagePreview, setPortfolioImagePreview] = useState(null);

  useEffect(() => {
    fetchPortfolio();
  }, [user]);

  // Create preview when photo file is selected
  useEffect(() => {
    if (photoFile && photoFile[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(photoFile[0]);
    }
  }, [photoFile]);
  
  // Update CV filename when file is selected
  useEffect(() => {
    if (cvFile && cvFile[0]) {
      setCvFileName(cvFile[0].name);
    }
  }, [cvFile]);
  
  // Create preview when portfolio image file is selected
  useEffect(() => {
    if (portfolioImageFile && portfolioImageFile[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPortfolioImagePreview(reader.result);
      };
      reader.readAsDataURL(portfolioImageFile[0]);
    }
  }, [portfolioImageFile]);

  // Reset owner form with portfolio data when opening edit dialog
  useEffect(() => {
    if (editOwnerOpen && portfolio) {
      resetOwner({
        name: portfolio.owner.name || '',
        email: portfolio.owner.email || '',
        username: portfolio.owner.username || user.username,
        job: portfolio.owner.job || '',
        bio: portfolio.owner.bio || '',
        country: portfolio.owner.country || '',
        socials: portfolio.owner.socials || ''
      });
      setPhotoPreview(portfolio.owner.photo ? VITE_BASE_URL + portfolio.owner.photo : null);
      setCvFileName(portfolio.owner.cv ? portfolio.owner.cv.split('/').pop() : null);
    }
  }, [editOwnerOpen, portfolio, resetOwner]);
  
  // Reset portfolio form with portfolio data when opening edit dialog
  useEffect(() => {
    if (editPortfolioOpen && portfolio) {
      resetPortfolio({
        title: portfolio.title || '',
      });
      setPortfolioImagePreview(portfolio.image ? VITE_BASE_URL + portfolio.image : null);
    }
  }, [editPortfolioOpen, portfolio, resetPortfolio]);

  const fetchPortfolio = async () => {
    try {
      const response = await api.get(`/${user.username}/portfolio`);
      setPortfolio(response.data.portfolio);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to load portfolio data', severity: 'error' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPortfolio();
  };

  const handleUpdateOwner = async (data) => {
    try {
      setSubmitting(true);
      const formData = new FormData();

      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('username', data.username);
      formData.append('job', data.job);
      formData.append('bio', data.bio);
      formData.append('country', data.country);      
      
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'photoFile' && value && value.length > 0) {
          formData.append('photo', value[0]);
        } else if (key === 'cvFile' && value && value.length > 0) {
          formData.append('cv', value[0]);
        } else if (key === 'socials' && value) {
          try {
            JSON.parse(value);
            formData.append(key, value);
          } catch (e) {
            throw new Error("Invalid JSON format for socials");
          }
        } else if (value !== undefined && !key.includes('File')) {
          formData.append(key, value);
        }
      });

      const response = await api.post('/portfolio/owner', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setPortfolio(prev => ({ ...prev, owner: response.data.owner }));
      setSnackbar({ open: true, message: 'Profile updated successfully', severity: 'success' });
      setEditOwnerOpen(false);
      setPhotoPreview(null);
      setCvFileName(null);
    } catch (error) {
      console.error(error);
      let errorMessage = 'Update failed';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleUpdatePortfolio = async (data) => {
    try {
      setSubmitting(true);
      const formData = new FormData();
      
      if (data.title) {
        formData.append('title', data.title);
      }
      
      if (data.imageFile && data.imageFile.length > 0) {
        formData.append('image', data.imageFile[0]);
      }

      const response = await api.post('/portfolio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setPortfolio(prev => ({ ...prev, ...response.data.portfolio }));
      setSnackbar({ open: true, message: 'Portfolio updated successfully', severity: 'success' });
      setEditPortfolioOpen(false);
      setPortfolioImagePreview(null);
    } catch (error) {
      console.error(error);
      let errorMessage = 'Update failed';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearPhotoPreview = () => {
    setPhotoPreview(null);
    setOwnerValue('photoFile', null);
  };
  
  const handleClearCvFile = () => {
    setCvFileName(null);
    setOwnerValue('cvFile', null);
  };
  
  const handleClearPortfolioImagePreview = () => {
    setPortfolioImagePreview(null);
    setPortfolioValue('imageFile', null);
  };

  const calculateProgress = (current) => {
    const max = Math.ceil(current * 1.2);
    return Math.min((current / max) * 100, 100);
  };

  const visitorData = [
    { name: 'Total', value: portfolio?.stats.visitors.total || 0 },
    { name: 'Unique', value: portfolio?.stats.visitors.unique || 0 },
    { name: 'Last 7 Days', value: portfolio?.stats.visitors.last_7_days || 0 }
  ];

  const engagementData = [
    { name: 'Total Views', value: portfolio?.stats.engagement.total_views || 0 },
    { name: 'Avg/Project', value: portfolio?.stats.engagement.average_views || 0 }
  ];

  const projectData = portfolio?.stats.engagement.popular_projects.map(project => ({
    name: project.title,
    value: project.views
  })) || [];

  if (loading) return <LoadingSkeleton />;

  return (
    <Box sx={{ 
      flexGrow: 1, 
      p: 6, 
      minHeight: '100vh'
    }}>
      <Helmet>
        <title>{portfolio.owner.name} | Dashboard Overview</title>
      </Helmet>

      <div style={{ maxWidth: '1800px', margin: '0 auto' }}>
        {/* Profile Header */}
        <Paper
          sx={{ 
            p: { xs: 3, md: 4 }, 
            mb: 4, 
            borderRadius: 4,
            background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.12) 0%, rgba(255,255,255,0.9) 100%)',
            boxShadow: '0 10px 40px rgba(31, 38, 135, 0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Background pattern */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '40%',
            height: '100%',
            opacity: 0.05,
            background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%231976d2\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/svg%3E")',
            zIndex: 0
          }} />

          <Grid container spacing={{ xs: 2, md: 4 }} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
            {/* Left Column - Avatar and Buttons */}
            <Grid item xs={12} md={3} sx={{ 
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <Box sx={{
                position: 'relative',
                mb: 3,
                '&:before': {
                  content: '""',
                  position: 'absolute',
                  top: -8,
                  left: -8,
                  right: -8,
                  bottom: -8,
                  background: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)',
                  borderRadius: '50%',
                  opacity: 0.1,
                  animation: 'pulse 3s infinite',
                },
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)', opacity: 0.1 },
                  '50%': { transform: 'scale(1.05)', opacity: 0.15 },
                  '100%': { transform: 'scale(1)', opacity: 0.1 }
                }
              }}>
                <Avatar
                  src={VITE_BASE_URL + portfolio.owner.photo}
                  alt={portfolio.owner.name}
                  sx={{
                    width: { xs: 140, md: 160 },
                    height: { xs: 140, md: 160 }, 
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    border: '4px solid white',
                    position: 'relative'
                  }}
                />

                {/* Status indicator */}
                <Box sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: '#4caf50',
                  border: '3px solid white',
                  position: 'absolute',
                  bottom: 10,
                  right: 10
                }} />
              </Box>

              {/* Action buttons stack */}
              <Stack spacing={2} sx={{ width: '100%' }}>
                <Button 
                  variant="contained"
                  onClick={() => setEditOwnerOpen(true)}
                  startIcon={<Person />}
                  sx={{ 
                    borderRadius: 2,
                    py: 1.2,
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                    '&:hover': {
                      boxShadow: '0 6px 14px rgba(25, 118, 210, 0.4)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                >
                  Edit Owner
                </Button>
                <Button 
                  variant="outlined"
                  onClick={() => setEditPortfolioOpen(true)}
                  startIcon={<Work />}
                  sx={{ 
                    borderRadius: 2,
                    py: 1.2,
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    borderColor: '#1976d2',
                    borderWidth: 2,
                    color: '#1976d2',
                    '&:hover': {
                      borderWidth: 2,
                      borderColor: '#1976d2',
                      backgroundColor: 'rgba(25, 118, 210, 0.04)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'transform 0.2s'
                  }}
                >
                  Edit Portfolio
                </Button>
              </Stack>
              
              {/* Portfolio View button */}
              <Button 
                variant="text"
                startIcon={<Visibility />}
                onClick={() => window.open(`/${portfolio.owner.username}`, '_blank')}
                sx={{ 
                  borderRadius: 2,
                  mt: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'primary.main'
                  }
                }}
              >
                View Public Portfolio
              </Button>
            </Grid>
            
            {/* Right Column - Bio and Info */}
            <Grid item xs={12} md={9}>
              <Box sx={{ position: 'relative' }}>
                {/* Name and Username */}
                <Typography variant="h2" gutterBottom sx={{ 
                  fontWeight: 800, 
                  letterSpacing: -1,
                  fontSize: { xs: '2.2rem', sm: '2.5rem', md: '3rem' },
                  background: 'linear-gradient(45deg, #1565c0, #42a5f5)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5
                }}>
                  {portfolio.owner.name}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="subtitle1" sx={{ 
                    color: 'text.secondary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}>
                    @{portfolio.owner.username}
                  </Typography>
                </Box>
                
                {/* Job title */}
                <Chip 
                  label={portfolio.owner.job || 'No job title'} 
                  icon={<Work fontSize="small" />}
                  sx={{ 
                    mb: 3,
                    px: 2,
                    py: 2.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.12) 0%, rgba(25, 118, 210, 0.06) 100%)',
                    border: '1px solid rgba(25, 118, 210, 0.1)',
                    color: 'primary.dark',
                    '& .MuiChip-icon': {
                      color: 'primary.main'
                    }
                  }}
                />
                
                {/* Bio section */}
                <Box sx={{ 
                  mb: 3, 
                  p: 2.5,
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                }}>
                  <Typography 
                    variant="body1" 
                    paragraph 
                    sx={{ 
                      lineHeight: 1.8, 
                      fontSize: '1.05rem',
                      m: 0,
                      fontWeight: 400,
                      color: 'text.primary',
                      position: 'relative',
                      pl: 2,
                      '&:before': {
                        content: '""',
                        position: 'absolute',
                        left: -4,
                        top: 0,
                        bottom: 0,
                        width: 4,
                        borderRadius: 4,
                        backgroundColor: 'primary.main',
                        opacity: 0.6
                      }
                    }}
                  >
                    {portfolio.owner.bio ? 'Bio available. Professional summary shared.' 
                    : 'No bio available. Add a professional summary to tell visitors about yourself and your expertise.'}
                  </Typography>
                </Box>
              
                {/* Stats row */}
                <Box sx={{ 
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: { xs: 1, sm: 2 },
                  mb: 3
                }}>
                  {[
                    { label: portfolio.owner.country || 'Location', icon: <Public fontSize="small" />, color: 'primary' },
                    { label: portfolio.owner.email || 'Email', icon: <Email fontSize="small" />, color: 'success' },
                    { label: portfolio.owner.cv ? 'CV Available' : 'No CV', icon: <Article fontSize="small" />, color: portfolio.owner.cv ? 'warning' : 'default' },
                  ].map((item, i) => (
                    <Chip 
                      key={i}
                      label={item.label} 
                      icon={item.icon}
                      color={item.color}
                      variant="outlined"
                      sx={{ 
                        borderWidth: 1.5,
                        px: 1,
                        py: 2.5,
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        background: 'rgba(255, 255, 255, 0.7)'
                      }}
                    />
                  ))}
                </Box>
                
                {/* Display socials */}
                {portfolio.owner.socials && (
                  <Box sx={{ mt: 1 }}>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {Object.entries(JSON.parse(portfolio.owner.socials)).map(([platform, url]) => (
                        <Chip 
                          key={platform}
                          label={platform}
                          component="a"
                          href={url}
                          target="_blank"
                          clickable
                          size="medium"
                          icon={<Link fontSize="small" />}
                          sx={{ 
                            backgroundColor: 'rgba(0, 0, 0, 0.05)',
                            '&:hover': {
                              backgroundColor: 'rgba(25, 118, 210, 0.1)'
                            },
                            transition: 'all 0.2s',
                            fontWeight: 500
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Statistics Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { 
              title: 'Projects', 
              value: portfolio.stats.projects,
              icon: <Code sx={{ fontSize: 40, color: 'white' }} />,
              color: '#1976d2',
              progress: calculateProgress(portfolio.stats.projects)
            },
            { 
              title: 'Skills', 
              value: portfolio.stats.skills,
              icon: <Assessment sx={{ fontSize: 40, color: 'white' }} />,
              color: '#4caf50',
              progress: calculateProgress(portfolio.stats.skills)
            },
            { 
              title: 'Achievements', 
              value: portfolio.stats.achievements,
              icon: <EmojiEvents sx={{ fontSize: 40, color: 'white' }} />,
              color: '#ff9800',
              progress: calculateProgress(portfolio.stats.achievements)
            },
            { 
              title: 'Messages', 
              value: portfolio.stats.messages,
              icon: <Mail sx={{ fontSize: 40, color: 'white' }} />,
              color: '#673ab7',
              progress: calculateProgress(portfolio.stats.messages),
            },
            { 
              title: 'Visitors', 
              value: portfolio.stats.visitors.total,
              icon: <People sx={{ fontSize: 40, color: 'white' }} />,
              color: '#e91e63',
              progress: calculateProgress(portfolio.stats.visitors.total),
            }
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}80 100%)`,
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ p: 2, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)' }}>
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography variant="h3" fontWeight={700}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body1">{stat.title}</Typography>
                  </Box>
                </Box>
                
                <CircularProgress 
                  variant="determinate" 
                  value={stat.progress} 
                  size={80}
                  thickness={4}
                  sx={{
                    position: 'absolute',
                    right: -20,
                    bottom: -20,
                    color: 'rgba(255,255,255,0.3)'
                  }}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Analytics Section */}
        <Box sx={{ p: 3, borderRadius: 3, mb: 4, mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight={600}>
              Portfolio Analytics
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <LoadingButton
                onClick={handleRefresh}
                loading={refreshing}
                variant="outlined"
                size="small"
              >
                Refresh Data
              </LoadingButton>
              <Tabs 
                value={activeTab} 
                onChange={(e, newValue) => setActiveTab(newValue)}
                sx={{ minHeight: 36 }}
              >
                <Tab label="Visitors" sx={{ minHeight: 36 }} />
                <Tab label="Engagement" sx={{ minHeight: 36 }} />
                <Tab label="Projects" sx={{ minHeight: 36 }} />
              </Tabs>
            </Box>
          </Box>

          {activeTab === 0 && (
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={visitorData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip 
                    contentStyle={{
                      borderRadius: 8,
                      boxShadow: theme.shadows[3],
                      border: 'none'
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="value" 
                    fill={theme.palette.primary.main}
                    radius={[4, 4, 0, 0]}
                    name="Visitor Count"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          )}

          {activeTab === 1 && (
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip 
                    contentStyle={{
                      borderRadius: 8,
                      boxShadow: theme.shadows[3],
                      border: 'none'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={theme.palette.success.main}
                    strokeWidth={2}
                    dot={{ fill: theme.palette.success.main }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Chip
                  label={`Total Views: ${portfolio.stats.engagement.total_views}`}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={`Avg/Project: ${portfolio.stats.engagement.average_views}`}
                  color="success"
                  variant="outlined"
                />
              </Box>
            </Box>
          )}

          {activeTab === 2 && (
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {projectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    contentStyle={{
                      borderRadius: 8,
                      boxShadow: theme.shadows[3],
                      border: 'none'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          )}
        </Box>

        {/* Popular Projects Section */}
        <Box sx={{ p: 3, borderRadius: 3, mb: 4, mt: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <EmojiEvents /> Top Performing Projects
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            {portfolio.stats.engagement.popular_projects.map((project, index) => (
              <Grid item xs={12} sm={6} md={4} key={index} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Card sx={{ 
                  width: 340,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'translateY(-5px)' }
                }}>
                  <Box sx={{ position: 'relative', flexShrink: 0 }}>
                    <Box
                      component="img"
                      src={project.image || 'https://dn721803.ca.archive.org/0/items/placeholder-image//placeholder-image.jpg'}
                      sx={{
                        height: 180,
                        width: 340,
                        objectFit: 'cover',
                        borderTopLeftRadius: '4px',
                        borderTopRightRadius: '4px'
                      }}
                    />
                    <Chip
                      label={`#${index + 1}`}
                      color="primary"
                      sx={{ 
                        position: 'absolute', 
                        top: 16, 
                        left: 16,
                        fontWeight: 700
                      }}
                    />
                  </Box>
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>{project.title}</Typography>
                    <Box sx={{ mt: 'auto' }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={(project.views / portfolio.stats.engagement.total_views) * 100}
                        sx={{ 
                          height: 8,
                          borderRadius: 4,
                          mb: 1,
                          '& .MuiLinearProgress-bar': { borderRadius: 4 }
                        }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">
                          {project.views} views
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {(project.views / portfolio.stats.engagement.total_views * 100).toFixed(1)}%
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

          {/* Edit Profile Dialog */}
          <Dialog 
            open={editOwnerOpen} 
            onClose={() => setEditOwnerOpen(false)} 
            fullWidth 
            maxWidth="md"
          >
            <form onSubmit={handleOwnerSubmit(handleUpdateOwner)} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Header */}
              <Box sx={{
                background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
                py: 3,
                px: 4,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Typography variant="h6" component="div" sx={{ fontWeight: 700, color: 'white' }}>
                  Edit Profile
                </Typography>
                <IconButton onClick={() => setEditOwnerOpen(false)} sx={{ color: 'white' }}>
                  <Close />
                </IconButton>
              </Box>
              
              {/* Content */}
              <DialogContent sx={{ 
                overflowY: 'auto',
                flexGrow: 1,
                display: 'flex', 
                flexDirection: 'column',
                pt: 4, 
                maxHeight: '60vh' // Force a maximum height
              }}>
              <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' }, mb: 4 }}>
                {/* Profile Photo Section */}
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  p: 3,
                  borderRadius: 2,
                  backgroundColor: 'rgba(25, 118, 210, 0.05)',
                  width: { xs: '100%', md: '30%' },
                  minWidth: { md: '250px' }
                }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight={500}>
                    Profile Photo
                  </Typography>

                  {photoPreview ? (
                    <Box sx={{ position: 'relative', mb: 2 }}>
                      <Avatar 
                        src={photoPreview} 
                        alt="Profile Preview" 
                        sx={{ width: 150, height: 150, boxShadow: 2 }}
                      />
                      <IconButton 
                        size="small"
                        onClick={handleClearPhotoPreview}
                        sx={{ 
                          position: 'absolute', 
                          top: -10, 
                          right: -10, 
                          backgroundColor: 'white',
                          boxShadow: 1,
                          '&:hover': { backgroundColor: '#f5f5f5' }
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  ) : (
                    <Avatar 
                      sx={{ width: 150, height: 150, mb: 2, bgcolor: 'primary.light' }}
                    >
                      <Person sx={{ fontSize: 70 }} />
                    </Avatar>
                  )}

                  <Controller
                    name="photoFile"
                    control={ownerControl}
                    defaultValue=""
                    render={({ field: { value, onChange, ...field } }) => (
                      <Button
                        component="label"
                        variant="outlined"
                        startIcon={<CloudUpload />}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          mt: 2
                        }}
                      >
                        {photoPreview ? 'Change Photo' : 'Upload Photo'}
                        <input
                          {...field}
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) => {
                            onChange(e.target.files);
                          }}
                        />
                      </Button>
                    )}
                  />
                  
                  <Typography variant="caption" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
                    Recommended: Square image, max 2MB
                  </Typography>
                </Box>
                
                {/* CV Upload Section */}
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  p: 3,
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 152, 0, 0.05)',
                  width: { xs: '100%', md: '70%' }
                }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight={500}>
                    CV / Resume
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    borderRadius: 2,
                    border: '1px dashed',
                    borderColor: cvFileName ? 'success.main' : 'divider',
                    backgroundColor: cvFileName ? 'rgba(76, 175, 80, 0.05)' : 'transparent',
                    mb: 2
                  }}>
                    {cvFileName ? (
                      <>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Article color="success" />
                          <Box>
                            <Typography variant="body2" fontWeight={500}>{cvFileName}</Typography>
                            <Typography variant="caption" color="text.secondary">PDF Document</Typography>
                          </Box>
                        </Box>
                        <IconButton size="small" onClick={handleClearCvFile} color="error">
                          <Delete fontSize="small" />
                        </IconButton>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ width: '100%', textAlign: 'center' }}>
                        No CV file selected
                      </Typography>
                    )}
                  </Box>
                  
                  <Controller
                    name="cvFile"
                    control={ownerControl}
                    defaultValue=""
                    render={({ field: { value, onChange, ...field } }) => (
                      <Button
                        component="label"
                        variant="outlined"
                        startIcon={<CloudUpload />}
                        color="warning"
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          alignSelf: 'center'
                        }}
                      >
                        {cvFileName ? 'Replace CV' : 'Upload CV'}
                        <input
                          {...field}
                          type="file"
                          hidden
                          accept=".pdf"
                          onChange={(e) => {
                            onChange(e.target.files);
                          }}
                        />
                      </Button>
                    )}
                  />
                  
                  <Typography variant="caption" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
                    Only PDF files, max 5MB
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              {/* Basic Information */}
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Basic Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="name"
                    control={ownerControl}
                    rules={{ required: 'Name is required' }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Full Name"
                        variant="outlined"
                        error={!!error}
                        helperText={error?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person />
                            </InputAdornment>
                          ),
                          sx: { borderRadius: 2 }
                        }}
                        sx={{ mb: 2 }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="username"
                    control={ownerControl}
                    rules={{ required: 'Username is required' }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Username"
                        variant="outlined"
                        error={!!error}
                        helperText={error?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AccountCircle />
                            </InputAdornment>
                          ),
                          sx: { borderRadius: 2 }
                        }}
                        sx={{ mb: 2 }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="email"
                    control={ownerControl}
                    rules={{ 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Email"
                        variant="outlined"
                        error={!!error}
                        helperText={error?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email />
                            </InputAdornment>
                          ),
                          sx: { borderRadius: 2 }
                        }}
                        sx={{ mb: 2 }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="job"
                    control={ownerControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Job Title"
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Work />
                            </InputAdornment>
                          ),
                          sx: { borderRadius: 2 }
                        }}
                        sx={{ mb: 2 }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="country"
                    control={ownerControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Country"
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Public />
                            </InputAdornment>
                          ),
                          sx: { borderRadius: 2 }
                        }}
                        sx={{ mb: 2 }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="bio"
                    control={ownerControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Bio"
                        variant="outlined"
                        multiline
                        rows={3}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Description sx={{ alignSelf: 'flex-start', mt: 1 }} />
                            </InputAdornment>
                          ),
                          sx: { borderRadius: 2 }
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                <Controller
                  name="socials"
                  control={ownerControl}
                  render={({ field }) => (
                    <SocialLinksField
                      value={field.value}
                      onChange={value => {
                        field.onChange(typeof value === 'string' ? value : JSON.stringify(value))
                      }}
                    />
                  )}
                />
                </Grid>
              </Grid>
              </DialogContent>
    
            {/* Actions */}
            <Box sx={{ 
              p: 3, 
              borderTop: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 2,
              bgcolor: 'background.paper'
            }}>
              <Button 
                onClick={() => setEditOwnerOpen(false)} 
                variant="outlined"
                sx={{
                  px: 4,
                  borderRadius: 2,
                  textTransform: 'none',
                  borderWidth: 2,
                  '&:hover': { borderWidth: 2 }
                }}
              >
                Cancel
              </Button>
              <LoadingButton 
                type="submit" 
                variant="contained"
                loading={submitting}
                sx={{
                  px: 4,
                  borderRadius: 2,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
                  color: 'white'
                }}
              >
                Save Changes
              </LoadingButton>
            </Box>
          </form>
        </Dialog>
        
        {/* Edit Portfolio Dialog */}
        <Dialog 
          open={editPortfolioOpen} 
          onClose={() => setEditPortfolioOpen(false)} 
          fullWidth 
          maxWidth="sm"
        >
          <form onSubmit={handlePortfolioSubmit(handleUpdatePortfolio)} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <Box sx={{
              background: 'linear-gradient(135deg, #673ab7 0%, #9c27b0 100%)',
              py: 3,
              px: 4,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 700, color: 'white' }}>
                Edit Portfolio
              </Typography>
              <IconButton onClick={() => setEditPortfolioOpen(false)} sx={{ color: 'white' }}>
                <Close />
              </IconButton>
            </Box>
            
            {/* Content */}
            <DialogContent sx={{ 
              overflowY: 'auto',
              flexGrow: 1,
              pt: 4, 
              pb: 2,
              maxHeight: '60vh'
            }}>
              {/* Portfolio Image */}
              <Box sx={{ 
                mb: 4, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                p: 3,
                borderRadius: 2,
                backgroundColor: 'rgba(103, 58, 183, 0.05)'
              }}>
                <Typography variant="subtitle1" gutterBottom>
                  Portfolio Cover Image
                </Typography>

                <Box sx={{ 
                  position: 'relative', 
                  width: '100%', 
                  height: 200, 
                  mb: 2,
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider'
                }}>
                  {portfolioImagePreview ? (
                    <>
                      <Box
                        component="img"
                        src={portfolioImagePreview}
                        alt="Portfolio Cover Preview"
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      <IconButton 
                        size="small"
                        onClick={handleClearPortfolioImagePreview}
                        sx={{ 
                          position: 'absolute', 
                          top: 8, 
                          right: 8, 
                          backgroundColor: 'white',
                          boxShadow: 1,
                          '&:hover': { backgroundColor: '#f5f5f5' }
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </>
                  ) : (
                    <Box 
                      sx={{ 
                        width: '100%', 
                        height: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0,0,0,0.04)'
                      }}
                    >
                      <ImageIcon sx={{ fontSize: 50, color: 'text.secondary' }} />
                    </Box>
                  )}
                </Box>

                <Controller
                  name="imageFile"
                  control={portfolioControl}
                  defaultValue=""
                  render={({ field: { value, onChange, ...field } }) => (
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<CloudUpload />}
                      color="secondary"
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none'
                      }}
                    >
                      {portfolioImagePreview ? 'Change Image' : 'Upload Image'}
                      <input
                        {...field}
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => {
                          onChange(e.target.files);
                        }}
                      />
                    </Button>
                  )}
                />
                
                <Typography variant="caption" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
                  Recommended: 1200 × 630 pixels, max 2MB
                </Typography>
              </Box>

              {/* Portfolio Title */}
              <Box sx={{ mb: 3 }}>
                <Controller
                  name="title"
                  control={portfolioControl}
                  rules={{ required: 'Portfolio title is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Portfolio Title"
                      variant="outlined"
                      error={!!error}
                      helperText={error?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Title />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 2 }
                      }}
                    />
                  )}
                />
              </Box>
            </DialogContent>
            
            {/* Actions */}
            <Box sx={{ 
              p: 3, 
              borderTop: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 2,
              bgcolor: 'background.paper'
            }}>
              <Button 
                onClick={() => setEditPortfolioOpen(false)} 
                variant="outlined"
                sx={{
                  px: 4,
                  borderRadius: 2,
                  textTransform: 'none',
                  borderWidth: 2,
                  '&:hover': { borderWidth: 2 }
                }}
              >
                Cancel
              </Button>
              <LoadingButton 
                type="submit" 
                variant="contained"
                loading={submitting}
                color="secondary"
                sx={{
                  px: 4,
                  borderRadius: 2,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #673ab7 0%, #9c27b0 100%)',
                  color: 'white'
                }}
              >
                Save Changes
              </LoadingButton>
            </Box>
          </form>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            severity={snackbar.severity}
            sx={{ 
              borderRadius: 2, 
              boxShadow: 3,
              alignItems: 'center'
            }}
            iconMapping={{
              success: <CheckCircleOutline sx={{ fontSize: 20 }} />,
              error: <ErrorOutline sx={{ fontSize: 20 }} />
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </Box>
  );
};

const LoadingSkeleton = () => (
  <Box sx={{ p: 3 }}>
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3 }} />
      </Grid>
      {[...Array(4)].map((_, i) => (
        <Grid item xs={12} sm={6} md={3} key={i}>
          <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 3 }} />
        </Grid>
      ))}
      <Grid item xs={12}>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
      </Grid>
      <Grid item xs={12} md={8}>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
      </Grid>
      <Grid item xs={12} md={4}>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
      </Grid>
    </Grid>
  </Box>
);