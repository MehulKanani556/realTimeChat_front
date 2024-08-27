import React, { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

export default function Chat() {
  const [con, setCon] = useState('');
  const [msg, setMsg] = useState('');
  const [recipientNumber, setRecipientNumber] = useState('');
  const [disMes, setDisMsg] = useState([]);
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState(null);

  const user = JSON.parse(localStorage.getItem('user'));
  console.log('User:', user);
  const [userList, setUserList] = useState([])

  const getAllUser = async () => {
    const response = await fetch('http://localhost:5000/users');
    const list = await response.json();
    setUserList(list)

  }
  useEffect(() => {
    getAllUser();
  }, [])
  const socket = useMemo(() => {
    if (user && user.user.mobileNumber) {
      const newSocket = io('http://localhost:4000', {
        query: { mobileNumber: user.user.mobileNumber },
      });
      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        newSocket.emit('authenticate', { mobileNumber: user.user.mobileNumber });
      });

      newSocket.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
        setCon('Socket connection error: ' + err.message);
      });

      newSocket.on('connect_timeout', () => {
        console.error('Socket connection timed out.');
        setCon('Socket connection timed out.');
      });

      return newSocket;
    }
    console.warn('No user or mobile number found. Socket will not be created.');
    return null;
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!socket) {
      console.error('Socket is null. Cannot set up event listeners.');
      return;
    }

    const onConnect = () => {
      console.log('Connected to server', socket.id);
    };

    const onMsg = (data) => {
      if (data && data.msg && data.from) {
        setDisMsg((prevMsgs) => {
          const updatedMsgs = [...prevMsgs, { ...data, isReceived: data.from !== user.user.mobileNumber }];
          localStorage.setItem('messages', JSON.stringify(updatedMsgs));
          return updatedMsgs;
        });
        alert('');
      } else {
        console.error('Received malformed message:', data);
      }
    };

    const onMessageSent = (data) => {
      console.log('Message sent:', data);
      alert('message');
      setDisMsg((prevMsgs) => [...prevMsgs, data]);
    };

    const onMessageError = (error) => {
      console.error('Message error:', error);
      setCon('Error sending message: ' + error);
    };

    socket.on('msg', onMsg);
    socket.on('connect', onConnect);
    socket.on('messageSent', onMessageSent);
    socket.on('messageError', onMessageError);


    fetchMessages();
  }, [socket]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`http://localhost:5000/messages/${user.user.mobileNumber}`);
      const messages = await response.json();
      setDisMsg(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!recipientNumber) { // Check if no recipient number is selected
      setCon('Select a number'); // Set the message to display
      return;
    }
    if (!socket) {
      setCon('Socket not connected.');
      console.error('Socket is null. User may not be logged in or socket connection failed.');
      return;
    }
    socket.emit('sendMessage', { to: recipientNumber, msg });
    setMsg('');
    fetchMessages();
  };

  if (!user) {
    return null; // or a loading spinner
  }

  const handleUserClick = (mobileNumber) => {
    const user = userList.find(u => u.mobileNumber === mobileNumber); // Find the selected user
    setSelectedUser(user); // Set the selected user
    setRecipientNumber(mobileNumber);
    fetchMessagesForRecipient(mobileNumber);
  };

  const fetchMessagesForRecipient = async (mobileNumber) => {
    try {
      const response = await fetch(`http://localhost:5000/messages/${mobileNumber}`);
      const messages = await response.json();
      setDisMsg(messages);
    } catch (error) {
      console.error('Error fetching messages for recipient:', error);
    }
  };

  const specificSender = '6352800647'; // Replace with the desired sender's mobile number

  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: '100vh' }}>
      <div style={{ width: '210px', position: 'fixed', height: '100vh', overflowY: 'auto', marginTop: '10px' }}>
        <h2 style={{ textAlign: 'center', position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1 }}>Users</h2>
        {userList.sort((a, b) => (a.mobileNumber === user.user.mobileNumber ? -1 : 1)).map((users) => (
          <div className='userNumber' key={users.mobileNumber} onClick={() => handleUserClick(users.mobileNumber)}>
            <div>{users.name}</div>
            <div>{users.mobileNumber}</div>
            {users.mobileNumber === user.user.mobileNumber && (
              <div style={{ color: 'green', fontWeight: 'bold' }}> (You)</div>
            )}
          </div>
        ))}
      </div>
      {selectedUser ? (
        <div style={{ display: 'flex', flexGrow: 1, flexDirection: 'column', marginLeft: '210px' }}>

          <div style={{ flex: '1', overflowY: 'auto', padding: '10px', backgroundColor: '#f0f0f0', marginBottom: '70px', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
            {selectedUser && ( // Display selected user's name and number
              <div className="chatting-with">
                <span onClick={() => setSelectedUser(null)}>&larr;</span>
                <div style={{ margin:"0 10px" }}>
                  <svg viewBox="0 0 212 212" height="50" width="50" preserveAspectRatio="xMidYMid meet" class="xh8yej3 x5yr21d" version="1.1" x="0px" y="0px" enable-background="new 0 0 212 212"><title>default-user</title><path fill="#DFE5E7" class="background" d="M106.251,0.5C164.653,0.5,212,47.846,212,106.25S164.653,212,106.25,212C47.846,212,0.5,164.654,0.5,106.25 S47.846,0.5,106.251,0.5z"></path><g><path fill="#FFFFFF" class="primary" d="M173.561,171.615c-0.601-0.915-1.287-1.907-2.065-2.955c-0.777-1.049-1.645-2.155-2.608-3.299 c-0.964-1.144-2.024-2.326-3.184-3.527c-1.741-1.802-3.71-3.646-5.924-5.47c-2.952-2.431-6.339-4.824-10.204-7.026 c-1.877-1.07-3.873-2.092-5.98-3.055c-0.062-0.028-0.118-0.059-0.18-0.087c-9.792-4.44-22.106-7.529-37.416-7.529 s-27.624,3.089-37.416,7.529c-0.338,0.153-0.653,0.318-0.985,0.474c-1.431,0.674-2.806,1.376-4.128,2.101 c-0.716,0.393-1.417,0.792-2.101,1.197c-3.421,2.027-6.475,4.191-9.15,6.395c-2.213,1.823-4.182,3.668-5.924,5.47 c-1.161,1.201-2.22,2.384-3.184,3.527c-0.964,1.144-1.832,2.25-2.609,3.299c-0.778,1.049-1.464,2.04-2.065,2.955 c-0.557,0.848-1.033,1.622-1.447,2.324c-0.033,0.056-0.073,0.119-0.104,0.174c-0.435,0.744-0.79,1.392-1.07,1.926 c-0.559,1.068-0.818,1.678-0.818,1.678v0.398c18.285,17.927,43.322,28.985,70.945,28.985c27.678,0,52.761-11.103,71.055-29.095 v-0.289c0,0-0.619-1.45-1.992-3.778C174.594,173.238,174.117,172.463,173.561,171.615z"></path><path fill="#FFFFFF" class="primary" d="M106.002,125.5c2.645,0,5.212-0.253,7.68-0.737c1.234-0.242,2.443-0.542,3.624-0.896 c1.772-0.532,3.482-1.188,5.12-1.958c2.184-1.027,4.242-2.258,6.15-3.67c2.863-2.119,5.39-4.646,7.509-7.509 c0.706-0.954,1.367-1.945,1.98-2.971c0.919-1.539,1.729-3.155,2.422-4.84c0.462-1.123,0.872-2.277,1.226-3.458 c0.177-0.591,0.341-1.188,0.49-1.792c0.299-1.208,0.542-2.443,0.725-3.701c0.275-1.887,0.417-3.827,0.417-5.811 c0-1.984-0.142-3.925-0.417-5.811c-0.184-1.258-0.426-2.493-0.725-3.701c-0.15-0.604-0.313-1.202-0.49-1.793 c-0.354-1.181-0.764-2.335-1.226-3.458c-0.693-1.685-1.504-3.301-2.422-4.84c-0.613-1.026-1.274-2.017-1.98-2.971 c-2.119-2.863-4.646-5.39-7.509-7.509c-1.909-1.412-3.966-2.643-6.15-3.67c-1.638-0.77-3.348-1.426-5.12-1.958 c-1.181-0.355-2.39-0.655-3.624-0.896c-2.468-0.484-5.035-0.737-7.68-0.737c-21.162,0-37.345,16.183-37.345,37.345 C68.657,109.317,84.84,125.5,106.002,125.5z"></path></g></svg>
                </div>
                <div>
                  <div>
                    {selectedUser.name}
                  </div>
                  <div>
                    {selectedUser.mobileNumber}
                  </div>
                </div>

              </div>
            )}
            <h3>{con}</h3>
            <div style={{ margin: '5px 0' }}>
              { // Check if a user is selected
                disMes
                  .filter(msg => 
                    (msg.from === recipientNumber && msg.to === user.user.mobileNumber) || 
                    (msg.from === user.user.mobileNumber && msg.to === recipientNumber)
                  ) // Filter messages between the selected recipient and the user
                  .map((msg, index) => (
                    <div key={index} style={{ margin: '10px 0', display: 'flex', justifyContent: msg.from === user.user.mobileNumber ? 'flex-end' : 'flex-start' }}>
                      <div style={{ maxWidth: '70%', padding: '10px', borderRadius: '20px', backgroundColor: msg.from === user.user.mobileNumber ? '#dcf8c6' : '#fff', border: '1px solid #ccc' }}>
                        <span>{msg.msg}</span>
                      </div>
                    </div>
                  ))
              }
            </div>
          </div>
          <div style={{ position: 'fixed', bottom: 0, width: 'calc(100vw - 220px)' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', padding: '10px', backgroundColor: '#fff', borderTop: '1px solid #ccc' }}>
              {/* <input
              type="text"
              placeholder="Enter Recipient Mobile Number..."
              value={recipientNumber}
              onChange={(e) => setRecipientNumber(e.target.value)}
              required
              style={{ flex: '1', padding: '10px', borderRadius: '20px', border: '1px solid #ccc', marginRight: '10px' }}
            /> */}
              <input
                type="text"
                placeholder="Enter Message..."
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                required
                style={{ flex: '2', padding: '10px', borderRadius: '20px', border: '1px solid #ccc', marginRight: '10px' }}
              />
              <input type="submit" value="Send" style={{ padding: '10px 20px', borderRadius: '20px', backgroundColor: '#007bff', color: '#fff', border: 'none' }} />
            </form>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexGrow: 1, flexDirection: 'column', marginLeft: '210px', backgroundColor: '#f0f0f0', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
          <div className='no-message'>No messages to display. Please select a user.</div>
        </div>

      )}
    </div>

  );
}