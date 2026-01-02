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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Badge as BadgeIcon,
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import OTPVerification from '../components/OTP/OTPVerification'

const Register = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [role, setRole] = useState('EMPLOYEE')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showOTPVerification, setShowOTPVerification] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [generatedOTP, setGeneratedOTP] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const result = await register(email, password, role)
      
      // Check if OTP verification is required
      if (result.requiresOTPVerification) {
        setRegisteredEmail(result.email)
        setGeneratedOTP(result.otp || '') // Store the OTP for display
        setShowOTPVerification(true)
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOTPVerified = () => {
    // After successful OTP verification, user is logged in automatically
    // Navigate to dashboard
    navigate('/dashboard')
  }

  const handleBackToRegister = () => {
    setShowOTPVerification(false)
    setRegisteredEmail('')
    setGeneratedOTP('')
  }

  // Show OTP verification page after registration
  if (showOTPVerification) {
    return (
      <OTPVerification
        email={registeredEmail}
        otp={generatedOTP}
        onVerified={handleOTPVerified}
        onBack={handleBackToRegister}
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
        py: 4,
      }}
    >
      {/* Decorative Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -200,
          left: -200,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -150,
          right: -150,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
        }}
      />

      {/* Register Card */}
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
              background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
            }}
          >
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
              E
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
            Create Account
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Join the Employee Portal today
          </Typography>
        </Box>

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
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
            sx={{ mb: 2.5 }}
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

          <TextField
            fullWidth
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            sx={{ mb: 2.5 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                    size="small"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            placeholder="••••••••"
          />

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Account Type</InputLabel>
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              label="Account Type"
              startAdornment={
                <InputAdornment position="start">
                  <BadgeIcon sx={{ color: 'text.secondary', ml: 1 }} />
                </InputAdornment>
              }
            >
              <MenuItem value="EMPLOYEE">Employee</MenuItem>
              <MenuItem value="ADMIN">Administrator</MenuItem>
            </Select>
          </FormControl>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              py: 1.5,
              mb: 3,
              background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Create Account'
            )}
          </Button>

          <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
            Already have an account?{' '}
            <Link
              component={RouterLink}
              to="/login"
              sx={{
                color: 'secondary.main',
                fontWeight: 600,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Sign in
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}

export default Register
