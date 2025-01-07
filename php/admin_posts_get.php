<?php
include 'db_connect.php'; // 連接資料庫
include 'session.php'; // 確保登入

$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 20;
$username = isset($_GET['username']) ? $_GET['username'] : null;

// 查詢所有帖子及其基本資訊
$query = "
    SELECT posts.id, posts.username, posts.content, posts.type, posts.url, posts.created_at, posts.share_count,
           COUNT(DISTINCT likes.id) AS likes_count,
           COUNT(DISTINCT comments.id) AS comments_count
    FROM posts
    LEFT JOIN likes ON posts.id = likes.post_id
    LEFT JOIN comments ON posts.id = comments.post_id
";

if ($username) {
    $query .= " WHERE posts.username = ?";
}

$query .= "
    GROUP BY posts.id
    ORDER BY posts.created_at DESC
    LIMIT ?
";

$stmt = $conn->prepare($query);

if ($username) {
    $stmt->bind_param('si', $username, $limit);
} else {
    $stmt->bind_param('i', $limit);
}

if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Internal error.']);
    error_log('Prepare failed: ' . $conn->error);
    exit();
}

$stmt->execute();
$result = $stmt->get_result();

$posts = [];
$postIds = [];
while ($row = $result->fetch_assoc()) {
    $posts[$row['id']] = $row;
    $posts[$row['id']]['wholiked'] = [];
    $posts[$row['id']]['whoshared'] = [];
    $postIds[] = $row['id'];
}

// 查詢按讚用戶
if (!empty($postIds)) {
    $likedQuery = "
        SELECT likes.post_id, likes.username
        FROM likes
        WHERE likes.post_id IN (" . implode(',', array_fill(0, count($postIds), '?')) . ")
    ";
    $likedStmt = $conn->prepare($likedQuery);
    $likedStmt->bind_param(str_repeat('i', count($postIds)), ...$postIds);
    $likedStmt->execute();
    $likedResult = $likedStmt->get_result();
    while ($likedRow = $likedResult->fetch_assoc()) {
        $posts[$likedRow['post_id']]['wholiked'][] = $likedRow['username'];
    }
}

// 查詢分享用戶
if (!empty($postIds)) {
    $sharedQuery = "
        SELECT posts.url AS post_id, posts.username
        FROM posts
        WHERE posts.type = 'share' AND posts.url IN (" . implode(',', array_fill(0, count($postIds), '?')) . ")
    ";
    $sharedStmt = $conn->prepare($sharedQuery);
    $sharedStmt->bind_param(str_repeat('i', count($postIds)), ...$postIds);
    $sharedStmt->execute();
    $sharedResult = $sharedStmt->get_result();
    while ($sharedRow = $sharedResult->fetch_assoc()) {
        $posts[$sharedRow['post_id']]['whoshared'][] = $sharedRow['username'];
    }
}

// 格式化輸出
echo json_encode(['success' => true, 'posts' => array_values($posts)]);

$stmt->close();
if (isset($likedStmt)) $likedStmt->close();
if (isset($sharedStmt)) $sharedStmt->close();
$conn->close();
?>
