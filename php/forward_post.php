<?php
include 'db_connect.php'; //連接資料庫
include 'session.php'; //確保登入

$user_id = $_SESSION['user_id'];
$original_post_id = $_POST['original_post_id'];
$forward_text = $_POST['forward_text'];

$query = "INSERT INTO posts (user_id, original_post_id, content, created_at) VALUES (?, ?, ?, NOW())";

$stmt = $conn->prepare($query);
$stmt->bind_param("iis", $user_id, $original_post_id, $forward_text);
if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => '转发失败: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>