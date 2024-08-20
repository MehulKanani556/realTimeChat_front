import React, { useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'
import { useNavigate } from 'react-router-dom';

export default function Chat() {
  const [con, setCon] = useState('');
  const [msg, setMsg] = useState('');
  const [recipientNumber, setRecipientNumber] = useState('');
  const [disMes, setDisMsg] = useState([]);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));
 console.log('User:', user); // Log user object

  const socket = useMemo(() => {
if (user && user.user.mobileNumber) {
        const newSocket = io("http://localhost:4000", {
            query: { mobileNumber: user.mobileNumber }
        });
        newSocket.on('connect', () => {
            console.log('Socket connected:', newSocket.id);
            newSocket.emit('authenticate', { mobileNumber: user.user.mobileNumber }); // Authenticate the user
        });

        newSocket.on('connect_error', (err) => {
            console.error('Socket connection error:', err.message); // Log specific error message
            setCon('Socket connection error: ' + err.message); // Update state with error message
        });

        newSocket.on('connect_timeout', () => {
            console.error('Socket connection timed out.'); // Log timeout error
            setCon('Socket connection timed out.'); // Update state with timeout message
        });

        return newSocket;
    }
    console.warn('No user or mobile number found. Socket will not be created.');
    return null;
}, [user]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!socket) {
        console.error('Socket is null. Cannot set up event listeners.');
        return; // Prevent further execution if socket is null
    }

    const onConnect = () => {
      console.log('Connected to server', socket.id);
    };

    const onMsg = (data) => {
      if (data && data.msg && data.from) {
          setDisMsg(prevMsgs => {
              const updatedMsgs = [...prevMsgs, { ...data, isReceived: data.from !== user.user.mobileNumber }];
              localStorage.setItem('messages', JSON.stringify(updatedMsgs)); // Store updated messages
              return updatedMsgs;
          });
          alert("")
      } else {
          console.error("Received malformed message:", data);
      }
  };
    
    const onMessageSent = (data) => {
        console.log('Message sent:', data);
        alert("message")
        setDisMsg(prevMsgs => [...prevMsgs, data]);
    };

    const onMessageError = (error) => {
      console.error('Message error:', error);
      setCon('Error sending message: ' + error);
    };

    socket.on('msg', onMsg); // Enable listening for incoming messages

    socket.on('connect', onConnect);
    socket.on('messageSent', onMessageSent);
    socket.on('messageError', onMessageError);

    // Fetch messages from the database
    const fetchMessages = async () => {
        try {
            const response = await fetch(`http://localhost:5000/messages/${user.user.mobileNumber}`);
            const messages = await response.json();
            setDisMsg(messages);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    fetchMessages();

  }, [socket, navigate, user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!socket) {
        setCon('Socket not connected.'); // Add error handling
        console.error('Socket is null. User may not be logged in or socket connection failed.');
        return; // Prevent further execution if socket is null
    }
    socket.emit('sendMessage', { to: recipientNumber, msg });
   
    setMsg('');
  }

  if (!user) {
    return null; // or a loading spinner
  }

  // Group messages by sender
  const groupedMessages = disMes.reduce((acc, message) => {
    const key = message.from === user.user.mobileNumber ? 'You' : message.from;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(message);
    return acc;
  }, {});

  return (
    <div>
      <h2>Chat</h2>
      <h3>{con}</h3>
      
      <form onSubmit={handleSubmit} >
        <input type="text" placeholder='Enter Recipient Mobile Number...' value={recipientNumber} onChange={(e) => setRecipientNumber(e.target.value)} required /><br /><br />
        <input type="text" placeholder='Enter Message...' value={msg} onChange={(e) => setMsg(e.target.value)} required /><br /><br />
        <input type='submit' value="Send Message" /><br /><br />
      </form>

      <hr />
      <div style={{ margin:'5px 20px' }}>
      {disMes.map((msg, index) => (
                    <div key={index}>
                     { console.log(user.user.mobileNumber, msg)}
                        {msg.from === user.user.mobileNumber ? (
                            <div style={{ display: 'flex', justifyContent: 'end' }}>
                                <span className='from'>{msg.msg} : You</span>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', justifyContent: 'start' }}>
                                <span className='to'>{msg.from}: {msg.msg}</span>
                            </div>
                        )}
                    </div>
                ))}
      </div>
    </div>
  )
}