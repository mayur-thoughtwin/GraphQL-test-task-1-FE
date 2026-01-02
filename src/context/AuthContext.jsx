import React, { createContext, useContext, useState, useEffect } from 'react'
import { useQuery, useMutation, gql } from '@apollo/client'
import { apolloClient } from '../apollo/client'

const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      role
      employee {
        id
        name
      }
    }
  }
`

const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        email
        role
        employee {
          id
          name
        }
      }
      success
      message
      requiresOTPVerification
      email
      otp
    }
  }
`

const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      success
      message
      email
      requiresOTPVerification
      otp
    }
  }
`

const SEND_OTP_MUTATION = gql`
  mutation SendOTP($input: SendOTPInput!) {
    sendOTP(input: $input) {
      success
      message
    }
  }
`

const VERIFY_OTP_MUTATION = gql`
  mutation VerifyOTP($input: VerifyOTPInput!) {
    verifyOTP(input: $input) {
      success
      message
      token
      user {
        id
        email
        role
        employee {
          id
          name
        }
      }
    }
  }
`

const RESEND_OTP_MUTATION = gql`
  mutation ResendOTP($input: SendOTPInput!) {
    resendOTP(input: $input) {
      success
      message
      otp
    }
  }
`

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState(null)
  const [requiresOTPVerification, setRequiresOTPVerification] = useState(false)

  const { data: meData, error: meError, refetch } = useQuery(ME_QUERY, {
    skip: !localStorage.getItem('token'),
    fetchPolicy: 'network-only',
    onError: (error) => {
      // Check if error is due to OTP verification required
      const otpRequired = error.graphQLErrors?.some(
        (e) => e.extensions?.code === 'OTP_REQUIRED'
      )
      if (otpRequired) {
        const email = error.graphQLErrors?.find(
          (e) => e.extensions?.code === 'OTP_REQUIRED'
        )?.extensions?.email
        if (email) {
          setPendingVerificationEmail(email)
          setRequiresOTPVerification(true)
        }
        localStorage.removeItem('token')
      }
    },
  })

  // Handle user data updates
  useEffect(() => {
    if (meData?.me) {
      setUser(meData.me)
      setRequiresOTPVerification(false)
      setLoading(false)
    }
  }, [meData])

  // Handle errors
  useEffect(() => {
    if (meError) {
      // Don't remove token if it's an OTP required error - we handle it above
      const isOTPError = meError.graphQLErrors?.some(
        (e) => e.extensions?.code === 'OTP_REQUIRED'
      )
      if (!isOTPError) {
        localStorage.removeItem('token')
      }
      setLoading(false)
    }
  }, [meError])

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      setLoading(false)
    }
  }, [])

  const [loginMutation] = useMutation(LOGIN_MUTATION)
  const [registerMutation] = useMutation(REGISTER_MUTATION)
  const [sendOTPMutation] = useMutation(SEND_OTP_MUTATION)
  const [verifyOTPMutation] = useMutation(VERIFY_OTP_MUTATION)
  const [resendOTPMutation] = useMutation(RESEND_OTP_MUTATION)

  const login = async (email, password) => {
    // Convert email to lowercase for case-insensitive handling
    const normalizedEmail = email.toLowerCase().trim()
    const { data } = await loginMutation({
      variables: { input: { email: normalizedEmail, password } }
    })
    
    const result = data.login
    
    // Check if OTP verification is required
    if (result.requiresOTPVerification) {
      setPendingVerificationEmail(result.email)
      setRequiresOTPVerification(true)
      return {
        requiresOTPVerification: true,
        email: result.email,
        message: result.message,
        otp: result.otp, // Pass OTP for display
      }
    }
    
    // Login successful
    if (result.token && result.user) {
      localStorage.setItem('token', result.token)
      setUser(result.user)
      setRequiresOTPVerification(false)
      await apolloClient.resetStore()
      return {
        requiresOTPVerification: false,
        user: result.user,
      }
    }
    
    throw new Error(result.message || 'Login failed')
  }

  const register = async (email, password, role = 'EMPLOYEE') => {
    // Convert email to lowercase for case-insensitive handling
    const normalizedEmail = email.toLowerCase().trim()
    const { data } = await registerMutation({
      variables: { input: { email: normalizedEmail, password, role } }
    })
    
    const result = data.register
    
    // Registration always requires OTP verification
    if (result.requiresOTPVerification) {
      setPendingVerificationEmail(result.email)
      setRequiresOTPVerification(true)
      return {
        requiresOTPVerification: true,
        email: result.email,
        message: result.message,
        success: result.success,
        otp: result.otp, // Pass OTP for display
      }
    }
    
    return result
  }

  const sendOTP = async (email) => {
    // Convert email to lowercase for case-insensitive handling
    const normalizedEmail = email.toLowerCase().trim()
    const { data } = await sendOTPMutation({
      variables: { input: { email: normalizedEmail } }
    })
    setPendingVerificationEmail(normalizedEmail)
    setRequiresOTPVerification(true)
    return data.sendOTP
  }

  const verifyOTP = async (email, otp) => {
    // Convert email to lowercase for case-insensitive handling
    const normalizedEmail = email.toLowerCase().trim()
    const { data } = await verifyOTPMutation({
      variables: { input: { email: normalizedEmail, otp } }
    })
    
    const result = data.verifyOTP
    
    if (result.success && result.token && result.user) {
      // Save token and set user after successful OTP verification
      localStorage.setItem('token', result.token)
      setUser(result.user)
      setPendingVerificationEmail(null)
      setRequiresOTPVerification(false)
      await apolloClient.resetStore()
    }
    
    return result
  }

  const resendOTP = async (email) => {
    // Convert email to lowercase for case-insensitive handling
    const normalizedEmail = email.toLowerCase().trim()
    const { data } = await resendOTPMutation({
      variables: { input: { email: normalizedEmail } }
    })
    return data.resendOTP
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setPendingVerificationEmail(null)
    setRequiresOTPVerification(false)
    apolloClient.resetStore()
  }

  const clearPendingVerification = () => {
    setPendingVerificationEmail(null)
    setRequiresOTPVerification(false)
  }

  // RBAC helpers
  const isAdmin = () => user?.role === 'ADMIN'
  const isEmployee = () => user?.role === 'EMPLOYEE'
  const hasPermission = (permission) => {
    const adminPermissions = ['create', 'update', 'delete', 'view_all', 'manage_attendance', 'manage_subjects']
    const employeePermissions = ['view_own', 'view_attendance']
    
    if (isAdmin()) {
      return adminPermissions.includes(permission) || employeePermissions.includes(permission)
    }
    return employeePermissions.includes(permission)
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    sendOTP,
    verifyOTP,
    resendOTP,
    pendingVerificationEmail,
    setPendingVerificationEmail,
    requiresOTPVerification,
    setRequiresOTPVerification,
    clearPendingVerification,
    isAuthenticated: !!user,
    isAdmin,
    isEmployee,
    hasPermission,
    refetch
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
