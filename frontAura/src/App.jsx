import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';

// Auth pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// Dashboard components
import { DashboardLayout } from './layouts/DashboardLayout';
import { Overview } from './pages/Overview';
import { Projects } from './pages/Projects';
import { Achievements } from './pages/Achievements';
import { Skills } from './pages/Skills';
import { Messages } from './pages/Messages';

// Public Portfolio components
import { PortfolioLayout } from './layouts/PortfolioLayout';
import { Home } from './pages/portfolio/Home';
import { ProjectsPage } from './pages/portfolio/Projects';
import { ProjectDetail } from './pages/portfolio/ProjectDetail';

import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }>
              <Route index element={<Overview />} />
              <Route path="projects" element={<Projects />} />
              <Route path="skills" element={<Skills />} />
              <Route path="achievements" element={<Achievements />} />
              <Route path="messages" element={<Messages />} />
            </Route>
            
            {/* Public Portfolio Routes */}
            <Route path="/:username" element={<PortfolioLayout />}>
              <Route index element={<Home />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="projects/:id" element={<ProjectDetail />} />
            </Route>
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;