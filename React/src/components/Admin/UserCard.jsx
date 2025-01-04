// 元件 <用戶資訊卡>
const UserCard = ({ user }) => {
    return (
        <div className="userCard" key={user.id}>
            <div className="userCard-header">
                <span>{user.username}</span>
            </div>
            {/* 從Home/Header_Sidebar.jsx中複製過來的 */}
            <div id="user-details">
                <p id="user-bio">{user.bio}</p>
                <div id="user-tags">
                    {user.tags.map((tag) => (
                        <span className="user-tag" key={tag}>
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UserCard;