function fetchUserInfo() {
    fetch('/php/get_user_info.php')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('loadpost-setting').textContent = data.username;
            thisUsername = data.username;
        } else {
            redirectToLogin();
        }
    })
    .catch(error => {
        console.error('解析 JSON 失敗:', error);
    });
}

function loadPostsOrSetting(){
    if (document.getElementById('loadpost-setting').textContent==='修改個人資料'){
        redirectToAbout() ;               
    }else{
        displayUsernamePost(document.getElementById('loadpost-setting').textContent);
        document.getElementById('loadpost-setting').textContent = '修改個人資料';
    }           
}

function displayUsernamePost(username){
    loadPosts(username)
    document.getElementById('posts-title').textContent = `${username}的貼文`;
    document.getElementById('username-sidebar').textContent = `${username}`;      
    document.getElementById('post-form').style.display = username!=document.getElementById('loadpost-setting').textContent ? 'none':'block' ;

}






function logout() {
    fetch('/php/logout.php', { method: 'POST' })
        .then(response => {
            if (response.ok) {
                redirectToLogin();
            } else {
                alert('登出失敗，錯誤碼：' + response.status);
            }
        });
}

function redirectToAbout() {
    window.location.href = 'about.html';
}

function redirectToHome() {
    window.location.href = 'home.html';
}

function redirectToLogin() {
    window.location.href = 'index.html';
}


function search() {
    let query = document.getElementById('search-input').value;
    alert('搜尋功能尚未實現，請稍後再試。');
}