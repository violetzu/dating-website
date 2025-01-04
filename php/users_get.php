<?php
include 'db_connect.php'; //連接資料庫
include 'session.php'; //確保登入

$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 20;

$query = "SELECT id, username, identity FROM users"

$query .= "
    GROUP BY id
    LIMIT ?
";

$stmt = $conn->prepare($query);
$stmt->bind_param('i', $limit);

$result = $stmt->get_result();
$row = $result->fetch_assoc()

$users = [];
$users = $row;

echo json_encode(['success' => true, 'users' => $users]);

$stmt->close();
$conn->close();
?>