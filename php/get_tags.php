<?php
include 'db_connect.php'; //連接資料庫
include 'session.php'; //確保登入

// 從資料庫中選擇所有標籤
$result = $conn->query("SELECT id, tag FROM tags");

$tags = [];  // 初始化一個空陣列來存儲標籤
if ($result->num_rows > 0) {
    // 檢查結果集中是否有資料
    while ($row = $result->fetch_assoc()) {
        // 逐行讀取結果集中的資料
        $tags[] = $row;  // 將每一行的資料添加到標籤陣列中
    }
    echo json_encode(['success' => true, 'tags' => $tags]);  // 返回包含標籤資料的 JSON 對象
} else {
    echo json_encode(['success' => false, 'message' => '沒有找到標籤']);  // 如果沒有資料，返回錯誤訊息
}

$conn->close();  // 關閉資料庫連接
?>