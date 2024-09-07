<?php
session_start();

header("Content-Type: application/json");

include 'db_connect.php';  // 確保此文件中定義了與數據庫的連接

if (!isset($_SESSION['username'])) {
    echo json_encode(['success' => false, 'message' => '未登入']);
    exit();
}

$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 20;
$username = isset($_GET['username']) ? $_GET['username'] : null;

// 基本查詢語句，根據是否有username參數決定查詢條件
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
while ($row = $result->fetch_assoc()) {
    // 對每個帖子單獨查詢點贊狀態
    $like_query = "SELECT EXISTS(SELECT 1 FROM likes WHERE post_id = ? AND username = ?) AS liked_by_user";
    $like_stmt = $conn->prepare($like_query);
    $like_stmt->bind_param('is', $row['id'], $_SESSION['username']);
    $like_stmt->execute();
    $like_result = $like_stmt->get_result();
    $row['liked_by_user'] = $like_result->fetch_assoc()['liked_by_user'];
    
    // 如果帖子是分享類型，查詢被分享的帖子
    if ($row['type'] === 'share') {
        $shared_post_id = $row['url'];
        $shared_post_query = "
            SELECT posts.id, posts.username, posts.content, posts.type, posts.url, posts.created_at, posts.share_count,
                   COUNT(DISTINCT likes.id) AS likes_count,
                   COUNT(DISTINCT comments.id) AS comments_count
            FROM posts
            LEFT JOIN likes ON posts.id = likes.post_id
            LEFT JOIN comments ON posts.id = comments.post_id
            WHERE posts.id = ?
            GROUP BY posts.id
        ";
        $shared_post_stmt = $conn->prepare($shared_post_query);
        $shared_post_stmt->bind_param('i', $shared_post_id);
        $shared_post_stmt->execute();
        $shared_post_result = $shared_post_stmt->get_result();
        $row['shared_post'] = $shared_post_result->fetch_assoc();
    }

    $posts[] = $row;
}

echo json_encode(['success' => true, 'posts' => $posts]);

$stmt->close();
$conn->close();
?>
