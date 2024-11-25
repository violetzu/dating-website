<?php
include 'db_connect.php'; //連接資料庫
include 'session.php'; //確保登入

$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 20;
$username = isset($_GET['username']) ? $_GET['username'] : null;

// 基本查詢語句，包含是否有username參數的查詢條件
$query = "
    SELECT posts.id, posts.username, posts.content, posts.type, posts.url, posts.created_at, posts.share_count,
           COUNT(DISTINCT likes.id) AS likes_count,
           COUNT(DISTINCT comments.id) AS comments_count,
           CASE WHEN EXISTS(SELECT 1 FROM likes WHERE likes.post_id = posts.id AND likes.username = ?) THEN 1 ELSE 0 END AS liked_by_user,
           shared_posts.id AS shared_post_id, shared_posts.username AS shared_post_username,
           shared_posts.content AS shared_post_content, shared_posts.created_at AS shared_post_created_at,
           COUNT(DISTINCT shared_likes.id) AS shared_likes_count,
           COUNT(DISTINCT shared_comments.id) AS shared_comments_count
    FROM posts
    LEFT JOIN likes ON posts.id = likes.post_id
    LEFT JOIN comments ON posts.id = comments.post_id
    LEFT JOIN posts AS shared_posts ON posts.type = 'share' AND posts.url = shared_posts.id
    LEFT JOIN likes AS shared_likes ON shared_posts.id = shared_likes.post_id
    LEFT JOIN comments AS shared_comments ON shared_posts.id = shared_comments.post_id
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
    $stmt->bind_param('ssi', $_SESSION['username'], $username, $limit);
} else {
    $stmt->bind_param('si', $_SESSION['username'], $limit);
}

if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Internal error.']);
    error_log('Prepare failed: ' . $conn->error);
    exit();
}

$stmt->execute();
$result = $stmt->get_result();

$posts = [];
while ($row = $result->fetch_assoc()) {
    // 檢查是否為分享類型並填充分享帖子的資訊
    if ($row['type'] === 'share' && !empty($row['shared_post_id'])) {
        $row['shared_post'] = [
            'id' => $row['shared_post_id'],
            'username' => $row['shared_post_username'],
            'content' => $row['shared_post_content'],
            'created_at' => $row['shared_post_created_at'],
            'likes_count' => $row['shared_likes_count'],
            'comments_count' => $row['shared_comments_count']
        ];
    } else {
        $row['shared_post'] = null;
    }

    // 刪除臨時的共享帖子字段
    unset($row['shared_post_id'], $row['shared_post_username'], $row['shared_post_content'], $row['shared_post_created_at'], $row['shared_likes_count'], $row['shared_comments_count']);

    $posts[] = $row;
}

echo json_encode(['success' => true, 'posts' => $posts]);

$stmt->close();
$conn->close();
?>