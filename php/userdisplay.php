<?php
session_start();
header("Content-Type: application/json");

include 'db_connect.php';

// 獲取請求中的用戶名
$data = json_decode(file_get_contents('php://input'), true);
if (!isset($data['username'])) {
    echo json_encode(['success' => false, 'message' => '未提供用戶名']);
    exit();
}

$username = $conn->real_escape_string($data['username']);

// 查詢用戶的個性簽名和標籤
$sql = "SELECT bio FROM users WHERE username = '$username'";
$result = $conn->query($sql);
if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    $bio = $user['bio'];

    $sqlTags = "SELECT tag FROM user_tags WHERE username = '$username'";
    $resultTags = $conn->query($sqlTags);
    $tags = [];
    if ($resultTags->num_rows > 0) {
        while ($row = $resultTags->fetch_assoc()) {
            $tags[] = $row['tag'];
        }
    }

    echo json_encode(['success' => true, 'bio' => $bio, 'tags' => $tags]);
} else {
    echo json_encode(['success' => false, 'message' => '用戶未找到']);
}

$conn->close();
?>
