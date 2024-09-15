// !!!NEW VERSION!!!
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

// 元件 <發文區塊>(打字、貼照片、轉PO) resetPostForm, loadPosts用在submitPost
const PostForm = (resetPostForm, loadPosts, postType, setPostType, postContent, setPostContent, postImage, setPostImage, ytURL_sharedPost, setytURL_sharedPost) => {
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
        <form id="post-form" onSubmit={submitPost}>
            {/* 內文(content) */}
            <textarea id="post-content" value={postContent} onChange={(e) => setPostContent(e.target.value)} placeholder="分享新鮮事..." />

            {/* 轉貼不可添加圖片 / youtube */}
            {postType != 'share' && (
                <>
                    {/* 變更貼文屬性('image' / 'youtube') */}
                    <select id="post-type" value={postType} onChange={(e) => setPostType(e.target.value)}>
                        <option value="image">圖片</option>
                        <option value="youtube">YouTube</option>
                    </select>

                    {/* 貼文屬性為'image'時才有的選項 */}
                    {postType === 'image' && (
                        <div id="image-input">
                            <input type="file" id="post-image" accept="image/*" onChange={ (e) => setPostImage(e.target.files[0])} />
                        </div>
                    )}

                    {/* 貼文屬性為'youtube'時才有的選項 */}
                    {postType === 'youtube' && (
                        <div id="youtube-input">
                            <input type="text" id="youtube-url" value={ytURL_sharedPost} onChange={(e) => setytURL_sharedPost(e.target.value)} placeholder="請由youtube分享的嵌入複製完整程式碼貼上" />
                        </div>
                    )}
                </>
            )}

            {postType === 'share' && (
                <div id="share-info">
                    <p>正在分享貼文編號{shareLink}</p>
                </div>
            )}

            <button type="submit">發布</button>
        </form>
    );
};

// 元件 <貼文> checkUserName用在PO文用戶名稱處
const Post = (post, checkUserPage) => {
    const likesText = getLikeText(post.likedByUser, post.likes_count)

    return (
        <div className="post" id={`post-${post.id}`} key={post.id}>
            <div className="post-header">
                <span className="post-username" onClick={() => checkUserPage(post.username)}>
                    {post.username}
                </span>
                <span className="post-datetime">{post.created_at}</span>
            </div>

            {/* 貼文內文(caption) */}
            <div className="post-content">{post.caption}</div>

            {/* 若有鑲嵌URL則依其類型顯示"照片(image)"或"Youtube" */}
            {post.url && (post.type === 'image'
                ? <div className="post-image"><img src={post.url} alt="Post Image" /></div> //照片
                : <div className="post-youtube" dangerouslySetInnerHTML={{ __html: post.url }} />) //Youtube
            }

            {/* 貼文屬性為'share'時才有的區塊(才會有.shared_post) */}
            {post.type === 'share' && post.shared_post && (
                <div className="shared-post-container">
                    {/* !!![生成]內嵌貼文物件(被分享的貼文)!!! */}
                    <Post
                        key={`shared-${post.id}-${post.shared_post.id}`}
                        post={post.shared_post}
                    />
                </div>
            )}

            {/* 貼文資訊(info) */}
            <div className="post-footer">
                <span className="likes-count">{likesText}</span>
                <span className="comments-count">{post.comments_count}則留言</span>
                <span className="shares-count">{post.share_count}次分享</span>
            </div>

            {/* 互動工具列(點讚、留言、轉發) */}
            <div className="post-actions">
                <button onClick={() => pickLike(post.id)}>{post.liked_by_user ? '收回讚' : '點讚'}</button>
                <button onClick={() => showComments(post.id)}>留言</button>
                <button onClick={() => sharePost(post.id)}>轉發</button>
            </div>

            {/* "post.showComments"由"showComments(post.id)"所操控，是否顯示留言與發言 */}
            {post.showComments && (
                // 貼文id為xxx之留言區
                <div className="comments" id={`comments-${post.id}`}>

                    {/* 從資料庫抓已有的留言 */}
                    {post.comments && post.comments.map(comment => (
                        // 元件 <單個留言本體>
                        <div className="comment" key={comment.id}>
                            <div className="comment-header">
                                <span className="comment-username" onClick={() => checkUserPage(comment.username)}>
                                    {comment.username}
                                </span>
                                <span className="comment-datetime">{comment.created_at}</span>
                            </div>
                            <div className="comment-content">{comment.comment}</div>
                        </div>
                    ))}

                    {/* 發言區塊 */}
                    <div className="comment-form">
                        <textarea id={`comment-content-${post.id}`} placeholder="發表留言..." />
                        <button onClick={() => submitComment(post.id, document.getElementById(`comment-content-${post.id}`).value)}>留言</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export {PostForm, Post};