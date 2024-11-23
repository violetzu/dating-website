import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './components/Home/Home';
import Setting from './components/Setting';
import Login from './components/Login';
import Admin from './components/Admin/Admin'
import ForgetPassword from './components/ForgetPassword';
import ResetPassword from './components/ResetPassword';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/about" element={<Setting />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/ForgetPassword" element={<ForgetPassword />} />
      <Route path="/reset_password" element={<ResetPassword />} />
    </Routes>
 
  );
}

export default App;

