import { useState } from 'react';
import axios from 'axios';

function ForgetPassword() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');

  const handleForgetPassword = async () => {
    try {
      const response = await axios.post('/php/forget_password.php', { username });
      setMessage(response.data.message);
    } catch (error) {
      setMessage('發送郵件時出現錯誤，請稍後再試。');
    }
  };

  return (
    <div>
      <h2>忘記密碼</h2>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="輸入你的用戶名"
      />
      <button onClick={handleForgetPassword}>發送重置密碼郵件</button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default ForgetPassword;
