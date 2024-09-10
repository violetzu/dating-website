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

// 元件 <貼文>
const Post = ({ post, handleUsernameClick, likePost, toggleComments, sharePost, submitComment, loadComments }) => {
  // 讚數顯示文字
  const likesText = getLikesText(post.liked_by_user, post.likes_count);

  return (
    // 貼文本體
    <div className="post" id={`post-${post.id}`} key={post.id}>
      <div className="post-header">
        <a href="#!" className="post-username" onClick={() => handleUsernameClick(post.username)}>
          {post.username}
        </a>
        <span className="post-datetime">{post.created_at}</span>
      </div>

      {/* 貼文內文(caption) */}
      <div className="post-content">{post.content}</div>

      {/* 照片、YT、分享只會擇一顯示 */}
      {/* 照片 */}
      {post.type === 'image' && post.url && <div className="post-image"><img src={post.url} alt="Post Image" /></div>}
      
      {/* 鑲嵌的youtube影片 */}
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

// 動作 <改變讚數顯示文字>
function getLikesText(likedByUser, likesCount) {
  if (likedByUser) {
    return likesCount > 1 ? `你和其他${likesCount - 1}人說讚` : '你說讚';
  } else {
    return likesCount > 0 ? `${likesCount}人說讚` : '成為第一個說讚的人';
  }
}

// 元件 <側欄>
const Sidebar = ({ currentViewUsername, userBio, userTags }) => (
  <aside className="sidebar">
    <h3 id="username-sidebar">{currentViewUsername ? currentViewUsername : '私訊區域'}</h3>
    <div id="sidebar-item"></div>

    {/* 進入各用戶個人主頁欲顯示之細項 */}
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

// 架構 <主頁> 串聯全部元件與動作，相當於main
function Home() {
  const [thisUsername, setThisUsername] = useState('');
  const [posts, setPosts] = useState([]);
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState('image'); //貼文類型
  const [postImage, setPostImage] = useState(null); //照片來源
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

  // 動作 <登入作業/抓取當前用戶資訊>
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

  // 動作 <送出貼文/重置發文表單>
  const handlePostSubmit = useCallback(async (e, postId = null) => {
    e.preventDefault();

    // 分享貼文時的送出鈕被設置為分享模式，需在此改回預設之純發文模式
    if (isSharingPost) {
      document.getElementById('post-form').onsubmit = handlePostSubmit();
      return;
    }

    // 將貼文內容加入資料庫
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
      // 實際送出貼文至後台
      const response = await fetch('/php/post_submit.php', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      // 清空表單，重置到預設狀態
      if (data.success) {
        setIsSharingPost(false);
        setPostContent('');
        setPostType('image');
        setPostImage(null);
        setYoutubeUrl('');

        // 實際張貼貼文
        loadPosts(currentViewUsername || null);
      } else {
        alert('分享失敗: ' + data.message);
      }
    } catch (error) {
      console.error('解析 JSON 失敗:', error);
    }
  }, [isSharingPost, postContent, postImage, youtubeUrl, postType, currentViewUsername, loadPosts]);

  // ***!!!這個超冗的啦等一下!!!*** 動作 <變更貼文類型>
  const updatePostForm = (type = null) => {
    type = type || postType;
    setPostType(type);
  };

  // 動作 <新增照片>
  const handleFileChange = (e) => {
    setPostImage(e.target.files[0]);
  };

  // ***!!!這個好像也有點冗等一下!!!*** 動作 <用戶名稱連結至個人主頁>
  const handleUsernameClick = (username) => {
    displayUsernameDetails(username);
  };

  // 動作 <顯示用戶個人主頁資訊>
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

  // 動作 <點讚>
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
      // 更新讚數
      updatePostDetails(postId);

      // ?????更新被分享貼文讚數(?
      if (sharedPostId) {
        updatePostDetails(sharedPostId);
      }
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
        console.error('更新帖子详情失败: ' + data.message);
      }
    } catch (error) {
      console.error('解析 JSON 失败:', error);
    }
  }, []);

  // 動作 <開關留言區>
  const toggleComments = (postId) => {
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
        console.error('获取评论失败: ' + data.message);
      }
    } catch (error) {
      console.error('解析 JSON 失败:', error);
    }
  }, []);

  // 動作 <送出留言>
  const submitComment = useCallback(async (postId, commentContent, sharedPostId = null) => {
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

        // ?????更新被分享貼文留言數(?
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

  // 動作 <分享貼文>
  const sharePost = (postId) => {
    // ***!!!這個絕對是冗的!!!*** 設置貼文類型
    setIsSharingPost(true);

    // 跳到頁面最上方(因為發文表單在頁面最上方)
    window.scrollTo(0, 0);

    // ***!!!這個絕對是冗的，重複了!!!*** 更新貼文類型
    updatePostForm('share');
    alert("sharing post!"); //LOOK AT ME!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    // 變更送出按鈕行為(被永久改為分享貼文的模式，故會在表單重置時改回來)
    document.getElementById('post-form').onsubmit = (e) => handlePostSubmit(e, postId);
  };

  // ***!!!其實好像不用這樣設!!!*** 動作 <左上角之個人資料快捷鍵>
  const loadPostsOrSetting = () => {
    if (currentViewUsername === thisUsername) {
      navigate('/about');
    } else {
      handleUsernameClick(thisUsername);
    }
  };

  // ***!!!應該要塞到送出貼文的動作!!!*** 動作 <重置發文表單>
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
      {/* 主頁的基本架構(最原始的框架) */}
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
