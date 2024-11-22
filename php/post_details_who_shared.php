<?php
include 'db_connect.php'; //連接資料庫
include 'session.php'; //確保登入

// 接收从客户端传来的 post_id 参数
$post_id = isset($_GET['post_id']) ? intval($_GET['post_id']) : 0;

// 用於儲存按讚者名稱的陣列
$names = [];

// 從likes資料表中選擇特定post_id的按讚者名稱
$stmt = $conn->prepare("SELECT id, username FROM Posts WHERE type = 'share' and url = ?"); //$stmt回傳的是連線狀態而已

//確保連線成功
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Internal error.']);
    error_log('Prepare failed: ' . $conn->error);
    exit();
}

$stmt->bind_param("i", $post_id); // "i" 表示 post_id 是一個整數(避免文字直接連接query指令，以防SQL注入攻擊)
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    // 檢查結果集中是否有資料
    while ($row = $result->fetch_assoc()) {
        // 逐行讀取結果集中的資料
        $names[] = $row;  // 將每一行的資料添加到用戶名陣列中
    }
    echo json_encode(['success' => true, 'names' => $names]);  // 返回包含"按讚者名稱陣列"(aka $tags)的 JSON 對象(這行把欲傳輸的資料們轉成JSON格式)
} else {
    echo json_encode(['success' => false, 'message' => '沒有用戶分享此貼文']);  // 如果沒有資料，返回錯誤訊息
}

$stmt->close();
$conn->close();
?>