// 元件 <用戶資訊卡>
const UserCard = ({ user, banUser }) => {
    return (
        <div className="userCard" id={`userCard-${user.id}`} key={user.id}>
            <div className="userCard-header">
                <span>{user.id}</span>
                <span>{user.username}</span>

                {/* 管理員本身不得被操作 */}
                {user.identity != 0 &&
                    <button onClick={() => banUser(user.id, user.identity)}>
                        {user.identity >= 0 ? 停權 : 解除停權}
                    </button>
                }
            </div>
            {/* 從Home/Header_Sidebar.jsx中複製過來的 */}
            <div id="user-details">
                <p id="user-bio">{user.email}</p>
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