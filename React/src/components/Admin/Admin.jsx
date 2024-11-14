import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, Sidebar } from './Header_Sidebar';
import Post from './Post';

function MenuComponent() {
  const [selectedMenu, setSelectedMenu] = useState(null);
  const navigate = useNavigate();
  const [thisUsername, setThisUsername] = useState('');
  const [currentViewUsername, setCurrentViewUsername] = useState('');
  const [posts, setPosts] = useState([]);
  const [userBio, setUserBio] = useState('');
  const [userTags, setUserTags] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [postType, setPostType] = useState('image'); //貼文類型
  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState(null); //照片來源(資料型態為blob, 儲存的是"檔案"物件)
  const [ytURL_sharedPost, setytURL_sharedPost] = useState(''); //youtube網址或被分享貼文的id


  useEffect(() => {
    fetchUserInfo();
    loadPosts();
  }, []);

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

  // 動作 <加載貼文>
  const loadPosts = useCallback(async (username = null, limit = 20) => {
    try {
      // 設置向php回傳貼文顯示的最大數目、位於哪個用戶的個人主頁之參數
      let url = `/php/posts_get.php?limit=${limit}`;
      if (username) {
        url += `&username=${username}`;
      }

      // 送出並擷取php回傳資訊
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setPosts(data.posts);
      } else {
        console.error('獲取貼文失敗:', data.message);
      }
    } catch (error) {
      console.error('解析 JSON 失敗:', error);
    }
  }, []);

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
        loadPosts(username);
      } else {
        // 多載於查詢用戶(即username不存在時)
        alert('查無用戶!');
        console.error('Failed to load user details:', data.message);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  }, []);

  // 動作 <更新貼文數據>
  const updatePostDetails = useCallback(async (postId) => {
    try {
      const response = await fetch(`/php/post_details_get.php?post_id=${postId}`);
      const data = await response.json();
      if (data.success) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId ? { ...post, ...data.post } : post
          )
        );
      } else {
        console.error('更新貼文詳情失敗: ' + data.message);
      }
    } catch (error) {
      console.error('解析 JSON 失敗:', error);
    }
  }, []);

  // 動作 <開關留言區>
  const showComments = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, showComments: !post.showComments } : post
      )
    );

    // 加載當前貼文之所有留言
    loadComments(postId);
  };

  // 動作 <顯示貼文留言>
  const loadComments = useCallback(async (postId) => {
    try {
      const response = await fetch(`/php/comments_get.php?post_id=${postId}`);
      const data = await response.json();
      if (data.success) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId ? { ...post, comments: data.comments } : post
          )
        );
      } else {
        console.error('獲取留言失敗: ' + data.message);
      }
    } catch (error) {
      console.error('解析 JSON 失敗:', error);
    }
  }, []);

  // 動作 <開關點讚用戶名單>
  const showWhoLiked = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, showWhoLiked: !post.showWhoLiked } : post
      )
    );

    // 加載當前貼文之所有留言
    loadLikedUsers(postId);
  };

  // 動作 <查看點讚用戶名單>
  const loadLikedUsers = useCallback(async (postId) => {
    try {
      const response = await fetch(`/php/post_details_who_liked.php?post_id=${postId}`);
      const data = await response.json();
      if (data.success) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId ? { ...post, wholiked: data.names } : post
          )
        );
      } else {
        console.error('獲取按讚用戶失敗: ' + data.message);
      }
    } catch (error) {
      console.error('解析 JSON 失敗:', error);
    }
  }, []);

  const handleMenuClick = (menu) => {
    setSelectedMenu(menu);
  };

  return (
    <>
      <Header
        thisUsername={thisUsername}
        logout={logout}
        searchName={searchName}
        setSearchName={setSearchName}
        checkUserPage={checkUserPage}
      />
      <h1>管理員介面</h1>
      <ul>
        <li onClick={() => handleMenuClick('Menu1')}>發文及留言統計</li>
        <li onClick={() => handleMenuClick('Menu2')}>選單二</li>
        <li onClick={() => handleMenuClick('Menu3')}>用戶查詢</li>
        <li onClick={() => handleMenuClick('Menu4')}>選單四</li>
      </ul>
      <div>
        {selectedMenu && <p>你選擇了: {selectedMenu}</p>}
      </div>
      <div className="container">
        <div className="main-content">
          <h2 id="posts-title">{currentViewUsername ? `${currentViewUsername}的貼文` : '推薦貼文'}</h2>
          <div id="posts">
            {posts.map(post => (
              <Post
                key={post.id}
                post={post}
                checkUserPage={checkUserPage}
                showComments={showComments}
                showWhoLiked={showWhoLiked}
              />
            ))}
          </div>
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

export default MenuComponent;
