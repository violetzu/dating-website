import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './Header_Sidebar';
import { fetchUsername } from '../general_function';
import Post from './Post';
import UserCard from './UserCard';
import './admin.css';

function MenuComponent() {
  const navigate = useNavigate();
  const [thisUsername, setThisUsername] = useState('');
  const [currentViewUsername, setCurrentViewUsername] = useState('');
  const [posts, setPosts] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [showUsers, setShowUsers] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUserInfo();
    loadPosts();
  }, []);

  const fetchUserInfo = useCallback(async () => {
    fetchUsername(setThisUsername);
  }, [navigate]);

  // 動作 <加載貼文>
  const loadPosts = useCallback(async (username = null, limit = 50) => {
    try {
        // 設置向php回傳貼文顯示的最大數目、位於哪個用戶的個人主頁之參數
        let url = `/php/admin_posts_get.php?limit=${limit}`;
        if (username) {
            if (typeof username == 'string') {
                url += `&username=${encodeURIComponent(username)}`;
            }
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

  // 動作 <顯示用戶個人主頁資訊(僅貼文)>
  const checkUserPage = useCallback(async (username) => {
    try {
      const response = await fetch('/php/userdisplay.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username })
      });
      const data = await response.json();
      if (data.success) {
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

  // 動作 <取得用戶清單>
  const getUsers = useCallback(async () => {
    try {
      const response = await fetch(`/php/users_get.php`);
      const data = await response.json();
  
      if (data.success) {
        setUsers(data.users); // 後端返回的數據已包含詳細資訊
      } else {
        alert('載入失敗: ' + data.message);
      }
    } catch (error) {
      console.error('獲取用戶數據失敗:', error);
    }
  
    setShowUsers((prev) => !prev);
  }, [showUsers]);
  
  const banUser = useCallback(async (userId, userIdentity) => {
        try {
            const response = await fetch('/php/ban_unban_user.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: userId, user_identity: userIdentity }),
            });

            const data = await response.json();

            if (data.success) {
                alert(data.message);

                // 更新用戶狀態
                setUsers((prevUsers) =>
                    prevUsers.map((user) =>
                        user.id === userId
                            ? { ...user, identity: userIdentity >= 0 ? -1 : 1 } // 更新 identity 狀態
                            : user
                    )
                );
            } else {
                console.error('操作失敗: ', data.message);
                alert('發生錯誤: ' + data.message);
            }
        } catch (error) {
            console.error('請求失敗: ', error);
            alert('發生網絡錯誤，請稍後再試。');
        }
    },
    [setUsers]
);


  return (
    <div className='admin'>
      <Header
        thisUsername={thisUsername}
        loadPosts={loadPosts}
        logout={logout}
        searchName={searchName}
        setSearchName={setSearchName}
        checkUserPage={checkUserPage}
        getUsers={getUsers}
        setUsers={setUsers}
      />
      <div className="container">
        <div className="main-content">
          <h2 id="posts-title">{currentViewUsername ? `${currentViewUsername}的貼文` : '推薦貼文'}</h2>

          {!showUsers ? (
            <div id="posts">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <Post
                    key={post.id}
                    post={post}
                    checkUserPage={checkUserPage}
                    showComments={showComments}
                  />
                ))
              ) : (
                <p>目前沒有貼文。</p>
              )}
            </div>
          ) : (
            <div id="users">
              {users.length > 0 ? (
                <ul>
                  {users.map((user) => (
                    <UserCard key={user.id} user={user} banUser={banUser} />
                  ))}
                </ul>
              ) : (
                <p>目前沒有用戶。</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MenuComponent;
