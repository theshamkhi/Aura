import { useState, useEffect, useRef } from 'react';
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
  alpha,
  Badge,
  Divider,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Fade,
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
  Refresh,
  MoreVert,
  Archive,
  Reply,
  Sync,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export const Messages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isSyncing, setIsSyncing] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const prevMessagesRef = useRef([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Fetch messages initially
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await api.get('/messages');
        setMessages(response.data.messages);
        prevMessagesRef.current = response.data.messages;
        setLoading(false);
      } catch (error) {
        setSnackbar({ open: true, message: 'Failed to load messages', severity: 'error' });
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  // Real-time updates with polling but without animation effects
  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        setIsSyncing(true);
        const response = await api.get('/messages');
        const newMessages = response.data.messages;
        
        // Check if we have new messages
        const currentIds = new Set(prevMessagesRef.current.map(m => m.id));
        const incomingMessages = newMessages.filter(m => !currentIds.has(m.id));
        
        if (incomingMessages.length > 0) {
          setNewMessageCount(incomingMessages.length);
          
          // Update state with new messages
          setMessages(prev => {
            // Keep selected message selected after update
            if (selectedMessage) {
              const updatedSelectedMessage = newMessages.find(m => m.id === selectedMessage.id);
              if (updatedSelectedMessage) {
                setSelectedMessage(updatedSelectedMessage);
              }
            }
            return newMessages;
          });
          
          // Show notification only if not the first load
          if (prevMessagesRef.current.length > 0) {
            setSnackbar({ 
              open: true, 
              message: `${incomingMessages.length} new message${incomingMessages.length > 1 ? 's' : ''} received`, 
              severity: 'info' 
            });
          }
        } else {
          // Check for deleted messages
          const newIds = new Set(newMessages.map(m => m.id));
          const deletedMessages = prevMessagesRef.current.filter(m => !newIds.has(m.id));
          
          if (deletedMessages.length > 0) {
            setMessages(newMessages);
            
            // If selected message was deleted
            if (selectedMessage && !newIds.has(selectedMessage.id)) {
              setSelectedMessage(null);
            }
          }
        }
        
        // Update reference for next comparison
        prevMessagesRef.current = newMessages;
        
      } catch (error) {
        console.error("Error checking for updates:", error);
      } finally {
        setIsSyncing(false);
      }
    };

    const interval = setInterval(checkForUpdates, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [selectedMessage]);

  const handleRefresh = async () => {
    try {
      setIsSyncing(true);
      const response = await api.get('/messages');
      setMessages(response.data.messages);
      prevMessagesRef.current = response.data.messages;
      setSnackbar({ open: true, message: 'Messages refreshed', severity: 'success' });
      setNewMessageCount(0);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to refresh messages', severity: 'error' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDelete = async (message) => {
    try {
      await api.delete(`/messages/${message.id}`);
      setMessages(messages.filter(m => m.id !== message.id));
      prevMessagesRef.current = prevMessagesRef.current.filter(m => m.id !== message.id);
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

  const getRandomGradient = (name) => {
    const gradients = [
      'linear-gradient(135deg, #FF9671 0%, #FF6B6B 100%)',
      'linear-gradient(135deg, #845EC2 0%, #D65DB1 100%)',
      'linear-gradient(135deg, #00C9A7 0%, #4D8076 100%)',
      'linear-gradient(135deg, #4B7BEC 0%, #3867D6 100%)',
      'linear-gradient(135deg, #FFC75F 0%, #FF9671 100%)',
    ];
    
    if (!name) return gradients[0];
    const sum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[sum % gradients.length];
  };

  const MessageCard = ({ message, isNew = false }) => {
    const isSelected = selectedMessage?.id === message.id;
    const timeSince = dayjs(message.received_at).fromNow();
    const avatarGradient = getRandomGradient(message.sender_name);
    
    return (
      <Fade in={true} timeout={isNew ? 800 : 0}>
        <Card 
          elevation={isSelected ? 4 : 1}
          sx={{ 
            mb: 2,
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'box-shadow 0.2s ease-in-out',
            backgroundColor: isSelected 
              ? alpha(theme.palette.primary.main, 0.04) 
              : isNew 
                ? alpha(theme.palette.info.light, 0.1)
                : 'background.paper',
            border: isSelected ? '1px solid' : isNew ? '1px solid' : 'none',
            borderColor: isSelected 
              ? theme => alpha(theme.palette.primary.main, 0.3)
              : isNew 
                ? theme => alpha(theme.palette.info.main, 0.3)
                : 'transparent',
            '&:hover': {
              boxShadow: theme => `0 8px 16px ${alpha(theme.palette.common.black, 0.08)}`,
            },
            position: 'relative',
            overflow: 'hidden',
            '&::before': isSelected ? {
              content: '""',
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '4px',
              background: theme.palette.primary.main,
            } : isNew ? {
              content: '""',
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '4px',
              background: theme.palette.info.main,
            } : {},
          }}
          onClick={() => handleMessageClick(message)}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ 
                background: avatarGradient,
                color: 'white',
                width: 48,
                height: 48,
                fontSize: '1.2rem',
                fontWeight: 600,
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}>
                {message?.sender_name?.[0]?.toUpperCase() || '?'}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1" fontWeight="600" color="text.primary">
                    {message.sender_name || 'Unknown sender'}
                  </Typography>
                  {isNew && (
                    <Chip 
                      label="New" 
                      size="small" 
                      color="info"
                      sx={{ 
                        height: 20, 
                        fontSize: '0.65rem',
                        fontWeight: 600,
                      }} 
                    />
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
                  <Email fontSize="small" sx={{ color: 'text.secondary', fontSize: '0.9rem' }} />
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                    {message.sender_email || 'No email provided'}
                  </Typography>
                </Box>
              </Box>
              <Tooltip title={dayjs(message.received_at).format('MMM D, YYYY h:mm A')} arrow>
                <Chip 
                  label={timeSince}
                  size="small"
                  sx={{ 
                    borderRadius: '6px',
                    color: 'text.secondary',
                    bgcolor: 'background.default',
                    fontSize: '0.75rem',
                    height: '24px',
                  }}
                />
              </Tooltip>
            </Box>
            
            <Typography 
              sx={{ 
                mt: 2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                color: 'text.primary',
                lineHeight: 1.6,
                fontSize: '0.9rem',
                fontWeight: isSelected ? 500 : 400,
                opacity: 0.85,
              }}
            >
              {message.message}
            </Typography>
            
            <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <LocationOn fontSize="small" sx={{ color: 'text.secondary', fontSize: '0.9rem' }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                  {message.visitor?.country || 'Unknown location'}
                  {message.visitor?.city && `, ${message.visitor.city}`}
                </Typography>
              </Box>
              
              {isSelected && (
                <Tooltip title="Quick actions">
                  <IconButton size="small">
                    <MoreVert fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </CardContent>
        </Card>
      </Fade>
    );
  };

  const MessageDetails = ({ message, loading, onClose }) => (
    <Paper 
      sx={{ 
        height: '100%',
        p: { xs: 2.5, md: 3 },
        borderRadius: '16px',
        backgroundColor: 'background.paper',
        boxShadow: theme => `0 10px 40px ${alpha(theme.palette.common.black, 0.08)}`,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {isMobile && (
        <Button 
          onClick={onClose}
          startIcon={<ArrowBack />}
          sx={{ 
            mb: 3,
            alignSelf: 'flex-start',
            borderRadius: '8px',
          }}
          variant="outlined"
          size="small"
        >
          Back to list
        </Button>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Skeleton variant="rectangular" width="100%" height={80} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 2 }} />
        </Box>
      ) : (
        <>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: '12px',
              background: theme => `linear-gradient(to right, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.background.default, 0.8)})`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <Tooltip title="Online status" arrow>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        bgcolor: '#44b700',
                        borderRadius: '50%',
                        border: '2px solid white',
                      }}
                    />
                  </Tooltip>
                }
              >
                <Avatar sx={{ 
                  width: 64, 
                  height: 64, 
                  fontSize: 26,
                  background: getRandomGradient(message?.sender_name),
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                }}>
                  {message?.sender_name?.[0]?.toUpperCase() || '?'}
                </Avatar>
              </Badge>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h5" fontWeight="700" color="text.primary">
                  {message?.sender_name || 'Unknown sender'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Email fontSize="small" sx={{ color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {message?.sender_email || 'No email provided'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <Paper sx={{ 
                p: 2,
                borderRadius: '12px',
                bgcolor: 'background.default',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Box sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: alpha(theme.palette.primary.main, 0.1),
                  }}>
                    <LocationOn sx={{ color: theme.palette.primary.main }} />
                  </Box>
                  <Box>
                    <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.2, fontSize: '0.7rem' }}>
                      Location
                    </Typography>
                    <Typography variant="body1" fontWeight={500} color="text.primary">
                      {message?.visitor?.country || 'Unknown'}
                      {message?.visitor?.city && `, ${message.visitor.city}`}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Paper sx={{ 
                p: 2,
                borderRadius: '12px',
                bgcolor: 'background.default',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Box sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: alpha(theme.palette.info.main, 0.1),
                  }}>
                    <AccessTime sx={{ color: theme.palette.info.main }} />
                  </Box>
                  <Box>
                    <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.2, fontSize: '0.7rem' }}>
                      Received
                    </Typography>
                    <Typography variant="body1" fontWeight={500} color="text.primary">
                      {dayjs(message?.received_at).format('MMM D, YYYY h:mm A')}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          <Paper 
            elevation={0}
            sx={{ 
              p: 3,
              borderRadius: '12px',
              bgcolor: 'background.default',
              border: '1px solid',
              borderColor: 'divider',
              flexGrow: 1,
              mb: 3,
              position: 'relative',
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2
            }}>
              <Typography variant="h6" fontWeight={600} color="text.primary">
                Message Content
              </Typography>
              <Chip 
                label={`${message?.message?.length || 0} characters`}
                size="small"
                sx={{ 
                  fontWeight: 500,
                  fontSize: '0.7rem',
                  height: '24px',
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  color: theme.palette.primary.main,
                }}
              />
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography 
              sx={{ 
                whiteSpace: 'pre-wrap',
                lineHeight: 1.8,
                color: 'text.primary',
                fontSize: '0.95rem',
                letterSpacing: '0.015em',
              }}
            >
              {message?.message}
            </Typography>
          </Paper>

          <Box sx={{ mt: 'auto', display: 'flex', gap: 2, justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={() => handleDelete(message)}
              sx={{ 
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.error.main, 0.08),
                }
              }}
              size="small"
            >
              Delete
            </Button>
            
            <Button
              variant="contained"
              // onClick={() => }
              startIcon={<Reply />}
              sx={{ 
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              }}
              size="small"
            >
              Reply
            </Button>
          </Box>
        </>
      )}
    </Paper>
  );

  const MessageSkeleton = () => (
    <Card sx={{ mb: 2, borderRadius: '12px' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Skeleton variant="circular" width={48} height={48} />
          <Box sx={{ flexGrow: 1 }}>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="40%" height={20} />
          </Box>
          <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
        </Box>
        <Skeleton variant="text" sx={{ mt: 2 }} height={20} />
        <Skeleton variant="text" height={20} />
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Skeleton variant="text" width="30%" height={20} />
        </Box>
      </CardContent>
    </Card>
  );

  const EmptyState = () => (
    <Box 
      sx={{ 
        height: '60vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        textAlign: 'center',
        gap: 2,
        py: 8,
      }}
    >
      <Box 
        sx={{ 
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: alpha(theme.palette.primary.main, 0.08),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
        }}
      >
        <MessageIcon sx={{ fontSize: 60, color: theme.palette.primary.main, opacity: 0.6 }} />
      </Box>
      <Typography variant="h5" fontWeight={600} color="text.primary" gutterBottom>
        No messages yet
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
        Your visitors' messages will appear here once they start reaching out
      </Typography>
      <Button 
        variant="outlined" 
        startIcon={<Refresh />}
        onClick={handleRefresh}
        sx={{ mt: 2, borderRadius: '8px' }}
      >
        Refresh
      </Button>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
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
            Messages Inbox
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ChatBubbleOutline fontSize="small" />
            {messages.length} message{messages.length !== 1 ? 's' : ''} received
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {newMessageCount > 0 && (
            <Button 
              variant="contained" 
              color="info"
              size="small"
              onClick={handleRefresh}
              startIcon={<Sync />}
              sx={{ 
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              }}
            >
              {newMessageCount} new message{newMessageCount > 1 ? 's' : ''}
            </Button>
          )}
          
          <Tooltip title="Refresh messages">
            <IconButton 
              onClick={handleRefresh}
              sx={{ 
                bgcolor: 'background.default',
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) }
              }}
              disabled={isSyncing}
            >
              <Refresh sx={{ 
                animation: isSyncing ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' }
                }
              }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={selectedMessage && !isMobile ? 5 : 12}>
          {loading ? (
            <>
              <MessageSkeleton />
              <MessageSkeleton />
              <MessageSkeleton />
            </>
          ) : messages.length > 0 ? (
            <Box>
              {messages.map(message => {
                // Determine if message is new (received in the last minute)
                const isNew = dayjs().diff(dayjs(message.received_at), 'minute') < 1 && 
                             dayjs(message.received_at).isAfter(dayjs().subtract(30, 'second'));
                
                return (
                  <MessageCard 
                    key={message.id} 
                    message={message} 
                    isNew={isNew}
                  />
                );
              })}
            </Box>
          ) : (
            <EmptyState />
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
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        TransitionComponent={Fade}
      >
        <Alert 
          severity={snackbar.severity}
          sx={{
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            alignItems: 'center',
            backdropFilter: 'blur(10px)',
            backgroundColor: theme => {
              if (snackbar.severity === 'success') return alpha(theme.palette.success.light, 0.9);
              if (snackbar.severity === 'error') return alpha(theme.palette.error.light, 0.9);
              if (snackbar.severity === 'info') return alpha(theme.palette.info.light, 0.9);
              return alpha(theme.palette.background.default, 0.9);
            },
            color: theme => {
              if (snackbar.severity === 'success') return theme.palette.success.contrastText;
              if (snackbar.severity === 'error') return theme.palette.error.contrastText;
              if (snackbar.severity === 'info') return theme.palette.info.contrastText;
              return theme.palette.text.primary;
            },
            border: '1px solid',
            borderColor: theme => {
              if (snackbar.severity === 'success') return theme.palette.success.main;
              if (snackbar.severity === 'error') return theme.palette.error.main;
              if (snackbar.severity === 'info') return theme.palette.info.main;
              return theme.palette.divider;
            },
          }}
          iconMapping={{
            success: <CheckCircleOutline fontSize="inherit" />,
            error: <ErrorOutline fontSize="inherit" />,
            info: <ChatBubbleOutline fontSize="inherit" />,
          }}
        >
          <Typography variant="body2" fontWeight={500}>
            {snackbar.message}
          </Typography>
        </Alert>
      </Snackbar>
    </Box>
  );
};