// 元件 <當前網頁最上方>
const Header = ({ thisUsername, loadPosts, logout, searchName, setSearchName, checkUserPage, getUser }) => (
    <header>
        {/* 標題LOGO */}
        <div className="header-left">
            <div id="home-link" onClick={loadPosts} style={{ cursor: 'pointer' }}><h1>交友軟體 後台</h1></div>
        </div>

        {/* 檢索區塊 */}
        <div className="header-middle">
            <input type="text" id="search-input" onChange={(e) => setSearchName(e.target.value)} placeholder="搜尋使用者或相關貼文..." />
            <button id="search-button" onClick={() => checkUserPage(searchName)}>搜尋</button>
        </div>

        {/* 用戶列表快捷鍵 */}
        <div className="header-right">
            <button id="loadpost-setting" onClick={getUser}>用戶列表</button>
            <button id="logout-button" onClick={logout}>登出</button>
        </div>
    </header>
);

export { Header };