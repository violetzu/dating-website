// 動態部件放這裡 => 會變動的資料(ex: state)、有功能的元件(ex: funtion, funtion-like)
// 最後的整體靜態架構也放這裡 => home頁面

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css';
import './userdetails.css';
import { Header, Sidebar } from './Header_Sidebar';
import PostForm from './PostForm';
import Post from './Post';

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
  const [ytURL_sharedPost, setytURL_sharedPost] = useState(''); //youtube網址或被分享貼文的id

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
    setShareLink(null);
    setPostContent('');
    setPostType('image');
    setPostImage(null);
    setytURL_sharedPost('');
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
  function getLikeText(likedByUser, likes_count) {
    if (likedByUser) {
      return likes_count > 1 ? `你和其他${likes_count - 1}人說讚` : '你說讚';
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

        // 實際張貼留言
        loadComments(postId);

        // 更新留言數
        updatePostDetails(postId);
      } else {
        alert('留言失敗: ' + data.message);
      }
    } catch (error) {
      console.error('解析 JSON 失敗:', error);
    }
  }, [loadComments, updatePostDetails]);

  // 動作 <分享貼文>
  const sharePost = (postId) => {
    // 設置貼文類型
    setPostType('share');

    // 存入欲分享之貼文id
    setytURL_sharedPost(postId);

    // 跳到頁面最上方(因為發文表單在頁面最上方)
    window.scrollTo(0, 0);

    alert("sharing post " + postId + " !"); //LOOK AT ME!!!!!!!
  };

    // 動作 <送出貼文/重置發文表單>
  const submitPost = useCallback(async (e) => {
    e.preventDefault();

    // 將貼文內容加入資料庫
    const formData = new FormData();
    formData.append('content', postContent);
    formData.append('type', postType);

    if (shareLink != null) {
      formData.append('shared_post', shareLink);
    }

    if (type === 'image' && postImage) {
      formData.append('image', postImage); //先存整個照片檔，之後再從後台把url設成照片本地路徑
    } else if (type === 'youtube' && ytURL_sharedPost) {
      formData.append('url', ytURL_sharedPost);
    }

    try {
      // 實際送出貼文至後台
      const response = await fetch('/php/post_submit.php', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      // 清空表單，重置到預設狀態
      if (data.success) {
        //清空
        resetPostForm();

        // 實際張貼貼文
        loadPosts();
      } else {
        alert('分享失敗: ' + data.message);
      }
    } catch (error) {
      console.error('解析 JSON 失敗:', error);
    }
  }, [postContent, postType, postImage, ytURL_sharedPost, loadPosts]);

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
              ytURL_sharedPost={ytURL_sharedPost}
              setytURL_sharedPost={setytURL_sharedPost}
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