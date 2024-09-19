重要的React實作樣貌 aka 別人都怎麼寫：https://github.com/suochantsao/meetup-react-sample[https://github.com/suochantsao/meetup-react-sample]
sincerely sorry for my literal dumbass didn't understand this earlier, I'll try to refine our code again QQ. could still be extremely bad tho. I'M SORRY-

# 各個指令的交互作用
我覺得有這張圖比較知道在幹嘛 來源：[https://ithelp.ithome.com.tw/articles/10271811](https://ithelp.ithome.com.tw/articles/10271811)
![image](https://github.com/user-attachments/assets/d88b1720-4b37-47c2-a8c7-9ee156b5c80a)

# 名詞解釋
- (remote)repository，(遠程)倉庫/儲存庫：就是指GitHub上看得到的這些"貼文"
- branch，分支：直接附屬於repository之下的第二軌
- fork，分支：另外開啟以自己為作者repository，並作為原repository的異地第二軌，有自己的branch；自己的repository層級為origin，源頭repository層級為upstream

# 第一次clone到自己電腦
- 抓檔案下來(靜態)到自己電腦：`git clone https://github.com/violetzu/dating-website.git`

  *意即"連結但不同步"到自己電腦，讓電腦裡的Git有個根可以尋

- 以fork做分支的則請打：`git clone 自己的fork網址`

   並繼續執行以下兩步：
   
- `git remote add upstream https://github.com/violetzu/dating-website.git` => `git remote add upstream層級 源頭repository網址`
   
- `git remote -v`

# 每次修改時(有合作者權限)
***修改時請確保目錄在dating-website***
***用frok則所有"origin"代換成"upstream"***

1. 先拉取遠程倉庫的更改並嘗試自動合併：

   `git pull origin main`
   => `git pull origin層級中 名為main的分支(branch)(在此main其實為主幹)`

   *原repository若在同步(pull)到自己電腦上後有經過編輯，則無法直接上交自己修改過的版本(因為兩邊皆有從同一個原始檔案變更，無法直接用自己更新過的檔案去覆蓋)，故

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
