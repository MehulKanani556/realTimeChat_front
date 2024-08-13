import React, { useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'

export default function Chat() {
  const [con, setCon] = useState('');
  const [msg, setMsg] = useState('');
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [recipientNumber, setRecipientNumber] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [disMes, setDisMsg] = useState([]);

  const socket = useMemo(() => io("http://localhost:4000"), []);

  useEffect(() => {
    const onConnect = () => {
      console.log('Connected to server', socket.id);
    };

    const onRegistered = (data) => {
      if (data.success) {
        setIsRegistered(true);
        setCon('Registered successfully');
      } else {
        setCon(data.message);
      }
    };

    const onMsg = (data) => {
      setDisMsg(prevMsgs => [...prevMsgs, data]);
    };

    socket.on('connect', onConnect);
    socket.on('registered', onRegistered);
    socket.on('msg', onMsg);

    return () => {
      socket.off('connect', onConnect);
      socket.off('registered', onRegistered);
      socket.off('msg', onMsg);
    };
  }, [socket]);

  const handleRegisterNumber = async (e) => {
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
      socket.emit('register', mobileNumber);
      setIsRegistered(true);  // Set isRegistered to true after successful registration
      setCon('Registered successfully');
    } catch (error) {
      console.error('Registration failed:', error.message);
      setCon('Registration failed: ' + error.message);
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    socket.emit('message', { to: recipientNumber, msg });
    setMsg('');
    setDisMsg(prevMsgs => [...prevMsgs, { from: 'You', msg }]);
  }

  return (
    <div>
      <h2>Chat</h2>
      <h3>{con}</h3>
      {!isRegistered ? (
        <form onSubmit={handleRegisterNumber}>
          <input type="text" placeholder='Enter Name...' onChange={(e) => setName(e.target.value)} required /><br /><br />
          <input type="text" placeholder='Enter Mobile Number...' onChange={(e) => setMobileNumber(e.target.value)} required /><br /><br />
          <input type='submit' value="Register" /><br /><br />
        </form>
      ) : (
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder='Enter Recipient Mobile Number...' value={recipientNumber} onChange={(e) => setRecipientNumber(e.target.value)} required /><br /><br />
          <input type="text" placeholder='Enter Message...' value={msg} onChange={(e) => setMsg(e.target.value)} required /><br /><br />
          <input type='submit' value="Send Message" /><br /><br />
        </form>
      )}

      <hr />
      {console.log(disMes)}
      <div style={{ margin:'0 20px' }}>
        {disMes.map((msg, index) => (
          <div key={index}>
            {msg.from && (
              <div style={{ display: 'flex', justifyContent: 'end' }}>
                <span className='from'>
                  {msg.msg}:{msg.from}
                </span>
              </div>
            )}
            {msg.id && (
              <div  style={{ display: 'flex', justifyContent: 'start' }}>
                <span className='to'>
                  {msg.id}:{msg.msg}
                </span>
              </div>
            )}
          </div>
        ))}

      </div>
      {/* <table>

        {disMes.map((msg, index) => (
          <tr key={index}>
            <td style={{ textAlign:"right" }}>{msg.from || msg.id}:</td><td style={{ textAlign:'left' }}> {msg.msg}</td>
          </tr>
        ))} 
      </table> */}
    </div>
  )
}