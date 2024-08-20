import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobileNumber, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const data = await response.json();
      console.log('Login successful:', data);
      localStorage.setItem('user', JSON.stringify(data));
      navigate('/chat');
    } catch (error) {
      console.error('Login failed:', error.message);
      setMessage('Login failed: ' + error.message);
    }
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input type="text" placeholder='Enter Mobile Number...' value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} required /><br /><br />
        <input type="password" placeholder='Enter Password...' value={password} onChange={(e) => setPassword(e.target.value)} required /><br /><br />
        <input type='submit' value="Login" /><br /><br />
      </form>
      <p>{message}</p>
      <button onClick={() => navigate('/register')}>Register</button>
    </div>
  );
}