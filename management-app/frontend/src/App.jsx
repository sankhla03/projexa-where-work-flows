import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AuthContextProvider from './context/AuthContext'
import SocketContextProvider from './context/SocketContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Workspace from './pages/Workspace'
import ProtectedRoute from './components/common/ProtectedRoute'

function App() {
  return (
    <AuthContextProvider>
      <SocketContextProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="min-h-screen bg-gray-100">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/workspace/:id" element={
                <ProtectedRoute>
                  <Workspace />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </SocketContextProvider>
    </AuthContextProvider>
  )
}

export default App

