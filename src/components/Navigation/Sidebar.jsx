import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Divider,
  Collapse,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  EventNote as EventNoteIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  ExpandLess,
  ExpandMore,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
} from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext'

const Sidebar = ({ drawerWidth, mobileOpen, onClose, isMobile }) => {
  const { user, isAdmin, logout } = useAuth()
  const location = useLocation()
  const [openSubmenu, setOpenSubmenu] = useState(null)
  const [logoutDialog, setLogoutDialog] = useState(false)

  const menuItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: <DashboardIcon />,
    },
    {
      label: 'Employees',
      icon: <PeopleIcon />,
      adminOnly: true,
      submenu: [
        { label: 'All Employees', path: '/employees', icon: <VisibilityIcon /> },
        { label: 'Add New', path: '/employees?action=new', icon: <AddIcon /> },
      ],
    },
    {
      label: 'Subjects',
      path: '/subjects',
      icon: <SchoolIcon />,
      adminOnly: true,
    },
    {
      label: 'Attendance',
      icon: <EventNoteIcon />,
      submenu: [
        { label: 'View Records', path: '/attendance', icon: <VisibilityIcon /> },
        { label: 'Mark Attendance', path: '/attendance?action=mark', adminOnly: true, icon: <EditIcon /> },
      ],
    },
    {
      label: 'My Profile',
      path: '/profile',
      icon: <PersonIcon />,
    },
  ]

  const toggleSubmenu = (index) => {
    setOpenSubmenu(openSubmenu === index ? null : index)
  }

  const handleLogout = () => {
    setLogoutDialog(true)
  }

  const confirmLogout = () => {
    setLogoutDialog(false)
    logout()
    onClose()
  }

  const isActive = (path) => {
    if (path.includes('?')) {
      return location.pathname + location.search === path
    }
    return location.pathname === path
  }

  const filteredMenuItems = menuItems.filter((item) => {
    if (item.adminOnly && !isAdmin()) return false
    return true
  })

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: 'primary.main',
        color: 'white',
      }}
    >
      {/* Brand Header */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            E
          </Typography>
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            Employee
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            Management Portal
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: alpha('#fff', 0.1) }} />

      {/* User Info */}
      <Box
        sx={{
          p: 2,
          mx: 2,
          my: 2,
          borderRadius: 3,
          bgcolor: alpha('#fff', 0.05),
          border: `1px solid ${alpha('#fff', 0.1)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: 'secondary.main',
              fontSize: '1.2rem',
            }}
          >
            {user?.employee?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.employee?.name || user?.email?.split('@')[0] || 'User'}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                opacity: 0.7,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.role}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, px: 1, overflow: 'auto' }}>
        <List component="nav" disablePadding>
          {filteredMenuItems.map((item, index) => (
            <React.Fragment key={index}>
              {item.submenu ? (
                <>
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      onClick={() => toggleSubmenu(index)}
                      sx={{
                        borderRadius: 2,
                        mx: 1,
                        color: alpha('#fff', 0.8),
                        '&:hover': {
                          bgcolor: alpha('#fff', 0.08),
                          color: '#fff',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText primary={item.label} />
                      {openSubmenu === index ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                  </ListItem>
                  <Collapse in={openSubmenu === index} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.submenu
                        .filter((sub) => !sub.adminOnly || isAdmin())
                        .map((subItem, subIndex) => (
                          <ListItem key={subIndex} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                              component={NavLink}
                              to={subItem.path}
                              onClick={isMobile ? onClose : undefined}
                              sx={{
                                borderRadius: 2,
                                mx: 1,
                                ml: 3,
                                color: alpha('#fff', 0.7),
                                bgcolor: isActive(subItem.path) ? alpha('#fff', 0.12) : 'transparent',
                                '&:hover': {
                                  bgcolor: alpha('#fff', 0.08),
                                  color: '#fff',
                                },
                                '&.active': {
                                  bgcolor: alpha('#fff', 0.12),
                                  color: '#fff',
                                },
                              }}
                            >
                              <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
                                {subItem.icon}
                              </ListItemIcon>
                              <ListItemText
                                primary={subItem.label}
                                primaryTypographyProps={{ variant: 'body2' }}
                              />
                            </ListItemButton>
                          </ListItem>
                        ))}
                    </List>
                  </Collapse>
                </>
              ) : (
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    component={NavLink}
                    to={item.path}
                    onClick={isMobile ? onClose : undefined}
                    sx={{
                      borderRadius: 2,
                      mx: 1,
                      color: alpha('#fff', 0.8),
                      bgcolor: isActive(item.path) ? alpha('#fff', 0.12) : 'transparent',
                      '&:hover': {
                        bgcolor: alpha('#fff', 0.08),
                        color: '#fff',
                      },
                      '&.active': {
                        bgcolor: alpha('#fff', 0.12),
                        color: '#fff',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                </ListItem>
              )}
            </React.Fragment>
          ))}
        </List>
      </Box>

      {/* Logout Button */}
      <Box sx={{ p: 2 }}>
        <Divider sx={{ borderColor: alpha('#fff', 0.1), mb: 2 }} />
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            color: alpha('#fff', 0.8),
            bgcolor: alpha('#ef4444', 0.1),
            '&:hover': {
              bgcolor: alpha('#ef4444', 0.2),
              color: '#fff',
            },
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Sign Out" />
        </ListItemButton>
      </Box>
    </Box>
  )

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            border: 'none',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            border: 'none',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialog}
        onClose={() => setLogoutDialog(false)}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Sign Out?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to sign out?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button
            variant="outlined"
            onClick={() => setLogoutDialog(false)}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={confirmLogout}
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
            }}
          >
            Yes, Sign Out
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default Sidebar
