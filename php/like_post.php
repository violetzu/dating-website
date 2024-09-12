<?php
include 'db_connect.php'; //連接資料庫
include 'session.php'; //確保登入

$input = json_decode(file_get_contents('php://input'), true); 

$post_id = $input['post_id'];
$username = $_SESSION['username'];

// 檢查用戶是否已經點過讚
$stmt = $conn->prepare("SELECT * FROM likes WHERE post_id = ? AND username = ?");
$stmt->bind_param('is', $post_id, $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    // 如果已經點讚，則刪除讚
    $stmt = $conn->prepare("DELETE FROM likes WHERE post_id = ? AND username = ?");
    $stmt->bind_param('is', $post_id, $username);
    $stmt->execute();
    echo json_encode(['success' => true, 'message' => '讚已收回']);
} else {
    // 如果未點讚，則添加讚
    $stmt = $conn->prepare("INSERT INTO likes (post_id, username) VALUES (?, ?)");
    $stmt->bind_param('is', $post_id, $username);
    $stmt->execute();
    if ($stmt->affected_rows > 0) {
        echo json_encode(['success' => true, 'message' => '點讚成功']);
    } else {
        echo json_encode(['success' => false, 'message' => '點讚失敗']);
    }
}

$stmt->close();
$conn->close();
?>