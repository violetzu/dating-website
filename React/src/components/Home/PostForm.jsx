const PostForm = ({ submitPost, postContent, setPostContent, postType, setPostType, setPostImage, sharedPost_URL, setsharedPost_URL }) => {
    return (
        <form id="post-form" onSubmit={submitPost}>
            {/* 內文(content) */}
            <textarea id="post-content" value={postContent} onChange={(e) => setPostContent(e.target.value)} placeholder="分享新鮮事..." />

            {/* 轉貼不可添加多媒體 */}
            {postType !== 'share' && (
                <>
                    {/* 變更貼文屬性('image' / URL) */}
                    <select id="post-type" value={postType} onChange={(e) => setPostType(e.target.value)}>
                        <option value="image">圖片</option>          
                        <option value="URL">URL</option>
                    </select>

                    {/* 貼文屬性為'image'時才有的選項 */}
                    {postType === 'image' && (
                        <div id="image-input">
                            <input type="file" id="post-image" accept="image/*" onChange={(e) => setPostImage(e.target.files[0])} />
                        </div>
                    )}

                    {/* 貼文屬性為 'URL' 時才有的選項 */}
                    {postType === 'URL' && (
                        <div id="url-input">
                            <input
                                type="text"
                                id="url-url"
                                value={sharedPost_URL}
                                onChange={(e) => setsharedPost_URL(e.target.value)}
                                placeholder="請輸入 youtube/IG貼文/X貼文 連結"
                            />
                        </div>
                    )}
                </>
            )}

            {postType === 'share' && (
                <div id="share-info">
                    <p>正在分享貼文編號 {sharedPost_URL}</p>
                </div>
            )}

            <button type="submit">發布</button>
        </form>
    );
};

export default PostForm;