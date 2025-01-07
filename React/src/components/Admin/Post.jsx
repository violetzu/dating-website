// 元件 <貼文> checkUserName用在PO文用戶名稱處
const Post = ({ post, checkUserPage, showComments, isShared = false }) => {
    const likesText = `${post.likes_count}人說讚`;

    return (
        <div className="post" id={`post-${post.id}`} key={post.id}>

            {/* 真。貼文(用戶看到的) */}
            <div className="post-main">
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
                {post.type === 'youtube' && (
                    <div className="post-youtube">
                        <iframe
                            src={`https://www.youtube.com/embed/${post.url}`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                )}

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
                    <span className="comments-count" onClick={() => showComments(post.id)} style={{ cursor: 'pointer' }}>{post.comments_count}則留言</span>
                    <span className="shares-count">{post.share_count}次分享</span>
                </div>
            </div>

            {/* 數據(管理員only) */}
            {!isShared && (
                <div className="post-statistic">

                    {/* "post.showComments"由"showComments(post.id)"所操控，是否顯示留言與發言 */}
                    {post.showComments && (
                        // 貼文id為xxx之留言區
                        <div className="comments statistic-box" id={`comments-${post.id}`}>
                            <h4>留言紀錄</h4>

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

                    {/* 貼文id為xxx之點讚用戶 */}
                    <div className="wholiked statistic-box" id={`wholiked-${post.id}`}>
                        <h4>點讚用戶</h4>

                        {/* 顯示按讚的用戶 */}
                        {post.wholiked && post.wholiked.map((likedUser, index) => (
                            <div className="comment" key={index}>
                                <div className="comment-header">
                                    <span className="comment-username" onClick={() => checkUserPage(likedUser)}>
                                        {likedUser}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 貼文id為xxx之分享用戶 */}
                    <div className="whoshared statistic-box" id={`sharedUser-${post.id}`}>
                        <h4>分享用戶</h4>

                        {/* 顯示分享的用戶 */}
                        {post.whoshared && post.whoshared.map((sharedUser, index) => (
                            <div className="comment" key={index}>
                                <div className="comment-header">
                                    <span className="comment-username" onClick={() => checkUserPage(sharedUser)}>
                                        {sharedUser}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Post;
