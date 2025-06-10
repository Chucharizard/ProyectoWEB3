import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Dashboard from './pages/Dashboard/Dashboard'
import MenuDelDia from './pages/MenuDelDia/MenuDelDia'
import Reservas from './pages/Reservas/Reservas'
import Login from './pages/Login/Login'
import Admin from './pages/Admin/Admin'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas con Layout */}
        <Route path="/" element={
          <Layout>
            <Dashboard />
          </Layout>
        } />
        <Route path="/menu" element={
          <Layout>
            <MenuDelDia />
          </Layout>
        } />
        <Route path="/reservas" element={
          <Layout>
            <Reservas />
          </Layout>
        } />
        
        {/* Rutas de empleados sin Layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  )
}

export default App
