// user_get.php
<?php
include 'db_connect.php'; // 連接資料庫
include 'session.php'; // 確保登入

// 獲取限制參數，默認為 20
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 20;

$query = "SELECT id, username, identity, email FROM users GROUP BY id LIMIT ?";

$stmt = $conn->prepare($query);
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => '準備語句失敗: ' . $conn->error]);
    exit;
}

$stmt->bind_param('i', $limit);

if ($stmt->execute()) {
    $result = $stmt->get_result();
    $users = [];

    // 將結果存儲為陣列
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }

    // 回傳 JSON
    echo json_encode(['success' => true, 'users' => $users]);
} else {
    echo json_encode(['success' => false, 'message' => '執行查詢失敗: ' . $stmt->error]);
}

// 關閉資源
$stmt->close();
$conn->close();
?>
