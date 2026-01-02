import React, { useState, useRef, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material'
import {
  MarkEmailRead as MarkEmailReadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext'

const OTPVerification = ({ email, otp: providedOTP, onVerified, onBack }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [displayOTP, setDisplayOTP] = useState(providedOTP || '')
  const inputRefs = useRef([])
  const { verifyOTP, resendOTP } = useAuth()

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  useEffect(() => {
    // Countdown timer for resend
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setError('')

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim()
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('')
      setOtp(newOtp)
      inputRefs.current[5]?.focus()
    }
  }

  const handleVerify = async () => {
    const otpString = otp.join('')
    if (otpString.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await verifyOTP(email, otpString)
      if (result.success) {
        setSuccess(result.message)
        setTimeout(() => {
          onVerified?.()
        }, 1500)
      }
    } catch (err) {
      setError(err.message || 'Failed to verify OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResendLoading(true)
    setError('')

    try {
      const result = await resendOTP(email)
      if (result.success) {
        setSuccess(result.message)
        setOtp(['', '', '', '', '', ''])
        setCountdown(60) // 60 second cooldown
        // Update displayed OTP if new one is provided
        if (result.otp) {
          setDisplayOTP(result.otp)
        }
        inputRefs.current[0]?.focus()
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError(err.message || 'Failed to resend OTP. Please try again.')
    } finally {
      setResendLoading(false)
    }
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
              width: 80,
              height: 80,
              borderRadius: 4,
              background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              boxShadow: '0 12px 32px rgba(16, 185, 129, 0.35)',
            }}
          >
            <MarkEmailReadIcon sx={{ fontSize: 40, color: 'white' }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
            Verify Your Email
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            Enter the 6-digit code for
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              fontWeight: 600, 
              color: 'secondary.main',
              wordBreak: 'break-all',
            }}
          >
            {email}
          </Typography>
        </Box>

        {/* Display OTP for testing */}
        {displayOTP && (
          <Alert 
            severity="info" 
            sx={{ 
              mb: 3,
              '& .MuiAlert-message': {
                width: '100%',
                textAlign: 'center',
              }
            }}
          >
            <Typography variant="body2" sx={{ mb: 1 }}>
              🔐 <strong>Your OTP Code (for testing):</strong>
            </Typography>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                letterSpacing: '0.3em',
                fontFamily: 'monospace',
              }}
            >
              {displayOTP}
            </Typography>
          </Alert>
        )}

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {/* OTP Input */}
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            justifyContent: 'center',
            mb: 4,
          }}
          onPaste={handlePaste}
        >
          {otp.map((digit, index) => (
            <TextField
              key={index}
              inputRef={(ref) => (inputRefs.current[index] = ref)}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              inputProps={{
                maxLength: 1,
                style: {
                  textAlign: 'center',
                  fontSize: '24px',
                  fontWeight: 700,
                  padding: '12px',
                },
              }}
              sx={{
                width: 52,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&.Mui-focused': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'secondary.main',
                      borderWidth: 2,
                    },
                  },
                },
              }}
            />
          ))}
        </Box>

        {/* Verify Button */}
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleVerify}
          disabled={loading || otp.some((d) => !d)}
          sx={{
            py: 1.5,
            mb: 2,
            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            },
            '&:disabled': {
              background: 'rgba(16, 185, 129, 0.3)',
            },
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Verify Email'
          )}
        </Button>

        {/* Resend OTP */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Didn't receive the code?{' '}
            {countdown > 0 ? (
              <Typography component="span" variant="body2" color="text.secondary">
                Resend in {countdown}s
              </Typography>
            ) : (
              <Link
                component="button"
                variant="body2"
                onClick={handleResend}
                disabled={resendLoading}
                sx={{
                  color: 'secondary.main',
                  fontWeight: 600,
                  textDecoration: 'none',
                  cursor: resendLoading ? 'wait' : 'pointer',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                {resendLoading ? (
                  <>
                    <RefreshIcon sx={{ fontSize: 14, mr: 0.5, animation: 'spin 1s linear infinite' }} />
                    Sending...
                  </>
                ) : (
                  'Resend OTP'
                )}
              </Link>
            )}
          </Typography>
        </Box>

        {/* Back link */}
        {onBack && (
          <Box sx={{ textAlign: 'center' }}>
            <Link
              component="button"
              variant="body2"
              onClick={onBack}
              sx={{
                color: 'text.secondary',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline', color: 'text.primary' },
              }}
            >
              ← Back to Register
            </Link>
          </Box>
        )}

        {/* Expiry notice */}
        <Box sx={{ textAlign: 'center', mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            ⏱️ This code expires in 10 minutes
          </Typography>
        </Box>
      </Paper>

      {/* CSS for spin animation */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </Box>
  )
}

export default OTPVerification

