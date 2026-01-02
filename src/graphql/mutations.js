import { gql } from '@apollo/client'
import { EMPLOYEE_FRAGMENT } from './queries'

// Employee Mutations
export const CREATE_EMPLOYEE = gql`
  ${EMPLOYEE_FRAGMENT}
  mutation CreateEmployee($input: CreateEmployeeInput!) {
    createEmployee(input: $input) {
      ...EmployeeFields
    }
  }
`

export const UPDATE_EMPLOYEE = gql`
  ${EMPLOYEE_FRAGMENT}
  mutation UpdateEmployee($id: ID!, $input: UpdateEmployeeInput!) {
    updateEmployee(id: $id, input: $input) {
      ...EmployeeFields
    }
  }
`

export const DELETE_EMPLOYEE = gql`
  mutation DeleteEmployee($id: ID!) {
    deleteEmployee(id: $id)
  }
`

// Subject Mutations
export const CREATE_SUBJECT = gql`
  mutation CreateSubject($input: CreateSubjectInput!) {
    createSubject(input: $input) {
      id
      name
    }
  }
`

export const DELETE_SUBJECT = gql`
  mutation DeleteSubject($id: ID!) {
    deleteSubject(id: $id)
  }
`

// Attendance Mutation
export const MARK_ATTENDANCE = gql`
  mutation MarkAttendance($input: MarkAttendanceInput!) {
    markAttendance(input: $input) {
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

// Update My Name (for both employees and admins)
export const UPDATE_MY_NAME = gql`
  ${EMPLOYEE_FRAGMENT}
  mutation UpdateMyName($input: UpdateMyNameInput!) {
    updateMyName(input: $input) {
      ...EmployeeFields
    }
  }
`

// OTP Mutations
export const SEND_OTP = gql`
  mutation SendOTP($input: SendOTPInput!) {
    sendOTP(input: $input) {
      success
      message
    }
  }
`

export const VERIFY_OTP = gql`
  mutation VerifyOTP($input: VerifyOTPInput!) {
    verifyOTP(input: $input) {
      success
      message
      user {
        id
        email
        role
        otpVerified
      }
    }
  }
`

export const RESEND_OTP = gql`
  mutation ResendOTP($input: SendOTPInput!) {
    resendOTP(input: $input) {
      success
      message
    }
  }
`

