# React 是主要開發用的資料夾
- 開始開發前須先安裝nodejs https://nodejs.org/zh-tw  

- 在自己電腦資料夾 clone 後cd至React目錄 `cd .\React\`

- 接著輸入`npm install` 安裝 package.json 內列出的所有依賴

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
- [index.html](https://github.com/violetzu/dating-website/tree/main/index.html) 及 [asstes資料夾](https://github.com/violetzu/dating-website/tree/main/asstes) 是react導出後的網頁檔案  
- old是轉換為React開發前的初始版本，現已棄用但可供參考



# 第一次clone到自己電腦
`git clone https://github.com/violetzu/dating-website.git `



# 每次修改時(有合作者權限)
***修改時請確保目錄在dating-website***

先拉取遠程倉庫的更改並嘗試自動合併：
`git pull origin main`

解決衝突:
如果在合併過程中出現衝突，Git 會停止拉取操作並要求您手動解決這些衝突。您需要打開相關的文件，查找由 Git 標記的衝突區域（通常會包括 <<<<<<<、======= 和 >>>>>>>），並選擇您希望保留的更改。


解決所有衝突後，添加更改到暫存區：
`git add .`

然後提交合併：
`git commit -m "這裡寫這次提交修改了什麼"`

解決完所有衝突並成功合併後，將修改推送遠程倉庫：
`git push origin main`



