import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Dashboard from './pages/Dashboard/Dashboard'
import MenuDelDia from './pages/MenuDelDia/MenuDelDia'
import Reservas from './pages/Reservas/Reservas'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/menu" element={<MenuDelDia />} />
          <Route path="/reservas" element={<Reservas />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
