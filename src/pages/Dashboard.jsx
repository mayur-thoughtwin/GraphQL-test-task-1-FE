import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Avatar,
  Chip,
  CircularProgress,
  Skeleton,
  alpha,
} from '@mui/material'
import {
  Add as AddIcon,
  People as PeopleIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  EventNote as EventNoteIcon,
  Person as PersonIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import { GET_EMPLOYEES, GET_MY_PROFILE } from '../graphql/queries'

const StatCard = ({ icon, label, value, color, trend }) => (
  <Paper
    sx={{
      p: 3,
      borderRadius: 3,
      height: '100%',
      background: `linear-gradient(135deg, ${alpha(color, 0.08)} 0%, ${alpha(color, 0.02)} 100%)`,
      border: `1px solid ${alpha(color, 0.2)}`,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 12px 24px ${alpha(color, 0.15)}`,
      },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <Box>
        <Typography variant="h3" sx={{ fontWeight: 700, color, mb: 0.5 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
      </Box>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          bgcolor: alpha(color, 0.15),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
        }}
      >
        {icon}
      </Box>
    </Box>
    {trend && (
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 0.5 }}>
        <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
        <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
          {trend}
        </Typography>
      </Box>
    )}
  </Paper>
)

const QuickActionCard = ({ icon, label, to, color }) => (
  <Paper
    component={RouterLink}
    to={to}
    sx={{
      p: 3,
      borderRadius: 3,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
      textDecoration: 'none',
      transition: 'all 0.3s ease',
      border: '1px solid',
      borderColor: 'divider',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 4,
        borderColor: color,
        '& .action-icon': {
          bgcolor: color,
          color: 'white',
        },
      },
    }}
  >
    <Box
      className="action-icon"
      sx={{
        width: 56,
        height: 56,
        borderRadius: 2,
        bgcolor: alpha(color, 0.1),
        color: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
      }}
    >
      {icon}
    </Box>
    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
      {label}
    </Typography>
  </Paper>
)

const Dashboard = () => {
  const { user, isAdmin } = useAuth()

  // Get all employees for stats and display (use max limit of 100)
  const { data: employeesData, loading: employeesLoading } = useQuery(GET_EMPLOYEES, {
    variables: { take: 100, sortBy: 'createdAt', sortOrder: 'desc' },
    skip: !isAdmin(),
    fetchPolicy: 'network-only', // Always fetch fresh data
  })

  const { data: profileData, loading: profileLoading } = useQuery(GET_MY_PROFILE, {
    skip: isAdmin(),
  })

  // Get stats from API response (backend already filters out admin-linked employees)
  const allEmployees = employeesData?.employees?.employees || []
  const totalCount = employeesData?.employees?.totalCount || 0
  // Calculate active/inactive from fetched employees
  const activeCount = allEmployees.filter((e) => e.isActive).length
  const inactiveCount = allEmployees.filter((e) => !e.isActive).length
  
  // Get recent 5 employees for display
  const recentEmployees = allEmployees.slice(0, 5)

  const stats = isAdmin()
    ? [
        {
          label: 'Total Employees',
          value: totalCount,
          icon: <PeopleIcon />,
          color: '#6366f1',
        },
        {
          label: 'Active Employees',
          value: activeCount,
          icon: <ActiveIcon />,
          color: '#10b981',
        },
        {
          label: 'Inactive Employees',
          value: inactiveCount,
          icon: <InactiveIcon />,
          color: '#ef4444',
        },
      ]
    : []

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Welcome back,{' '}
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {user?.employee?.name || user?.email?.split('@')[0] || 'User'}
            </Box>
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isAdmin()
              ? "Here's an overview of your employee management system"
              : "Here's your personal dashboard"}
          </Typography>
        </Box>
        {isAdmin() && (
          <Button
            component={RouterLink}
            to="/employees?action=new"
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              px: 3,
              background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
            }}
          >
            Add Employee
          </Button>
        )}
      </Box>

      {/* Stats Grid - Admin Only */}
      {isAdmin() && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <StatCard {...stat} />
            </Grid>
          ))}
        </Grid>
      )}

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} lg={9}>
          {isAdmin() ? (
            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Box
                sx={{
                  p: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recent Employees
                </Typography>
                <Button
                  component={RouterLink}
                  to="/employees"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ color: 'secondary.main' }}
                >
                  View All
                </Button>
              </Box>
              <Box sx={{ p: 2 }}>
                {employeesLoading ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} height={72} sx={{ borderRadius: 2 }} />
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {recentEmployees.map((employee) => (
                      <Paper
                        key={employee.id}
                        component={RouterLink}
                        to={`/employees/${employee.id}`}
                        sx={{
                          p: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          textDecoration: 'none',
                          borderRadius: 2,
                          transition: 'all 0.2s ease',
                          border: '1px solid',
                          borderColor: 'transparent',
                          '&:hover': {
                            bgcolor: alpha('#6366f1', 0.04),
                            borderColor: alpha('#6366f1', 0.2),
                          },
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 48,
                            height: 48,
                            bgcolor: 'secondary.main',
                            fontSize: '1.2rem',
                          }}
                        >
                          {employee.name[0].toUpperCase()}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 600, color: 'text.primary' }}
                          >
                            {employee.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {employee.class || 'No class'} • Age: {employee.age || 'N/A'}
                          </Typography>
                        </Box>
                        <Chip
                          size="small"
                          label={employee.isActive ? 'Active' : 'Inactive'}
                          color={employee.isActive ? 'success' : 'error'}
                          sx={{ fontWeight: 500 }}
                        />
                      </Paper>
                    ))}
                  </Box>
                )}
              </Box>
            </Paper>
          ) : (
            <>
            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Box
                sx={{
                  p: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Your Profile
                </Typography>
                <Button
                  component={RouterLink}
                  to="/profile"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ color: 'secondary.main' }}
                >
                  View Details
                </Button>
              </Box>
              <Box sx={{ p: 3 }}>
                {profileLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Skeleton variant="circular" width={80} height={80} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton height={32} width="40%" />
                      <Skeleton height={24} width="30%" />
                    </Box>
                  </Box>
                ) : profileData?.myProfile ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        fontSize: '2rem',
                        bgcolor: 'secondary.main',
                      }}
                    >
                      {profileData.myProfile.name[0].toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {profileData.myProfile.name}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                        {profileData.myProfile.class || 'No class assigned'}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">
                            Age
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {profileData.myProfile.age || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">
                            Subjects
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {profileData.myProfile.subjects?.length || 0}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">
                            Status
                          </Typography>
                          <Chip
                            size="small"
                            label={profileData.myProfile.isActive ? 'Active' : 'Inactive'}
                            color={profileData.myProfile.isActive ? 'success' : 'error'}
                            sx={{ mt: 0.5 }}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">
                      No employee profile linked to your account yet.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>

            {/* My Subjects - Employee only */}
            {profileData?.myProfile?.subjects && (
              <Paper sx={{ borderRadius: 3, overflow: 'hidden', mt: 3 }}>
                <Box
                  sx={{
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SchoolIcon sx={{ color: 'secondary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      My Subjects
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ p: 3 }}>
                  {profileData.myProfile.subjects.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                      {profileData.myProfile.subjects.map((subject) => (
                        <Chip
                          key={subject.id}
                          label={subject.name}
                          sx={{
                            bgcolor: alpha('#6366f1', 0.1),
                            color: '#6366f1',
                            fontWeight: 500,
                            fontSize: '0.9rem',
                            py: 2,
                          }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography color="text.secondary">
                      No subjects assigned yet.
                    </Typography>
                  )}
                </Box>
              </Paper>
            )}

            {/* My Attendance - Employee only */}
            {profileData?.myProfile?.attendance && (
              <Paper sx={{ borderRadius: 3, overflow: 'hidden', mt: 3 }}>
                <Box
                  sx={{
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventNoteIcon sx={{ color: 'secondary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      My Attendance
                    </Typography>
                  </Box>
                  <Button
                    component={RouterLink}
                    to="/attendance"
                    endIcon={<ArrowForwardIcon />}
                    sx={{ color: 'secondary.main' }}
                  >
                    View All
                  </Button>
                </Box>
                <Box sx={{ p: 3 }}>
                  {(() => {
                    const attendance = profileData.myProfile.attendance
                    const total = attendance.length
                    const present = attendance.filter((a) => a.status).length
                    const absent = total - present
                    const rate = total ? Math.round((present / total) * 100) : 0

                    return (
                      <Grid container spacing={3}>
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography
                              variant="h4"
                              sx={{ fontWeight: 700, color: 'primary.main' }}
                            >
                              {total}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Total Records
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography
                              variant="h4"
                              sx={{ fontWeight: 700, color: 'success.main' }}
                            >
                              {present}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Present
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography
                              variant="h4"
                              sx={{ fontWeight: 700, color: 'error.main' }}
                            >
                              {absent}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Absent
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography
                              variant="h4"
                              sx={{
                                fontWeight: 700,
                                color:
                                  rate >= 80
                                    ? 'success.main'
                                    : rate >= 60
                                    ? 'warning.main'
                                    : 'error.main',
                              }}
                            >
                              {rate}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Attendance Rate
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    )
                  })()}
                </Box>
              </Paper>
            )}
            </>
          )}
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} lg={3}>
          <Paper sx={{ borderRadius: 3, p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              {isAdmin() && (
                <>
                  <Grid item xs={6}>
                    <QuickActionCard
                      icon={<PeopleIcon />}
                      label="Employees"
                      to="/employees"
                      color="#6366f1"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <QuickActionCard
                      icon={<SchoolIcon />}
                      label="Subjects"
                      to="/subjects"
                      color="#f59e0b"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <QuickActionCard
                      icon={<EventNoteIcon />}
                      label="Mark Attendance"
                      to="/attendance?action=mark"
                      color="#10b981"
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={6}>
                <QuickActionCard
                  icon={<EventNoteIcon />}
                  label="Attendance"
                  to="/attendance"
                  color="#06b6d4"
                />
              </Grid>
              <Grid item xs={6}>
                <QuickActionCard
                  icon={<PersonIcon />}
                  label="My Profile"
                  to="/profile"
                  color="#8b5cf6"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard
