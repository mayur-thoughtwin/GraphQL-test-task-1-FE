import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Grid,
  alpha,
} from '@mui/material'
import {
  MoreVert as MoreIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Flag as FlagIcon,
} from '@mui/icons-material'

const EmployeeTileView = ({
  employees,
  onView,
  onEdit,
  onDelete,
  onFlag,
  flaggedEmployees,
}) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const [menuEmployee, setMenuEmployee] = useState(null)

  const handleMenuOpen = (e, employee) => {
    e.stopPropagation()
    setAnchorEl(e.currentTarget)
    setMenuEmployee(employee)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setMenuEmployee(null)
  }

  const handleAction = (action) => {
    if (menuEmployee) {
      action(menuEmployee)
    }
    handleMenuClose()
  }

  const getAttendanceRate = (attendance) => {
    if (!attendance || attendance.length === 0) return null
    const present = attendance.filter((a) => a.status).length
    return Math.round((present / attendance.length) * 100)
  }

  return (
    <>
      <Grid container spacing={3}>
        {employees.map((employee) => {
          const attendanceRate = getAttendanceRate(employee.attendance)

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={employee.id}>
              <Paper
                onClick={() => onView(employee)}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  border: '1px solid',
                  borderColor: flaggedEmployees.has(employee.id)
                    ? alpha('#f59e0b', 0.4)
                    : 'divider',
                  bgcolor: flaggedEmployees.has(employee.id)
                    ? alpha('#f59e0b', 0.04)
                    : 'background.paper',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                    borderColor: 'secondary.main',
                  },
                }}
              >
                {flaggedEmployees.has(employee.id) && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      color: '#f59e0b',
                    }}
                  >
                    <FlagIcon fontSize="small" />
                  </Box>
                )}

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 2,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      fontSize: '1.5rem',
                      bgcolor: 'secondary.main',
                    }}
                  >
                    {employee.name[0].toUpperCase()}
                  </Avatar>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, employee)}
                    sx={{ color: 'text.secondary' }}
                  >
                    <MoreIcon />
                  </IconButton>
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {employee.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {employee.class || 'No class assigned'}
                </Typography>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: attendanceRate !== null ? '1fr 1fr 1fr' : '1fr 1fr',
                    gap: 1,
                    mb: 2,
                    p: 1.5,
                    bgcolor: 'grey.50',
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Age
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {employee.age || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Subjects
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {employee.subjects?.length || 0}
                    </Typography>
                  </Box>
                  {attendanceRate !== null && (
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Attendance
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {attendanceRate}%
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Chip
                    size="small"
                    label={employee.isActive ? 'Active' : 'Inactive'}
                    color={employee.isActive ? 'success' : 'error'}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Click to view →
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          )
        })}
      </Grid>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
        PaperProps={{
          sx: { borderRadius: 2, minWidth: 180 },
        }}
      >
        <MenuItem onClick={() => handleAction(onView)}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction(onEdit)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction(onFlag)}>
          <ListItemIcon>
            <FlagIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            {menuEmployee && flaggedEmployees.has(menuEmployee.id) ? 'Unflag' : 'Flag'}
          </ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleAction(onDelete)} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}

export default EmployeeTileView
