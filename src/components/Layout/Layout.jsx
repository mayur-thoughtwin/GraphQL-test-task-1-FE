import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Box, useMediaQuery, useTheme } from '@mui/material'
import Sidebar from '../Navigation/Sidebar'
import TopBar from '../Navigation/TopBar'

const DRAWER_WIDTH = 280

const Layout = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar */}
      <Sidebar
        drawerWidth={DRAWER_WIDTH}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        isMobile={isMobile}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
        }}
      >
        {/* Top Bar */}
        <TopBar onMenuToggle={handleDrawerToggle} isMobile={isMobile} />

        {/* Page Content */}
        <Box
          sx={{
            flexGrow: 1,
            px: { xs: 2, sm: 3, md: 3 },
            py: { xs: 2, sm: 2, md: 3 },
            pt: { xs: 10, sm: 11, md: 11 },
            width: '100%',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

export default Layout
