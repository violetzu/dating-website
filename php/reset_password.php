<?php
include 'db_connect.php'; //連接資料庫

header('Content-Type: application/json');
$data = json_decode(file_get_contents('php://input'), true);

$token = $data['token'];
$newPassword = $data['newPassword'];

$stmt = $conn->prepare("SELECT username FROM password_resets WHERE token = ? AND expiry_time > NOW()");
$stmt->bind_param("s", $token);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    $username = $user['username'];

    $newPasswordHash = password_hash($newPassword, PASSWORD_DEFAULT);
    $updateStmt = $conn->prepare("UPDATE users SET password = ? WHERE username = ?");
    $updateStmt->bind_param("ss", $newPasswordHash, $username);
    $updateStmt->execute();
    $updateStmt->close();

    // 刪除 token 以避免再次使用
    $conn->query("DELETE FROM password_resets WHERE token = '$token'");

    echo json_encode(['message' => '密碼重置成功。']);
} else {
    echo json_encode(['message' => '重置密碼的連結已失效或無效。']);
}

$stmt->close();
$conn->close();
?>
