import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  LibraryBooks,
  Title,
  Category,
  Description,
  CalendarToday,
  Code,
  Workspaces,
  Image as ImageIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Typography,
  Chip,
  Grid,
  IconButton,
  Paper,
  Alert
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add, Edit, Delete, Link as LinkIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import dayjs from 'dayjs';

export const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { control, handleSubmit, reset, formState: { errors } } = useForm();

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

  const columns = [
    { field: 'title', headerName: 'Title', flex: 1 },
    { field: 'category', headerName: 'Category', width: 150 },
    { 
      field: 'date', 
      headerName: 'Date', 
      width: 120,
      valueFormatter: (params) => dayjs(params.value).format('MMM YYYY')
    },
    {
      field: 'technologies',
      headerName: 'Technologies',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {params.value.map(skill => (
            <Chip key={skill.id} label={skill.name} size="small" />
          ))}
        </Box>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => handleEdit(params.row)}>
            <Edit fontSize="small" />
          </IconButton>
          <IconButton onClick={() => handleDeleteClick(params.row)}>
            <Delete fontSize="small" color="error" />
          </IconButton>
        </Box>
      )
    }
  ];

  const handleOpenDialog = () => {
    setOpenDialog(true);
    reset();
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

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Manage Projects</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenDialog}>
          New Project
        </Button>
      </Box>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={projects}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          disableSelectionOnClick
          getRowId={(row) => row.id}
        />
      </Paper>

    {/* Project Form Dialog */}
    <Dialog 
      open={openDialog} 
      onClose={() => setOpenDialog(false)} 
      fullWidth 
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 4,
          background: 'linear-gradient(to bottom right, #f8f9fa, #ffffff)'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: 'primary.main', 
        color: 'white',
        py: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <LibraryBooks fontSize="large" />
        <Typography variant="h6" component="div">
          {selectedProject ? 'Edit Project' : 'New Project'}
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ pt: 4, pb: 2 }}>
          <Grid container spacing={3}>
            {/* Title Field */}
            <Grid item xs={12} md={6}>
              <Controller
                name="title"
                control={control}
                defaultValue=""
                rules={{ required: 'Title is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Title"
                    fullWidth
                    variant="outlined"
                    size="small"
                    error={!!errors.title}
                    helperText={errors.title?.message}
                    InputProps={{
                      startAdornment: <Title fontSize="small" color="action" sx={{ mr: 1 }} />
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'background.paper'
                      }
                    }}
                  />
                )}
              />
            </Grid>

            {/* Category Field */}
            <Grid item xs={12} md={6}>
              <Controller
                name="category"
                control={control}
                defaultValue=""
                rules={{ required: 'Category is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Category"
                    fullWidth
                    variant="outlined"
                    size="small"
                    error={!!errors.category}
                    helperText={errors.category?.message}
                    InputProps={{
                      startAdornment: <Category fontSize="small" color="action" sx={{ mr: 1 }} />
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'background.paper'
                      }
                    }}
                  />
                )}
              />
            </Grid>

            {/* Description Field */}
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                defaultValue=""
                rules={{ required: 'Description is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    size="small"
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    InputProps={{
                      startAdornment: <Description fontSize="small" color="action" sx={{ mr: 1, mt: 1.5 }} />
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'background.paper'
                      },
                      '& textarea': {
                        resize: 'vertical'
                      }
                    }}
                  />
                )}
              />
            </Grid>

            {/* Image URL Field */}
            <Grid item xs={12} md={6}>
              <Controller
                name="image_url"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Featured Image URL"
                    fullWidth
                    variant="outlined"
                    size="small"
                    InputProps={{
                      startAdornment: <ImageIcon fontSize="small" color="action" sx={{ mr: 1 }} />,
                      endAdornment: (
                        <IconButton 
                          size="small" 
                          onClick={() => window.open(field.value, '_blank')}
                          disabled={!field.value}
                        >
                          <LinkIcon fontSize="small" />
                        </IconButton>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'background.paper'
                      }
                    }}
                  />
                )}
              />
            </Grid>

            {/* Date Field */}
            <Grid item xs={12} md={6}>
              <Controller
                name="date"
                control={control}
                defaultValue={dayjs().format('YYYY-MM-DD')}
                rules={{ required: 'Date is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Project Date"
                    type="date"
                    fullWidth
                    variant="outlined"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.date}
                    helperText={errors.date?.message}
                    InputProps={{
                      startAdornment: <CalendarToday fontSize="small" color="action" sx={{ mr: 1 }} />
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'background.paper'
                      }
                    }}
                  />
                )}
              />
            </Grid>

            {/* URL Fields */}
            {['source_code_url', 'live_site_url'].map((fieldName, index) => (
              <Grid item xs={12} md={6} key={fieldName}>
                <Controller
                  name={fieldName}
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      fullWidth
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: <Code fontSize="small" color="action" sx={{ mr: 1 }} />,
                        endAdornment: (
                          <IconButton 
                            size="small" 
                            onClick={() => window.open(field.value, '_blank')}
                            disabled={!field.value}
                          >
                            <LinkIcon fontSize="small" />
                          </IconButton>
                        )
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'background.paper'
                        }
                      }}
                    />
                  )}
                />
              </Grid>
            ))}

            {/* Technologies Select */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel shrink>Technologies Used</InputLabel>
                <Controller
                  name="skills"
                  control={control}
                  defaultValue={[]}
                  render={({ field }) => (
                    <Select
                      {...field}
                      multiple
                      variant="outlined"
                      size="small"
                      label="Technologies Used"
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => {
                            const skill = skills.find(s => s.id === value);
                            return (
                              <Chip
                                key={value}
                                label={skill?.name}
                                sx={{
                                  backgroundColor: 'primary.light',
                                  color: 'white',
                                  '& .MuiChip-deleteIcon': { color: 'white' }
                                }}
                              />
                            );
                          })}
                        </Box>
                      )}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            maxHeight: 300,
                            borderRadius: 2,
                            mt: 1
                          }
                        }
                      }}
                      sx={{
                        borderRadius: 2,
                        backgroundColor: 'background.paper',
                        '& .MuiSelect-select': { py: 1.5 }
                      }}
                    >
                      {skills.map((skill) => (
                        <MenuItem 
                          key={skill.id} 
                          value={skill.id}
                          sx={{
                            '&.Mui-selected': { 
                              backgroundColor: 'primary.light',
                              color: 'white',
                              '&:hover': { backgroundColor: 'primary.main' }
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Workspaces fontSize="small" />
                            {skill.name}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 4, pb: 3, gap: 2 }}>
          <Button 
            onClick={() => setOpenDialog(false)}
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
              boxShadow: 'none',
              '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }
            }}
          >
            {selectedProject ? 'Update Project' : 'Create Project'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete "{selectedProject?.title}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};