import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css'; 

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('login-body');
    return () => {
      document.body.classList.remove('login-body');
    };
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();

    const requestData = JSON.stringify({ 
      username, 
      password 
    });

    fetch('/php/login_register.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: requestData
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('請求失敗，狀態碼: ' + response.status);
      }
      return response.json();
    })
    .then(responseData => {
      if (responseData.success && responseData.action === 'login') {
          navigate('/home');
      } else if (responseData.success && responseData.action === 'register') {
          navigate('/about');
      } else {
        alert(responseData.message);
      }
    })
    .catch(error => {
      console.error('請求過程中發生錯誤:', error);
    });
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <a className="login-link">軟體工程課程使用</a>
      <h1 className="login-title">登入或註冊</h1>
      <input 
        type="text" 
        name="username"
        value={username} 
        onChange={(e) => setUsername(e.target.value)} 
        placeholder="帳號" 
        autoComplete="username"
        required
        className="login-input"
      />
      <input 
        type="password" 
        name="password"
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        placeholder="密碼" 
        autoComplete="current-password"
        required
        className="login-input"
      />
      <button type="submit" className="login-button">登入或註冊</button>
    </form>
  );
}

export default Login;
