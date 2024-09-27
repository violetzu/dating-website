import { createContext, useState } from "react";

const PostsContext = createContext({
    Posts: ({ checkUserPage, sharePost }), //這個是HTML元件
    loadPosts: (username) => {}
});

export function PostsContextProvider(props) {
    const [posts, setPosts] = useState([]);

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

    // 元件 <貼文> checkUserName用在PO文用戶名稱處
    const Post = ({ post, checkUserPage, sharePost, isShared = false }) => {
        const likesText = getLikeText(post.liked_by_user, post.likes_count, isShared);

        return (
            <div className="post" id={`post-${post.id}`} key={post.id}>
                <div className="post-header">
                    <span className="post-username" onClick={() => checkUserPage(post.username)} style={{ cursor: 'pointer' }}>
                        {post.username}
                    </span>
                    <span className="post-datetime">{post.created_at}</span>
                </div>

                {/* 貼文內文(caption) */}
                <div className="post-content">{post.content}</div>

                {/* 照片、YT、分享只會擇一顯示 */}
                {/* 照片 */}
                {post.type === 'image' && post.url && <div className="post-image"><img src={post.url} alt="Post Image" /></div>}
                {/* 鑲嵌的youtube影片 */}
                {post.type === 'youtube' && <div className="post-youtube" dangerouslySetInnerHTML={{ __html: post.url }} />}

                {/* 貼文屬性為'share'時才有的區塊(才會有.shared_post) */}
                {post.type === 'share' && post.shared_post && (
                    <div className="shared-post-container">
                        {/* !!![生成]內嵌貼文物件(被分享的貼文)!!! */}
                        <Post
                            key={`shared-${post.id}-${post.shared_post.id}`}
                            post={post.shared_post}
                            checkUserPage={checkUserPage}
                            sharePost={sharePost}
                            isShared={true}
                        />
                    </div>
                )}

                {/* 貼文資訊(info) */}
                <div className="post-footer">
                    <span className="likes-count">{likesText}</span>
                    <span className="comments-count">{post.comments_count}則留言</span>
                    <span className="shares-count">{post.share_count}次分享</span>
                </div>

                {!isShared && (
                    <>
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
                    </>
                )}
            </div>
        );
    };

    // 元件 <貼文區>
    const Posts = ({ checkUserPage, sharePost }) => (
        <div id="posts">
            {posts.map(post => (
                <Post
                    key={post.id}
                    post={post}
                    checkUserPage={checkUserPage}
                    sharePost={sharePost}
                />
            ))}
        </div>
    );

    const context = {
        Posts: Posts,
        loadPosts: loadPosts
    };

    return (
        <PostsContext.Provider value={context}>
            {props.children}
        </PostsContext.Provider>
    );
}

export default PostsContext;