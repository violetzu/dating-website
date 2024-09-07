<?php
session_start();
header("Content-Type: application/json");

include 'db_connect.php';

// 檢查用戶是否已經登入
if (!isset($_SESSION['username'])) {
    echo json_encode(['success' => false, 'message' => '未登入']);
    exit();
}

$result = $conn->query("SELECT id, tag FROM tags");

$tags = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $tags[] = $row;
    }
    echo json_encode(['success' => true, 'tags' => $tags]);
} else {
    echo json_encode(['success' => false, 'message' => '沒有找到標籤']);
}
$result = $conn->query("SELECT id, tag FROM Tags");
if (!$result) {
    echo json_encode(['success' => false, 'message' => '資料庫查詢失敗: ' . $conn->error]);
    exit();
}


$conn->close();
?>
