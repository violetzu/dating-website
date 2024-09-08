# React 是主要開發用的資料夾
開始開發前須先安裝nodejs https://nodejs.org/zh-tw

在自己電腦資料夾 clone 後cd至React目錄

接著輸入 npm install 安裝 package.json 內列出的所有依賴

再輸入npm run dev 啟動 Node.js 專案的開發伺服器

![image](https://github.com/user-attachments/assets/82c94567-6101-48b7-bc3f-3f7fd739ef0b)

點擊 http://localhost:xxxx/ 就可以開啟預覽網頁，只要內容有修改就會馬上顯示出來

開發伺服器會連結http://marimo.idv.tw 來取用php及資料庫和貼文圖片等資訊，所以有更新php的話需要先發送PR讓我更新才可以存取到新的檔案

文件主要修改只會在src資料夾內 其餘都不該修改

main.jsx不該修改；App.jsx可以添加需要連結的頁面

components 內則是組件部分 目前以Login Home About三大組件組成，當然也能拆成更小的組件



# 其餘文件及資料夾
php文件夾是我們的伺服器php檔，有修正一定要先發送PR給我來更新，不然存取到的永遠都會是舊的檔案。

有一個 post_picture 用於存放貼文相片，這個資料夾沒有同步到git上

index.html 及 asstes資料夾是react導出後的網頁檔案

old是轉換為React開發前的初始版本，現已棄用但可供參考

# 使用 Pull Request 的工作流 (PR)
協作者首先需要 Fork（分叉）這個儲存庫到他們自己的 GitHub 賬戶。

在分叉後的儲存庫上創建一個新分支進行開發。

完成修改後，從他們的分支向這個原始儲存庫提交一個 Pull Request。

作為儲存庫擁有者，你可以審核更改，進行討論和修改，最後合併到主分支中。



