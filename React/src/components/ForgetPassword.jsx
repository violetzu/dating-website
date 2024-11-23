import { useState } from 'react';
import axios from 'axios';
import './login.css';

function ForgetPassword() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleForgetPassword = async () => {
    try {
      const response = await axios.post('/php/forget_password.php', { username, email });
      setMessage(response.data.message);
    } catch (error) {
      setMessage('發送郵件時出現錯誤，請稍後再試。');
    }
  };

  return (
    <div className="login-body">
      <div className="login-form">
        <h2 className="login-title">忘記密碼</h2>
        <input
          type="text"
          className="login-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="輸入你的用戶名"
        />
        <input
          type="email"
          className="login-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="輸入你的信箱"
        />
        <button className="login-button" onClick={handleForgetPassword}>發送重置密碼郵件</button>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

export default ForgetPassword;