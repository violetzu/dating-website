import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './setting.css'; 

const About = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    username: '',
    oldPassword: '',
    newPassword: '',
    email: '',
    bio: '',
    tags: Array(5).fill('') 
  });
  const [availableTags, setAvailableTags] = useState([]);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchTags();
  }, []);

  const fetchTags = () => {
    fetch('/php/get_tags.php')
      .then(response => response.json())
      .then(data => {
        if (data.success && Array.isArray(data.tags)) {
          setAvailableTags(data.tags.map(tag => tag.tag));
        } else {
          console.error('Failed to load tags or tags data format is incorrect');
        }
      })
      .catch(error => {
        console.error('Error loading tags:', error);
        alert('Error loading tags: ' + error.message);
      });
  };

  const fetchProfile = () => {
    fetch('/php/profile_get.php')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          const { username, email, bio, tags } = data.data;
          setProfile(prevState => ({
            ...prevState,
            username,
            email,
            bio,
            tags: tags.concat(Array(5 - tags.length).fill('')) 
          }));
        } else {
          throw new Error('服務器錯誤：' + data.message);
        }
      })
      .catch(error => {
        console.error('捕獲錯誤：', error.message);
        alert('發生錯誤，無法加載個人資料。請重試。');
      });
  };

  const handleSaveProfile = () => {
    const requestData = JSON.stringify({
      oldpassword: profile.oldPassword,
      newpassword: profile.newPassword,
      email: profile.email,
      bio: profile.bio,
      tags: profile.tags.filter(tag => tag) // 過濾掉空的標籤
    });

    fetch('/php/profile_save.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: requestData
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          console.log('個人資料儲存成功');
          navigate('/home');
        } else {
          throw new Error('儲存個人資料失敗: ' + data.message);
        }
      })
      .catch(error => {
        console.error(error);
        alert(error.message);
      });
  };

  const handleTagClick = (index) => {
    setCurrentPlaceholder(index);
    setIsModalOpen(true);
  };

  const handleTagSelect = (tag) => {
    setProfile(prevState => ({
      ...prevState,
      tags: prevState.tags.map((t, index) => 
        index === currentPlaceholder ? tag : t
      )
    }));
    setIsModalOpen(false);
  };

  const handleTagClear = () => {
    setProfile(prevState => ({
      ...prevState,
      tags: prevState.tags.map((t, index) => 
        index === currentPlaceholder ? '' : t
      )
    }));
    setIsModalOpen(false);
  };

  const handleAddTag = () => {
    if (newTag) {
      fetch('/php/add_tag.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag: newTag })
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            setAvailableTags([...availableTags, newTag]);
            setNewTag('');
            alert('標籤新增成功');
          } else {
            alert('新增標籤失敗: ' + data.message);
          }
        })
        .catch(error => {
          console.error('Error adding tag:', error);
          alert('Error adding tag: ' + error.message);
        });
    }
  };

  const togglePassword = (field) => {
    if (field === 'oldPassword') {
      setShowOldPassword(!showOldPassword);
    } else if (field === 'newPassword') {
      setShowNewPassword(!showNewPassword);
    }
  };

  return (
    <>
      <br/>
      <div className="about-container">
        <div className="about-main-content">
          <h1 className="about-h1">個人資料</h1>
          <form id="profileForm" className="about-form">
            <div>
              <label htmlFor="username" className="about-label">用戶名稱:</label>
              <input type="text" id="username" name="username" value={profile.username} readOnly className="about-input" />
            </div>
            <div>
              <label htmlFor="oldPassword" className="about-label">原始密碼:</label>
              <input type={showOldPassword ? 'text' : 'password'} id="oldPassword" name="oldPassword" required onChange={(e) => setProfile({ ...profile, oldPassword: e.target.value })} className="about-input" />
              <button type="button" onClick={() => togglePassword('oldPassword')} className="about-button">{showOldPassword ? '隱藏密碼' : '顯示密碼'}</button>
            </div>
            <div>
              <label htmlFor="newPassword" className="about-label">新密碼:</label>
              <input type={showNewPassword ? 'text' : 'password'} id="newPassword" name="newPassword" required onChange={(e) => setProfile({ ...profile, newPassword: e.target.value })} className="about-input" />
              <button type="button" onClick={() => togglePassword('newPassword')} className="about-button">{showNewPassword ? '隱藏密碼' : '顯示密碼'}</button>
            </div>
            <div>
              <label htmlFor="email" className="about-label">郵件(僅用作找回密碼):</label>
              <input type="email" id="email" name="email" value={profile.email} required onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="about-input" />
            </div>
            <div>
              <label htmlFor="bio" className="about-label">個性簽名:</label>
              <input type="text" id="bio" name="bio" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} className="about-input" />
            </div>
            <div>
              <label className="about-label">已選標籤:</label>
              <div id="selectedTags">
                {profile.tags.map((tag, index) => (
                  <span key={index} className={tag ? 'about-tag-selected' : 'about-tag-placeholder'} onClick={() => handleTagClick(index)}>
                    {tag || '+'}
                  </span>
                ))}
              </div>
            </div>

            {isModalOpen && (
              <div id="tagModal" className="about-modal" style={{ display: 'block' }}>
                <div className="about-modal-content">
                  <span className="about-close" onClick={() => setIsModalOpen(false)}>&times;</span>
                  <p>選擇標籤：</p>
                  <div id="modalTags">
                    {availableTags.map((tag, index) => (
                      !profile.tags.includes(tag) && (
                        <div key={index} className="about-tag-option" onClick={() => handleTagSelect(tag)}>
                          {tag}
                        </div>
                      )
                    ))}
                    <div className="about-tag-option about-clear-tag" onClick={handleTagClear}>
                      x
                    </div>
                  </div>
                  <div>
                    <input type="text" id="newTag" placeholder="新增標籤" value={newTag} onChange={(e) => setNewTag(e.target.value)} className="about-input" />
                    <button type="button" className="about-button add-tag" onClick={handleAddTag}>+</button>
                  </div>
                </div>
              </div>
            )}

            <button type="button" onClick={handleSaveProfile} className="about-button">儲存</button>
            <button type="button" onClick={() => navigate('/home')} className="about-button">取消</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default About;
