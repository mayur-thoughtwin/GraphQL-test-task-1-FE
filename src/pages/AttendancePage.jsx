import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { useSearchParams } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Chip,
  IconButton,
  alpha,
  Snackbar,
  Alert,
} from '@mui/material'
import {
  Add as AddIcon,
  EventNote as AttendanceIcon,
  CheckCircle as PresentIcon,
  Cancel as AbsentIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import { GET_EMPLOYEES, GET_ATTENDANCE, GET_MY_PROFILE } from '../graphql/queries'
import { MARK_ATTENDANCE } from '../graphql/mutations'
import { useAuth } from '../context/AuthContext'

const StatCard = ({ label, value, color, icon }) => (
  <Paper
    sx={{
      p: 3,
      borderRadius: 3,
      bgcolor: alpha(color, 0.08),
      border: `1px solid ${alpha(color, 0.2)}`,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
  </Paper>
)

const AttendancePage = () => {
  const { isAdmin, user } = useAuth()
  const [searchParams] = useSearchParams()

  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [attendanceStatus, setAttendanceStatus] = useState(true)
  const [showMarkForm, setShowMarkForm] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    if (searchParams.get('action') === 'mark' && isAdmin()) {
      setShowMarkForm(true)
    }
  }, [searchParams, isAdmin])

  // Get employees for admin
  const { data: employeesData } = useQuery(GET_EMPLOYEES, {
    variables: { take: 100 },
    skip: !isAdmin(),
  })

  // Get own profile for employee
  const { data: profileData } = useQuery(GET_MY_PROFILE, {
    skip: isAdmin(),
  })

  // Get attendance records
  const employeeIdForAttendance = isAdmin()
    ? selectedEmployeeId
    : profileData?.myProfile?.id

  const { data: attendanceData, loading: attendanceLoading, refetch } = useQuery(GET_ATTENDANCE, {
    variables: {
      employeeId: employeeIdForAttendance,
    },
    skip: !employeeIdForAttendance,
  })

  const [markAttendance, { loading: marking, error: markError }] = useMutation(MARK_ATTENDANCE, {
    onCompleted: () => {
      setShowMarkForm(false)
      if (selectedEmployeeId) {
        refetch()
      }
      setSnackbar({
        open: true,
        message: 'Attendance has been marked successfully.',
        severity: 'success',
      })
    },
    onError: (error) => {
      console.error('Mark attendance error:', error)
      setSnackbar({
        open: true,
        message: error.message || 'Failed to mark attendance.',
        severity: 'error',
      })
    },
    refetchQueries: [
      {
        query: GET_ATTENDANCE,
        variables: {
          employeeId: selectedEmployeeId,
        },
      },
    ],
  })

  const handleMarkAttendance = async (e) => {
    e.preventDefault()
    if (!selectedEmployeeId || !selectedDate) return

    await markAttendance({
      variables: {
        input: {
          employeeId: selectedEmployeeId,
          date: selectedDate,
          status: attendanceStatus,
        },
      },
    })
  }

  // Get employees from API (backend already filters out admin-linked employees)
  const employees = employeesData?.employees?.employees || []
  const attendanceRecords = attendanceData?.attendanceByEmployee || []

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
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStats = () => {
    const total = attendanceRecords.length
    const present = attendanceRecords.filter((r) => r.status).length
    const absent = total - present
    const rate = total ? Math.round((present / total) * 100) : 0
    return { total, present, absent, rate }
  }

  const stats = getStats()

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
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Attendance
        </Typography>
        {isAdmin() && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowMarkForm(true)}
            sx={{
              background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
            }}
          >
            Mark Attendance
          </Button>
        )}
      </Box>

      {/* Employee Selector for Admin */}
      {isAdmin() && (
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Select Employee</InputLabel>
            <Select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              label="Select Employee"
            >
              <MenuItem value="">
                <em>Choose an employee...</em>
              </MenuItem>
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.id}>
                  {emp.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>
      )}

      {/* No Profile for Employee */}
      {!isAdmin() && !profileData?.myProfile && (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: 3,
              bgcolor: alpha('#10b981', 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <AttendanceIcon sx={{ fontSize: 40, color: '#10b981' }} />
          </Box>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            No Profile Found
          </Typography>
          <Typography color="text.secondary">
            Your employee profile hasn't been created yet.
          </Typography>
        </Paper>
      )}

      {/* Stats and Records */}
      {(selectedEmployeeId || (!isAdmin() && profileData?.myProfile)) && (
        <>
          {/* Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={6} md={3}>
              <StatCard
                label="Total Records"
                value={stats.total}
                color="#64748b"
                icon={<AttendanceIcon />}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard
                label="Present Days"
                value={stats.present}
                color="#10b981"
                icon={<PresentIcon />}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard
                label="Absent Days"
                value={stats.absent}
                color="#ef4444"
                icon={<AbsentIcon />}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard
                label="Attendance Rate"
                value={`${stats.rate}%`}
                color="#6366f1"
                icon={<AttendanceIcon />}
              />
            </Grid>
          </Grid>

          {/* Records */}
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Attendance Records
            </Typography>

            {attendanceLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : attendanceRecords.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">No attendance records found.</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {attendanceRecords.map((record) => (
                  <Box
                    key={record.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 2,
                      borderRadius: 2,
                      bgcolor: record.status ? alpha('#10b981', 0.08) : alpha('#ef4444', 0.08),
                      border: '1px solid',
                      borderColor: record.status ? alpha('#10b981', 0.2) : alpha('#ef4444', 0.2),
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: record.status ? 'success.main' : 'error.main',
                        }}
                      />
                      <Chip
                        size="small"
                        label={record.status ? 'Present' : 'Absent'}
                        color={record.status ? 'success' : 'error'}
                        icon={record.status ? <PresentIcon /> : <AbsentIcon />}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(record.date)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </>
      )}

      {/* Mark Attendance Dialog */}
      {isAdmin() && (
        <Dialog
          open={showMarkForm}
          onClose={() => setShowMarkForm(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 },
          }}
        >
          <DialogTitle
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Mark Attendance
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Record attendance for an employee
              </Typography>
            </Box>
            <IconButton onClick={() => setShowMarkForm(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <form onSubmit={handleMarkAttendance}>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {markError && (
                <Paper sx={{ p: 2, bgcolor: alpha('#ef4444', 0.1), border: '1px solid', borderColor: alpha('#ef4444', 0.3), borderRadius: 2 }}>
                  <Typography color="error" variant="body2">
                    {markError.message || 'Failed to mark attendance'}
                  </Typography>
                </Paper>
              )}
              <FormControl fullWidth>
                <InputLabel>Employee</InputLabel>
                <Select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  label="Employee"
                  required
                >
                  <MenuItem value="">
                    <em>Select employee...</em>
                  </MenuItem>
                  {employees.map((emp) => (
                    <MenuItem key={emp.id} value={emp.id}>
                      {emp.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                type="date"
                label="Date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                  Status
                </Typography>
                <ToggleButtonGroup
                  value={attendanceStatus}
                  exclusive
                  onChange={(e, value) => value !== null && setAttendanceStatus(value)}
                  fullWidth
                >
                  <ToggleButton
                    value={true}
                    sx={{
                      py: 2,
                      '&.Mui-selected': {
                        bgcolor: alpha('#10b981', 0.15),
                        color: '#10b981',
                        '&:hover': {
                          bgcolor: alpha('#10b981', 0.25),
                        },
                      },
                    }}
                  >
                    <PresentIcon sx={{ mr: 1 }} /> Present
                  </ToggleButton>
                  <ToggleButton
                    value={false}
                    sx={{
                      py: 2,
                      '&.Mui-selected': {
                        bgcolor: alpha('#ef4444', 0.15),
                        color: '#ef4444',
                        '&:hover': {
                          bgcolor: alpha('#ef4444', 0.25),
                        },
                      },
                    }}
                  >
                    <AbsentIcon sx={{ mr: 1 }} /> Absent
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2.5, pt: 0 }}>
              <Button variant="outlined" onClick={() => setShowMarkForm(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={marking || !selectedEmployeeId}
                sx={{
                  background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                }}
              >
                {marking ? <CircularProgress size={24} color="inherit" /> : 'Mark Attendance'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default AttendancePage
