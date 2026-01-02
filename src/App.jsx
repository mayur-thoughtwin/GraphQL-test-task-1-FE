import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box, CircularProgress, Typography } from '@mui/material'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import EmployeesPage from './pages/EmployeesPage'
import EmployeeDetail from './pages/EmployeeDetail'
import SubjectsPage from './pages/SubjectsPage'
import AttendancePage from './pages/AttendancePage'
import ProfilePage from './pages/ProfilePage'

// Loading Screen Component
const LoadingScreen = ({ message = 'Loading...' }) => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
    }}
  >
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)',
        }}
      >
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
          E
        </Typography>
      </Box>
      <CircularProgress
        size={40}
        thickness={4}
        sx={{
          color: '#6366f1',
        }}
      />
      <Typography
        variant="body1"
        sx={{
          color: 'rgba(255, 255, 255, 0.7)',
          fontWeight: 500,
        }}
      >
        {message}
      </Typography>
    </Box>
  </Box>
)

// Protected Route wrapper
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, loading, isAdmin } = useAuth()

  if (loading) {
    return <LoadingScreen message="Checking authentication..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

const App = () => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <LoadingScreen message="Initializing application..." />
  }

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
      } />
      <Route path="/register" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
      } />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="employees" element={
          <ProtectedRoute requireAdmin>
            <EmployeesPage />
          </ProtectedRoute>
        } />
        <Route path="employees/:id" element={<EmployeeDetail />} />
        <Route path="subjects" element={
          <ProtectedRoute requireAdmin>
            <SubjectsPage />
          </ProtectedRoute>
        } />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
