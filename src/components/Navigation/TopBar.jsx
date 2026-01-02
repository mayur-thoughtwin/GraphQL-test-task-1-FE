import React, { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useLazyQuery, useQuery } from '@apollo/client'
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Tooltip,
  InputBase,
  alpha,
  useTheme,
  Button,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Chip,
  ClickAwayListener,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext'
import { SEARCH_EMPLOYEES, GET_SUBJECTS } from '../../graphql/queries'

const TopBar = ({ onMenuToggle, isMobile }) => {
  const theme = useTheme()
  const navigate = useNavigate()
  const { user, isAdmin, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const searchInputRef = useRef(null)

  const quickLinks = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Employees', path: '/employees', adminOnly: true },
    { label: 'Subjects', path: '/subjects', adminOnly: true },
    { label: 'Attendance', path: '/attendance' },
  ]

  const filteredLinks = quickLinks.filter((link) => {
    if (link.adminOnly && !isAdmin()) return false
    return true
  })

  // Fetch employees based on search query
  const [searchEmployees, { data: employeesData, loading: employeesLoading }] = useLazyQuery(
    SEARCH_EMPLOYEES,
    {
      fetchPolicy: 'network-only',
    }
  )

  // Fetch all subjects
  const { data: subjectsData, loading: subjectsLoading } = useQuery(GET_SUBJECTS, {
    skip: !isAdmin(),
  })

  // Debounce search
  useEffect(() => {
    if (searchQuery.trim().length >= 1 && isAdmin()) {
      const timer = setTimeout(() => {
        searchEmployees({
          variables: {
            filter: { name: searchQuery.trim() },
            take: 5,
          },
        })
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [searchQuery, searchEmployees, isAdmin])

  // Filter subjects based on search query
  const filteredSubjects =
    subjectsData?.subjects?.filter((subject) =>
      subject.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []

  // Get employees from search
  const searchedEmployees = employeesData?.employees?.employees || []

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
    if (e.target.value.trim()) {
      setShowResults(true)
    } else {
      setShowResults(false)
    }
  }

  const handleResultClick = (type, id) => {
    if (type === 'employee') {
      navigate(`/employees/${id}`)
    } else if (type === 'subject') {
      navigate('/subjects')
    }
    setSearchQuery('')
    setShowResults(false)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setShowResults(false)
    searchInputRef.current?.focus()
  }

  const handleClickAway = () => {
    setShowResults(false)
  }

  const handleSearchFocus = () => {
    if (searchQuery.trim()) {
      setShowResults(true)
    }
  }

  const isLoading = employeesLoading || subjectsLoading
  const hasResults = searchedEmployees.length > 0 || filteredSubjects.length > 0
  const showNoResults = !isLoading && searchQuery.trim() && !hasResults

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: `1px solid ${theme.palette.divider}`,
        width: { md: `calc(100% - 280px)` },
        ml: { md: '280px' },
      }}
    >
      <Toolbar sx={{ gap: 2 }}>
        {/* Mobile Menu Button */}
        {isMobile && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMenuToggle}
            sx={{ color: 'text.primary' }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Quick Navigation - Desktop */}
        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {filteredLinks.map((link, index) => (
              <Button
                key={index}
                component={NavLink}
                to={link.path}
                sx={{
                  color: 'text.secondary',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.secondary.main, 0.08),
                    color: 'secondary.main',
                  },
                  '&.active': {
                    bgcolor: alpha(theme.palette.secondary.main, 0.12),
                    color: 'secondary.main',
                  },
                }}
              >
                {link.label}
              </Button>
            ))}
          </Box>
        )}

        <Box sx={{ flex: 1 }} />

        {/* Search Bar - Desktop (Admin Only) */}
        {!isMobile && isAdmin() && (
          <ClickAwayListener onClickAway={handleClickAway}>
            <Box sx={{ position: 'relative' }}>
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.grey[500], 0.08),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.grey[500], 0.12),
                  },
                  width: 280,
                  border: showResults ? `2px solid ${theme.palette.secondary.main}` : '2px solid transparent',
                  transition: 'border-color 0.2s ease',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    pl: 2,
                    pointerEvents: 'none',
                  }}
                >
                  <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                </Box>
                <InputBase
                  inputRef={searchInputRef}
                  placeholder="Search employees, subjects..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={handleSearchFocus}
                  sx={{
                    width: '100%',
                    '& .MuiInputBase-input': {
                      py: 1,
                      pl: 5,
                      pr: searchQuery ? 4 : 2,
                      fontSize: '0.875rem',
                    },
                  }}
                />
                {searchQuery && (
                  <IconButton
                    size="small"
                    onClick={handleClearSearch}
                    sx={{
                      position: 'absolute',
                      right: 4,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'text.secondary',
                      '&:hover': { color: 'text.primary' },
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                )}
              </Box>

              {/* Search Results Dropdown */}
              {showResults && searchQuery.trim() && (
                <Paper
                  elevation={8}
                  sx={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    mt: 1,
                    borderRadius: 2,
                    maxHeight: 400,
                    overflow: 'auto',
                    zIndex: 1300,
                  }}
                >
                  {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                      <CircularProgress size={24} color="secondary" />
                    </Box>
                  ) : (
                    <>
                      {/* Employees Section */}
                      {searchedEmployees.length > 0 && (
                        <>
                          <Box sx={{ px: 2, py: 1.5, bgcolor: 'grey.50' }}>
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}
                            >
                              Employees ({searchedEmployees.length})
                            </Typography>
                          </Box>
                          <List dense disablePadding>
                            {searchedEmployees.slice(0, 5).map((employee) => (
                              <ListItem
                                key={employee.id}
                                button
                                onClick={() => handleResultClick('employee', employee.id)}
                                sx={{
                                  py: 1.5,
                                  px: 2,
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.secondary.main, 0.08),
                                  },
                                }}
                              >
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                  <Avatar
                                    sx={{
                                      width: 32,
                                      height: 32,
                                      bgcolor: 'secondary.main',
                                      fontSize: '0.875rem',
                                    }}
                                  >
                                    {employee.name?.[0]?.toUpperCase() || 'E'}
                                  </Avatar>
                                </ListItemIcon>
                                <ListItemText
                                  primary={employee.name}
                                  secondary={employee.class ? `Class: ${employee.class}` : null}
                                  primaryTypographyProps={{ fontWeight: 500, fontSize: '0.9rem' }}
                                  secondaryTypographyProps={{ fontSize: '0.75rem' }}
                                />
                                <Chip
                                  label={employee.isActive ? 'Active' : 'Inactive'}
                                  size="small"
                                  sx={{
                                    bgcolor: employee.isActive
                                      ? alpha('#10b981', 0.1)
                                      : alpha('#ef4444', 0.1),
                                    color: employee.isActive ? '#059669' : '#dc2626',
                                    fontSize: '0.7rem',
                                    height: 22,
                                  }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </>
                      )}

                      {/* Subjects Section */}
                      {filteredSubjects.length > 0 && (
                        <>
                          {searchedEmployees.length > 0 && <Divider />}
                          <Box sx={{ px: 2, py: 1.5, bgcolor: 'grey.50' }}>
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}
                            >
                              Subjects ({filteredSubjects.length})
                            </Typography>
                          </Box>
                          <List dense disablePadding>
                            {filteredSubjects.slice(0, 5).map((subject) => (
                              <ListItem
                                key={subject.id}
                                button
                                onClick={() => handleResultClick('subject', subject.id)}
                                sx={{
                                  py: 1.5,
                                  px: 2,
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.warning.main, 0.08),
                                  },
                                }}
                              >
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                  <Box
                                    sx={{
                                      width: 32,
                                      height: 32,
                                      borderRadius: 1,
                                      bgcolor: alpha('#f59e0b', 0.15),
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    <SchoolIcon sx={{ fontSize: 18, color: '#d97706' }} />
                                  </Box>
                                </ListItemIcon>
                                <ListItemText
                                  primary={subject.name}
                                  primaryTypographyProps={{ fontWeight: 500, fontSize: '0.9rem' }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </>
                      )}

                      {/* No Results */}
                      {showNoResults && (
                        <Box sx={{ py: 4, textAlign: 'center' }}>
                          <SearchIcon sx={{ fontSize: 40, color: 'grey.400', mb: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            No results found for "{searchQuery}"
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Try searching with different keywords
                          </Typography>
                        </Box>
                      )}

                      {/* View All Link */}
                      {hasResults && (
                        <>
                          <Divider />
                          <Box sx={{ p: 1.5, textAlign: 'center' }}>
                            <Button
                              size="small"
                              onClick={() => {
                                navigate('/employees')
                                setSearchQuery('')
                                setShowResults(false)
                              }}
                              sx={{ color: 'secondary.main', fontSize: '0.8rem' }}
                            >
                              View All Employees →
                            </Button>
                          </Box>
                        </>
                      )}
                    </>
                  )}
                </Paper>
              )}
            </Box>
          </ClickAwayListener>
        )}

        {/* Notification Icon */}
        <Tooltip title="Notifications">
          <IconButton
            sx={{
              color: 'text.secondary',
              '&:hover': { color: 'secondary.main' },
            }}
          >
            <NotificationsIcon />
          </IconButton>
        </Tooltip>

        {/* User Profile */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            cursor: 'pointer',
            p: 1,
            borderRadius: 2,
            '&:hover': {
              bgcolor: alpha(theme.palette.grey[500], 0.08),
            },
          }}
          onClick={() => navigate('/profile')}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              fontSize: '0.9rem',
              bgcolor: 'secondary.main',
            }}
          >
            {user?.employee?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
          </Avatar>
          {!isMobile && (
            <Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.2 }}
              >
                {user?.employee?.name || user?.email?.split('@')[0] || 'User'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {user?.email}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Logout Button */}
        <Tooltip title="Sign Out">
          <IconButton
            onClick={logout}
            sx={{
              color: 'text.secondary',
              '&:hover': { color: 'error.main' },
            }}
          >
            <LogoutIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  )
}

export default TopBar
