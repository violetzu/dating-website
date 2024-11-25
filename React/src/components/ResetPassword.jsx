import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './login.css';

function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const token = query.get('token');

  const handleResetPassword = async () => {
    try {
      const response = await axios.post('/php/reset_password.php', { token, newPassword });
      const { message } = response.data;
      setMessage(message);
      
      if (message === '密碼重置成功。') {
        alert('密碼重置成功，請重新登入。');
        navigate('/login');
      }
    } catch (error) {
      setMessage('重置密碼時出現錯誤，請稍後再試。');
    }
  };

  return (
    <div className="login-body">
      <div className="login-form">
        <h2 className="login-title">重置密碼</h2>
        <input
          type="password"
          className="login-input"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="輸入新密碼"
        />
        <button className="login-button" onClick={handleResetPassword}>重置密碼</button>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

export default ResetPassword;
