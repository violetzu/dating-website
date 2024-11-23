import React, { useEffect, useState, useRef } from 'react';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('');
  const socketRef = useRef(null);

  // 獲取用戶名
  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await fetch('/php/get_user_info.php');
        const data = await response.json();
        if (data.success) {
          setUsername(data.username);
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error);
      }
    };
    fetchUsername();
  }, []);

  // WebSocket 連接
  useEffect(() => {
    if (!socketRef.current) {
      const connectWebSocket = () => {
        socketRef.current = new WebSocket('wss://marimo.idv.tw:2053');

        socketRef.current.onopen = () => {
          console.log('Connected to WebSocket server');
        };

        socketRef.current.onmessage = async (event) => {
          try {
            let parsedMessage;
            if (event.data instanceof Blob) {
              const text = await event.data.text();
              parsedMessage = JSON.parse(text);
            } else if (typeof event.data === 'string') {
              parsedMessage = JSON.parse(event.data);
            } else {
              console.error('Unsupported message format:', event.data);
              return;
            }
            setMessages((prevMessages) => [...prevMessages, parsedMessage]);
          } catch (e) {
            console.error('Failed to parse message data:', e);
          }
        };

        socketRef.current.onclose = () => {
          console.log('Disconnected from WebSocket server');
          console.log('Reconnecting in 3 seconds...');
          setTimeout(() => connectWebSocket(), 3000);
        };

        socketRef.current.onerror = (error) => {
          console.error('WebSocket error:', error);
          socketRef.current.close();
        };
      };

      connectWebSocket();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const sendMessage = () => {
    if (input.trim() !== '' && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const messageData = {
        username: username,
        message: input,
      };
      socketRef.current.send(JSON.stringify(messageData));
      setInput('');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>WebSocket Chat</h1>
      {username && <h2>Current User: {username}</h2>} {/* 顯示當前用戶名 */}
      <div style={{ height: '300px', overflowY: 'scroll', border: '1px solid black', padding: '10px', marginBottom: '10px' }}>
        {messages.map((messageObj, index) => (
          <div key={index}>
            <strong>{messageObj.username}:</strong> {messageObj.message}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        style={{ width: '80%', marginRight: '10px' }}
        placeholder="Type your message..."
      />
      <button onClick={sendMessage} style={{ padding: '8px 16px' }}>Send</button>
    </div>
  );
}

export default Chat;
