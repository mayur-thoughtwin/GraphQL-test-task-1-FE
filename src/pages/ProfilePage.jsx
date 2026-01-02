import React, { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  alpha,
} from '@mui/material'
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  EventNote as AttendanceIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material'
import { GET_MY_PROFILE } from '../graphql/queries'
import { UPDATE_MY_NAME } from '../graphql/mutations'
import { useAuth } from '../context/AuthContext'

const QuickLinkCard = ({ icon, label, to, color }) => (
  <Paper
    component={RouterLink}
    to={to}
    sx={{
      p: 3,
      borderRadius: 3,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      textDecoration: 'none',
      transition: 'all 0.3s ease',
      border: '1px solid',
      borderColor: 'divider',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: 3,
        borderColor: color,
      },
    }}
  >
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: 2,
        bgcolor: alpha(color, 0.1),
        color: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {icon}
    </Box>
    <Box sx={{ flex: 1 }}>
      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
        {label}
      </Typography>
    </Box>
    <ArrowForwardIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
  </Paper>
)

const ProfilePage = () => {
  const { user, isAdmin } = useAuth()
  const [isEditingName, setIsEditingName] = useState(false)
  const [newName, setNewName] = useState('')
  const [updateError, setUpdateError] = useState('')

  const { data, loading, error } = useQuery(GET_MY_PROFILE)

  const [updateMyName, { loading: updating }] = useMutation(UPDATE_MY_NAME, {
    onCompleted: () => {
      setIsEditingName(false)
      setUpdateError('')
    },
    onError: (err) => {
      setUpdateError(err.message)
    },
    refetchQueries: [{ query: GET_MY_PROFILE }],
  })

  const profile = data?.myProfile

  const handleEditClick = () => {
    setNewName(profile?.name || '')
    setIsEditingName(true)
    setUpdateError('')
  }

  const handleCancelEdit = () => {
    setIsEditingName(false)
    setNewName('')
    setUpdateError('')
  }

  const handleSaveName = async () => {
    if (!newName.trim()) {
      setUpdateError('Name is required')
      return
    }
    if (newName.trim().length < 2) {
      setUpdateError('Name must be at least 2 characters')
      return
    }
    await updateMyName({
      variables: {
        input: { name: newName.trim() },
      },
    })
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    // Handle Unix timestamp (string or number)
    let date
    if (/^\d+$/.test(dateString)) {
      // It's a Unix timestamp - convert to number and create date
      date = new Date(parseInt(dateString, 10))
    } else {
      date = new Date(dateString)
    }
    if (isNaN(date.getTime())) return 'N/A'
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getAttendanceStats = () => {
    if (!profile?.attendance) return null
    const total = profile.attendance.length
    const present = profile.attendance.filter((a) => a.status).length
    return {
      total,
      present,
      absent: total - present,
      rate: total ? Math.round((present / total) * 100) : 0,
    }
  }

  const stats = getAttendanceStats()

  return (
    <Box>
      {/* Hero Section */}
      <Paper
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Avatar
            sx={{
              width: 96,
              height: 96,
              fontSize: '2.5rem',
              bgcolor: 'secondary.main',
            }}
          >
            {profile?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              {profile?.name || 'User'}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8, mb: 2 }}>
              {user?.email}
            </Typography>
            <Chip
              label={user?.role}
              size="small"
              sx={{
                bgcolor: alpha(user?.role === 'ADMIN' ? '#f59e0b' : '#6366f1', 0.2),
                color: 'white',
                fontWeight: 500,
              }}
            />
          </Box>
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Typography color="error" sx={{ mb: 2 }}>
            Error loading profile: {error.message}
          </Typography>
        </Paper>
      ) : !profile ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: 3,
              bgcolor: alpha('#6366f1', 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <Typography variant="h3">👤</Typography>
          </Box>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            Set Up Your Profile
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            Create your employee profile by entering your name below.
          </Typography>

          <Box sx={{ maxWidth: 400, mx: 'auto' }}>
            <TextField
              fullWidth
              label="Your Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter your full name"
              sx={{ mb: 2 }}
            />
            {updateError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {updateError}
              </Alert>
            )}
            <Button
              fullWidth
              variant="contained"
              onClick={handleSaveName}
              disabled={updating || !newName.trim()}
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
              }}
            >
              {updating ? 'Creating...' : 'Create Profile'}
            </Button>
          </Box>

          {isAdmin() && (
            <Box sx={{ mt: 6 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                ADMIN QUICK LINKS
              </Typography>
              <Grid container spacing={2} sx={{ maxWidth: 600, mx: 'auto' }}>
                <Grid item xs={12} sm={4}>
                  <QuickLinkCard
                    icon={<PeopleIcon />}
                    label="Manage Employees"
                    to="/employees"
                    color="#6366f1"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <QuickLinkCard
                    icon={<SchoolIcon />}
                    label="Manage Subjects"
                    to="/subjects"
                    color="#f59e0b"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <QuickLinkCard
                    icon={<AttendanceIcon />}
                    label="View Attendance"
                    to="/attendance"
                    color="#10b981"
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Personal Information
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Editable Name Field */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Full Name
                  </Typography>
                  {isEditingName ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField
                        size="small"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Enter name"
                        autoFocus
                        sx={{ width: 180 }}
                        error={!!updateError}
                        helperText={updateError}
                      />
                      <IconButton
                        size="small"
                        onClick={handleSaveName}
                        disabled={updating}
                        color="primary"
                      >
                        <SaveIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={handleCancelEdit} disabled={updating}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {profile.name}
                      </Typography>
                      <IconButton size="small" onClick={handleEditClick}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Box>

                {/* Other fields */}
                {[
                  { label: 'Email', value: user?.email },
                  { label: 'Age', value: profile.age || 'Not specified' },
                  { label: 'Class', value: profile.class || 'Not assigned' },
                ].map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      py: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {item.label}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {item.value}
                    </Typography>
                  </Box>
                ))}

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    size="small"
                    label={profile.isActive ? 'Active' : 'Inactive'}
                    color={profile.isActive ? 'success' : 'error'}
                  />
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Subjects */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <SchoolIcon sx={{ color: 'secondary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  My Subjects
                </Typography>
              </Box>
              {profile.subjects && profile.subjects.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {profile.subjects.map((subject) => (
                    <Chip
                      key={subject.id}
                      label={subject.name}
                      sx={{
                        bgcolor: alpha('#6366f1', 0.1),
                        color: '#6366f1',
                        fontWeight: 500,
                      }}
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No subjects assigned
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Attendance Overview */}
          {stats && (
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <AttendanceIcon sx={{ color: 'secondary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Attendance Overview
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mb: 3 }}>
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <CircularProgress
                      variant="determinate"
                      value={stats.rate}
                      size={100}
                      thickness={8}
                      sx={{
                        color:
                          stats.rate >= 80
                            ? 'success.main'
                            : stats.rate >= 60
                            ? 'warning.main'
                            : 'error.main',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {stats.rate}%
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    {[
                      { label: 'Total Records', value: stats.total },
                      { label: 'Present', value: stats.present, color: 'success.main' },
                      { label: 'Absent', value: stats.absent, color: 'error.main' },
                    ].map((stat, index) => (
                      <Box
                        key={index}
                        sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {stat.label}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: stat.color || 'text.primary' }}
                        >
                          {stat.value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Button
                  component={RouterLink}
                  to="/attendance"
                  variant="outlined"
                  fullWidth
                  endIcon={<ArrowForwardIcon />}
                >
                  View All Records
                </Button>
              </Paper>
            </Grid>
          )}

          {/* Admin Quick Links */}
          {isAdmin() && (
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Admin Quick Links
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <QuickLinkCard
                    icon={<PeopleIcon />}
                    label="Manage Employees"
                    to="/employees"
                    color="#6366f1"
                  />
                  <QuickLinkCard
                    icon={<SchoolIcon />}
                    label="Manage Subjects"
                    to="/subjects"
                    color="#f59e0b"
                  />
                  <QuickLinkCard
                    icon={<AttendanceIcon />}
                    label="View Attendance"
                    to="/attendance"
                    color="#10b981"
                  />
                </Box>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      {/* Footer */}
      {profile && (
        <Paper sx={{ p: 2, mt: 3, borderRadius: 3 }}>
          <Typography variant="caption" color="text.secondary">
            Member since {formatDate(profile.createdAt)}
          </Typography>
        </Paper>
      )}
    </Box>
  )
}

export default ProfilePage
