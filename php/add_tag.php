<?php
include 'db_connect.php'; //連接資料庫
include 'session.php'; //確保登入

// 獲取請求中的標籤名稱
$input = json_decode(file_get_contents('php://input'), true);  // 解碼 JSON 資料

if (!isset($input['tag'])) {
    // 檢查是否有提供標籤名稱
    echo json_encode(['success' => false, 'message' => '未提供標籤名稱']);  // 若無標籤名稱，返回錯誤訊息
    exit();  // 終止程序
}

$tagName = $conn->real_escape_string($input['tag']);  // 清理標籤名稱，防止 SQL 注入

// 插入新標籤到資料庫
$sql = "INSERT INTO tags (tag) VALUES ('$tagName')";  // SQL 插入語句
if ($conn->query($sql) === TRUE) {
    echo json_encode(['success' => true]);  // 如果插入成功，返回成功訊息
} else {
    echo json_encode(['success' => false, 'message' => '新增標籤失敗: ' . $conn->error]);  // 插入失敗，返回錯誤訊息和錯誤原因
}

$conn->close();  // 關閉資料庫連接
?>