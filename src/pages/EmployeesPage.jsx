import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { useSearchParams } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  CircularProgress,
  Chip,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  TablePagination,
} from '@mui/material'
import {
  Add as AddIcon,
  Search as SearchIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  FilterAlt as FilterIcon,
  Clear as ClearIcon,
} from '@mui/icons-material'
import { GET_EMPLOYEES, GET_SUBJECTS, GET_USERS_WITHOUT_EMPLOYEES } from '../graphql/queries'
import { CREATE_EMPLOYEE, UPDATE_EMPLOYEE, DELETE_EMPLOYEE } from '../graphql/mutations'
import EmployeeGrid from '../components/Employees/EmployeeGrid'
import EmployeeTileView from '../components/Employees/EmployeeTileView'
import EmployeeModal from '../components/Employees/EmployeeModal'
import EmployeeForm from '../components/Employees/EmployeeForm'

const EmployeesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState('grid')
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [flaggedEmployees, setFlaggedEmployees] = useState(new Set())
  const [deleteDialog, setDeleteDialog] = useState({ open: false, employee: null })
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  // Pagination and filtering state
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [filters, setFilters] = useState({
    name: '',
    class: '',
    isActive: null,
  })
  const [sortConfig, setSortConfig] = useState({ field: 'createdAt', order: 'desc' })

  // Check for action query param
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setShowForm(true)
      setEditingEmployee(null)
    }
  }, [searchParams])

  // GraphQL queries
  const { data, loading, error, refetch } = useQuery(GET_EMPLOYEES, {
    variables: {
      filter: {
        name: filters.name || undefined,
        class: filters.class || undefined,
        isActive: filters.isActive === null ? undefined : filters.isActive,
      },
      skip: page * rowsPerPage,
      take: rowsPerPage,
      sortBy: sortConfig.field,
      sortOrder: sortConfig.order,
    },
    fetchPolicy: 'cache-and-network',
  })

  const { data: subjectsData } = useQuery(GET_SUBJECTS)

  const { data: usersData, refetch: refetchUsers } = useQuery(GET_USERS_WITHOUT_EMPLOYEES, {
    fetchPolicy: 'network-only',
  })

  // Mutations
  const [createEmployee] = useMutation(CREATE_EMPLOYEE, {
    onCompleted: () => {
      setShowForm(false)
      setSearchParams({})
      refetch()
      refetchUsers()
    },
  })

  const [updateEmployee] = useMutation(UPDATE_EMPLOYEE, {
    onCompleted: () => {
      setShowForm(false)
      setEditingEmployee(null)
      refetch()
    },
  })

  const [deleteEmployee] = useMutation(DELETE_EMPLOYEE, {
    onCompleted: () => {
      refetch()
    },
  })

  // Get employees from API (backend already filters out admin-linked employees)
  const employees = data?.employees?.employees || []
  const totalCount = data?.employees?.totalCount || 0

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee)
    setShowModal(true)
  }

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee)
    setShowForm(true)
  }

  const handleDeleteEmployee = (employee) => {
    setDeleteDialog({ open: true, employee })
  }

  const confirmDeleteEmployee = async () => {
    const employee = deleteDialog.employee
    setDeleteDialog({ open: false, employee: null })
    try {
      await deleteEmployee({ variables: { id: employee.id } })
      setSnackbar({
        open: true,
        message: `${employee.name} has been deleted.`,
        severity: 'success',
      })
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to delete employee.',
        severity: 'error',
      })
    }
  }

  const handleFlagEmployee = (employee) => {
    setFlaggedEmployees((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(employee.id)) {
        newSet.delete(employee.id)
      } else {
        newSet.add(employee.id)
      }
      return newSet
    })
  }

  const handleFormSubmit = async (formData) => {
    if (editingEmployee) {
      await updateEmployee({
        variables: {
          id: editingEmployee.id,
          input: formData,
        },
      })
    } else {
      await createEmployee({
        variables: { input: formData },
      })
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingEmployee(null)
    setSearchParams({})
  }

  const handleSort = (field) => {
    setSortConfig((prev) => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc',
    }))
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(0)
  }

  const clearFilters = () => {
    setFilters({ name: '', class: '', isActive: null })
    setPage(0)
  }

  const hasActiveFilters = filters.name || filters.class || filters.isActive !== null

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
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Employees
          </Typography>
          <Chip
            label={`${totalCount} total`}
            size="small"
            sx={{
              bgcolor: alpha('#6366f1', 0.1),
              color: '#6366f1',
              fontWeight: 600,
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, value) => value && setViewMode(value)}
            size="small"
          >
            <ToggleButton value="grid" aria-label="grid view">
              <ListViewIcon />
            </ToggleButton>
            <ToggleButton value="tile" aria-label="tile view">
              <GridViewIcon />
            </ToggleButton>
          </ToggleButtonGroup>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setShowForm(true)
              setEditingEmployee(null)
              refetchUsers()
            }}
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
            }}
          >
            Add Employee
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            alignItems: { xs: 'stretch', md: 'center' },
          }}
        >
          <TextField
            placeholder="Search by name..."
            size="small"
            value={filters.name}
            onChange={(e) => handleFilterChange('name', e.target.value)}
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            placeholder="Filter by class..."
            size="small"
            value={filters.class}
            onChange={(e) => handleFilterChange('class', e.target.value)}
            sx={{ width: { xs: '100%', md: 180 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FilterIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ width: { xs: '100%', md: 150 } }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.isActive === null ? '' : filters.isActive.toString()}
              onChange={(e) =>
                handleFilterChange(
                  'isActive',
                  e.target.value === '' ? null : e.target.value === 'true'
                )
              }
              label="Status"
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </Select>
          </FormControl>
          {hasActiveFilters && (
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={clearFilters}
              color="secondary"
            >
              Clear
            </Button>
          )}
        </Box>
      </Paper>

      {/* Content */}
      {loading && !data ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Typography color="error" sx={{ mb: 2 }}>
            Error loading employees: {error.message}
          </Typography>
          <Button onClick={() => refetch()}>Retry</Button>
        </Paper>
      ) : employees.length === 0 ? (
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
            <Typography variant="h3" sx={{ color: '#6366f1' }}>
              👥
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            No employees found
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Start by adding your first employee or adjust your filters.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setShowForm(true)
              refetchUsers()
            }}
          >
            Add Employee
          </Button>
        </Paper>
      ) : viewMode === 'grid' ? (
        <EmployeeGrid
          employees={employees}
          onView={handleViewEmployee}
          onEdit={handleEditEmployee}
          onDelete={handleDeleteEmployee}
          onFlag={handleFlagEmployee}
          flaggedEmployees={flaggedEmployees}
          sortConfig={sortConfig}
          onSort={handleSort}
        />
      ) : (
        <EmployeeTileView
          employees={employees}
          onView={handleViewEmployee}
          onEdit={handleEditEmployee}
          onDelete={handleDeleteEmployee}
          onFlag={handleFlagEmployee}
          flaggedEmployees={flaggedEmployees}
        />
      )}

      {/* Pagination */}
      {totalCount > 0 && (
        <Paper sx={{ mt: 3, borderRadius: 3, overflow: 'hidden' }}>
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Rows per page:"
            sx={{
              '.MuiTablePagination-toolbar': {
                px: 3,
                py: 1.5,
              },
              '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                fontWeight: 500,
              },
            }}
          />
        </Paper>
      )}

      {/* Modal */}
      {showModal && selectedEmployee && (
        <EmployeeModal
          employee={selectedEmployee}
          onClose={() => {
            setShowModal(false)
            setSelectedEmployee(null)
          }}
          onEdit={() => {
            setShowModal(false)
            handleEditEmployee(selectedEmployee)
          }}
        />
      )}

      {/* Form */}
      {showForm && (
        <EmployeeForm
          employee={editingEmployee}
          subjects={subjectsData?.subjects || []}
          availableUsers={usersData?.usersWithoutEmployees || []}
          onSubmit={handleFormSubmit}
          onClose={handleCloseForm}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, employee: null })}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Delete Employee?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{deleteDialog.employee?.name}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button
            variant="outlined"
            onClick={() => setDeleteDialog({ open: false, employee: null })}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDeleteEmployee}
          >
            Yes, Delete
          </Button>
        </DialogActions>
      </Dialog>

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

export default EmployeesPage
