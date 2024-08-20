import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobileNumber, name, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const data = await response.json();
      console.log('Registration successful:', data);
      setMessage('Registration successful. Please log in.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      console.error('Registration failed:', error.message);
      setMessage('Registration failed: ' + error.message);
    }
  }

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input type="text" placeholder='Enter Name...' value={name} onChange={(e) => setName(e.target.value)} required /><br /><br />
        <input type="text" placeholder='Enter Mobile Number...' value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} required /><br /><br />
        <input type="password" placeholder='Enter Password...' value={password} onChange={(e) => setPassword(e.target.value)} required /><br /><br />
        <input type='submit' value="Register" /><br /><br />
      </form>
      <p>{message}</p>
      <button onClick={() => navigate('/login')}>Back to Login</button>
    </div>
  );
}