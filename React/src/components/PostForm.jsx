// 元件 <發文區塊>(打字、貼照片、轉PO)
const PostForm = ({ submitPost, postContent, setPostContent, postType, setPostType, setPostImage, ytURL_sharedPost, setytURL_sharedPost }) => {
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
                            <input type="file" id="post-image" accept="image/*" onChange={(e) => setPostImage(e.target.files[0])} />
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

export default PostForm;