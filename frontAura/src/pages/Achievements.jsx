import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  EmojiEvents,
  Title,
  Description,
  CalendarToday,
  Image as ImageIcon,
  Add,
  Edit,
  Delete,
  Link as LinkIcon
} from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  TextField,
  Typography,
  Chip,
  Grid,
  IconButton,
  Card,
  useTheme,
  CardHeader,
  CardMedia,
  CardContent,
  CardActions,
  Alert,
  Container,
  Paper,
  Divider,
  Fade,
  alpha
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import dayjs from 'dayjs';

export const Achievements = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { control, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const username = user?.username;
        if (username) {
          const response = await api.get(`/${username}/achievements`);
          setAchievements(response.data.achievements);
        }
      } catch (error) {
        setSnackbar({ open: true, message: 'Failed to load achievements', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [user]);

  const handleOpenDialog = () => {
    setOpenDialog(true);
    reset();
    setSelectedAchievement(null);
  };

  const handleEdit = (achievement) => {
    setSelectedAchievement(achievement);
    reset({
      ...achievement,
      date: dayjs(achievement.date).format('YYYY-MM-DD')
    });
    setOpenDialog(true);
  };

  const handleDeleteClick = (achievement) => {
    setSelectedAchievement(achievement);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/achievements/${selectedAchievement.id}`);
      setAchievements(achievements.filter(a => a.id !== selectedAchievement.id));
      setSnackbar({ open: true, message: 'Achievement deleted successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Delete operation failed', severity: 'error' });
    }
    setDeleteConfirmOpen(false);
  };

  const onSubmit = async (data) => {
    try {
      const formattedData = {
        ...data,
        date: dayjs(data.date).format('YYYY-MM-DD')
      };

      let response;
      if (selectedAchievement) {
        response = await api.put(`/achievements/${selectedAchievement.id}`, formattedData);
        setAchievements(achievements.map(a => a.id === selectedAchievement.id ? response.data.achievement : a));
      } else {
        response = await api.post('/achievements', formattedData);
        setAchievements([...achievements, response.data.achievement]);
      }

      setSnackbar({ 
        open: true, 
        message: `Achievement ${selectedAchievement ? 'updated' : 'created'} successfully`,
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

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <CircularProgress size={60} thickness={4} />
    </Box>
  );

  return (
  <Container maxWidth="lg" sx={{ py: 4 }}>
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
          My Achievements
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Showcase your accomplishments and milestones
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
        Add New Achievement
      </Button>
    </Box>

    <Box sx={{ p: 4 }}>
      {achievements.length > 0 ? (
        <Grid container spacing={3} sx={{ maxWidth: '1280px', mx: 'auto' }}>
          {achievements.map((achievement, index) => (
            <Grid item xs={12} sm={6} md={6} lg={6} key={achievement.id} sx={{ 
              display: 'flex',
              width: { xs: '100%', sm: 'calc(33% - 24px)', md: 'calc(33% - 24px)', lg: 'calc(33% - 24px)' }
            }}>
              <Fade in={true} timeout={500} style={{ transitionDelay: `${index * 100}ms` }}>
                <Box sx={{
                  width: '100%',
                  maxWidth: '100%'
                }}>
                  <Card sx={{
                    width: '100%',
                    height: '400px',
                    borderRadius: 3,
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: theme.shadows[3],
                    '&:hover': {
                      boxShadow: theme.shadows[6],
                      transform: 'translateY(-8px)'
                    },
                    bgcolor: 'background.paper',
                    display: 'flex',
                    flexDirection: 'column',
                    boxSizing: 'border-box'
                  }}>
                    <Box sx={{ 
                      position: 'relative', 
                      height: '200px', 
                      flexShrink: 0,
                      overflow: 'hidden'
                    }}>
                      <CardMedia
                        component="img"
                        image={achievement.image_url || 'https://t3.ftcdn.net/jpg/09/84/01/92/360_F_984019250_018E4LeljrJcomcGJ8cMhDGSHe0QWEyF.jpg'}
                        alt={achievement.title}
                        sx={{
                          objectFit: 'cover',
                          height: '100%',
                          width: '100%'
                        }}
                      />
                      <Box sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        display: 'flex',
                        gap: 1
                      }}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleEdit(achievement)}
                          sx={{ 
                            bgcolor: alpha(theme.palette.background.paper, 0.95),
                            backdropFilter: 'blur(4px)',
                            '&:hover': { bgcolor: theme.palette.background.paper }
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteClick(achievement)}
                          sx={{ 
                            bgcolor: alpha(theme.palette.background.paper, 0.95),
                            backdropFilter: 'blur(4px)',
                            '&:hover': { 
                              bgcolor: theme.palette.background.paper,
                              color: theme.palette.error.main 
                            }
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                      <Chip
                        label={dayjs(achievement.date).format('MMMM YYYY')}
                        icon={<CalendarToday fontSize="small" />}
                        sx={{
                          position: 'absolute',
                          bottom: 12,
                          left: 12,
                          bgcolor: alpha(theme.palette.background.paper, 0.95),
                          backdropFilter: 'blur(4px)',
                          fontWeight: 600,
                          boxShadow: theme.shadows[1],
                          '& .MuiChip-icon': {
                            color: theme.palette.primary.main
                          }
                        }}
                      />
                    </Box>
                    <CardContent sx={{ 
                      flexGrow: 1, 
                      p: 2.5,
                      display: 'flex',
                      flexDirection: 'column',
                      height: '200px',
                      overflow: 'hidden',
                      boxSizing: 'border-box',
                      maxWidth: '100%'
                    }}>
                      <Typography 
                        variant="h6" 
                        fontWeight="700" 
                        sx={{ 
                          color: 'text.primary',
                          height: '64px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          mb: 1,
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                          textOverflow: 'ellipsis',
                          maxWidth: '100%'
                        }}
                      >
                        {achievement.title}
                      </Typography>
                      <Divider sx={{ 
                        mb: 2, 
                        width: '48px', 
                        height: '2px', 
                        bgcolor: 'primary.main',
                        borderRadius: 2,
                        flexShrink: 0
                      }} />
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                          height: '72px',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: 1.5,
                          fontSize: '0.875rem',
                          flexGrow: 1,
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                          textOverflow: 'ellipsis',
                          maxWidth: '100%'
                        }}
                      >
                        {achievement.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Fade>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ 
          height: 'calc(100vh - 160px)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          px: 2
        }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 4,
              bgcolor: alpha(theme.palette.background.paper, 0.9),
              backdropFilter: 'blur(12px)',
              width: '100%',
              maxWidth: '600px',
              textAlign: 'center',
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <EmojiEvents sx={{ 
              fontSize: 80, 
              color: alpha(theme.palette.text.secondary, 0.3), 
              mb: 2,
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.08))'
            }} />
            <Typography variant="h5" color="text.primary" gutterBottom fontWeight="700">
              No Achievements Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Showcase your accomplishments by adding your first achievement
            </Typography>
            <Button
              variant="contained"
              onClick={handleOpenDialog}
              startIcon={<Add />}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1,
                fontWeight: 600,
                textTransform: 'none',
                transition: 'all 0.2s ease',
                boxShadow: theme.shadows[2],
                '&:hover': {
                  boxShadow: theme.shadows[4],
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Add Achievement
            </Button>
          </Paper>
        </Box>
      )}
    </Box>

    {/* Achievement Form Dialog */}
    <Dialog 
      open={openDialog} 
      onClose={() => setOpenDialog(false)} 
      fullWidth 
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: theme.palette.mode === 'dark'
            ? `linear-gradient(to bottom right, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.8)})`
            : 'linear-gradient(to bottom right, #f8f9fa, #ffffff)',
          backdropFilter: 'blur(10px)',
          overflow: 'hidden'
        }
      }}
      TransitionComponent={Fade}
      transitionDuration={300}
    >
      <DialogTitle sx={{ 
        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
        color: 'white',
        py: 2.5,
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <EmojiEvents fontSize="large" />
        <Typography variant="h6" component="div" fontWeight="600">
          {selectedAchievement ? 'Edit Achievement' : 'New Achievement'}
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
                defaultValue={selectedAchievement?.title || ""}
                rules={{ required: 'Title is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Achievement Title"
                    fullWidth
                    variant="outlined"
                    error={!!errors.title}
                    helperText={errors.title?.message}
                    InputProps={{
                      startAdornment: <Title fontSize="small" color="action" sx={{ mr: 1 }} />
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.background.paper, 0.6)
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
                defaultValue={selectedAchievement?.date || dayjs().format('YYYY-MM-DD')}
                rules={{ required: 'Date is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Achievement Date"
                    type="date"
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.date}
                    helperText={errors.date?.message}
                    InputProps={{
                      startAdornment: <CalendarToday fontSize="small" color="action" sx={{ mr: 1 }} />
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.background.paper, 0.6)
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
                defaultValue={selectedAchievement?.description || ""}
                rules={{ required: 'Description is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    InputProps={{
                      startAdornment: <Description fontSize="small" color="action" sx={{ mr: 1, mt: 1.5 }} />
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.background.paper, 0.6)
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
            <Grid item xs={12}>
              <Controller
                name="image_url"
                control={control}
                defaultValue={selectedAchievement?.image_url || ""}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Image URL"
                    placeholder="https://example.com/image.jpg"
                    fullWidth
                    variant="outlined"
                    InputProps={{
                      startAdornment: <ImageIcon fontSize="small" color="action" sx={{ mr: 1 }} />,
                      endAdornment: field.value && (
                        <IconButton 
                          size="small" 
                          onClick={() => window.open(field.value, '_blank')}
                          disabled={!field.value}
                          sx={{ color: theme.palette.primary.main }}
                        >
                          <LinkIcon fontSize="small" />
                        </IconButton>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.background.paper, 0.6)
                      }
                    }}
                  />
                )}
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, ml: 1 }}>
                Add a URL to an image that represents your achievement
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 4, py: 3, gap: 2 }}>
          <Button 
            onClick={() => setOpenDialog(false)}
            variant="outlined"
            sx={{
              px: 4,
              py: 1,
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
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
              '&:hover': { 
                boxShadow: `0 6px 15px ${alpha(theme.palette.primary.main, 0.4)}`,
                background: `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
              }
            }}
          >
            {selectedAchievement ? 'Update Achievement' : 'Create Achievement'}
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
          borderRadius: 3,
          overflow: 'hidden'
        }
      }}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle sx={{ bgcolor: theme.palette.error.light, color: theme.palette.error.contrastText }}>
        Confirm Delete
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Typography variant="body1">
          Are you sure you want to delete "<strong>{selectedAchievement?.title}</strong>"?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={() => setDeleteConfirmOpen(false)}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleDeleteConfirm} 
          color="error" 
          variant="contained"
          sx={{ 
            borderRadius: 2,
            boxShadow: 'none',
            '&:hover': { 
              boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}` 
            } 
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>

    {/* Snackbar Notifications */}
    <Snackbar
      open={snackbar.open}
      autoHideDuration={5000}
      onClose={() => setSnackbar(s => ({ ...s, open: false }))}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      TransitionComponent={Fade}
    >
      <Alert 
        severity={snackbar.severity}
        variant="filled"
        sx={{ 
          width: '100%',
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  </Container>
  );
};