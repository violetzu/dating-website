import React, { useEffect, useState, useRef } from 'react';
import { fetchUsername } from './general_function';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('');
  const socketRef = useRef(null);

  useEffect(() => {
    fetchUsername(setUsername);
  }, []);

  useEffect(() => {
    const clearMessagesAndReconnect = () => {
      console.log('Disconnected from WebSocket server. Clearing messages and reconnecting...');
      setMessages([]); // Clear all messages
      setTimeout(connectWebSocket, 3000); // Attempt to reconnect after 3 seconds
    };

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
          }
          setMessages((prevMessages) => [...prevMessages, parsedMessage]);
        } catch (e) {
          console.error('Failed to parse message data:', e);
        }
      };

      socketRef.current.onclose = () => {
        clearMessagesAndReconnect();
      };

      socketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        socketRef.current.close();
      };
    };

    if (!socketRef.current) {
      connectWebSocket();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const sendMessage = () => {
    if (input.trim() && socketRef.current?.readyState === WebSocket.OPEN) {
      const messageData = { username, message: input };
      socketRef.current.send(JSON.stringify(messageData));
      setInput('');
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">聊天室</div>
      <div className="chat-messages">
        {messages.map((messageObj, index) => (
          <div key={index} className="chat-message">
            <strong>{messageObj.username}:</strong> {messageObj.message}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="輸入訊息..."
        />
        <button onClick={sendMessage}>送出</button>
      </div>
    </div>
  );
};

export default Chat;
