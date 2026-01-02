import React, { useState } from 'react'
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom'
import { useQuery, useMutation } from '@apollo/client'
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  Button,
  Grid,
  CircularProgress,
  Divider,
  LinearProgress,
  alpha,
} from '@mui/material'
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  School as SchoolIcon,
  EventNote as AttendanceIcon,
  CheckCircle as PresentIcon,
  Cancel as AbsentIcon,
} from '@mui/icons-material'
import { GET_EMPLOYEE, GET_SUBJECTS } from '../graphql/queries'
import { UPDATE_EMPLOYEE, DELETE_EMPLOYEE } from '../graphql/mutations'
import { useAuth } from '../context/AuthContext'
import EmployeeForm from '../components/Employees/EmployeeForm'

const EmployeeDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [showEditForm, setShowEditForm] = useState(false)

  const { data, loading, error, refetch } = useQuery(GET_EMPLOYEE, {
    variables: { id },
  })

  const { data: subjectsData } = useQuery(GET_SUBJECTS, {
    skip: !isAdmin(),
  })

  const [updateEmployee] = useMutation(UPDATE_EMPLOYEE, {
    onCompleted: () => {
      setShowEditForm(false)
      refetch()
    },
  })

  const [deleteEmployee] = useMutation(DELETE_EMPLOYEE, {
    onCompleted: () => {
      navigate('/employees')
    },
  })

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    let date
    if (/^\d+$/.test(String(dateString))) {
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
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleUpdate = async (formData) => {
    await updateEmployee({
      variables: { id, input: formData },
    })
  }

  const handleDelete = async () => {
    if (
      window.confirm(
        'Are you sure you want to delete this employee? This action cannot be undone.'
      )
    ) {
      await deleteEmployee({ variables: { id } })
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
        <Typography variant="h6" color="error" sx={{ mb: 2 }}>
          Error
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {error.message}
        </Typography>
        <Button
          component={RouterLink}
          to="/employees"
          startIcon={<BackIcon />}
          variant="outlined"
        >
          Back to Employees
        </Button>
      </Paper>
    )
  }

  const employee = data?.employee

  if (!employee) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Employee Not Found
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          The employee you're looking for doesn't exist or you don't have access.
        </Typography>
        <Button
          component={RouterLink}
          to="/employees"
          startIcon={<BackIcon />}
          variant="outlined"
        >
          Back to Employees
        </Button>
      </Paper>
    )
  }

  const attendanceStats = {
    total: employee.attendance?.length || 0,
    present: employee.attendance?.filter((a) => a.status).length || 0,
    absent: employee.attendance?.filter((a) => !a.status).length || 0,
    rate: employee.attendance?.length
      ? Math.round(
          (employee.attendance.filter((a) => a.status).length / employee.attendance.length) * 100
        )
      : 0,
  }

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
        <Button
          component={RouterLink}
          to="/employees"
          startIcon={<BackIcon />}
          sx={{ color: 'text.secondary' }}
        >
          Back to Employees
        </Button>

        {isAdmin() && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setShowEditForm(true)}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </Box>
        )}
      </Box>

      {/* Hero Section */}
      <Paper
        sx={{
          p: 4,
          mb: 3,
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
            {employee.name[0].toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {employee.name}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8, mb: 2 }}>
              {employee.user?.email}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                label={employee.isActive ? 'Active' : 'Inactive'}
                color={employee.isActive ? 'success' : 'error'}
                size="small"
              />
              <Chip
                label={employee.user?.role}
                size="small"
                sx={{ bgcolor: alpha('#fff', 0.15), color: 'white' }}
              />
            </Box>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Personal Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Personal Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { label: 'Full Name', value: employee.name },
                { label: 'Email Address', value: employee.user?.email || 'Not available' },
                { label: 'Age', value: employee.age || 'Not specified' },
                { label: 'Class', value: employee.class || 'Not assigned' },
                { label: 'User ID', value: employee.userId, mono: true },
                { label: 'Employee ID', value: employee.id, mono: true },
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
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      fontFamily: item.mono ? 'monospace' : 'inherit',
                      fontSize: item.mono ? '0.75rem' : 'inherit',
                    }}
                  >
                    {item.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Subjects */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <SchoolIcon sx={{ color: 'secondary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Assigned Subjects
              </Typography>
            </Box>
            {employee.subjects && employee.subjects.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {employee.subjects.map((subject) => (
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
                No subjects assigned to this employee.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Attendance Statistics */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <AttendanceIcon sx={{ color: 'secondary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Attendance Statistics
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
              <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <CircularProgress
                  variant="determinate"
                  value={attendanceStats.rate}
                  size={100}
                  thickness={8}
                  sx={{
                    color:
                      attendanceStats.rate >= 80
                        ? 'success.main'
                        : attendanceStats.rate >= 60
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
                    {attendanceStats.rate}%
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ flex: 1 }}>
                {[
                  { label: 'Total Records', value: attendanceStats.total, color: 'text.secondary' },
                  { label: 'Present', value: attendanceStats.present, color: 'success.main' },
                  { label: 'Absent', value: attendanceStats.absent, color: 'error.main' },
                ].map((stat, index) => (
                  <Box
                    key={index}
                    sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: stat.color }}>
                      {stat.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Attendance */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Recent Attendance
            </Typography>
            {employee.attendance && employee.attendance.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {employee.attendance.slice(0, 10).map((record) => (
                  <Box
                    key={record.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: record.status ? alpha('#10b981', 0.08) : alpha('#ef4444', 0.08),
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {record.status ? (
                        <PresentIcon sx={{ color: 'success.main', fontSize: 20 }} />
                      ) : (
                        <AbsentIcon sx={{ color: 'error.main', fontSize: 20 }} />
                      )}
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {record.status ? 'Present' : 'Absent'}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {(() => {
                        const dateValue = record.date;
                        let date;
                        if (/^\d+$/.test(String(dateValue))) {
                          date = new Date(parseInt(dateValue, 10));
                        } else {
                          date = new Date(dateValue);
                        }
                        if (isNaN(date.getTime())) return 'N/A';
                        return date.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        });
                      })()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No attendance records found.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Footer */}
      <Paper sx={{ p: 2, mt: 3, borderRadius: 3 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Created: {formatDate(employee.createdAt)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Last Updated: {formatDate(employee.updatedAt)}
          </Typography>
        </Box>
      </Paper>

      {showEditForm && (
        <EmployeeForm
          employee={employee}
          subjects={subjectsData?.subjects || []}
          onSubmit={handleUpdate}
          onClose={() => setShowEditForm(false)}
        />
      )}
    </Box>
  )
}

export default EmployeeDetail
