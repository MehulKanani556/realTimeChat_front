import React, { useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'

export default function Chat() {
  const [con, setCon] = useState('');
  const [id, setId] = useState('');
  const [msg, setMsg] = useState('');
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  const [disMes, setDisMsg] = useState([])


  const socket = useMemo(() => io("http://localhost:4000"), [])

  useEffect(() => {
    const onConnect = () => {
      console.log('Connected to server', socket.id);
    };

    const onTest = (msg) => {
      console.log(msg);
      setCon(msg);
    };
    const onMsg = (data) => {
      console.log(data);
      setDisMsg(prevMsgs => [...prevMsgs, data]);
    };

    socket.on('connect', onConnect);
    socket.on("test", onTest);
    socket.on('msg', onMsg);

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.mobileNumber);
      // Perform any cleanup if necessary
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('test', onTest);
      socket.off('msg', onMsg);
    };
  }, [socket]);

  const handleSubmit = (e) => {
    e.preventDefault();
    socket.emit('message', { to: id, msg })
    setMsg('')
  }

  const handleRegisterNumber = async (e)=>{
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobileNumber, name }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
  
      const data = await response.json();
      console.log('Registration successful:', data);
      // Handle successful registration (e.g., redirect to login page)
    } catch (error) {
      console.error('Registration failed:', error.message);
      // Display error message to the user (e.g., update UI with error message)
    }
    await socket.emit('register',mobileNumber);

  }


 
  return (
    <div>
      chat
      <h3>{con}</h3>
        <form action="" method="post" onSubmit={handleRegisterNumber}>
          <input type="text" name="name" placeholder='Enter Name...' onChange={(e)=>setName(e.target.value)} /><br /><br />
          <input type="text" name="mobileNumber" placeholder='Enter Mobile Number...' onChange={(e)=>setMobileNumber(e.target.value)} /><br /><br />
          <input type='submit' /><br /><br />
        </form>


      <form action="" onSubmit={handleSubmit}>


        <input type="text" name="id" placeholder='Enter Id...' value={id} onChange={(e) => setId(e.target.value)} /><br /><br />
        <input type="text" name="message" placeholder='Enter Message...' value={msg} onChange={(e) => setMsg(e.target.value)} /><br /><br />
        <input type='submit' /><br /><br />
      </form>




      <hr />
  
      {
        disMes.map((msg, index) => (
          <div key={index}>
        
            <p>{msg.id} : {msg.msg}</p>
          </div>
        ))
      }
    </div>
  )
}