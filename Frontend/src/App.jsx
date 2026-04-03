import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import VoterLogin from './auth/VoterLogin'
import VoterRegister from './auth/VoterRegister'
import CandidateLogin from './auth/CandidateLogin'
import AdminLogin from './auth/AdminLogin'

import ElectionPage from './candidate/ElectionPage'
import CandidateDashboard from './candidate/CandidateDashboard'
import ForgotPassword from './auth/ForgotPassword'
import ResetPassword from './auth/ResetPassword'
import ChangeAdminPassword from './auth/ChangeAdminPassword'

import AdminDashboard from '../admin/AdminDashboard'
import AdminElections from '../admin/AdminElections'
import AdminVoters from '../admin/AdminVoters'
import AdminResults from '../admin/AdminResults'
import LandingPage from './components/LandingPage'

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Default → Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Public routes */}
        <Route path="/login" element={<VoterLogin />} />
        <Route path="/candidate-login" element={<CandidateLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/register" element={<VoterRegister />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:resetToken" element={<ResetPassword />} />

        {/* Protected: voters */}
        <Route
          path="/election"
          element={
            <ProtectedRoute allowedRoles={["voter", "admin", "candidate"]}>
              <ElectionPage />
            </ProtectedRoute>
          }
        />

        {/* Protected: candidates */}
        <Route
          path="/CandidateDashboard"
          element={
            <ProtectedRoute allowedRoles={["candidate", "admin"]}>
              <CandidateDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected: admin */}
        <Route
          path="/admin"
          element={
            // <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            // </ProtectedRoute>
          }
        />
        <Route
          path="/admin/change-password"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ChangeAdminPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/elections"
          element={
            // <ProtectedRoute allowedRoles={["admin"]}>
              <AdminElections />
            // </ProtectedRoute>
          }
        />
        <Route
          path="/admin/voters"
          element={
            // <ProtectedRoute allowedRoles={["admin"]}>
              <AdminVoters />
            // </ProtectedRoute>
          }
        />
        <Route
          path="/admin/results"
          element={
            // <ProtectedRoute allowedRoles={["admin"]}>
              <AdminResults />
            // </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  )
}

export default App
