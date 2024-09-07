<?php
session_start();
header("Content-Type: application/json");

include 'db_connect.php';

// 檢查用戶是否已經登入
if (!isset($_SESSION['username'])) {
    echo json_encode(['success' => false, 'message' => '未登入']);
    exit();
}

// 獲取請求中的標籤名稱
$data = json_decode(file_get_contents('php://input'), true);
if (!isset($data['tag'])) {
    echo json_encode(['success' => false, 'message' => '未提供標籤名稱']);
    exit();
}

$tagName = $conn->real_escape_string($data['tag']);

// 插入新標籤到資料庫
$sql = "INSERT INTO tags (tag) VALUES ('$tagName')";
if ($conn->query($sql) === TRUE) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => '新增標籤失敗: ' . $conn->error]);
}

$conn->close();
?>
