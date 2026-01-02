import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  IconButton,
  alpha,
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'

const EmployeeForm = ({ employee, subjects, availableUsers, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    userId: '',
    name: '',
    age: '',
    class: '',
    isActive: true,
    subjectIds: [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (employee) {
      setFormData({
        userId: employee.userId || '',
        name: employee.name || '',
        age: employee.age || '',
        class: employee.class || '',
        isActive: employee.isActive !== undefined ? employee.isActive : true,
        subjectIds: employee.subjects?.map((s) => s.id) || [],
      })
    }
  }, [employee])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' || name === 'isActive' ? checked : value,
    }))
  }

  const handleSwitchChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      isActive: e.target.checked,
    }))
  }

  const handleSubjectToggle = (subjectId) => {
    setFormData((prev) => ({
      ...prev,
      subjectIds: prev.subjectIds.includes(subjectId)
        ? prev.subjectIds.filter((id) => id !== subjectId)
        : [...prev.subjectIds, subjectId],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const submitData = {
        name: formData.name,
        age: formData.age ? parseInt(formData.age) : null,
        class: formData.class || null,
        subjectIds: formData.subjectIds.length > 0 ? formData.subjectIds : undefined,
      }

      if (!employee) {
        if (!formData.userId) {
          setError('Please select a user')
          setLoading(false)
          return
        }
        submitData.userId = formData.userId
      } else {
        submitData.isActive = formData.isActive
      }

      await onSubmit(submitData)
    } catch (err) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
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
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 3,
          pb: 1,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {employee ? 'Edit Employee' : 'Add New Employee'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {employee ? 'Update employee information' : 'Create a new employee record'}
          </Typography>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {!employee && (
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Select User *</InputLabel>
              <Select
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                label="Select User *"
                required
              >
                <MenuItem value="">
                  <em>-- Select a user --</em>
                </MenuItem>
                {availableUsers && availableUsers.length > 0 ? (
                  availableUsers.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.email} ({user.role})
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No users available</MenuItem>
                )}
              </Select>
              {(!availableUsers || availableUsers.length === 0) && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  No users without employee records found. Register new users first.
                </Typography>
              )}
            </FormControl>
          )}

          <TextField
            fullWidth
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
            placeholder="Enter full name"
          />

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                inputProps={{ min: 1, max: 120 }}
                placeholder="Enter age"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Class"
                name="class"
                value={formData.class}
                onChange={handleChange}
                placeholder="Enter class"
              />
            </Grid>
          </Grid>

          {employee && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: formData.isActive ? alpha('#10b981', 0.08) : alpha('#ef4444', 0.08),
                mb: 3,
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleSwitchChange}
                    color={formData.isActive ? 'success' : 'default'}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Active Employee
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formData.isActive
                        ? 'Employee is currently active'
                        : 'Employee is currently inactive'}
                    </Typography>
                  </Box>
                }
              />
            </Box>
          )}

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              Subjects
            </Typography>
            {subjects.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {subjects.map((subject) => (
                  <Chip
                    key={subject.id}
                    label={subject.name}
                    onClick={() => handleSubjectToggle(subject.id)}
                    color={formData.subjectIds.includes(subject.id) ? 'secondary' : 'default'}
                    variant={formData.subjectIds.includes(subject.id) ? 'filled' : 'outlined'}
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No subjects available. Create subjects first.
              </Typography>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0, gap: 1 }}>
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
              px: 4,
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : employee ? (
              'Update Employee'
            ) : (
              'Create Employee'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default EmployeeForm
