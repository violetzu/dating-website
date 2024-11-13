// 元件 <當前網頁最上方>
const Header = ({ currentViewUsername, thisUsername, logout, myUserPage_settings, searchName, setSearchName, checkUserPage }) => (
    <header>
        {/* 標題LOGO */}
        <div className="header-left">
            <div id="home-link" style={{ cursor: 'pointer' }}><h1>交友軟體 後台</h1></div>
        </div>

        {/* 檢索區塊 */}
        <div className="header-middle">
            <input type="text" id="search-input" onChange={(e) => setSearchName(e.target.value)} placeholder="搜尋使用者或相關貼文..." />
            <button id="search-button" onClick={() => checkUserPage(searchName)}>搜尋</button>
        </div>

        {/* 個人資料快捷鍵 */}
        <div className="header-right">
            <button id="loadpost-setting" onClick={myUserPage_settings}>
                {currentViewUsername === thisUsername ? '修改個人資料' : thisUsername}
            </button>
            <button id="logout-button" onClick={logout}>登出</button>
        </div>
    </header>
);

// 元件 <側欄>
const Sidebar = ({ currentViewUsername, userBio, userTags }) => (
    <aside className="sidebar">
        <h3 id="username-sidebar">{currentViewUsername ? currentViewUsername : '私訊區域'}</h3>
        <div id="sidebar-item"></div>

        {/* 進入各用戶個人主頁欲顯示之細項 */}
        {currentViewUsername && (
            <div id="user-details">
                <p id="user-bio">{userBio}</p>
                <div id="user-tags">
                    {userTags.map(tag => (
                        <span className="user-tag" key={tag}>{tag}</span>
                    ))}
                </div>
            </div>
        )}
    </aside>
);

export { Header, Sidebar };