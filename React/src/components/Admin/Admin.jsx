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
  const loadPosts = useCallback(async (username = null, limit = 20) => {
    try {
      // 設置向php回傳貼文顯示的最大數目、位於哪個用戶的個人主頁之參數
      let url = `/php/posts_get.php?limit=${limit}`;
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

        // bc chat says so(直接用data.posts確保下面兩個元件使用的是完全更新的posts state)
        // Once posts are loaded, load the liked and shared users for each post
        // Assuming posts contain a unique post ID
        data.posts.forEach((post) => {
          loadLikedUsers(post.id);  // Call loadLikedUsers after posts are loaded
          loadSharedUsers(post.id); // Call loadSharedUsers after posts are loaded
        });
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
        console.error('獲取按讚用戶失敗: ' + data.message); //php修正後要改成這個
      }
    } catch (error) {
      console.error('解析 JSON 失敗:', error);
    }
  }, []);

  // 動作 <查看分享用戶名單>
  const loadSharedUsers = useCallback(async (postId) => {
    try {
      const response = await fetch(`/php/post_details_who_shared.php?post_id=${postId}`);
      const data = await response.json();
      if (data.success) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId ? { ...post, whoshared: data.names } : post
          )
        );
      } else {
        console.error('獲取分享用戶失敗: ' + data.message); //php修正後要改成這個
      }
    } catch (error) {
      console.error('解析 JSON 失敗:', error);
    }
  }, []);

  // 動作 <取得用戶清單>
  const getUsers = useCallback(async (limit = 20) => {
    setShowUsers(!showUsers);

    if (showUsers) {
      const response = await fetch(`/php/users_get.php?limit=${limit}`);

      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        alert('載入失敗: ' + data.message);
      }

      // 用checkUserPage抓取個簽與標籤添加進users裡的每個user
      users.forEach( async (User) => {
        const info = await fetch('/php/userdisplay.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: User.username })
        });

        if (info.success) {
          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user.id === User.id ? { ...user, bio: info.bio, tags: info.tags } : user
            )
          );
        } else {
          console.error('獲取用戶明細失敗: ' + info.message);
        }
      })
    }
  }, [])

  const banUser = useCallback(async (userId, userIdentity) => {
    const response = await fetch('/php/ban_unban_user.php', {
      method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, user_identity: userIdentity })
    });

    if (response.success) {
      alert('用戶' + userId + '已停權.');
    } else {
      console.error("操作失敗." + response.message);
      alert('發生錯誤.');
    }
  }, [])

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

          {!showUsers ?
            <div id="posts">
              {posts.map(post => (
                <Post
                  key={post.id}
                  post={post}
                  checkUserPage={checkUserPage}
                  showComments={showComments}
                />
              ))}
            </div> :
            <div id="users">
              {users.map(user => (
                <UserCard
                  key={user.id}
                  user={user}
                  banUser={banUser}
                />
              ))}
            </div>
          }
        </div>
      </div>
    </div>
  );
}

export default MenuComponent;
