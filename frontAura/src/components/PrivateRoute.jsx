import { CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Box } from '@mui/system';

export const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <CircularProgress size={60} />
    </Box>
  );
  return user ? children : <Navigate to="/login" replace />;
};