import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const query = new URLSearchParams(useLocation().search);
  const token = query.get('token');
  useEffect(() => {
    console.log('Token:', token);
  }, [token]);

  const handleResetPassword = async () => {
    try {
      const response = await axios.post('/php/reset_password.php', { token, newPassword });
      setMessage(response.data.message);
    } catch (error) {
      setMessage('重置密碼時出現錯誤，請稍後再試。');
    }
  };

  return (
    <div>
      <h2>重置密碼</h2>
      <input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="輸入新密碼"
      />
      <button onClick={handleResetPassword}>重置密碼</button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default ResetPassword;
