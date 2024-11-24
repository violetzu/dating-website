# 網頁架構
## 主頁 Login.jsx
在其他網頁檢查到位登入時皆跳轉到此頁面要求登入
登入和註冊介面共用，輸入帳號密碼後點擊“登入或註冊”向後端 login_register.php 發送請求

後端串接mysql資料庫查詢帳號密碼是否存在，如不存在即未註冊過便在資料庫註冊新帳號並跳轉到個人資料中心，存在就切換到登入後主頁

## 登入後主頁 Home.jsx

包含私訊、配對和個人看板的連結 等功能選擇介面。推播用戶的近期貼文，予以轉發、留言、點愛心；點選"轉發"會將頁面跳轉到個人看板，並在編輯貼文的面板預置原始貼文的連結。右上角為個人資料中心並顯示目前登入之帳號
進入這個頁面時檢查登入資訊，如已登入便請求用戶資料並顯示，未登入跳轉到登入介面。
自動載入全部追蹤對象前十則推文

## 個人資料中心 Setting.jsx
可修改密碼、電子郵件、個性簽名及五個興趣標籤  
依登入之username請求剩餘資料庫之欄位(username、password 以外的欄位)作為可修改欄位預設內容  
修改密碼後會將輸入之舊密碼使用 password_verify() 來與資料庫存儲之哈希值進行比較，正確的話則使用password_hash()將輸入之新密碼儲存  
修改後按下下方”儲存“按鈕儲存修改後資料至資料庫並回到登入後主頁，按下”取消“則保留原本的資料並回到登入後主頁。


## 管理員介面 Admin.jsx
側邊欄可以選擇功能
- 查看用戶活躍情況：查看用戶的活躍程度，包括登發布貼文數量、留言數量  
- 貼文刪除：顯示所有貼文，並可刪除用戶的公開發文  
- 收集反饋：管理員可以接收來自使用者的意見回饋、檢舉不當用戶、請求解除停用，以發現並修正系統問題或控制使用者權限。
- 停用帳戶：**管理員可以停用多次違規帳號，視情況註銷帳號。

## 私訊介面 chat.jsx
- 聊天功能，並提供回到主頁的超連結。（或許用 Firebase（加一個chatgpt的聊天機器人


# 資料庫結構 (MySQL)
資料庫名稱:friends

- 表 users: 存儲用戶資訊。  
  - id (INT, PK)＃用戶ID
  - username (VARCHAR 10)＃用戶名稱(帳號)
  - password (VARCHAR 60)＃密碼(php hash後)
  - email(VARCHAR 320)
  - bio (VARCHAR 200)#個性簽名
  - identity(INT)#0是管理員 1是一般使用者

- 表 tags:存儲全部的興趣標籤
  - id (INT, PK) - 標籤ID
  - tag (VARCHAR 10) - 標籤名稱

- 表 user_tags :連結使用者與興趣標籤
  - id (INT, PK) 
  - username (VARCHAR 10)
  - tag (VARCHAR 10) 


- 表 posts: 存儲貼文資訊。
  - id (INT, PK)＃貼文ID
  - username (VARCHAR 10)
  - content (TEXT) ＃貼文文字
  - type 	(varchar 50) #貼文url類型 (image 的話url就是圖片路徑；share的話就是被分享的貼文id；youtube就是分享的youtube嵌入連結)
  - url (VARCHAR 1000)  
  - created_at (DATETIME)  ＃建立時間
  - share_count	(INT) #被分享次數

- 表 comments: 存儲留言資訊。
  - id (INT, PK)#留言編號 
  - post_id (INT, FK)＃貼文ID 引用Posts表的"id” 
  - username (VARCHAR 10)＃用戶ID 引用Users表的”username” 
  - comment (TEXT)＃文字留言 
  - created_at (DATETIME)＃建立時間 

- 表 likes: 存儲點愛心的資訊。
  - id (INT, PK)#
  - post_id (INT, FK)＃貼文ID 引用Posts表的"id” 
  - username (VARCHAR 10)

- 表 password_resets: 存儲忘記密碼重置用的token。
  - id (INT, PK)#
  - username(VARCHAR 10)
  - token (VARCHAR 20) #token
  - expiry_time (DATETIME) ＃到期時間 
  - created_at (TIMESTAMP) #預設CURRENT_TIMESTAMP	


