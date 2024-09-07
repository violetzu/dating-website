import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css';
import './userdetails.css';

// 元件 <當前網頁最上方>
const Header = ({ currentViewUsername, thisUsername, handleLogout, resetPostForm, loadPostsOrSetting, searchName, setSearchName, handleUsernameClick }) => (
  <header>
    {/* 標題LOGO */}
    <div className="header-left">
      <div id="home-link" onClick={resetPostForm} style={{ cursor: 'pointer' }}><h1>交友軟體</h1></div>
    </div>

    {/* 檢索區塊 */}
    <div className="header-middle">
      <input type="text" id="search-input" onChange={(e) => setSearchName(e.target.value)} placeholder="搜尋使用者或相關貼文..." />
      <button id="search-button" onClick={() => handleUsernameClick(searchName)}>搜尋</button>
    </div>

    {/* 個人資料快捷鍵 */}
    <div className="header-right">
      <button id="loadpost-setting" onClick={loadPostsOrSetting}>
        {currentViewUsername === thisUsername ? '修改個人資料' : thisUsername}
      </button>
      <button id="logout-button" onClick={handleLogout}>登出</button>
    </div>
  </header>
);

// 元件 <發文區塊>(打字、貼照片、轉PO)
const PostForm = ({ handlePostSubmit, postContent, setPostContent, postType, setPostType, handleFileChange, postImage, youtubeUrl, setYoutubeUrl, isSharingPost }) => (
  <form id="post-form" onSubmit={handlePostSubmit}>
    {/* 內文(content) */}
    <textarea id="post-content" value={postContent} onChange={(e) => setPostContent(e.target.value)} placeholder="分享新鮮事..." />
    
    {/* 轉貼不可添加圖片 / youtube */}
    {!isSharingPost && (
      <>
        {/* 變更貼文屬性('image' / 'youtube' / 'share'(點擊轉發即自動切換)) */}
        <select id="post-type" value={postType} onChange={(e) => setPostType(e.target.value)}>
          <option value="image">圖片</option>
          <option value="youtube">YouTube</option>
        </select>

        {/* 貼文屬性為'image'時才有的選項 */}
        {postType === 'image' && (
          <div id="image-input">
            <input type="file" id="post-image" accept="image/*" onChange={handleFileChange} />
          </div>
        )}

        {/* 貼文屬性為'youtube'時才有的選項 */}
        {postType === 'youtube' && (
          <div id="youtube-input">
            <input type="text" id="youtube-url" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="請由youtube分享的嵌入複製完整程式碼貼上" />
          </div>
        )}
      </>
    )}
    {isSharingPost && (
      <div id="share-info">
        <p>正在分享某則貼文</p>
      </div>
    )}
    
    <button type="submit">發布</button>
  </form>
);

// 元件 <貼文本體>
const Post = ({ post, handleUsernameClick, likePost, toggleComments, sharePost, submitComment, loadComments }) => {
  // 從資料庫抓讚數
  const likesText = getLikesText(post.liked_by_user, post.likes_count);

  return (
    <div className="post" id={`post-${post.id}`} key={post.id}>
      <div className="post-header">
        <a href="#!" className="post-username" onClick={() => handleUsernameClick(post.username)}>
          {post.username}
        </a>
        <span className="post-datetime">{post.created_at}</span>
      </div>
      <div className="post-content">{post.content}</div>

      {/* post.url? */}
      {post.type === 'image' && post.url && <div className="post-image"><img src={post.url} alt="Post Image" /></div>}
      
      {post.type === 'youtube' && <div className="post-youtube" dangerouslySetInnerHTML={{ __html: post.url }} />}
      
      {/* 貼文屬性為'share'時才有的區塊 */}
      {post.type === 'share' && post.shared_post && (
        <div className="shared-post-container">
          {/* !!![生成]內嵌貼文物件!!! */}
          <Post
            key={`shared-${post.id}-${post.shared_post.id}`}
            post={post.shared_post}
            handleUsernameClick={handleUsernameClick}
            likePost={likePost}
            toggleComments={toggleComments}
            sharePost={sharePost}
            submitComment={submitComment}
            loadComments={loadComments}
          />
        </div>
      )}

      {/* 貼文資訊 */}
      <div className="post-footer">
        <span className="likes-count">{likesText}</span>
        <span className="comments-count">{post.comments_count}則留言</span>
        <span className="shares-count">{post.share_count}次分享</span>
      </div>

      {/* 互動工具列(點讚、留言、轉發) */}
      <div className="post-actions">
        <button onClick={() => likePost(post.id, post.type === 'share' ? post.shared_post.id : null)}>{post.liked_by_user ? '收回讚' : '點讚'}</button>
        <button onClick={() => toggleComments(post.id)}>留言</button>
        <button onClick={() => sharePost(post.id)}>轉發</button>
      </div>

      {/* "post.showComments"由"toggleComments(post.id)"所操控，是否顯示留言與發言 */}
      {post.showComments && (
        // 貼文id為xxx之留言區
        <div className="comments" id={`comments-${post.id}`}>

          {/* 從資料庫抓已有的留言 */}
          {post.comments && post.comments.map(comment => (
            // 元件 <留言本體>
            <div className="comment" key={comment.id}>
              <div className="comment-header">
                <a href="#!" className="comment-username" onClick={() => handleUsernameClick(comment.username)}>
                  {comment.username}
                </a>
                <span className="comment-datetime">{comment.created_at}</span>
              </div>
              <div className="comment-content">{comment.comment}</div>
            </div>
          ))}

          {/* 發言區塊 */}
          <div className="comment-form">
            <textarea id={`comment-content-${post.id}`} placeholder="發表留言..." />
            <button onClick={() => submitComment(post.id, document.getElementById(`comment-content-${post.id}`).value, post.type === 'share' ? post.shared_post.id : null)}>留言</button>
          </div>
        </div>
      )}
    </div>
  );
};

// 動作 <抓讚數>
function getLikesText(likedByUser, likesCount) {
  if (likedByUser) {
    return likesCount > 1 ? `你和其他${likesCount - 1}人說讚` : '你說讚';
  } else {
    return likesCount > 0 ? `${likesCount}人說讚` : '成為第一個說讚的人';
  }
}

const Sidebar = ({ currentViewUsername, userBio, userTags }) => (
  <aside className="sidebar">
    <h3 id="username-sidebar">{currentViewUsername ? currentViewUsername : '私訊區域'}</h3>
    <div id="sidebar-item"></div>
    {currentViewUsername && (
      <div id="user-details">
        <p id="user-bio">{userBio}</p>
        <div id="user-tags">
          {userTags.map(tag => (
            <span className="user-tag" key={tag}>{tag}</span>
          ))}
        </div>
      </div>
    )}
  </aside>
);

function Home() {
  const [thisUsername, setThisUsername] = useState('');
  const [posts, setPosts] = useState([]);
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState('image');
  const [postImage, setPostImage] = useState(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isSharingPost, setIsSharingPost] = useState(false);
  const [currentViewUsername, setCurrentViewUsername] = useState('');
  const [userBio, setUserBio] = useState('');
  const [userTags, setUserTags] = useState([]);
  const navigate = useNavigate();
  const [searchName, setSearchName] = useState('');

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

  const loadPosts = useCallback(async (username = null, limit = 20) => {
    try {
      let url = `/php/posts_get.php?limit=${limit}`;
      if (username) {
        url += `&username=${username}`;
      }
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

  const handleLogout = useCallback(async () => {
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

  const handlePostSubmit = useCallback(async (e, postId = null) => {
    e.preventDefault();
    if (isSharingPost) {
      document.getElementById('post-form').onsubmit = handlePostSubmit();
      return;
    }

    const formData = new FormData();
    formData.append('content', postContent);
    const type = postId ? 'share' : postType;
    formData.append('type', type);

    if (type === 'image' && postImage) {
      formData.append('image', postImage);
    } else if (type === 'youtube' && youtubeUrl) {
      formData.append('url', youtubeUrl);
    } else if (type === 'share') {
      formData.append('url', postId);
    }

    try {
      const response = await fetch('/php/post_submit.php', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setIsSharingPost(false);
        setPostContent('');
        setPostType('image');
        setPostImage(null);
        setYoutubeUrl('');
        loadPosts(currentViewUsername || null);
      } else {
        alert('分享失敗: ' + data.message);
      }
    } catch (error) {
      console.error('解析 JSON 失敗:', error);
    }
  }, [isSharingPost, postContent, postImage, youtubeUrl, postType, currentViewUsername, loadPosts]);

  const updatePostForm = (type = null) => {
    type = type || postType;
    setPostType(type);
  };

  const handleFileChange = (e) => {
    setPostImage(e.target.files[0]);
  };

  const handleUsernameClick = (username) => {
    displayUsernameDetails(username);
  };

  const displayUsernameDetails = useCallback(async (username) => {
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
        loadPosts(username);
      } else {
        alert('查無用戶!');
        console.error('Failed to load user details:', data.message);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  }, []);

  const likePost = useCallback(async (postId, sharedPostId = null) => {
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
      updatePostDetails(postId);
      if (sharedPostId) {
        updatePostDetails(sharedPostId);
      }
    } catch (error) {
      console.error('解析 JSON 失敗:', error);
    }
  }, []);

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
        console.error('更新帖子详情失败: ' + data.message);
      }
    } catch (error) {
      console.error('解析 JSON 失败:', error);
    }
  }, []);

  const toggleComments = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, showComments: !post.showComments } : post
      )
    );
    loadComments(postId);
  };

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
        console.error('获取评论失败: ' + data.message);
      }
    } catch (error) {
      console.error('解析 JSON 失败:', error);
    }
  }, []);

  const submitComment = useCallback(async (postId, commentContent, sharedPostId = null) => {
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
        document.getElementById(`comment-content-${postId}`).value = ''; // 清空輸入框
        loadComments(postId);
        updatePostDetails(postId);
        if (sharedPostId) {
          updatePostDetails(sharedPostId);
        }
      } else {
        alert('留言失敗: ' + data.message);
      }
    } catch (error) {
      console.error('解析 JSON 失敗:', error);
    }
  }, [loadComments, updatePostDetails]);

  const sharePost = (postId) => {
    setIsSharingPost(true);
    window.scrollTo(0, 0);
    updatePostForm('share');
    alert("sharing post!"); //LOOK AT ME!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    document.getElementById('post-form').onsubmit = (e) => handlePostSubmit(e, postId);
  };

  

  const loadPostsOrSetting = () => {
    if (currentViewUsername === thisUsername) {
      navigate('/about');
    } else {
      handleUsernameClick(thisUsername);
    }
  };

  const resetPostForm = () => {
    setCurrentViewUsername('');
    setPostContent('');
    setPostType('image');
    setPostImage(null);
    setYoutubeUrl('');
    setIsSharingPost(false);
    loadPosts();
  };

  return (
    <>
      <Header
        currentViewUsername={currentViewUsername}
        thisUsername={thisUsername}
        handleLogout={handleLogout}
        resetPostForm={resetPostForm}
        loadPostsOrSetting={loadPostsOrSetting}
        searchName={searchName}
        setSearchName={setSearchName}
        handleUsernameClick={handleUsernameClick}
      />
      <div className="container">
        <div className="main-content">
          <h2 id="posts-title">{currentViewUsername ? `${currentViewUsername}的貼文` : '推薦貼文'}</h2>
          {(currentViewUsername === thisUsername || currentViewUsername === '') && (
            <PostForm
              handlePostSubmit={handlePostSubmit}
              postContent={postContent}
              setPostContent={setPostContent}
              postType={postType}
              setPostType={setPostType}
              handleFileChange={handleFileChange}
              postImage={postImage}
              youtubeUrl={youtubeUrl}
              setYoutubeUrl={setYoutubeUrl}
              isSharingPost={isSharingPost}
            />
          )}
          <div id="posts">
            {posts.map(post => (
              <Post
                key={post.id}
                post={post}
                handleUsernameClick={handleUsernameClick}
                likePost={likePost}
                toggleComments={toggleComments}
                sharePost={sharePost}
                submitComment={submitComment}
                loadComments={loadComments}
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
