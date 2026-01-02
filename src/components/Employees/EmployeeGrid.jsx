import React from 'react'
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material'
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Flag as FlagIcon,
} from '@mui/icons-material'

const EmployeeGrid = ({
  employees,
  onView,
  onEdit,
  onDelete,
  onFlag,
  flaggedEmployees,
  sortConfig,
  onSort,
}) => {
  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: false },
    { key: 'age', label: 'Age', sortable: true },
    { key: 'class', label: 'Class', sortable: true },
    { key: 'subjects', label: 'Subjects', sortable: false },
    { key: 'attendance', label: 'Attendance', sortable: false },
    { key: 'isActive', label: 'Status', sortable: false },
    { key: 'createdAt', label: 'Created', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false },
  ]

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
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getAttendanceRate = (attendance) => {
    if (!attendance || attendance.length === 0) return 'N/A'
    const present = attendance.filter((a) => a.status).length
    return `${Math.round((present / attendance.length) * 100)}%`
  }

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.key}
                sx={{
                  fontWeight: 600,
                  py: 2,
                  bgcolor: 'grey.50',
                }}
              >
                {col.sortable ? (
                  <TableSortLabel
                    active={sortConfig.field === col.key}
                    direction={sortConfig.field === col.key ? sortConfig.order : 'asc'}
                    onClick={() => onSort(col.key)}
                  >
                    {col.label}
                  </TableSortLabel>
                ) : (
                  col.label
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {employees.map((employee) => (
            <TableRow
              key={employee.id}
              onClick={() => onView(employee)}
              sx={{
                cursor: 'pointer',
                bgcolor: flaggedEmployees.has(employee.id) ? alpha('#f59e0b', 0.08) : 'inherit',
                '&:hover': {
                  bgcolor: flaggedEmployees.has(employee.id)
                    ? alpha('#f59e0b', 0.12)
                    : alpha('#6366f1', 0.04),
                },
              }}
            >
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    {employee.name[0].toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {employee.name}
                    </Typography>
                    {flaggedEmployees.has(employee.id) && (
                      <Chip
                        size="small"
                        label="Flagged"
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          bgcolor: alpha('#f59e0b', 0.15),
                          color: '#d97706',
                        }}
                      />
                    )}
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {employee.user?.email || 'N/A'}
                </Typography>
              </TableCell>
              <TableCell>{employee.age || 'N/A'}</TableCell>
              <TableCell>{employee.class || 'N/A'}</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {employee.subjects?.slice(0, 2).map((s) => (
                    <Chip
                      key={s.id}
                      size="small"
                      label={s.name}
                      sx={{
                        bgcolor: alpha('#6366f1', 0.1),
                        color: '#6366f1',
                        fontSize: '0.75rem',
                      }}
                    />
                  ))}
                  {employee.subjects?.length > 2 && (
                    <Chip
                      size="small"
                      label={`+${employee.subjects.length - 2}`}
                      sx={{
                        bgcolor: 'grey.100',
                        fontSize: '0.75rem',
                      }}
                    />
                  )}
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {getAttendanceRate(employee.attendance)}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={employee.isActive ? 'Active' : 'Inactive'}
                  color={employee.isActive ? 'success' : 'error'}
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(employee.createdAt)}
                </Typography>
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="View">
                    <IconButton
                      size="small"
                      onClick={() => onView(employee)}
                      sx={{ color: 'text.secondary' }}
                    >
                      <ViewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => onEdit(employee)}
                      sx={{ color: 'secondary.main' }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={flaggedEmployees.has(employee.id) ? 'Unflag' : 'Flag'}>
                    <IconButton
                      size="small"
                      onClick={() => onFlag(employee)}
                      sx={{
                        color: flaggedEmployees.has(employee.id) ? '#f59e0b' : 'text.secondary',
                      }}
                    >
                      <FlagIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={() => onDelete(employee)}
                      sx={{ color: 'error.main' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default EmployeeGrid
