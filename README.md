# React 是主要開發用的資料夾
- 開始開發前須先安裝nodejs https://nodejs.org/zh-tw  

- 在自己電腦資料夾 clone 後cd至React目錄 `cd .\React\`

- 接著輸入`npm install` 安裝 package.json 內列出的所有依賴(根據 package.json所列的資訊/套件參數 安裝所需套件)

- 再輸入`npm run dev` 啟動 Node.js 專案的開發伺服器

![image](https://github.com/user-attachments/assets/82c94567-6101-48b7-bc3f-3f7fd739ef0b)

- 點擊 `http://localhost:xxxx/` 就可以開啟預覽網頁，只要內容有修改就會馬上顯示出來

開發伺服器會連結http://marimo.idv.tw 來取用php及資料庫和貼文圖片等資訊，所以有更新php的話需要先讓我更新才可以存取到新的檔案  

文件主要修改只會在 [src資料夾內](https://github.com/violetzu/dating-website/tree/main/React/src) 其餘都不該修改  
main.jsx不該修改；App.jsx可以添加需要連結的頁面  
components 內則是組件部分 目前以Login Home About三大組件組成，當然也能拆成更小的組件



# 其餘文件及資料夾
- php文件夾是我們的伺服器php檔，有修正一定要先發送PR給我來更新，不然存取到的永遠都會是舊的檔案。  
- 有一個 post_picture 用於存放貼文相片，這個資料夾沒有同步到git上  
- [index.html](https://github.com/violetzu/dating-website/tree/main/index.html) 及 [assets資料夾](https://github.com/violetzu/dating-website/tree/main/assets) 是react導出後的實際網頁檔案  
- [old](https://github.com/violetzu/dating-website/tree/main/old/)是轉換為React開發前的初始版本，現已棄用但可供參考

# 各個指令的交互作用
我覺得有這張圖比較知道在幹嘛 來源：[https://ithelp.ithome.com.tw/articles/10271811](https://ithelp.ithome.com.tw/articles/10271811)
![image](https://github.com/user-attachments/assets/d88b1720-4b37-47c2-a8c7-9ee156b5c80a)

# 第一次clone到自己電腦
1. 抓檔案下來(靜態)到自己電腦：`git clone https://github.com/violetzu/dating-website.git`

   *如果是用fork(不是用原始repository的branch)還需要做下兩步，意即"連結但不同步"到自己電腦，讓電腦裡的Git有個根可以尋：
   
2. `git remote add upstream https://github.com/violetzu/dating-website.git` => `git remote add upstream層級 源頭repository網址`
   
3. `git remote -v`

# 每次修改時(有合作者權限)
***修改時請確保目錄在dating-website***

1. 先拉取遠程倉庫的更改並嘗試自動合併：

   `git pull origin main`
   => `git pull origin層級中 名為main的分支(branch，名詞)(在此main其實為主幹)`

   *遠程倉庫(remote repository)就是指GitHub上看得到的這些"貼文"

   *原repository若在自己分支(fork，動詞)後有經過編輯，則無法直接上交自己修改過的版本(因為兩邊皆有從同一個原始檔案變更，無法直接用自己更新過的檔案去覆蓋)，故

   解決衝突:
   
   如果在合併過程中出現衝突，Git會停止拉取操作(pull)並要求您手動解決這些衝突。您需要打開相關的文件，查找由 Git標記的衝突區域（通常會包括 <<<<<<<、======= 和 >>>>>>>），並選擇您希望保留的更改。

2-1. 解決所有衝突後，添加更改到暫存區：
   `git add .` => `git add 欲添加的檔案(在此為"當前路徑")`
   
*這裡的暫存區是指Git在本地端認知的儲存空間，跟直接ctrl+S儲存於電腦硬碟有所區別，也不是GitHub中的repository，此處主體是Git不是電腦/Git的暫存區不會同步本地電腦

2-2. 然後提交合併：
   `git commit -m "這裡寫這次提交修改了什麼"`

*提交的同時通常會順便註解

3. 解決完所有衝突並成功合併後，將修改推送遠程倉庫：
   `git push origin main`


# 資料庫結構 (MySQL)
資料庫名稱:friends

- 表 Users: 存儲用戶資訊。  
  - id (INT, PK)＃用戶ID
  - username (VARCHAR 10)＃用戶名稱(帳號)
  - password (VARCHAR 60)＃密碼(php hash後)
  - email(VARCHAR 320)
  - bio (VARCHAR 200)#個性簽名
  - identity(INT)#0是管理員 1是一般使用者

- 表 Tags:存儲全部的興趣標籤
  - id (INT, PK) - 標籤ID
  - tag (VARCHAR 10) - 標籤名稱

- 表 User_Tags :連結使用者與興趣標籤
  - id (INT, PK) 
  - username (VARCHAR 10) - 用戶ID，引用 Users 表的 "username"
  - tag (VARCHAR 10)  - 標籤ID，引用 Tags 表的" tag"


- 表 Posts: 存儲貼文資訊。
  - id (INT, PK)＃貼文ID
  - username (VARCHAR 10)
  - content (TEXT) ＃貼文文字
  - type 	(varchar 50) #貼文url類型 (image 的話url就是圖片路徑；share的話就是被分享的貼文id；youtube就是分享的youtube嵌入連結)
  - url (VARCHAR)  
  - created_at (DATETIME)  ＃建立時間
  - share_count	#被分享次數

- Comments: 存儲留言資訊。
  - id (INT, PK)#留言編號 
  - post_id (INT, FK)＃貼文ID 引用Posts表的"id” 
  - username (VARCHAR 10)＃用戶ID 引用Users表的”username” 
  - comment (TEXT 100)＃文字留言 
  - created_at (DATETIME)＃建立時間 

- Likes: 存儲點愛心的資訊。
  - id (INT, PK)#
  - post_id (INT, FK)＃貼文ID 引用Posts表的"id” 
  - username(VARCHAR 10)
 


