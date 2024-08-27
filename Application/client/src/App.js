import React from 'react';
import './App.css';
import Chatbot from './Pages/Chatbot';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from './Components/Auth';
import ProtectedRoutes from './Services/ProtectedRoutes';
import HomePage from './Pages/HomePage';
import ResetPassword from './Components/ResetPassword';

function App() {
  return (
    <BrowserRouter>
      <Routes>
      {/* Public Routes */}
      <Route path ="/auth" element={<Auth />} />
      
      {/* Password reset route with token */}
      <Route path="/user/reset/:id/:token" element={<ResetPassword />} />

      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoutes />}>
          {/* Home Page */}
          <Route index element={<HomePage />} />
          {/* Chatbot Page */}
          <Route path="/chatbot" element={<Chatbot />} />
      </Route>
      </Routes>
    
    </BrowserRouter>
  );
}

export default App;
