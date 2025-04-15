import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
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
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="md">
        <DialogTitle>{selectedProject ? 'Edit Project' : 'New Project'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={3}>
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
                      margin="normal"
                      error={!!errors.title}
                      helperText={errors.title?.message}
                    />
                  )}
                />
              </Grid>

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
                      margin="normal"
                      error={!!errors.category}
                      helperText={errors.category?.message}
                    />
                  )}
                />
              </Grid>

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
                      margin="normal"
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="image_url"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Image URL"
                      fullWidth
                      margin="normal"
                      InputProps={{
                        endAdornment: <LinkIcon />
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="date"
                  control={control}
                  defaultValue={dayjs().format('YYYY-MM-DD')}
                  rules={{ required: 'Date is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Date"
                      type="date"
                      fullWidth
                      margin="normal"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.date}
                      helperText={errors.date?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="source_code_url"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Source Code URL"
                      fullWidth
                      margin="normal"
                      InputProps={{
                        endAdornment: <LinkIcon />
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="live_site_url"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Live Site URL"
                      fullWidth
                      margin="normal"
                      InputProps={{
                        endAdornment: <LinkIcon />
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Technologies</InputLabel>
                  <Controller
                    name="skills"
                    control={control}
                    defaultValue={[]}
                    render={({ field }) => (
                      <Select
                        {...field}
                        multiple
                        label="Technologies"
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                              <Chip 
                                key={value} 
                                label={skills.find(s => s.id === value)?.name} 
                              />
                            ))}
                          </Box>
                        )}
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
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {selectedProject ? 'Update' : 'Create'}
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