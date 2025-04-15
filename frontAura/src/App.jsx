import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Overview } from './pages/Overview';
import { Projects } from './pages/Projects';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/dashboard" element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }>
              <Route index element={<Overview />} />
              <Route path="projects" element={<Projects />} />
              {/* <Route path="skills" element={<Skills />} />
              <Route path="achievements" element={<Achievements />} />
              <Route path="messages" element={<Messages />} />
              <Route path="settings" element={<Settings />} /> */}
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;