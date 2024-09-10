// 元件 <貼文>
// const Post = ({ post, handleUsernameClick, likePost, toggleComments, sharePost, submitComment, loadComments }) => {
//     // 從資料庫抓讚數
//     const likesText = getLikesText(post.liked_by_user, post.likes_count);

//     return (
//         // 貼文本體
//         <div className="post" id={`post-${post.id}`} key={post.id}>
//             <div className="post-header">
//                 <a href="#!" className="post-username" onClick={() => handleUsernameClick(post.username)}>
//                     {post.username}
//                 </a>
//                 <span className="post-datetime">{post.created_at}</span>
//             </div>

//             {/* 貼文內文(caption) */}
//             <div className="post-content">{post.content}</div>

//             {/* 照片、YT、分享只會擇一顯示 */}
//             {/* 照片 */}
//             {post.type === 'image' && post.url && <div className="post-image"><img src={post.url} alt="Post Image" /></div>}

//             {/* 鑲嵌的youtube影片 */}
//             {post.type === 'youtube' && <div className="post-youtube" dangerouslySetInnerHTML={{ __html: post.url }} />}

//             {/* 貼文屬性為'share'時才有的區塊 */}
//             {post.type === 'share' && post.shared_post && (
//                 <div className="shared-post-container">
//                     {/* !!![生成]內嵌貼文物件!!! */}
//                     <Post
//                         key={`shared-${post.id}-${post.shared_post.id}`}
//                         post={post.shared_post}
//                         handleUsernameClick={handleUsernameClick}
//                         likePost={likePost}
//                         toggleComments={toggleComments}
//                         sharePost={sharePost}
//                         submitComment={submitComment}
//                         loadComments={loadComments}
//                     />
//                 </div>
//             )}

//             {/* 貼文資訊 */}
//             <div className="post-footer">
//                 <span className="likes-count">{likesText}</span>
//                 <span className="comments-count">{post.comments_count}則留言</span>
//                 <span className="shares-count">{post.share_count}次分享</span>
//             </div>

//             {/* 互動工具列(點讚、留言、轉發) */}
//             <div className="post-actions">
//                 <button onClick={() => likePost(post.id, post.type === 'share' ? post.shared_post.id : null)}>{post.liked_by_user ? '收回讚' : '點讚'}</button>
//                 <button onClick={() => toggleComments(post.id)}>留言</button>
//                 <button onClick={() => sharePost(post.id)}>轉發</button>
//             </div>

//             {/* "post.showComments"由"toggleComments(post.id)"所操控，是否顯示留言與發言 */}
//             {post.showComments && (
//                 // 貼文id為xxx之留言區
//                 <div className="comments" id={`comments-${post.id}`}>

//                     {/* 從資料庫抓已有的留言 */}
//                     {post.comments && post.comments.map(comment => (
//                         // 元件 <留言本體>
//                         <div className="comment" key={comment.id}>
//                             <div className="comment-header">
//                                 <a href="#!" className="comment-username" onClick={() => handleUsernameClick(comment.username)}>
//                                     {comment.username}
//                                 </a>
//                                 <span className="comment-datetime">{comment.created_at}</span>
//                             </div>
//                             <div className="comment-content">{comment.comment}</div>
//                         </div>
//                     ))}

//                     {/* 發言區塊 */}
//                     <div className="comment-form">
//                         <textarea id={`comment-content-${post.id}`} placeholder="發表留言..." />
//                         <button onClick={() => submitComment(post.id, document.getElementById(`comment-content-${post.id}`).value, post.type === 'share' ? post.shared_post.id : null)}>留言</button>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// 動作 <抓讚數>
function getLikesText(likedByUser, likesCount) {
    if (likedByUser) {
        return likesCount > 1 ? `你和其他${likesCount - 1}人說讚` : '你說讚';
    } else {
        return likesCount > 0 ? `${likesCount}人說讚` : '成為第一個說讚的人';
    }
}

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
    alert("sharing post!"); //LOOK AT ME!!!!!!!

    // 變更送出按鈕行為(被永久改為分享貼文的模式，故會在表單重置時改回來)
    document.getElementById('post-form').onsubmit = (e) => handlePostSubmit(e, postId);
};

// !!!NEW VERSION!!!
// 元件 <貼文> 組成：postType(貼文類型), onShare(是否處於分享的狀態), postContent(貼文內容)
const Post = ({checkUserPage, post}) => {
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

            {/* 若有被分享之貼文才顯示 */}
            {post.shared_post && (
                <div className="shared-post-container">
                    {/* !!![生成]內嵌貼文物件!!! */}
                    <Post
                        key={`shared-${post.id}-${post.shared_post.id}`}
                        checkUserPage={checkUserPage}
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
}