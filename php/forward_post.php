<?php
session_start();

header("Content-Type: application/json");

include 'db_connect.php';

if (!isset($_SESSION['username'])) {
    echo json_encode(['success' => false, 'message' => '未登入']);
    exit();
}

$user_id = $_SESSION['user_id'];  // 假设你的会话中存储了用户ID
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
