// 動態部件放這裡 => 會變動的資料(ex: state)、有功能的元件(ex: funtion, funtion-like)
// 最後的整體靜態架構也放這裡 => home頁面

import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css';
import './userdetails.css';
import { Header, Sidebar } from './Header_Sidebar';
import PostFormContext from './PostForm_new';
import PostsContext from './Posts_new';

// 架構 <主頁> 串聯全部元件與動作，相當於main
function Home() {
  const navigate = useNavigate();
  const [thisUsername, setThisUsername] = useState('');
  const [currentViewUsername, setCurrentViewUsername] = useState('');
  const [userBio, setUserBio] = useState('');
  const [userTags, setUserTags] = useState([]);
  const [searchName, setSearchName] = useState('');

  const PostFormCtx = useContext(PostFormContext);
  const PostsCtx = useContext(PostsContext);

  useEffect(() => {
    fetchUserInfo();
    loadPosts();
  }, []);

  // 動作 <登入作業/抓取當前用戶資訊(其實只是抓名字)>
  const fetchUserInfo = useCallback(async () => {
    try {
      const response = await fetch('/php/get_user_info.php');
      const data = await response.json();
      if (data.success) {
        setThisUsername(data.username);
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('解析 JSON 失敗:', error);
    }
  }, [navigate]);

  // 動作 <登出作業>
  const logout = useCallback(async () => {
    try {
      const response = await fetch('/php/logout.php', { method: 'POST' });
      const result = await response.json();
      if (response.ok && result.success) {
        navigate('/');
      } else {
        alert('登出失敗，錯誤碼：' + response.status);
      }
    } catch (error) {
      console.error('登出失敗:', error);
    }
  }, [navigate]);

  // 動作 <顯示用戶個人主頁資訊>
  const checkUserPage = useCallback(async (username) => {
    try {
      const response = await fetch('/php/userdisplay.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });
      const data = await response.json();
      if (data.success) {
        setUserBio(data.bio);
        setUserTags(data.tags);
        setCurrentViewUsername(username);

        // 加載所選用戶的貼文
        PostsCtx.loadPosts(username);
      } else {
        // 多載於查詢用戶(即username不存在時)
        alert('查無用戶!');
        console.error('Failed to load user details:', data.message);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  }, []);

  // 動作 <左上角之個人頁面/資料快捷鍵>
  const myUserPage_settings = () => {
    if (currentViewUsername === thisUsername) {
      navigate('/about');
    } else {
      checkUserPage(thisUsername);
    }
  };


  return (
    <>
      <Header
        currentViewUsername={currentViewUsername}
        thisUsername={thisUsername}
        logout={logout}
        resetPostForm={PostFormCtx.resetPostForm}
        myUserPage_settings={myUserPage_settings}
        searchName={searchName}
        setSearchName={setSearchName}
        checkUserPage={checkUserPage}
      />
      <div className="container">
        <div className="main-content">
          <h2 id="posts-title">{currentViewUsername ? `${currentViewUsername}的貼文` : '推薦貼文'}</h2>
          {(currentViewUsername === thisUsername || currentViewUsername === '') && (
            PostFormCtx.PostForm
          )}
          {PostsCtx.Posts(checkUserPage, PostFormCtx.sharePost)}
        </div>
        <Sidebar
          currentViewUsername={currentViewUsername}
          userBio={userBio}
          userTags={userTags}
        />
      </div>
    </>
  );
}

export default Home;