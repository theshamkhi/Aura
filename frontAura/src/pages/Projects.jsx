import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  Add, Edit, Delete, Code, Visibility, Search,
  FilterList, Sort, Image as ImageIcon, GitHub, Language
} from '@mui/icons-material';
import {
  Box, Button, CircularProgress, Dialog,
  TextField, Typography, Chip, Grid,
  IconButton, Card, CardMedia, CardContent,
  CardActions, Paper, Alert, Snackbar,
  FormControl, InputLabel, Select, MenuItem,
  DialogTitle, DialogContent, DialogActions,
  InputAdornment, Tooltip, Pagination,
  Avatar, Badge, Divider, useTheme, alpha,
  Container, Fade, DialogContentText
} from '@mui/material';
import dayjs from 'dayjs';
import { useForm, Controller } from 'react-hook-form';

export const Projects = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [filterOption, setFilterOption] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const projectsPerPage = 8;
  
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      category: '',
      description: '',
      image_url: '',
      date: dayjs().format('YYYY-MM-DD'),
      source_code_url: '',
      live_site_url: '',
      skills: [],
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const portfolioId = user?.portfolio?.id;
        if (portfolioId) {
          const [projectsRes, skillsRes] = await Promise.all([
            api.get(`/portfolio/${portfolioId}/projects`),
            api.get(`/portfolio/${portfolioId}/skills`)
          ]);
          
          setProjects(projectsRes.data.projects);
          setFilteredProjects(projectsRes.data.projects);
          setSkills(skillsRes.data.skills);
        }
      } catch (error) {
        setSnackbar({ open: true, message: 'Failed to load data', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    let result = [...projects];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(project => 
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (filterOption !== 'all') {
      result = result.filter(project => project.category === filterOption);
    }
    
    // Apply sorting
    switch(sortOption) {
      case 'newest':
        result.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'name-asc':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name-desc':
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        break;
    }
    
    setFilteredProjects(result);
    setCurrentPage(1);
  }, [searchTerm, sortOption, filterOption, projects]);

  useEffect(() => {
    if (openDialog && !selectedProject) {
      reset({
        title: '',
        category: '',
        description: '',
        image_url: '',
        date: dayjs().format('YYYY-MM-DD'),
        source_code_url: '',
        live_site_url: '',
        skills: [],
      });
    }
  }, [openDialog, selectedProject, reset]);

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setSelectedProject(null);
  };

  const handleEdit = (project) => {
    setSelectedProject(project);
    reset({
      ...project,
      skills: project.technologies.map(t => t.id),
      date: dayjs(project.date).format('YYYY-MM-DD')
    });
    setOpenDialog(true);
  };

  const handleDeleteClick = (project) => {
    setSelectedProject(project);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/projects/${selectedProject.id}`);
      setProjects(projects.filter(p => p.id !== selectedProject.id));
      setSnackbar({ open: true, message: 'Project deleted', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Delete failed', severity: 'error' });
    }
    setDeleteConfirmOpen(false);
  };

  const onSubmit = async (data) => {
    try {
      const formattedData = {
        ...data,
        skills: data.skills || [],
        date: dayjs(data.date).format('YYYY-MM-DD')
      };

      let response;
      if (selectedProject) {
        response = await api.put(`/projects/${selectedProject.id}`, formattedData);
        setProjects(projects.map(p => p.id === selectedProject.id ? response.data.project : p));
      } else {
        response = await api.post('/projects', formattedData);
        setProjects([...projects, response.data.project]);
      }

      setSnackbar({ 
        open: true, 
        message: `Project ${selectedProject ? 'updated' : 'created'} successfully`,
        severity: 'success'
      });
      setOpenDialog(false);
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Operation failed',
        severity: 'error'
      });
    }
  };

  // Pagination setup
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

  // Get unique categories for filter
  const categories = [...new Set(projects.map(project => project.category))];

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: '50vh'
        }}
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 4,
          pb: 2,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Box>
          <Typography 
            variant="h4" 
            fontWeight="700"
            sx={{ 
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            My Projects
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Showcase your portfolio with detailed project information
          </Typography>
        </Box>
        
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={handleOpenDialog}
          sx={{ 
            borderRadius: 2,
            px: 3,
            py: 1,
            boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            '&:hover': {
              boxShadow: '0 6px 20px rgba(0,118,255,0.39)',
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              opacity: 0.9
            }
          }}
        >
          Add New Project
        </Button>
      </Box>

      {/* Stats summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              background: theme.palette.background.paper,
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
              }
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>Total Projects</Typography>
            <Typography variant="h3" fontWeight="bold">{projects.length}</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              background: theme.palette.background.paper,
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
              }
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>Categories</Typography>
            <Typography variant="h3" fontWeight="bold">{categories.length}</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              background: theme.palette.background.paper,
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
              }
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>Technologies Used</Typography>
            <Typography variant="h3" fontWeight="bold">{skills.length}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              placeholder="Search projects by title, description or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="primary" />
                  </InputAdornment>
                ),
                sx: { 
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.divider
                  }
                }
              }}
              variant="outlined"
              size="medium"
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined" size="medium">
              <InputLabel>Sort by</InputLabel>
              <Select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                label="Sort by"
                startAdornment={
                  <InputAdornment position="start">
                    <Sort fontSize="small" />
                  </InputAdornment>
                }
                sx={{ 
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.divider
                  }
                }}
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
                <MenuItem value="name-asc">Name (A-Z)</MenuItem>
                <MenuItem value="name-desc">Name (Z-A)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined" size="medium">
              <InputLabel>Category</InputLabel>
              <Select
                value={filterOption}
                onChange={(e) => setFilterOption(e.target.value)}
                label="Category"
                startAdornment={
                  <InputAdornment position="start">
                    <FilterList fontSize="small" />
                  </InputAdornment>
                }
                sx={{ 
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.divider
                  }
                }}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Projects Display */}
      {filteredProjects.length > 0 ? (
        <Fade in={!loading}>
          <Box>
            <Grid container spacing={4}>
              {currentProjects.map((project) => (
                <Grid item xs={12} sm={6} md={4} lg={4} key={project.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 2,
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-10px)',
                        boxShadow: '0 20px 30px rgba(0,0,0,0.1)',
                      },
                      border: `1px solid ${theme.palette.divider}`,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    }}
                  >
                    <Box sx={{ position: 'relative', width: '100%', height: 170 }}>
                      <CardMedia
                        component="img"
                        image={project.image_url || 'https://t3.ftcdn.net/jpg/09/84/01/92/360_F_984019250_018E4LeljrJcomcGJ8cMhDGSHe0QWEyF.jpg'}
                        alt={project.title}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                      <Box 
                        sx={{ 
                          position: 'absolute', 
                          top: 0, 
                          right: 0, 
                          m: 1,
                          display: 'flex',
                          gap: 0.5
                        }}
                      >
                        <IconButton 
                          size="small" 
                          onClick={() => handleEdit(project)}
                          sx={{ 
                            backgroundColor: alpha(theme.palette.common.white, 0.9),
                            '&:hover': {
                              backgroundColor: theme.palette.common.white
                            }
                          }}
                        >
                          <Edit fontSize="small" color="primary" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteClick(project)}
                          sx={{ 
                            backgroundColor: alpha(theme.palette.common.white, 0.9),
                            '&:hover': {
                              backgroundColor: theme.palette.common.white
                            }
                          }}
                        >
                          <Delete fontSize="small" color="error" />
                        </IconButton>
                      </Box>
                      
                      <Box 
                        sx={{ 
                          position: 'absolute', 
                          bottom: 0, 
                          left: 0, 
                          m: 1,
                        }}
                      >
                        <Chip 
                          label={project.category} 
                          size="small"
                          sx={{
                            backgroundColor: alpha(theme.palette.common.white, 0.9),
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            fontSize: '0.7rem',
                          }}
                        />
                      </Box>
                    </Box>
                    
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography 
                          variant="h6" 
                          fontWeight="bold"
                          sx={{ mb: 1 }}
                        >
                          {project.title}
                        </Typography>
                        
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                          Completed {dayjs(project.date).format('MMMM YYYY')}
                        </Typography>
                        
                        <Divider sx={{ mb: 2 }} />
                        
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            mb: 2,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.6
                          }}
                        >
                          {project.description}
                        </Typography>
                      </Box>
                      
                      <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ display: 'block', mb: 1 }}>
                        TECHNOLOGIES
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                        {project.technologies.slice(0, 4).map(skill => (
                          <Chip 
                            key={skill.id} 
                            label={skill.name} 
                            size="small" 
                            variant="outlined"
                            sx={{ 
                              borderRadius: 1,
                              '& .MuiChip-label': {
                                px: 1,
                                py: 0.2
                              }
                            }}
                          />
                        ))}
                        {project.technologies.length > 4 && (
                          <Chip 
                            label={`+${project.technologies.length - 4}`} 
                            size="small"
                            sx={{ borderRadius: 1 }}
                          />
                        )}
                      </Box>
                    </CardContent>
                    
                    <Divider />
                    
                    <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        ID: {project.id?project.id : 'N/A'}
                      </Typography>
                      
                      <Box>
                        {project.source_code_url && (
                          <Tooltip title="Source Code">
                            <IconButton
                              href={project.source_code_url}
                              target="_blank"
                              size="small"
                              color="primary"
                              sx={{ mr: 1 }}
                            >
                              <GitHub fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {project.live_site_url && (
                          <Tooltip title="Live Demo">
                            <IconButton
                              href={project.live_site_url}
                              target="_blank"
                              size="small"
                              color="primary"
                            >
                              <Language fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(event, value) => setCurrentPage(value)}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                  shape="rounded"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      borderRadius: 1,
                    }
                  }}
                />
              </Box>
            )}
          </Box>
        </Fade>
      ) : (
        <Paper 
          elevation={0}
          sx={{ 
            p: 6, 
            textAlign: 'center',
            borderRadius: 2,
            border: `1px dashed ${theme.palette.divider}`,
            backgroundColor: alpha(theme.palette.background.paper, 0.7)
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                mx: 'auto', 
                mb: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main
              }}
            >
              <ImageIcon sx={{ fontSize: 40 }} />
            </Avatar>
            
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              No projects found
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
              {searchTerm || filterOption !== 'all' ? 
                'No projects match your current search criteria. Try adjusting your filters or search term.' : 
                'Start building your portfolio by adding your first project. Showcase your skills and experience with detailed project information.'
              }
            </Typography>
          </Box>
          
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            onClick={handleOpenDialog}
            size="large"
            sx={{ 
              borderRadius: 2,
              px: 4,
              py: 1,
              boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)'
            }}
          >
            Create Your First Project
          </Button>
        </Paper>
      )}

      {/* Project Form Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        fullWidth 
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.default,
          py: 2.5
        }}>
          <Typography variant="h6" fontWeight="bold">
            {selectedProject ? 'Edit Project Details' : 'Create New Project'}
          </Typography>
        </DialogTitle>

        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ py: 3 }}>
            <Grid container spacing={3}>
              {/* Title & Category */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="title"
                  control={control}
                  rules={{ required: 'Title is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Project Title"
                      placeholder="Enter project title"
                      fullWidth
                      error={!!errors.title}
                      helperText={errors.title?.message}
                      variant="outlined"
                      InputProps={{
                        sx: { borderRadius: 1 }
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: 'Category is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Category"
                      placeholder="e.g. Web Development, Mobile App"
                      fullWidth
                      error={!!errors.category}
                      helperText={errors.category?.message}
                      variant="outlined"
                      InputProps={{
                        sx: { borderRadius: 1 }
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  rules={{ required: 'Description is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Project Description"
                      placeholder="Describe your project, its features and challenges"
                      fullWidth
                      multiline
                      rows={4}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                      variant="outlined"
                      InputProps={{
                        sx: { borderRadius: 1 }
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Image & Date */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="image_url"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Project Image URL"
                      placeholder="https://example.com/image.jpg"
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <ImageIcon fontSize="small" />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 1 }
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="date"
                  control={control}
                  rules={{ required: 'Date is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Completion Date"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.date}
                      helperText={errors.date?.message}
                      variant="outlined"
                      InputProps={{
                        sx: { borderRadius: 1 }
                      }}
                    />
                  )}
                />
              </Grid>

              {/* URLs */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="source_code_url"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Source Code URL"
                      placeholder="GitHub repository link"
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <GitHub fontSize="small" />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 1 }
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="live_site_url"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Live Demo URL"
                      placeholder="Live project URL"
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Language fontSize="small" />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 1 }
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Technologies */}
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Select the technologies used in this project
                </Typography>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Technologies Used</InputLabel>
                  <Controller
                    name="skills"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        multiple
                        label="Technologies Used"
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => {
                              const skill = skills.find(s => s.id === value);
                              return (
                                <Chip 
                                  key={value} 
                                  label={skill?.name} 
                                  size="small"
                                  sx={{ borderRadius: 1 }}
                                />
                              );
                            })}
                          </Box>
                        )}
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 240
                            }
                          }
                        }}
                        sx={{ 
                          borderRadius: 1,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.divider
                          }
                        }}
                      >
                        {skills.map((skill) => (
                          <MenuItem key={skill.id} value={skill.id}>
                            {skill.name}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Button 
              onClick={() => setOpenDialog(false)}
              variant="outlined"
              sx={{ borderRadius: 1 }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              sx={{ 
                borderRadius: 1,
                px: 3
              }}
            >
              {selectedProject ? 'Update Project' : 'Create Project'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteConfirmOpen} 
        onClose={() => setDeleteConfirmOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${theme.palette.divider}`,
          py: 2
        }}>
          <Typography variant="h6">Delete Project</Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, pb: 1 }}>
          <DialogContentText>
            Are you sure you want to delete <strong>{selectedProject?.title}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={() => setDeleteConfirmOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 1 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error"
            variant="contained"
            sx={{ borderRadius: 1 }}
          >
            Delete Project
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          variant="filled"
          elevation={6}
          sx={{ width: '100%', borderRadius: 1 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};