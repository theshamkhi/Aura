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
  IconButton,
  Icon,
  Snackbar,
  TextField,
  Typography,
  Alert,
  useTheme,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useWatch } from 'react-hook-form';

const SkillCard = ({ skill, onEdit, onDelete }) => {
  const theme = useTheme();
  const getIconComponent = () => {
    if (!skill.icon) return null;
    
    if (skill.icon.startsWith('http')) {
      return <img 
        src={skill.icon} 
        alt="skill icon" 
        style={{ width: 64, height: 64, objectFit: 'contain' }}
      />;
    }
    
    if (skill.icon.startsWith('mdi-') || skill.icon.startsWith('Mui')) {
      return <Icon className={skill.icon} style={{ fontSize: 64 }} />;
    }
    
    return <i className={skill.icon} style={{ fontSize: 64 }} />;
  };

  return (
  <Card sx={{ 
    height: '100%', 
    width: 174,
    display: 'flex', 
    flexDirection: 'column',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    '&:hover': {
      transform: 'translateY(-6px)',
      boxShadow: '0 6px 16px rgba(0,0,0,0.15)'
    }
  }}>
    <CardContent sx={{ 
      flexGrow: 1, 
      textAlign: 'center',
      px: 2,
      pt: 3,
      pb: 2
    }}>
      <Box sx={{ 
        mb: 2, 
        height: 120,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderRadius: 2,
        backgroundColor: 'rgba(25, 118, 210, 0.08)',
        mx: 'auto',
        width: '100%',
        transition: 'background-color 0.3s ease',
        '&:hover': {
          backgroundColor: 'rgba(25, 118, 210, 0.12)'
        }
      }}>
        {getIconComponent() || (
          <Typography color="text.secondary">No icon</Typography>
        )}
      </Box>
      <Typography 
        variant="h6" 
        gutterBottom 
        fontWeight="600"
        sx={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '100%'
        }}
      >
        {skill.name}
      </Typography>
      <Chip 
        label={`${skill.projects?.length || 0} projects`} 
        variant="outlined"
        size="small"
        sx={{
          backgroundColor: 'rgba(25, 118, 210, 0.12)',
          fontWeight: 600,
          borderRadius: '6px',
          borderWidth: '1.5px'
        }}
      />
    </CardContent>
    <CardActions sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      p: 1.5,
      borderTop: '1px solid',
      borderColor: 'divider'
    }}>
      <IconButton 
        onClick={() => onEdit(skill)} 
        size="small"
        sx={{ 
          '&:hover': { 
            color: 'primary.main',
            backgroundColor: 'rgba(25, 118, 210, 0.08)'
          },
          transition: 'all 0.3s ease',
          borderRadius: '8px'
        }}
      >
        <Edit fontSize="small" />
      </IconButton>
      <IconButton 
        onClick={() => onDelete(skill)} 
        size="small" 
        sx={{ 
          '&:hover': { 
            color: 'error.main',
            backgroundColor: 'rgba(211, 47, 47, 0.08)'
          },
          transition: 'all 0.3s ease',
          borderRadius: '8px'
        }}
      >
        <Delete fontSize="small" />
      </IconButton>
    </CardActions>
  </Card>
  );
};

export const Skills = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isIconTouched, setIsIconTouched] = useState(false);
  
  const { 
    control, 
    handleSubmit, 
    reset, 
    setValue,
    formState: { errors } 
  } = useForm();

  const nameValue = useWatch({ control, name: 'name' });
  const iconValue = useWatch({ control, name: 'icon' });

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const portfolioId = user?.portfolio?.id;
        if (portfolioId) {
          const response = await api.get(`/portfolio/${portfolioId}/skills`);
          setSkills(response.data.skills);
        }
      } catch (error) {
        setSnackbar({ open: true, message: 'Failed to load skills', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, [user]);

  const generateIconUrl = (name) => {
    if (!name) return '';
    const processedName = name.toLowerCase()
      .replace(/\s+/g, '')
      .replace(/\./g, '')
      .replace(/#/g, 's')
      .replace(/\+/g, 'p');
    return `https://skillicons.dev/icons?i=${processedName}`;
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    reset();
    setSelectedSkill(null);
    setIsIconTouched(false);
  };

  const handleEdit = (skill) => {
    setSelectedSkill(skill);
    const generatedIconUrl = generateIconUrl(skill.name);
    const isAutoIcon = skill.icon === generatedIconUrl;
    reset({
      name: skill.name,
      icon: skill.icon
    });
    setIsIconTouched(!isAutoIcon);
    setOpenDialog(true);
  };

  const handleDeleteClick = (skill) => {
    setSelectedSkill(skill);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/skills/${selectedSkill.id}`);
      setSkills(skills.filter(s => s.id !== selectedSkill.id));
      setSnackbar({ open: true, message: 'Skill deleted', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Delete failed', severity: 'error' });
    }
    setDeleteConfirmOpen(false);
  };

  const onSubmit = async (data) => {
    try {
      const portfolioId = user?.portfolio?.id;
  
      if (selectedSkill) {
        await api.put(`/skills/${selectedSkill.id}`, data);
      } else {
        await api.post('/skills', data);
      }
  
      const skillsResponse = await api.get(`/portfolio/${portfolioId}/skills`);
      setSkills(skillsResponse.data.skills);
  
      setSnackbar({ 
        open: true, 
        message: `Skill ${selectedSkill ? 'updated' : 'created'} successfully`,
        severity: 'success'
      });
      setOpenDialog(false);
    } catch (error) {
      const message = error.response?.data?.message || 'Operation failed';
      setSnackbar({ open: true, message, severity: 'error' });
    }
  };

  useEffect(() => {
    if (nameValue && !isIconTouched) {
      const generatedIconUrl = generateIconUrl(nameValue);
      setValue('icon', generatedIconUrl);
    }
  }, [nameValue, isIconTouched, setValue]);

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
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
            My Skills
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your skills
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
          Add New Skill
        </Button>
      </Box>

      <Grid container spacing={3}>
        {skills.map((skill) => (
          <Grid item key={skill.id} xs={12} sm={6} md={4} lg={3}>
            <SkillCard 
              skill={skill} 
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          </Grid>
        ))}
      </Grid>

      {skills.length === 0 && !loading && (
        <Box sx={{ 
          height: '60vh', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          gap: 2
        }}>
          <Typography variant="h6" color="text.secondary">
            No skills added yet
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<Add />}
            onClick={handleOpenDialog}
          >
            Create First Skill
          </Button>
        </Box>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle variant="h5" fontWeight="600">
          {selectedSkill ? 'Edit Skill' : 'New Skill'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Box sx={{ 
              mb: 3, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              bgcolor: 'action.hover',
              borderRadius: 2,
              p: 2
            }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Icon Preview
              </Typography>
              <Box sx={{ 
                width: 80, 
                height: 80, 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.paper',
                borderRadius: 1
              }}>
                {iconValue ? (
                  iconValue.startsWith('http') ? (
                    <img 
                      src={iconValue} 
                      alt="preview" 
                      style={{ width: 48, height: 48, objectFit: 'contain' }}
                    />
                  ) : (
                    <i className={iconValue} style={{ fontSize: 48 }} />
                  )
                ) : (
                  <Typography color="text.secondary">Preview</Typography>
                )}
              </Box>
            </Box>

            <Controller
              name="name"
              control={control}
              defaultValue=""
              rules={{ required: 'Name is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Skill Name"
                  fullWidth
                  margin="normal"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  sx={{ mb: 3 }}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />

            <Controller
              name="icon"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    if (!isIconTouched) {
                      setIsIconTouched(true);
                    }
                  }}
                  label="Icon Source"
                  fullWidth
                  margin="normal"
                  helperText={
                    <Typography variant="caption" color="text.secondary">
                      Start by typing the skill name to auto-generate the icon URL
                      <br/>• Supported formats:
                      <br/>• Skill name (auto-generates URL)
                      <br/>• Icon class (e.g. fab fa-react)
                      <br/>• Image URL
                      <br/>• Material Icon name (e.g. Code)
                    </Typography>
                  }
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
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
              sx={{ borderRadius: 1 }}
            >
              {selectedSkill ? 'Save Changes' : 'Create Skill'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle variant="h6" fontWeight="600">
          Delete Skill?
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>"{selectedSkill?.name}"</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setDeleteConfirmOpen(false)} 
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            variant="contained" 
            color="error"
            startIcon={<Delete />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.severity} 
          sx={{ width: '100%', boxShadow: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};