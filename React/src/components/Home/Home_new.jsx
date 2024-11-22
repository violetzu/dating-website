// 動態部件放這裡 => 會變動的資料(ex: state)、有功能的元件(ex: funtion, funtion-like)
// 最後的整體靜態架構也放這裡 => home頁面

import React, { useEffect, useContext } from 'react';
import './home.css';
import './userdetails.css';
import { Header, Sidebar } from './Header_Sidebar_new';
import PostForm from './PostForm_new';
import Posts from './Posts_new';
import { State_Function, Global_Domain } from '../State_Function';

// 架構 <主頁> 串聯全部元件與動作，相當於main
function Home() {
  const {
    thisUsername,
    currentViewUsername,
    fetchUserInfo,
    loadPosts
  } = useContext(State_Function);

  useEffect(() => {
    fetchUserInfo();
    loadPosts();
  }, []);
  
  return (
    <>
      <Header />
      <div className="container">
        <div className="main-content">
          <h2 id="posts-title">{currentViewUsername ? `${currentViewUsername}的貼文` : '推薦貼文'}</h2>
          {(currentViewUsername === thisUsername || currentViewUsername === '') && (
            <PostForm />
          )}
          <Posts />
        </div>
        <Sidebar />
      </div>
    </>
  );
};

export default Home;