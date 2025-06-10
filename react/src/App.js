import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MenuDelDia from './pages/MenuDelDia/MenuDelDia';
import Reservas from './pages/Reservas/Reservas';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <h1>Restaurante App</h1>
        <Routes>
          <Route path="/" element={<div>Página de Inicio</div>} />
          <Route path="/menu" element={<MenuDelDia />} />
          <Route path="/reservas" element={<Reservas />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;