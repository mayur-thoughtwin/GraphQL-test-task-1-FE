import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Avatar,
  Chip,
  Button,
  Divider,
  Grid,
  IconButton,
  alpha,
} from '@mui/material'
import {
  Close as CloseIcon,
  Edit as EditIcon,
  OpenInNew as OpenIcon,
} from '@mui/icons-material'

const EmployeeModal = ({ employee, onClose, onEdit }) => {
  const navigate = useNavigate()

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
    })
  }

  const getAttendanceStats = (attendance) => {
    if (!attendance || attendance.length === 0) {
      return { total: 0, present: 0, absent: 0, rate: 0 }
    }
    const present = attendance.filter((a) => a.status).length
    const absent = attendance.length - present
    return {
      total: attendance.length,
      present,
      absent,
      rate: Math.round((present / attendance.length) * 100),
    }
  }

  const stats = getAttendanceStats(employee.attendance)

  const handleViewFullDetails = () => {
    onClose()
    navigate(`/employees/${employee.id}`)
  }

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 4 },
      }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 3,
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: 'white',
          }}
        >
          <Avatar
            sx={{
              width: 64,
              height: 64,
              fontSize: '1.75rem',
              bgcolor: 'secondary.main',
            }}
          >
            {employee.name[0].toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {employee.name}
            </Typography>
            <Chip
              size="small"
              label={employee.isActive ? 'Active Employee' : 'Inactive'}
              color={employee.isActive ? 'success' : 'error'}
              sx={{ mt: 1 }}
            />
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Personal Information */}
        <br/>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
          PERSONAL INFORMATION
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Email
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {employee.user?.email || 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Age
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {employee.age || 'Not specified'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Class
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {employee.class || 'Not assigned'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Role
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {employee.user?.role || 'EMPLOYEE'}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Subjects */}
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
          SUBJECTS
        </Typography>
        {employee.subjects && employee.subjects.length > 0 ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {employee.subjects.map((subject) => (
              <Chip
                key={subject.id}
                label={subject.name}
                size="small"
                sx={{
                  bgcolor: alpha('#6366f1', 0.1),
                  color: '#6366f1',
                  fontWeight: 500,
                }}
              />
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            No subjects assigned
          </Typography>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Attendance Stats */}
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
          ATTENDANCE OVERVIEW
        </Typography>
        <Grid container spacing={2}>
          {[
            { label: 'Total Records', value: stats.total, color: '#64748b' },
            { label: 'Present', value: stats.present, color: '#10b981' },
            { label: 'Absent', value: stats.absent, color: '#ef4444' },
            {
              label: 'Rate',
              value: `${stats.rate}%`,
              color: stats.rate >= 80 ? '#10b981' : stats.rate >= 60 ? '#f59e0b' : '#ef4444',
            },
          ].map((stat, index) => (
            <Grid item xs={3} key={index}>
              <Box
                sx={{
                  textAlign: 'center',
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(stat.color, 0.08),
                }}
              >
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: stat.color, mb: 0.5 }}
                >
                  {stat.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stat.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Dates */}
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Created
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {formatDate(employee.createdAt)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Last Updated
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {formatDate(employee.updatedAt)}
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0, gap: 1 }}>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
        <Button
          variant="outlined"
          startIcon={<OpenIcon />}
          onClick={handleViewFullDetails}
        >
          Full Details
        </Button>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={onEdit}
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
          }}
        >
          Edit Employee
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EmployeeModal
