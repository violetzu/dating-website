import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './components/Home/Home';
import Setting from './components/Setting';
import Login from './components/Login';
import Admin from './components/Admin/Admin'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/about" element={<Setting />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
 
  );
}

export default App;

