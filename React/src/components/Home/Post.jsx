import { useState } from "react";

// 元件 <貼文> checkUserName用在PO文用戶名稱處
const Post = ({ post, checkUserPage, pickLike, getLikeText, showComments, submitComment, sharePost, postOwner, showEditMode, deletePost, submitEditedPost, isShared = false }) => {
    const likesText = getLikeText(post.liked_by_user, post.likes_count, isShared);
      const [editedContent, setEditedContent] = useState(''); //欲編輯的新貼文內文

    return (
        <div className="post" id={`post-${post.id}`} key={post.id}>
            <div className="post-header">
                <span className="post-username" onClick={() => checkUserPage(post.username)} style={{ cursor: 'pointer' }}>
                    {post.username}
                </span>
                <span className="post-datetime">{post.created_at}</span>
                {postOwner && !isShared && <span className="post-settings">
                    {!post.showEditMode ? <button onClick={() => showEditMode(post.id)}>編輯</button> :
                        <button id="deletePost-button" onClick={() => deletePost(post.id)}>刪除</button>}
                </span>}
            </div>



            {/* 貼文內文(caption) */}
            <div className="post-content">
                {!post.showEditMode ? post.content :
                    <form onSubmit={(e) => submitEditedPost(e, post.id, editedContent)}>
                        <textarea id="post-content" value={editedContent} onChange={(e) => setEditedContent(e.target.value)} placeholder={post.content} />
                        {/* 互動工具列(確認、取消) */}
                        <div className="post-actions">
                            <button type="submit">確認</button>
                            <button onClick={() => {showEditMode(post.id); setEditedContent('');}}>取消</button>
                        </div>
                    </form>
                }
            </div>

            {/* 編輯模式下這些東西都不會被顯示 */}
            {!post.showEditMode && <>
                {/* 照片、YT、分享只會擇一顯示 */}
                {/* 照片 */}
                {post.type === 'image' && post.url && (
                    <div className="post-image">
                        <img src={post.url} alt="Post Image" />
                    </div>
                )}

                {/* 鑲嵌的 YouTube 影片 */}
                {post.type === 'youtube' && (
                    <div className="post-youtube">
                        <iframe
                            src={`https://www.youtube.com/embed/${post.url}`}
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                )}

                {/* 鑲嵌的 Instagram 貼文 */}
                {post.type === 'instagram' && post.url && (
                    <div className="post-instagram">
                        {post.type === 'instagram' && post.url && (
                            <iframe
                                src={`https://www.instagram.com/p/${post.url}/embed`}
                                title="Instagram Post"
                                allowTransparency="true"
                                allow="encrypted-media"
                            />
                        )}
                        {/* <blockquote className="instagram-media" data-instgrm-permalink={`https://www.instagram.com/p/${post.url}/`} data-instgrm-version="14">
                        </blockquote>
                        <script async src="https://www.instagram.com/embed.js"></script> */}
                    </div>
                )}

                {/* 鑲嵌的 X (Twitter) 貼文 */}
                {post.type === 'x' && post.url && (
                    <div className="post-x">
                        <blockquote className="twitter-tweet">
                            <a href={`https://twitter.com/i/status/${post.url}`}></a>
                        </blockquote>
                        <script async src="https://platform.twitter.com/widgets.js" charSet="utf-8"></script>
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
                            pickLike={pickLike}
                            getLikeText={getLikeText}
                            showComments={showComments}
                            submitComment={submitComment}
                            sharePost={sharePost}
                            postOwner={postOwner}
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
            </>}
        </div>
    );
};

export default Post;