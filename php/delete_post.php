<?php
// 從like_submit複製
include 'db_connect.php'; //連接資料庫
include 'session.php'; //確保登入

$input = json_decode(file_get_contents('php://input'), true); 

$post_id = $input['post_id'];
$username = $_SESSION['username'];

// 直接刪除該則貼文
$stmt = $conn->prepare("DELETE FROM posts WHERE post_id = ? AND username = ?"); //同時以id跟發文者抓取貼文，以防非發文者更動
$stmt->bind_param('is', $post_id, $username);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode(['success' => true, 'message' => '貼文已刪除']);
} else {
    echo json_encode(['success' => false, 'message' => '貼文刪除失敗']);
}

$stmt->close();
$conn->close();
?>