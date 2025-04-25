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
  Delete
} from '@mui/icons-material';
import { 
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
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
  Tooltip,
  Tabs,
  Tab,
  useTheme,
  IconButton
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

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL +'/storage/';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const Overview = () => {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOwnerOpen, setEditOwnerOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [activeTab, setActiveTab] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();
  const { control, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm();
  const photoFile = watch('photoFile');
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    fetchPortfolio();
  }, [user]);

  // Create preview when file is selected
  useEffect(() => {
    if (photoFile && photoFile[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(photoFile[0]);
    }
  }, [photoFile]);

  // Reset form with portfolio data when opening edit dialog
  useEffect(() => {
    if (editOwnerOpen && portfolio) {
      reset({
        name: portfolio.owner.name,
        job: portfolio.owner.job,
        bio: portfolio.owner.bio,
        email: portfolio.owner.email,
        country: portfolio.owner.country,
      });
      setPhotoPreview(portfolio.owner.photo);
    }
  }, [editOwnerOpen, portfolio, reset]);

  const fetchPortfolio = async () => {
    try {
      const response = await api.get(`/portfolio/${user.portfolio.id}`);
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
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'photoFile' && value && value.length > 0) {
          formData.append('photo', value[0]);
        } else if (value !== undefined && key !== 'photoFile') {
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
    } catch (error) {
      setSnackbar({ open: true, message: 'Update failed', severity: 'error' });
    }
  };

  const handleClearPhotoPreview = () => {
    setPhotoPreview(null);
    setValue('photoFile', null);
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
            p: 4, 
            mb: 4, 
            borderRadius: 4,
            background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.15) 0%, rgba(255,255,255,1) 100%)',
            boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
              <Avatar
                src={VITE_BASE_URL + portfolio.owner.photo}
                alt={portfolio.owner.name}
                sx={{
                  width: 160,
                  height: 160, 
                  mb: 2,
                  boxShadow: 6,
                  border: '4px solid white'
                }}
              />
              <Button 
                variant="contained"
                onClick={() => setEditOwnerOpen(true)}
                sx={{ 
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '1rem',
                  background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                  color: 'white',
                  boxShadow: '0 4px 14px rgba(25, 118, 210, 0.3)'
                }}
              >
                Edit Profile
              </Button>
            </Grid>
            
            <Grid item xs={12} md={9}>
              <Typography variant="h2" gutterBottom sx={{ 
                fontWeight: 800, 
                letterSpacing: -1,
                background: 'linear-gradient(45deg, #1976d2, #2196f3)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {portfolio.owner.name}
              </Typography>
              <Chip 
                label={portfolio.owner.job} 
                icon={<Work fontSize="small" />}
                sx={{ 
                  mb: 2,
                  px: 2,
                  py: 1,
                  fontSize: '1.1rem',
                  background: 'rgba(25, 118, 210, 0.1)',
                  color: 'primary.dark'
                }}
              />
              <Typography variant="h6" paragraph sx={{ maxWidth: 800, lineHeight: 1.7 }}>
                {portfolio.owner.bio || 'No bio available'}
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                <Chip 
                  label={portfolio.owner.country} 
                  icon={<Public />}
                  sx={{ backgroundColor: 'rgba(25, 118, 210, 0.1)' }}
                />
                <Chip 
                  label={`${portfolio.stats.visitors.total} visitors`} 
                  icon={<Visibility />}
                  sx={{ backgroundColor: 'rgba(76, 175, 80, 0.1)' }}
                />
                <Chip 
                  label={`${portfolio.stats.projects} projects`} 
                  icon={<Code />}
                  sx={{ backgroundColor: 'rgba(103, 58, 183, 0.1)' }}
                />
              </Stack>
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
          <Typography variant="h5" gutterBottom fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmojiEvents /> Top Performing Projects
          </Typography>
          <Grid container spacing={3}>
            {portfolio.stats.engagement.popular_projects.map((project, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ 
                  height: '100%', 
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'translateY(-5px)' }
                }}>
                  <Box sx={{ position: 'relative' }}>
                    <Box
                      component="img"
                      src={project.image || 'https://dn721803.ca.archive.org/0/items/placeholder-image//placeholder-image.jpg'}
                      sx={{
                        height: 180,
                        width: '100%',
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
                  <CardContent>
                    <Typography variant="h6" gutterBottom>{project.title}</Typography>
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
          PaperProps={{
            sx: {
              borderRadius: 3,
              overflow: 'hidden'
            }
          }}
        >
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
          
          <form onSubmit={handleSubmit(handleUpdateOwner)}>
            <DialogContent sx={{ pt: 4, pb: 2 }}>
              {/* Photo Upload Section */}
              <Box sx={{ 
                mb: 4, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                p: 2,
                borderRadius: 2,
                backgroundColor: 'rgba(25, 118, 210, 0.05)'
              }}>
                <Typography variant="subtitle1" gutterBottom>
                  Profile Photo
                </Typography>

                {photoPreview ? (
                  <Box sx={{ position: 'relative', mb: 2 }}>
                    <Avatar 
                      src={photoPreview} 
                      alt="Profile Preview" 
                      sx={{ width: 120, height: 120, boxShadow: 2 }}
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
                    sx={{ width: 120, height: 120, mb: 2, bgcolor: 'primary.light' }}
                  >
                    <Person sx={{ fontSize: 60 }} />
                  </Avatar>
                )}

                <Controller
                  name="photoFile"
                  control={control}
                  defaultValue=""
                  render={({ field: { value, onChange, ...field } }) => (
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<CloudUpload />}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none'
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
              </Box>

              {/* Form Fields */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="name"
                    control={control}
                    defaultValue={portfolio.owner.name}
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
                    name="job"
                    control={control}
                    defaultValue={portfolio.owner.job}
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
                <Grid item xs={12}>
                  <Controller
                    name="bio"
                    control={control}
                    defaultValue={portfolio.owner.bio}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Bio"
                        variant="outlined"
                        multiline
                        rows={4}
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
                <Grid item xs={12} md={6}>
                  <Controller
                    name="email"
                    control={control}
                    defaultValue={portfolio.owner.email}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Email"
                        variant="outlined"
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
                    name="country"
                    control={control}
                    defaultValue={portfolio.owner.country}
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
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3, gap: 2 }}>
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
              <Button 
                type="submit" 
                variant="contained"
                sx={{
                  px: 4,
                  borderRadius: 2,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
                  color: 'white'
                }}
              >
                Save Changes
              </Button>
            </DialogActions>
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