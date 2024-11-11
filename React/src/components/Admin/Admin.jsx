import React, { useState } from 'react';

function MenuComponent() {
  const [selectedMenu, setSelectedMenu] = useState(null);

  const handleMenuClick = (menu) => {
    setSelectedMenu(menu);
  };

  return (
    <div>
      <h1>管理員介面</h1>
      <ul>
        <li onClick={() => handleMenuClick('Menu1')}>發文及留言統計</li>
        <li onClick={() => handleMenuClick('Menu2')}>選單二</li>
        <li onClick={() => handleMenuClick('Menu3')}>用戶查詢</li>
        <li onClick={() => handleMenuClick('Menu4')}>選單四</li>
      </ul>
      <div>
        {selectedMenu && <p>你選擇了: {selectedMenu}</p>}
      </div>
    </div>
  );
}

export default MenuComponent;
