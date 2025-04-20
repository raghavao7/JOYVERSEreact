import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ChildLogin from './components/ChildLogin';
import SuperAdminPage from './components/SuperAdminPage';
import Admin from './components/Admin';
import Game from './components/Game';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChildLogin />} />
        <Route path="/game" element={<Game />} />
        <Route path="/superadmin" element={<SuperAdminPage />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;