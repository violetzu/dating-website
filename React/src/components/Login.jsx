import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css'; 

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // 防止多次提交
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('login-body');
    return () => {
      document.body.classList.remove('login-body');
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;  // 防止多次提交
    setIsSubmitting(true);

    try {
      const requestData = JSON.stringify({ 
        username, 
        password 
      });

      const response = await fetch('/php/login_register.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: requestData
      });

      if (!response.ok) {
        throw new Error('請求失敗，狀態碼: ' + response.status);
      }

      const responseData = await response.json();

      if (responseData.success && responseData.action === 'login') {
        navigate('/home');
      } else if (responseData.success && responseData.action === 'register') {
        navigate('/about');
      } else if (responseData.success && responseData.action === 'admin') {
        navigate('/admin');
      } else {
        alert(responseData.message);
      }
    } catch (error) {
      console.error('請求過程中發生錯誤:', error);
      alert('伺服器錯誤，請稍後再試。');
    } finally {
      setIsSubmitting(false);
    }
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
        aria-label="帳號"  // 提高無障礙性
        required
        className="login-input"
        disabled={isSubmitting}  // 提交時禁用輸入框
      />
      <input 
        type="password" 
        name="password"
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        placeholder="密碼" 
        autoComplete="current-password"
        aria-label="密碼"  // 提高無障礙性
        required
        className="login-input"
        disabled={isSubmitting}  // 提交時禁用輸入框
      />
      <button 
        type="submit" 
        className="login-button" 
        disabled={isSubmitting} // 提交時禁用按鈕
      >
        {isSubmitting ? '登入中...' : '登入或註冊'}
      </button>
      <a>  </a>
      <a
          href="https://github.com/violetzu/dating-website"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            marginTop: '20px',  // 增加頂部的外邊距
            display: 'inline-block',  // 保證外邊距有效
            padding: '10px 20px',
            backgroundColor: '#333',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px',
          }}
        >
          GitHub
        </a>
    </form>
  );
}

export default Login;
