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

// !!!NEW VERSION!!!