let isSharingPost = false;

function SubmitPost(){
    document.getElementById('post-form').addEventListener('submit', function(e) {
        e.preventDefault();
        if (isSharingPost) {
            return;
        }
        handleSubmitPost(e)
    });
}

function sharePost(postId) {
    isSharingPost = true;
    window.scrollTo(0, 0);  // 滾動到頁面頂部
    updatePostForm('share')
    document.getElementById('post-form').onsubmit = function(e) {
        e.preventDefault();
        if (!isSharingPost) {
            return;
        }
        handleSubmitPost(e,postId)
    };
}

function handleSubmitPost(e,postId = NaN){
    const formData = new FormData();
    const content = document.getElementById('post-content').value;
    const type = postId ? 'share' : document.getElementById('post-type').value;

    formData.append('content', content);
    formData.append('type', type);
    if (type === 'image') {
        const image = document.getElementById('post-image').files[0];
            if (image) {
        formData.append('image', image);
            }
    } else if (type === 'youtube') {
        const youtubeUrl = document.getElementById('youtube-url').value;
        if (youtubeUrl) {
            formData.append('url', youtubeUrl);
        } else {
                alert('請輸入 YouTube 網址');
            return;
        }
    }else if (type === 'share') {
        formData.append('url', postId);
    }

    fetch('/php/post_submit.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                isSharingPost = false;                     
                document.getElementById('post-form').reset();
                updatePostForm('reset');  // 恢復表單顯示
                loadPosts();                      
            } else {
                alert('分享失敗: ' + data.message);
            }
        })
        .catch(error => {
            console.error('解析 JSON 失敗:', error);
        });

}

function updatePostForm(type=null) {
    type = type || document.getElementById('post-type').value;
    document.getElementById('post-type').style.display = type==='share'? 'none': 'block';
    document.getElementById('image-input').style.display = type === 'image' || type === 'reset' ? 'block' : 'none';
    document.getElementById('youtube-input').style.display = type === 'youtube' ? 'block' : 'none';
    document.getElementById('share-info').style.display = type === 'share' ? 'block' :'none';
}

function loadPosts(username = null, limit = 20) {
    let url = `/php/posts_get.php?limit=${limit}`;
    if (username) {
        url += `&username=${username}`;
    }

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                let postsContainer = document.getElementById('posts');
                postsContainer.innerHTML = '';
                data.posts.forEach(function(post) {
                    let postElement = createPostElement(post);
                    postsContainer.appendChild(postElement);
                });
            } else {
                console.error('獲取貼文失敗: ' + data.message);
            }
        })
        .catch(error => {
            console.error('解析 JSON 失敗:', error);
        });
}


function getLikesText(likedByUser, likesCount) {
    if (likedByUser) {
        return likesCount > 1 ? `你和其他${likesCount - 1}人說讚` : '你說讚';
    } else {
        return likesCount > 0 ? `${likesCount}人說讚` : '成為第一個說讚的人';
    }
}

function createPostElement(post, isSharedPost = false) {
    let postElement = document.createElement('div');
    postElement.className = 'post';
    postElement.id = isSharedPost ? `shared-post-${post.id}` : `post-${post.id}`;

    let mediaContent = getMediaContent(post);
    let likesText = getLikesText(post.liked_by_user, post.likes_count);

    // 修改footer的ID以区分原始和內嵌貼文
    let footerClass = isSharedPost ? 'shared-post-footer' : 'post-footer';

    postElement.innerHTML = `
        <div class="post-header">
            <a href="javascript:void(0);" class="post-username" onclick="displayUsernamePost('${post.username}')">${post.username}</a>
            <span class="post-datetime">${post.created_at}</span>
        </div>
        <div class="post-content">${post.content}</div>
        ${mediaContent}
        <div class="${footerClass}">
            <span class="likes-count">${likesText}</span>
            <span class="comments-count">${post.comments_count}則留言</span>
            <span class="shares-count">${post.share_count}次分享</span>
        </div>
        <div class="post-actions">
            <button onclick="likePost(${post.id}, ${isSharedPost})">點讚</button>
            <button onclick="toggleComments(${post.id}, ${isSharedPost})">留言</button>
            <button onclick="sharePost(${post.id})">轉發</button>
        </div>
        <div class="comments" id="comments-${post.id}" style="display:none;"></div>
    `;

    return postElement;
}

function getMediaContent(post) {
    if (post.type === 'image' && post.url) {
        return `<div class="post-image"><img src="${post.url}" alt="Post Image"></div>`;
    } else if (post.type === 'youtube') {
        
        return `<div class="post-youtube">${post.url}</div>`;
    } else if (post.type === 'share' && post.shared_post){
        let sharedPostElement = createPostElement(post.shared_post,true);
        return `<div class="shared-post-container" id="shared-post-${post.shared_post.id}-in-post-${post.id}">${sharedPostElement.outerHTML}</div>`;
    }
    return '';
}

//isSharedPost = true表示是內嵌貼文
function likePost(postId, isSharedPost) {
    const requestData = JSON.stringify({ post_id: postId });
    fetch('/php/like_post.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: requestData
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message);
        // 此處傳遞isSharedPost以確保正確更新
        updatePostDetails(postId, isSharedPost); // 始終使用false來更新原始貼文
    })
    .catch(error => {
        console.error('解析 JSON 失敗:', error);
    });
}

function updatePostDetails(postId, isSharedPost) {
    // 根据是否为內嵌貼文来选择正确的footer区域进行更新
    let footerClass = isSharedPost ? 'shared-post-footer' : 'post-footer';
    let postElement = document.getElementById(isSharedPost ? `shared-post-${postId}` : `post-${postId}`);
    if (postElement) {
        fetch(`/php/post_details_get.php?post_id=${postId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                let post = data.post;
                let footerElement = postElement.getElementsByClassName(footerClass)[0];
                footerElement.querySelector('.likes-count').textContent = getLikesText(post.liked_by_user, post.likes_count);
                footerElement.querySelector('.comments-count').textContent = `${post.comments_count}則留言`;
                footerElement.querySelector('.shares-count').textContent = `${post.share_count}次分享`;
            } else {
                console.error('更新帖子详情失败: ' + data.message);
            }
        })
        .catch(error => {
            console.error('解析 JSON 失败:', error);
        });
    }
}

function toggleComments(postId, isSharedPost) {
    let commentsContainerId = `comments-${postId}`;
    let commentsContainer = document.getElementById(commentsContainerId);
    commentsContainer.style.display = commentsContainer.style.display === 'none' ? 'block' : 'none';
    if (commentsContainer.style.display === 'block') {
        loadComments(postId, isSharedPost);
    }
}

function loadComments(postId, isSharedPost) {
    let commentsContainerId = `comments-${postId}`;
    let commentsContainer = document.getElementById(commentsContainerId);
    fetch(`/php/comments_get.php?post_id=${postId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                commentsContainer.innerHTML = ''; // 清空既有评论
                data.comments.forEach(comment => {
                    let commentElement = document.createElement('div');
                    commentElement.className = 'comment';
                    commentElement.innerHTML = `
                        <div class="comment-header">
                            <a href="javascript:void(0);" class="comment-username" onclick="displayUsernamePost('${comment.username}')">${comment.username}</a>
                            
                            <span class="comment-datetime">${comment.created_at}</span>
                        </div>
                        <div class="comment-content">${comment.comment}</div>
                    `;
                    commentsContainer.appendChild(commentElement);
                });
                // 添加评论提交表单
                let commentForm = document.createElement('div');
                commentForm.className = 'comment-form';
                commentForm.innerHTML = `
                    <textarea id="comment-content-${postId}" placeholder="發表留言..."></textarea>
                    <button onclick="submitComment(${postId}, ${isSharedPost})">留言</button>
                `;
                commentsContainer.appendChild(commentForm);
            } else {
                console.error('获取评论失败: ' + data.message);
            }
        })
        .catch(error => {
            console.error('解析 JSON 失败:', error);
        });
}

function submitComment(postId, isSharedPost) {
    const commentContent = document.getElementById(`comment-content-${postId}`).value;
    if (!commentContent.trim()) {
        alert('留言內容不能為空！');
        return;
    }
    const requestData = JSON.stringify({ post_id: postId, comment: commentContent });
    fetch('/php/comment_submit.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: requestData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById(`comment-content-${postId}`).value = ''; // 清空輸入框
            loadComments(postId, isSharedPost); // 重新加載留言
            updatePostDetails(postId, isSharedPost); // 更新貼文詳情
        } else {
            alert('留言失敗: ' + data.message);
        }
    })
    .catch(error => {
        console.error('解析 JSON 失敗:', error);
    });
}