# Employee Portal Frontend

A modern React-based employee management portal with a beautiful dark theme UI.

## Features

### Navigation
- **Hamburger Menu**: Collapsible sidebar with one-level deep sub-menus
- **Horizontal Menu**: Quick access navigation bar with user menu
- **React Router DOM**: Client-side routing with protected routes

### Views
- **Grid View**: 10-column data table with sorting, filtering, and pagination
- **Tile View**: Beautiful card-based layout with action menus
- **Detail View**: Full employee profile with attendance charts
- **Modal View**: Quick preview popup for employee details

### RBAC (Role-Based Access Control)
- **Admin Role**: Full access to all features (CRUD operations)
- **Employee Role**: Limited access to own profile and attendance

### Tech Stack
- **React 18** - UI Framework
- **Apollo Client** - GraphQL client
- **React Router DOM** - Routing
- **Vite** - Build tool

## Getting Started

### Prerequisites
- Node.js 18+
- Backend server running on port 4000

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Production Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── apollo/
│   └── client.js          # Apollo Client configuration
├── components/
│   ├── Employees/
│   │   ├── EmployeeGrid.jsx      # Grid view component
│   │   ├── EmployeeTileView.jsx  # Tile view component
│   │   ├── EmployeeModal.jsx     # Detail popup
│   │   └── EmployeeForm.jsx      # Create/Edit form
│   ├── Layout/
│   │   └── Layout.jsx            # Main layout wrapper
│   └── Navigation/
│       ├── HamburgerMenu.jsx     # Sidebar navigation
│       └── HorizontalMenu.jsx    # Top navigation bar
├── context/
│   └── AuthContext.jsx    # Authentication & RBAC context
├── graphql/
│   ├── queries.js         # GraphQL queries
│   └── mutations.js       # GraphQL mutations
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── EmployeesPage.jsx
│   ├── EmployeeDetail.jsx
│   ├── SubjectsPage.jsx
│   ├── AttendancePage.jsx
│   └── ProfilePage.jsx
├── styles/
│   ├── index.css          # Global styles & CSS variables
│   └── App.css            # App-wide styles
├── App.jsx                # Main app with routing
└── main.jsx               # Entry point
```

## GraphQL API

The frontend connects to a GraphQL backend at `http://localhost:4000/graphql`.

### Queries
- `employees` - Get paginated employees with filters
- `employee(id)` - Get single employee
- `myProfile` - Get current user's employee profile
- `subjects` - Get all subjects
- `attendanceByEmployee` - Get attendance records

### Mutations
- `login` / `register` - Authentication
- `createEmployee` / `updateEmployee` / `deleteEmployee`
- `createSubject` / `deleteSubject`
- `markAttendance`

## Design System

### Color Palette (Midnight Aurora Theme)
- Primary Background: `#0a0e17`
- Card Background: `#161d2d`
- Accent Primary: `#6366f1` (Indigo)
- Accent Secondary: `#8b5cf6` (Purple)
- Accent Tertiary: `#ec4899` (Pink)
- Success: `#10b981` (Emerald)
- Danger: `#ef4444` (Red)

### Typography
- Primary Font: Outfit
- Monospace: JetBrains Mono

## License

MIT

