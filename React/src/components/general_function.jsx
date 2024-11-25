// fetchUsername
export const fetchUsername = async (setUsername) => {
    try {
      const response = await fetch('/php/get_user_info.php');
      const data = await response.json();
      if (data.success) {
        setUsername(data.username);
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    }
  };

  