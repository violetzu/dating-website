<?php
session_start();

header("Content-Type: application/json");

include 'db_connect.php';

if (!isset($_SESSION['username'])) {
    echo json_encode(['success' => false, 'message' => '未登入']);
    exit();
}

$requestBody = file_get_contents('php://input');
$input = json_decode($requestBody, true);

$post_id = $input['post_id'];
$comment = $input['comment'];
$username = $_SESSION['username'];

$stmt = $conn->prepare("INSERT INTO comments (post_id, username, comment, created_at) VALUES (?, ?, ?, NOW())");
$stmt->bind_param('iss', $post_id, $username, $comment);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => '留言失敗']);
}

$stmt->close();
$conn->close();
?>
