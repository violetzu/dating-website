<?php
include 'db_connect.php'; //連接資料庫
include 'session.php'; //確保登入

$post_id = $_GET['post_id'];

$stmt = $conn->prepare("SELECT comments.id, comments.username, comments.comment, comments.created_at FROM comments WHERE comments.post_id = ? ORDER BY comments.created_at DESC");
$stmt->bind_param('i', $post_id);
$stmt->execute();
$result = $stmt->get_result();

$comments = [];
while ($row = $result->fetch_assoc()) {
    $comments[] = $row;
}

echo json_encode(['success' => true, 'comments' => $comments]);

$stmt->close();
$conn->close();
?>