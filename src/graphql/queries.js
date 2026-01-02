import { gql } from '@apollo/client'

// Employee fragments for reusability
export const EMPLOYEE_FRAGMENT = gql`
  fragment EmployeeFields on Employee {
    id
    userId
    name
    age
    class
    isActive
    createdAt
    updatedAt
    subjects {
      id
      name
    }
    attendance {
      id
      date
      status
    }
    user {
      id
      email
      role
    }
  }
`

// Queries
export const GET_EMPLOYEES = gql`
  ${EMPLOYEE_FRAGMENT}
  query GetEmployees(
    $filter: EmployeeFilterInput
    $skip: Int
    $take: Int
    $sortBy: SortField
    $sortOrder: SortOrder
  ) {
    employees(
      filter: $filter
      skip: $skip
      take: $take
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      employees {
        ...EmployeeFields
      }
      totalCount
      hasNextPage
      hasPreviousPage
    }
  }
`

export const GET_EMPLOYEE = gql`
  ${EMPLOYEE_FRAGMENT}
  query GetEmployee($id: ID!) {
    employee(id: $id) {
      ...EmployeeFields
    }
  }
`

export const GET_MY_PROFILE = gql`
  ${EMPLOYEE_FRAGMENT}
  query GetMyProfile {
    myProfile {
      ...EmployeeFields
    }
  }
`

export const GET_SUBJECTS = gql`
  query GetSubjects {
    subjects {
      id
      name
      employees {
        id
        name
      }
    }
  }
`

export const GET_ATTENDANCE = gql`
  query GetAttendance($employeeId: String!, $startDate: String, $endDate: String) {
    attendanceByEmployee(employeeId: $employeeId, startDate: $startDate, endDate: $endDate) {
      id
      date
      status
      employee {
        id
        name
      }
    }
  }
`

export const GET_USERS_WITHOUT_EMPLOYEES = gql`
  query GetUsersWithoutEmployees {
    usersWithoutEmployees {
      id
      email
      role
      createdAt
    }
  }
`

// Global search query for employees
export const SEARCH_EMPLOYEES = gql`
  query SearchEmployees($filter: EmployeeFilterInput, $take: Int) {
    employees(filter: $filter, take: $take) {
      employees {
        id
        name
        class
        isActive
      }
      totalCount
    }
  }
`

// Get all subjects for search
export const SEARCH_SUBJECTS = gql`
  query SearchSubjects {
    subjects {
      id
      name
    }
  }
`
