// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ChildLogin from './components/ChildLogin';
import SuperAdminPage from './components/SuperAdminPage';
import Game from './components/Game'; // <-- Add this import
import AdminPanel from './components/Admin'; // <-- Import the AdminPanel component

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<ChildLogin />} />
                <Route path="/game" element={<Game />} />
                <Route path="/superadmin" element={<SuperAdminPage />} />
                <Route path="/admin" element={<AdminPanel />} /> {/* <-- Add the AdminPanel route */}
            </Routes>
        </BrowserRouter>
    );
}

export default App;