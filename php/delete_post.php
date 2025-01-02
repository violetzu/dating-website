<?php
// 從like_post複製
include 'db_connect.php'; //連接資料庫
include 'session.php'; //確保登入

$input = json_decode(file_get_contents('php://input'), true); 

$post_id = $input['post_id'];
$username = $_SESSION['username'];

// 先查看是否有這則貼文，並確認該則貼文類型
$stmt = $conn->prepare("SELECT type FROM posts WHERE id = ? AND username = ?"); //同時以id跟發文者抓取貼文，以防非發文者更動
$stmt->bind_param('is', $post_id, $username);
$stmt->execute();
$result = $stmt->get_result();

// 確實存在
if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();

    // 若為用於分享之貼文，扣除原始貼文分享數
    if ($row['type'] === 'share') {
        $updateShareCountSql = "UPDATE Posts SET share_count = share_count - 1 WHERE id = ?";
        $updateStmt = $conn->prepare($updateShareCountSql);
        $updateStmt->bind_param('i', $post_id);
        $updateStmt->execute();
    }

    // 直接刪除該則貼文
    $stmt = $conn->prepare("DELETE FROM posts WHERE id = ? AND username = ?"); //同時以id跟發文者抓取貼文，以防非發文者更動
    $stmt->bind_param('is', $post_id, $username);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        echo json_encode(['success' => true, 'message' => '貼文已刪除']);
    } else {
        echo json_encode(['success' => false, 'message' => '貼文刪除失敗']);
    }
}

$stmt->close();
$conn->close();
?>