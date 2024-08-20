import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './Component/Register';
import Login from './Component/Login';
import Chat from './Component/Chat';
import Header from './Component/Header';
import './App.css';
function App() {
  return (
    <Router>
      <div className="App">
      <Header />
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;