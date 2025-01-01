<?php
// 從post_submit複製
include 'db_connect.php'; //連接資料庫
include 'session.php'; //確保登入

$username = $_SESSION['username'];
$post_id = $_POST['postId'];
$content = $_POST['content'];

// 將編輯過的貼文內容插入到數據庫
$sql = "UPDATE Posts SET content = ? WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('is', $content, $post_id);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode(['success' => true, 'message' => '貼文編輯成功']);
} else {
    echo json_encode(['success' => false, 'message' => '貼文編輯失敗']);
}
$stmt->close();
$conn->close();
?>