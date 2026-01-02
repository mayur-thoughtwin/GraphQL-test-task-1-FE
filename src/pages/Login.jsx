import React, { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material'
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import OTPVerification from '../components/OTP/OTPVerification'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showOTPVerification, setShowOTPVerification] = useState(false)
  const [pendingEmail, setPendingEmail] = useState('')
  const [generatedOTP, setGeneratedOTP] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(email, password)
      
      // Check if OTP verification is required
      if (result.requiresOTPVerification) {
        setPendingEmail(result.email)
        setGeneratedOTP(result.otp || '') // Store OTP for display
        setShowOTPVerification(true)
      } else {
        // Login successful, navigate to dashboard
        navigate('/dashboard')
      }
    } catch (err) {
      // Check if it's a "user not found" error
      const isUserNotFound = err.graphQLErrors?.some(
        (e) => e.extensions?.code === 'USER_NOT_FOUND'
      ) || err.message?.includes('No account exists')
      
      if (isUserNotFound) {
        setError('NO_ACCOUNT_EXISTS')
      } else {
        setError(err.message || 'Login failed. Please check your credentials.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleOTPVerified = () => {
    // After successful OTP verification, user is logged in automatically
    navigate('/dashboard')
  }

  const handleBackToLogin = () => {
    setShowOTPVerification(false)
    setPendingEmail('')
    setGeneratedOTP('')
  }

  // Show OTP verification page if required
  if (showOTPVerification) {
    return (
      <OTPVerification
        email={pendingEmail}
        otp={generatedOTP}
        onVerified={handleOTPVerified}
        onBack={handleBackToLogin}
      />
    )
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      }}
    >
      {/* Decorative Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -200,
          right: -200,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -150,
          left: -150,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
        }}
      />

      {/* Login Card */}
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 440,
          mx: 2,
          p: { xs: 4, sm: 5 },
          borderRadius: 4,
          bgcolor: 'background.paper',
          boxShadow: '0 25px 80px rgba(0, 0, 0, 0.35)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)',
            }}
          >
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
              E
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
            Welcome Back
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sign in to your Employee Portal account
          </Typography>
        </Box>

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error === 'NO_ACCOUNT_EXISTS' ? (
                <>
                  No account exists with this email.{' '}
                  <Link
                    component={RouterLink}
                    to="/register"
                    sx={{
                      color: 'inherit',
                      fontWeight: 600,
                      textDecoration: 'underline',
                    }}
                  >
                    Create a new account
                  </Link>
                </>
              ) : (
                error
              )}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ mb: 2.5 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            placeholder="you@example.com"
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            placeholder="••••••••"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              py: 1.5,
              mb: 3,
              background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Sign In'
            )}
          </Button>

          <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
            Don't have an account?{' '}
            <Link
              component={RouterLink}
              to="/register"
              sx={{
                color: 'secondary.main',
                fontWeight: 600,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Create one
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}

export default Login
