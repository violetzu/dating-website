// 元件 <貼文> checkUserName用在PO文用戶名稱處
const Post = ({ post, checkUserPage, showComments, isShared = false }) => {
    const likesText = `${post.likes_count}人說讚`;

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
                        showComments={showComments}
                        isShared={true}
                    />
                </div>
            )}

            {/* 貼文資訊(info) */}
            <div className="post-footer">
                <span className="likes-count">{likesText}</span>
                <span className="comments-count" onClick={() => showComments(post.id)}>{post.comments_count}則留言</span>
                <span className="shares-count">{post.share_count}次分享</span>
            </div>

            {!isShared && (
                <>
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
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Post;