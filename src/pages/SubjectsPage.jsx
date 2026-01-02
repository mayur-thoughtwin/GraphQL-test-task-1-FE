import React, { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Grid,
  Avatar,
  AvatarGroup,
  Tooltip,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  alpha,
  Snackbar,
} from '@mui/material'
import {
  Add as AddIcon,
  School as SchoolIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import { GET_SUBJECTS } from '../graphql/queries'
import { CREATE_SUBJECT, DELETE_SUBJECT } from '../graphql/mutations'

const SubjectsPage = () => {
  const [showForm, setShowForm] = useState(false)
  const [newSubjectName, setNewSubjectName] = useState('')
  const [error, setError] = useState('')
  const [deleteDialog, setDeleteDialog] = useState({ open: false, subject: null })
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const { data, loading, refetch } = useQuery(GET_SUBJECTS)

  const [createSubject, { loading: creating }] = useMutation(CREATE_SUBJECT, {
    onCompleted: () => {
      setShowForm(false)
      setNewSubjectName('')
      refetch()
    },
    onError: (err) => {
      setError(err.message)
    },
  })

  const [deleteSubject] = useMutation(DELETE_SUBJECT, {
    onCompleted: () => refetch(),
  })

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    if (!newSubjectName.trim()) {
      setError('Subject name is required')
      return
    }
    await createSubject({
      variables: { input: { name: newSubjectName.trim() } },
    })
  }

  const handleDelete = (subject) => {
    setDeleteDialog({ open: true, subject })
  }

  const confirmDeleteSubject = async () => {
    const subject = deleteDialog.subject
    setDeleteDialog({ open: false, subject: null })
    try {
      await deleteSubject({ variables: { id: subject.id } })
      setSnackbar({
        open: true,
        message: `${subject.name} has been deleted.`,
        severity: 'success',
      })
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to delete subject.',
        severity: 'error',
      })
    }
  }

  const subjects = data?.subjects || []

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Subjects
          </Typography>
          <Chip
            label={`${subjects.length} total`}
            size="small"
            sx={{
              bgcolor: alpha('#f59e0b', 0.1),
              color: '#d97706',
              fontWeight: 600,
            }}
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowForm(true)}
          sx={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
          }}
        >
          Add Subject
        </Button>
      </Box>

      {/* Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#f59e0b' }} />
        </Box>
      ) : subjects.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: 3,
              bgcolor: alpha('#f59e0b', 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <SchoolIcon sx={{ fontSize: 40, color: '#f59e0b' }} />
          </Box>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            No subjects yet
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Create your first subject to get started.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowForm(true)}
            sx={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
            }}
          >
            Add Subject
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {subjects.map((subject) => (
            <Grid item xs={12} sm={6} md={4} key={subject.id}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                    borderColor: '#f59e0b',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: alpha('#f59e0b', 0.15),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <SchoolIcon sx={{ color: '#d97706' }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                    {subject.name}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    bgcolor: 'grey.50',
                    borderRadius: 2,
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#d97706' }}>
                      {subject.employees?.length || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Employees
                    </Typography>
                  </Box>
                  {subject.employees && subject.employees.length > 0 && (
                    <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 32, height: 32 } }}>
                      {subject.employees.slice(0, 5).map((emp) => (
                        <Tooltip key={emp.id} title={emp.name}>
                          <Avatar sx={{ bgcolor: 'secondary.main', fontSize: '0.875rem' }}>
                            {emp.name[0].toUpperCase()}
                          </Avatar>
                        </Tooltip>
                      ))}
                    </AvatarGroup>
                  )}
                </Box>

                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDelete(subject)}
                  fullWidth
                  sx={{ mt: 'auto' }}
                >
                  Delete Subject
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add Subject Dialog */}
      <Dialog
        open={showForm}
        onClose={() => setShowForm(false)}
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
              Add New Subject
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create a new subject for employees
            </Typography>
          </Box>
          <IconButton onClick={() => setShowForm(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleCreate}>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              fullWidth
              label="Subject Name"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              placeholder="Enter subject name"
              autoFocus
            />
          </DialogContent>

          <DialogActions sx={{ p: 2.5, pt: 0 }}>
            <Button variant="outlined" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={creating}
              sx={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
              }}
            >
              {creating ? <CircularProgress size={24} color="inherit" /> : 'Create Subject'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, subject: null })}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Delete Subject?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "<strong>{deleteDialog.subject?.name}</strong>"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button
            variant="outlined"
            onClick={() => setDeleteDialog({ open: false, subject: null })}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDeleteSubject}
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

export default SubjectsPage
