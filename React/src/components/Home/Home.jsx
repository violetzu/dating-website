// 動態部件放這裡 => 會變動的資料(ex: state)、有功能的元件(ex: funtion, funtion-like)
// 最後的整體靜態架構也放這裡 => home頁面

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css';
import './userdetails.css';
import { Header, Sidebar } from './Header_Sidebar';
import PostForm from './PostForm';
import Post from './Post';
import { fetchUsername } from '../general_function';

// 架構 <主頁> 串聯全部元件與動作，相當於main
function Home() {
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
  const [sharedPost_URL, setsharedPost_URL] = useState(''); //youtube網址或被分享貼文的id

  useEffect(() => {
    fetchUserInfo();
    loadPosts();
  }, []);

  // 動作 <登入作業/抓取當前用戶資訊(其實只是抓名字)>
  const fetchUserInfo = useCallback(async () => {
    fetchUsername(setThisUsername);
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

  // 動作 <重置發文表單>
  const resetPostForm = () => {
    setCurrentViewUsername('');
    setPostContent('');
    setPostType('image');
    setPostImage(null);
    setsharedPost_URL('');
    loadPosts();
  };

  // 動作 <左上角之個人頁面/資料快捷鍵>
  const myUserPage_settings = () => {
    if (currentViewUsername === thisUsername) {
      navigate('/about');
    } else {
      checkUserPage(thisUsername);
    }
  };

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

  // 動作 <抓讚數>
  function getLikeText(likedByUser, likes_count, isShared) {
    if (likedByUser) {
      return likes_count > 1 ? `你和其他${likes_count - 1}人說讚` : '你說讚';
    } if (isShared) {
      return `${likes_count}人說讚`;
    } else {
      return likes_count > 0 ? `${likes_count}人說讚` : '成為第一個說讚的人';
    }
  }

  // 動作 <點讚>
  const pickLike = useCallback(async (postId = null) => {
    try {
      const response = await fetch('/php/like_post.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ post_id: postId }),
      });

      const data = await response.json();
      console.log(data.message);

      // 更新讚數
      updatePostDetails(postId);
    } catch (error) {
      console.error('解析 JSON 失敗:', error);
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

  // 動作 <送出留言>
  const submitComment = useCallback(async (postId, commentContent) => {
    // 避免空白留言
    if (!commentContent.trim()) {
      alert('留言內容不能為空！');
      return;
    }
    try {
      const response = await fetch('/php/comment_submit.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ post_id: postId, comment: commentContent }),
      });
      const data = await response.json();
      if (data.success) {
        // 重置留言打字區
        document.getElementById(`comment-content-${postId}`).value = ''; // 清空輸入框
        loadComments(postId); // 更新留言
        updatePostDetails(postId); // 更新留言數
      } else {
        alert('留言失敗: ' + data.message);
      }
    } catch (error) {
      console.error('解析 JSON 失敗:', error);
    }
  }, [loadComments, updatePostDetails]);

  // 動作 <分享貼文>
  const sharePost = (postId) => {
    setPostType('share'); // 設置貼文類型
    setsharedPost_URL(postId); // 存入欲分享之貼文id
    window.scrollTo(0, 0); // 跳到頁面最上方(因為發文表單在頁面最上方)
  };

  // 動作 <送出貼文/重置發文表單>
  const submitPost = useCallback(async (e) => {
    e.preventDefault();

    // 將貼文內容加入資料庫
    const formData = new FormData();
    formData.append('content', postContent);

    // 自動檢測 postType
    if (postType === 'URL' && sharedPost_URL) {
      // YouTube 檢測
      const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|.+\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      const ytMatch = sharedPost_URL.match(ytRegex);
      if (ytMatch && ytMatch[1]) {
        const videoId = ytMatch[1];
        formData.append('type', 'youtube');
        formData.append('url', videoId);
      }
      // Instagram 檢測
      else {
        const igRegex = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/p\/([a-zA-Z0-9_-]+)/;
        const igMatch = sharedPost_URL.match(igRegex);
        if (igMatch && igMatch[1]) {
          const postId = igMatch[1];
          formData.append('type', 'instagram');
          formData.append('url', postId);
        }
        // X 檢測
        else {
          const xRegex = /(?:https?:\/\/)?(?:www\.)?x\.com\/(?:[^\/]+)\/status\/([0-9]+)/;
          const xMatch = sharedPost_URL.match(xRegex);
          if (xMatch && xMatch[1]) {
            const postId = xMatch[1];
            formData.append('type', 'x');
            formData.append('url', postId);
          }
          // 其他未定義的連結類型
          else {
            alert("無法提取 貼文 ID，URL 不是youtube/ig/x");
          }
        }
      }
    } else {
      formData.append('type', postType);
      if (postType === 'image' && postImage) {
        formData.append('image', postImage);
      } else if (postType === 'share') {
        formData.append('url', sharedPost_URL);
      }
    }

    try {
      // 實際送出貼文至後台
      const response = await fetch('/php/post_submit.php', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      // 清空表單，重置到預設狀態並發布
      if (data.success) {
        resetPostForm();
      } else {
        alert('分享失敗: ' + data.message);
      }
    } catch (error) {
      console.error('解析 JSON 失敗:', error);
    }
  }, [postContent, postType, postImage, sharedPost_URL, loadPosts]);

  // 動作 <開關貼文編輯模式>
  const showEditMode = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, showEditMode: !post.showEditMode } : post
      )
    );
  };

  // 動作 <刪除貼文>
  const deletePost = useCallback(async (postId = null) => {
    try {
      const response = await fetch('/php/delete_post.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ post_id: postId }),
      });

      const data = await response.json();
      if (data.success) {
        alert('刪除成功');
        loadPosts(thisUsername)
      } else {
        alert('刪除失敗');
      }

      // 刷新個人頁面貼文
      loadPosts(thisUsername);
    } catch (error) {
      console.error('解析 JSON 失敗:', error);
    }
  }, [thisUsername]);

  // 動作 <送出已編輯貼文>
  const submitEditedPost = useCallback(async (postId, newContent) => {

    // 將貼文內容加入資料庫
    const formData = new FormData();
    formData.append('postId', postId);
    formData.append('content', newContent);

    try {
      // 實際送出貼文至後台
      const response = await fetch('/php/edit_post.php', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      // 清空表單，重置到預設狀態並發布
      if (data.success) {
        console.log('編輯成功');
        loadPosts(thisUsername)
      } else {
        alert('編輯失敗');
      }
    } catch (error) {
      console.error('解析 JSON 失敗:', error);
    }
  }, [thisUsername]);

  return (
    <>
      <Header
        currentViewUsername={currentViewUsername}
        thisUsername={thisUsername}
        logout={logout}
        resetPostForm={resetPostForm}
        myUserPage_settings={myUserPage_settings}
        searchName={searchName}
        setSearchName={setSearchName}
        checkUserPage={checkUserPage}
      />
      <div className="container">
        <div className="main-content">
          <h2 id="posts-title">{currentViewUsername ? `${currentViewUsername}的貼文` : '推薦貼文'}</h2>
          {(currentViewUsername === thisUsername || currentViewUsername === '') && (
            <PostForm
              submitPost={submitPost}
              postContent={postContent}
              setPostContent={setPostContent}
              postType={postType}
              setPostType={setPostType}
              setPostImage={setPostImage}
              sharedPost_URL={sharedPost_URL}
              setsharedPost_URL={setsharedPost_URL}
            />
          )}
          <div id="posts">
            {posts.map(post => (
              <Post
                key={post.id}
                post={post}
                checkUserPage={checkUserPage}
                pickLike={pickLike}
                getLikeText={getLikeText}
                showComments={showComments}
                submitComment={submitComment}
                sharePost={sharePost}
                postOwner={currentViewUsername === thisUsername}
                showEditMode={showEditMode}
                deletePost={deletePost}
                submitEditedPost={submitEditedPost}
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

export default Home;