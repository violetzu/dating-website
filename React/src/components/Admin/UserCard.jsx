import React from 'react';
import './UserCard.css'

const UserCard = ({ user, banUser }) => {
    return (
        <div className="userCard" id={`userCard-${user.id}`} key={user.id}>
            <div className="userCard-header">
                <span>用戶 ID: {user.id}</span>
                <span>用戶名: {user.username}</span>

                {/* 僅允許對非管理員進行操作 */}
                {user.identity !== 0 && (
                    <button onClick={() => banUser(user.id, user.identity)}>
                        {user.identity >= 0 ? '停權' : '解除停權'}
                    </button>
                )}
            </div>

            {/* 用戶詳情區塊 */}
            <div id="user-details">
                <p>郵箱: {user.email}</p>
                <p>個性簽名: {user.bio || '未提供'}</p>
                <div id="user-tags">
                    <strong>標籤:</strong>
                    {user.tags.length > 0 ? (
                        user.tags.map((tag) => (
                            <span className="user-tag" key={tag}>
                                {tag}
                            </span>
                        ))
                    ) : (
                        <span>未提供</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserCard;
