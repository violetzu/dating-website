# React 是主要開發用的資料夾
- 開始開發前須先安裝nodejs https://nodejs.org/zh-tw 
- 未安裝git先安裝git https://git-scm.com/downloads
- 在自己電腦資料夾 clone 後cd至React目錄 `cd .\React\`

- 接著輸入`npm install` 安裝 package.json 內列出的所有依賴(根據 package.json所列的資訊/套件參數 安裝所需套件)

- 再輸入`npm run dev` 啟動 Node.js 專案的開發伺服器

![image](https://github.com/user-attachments/assets/82c94567-6101-48b7-bc3f-3f7fd739ef0b)

- 點擊 `http://localhost:xxxx/` 就可以開啟預覽網頁，只要內容有修改就會馬上顯示出來

開發伺服器會連結http://marimo.idv.tw 來取用php及資料庫和貼文圖片等資訊，所以有更新php的話需要先讓我更新才可以存取到新的檔案  

文件主要修改只會在 [src資料夾內](https://github.com/violetzu/dating-website/tree/main/React/src) 其餘都不該修改  
main.jsx不該修改；App.jsx可以添加需要連結的頁面  
components 內則是組件部分 目前以Login Home About三大組件組成，當然也能拆成更小的組件  
react網頁架構及資料庫架構都會放在 [React內的readme](https://github.com/violetzu/dating-website/tree/main/React/README.md)



# 其餘文件及資料夾
- php文件夾是我們的伺服器php檔，有修正一定要先發送PR給我來更新，不然存取到的永遠都會是舊的檔案。  
- 有一個 post_picture 用於存放貼文相片，這個資料夾沒有同步到git上  
- [index.html](https://github.com/violetzu/dating-website/tree/main/index.html) 及 [assets資料夾](https://github.com/violetzu/dating-website/tree/main/assets) 是react導出後的實際網頁檔案  
- [old](https://github.com/violetzu/dating-website/tree/main/old/)是轉換為React開發前的初始版本，現已棄用但可供參考

# 各個指令的交互作用
我覺得有這張圖比較知道在幹嘛 來源：[https://ithelp.ithome.com.tw/articles/10271811](https://ithelp.ithome.com.tw/articles/10271811)
![image](https://github.com/user-attachments/assets/d88b1720-4b37-47c2-a8c7-9ee156b5c80a)

# 第一次clone到自己電腦
`git clone https://github.com/violetzu/dating-website.git`

# 每次修改時(有合作者權限)
***修改時請確保目錄在dating-website***

1. 先拉取遠程倉庫的更改並嘗試自動合併：

   `git pull origin main`

   解決衝突:
   
   如果在合併過程中出現衝突，Git會停止拉取操作(pull)並要求您手動解決這些衝突。您需要打開相關的文件，查找由 Git標記的衝突區域（通常會包括 <<<<<<<、======= 和 >>>>>>>），並選擇您希望保留的更改。

2-1. 解決所有衝突後，添加更改到暫存區：
   `git add .`

2-2. 然後提交合併：
   `git commit -m "這裡寫這次提交修改了什麼"` `git commit -m "comit"` 

3. 解決完所有衝突並成功合併後，將修改推送遠程倉庫：
   `git push origin main`
   
### 取消修改
- 取消未追蹤的檔案（如新建的檔案）`git clean -fd` 這個命令會移除所有未追蹤的檔案和資料夾，讓你的工作目錄回到乾淨的狀態。


- 取消已修改但未提交的檔案 `git checkout -- .` 這個命令會恢復所有已修改的檔案，讓它們回到上次提交的狀態。


- 取消已加入暫存區但尚未提交的檔案 `git reset .` 這個命令會把所有已加入暫存區的檔案移出暫存區，但不會改動檔案的內容。

- 同時取消暫存區和工作目錄的所有修改 如果你想一次取消暫存區和工作目錄中的所有更改，可以依次使用：  
      `git reset --hard` `git clean -fd` 第一個命令會重置暫存區和已修改的檔案到上次提交的狀態，第二個命令會移除所有未追蹤的檔案和資料夾。








