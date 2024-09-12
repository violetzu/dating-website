<?php
include 'db_connect.php'; // 連接資料庫
include 'session.php'; // 確保登入

$input = json_decode(file_get_contents('php://input'), true);

$post_id = $input['post_id'];  // 從輸入數據中獲取貼文ID
$comment = $input['comment'];  // 從輸入數據中獲取留言內容
$username = $_SESSION['username'];  // 從 session 中獲取當前用戶名

// 插入留言資料到 comments 表中
$stmt = $conn->prepare("INSERT INTO comments (post_id, username, comment, created_at) VALUES (?, ?, ?, NOW())");
$stmt->bind_param('iss', $post_id, $username, $comment);  
$stmt->execute();  

if ($stmt->affected_rows > 0) {
    // 如果影響的行數大於 0，則表示插入成功
    echo json_encode(['success' => true]);  // 返回成功的 JSON 對象
} else {
    // 如果無行受影響，則表示插入失敗
    echo json_encode(['success' => false, 'message' => '留言失敗']);  // 返回失敗的 JSON 對象及錯誤信息
}

$stmt->close();  
$conn->close();  
?>