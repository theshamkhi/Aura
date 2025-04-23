import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  Box,
  Button,
  Grid,
  Paper,
  Typography,
  Avatar,
  Chip,
  Alert,
  Snackbar,
  Skeleton,
  useMediaQuery,
  useTheme,
  alpha
} from '@mui/material';
import {
  Delete,
  Email,
  LocationOn,
  AccessTime,
    ChatBubbleOutline,
    CheckCircleOutline,
    ErrorOutline,
  Message as MessageIcon,
  ArrowBack,
} from '@mui/icons-material';
import dayjs from 'dayjs';

export const Messages = () => {

  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Real-time updates with polling
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await api.get('/messages');
        setMessages(response.data.messages);
      } catch (error) {
        setSnackbar({ open: true, message: 'Failed to load messages', severity: 'error' });
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (message) => {
    try {
      await api.delete(`/messages/${message.id}`);
      setMessages(messages.filter(m => m.id !== message.id));
      setSnackbar({ open: true, message: 'Message deleted', severity: 'success' });
      setSelectedMessage(null);
    } catch (error) {
      setSnackbar({ open: true, message: 'Delete failed', severity: 'error' });
    }
  };

  const handleMessageClick = async (message) => {
    if (isMobile) {
      setDetailsLoading(true);
      setTimeout(() => setDetailsLoading(false), 500); // Simulate loading
    }
    setSelectedMessage(message);
  };

  const MessageCard = ({ message }) => (
    <Paper 
      sx={{ 
        p: 2.5,
        mb: 2,
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        backgroundColor: 'background.paper',
        border: selectedMessage?.id === message.id ? '2px solid' : 'none',
        borderColor: theme => alpha(theme.palette.primary.main, 0.2),
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: theme => `0 12px 24px ${alpha(theme.palette.primary.main, 0.1)}`,
        }
      }}
      onClick={() => handleMessageClick(message)}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ 
          bgcolor: 'transparent',
          background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
          color: 'white',
          width: 40,
          height: 40,
          fontSize: '1rem',
        }}>
          {message?.sender_name?.[0]?.toUpperCase() || '?'}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1" fontWeight="600" color="text.primary">
            {message.sender_name || 'Unknown sender'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
            <Email fontSize="small" sx={{ color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {message.sender_email || 'No email provided'}
            </Typography>
          </Box>
        </Box>
        <Chip 
          label={dayjs(message.received_at).format('MMM D')}
          icon={<AccessTime fontSize="small" sx={{ color: 'inherit' }} />}
          variant="outlined"
          size="small"
          sx={{ 
            borderColor: 'divider',
            color: 'text.secondary',
            bgcolor: 'background.default',
          }}
        />
      </Box>
      
      <Typography 
        sx={{ 
          mt: 1.5,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          color: 'text.secondary',
          lineHeight: 1.6,
          fontSize: '0.875rem',
        }}
      >
        {message.message}
      </Typography>
      
      <Box sx={{ mt: 1.5, display: 'flex', gap: 1, alignItems: 'center' }}>
        <LocationOn fontSize="small" sx={{ color: 'text.secondary' }} />
        <Typography variant="caption" color="text.secondary">
          {message.visitor?.country || 'Unknown location'}
          {message.visitor?.city && `, ${message.visitor.city}`}
        </Typography>
      </Box>
    </Paper>
  );

  const MessageDetails = ({ message, loading, onClose }) => (
    <Paper 
      sx={{ 
        height: '100%',
        p: { xs: 2.5, md: 4 },
        borderRadius: '16px',
        backgroundColor: 'background.paper',
        boxShadow: theme => `0 24px 48px ${alpha(theme.palette.primary.main, 0.05)}`,
        position: 'relative',
      }}
    >
      {isMobile && (
        <Button 
          onClick={onClose}
          startIcon={<ArrowBack />}
          sx={{ 
            mb: 3,
            position: 'sticky',
            top: 0,
            backgroundColor: 'background.default',
            backdropFilter: 'blur(8px)',
            zIndex: 1,
          }}
        >
          Back to list
        </Button>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Skeleton variant="rectangular" width="100%" height={120} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 2 }} />
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
            <Avatar sx={{ 
              width: 72, 
              height: 72, 
              fontSize: 28,
              background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
            }}>
              {message?.sender_name?.[0]?.toUpperCase() || '?'}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="700" color="text.primary">
                {message?.sender_name || 'Unknown sender'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Email fontSize="small" sx={{ color: 'text.secondary' }} />
                <Typography variant="body1" color="text.secondary">
                  {message?.sender_email || 'No email provided'}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ 
                p: 2,
                borderRadius: '12px',
                bgcolor: 'background.default',
                border: '1px solid',
                borderColor: 'divider',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LocationOn fontSize="large" sx={{ color: 'primary.main' }} />
                  <Box>
                    <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                      Location
                    </Typography>
                    <Typography variant="h6" color="text.primary">
                      {message?.visitor?.country || 'Unknown'}
                      {message?.visitor?.city && `, ${message.visitor.city}`}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ 
                p: 2,
                borderRadius: '12px',
                bgcolor: 'background.default',
                border: '1px solid',
                borderColor: 'divider',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AccessTime fontSize="large" sx={{ color: 'primary.main' }} />
                  <Box>
                    <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                      Received
                    </Typography>
                    <Typography variant="h6" color="text.primary">
                      {dayjs(message?.received_at).format('MMM D, YYYY h:mm A')}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          <Paper sx={{ 
            p: 3,
            borderRadius: '12px',
            bgcolor: 'background.default',
            border: '1px solid',
            borderColor: 'divider',
          }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2, color: 'text.primary' }}>
              Message Content
            </Typography>
            <Typography 
              sx={{ 
                whiteSpace: 'pre-wrap',
                lineHeight: 1.7,
                color: 'text.secondary',
                fontSize: '1rem',
              }}
            >
              {message?.message}
            </Typography>
          </Paper>

          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={() => handleDelete(message)}
              sx={{ 
                borderRadius: '8px',
                px: 4,
                '&:hover': {
                  backgroundColor: theme => alpha(theme.palette.error.main, 0.08),
                }
              }}
            >
              Delete Message
            </Button>
          </Box>
        </>
      )}
    </Paper>
  );

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="800" sx={{ mb: 0.5, color: 'text.primary' }}>
          Visitor Messages
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ChatBubbleOutline fontSize="small" />
          {messages.length} message{messages.length !== 1 ? 's' : ''} received
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={selectedMessage && !isMobile ? 5 : 12}>
          {messages.length > 0 ? (
            <Box>
              {messages.map(message => (
                <MessageCard key={message.id} message={message} />
              ))}
            </Box>
          ) : (
            <Box 
              sx={{ 
                height: '60vh', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                textAlign: 'center',
                gap: 2
              }}
            >
                <MessageIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 1 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    No messages yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
                    Your visitors' messages will appear here once they start reaching out
                </Typography>
            </Box>
            )}
        </Grid>

        {selectedMessage && (
          <Grid item xs={12} md={7}>
            <MessageDetails 
              message={selectedMessage} 
              loading={detailsLoading}
              onClose={() => setSelectedMessage(null)} 
            />
          </Grid>
        )}
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity}
          sx={{
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
            alignItems: 'center',
            backdropFilter: 'blur(12px)',
            backgroundColor: theme => alpha(theme.palette.background.default, 0.9),
          }}
          iconMapping={{
            success: <CheckCircleOutline fontSize="inherit" />,
            error: <ErrorOutline fontSize="inherit" />,
          }}
        >
          <Typography variant="body2">
            {snackbar.message}
          </Typography>
        </Alert>
      </Snackbar>
    </Box>
  );
};