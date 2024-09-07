<?php
session_start();
header("Content-Type: application/json");
include 'db_connect.php';

if (!isset($_SESSION['username'])) {
    echo json_encode(['success' => false, 'message' => '未登入']);
    exit();
}

// 接收从客户端传来的 post_id 参数
$post_id = isset($_GET['post_id']) ? intval($_GET['post_id']) : 0;

// 優化查詢，只查詢必要的欄位
$query = "
    SELECT posts.id,
           COUNT(DISTINCT likes.id) AS likes_count,
           COUNT(DISTINCT comments.id) AS comments_count,
           posts.share_count,
           EXISTS(SELECT 1 FROM likes WHERE post_id = posts.id AND username = ?) AS liked_by_user
    FROM posts
    LEFT JOIN likes ON posts.id = likes.post_id
    LEFT JOIN comments ON posts.id = comments.post_id
    WHERE posts.id = ?
    GROUP BY posts.id
";

$stmt = $conn->prepare($query);
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Internal error.']);
    error_log('Prepare failed: ' . $conn->error);
    exit();
}

$stmt->bind_param("si", $_SESSION['username'], $post_id);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    echo json_encode(['success' => true, 'post' => $row]);
} else {
    echo json_encode(['success' => false, 'message' => 'No post found.']);
}

$stmt->close();
$conn->close();
?>
