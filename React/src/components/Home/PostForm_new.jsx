import { createContext, useState, useContext } from "react";

const PostFormContext = createContext({
    PostForm: ({}), //這個是HTML元件
    resetPostForm: ({loadPosts}) => {},
    sharePost: (postId) => {}
});

export function PostFormContextProvider(props){
    const [postType, setPostType] = useState('image'); //貼文類型
    const [postContent, setPostContent] = useState('');
    const [postImage, setPostImage] = useState(null); //照片來源(資料型態為blob, 儲存的是"檔案"物件)
    const [ytURL_sharedPost, setytURL_sharedPost] = useState(''); //youtube網址或被分享貼文的id
    
    // 動作 <重置發文表單>
    const resetPostForm = ({ loadPosts }) => {
        setCurrentViewUsername('');
        setPostContent('');
        setPostType('image');
        setPostImage(null);
        setytURL_sharedPost('');
        loadPosts();
    };

    // 動作 <送出貼文/重置發文表單>
    const submitPost = useCallback(async (e) => {
        e.preventDefault();

        // 將貼文內容加入資料庫
        const formData = new FormData();
        formData.append('content', postContent);
        formData.append('type', postType);

        if (postType === 'image' && postImage) {
        formData.append('image', postImage); //先存整個照片檔，之後再從後台把url設成照片本地路徑
        } else if (postType === 'youtube' && ytURL_sharedPost) {
        formData.append('url', ytURL_sharedPost);
        } else if (postType === 'share') {
        formData.append('url', ytURL_sharedPost);
        }

        try {
        // 實際送出貼文至後台
        const response = await fetch('/php/post_submit.php', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        // 清空表單，重置到預設狀態並發布
        if (data.success) {
            resetPostForm();
        } else {
            alert('分享失敗: ' + data.message);
        }
        } catch (error) {
            console.error('解析 JSON 失敗:', error);
        }
    }, [postContent, postType, postImage, ytURL_sharedPost]);

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

    // 元件 <發文區塊>(打字、貼照片、轉PO)
    const PostForm = () => {
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
                        <p>正在分享貼文編號{ytURL_sharedPost}</p>
                    </div>
                )}

                <button type="submit">發布</button>
            </form>
        );
    };

    const context = {
        PostForm: PostForm,
        resetPostForm: resetPostForm,
        sharePost: sharePost
    };

    return (
        <PostFormContext.Provider value={context}>
            {props.children}
        </PostFormContext.Provider>
    );
}

export default PostFormContext;