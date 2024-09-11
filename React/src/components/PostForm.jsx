//put this outside
const [shareLink, setShareLink] = useState(null);

//裡面還是放數字// !!!NEW VERSION!!!
// 元件 <發文區塊>(打字、貼照片、轉PO)
const PostForm = (shareLink, setShareLink) => {
    const [postContent, setPostContent] = useState('');
    const [postType, setPostType] = useState('image'); //貼文類型
    const [postImage, setPostImage] = useState(null); //照片來源(資料型態為blob, 儲存的是"檔案"物件)
    const [youtubeUrl, setYoutubeUrl] = useState('');

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
        } else if (type === 'youtube' && youtubeUrl) {
            formData.append('url', youtubeUrl);
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
                setShareLink(null);
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
    }, [postContent, postType, postImage, youtubeUrl, shareLink, currentViewUsername, loadPosts]);

    return (
        <form id="post-form" onSubmit={submitPost}>
            {/* 內文(content) */}
            <textarea id="post-content" value={postContent} onChange={(e) => setPostContent(e.target.value)} placeholder="分享新鮮事..." />

            {/* 轉貼不可添加圖片 / youtube */}
            {shareLink && (
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
                            <input type="text" id="youtube-url" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="請由youtube分享的嵌入複製完整程式碼貼上" />
                        </div>
                    )}

                    <div id="share-info">
                        <p>正在分享貼文編號{shareLink}</p>
                    </div>
                </>
            )}

            <button type="submit">發布</button>
        </form>
    );
};