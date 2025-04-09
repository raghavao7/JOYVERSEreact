import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ChildLogin from './components/ChildLogin';
import Game from './components/Game'; // <-- Add this import

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChildLogin />} />
        <Route path="/game" element={<Game />} /> {/* <-- Add this route */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;