<?php
session_start();
header("Content-Type: application/json");
include 'db_connect.php';

if (!isset($_SESSION['username'])) {
    echo json_encode(['success' => false, 'message' => '未登入']);
    exit();
}

$username = $_SESSION['username'];
$stmt = $conn->prepare("SELECT id, username, email, bio FROM Users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

$tags = array_fill(0, 5, null); // 初始化包含 5 個 null 的數組
if ($user) {
    $tagsStmt = $conn->prepare("SELECT tag FROM User_Tags WHERE username = ?");
    $tagsStmt->bind_param("s", $username);
    $tagsStmt->execute();
    $tagsResult = $tagsStmt->get_result();
    $index = 0; // 用於填充數組的索引
    while ($tagRow = $tagsResult->fetch_assoc()) {
        if ($index < 5) {
            $tags[$index] = $tagRow['tag'];
            $index++;
        } else {
            break;
        }
    }
    $tagsStmt->close();
   
}
$user['tags'] = $tags;
echo json_encode(['success' => true, 'data' => $user]);
$stmt->close();
$conn->close();
?>
